#!/usr/bin/env node
/* fake-codex.js — fakes `codex exec --json` (JSONL events; answer keyed off the prompt). */
'use strict';
var shared = require('./fake-answers.js');
function emit(o){ process.stdout.write(JSON.stringify(o)+'\n'); }
shared.readStdin(function (prompt) {
  emit({ type:'thread.started', thread_id:'th_fake1' });
  emit({ type:'turn.started' });
  emit({ type:'item.started', item:{ id:'cmd1', type:'command_execution', command:'ls recipes' } });
  emit({ type:'item.completed', item:{ id:'cmd1', type:'command_execution', command:'ls recipes', aggregated_output:'ok' } });
  var ans = shared.answerFor(prompt, 'Codex');
  emit({ type:'item.completed', item:{ id:'msg1', type:'agent_message', text:'Here is the result:\n'+ans } });
  emit({ type:'turn.completed', usage:{ input_tokens:10, output_tokens:20 } });
  process.exit(0);
});
