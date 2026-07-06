/* iridescence.js — motion-anything recipe · ambient · a flowing iridescent field (faithful shader, dependency-free WebGL). */
(function (g) {
  'use strict';
  var FRAG = 'precision highp float;\n\
uniform float uTime; uniform vec3 uColor; uniform vec3 uResolution; uniform vec2 uMouse; uniform float uAmplitude; uniform float uSpeed;\n\
varying vec2 vUv;\n\
void main(){\n\
  float mr = min(uResolution.x, uResolution.y);\n\
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;\n\
  uv += (uMouse - vec2(0.5)) * uAmplitude;\n\
  float d = -uTime * 0.5 * uSpeed; float a = 0.0;\n\
  for (float i = 0.0; i < 8.0; ++i){ a += cos(i - d - a * uv.x); d += sin(uv.y * i + a); }\n\
  d += uTime * 0.5 * uSpeed;\n\
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);\n\
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;\n\
  gl_FragColor = vec4(col, 1.0);\n\
}\n';
  function init(){ var els=document.querySelectorAll('.iridescence'); for(var i=0;i<els.length;i++){ var el=els[i];
    var color=(el.getAttribute('data-color')||'1,1,1').split(',').map(Number);
    g.ShaderBG(el, FRAG, { uniforms:{ uColor:{t:'3f',v:color}, uSpeed:{t:'1f',v:parseFloat(el.getAttribute('data-speed'))||1.0}, uAmplitude:{t:'1f',v:parseFloat(el.getAttribute('data-amp'))||0.1} } }); } }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
