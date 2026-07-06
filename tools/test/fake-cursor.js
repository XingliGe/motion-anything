#!/usr/bin/env node
/* fake-cursor.js — fakes `cursor-agent --print --output-format stream-json` (claude-shaped events). */
'use strict';
var shared = require('./fake-answers.js');
function emit(o){ process.stdout.write(JSON.stringify(o)+'\n'); }
shared.readStdin(function (prompt) {
  var ans = shared.answerFor(prompt, 'Cursor');
  emit({ type:'assistant', message:{ content:[{ type:'text', text:'Here is the result:\n' }] } });
  emit({ type:'assistant', message:{ content:[{ type:'text', text:ans }] } });
  emit({ type:'result', result:'Here is the result:\n'+ans, usage:{} });
  process.exit(0);
});
