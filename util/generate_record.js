'use strict';

const crypto = require('crypto');
const randomstring = require('randomstring');
const _ = require('lodash');

/**
 * @param {Object} options - Override default values of the record
 * @returns {Object} - The generated record object
 */
function generateRecord(postObject, options) {

  postObject.name = randomstring.generate(6);
  postObject.created = new Date().getTime();

  let recordObject = {
    inFlight: false,
    action: 'create',
    post: postObject,
    postHash: getHashForObject(postObject),
    timestamp: new Date().getTime()
  };

  recordObject = _.merge(recordObject, options);

  const recordObjectHash = getHashForObject(recordObject);
  const recordObjectData = {
    inFlight: true,
    hash: recordObjectHash,
    uid: recordObjectHash,
    inFlightDate: new Date().getTime()
  };

  const record = _.merge(recordObject, recordObjectData);
  return record;
}

/**
 * Emulate the fh-js-sdk generateHash function.
 *
 * @param {Object|String} toHash - The object or string to hash
 * @returns {String} - The hashed object
 */
function getHashForObject(toHash) {
  const generator = crypto.createHash('sha1');
  // Sort the object by its keys and convert to string.
  const sortedString = JSON.stringify(sortObject(toHash));
  generator.update(sortedString);

  return generator.digest('hex');
}

/**
 * Sync requires the objects to be sorted by keys before being hashed.
 *
 * @param {Object|String} - The object to sort, if a string or null it will be returned as is
 * @returns {Object|String} - The sorted object or the string passed in.
 */
function sortObject(toSort) {
  if (typeof toSort !== 'object' || toSort === null) {
    return toSort;
  }

  const sortedPairs = [];

  Object.keys(toSort).sort().forEach(key =>
    sortedPairs.push({
      key: key,
      value: sortObject(toSort[key])
    }));

  return sortedPairs;
}

module.exports = {
  sortObject: sortObject,
  getHashForObject: getHashForObject,
  generateRecord: generateRecord
};
