#!/usr/bin/env node
'use strict';
const usersWorkorders = require('./usersWorkorders');
const dataReset = require('./dataReset');
const login  = require('./login');
const yargopts = require('../util/yargopts');


login().then(token => {
  dataReset(token, yargopts.argv);
}).then(usersWorkorders);


