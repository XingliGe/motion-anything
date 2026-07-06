#!/usr/bin/env node
/* fake-vela.js — a minimal fake of `vela acp` for e2e-testing the AMR integration offline.
 * Speaks just enough ACP JSON-RPC over stdio (per open-design docs/new-agent-runtime-acp.md):
 *   initialize → session/new → session/set_model → session/prompt
 * and during the prompt turn emits: a tool_call update, a session/request_permission round-trip
 * (the client must auto-approve), agent_thought_chunk noise, then the answer in
 * agent_message_chunk pieces. Replies with a motion JSON or a video composition JSON depending
 * on keywords in the prompt, so both runAgentText/-Json/-Stream paths can be exercised.
 * Usage: put a `vela` shim that execs this file on PATH, then run the motion-anything server. */
'use strict';
var buf = '';
var sessionId = null;
var modelSet = false;
// vela mode (`agent run --runtime opencode`) REQUIRES session/set_model before prompt;
// hermes mode (`acp --accept-hooks`) does not — discriminate by argv.
var requireModel = process.argv.indexOf('acp') < 0;

function send(obj) { process.stdout.write(JSON.stringify(obj) + '\n'); }
function result(id, res) { send({ jsonrpc: '2.0', id: id, result: res }); }
function notify(update) { send({ jsonrpc: '2.0', method: 'session/update', params: { sessionId: sessionId, update: update } }); }

function answerFor(promptText) {
  if (/<!doctype html>|single-file document|full updated HTML/i.test(promptText)) {
    return '<!doctype html>\n<html><head><meta charset="utf-8"><title>Fake Vela Page</title></head><body><h1>hello from fake vela</h1></body></html>';
  }
  if (/composition|scenes|launch-video|"scenes"/i.test(promptText)) {
    return JSON.stringify({
      w: 1280, h: 720, fps: 30,
      transitions: [],
      scenes: [{ bg: '#0b0b12', duration: 3, layers: [
        { type: 'text', text: 'Fake Vela', size: 72, weight: 700, color: '#ffffff', x: 640, y: 360,
          kinetic: { type: 'char-rise', stagger: 0.04, dur: 0.5, start: 0 },
          tracks: { opacity: [{ t: 0, v: 0 }, { t: 0.5, v: 1, ease: 'ease-out' }] } }
      ] }]
    });
  }
  return JSON.stringify({ trigger: 'hover', effect: 'pop', duration: 420, easing: 'spring', delay: 0, distance: 12 });
}

var pendingPermissionId = null;
var promptRequest = null; // { id, text }

function finishPrompt() {
  var ans = answerFor(promptRequest.text);
  notify({ sessionUpdate: 'agent_thought_chunk', content: [{ type: 'text', text: 'thinking about it…' }] });
  notify({ sessionUpdate: 'tool_call', title: 'Read recipes', kind: 'read' });
  // stream the answer in 3 chunks with a text preamble (client must extract the JSON block)
  notify({ sessionUpdate: 'agent_message_chunk', content: [{ type: 'text', text: 'Here is the result:\n' }] });
  var mid = Math.floor(ans.length / 2);
  notify({ sessionUpdate: 'agent_message_chunk', content: [{ type: 'text', text: ans.slice(0, mid) }] });
  notify({ sessionUpdate: 'agent_message_chunk', content: [{ type: 'text', text: ans.slice(mid) }] });
  result(promptRequest.id, { stopReason: 'end_turn', usage: { inputTokens: 10, outputTokens: 20 } });
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (d) {
  buf += d;
  var lines = buf.split('\n'); buf = lines.pop();
  lines.forEach(function (ln) {
    ln = ln.trim(); if (!ln) return;
    var msg; try { msg = JSON.parse(ln); } catch (e) { return; }
    if (msg.method === 'initialize') { result(msg.id, { protocolVersion: 1, agentInfo: { name: 'fake-vela', version: '0.0.1' } }); return; }
    if (msg.method === 'session/new') {
      if (!msg.params || !msg.params.cwd) { send({ jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'cwd required' } }); return; }
      sessionId = 'fake-vela-1';
      result(msg.id, { sessionId: sessionId });
      return;
    }
    if (msg.method === 'session/set_model') {
      if (!msg.params || msg.params.sessionId !== sessionId) { send({ jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'bad session' } }); return; }
      if (msg.params.modelId === 'default') { send({ jsonrpc: '2.0', id: msg.id, error: { code: -32602, message: 'unknown model: default' } }); return; }
      modelSet = true;
      result(msg.id, {});
      return;
    }
    if (msg.method === 'session/prompt') {
      if (requireModel && !modelSet) { send({ jsonrpc: '2.0', id: msg.id, error: { code: -32000, message: 'model not set — call session/set_model first' } }); return; }
      var blocks = (msg.params && msg.params.prompt) || [];
      var text = blocks.map(function (b) { return b && b.text || ''; }).join('');
      promptRequest = { id: msg.id, text: text };
      // permission round-trip first — the client must auto-approve before we answer
      pendingPermissionId = 'perm-1';
      send({ jsonrpc: '2.0', id: pendingPermissionId, method: 'session/request_permission', params: {
        sessionId: sessionId, options: [
          { optionId: 'reject', kind: 'reject_once', name: 'Reject' },
          { optionId: 'ok-once', kind: 'allow_once', name: 'Allow once' }
        ] } });
      return;
    }
    if (msg.id === pendingPermissionId) { // permission reply
      pendingPermissionId = null;
      var picked = msg.result && msg.result.outcome && msg.result.outcome.optionId;
      if (picked !== 'ok-once') { send({ jsonrpc: '2.0', id: promptRequest.id, error: { code: -32000, message: 'permission denied' } }); return; }
      finishPrompt();
      return;
    }
    if (msg.method === 'session/cancel') return;
  });
});
process.stdin.on('end', function () { process.exit(0); });
