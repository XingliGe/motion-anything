/* particles.js — motion-anything recipe · ambient · faithful raw-WebGL port (dependency-free).
 * Floating particle cloud (react-bits "Particles", originally ogl POINTS): 200 points in a sphere,
 * per-point drift in the vertex shader, slow scene wobble/rotation, soft round sprites.
 * ogl is replaced by ~40 lines of matrix math + a POINTS draw. Real defaults from source. */
(function(g){ 'use strict';
  var DEF = { particleCount:200, particleSpread:10, speed:0.1, particleBaseSize:100,
    sizeRandomness:1, cameraDistance:20, alphaParticles:0 };
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  var VERT = ''
  + 'attribute vec3 position;\n'
  + 'attribute vec4 random;\n'
  + 'attribute vec3 color;\n'
  + 'uniform mat4 modelMatrix;\n'
  + 'uniform mat4 viewMatrix;\n'
  + 'uniform mat4 projectionMatrix;\n'
  + 'uniform float uTime;\n'
  + 'uniform float uSpread;\n'
  + 'uniform float uBaseSize;\n'
  + 'uniform float uSizeRandomness;\n'
  + 'varying vec4 vRandom;\n'
  + 'varying vec3 vColor;\n'
  + 'void main() {\n'
  + '  vRandom = random;\n'
  + '  vColor = color;\n'
  + '  vec3 pos = position * uSpread;\n'
  + '  pos.z *= 10.0;\n'
  + '  vec4 mPos = modelMatrix * vec4(pos, 1.0);\n'
  + '  float t = uTime;\n'
  + '  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);\n'
  + '  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);\n'
  + '  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);\n'
  + '  vec4 mvPos = viewMatrix * mPos;\n'
  + '  if (uSizeRandomness == 0.0) { gl_PointSize = uBaseSize; }\n'
  + '  else { gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz); }\n'
  + '  gl_Position = projectionMatrix * mvPos;\n'
  + '}\n';
  var FRAG = ''
  + 'precision highp float;\n'
  + 'uniform float uTime;\n'
  + 'uniform float uAlphaParticles;\n'
  + 'varying vec4 vRandom;\n'
  + 'varying vec3 vColor;\n'
  + 'void main() {\n'
  + '  vec2 uv = gl_PointCoord.xy;\n'
  + '  float d = length(uv - vec2(0.5));\n'
  + '  if(uAlphaParticles < 0.5) {\n'
  + '    if(d > 0.5) { discard; }\n'
  + '    gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);\n'
  + '  } else {\n'
  + '    float circle = smoothstep(0.5, 0.4, d) * 0.8;\n'
  + '    gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);\n'
  + '  }\n'
  + '}\n';
  // --- minimal mat4 (column-major, WebGL layout) ---
  function persp(fovDeg, aspect, near, far){
    var f = 1/Math.tan(fovDeg*Math.PI/360), nf = 1/(near-far);
    return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0];
  }
  function euler(rx, ry, rz){ // R = Rz·Ry·Rx, small-angle wobble
    var cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
    return [ cy*cz, cy*sz, -sy, 0,
      sx*sy*cz-cx*sz, sx*sy*sz+cx*cz, sx*cy, 0,
      cx*sy*cz+sx*sz, cx*sy*sz-sx*cz, cx*cy, 0,
      0, 0, 0, 1 ];
  }
  function compile(gl, type, src){ var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[particles]', gl.getShaderInfoLog(s)); return s; }
  function hexToRgb(hex){ hex = hex.replace(/^#/, '');
    var n = parseInt(hex, 16); return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255]; }
  function start(el){
    if(el.__ma) return; el.__ma = 1;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(canvas);
    var gl = canvas.getContext('webgl', { alpha:true, premultipliedAlpha:false, depth:false });
    if(!gl){ el.style.background = el.getAttribute('data-fallback') || '#0b0b12'; return; }
    gl.clearColor(0,0,0,0); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)){ console.warn('[particles] link', gl.getProgramInfoLog(p)); return; }
    gl.useProgram(p);
    // geometry — uniform sphere via rejection sampling + cbrt radius (as source)
    var count = DEF.particleCount;
    var positions = new Float32Array(count*3), randoms = new Float32Array(count*4), colors = new Float32Array(count*3);
    var palette = ['#ffffff', '#ffffff', '#ffffff'];
    for(var i=0;i<count;i++){
      var x, y, z, len;
      do { x = Math.random()*2-1; y = Math.random()*2-1; z = Math.random()*2-1; len = x*x+y*y+z*z; }
      while(len > 1 || len === 0);
      var r = Math.cbrt(Math.random());
      positions[i*3] = x*r; positions[i*3+1] = y*r; positions[i*3+2] = z*r;
      randoms[i*4] = Math.random(); randoms[i*4+1] = Math.random(); randoms[i*4+2] = Math.random(); randoms[i*4+3] = Math.random();
      var col = hexToRgb(palette[Math.floor(Math.random()*palette.length)]);
      colors[i*3] = col[0]; colors[i*3+1] = col[1]; colors[i*3+2] = col[2];
    }
    function attrib(name, data, size){ var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(p, name); gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); }
    attrib('position', positions, 3); attrib('random', randoms, 4); attrib('color', colors, 3);
    var U = {}; ['modelMatrix','viewMatrix','projectionMatrix','uTime','uSpread','uBaseSize','uSizeRandomness','uAlphaParticles']
      .forEach(function(n){ U[n] = gl.getUniformLocation(p, n); });
    gl.uniform1f(U.uSpread, DEF.particleSpread);
    gl.uniform1f(U.uBaseSize, DEF.particleBaseSize);
    gl.uniform1f(U.uSizeRandomness, DEF.sizeRandomness);
    gl.uniform1f(U.uAlphaParticles, DEF.alphaParticles);
    var view = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-DEF.cameraDistance,1];
    gl.uniformMatrix4fv(U.viewMatrix, false, new Float32Array(view));
    var W=1, H=1;
    function resize(){ W = Math.max(1, el.offsetWidth||600); H = Math.max(1, el.offsetHeight||360);
      canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
      gl.uniformMatrix4fv(U.projectionMatrix, false, new Float32Array(persp(15, W/H, 0.1, 100))); }
    g.addEventListener('resize', resize); resize();
    var red = reduced(), lastTime = performance.now(), elapsed = red ? 2000 : 0, rotZ = 0;
    function frame(t){
      var delta = t - lastTime; lastTime = t;
      if(!red){ elapsed += delta*DEF.speed; rotZ += 0.01*DEF.speed; }
      gl.uniform1f(U.uTime, elapsed*0.001);
      gl.uniformMatrix4fv(U.modelMatrix, false, new Float32Array(
        euler(Math.sin(elapsed*0.0002)*0.1, Math.cos(elapsed*0.0005)*0.15, rotZ)));
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
      if(!red) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function init(){ var els=document.querySelectorAll('.particles'); for(var i=0;i<els.length;i++) start(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
