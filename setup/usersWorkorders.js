#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const rp = require('request-promise');
const login = require('../util/login');
const recordUtils = require('../util/generate_record.js');
const requestBodyUtils = require('../util/sync_request_bodies');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const createUserAndGroup = require('../util/createUserAndGroup');
const syncDataset = require('../util/syncDataset');
const getCreatedRecord = require('../util/getCreatedRecord.js');

const argv = require('../util/yargopts')
  .option('numUsers', {
    demand: true,
    type: 'number',
    alias: 'n',
    describe: 'The number of users/workorders needed'
  })
  .option('concurrency', {
    demand: true,
    type: 'number',
    alias: 'c',
    describe: 'The concurrency at which to create resources'
  })
  .argv;

/**
 * Compare function to be used with getCreatedRecord.
 * Searches syncRecords responses for a record with the correct title.
 */
function findRecordByTitle(expectedTitle, syncResponse, syncRecordsResponse) {
  const newAndUpdated = _.merge(_.get(syncRecordsResponse, 'res.create', {}));
  return _.find(newAndUpdated, o => o.data.title === expectedTitle);
}

function postUsers(sessionToken, numUsers, concurrency) {
  const users = _.range(1, numUsers + 1).map(makeUser);
  const sessionRequest = rp.defaults({
    json: true,
    headers: requestBodyUtils.getSyncRequestHeaders({'X-FH-sessionToken': sessionToken})
  });

  process.stdout.write(`Creating users at a concurrency of ${concurrency}`);
  return Promise.map(users, user => {
    process.stdout.write('.');
    return createUserAndGroup(sessionRequest, argv.app, user);
  }, {concurrency: concurrency}) // concurrency of users to process
    .then(users => {
      console.log('done!');
      return {
        sessionRequest: sessionRequest,
        users: _.map(users, 'id')
      };
    }).catch(console.error);
}

function syncSingleDataset(rp, dataset) {
  const reqBody = requestBodyUtils.getSyncRequestBody({
    dataset_id: dataset,
    pending: []
  });

  return rp.post({
    url: `${argv.app}/mbaas/sync/${dataset}`,
    body: reqBody,
    json: true
  });
}

function initialSync(previousResolution) {
  const sessionRequest = previousResolution.sessionRequest;
  const users = previousResolution.users;
  const doSyncRecords = _.partialRight(syncDataset.bind(this, argv.app, sessionRequest, '1234', 'workflows'), {});

  return new Promise(resolve => Promise.join(
    syncSingleDataset(sessionRequest, 'workorders'),
    syncSingleDataset(sessionRequest, 'workflows')
    .then(res => getCreatedRecord(doSyncRecords, res, [], findRecordByTitle.bind(this, 'Static forms'))),
    (workordersRes, workflowId) => {
      const resolution = {
        users: users,
        workflowId: workflowId,
        serverHash: workordersRes.hash,
        sessionRequest: sessionRequest
      };
      return resolve(resolution);
    }));
}

function makeWorkorderRecords(previousResolution) {
  const users = previousResolution.users;
  const serverHash = previousResolution.serverHash;
  const sessionRequest = previousResolution.sessionRequest;
  const workflowId = previousResolution.workflowId;

  const records = users.map(user =>
    recordUtils.generateRecord(makeWorkorder(user, workflowId)));

  return {
    records: records,
    serverHash: serverHash,
    sessionRequest: sessionRequest
  };
}

function batchWorkorderRecords(previousResolution, batchSize) {
  console.log(`Creating workorders in batches of ${batchSize}.`);
  return {
    serverHash: previousResolution.serverHash,
    sessionRequest: previousResolution.sessionRequest,
    recordBatches: _.chunk(previousResolution.records, batchSize)
  };
}

function sendWorkorderSyncRequests(previousResolution) {
  const serverHash = previousResolution.serverHash;
  const recordBatches = previousResolution.recordBatches;
  const sessionRequest = previousResolution.sessionRequest;

  process.stdout.write('Sending batches over sync');
  return Promise.mapSeries(recordBatches, batch => {
    const body = requestBodyUtils.getSyncRequestBody({
      dataset_id: 'workorders',
      dataset_hash: serverHash,
      pending: batch
    });
    process.stdout.write('.');
    return sessionRequest.post({
      url: `${argv.app}/mbaas/sync/workorders`,
      body: body
    });
  }).then(() => console.log('done!'));
}

function run() {
  return login({ actStart: _.noop, actEnd: _.noop }, rp, argv.app, argv.username, argv.password)
    .then(sessionToken => postUsers(sessionToken, argv.numUsers, argv.concurrency))
    .then(initialSync)
    .then(makeWorkorderRecords)
    .then(res => batchWorkorderRecords(res, argv.concurrency))
    .then(sendWorkorderSyncRequests)
    .then(() => Promise.delay(10000))
    .catch(console.error);
}

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {
  return run();
}

module.exports = run;
