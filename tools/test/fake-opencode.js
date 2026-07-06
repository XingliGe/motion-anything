#!/usr/bin/env node
/* fake-opencode.js — fakes `opencode run --format json` (part-based JSONL events). */
'use strict';
var shared = require('./fake-answers.js');
function emit(o){ process.stdout.write(JSON.stringify(o)+'\n'); }
shared.readStdin(function (prompt) {
  emit({ type:'step_start', sessionID:'ses_fake1' });
  emit({ type:'tool_use', sessionID:'ses_fake1', part:{ tool:'read', callID:'c1', state:{ status:'completed', input:'{}', output:'ok' } } });
  var ans = shared.answerFor(prompt, 'OpenCode');
  emit({ type:'text', part:{ text:'Here is the result:\n' } });
  emit({ type:'text', part:{ text:ans } });
  emit({ type:'step_finish', part:{ tokens:{ input:10, output:20 } } });
  process.exit(0);
});
