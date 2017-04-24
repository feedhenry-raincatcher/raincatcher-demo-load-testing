'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function acknowledge(sync, syncRecords, makeSyncBody, baseUrl, clientId, datasets, dataset, incomingClientRecs, incomingSyncResponse) {

  const datasetUrl = `${baseUrl}/mbaas/sync/${dataset}`;

  return syncRecords(dataset, incomingClientRecs)

    .then(syncRecordsResponse =>
          sync(datasetUrl, makeSyncBody(dataset, clientId, incomingSyncResponse.hash, {}, [], _.values(_.get(incomingSyncResponse, 'updates.applied'))))
          .then(Promise.resolve(syncRecordsResponse.clientRecs)));
};
