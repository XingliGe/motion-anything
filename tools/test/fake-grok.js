#!/usr/bin/env node
/* fake-grok.js — fakes `grok --prompt-file <file>` (plain text on stdout). */
'use strict';
var fs = require('fs');
var shared = require('./fake-answers.js');
var i = process.argv.indexOf('--prompt-file');
if (i < 0 || !process.argv[i+1]) { process.stderr.write('grok-build requires --prompt-file\n'); process.exit(2); }
var prompt = fs.readFileSync(process.argv[i+1], 'utf8');
process.stdout.write('Here is the result:\n' + shared.answerFor(prompt, 'Grok') + '\n');
