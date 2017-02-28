'use strict';

const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');

module.exports = function syncRecords(lr, argv) {
  /**
   * Test step: SyncRecords request to get the data from the server
   * @param {object} previousResolution - contains session token and dataset hash
   * @returns {promise} A promise that resolves with an object
   * containing session token and dataset hash
   */
  return previousResolution => {
    const sessionToken = previousResolution.sessionToken;
    const serverHash = previousResolution.serverHash;
    const clientIdentifier = previousResolution.clientIdentifier;
    const fhRequest = configureRequest(clientIdentifier, sessionToken);
    const reqBody = requestBodyUtils.getSyncRecordsRequestBody({
      dataset_id: 'workorders',
      query_params: {
        "filter": {
          "key": "assignee",
          "value": "rkX1fdSH"
        }
      },
      dataset_hash: serverHash,
      meta_data: {
        clientIdentifier: clientIdentifier
      },
      pending: []
    });

    return new Promise(resolve => {
      lr.actStart('Sync Records');
      return fhRequest.post({
        url: `${argv.app}/mbaas/sync/workorders`,
        body: reqBody,
        json: true
      }).then(resBody => {
        lr.actEnd('Sync Records');

        const resolution = {
          sessionToken: sessionToken,
          serverHash: resBody.hash
        };
        return resolve(resolution);
      });
    });
  };
};
