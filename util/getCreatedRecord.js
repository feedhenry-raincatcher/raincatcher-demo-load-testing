'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function getCreatedRecordSyncLoop(syncRecordsFn, interval, timeout, initialSyncResult, initialClientRecs, compareFn) {
  return new Promise(resolve => {

    function next(previousResult, clientRecs) {
      return syncRecordsFn(clientRecs)
          .then(syncRecordsResponse => {
            const record = compareFn(previousResult, syncRecordsResponse);
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

module.exports = function(syncRecordsFn, syncResult, clientRecs, compareFn) {
  return getCreatedRecordSyncLoop(syncRecordsFn, 5000, 300000, syncResult, clientRecs, compareFn);
};
