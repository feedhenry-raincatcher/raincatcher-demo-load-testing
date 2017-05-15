#!/usr/bin/env node
'use strict';
const usersWorkorders = require('./usersWorkorders');
const dataReset = require('./dataReset');
const login  = require('./login');


login().then(dataReset).then(usersWorkorders);


