'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function getCreatedRecord(expectedHash, syncResponse, syncRecordsResponse) {
  const newAndUpdated = _.merge(_.get(syncRecordsResponse, 'res.create', {}),
                                _.get(syncRecordsResponse, 'res.update', {}));
  const expectedUid = _.get(_.find(syncResponse.updates.applied, {'hash': expectedHash}), 'uid');
  return _.find(newAndUpdated, r => r.data.id === expectedUid);
}

module.exports = function acknowledge(sync, syncRecords, makeSyncBody, baseUrl, clientId, datasets, dataset, incomingClientRecs, incomingSyncResponse, expectedHash) {

  const datasetUrl = `${baseUrl}/mbaas/sync/${dataset}`;

  return syncRecords(dataset, incomingClientRecs)

    .then(syncRecordsResponse => Promise.all([
      Promise.resolve(incomingSyncResponse),
      Promise.resolve(getCreatedRecord(expectedHash, incomingSyncResponse, syncRecordsResponse)),
      Promise.resolve(syncRecordsResponse.clientRecs)
    ]))

    .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
      sync(datasetUrl, makeSyncBody(dataset, clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
      Promise.resolve(createdRecord),
      Promise.resolve(clientRecs)
    ]))

    .spread((syncResponse, createdRecord, clientRecs) =>
            syncRecords(dataset, clientRecs)
            .then(doSyncRecordsResult => Promise.all([
              Promise.resolve(syncResponse),
              Promise.resolve(createdRecord),
              Promise.resolve(doSyncRecordsResult.clientRecs)
            ])))

    .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
      sync(datasetUrl, makeSyncBody(dataset, clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
      Promise.resolve(createdRecord),
      Promise.resolve(clientRecs)
    ]));
};
