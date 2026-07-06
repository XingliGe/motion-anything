#!/usr/bin/env node
/* fake-gemini.js — fakes `gemini` reading the prompt from stdin (plain text out). */
'use strict';
var shared = require('./fake-answers.js');
shared.readStdin(function (prompt) {
  process.stdout.write('Here is the result:\n' + shared.answerFor(prompt, 'Gemini') + '\n');
  process.exit(0);
});
