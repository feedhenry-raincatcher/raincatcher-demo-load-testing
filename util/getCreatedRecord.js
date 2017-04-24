'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function getCreatedRecord(expectedHash, syncResponse, syncRecordsResponse) {
  const newAndUpdated = _.merge(_.get(syncRecordsResponse, 'res.create', {}),
                                _.get(syncRecordsResponse, 'res.update', {}));
  const expectedUid = _.get(_.find(syncResponse.updates.applied, {'hash': expectedHash}), 'uid');
  return _.find(newAndUpdated, r => r.data.id === expectedUid);
}

function getCreatedRecordSyncLoop(syncRecordsFn, interval, timeout, initialSyncResult, initialClientRecs, expectedHash) {
  return new Promise(resolve => {

    function next(previousResult, clientRecs) {
      return syncRecordsFn(clientRecs)
          .then(syncRecordsResponse => {
            const record = getCreatedRecord(expectedHash, previousResult, syncRecordsResponse);
            if (record) {
              return resolve(record);
            } else {
              return Promise.delay(interval)
                .then(() => next(previousResult, syncRecordsResponse.clientRecs));
            }
          });
    }

    return next(initialSyncResult, initialClientRecs);
  })
    .timeout(timeout);
}

module.exports = function(syncRecordsFn, syncResult, clientRecs, expectedHash) {
  return getCreatedRecordSyncLoop(syncRecordsFn, 5000, 300000, syncResult, clientRecs, expectedHash);
};
