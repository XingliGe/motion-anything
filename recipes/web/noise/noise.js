/* noise.js — motion-anything recipe · ambient · faithful canvas 2D port (dependency-free).
 * Film-grain noise overlay: a 1024² random-luminance pattern refreshed every N frames,
 * stretched over the container with pixelated rendering. Real defaults from source. */
(function(g){ 'use strict';
  var DEF = { patternRefreshInterval: 2, patternAlpha: 15 };
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function start(el){
    if(el.__ma) return; el.__ma = 1;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;image-rendering:pixelated';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d', { alpha:true });
    var SIZE = 1024; canvas.width = SIZE; canvas.height = SIZE;
    var frame = 0;
    function drawGrain(){
      var imageData = ctx.createImageData(SIZE, SIZE), data = imageData.data;
      for(var i=0;i<data.length;i+=4){ var v = Math.random()*255; data[i]=v; data[i+1]=v; data[i+2]=v; data[i+3]=DEF.patternAlpha; }
      ctx.putImageData(imageData, 0, 0);
    }
    if(reduced()){ drawGrain(); return; }
    (function loop(){ if(frame % DEF.patternRefreshInterval === 0) drawGrain(); frame++; requestAnimationFrame(loop); })();
  }
  function init(){ var els=document.querySelectorAll('.noise'); for(var i=0;i<els.length;i++) start(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
