/* fake-answers.js — shared canned answers for the fake CLIs (keyed off prompt keywords),
 * so every engine's e2e can exercise the same three product paths:
 * HTML generate (HTML line), video composition (video line), motion suggest (component motion). */
'use strict';
exports.answerFor = function (promptText, who) {
  if (/<!doctype html>|single-file document|full updated HTML/i.test(promptText)) {
    return '<!doctype html>\n<html><head><meta charset="utf-8"><title>Fake ' + who + ' Page</title></head><body><h1>hello from fake ' + who + '</h1></body></html>';
  }
  if (/composition|scenes|launch-video|"scenes"/i.test(promptText)) {
    return JSON.stringify({
      w: 1280, h: 720, fps: 30, transitions: [],
      scenes: [{ bg: '#0b0b12', duration: 3, layers: [
        { type: 'text', text: 'Fake ' + who, size: 72, weight: 700, color: '#ffffff', x: 640, y: 360,
          kinetic: { type: 'char-rise', stagger: 0.04, dur: 0.5, start: 0 },
          tracks: { opacity: [{ t: 0, v: 0 }, { t: 0.5, v: 1, ease: 'ease-out' }] } }
      ] }]
    });
  }
  return JSON.stringify({ trigger: 'hover', effect: 'pop', duration: 420, easing: 'spring', delay: 0, distance: 12 });
};
exports.readStdin = function (cb) {
  var buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (d) { buf += d; });
  process.stdin.on('end', function () { cb(buf); });
};
