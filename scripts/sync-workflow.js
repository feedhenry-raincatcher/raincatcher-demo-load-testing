#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const lr = require('load-runner')();
const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');
const clientIdentifier = `${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
const login = require('../util/login');

const argv = require('yargs')
      .reset()
      .option('app', {
        demand: true,
        type: 'string',
        alias: 'a',
        describe: 'Cloud app base URL to target'
      })
      .option('username', {
        demand: true,
        type: 'string',
        alias: 'u',
        describe: 'Username to use to login to the app'
      })
      .option('password', {
        demand: true,
        type: 'string',
        alias: 'p',
        describe: 'Password to use to login to the app'
      })
      .argv;

/**
 * Test step: logout / revoke session
 * @param {} previousResolution - Contains sessionToken
 * @returns {promise} A promise that doesn't return anything
 */
function logout(previousResolution) {
  const fhRequest = configureRequest(clientIdentifier, previousResolution.sessionToken);

  return new Promise(resolve => {
    lr.actStart('Logout');
    return fhRequest.post({
      url: `${argv.app}/box/srv/1.1/admin/authpolicy/revokesession`,
      body: {},
      json: true
    }).then(() => {
      lr.actEnd('Logout');
      return resolve();
    });
  });
}

/**
 * Test step: Initial sync request to get dataset hash
 * @param {string} sessionToken - the token from the login step
 * @returns {promise} A promise that resolves with an object
 * containing session token and dataset hash
 */
function initialSync(sessionToken) {
  const fhRequest = configureRequest(clientIdentifier, sessionToken);
  const reqBody = requestBodyUtils.getSyncRequestBody({
    dataset_id: 'workorders',
    query_params: {
      "filter": {
        "key": "assignee",
        "value": "rkX1fdSH"
      }
    },
    meta_data: {
      clientIdentifier: clientIdentifier
    },
    pending: []
  });

  return new Promise(resolve => {
    lr.actStart('Initial Sync');
    return fhRequest.post({
      url: `${argv.app}/mbaas/sync/workorders`,
      body: reqBody,
      json: true
    }).then(resBody => {
      // lr.log(`Sync response: ${util.inspect(resBody.records)}`);
      lr.actEnd('Initial Sync');

      const resolution = {
        sessionToken: sessionToken,
        serverHash: resBody.hash
      };
      return resolve(resolution);
    });
  });
}

// Execution starts here
login(lr, configureRequest(clientIdentifier), argv.app, argv.username, argv.password)
  .then(initialSync)
  .then(require('./portal-flow')(lr, argv))
  //.then(logout)
  .then(() => lr.finish('ok'))
  .catch(() => lr.finish('failed'));
