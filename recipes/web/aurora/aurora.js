/* aurora.js — motion-anything recipe · category: ambient
 * A living aurora gradient mesh — a GPU fragment shader run in dependency-free raw WebGL2.
 * (Faithful port of the Aurora shader; ogl replaced with plain WebGL2.) Static frame under reduced-motion. */
(function (g) {
  'use strict';
  var VERT = '#version 300 es\nin vec2 position;\nvoid main(){ gl_Position = vec4(position, 0.0, 1.0); }\n';
  var FRAG = '#version 300 es\n\
precision highp float;\n\
uniform float uTime; uniform float uAmplitude; uniform vec3 uColorStops[3]; uniform vec2 uResolution; uniform float uBlend;\n\
out vec4 fragColor;\n\
vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }\n\
float snoise(vec2 v){ const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);\n\
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx); vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);\n\
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod(i,289.0);\n\
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));\n\
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;\n\
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;\n\
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);\n\
  vec3 gg; gg.x=a0.x*x0.x+h.x*x0.y; gg.yz=a0.yz*x12.xz+h.yz*x12.yw; return 130.0*dot(m,gg); }\n\
struct ColorStop { vec3 color; float position; };\n\
#define COLOR_RAMP(colors,factor,finalColor){ int index=0; for(int i=0;i<2;i++){ ColorStop cc=colors[i]; bool ib=cc.position<=factor; index=int(mix(float(index),float(i),float(ib))); } ColorStop cc=colors[index]; ColorStop nc=colors[index+1]; float range=nc.position-cc.position; float lf=(factor-cc.position)/range; finalColor=mix(cc.color,nc.color,lf); }\n\
void main(){ vec2 uv=gl_FragCoord.xy/uResolution;\n\
  ColorStop colors[3]; colors[0]=ColorStop(uColorStops[0],0.0); colors[1]=ColorStop(uColorStops[1],0.5); colors[2]=ColorStop(uColorStops[2],1.0);\n\
  vec3 rampColor; COLOR_RAMP(colors, uv.x, rampColor);\n\
  float height=snoise(vec2(uv.x*2.0+uTime*0.1, uTime*0.25))*0.5*uAmplitude; height=exp(height); height=(uv.y*2.0-height+0.2);\n\
  float intensity=0.6*height; float midPoint=0.20; float aa=smoothstep(midPoint-uBlend*0.5, midPoint+uBlend*0.5, intensity);\n\
  vec3 auroraColor=intensity*rampColor; fragColor=vec4(auroraColor*aa, aa); }\n';

  function hex(h){ h=String(h).replace('#',''); return [parseInt(h.substr(0,2),16)/255, parseInt(h.substr(2,2),16)/255, parseInt(h.substr(4,2),16)/255]; }
  function sh(gl, t, src){ var s=gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; }
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function run(ctn){
    var canvas=document.createElement('canvas'); canvas.style.cssText='width:100%;height:100%;display:block'; ctn.appendChild(canvas);
    var gl=canvas.getContext('webgl2',{alpha:true, premultipliedAlpha:true, antialias:true});
    if(!gl){ ctn.style.background='linear-gradient(135deg,#5227FF,#7cff67)'; return; }
    gl.clearColor(0,0,0,0); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    var p=gl.createProgram(); gl.attachShader(p, sh(gl,gl.VERTEX_SHADER,VERT)); gl.attachShader(p, sh(gl,gl.FRAGMENT_SHADER,FRAG)); gl.linkProgram(p); gl.useProgram(p);
    var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(p,'position'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var uTime=gl.getUniformLocation(p,'uTime'), uRes=gl.getUniformLocation(p,'uResolution'), uAmp=gl.getUniformLocation(p,'uAmplitude'), uBlend=gl.getUniformLocation(p,'uBlend'), uStops=gl.getUniformLocation(p,'uColorStops');
    var stops=(ctn.getAttribute('data-colors')||'#5227FF,#7cff67,#5227FF').split(',');
    var flat=[]; stops.slice(0,3).forEach(function(c){ flat=flat.concat(hex(c)); });
    function resize(){ var w=ctn.offsetWidth||600, h=ctn.offsetHeight||360; canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h); gl.uniform2f(uRes,w,h); }
    g.addEventListener('resize', resize); resize();
    gl.uniform1f(uAmp, parseFloat(ctn.getAttribute('data-amp'))||1.0);
    gl.uniform1f(uBlend, parseFloat(ctn.getAttribute('data-blend'))||0.5);
    gl.uniform3fv(uStops, new Float32Array(flat));
    var red=reduced();
    function frame(t){ gl.uniform1f(uTime, (red?2000:t)*0.001); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,3); if(!red) requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }
  function init(){ var els=document.querySelectorAll('.aurora'); for(var i=0;i<els.length;i++) if(!els[i].__a){ els[i].__a=1; run(els[i]); } }
  g.attachAurora=run; if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
