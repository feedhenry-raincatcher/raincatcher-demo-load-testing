#!/usr/bin/env node
'use strict';

const rp = require('request-promise');
const yargopts = require('../util/yargopts');

function run(sessionToken, argv) {
  if (!argv) {
    argv = yargopts.argv;
  }

  const request = rp.defaults({
    json: true
  });

  console.log('Calling Reset Data endpoint...');
  return request({
    url: `${argv.app}/admin/data`,
    method: 'DELETE',
    headers:{
      'X-FH-sessionToken': sessionToken || argv.token
    }
  })
  .then(() => {
    console.log('Reset Data call successful');
  })
  .catch((err, response) => console.error('Reset Data call failed', err, response));
}

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {
  // configure request to app url
  const appConfig = yargopts.app;

  const token = yargopts.token;

  const argv = require('yargs')
    .reset()
    .option('app', appConfig)
    .option('token', token)
    .argv;
  return run(argv);
}

module.exports = run;
