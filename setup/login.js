#!/usr/bin/env node
'use strict';

const rp = require('request-promise');
const yargopts = require('../util/yargopts');

function run(argv) {
  const request = rp.defaults({
    json: true
  });

  const reqBody = {
    "params": {
      "userId": argv.username,
      "password": argv.password
    }
  };

  console.log('Login...');
  return request({
    url: `${argv.app}/box/srv/1.1/admin/authpolicy/auth`,
    method: 'POST',
    body: reqBody
  })
  // send delete request
    .then(authResp => {
      console.log('Login call successful');
      return authResp.sessionToken;
    })
    .catch((err, response) => console.error('Login call failed', err, response));
}

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module

if (require.main === module) {
  // configure request to app url
  const appConfig = yargopts.app;
  const argv = require('yargs')
    .reset()
    .option('app', appConfig)
    .argv;
  return run(argv);
}

module.exports = run.bind(null, yargopts.argv);
