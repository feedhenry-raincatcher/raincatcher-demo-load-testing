'use strict';

const rp = require('request-promise');
const requestBodyUtils = require('./sync_request_bodies');

/**
 * Configures defaults in a custom request-promise instance
 *
 * @param {string} clientIdentifier
 * @param {string} sessionToken
 * @returns {object} a request-promise instance
 */
module.exports = function configureRequest(clientIdentifier, sessionToken) {
  const optionalHeaders = {
    'X-FH-cuid': clientIdentifier
  };

  if (sessionToken) {
    optionalHeaders['X-FH-sessionToken'] = sessionToken;
  }

  return rp.defaults({
    headers: requestBodyUtils.getSyncRequestHeaders(optionalHeaders),
    json: true
  });
};
