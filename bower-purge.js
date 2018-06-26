#!/usr/bin/env node

'use strict';

const [,, ...args] = process.argv; // command line args
console.log('bower-purge', args);

var dryRun = args.includes('--dryRun');

const bowerPurge = require('./index.js');

bowerPurge(dryRun);
