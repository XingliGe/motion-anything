/* dot-field.js — motion-anything recipe · interaction · faithful canvas 2D port (dependency-free).
 * A gradient dot lattice that bulges away from the pointer (speed-gated engagement) with a soft
 * glow following the cursor. The original renders the glow in an SVG overlay; this port draws it
 * on the same canvas (same look, one element). Real defaults from source. */
(function(g){ 'use strict';
  var DEF = { dotRadius:1.5, dotSpacing:14, cursorRadius:500, cursorForce:0.1, bulgeOnly:true,
    bulgeStrength:67, glowRadius:160, sparkle:false, waveAmplitude:0,
    gradientFrom:'rgba(168, 85, 247, 0.35)', gradientTo:'rgba(180, 151, 207, 0.25)', glowColor:'#120F17' };
  var TWO_PI = Math.PI*2;
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function start(el){
    if(el.__ma) return; el.__ma = 1;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d', { alpha:true });
    var dpr = Math.min(g.devicePixelRatio||1, 2);
    var dots = [], W=0, H=0;
    function buildDots(){
      var step = DEF.dotRadius + DEF.dotSpacing;
      var cols = Math.floor(W/step), rows = Math.floor(H/step);
      var padX = (W % step)/2, padY = (H % step)/2;
      dots = [];
      for(var row=0;row<rows;row++) for(var col=0;col<cols;col++){
        var ax = padX + col*step + step/2, ay = padY + row*step + step/2;
        dots.push({ ax:ax, ay:ay, sx:ax, sy:ay, vx:0, vy:0, x:ax, y:ay });
      }
    }
    function doResize(){
      var r = el.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      buildDots();
    }
    doResize();
    var resizeTimer; g.addEventListener('resize', function(){ clearTimeout(resizeTimer); resizeTimer = setTimeout(doResize, 100); });
    var mouse = { x:-9999, y:-9999, prevX:-9999, prevY:-9999, speed:0 };
    el.addEventListener('pointermove', function(e){ var r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive:true });
    setInterval(function(){
      var dx = mouse.prevX - mouse.x, dy = mouse.prevY - mouse.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      mouse.speed += (dist - mouse.speed)*0.5; if(mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x; mouse.prevY = mouse.y;
    }, 20);
    var engagement = 0, glowOpacity = 0, frameCount = 0, red = reduced();
    function tick(){
      frameCount++;
      var t = frameCount*0.02;
      var targetEngagement = Math.min(mouse.speed/5, 1);
      engagement += (targetEngagement - engagement)*0.06; if(engagement < 0.001) engagement = 0;
      glowOpacity += (engagement - glowOpacity)*0.08;
      ctx.clearRect(0, 0, W, H);
      var grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, DEF.gradientFrom); grad.addColorStop(1, DEF.gradientTo);
      ctx.fillStyle = grad;
      var cr = DEF.cursorRadius, crSq = cr*cr, rad = DEF.dotRadius/2;
      ctx.beginPath();
      for(var i=0;i<dots.length;i++){ var d = dots[i];
        var dx = mouse.x - d.ax, dy = mouse.y - d.ay, distSq = dx*dx + dy*dy;
        if(distSq < crSq && engagement > 0.01){
          var dist = Math.sqrt(distSq);
          if(DEF.bulgeOnly){
            var k = 1 - dist/cr;
            var push = k*k*DEF.bulgeStrength*engagement;
            var angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle)*push - d.sx)*0.15;
            d.sy += (d.ay - Math.sin(angle)*push - d.sy)*0.15;
          } else {
            var ang = Math.atan2(dy, dx);
            var mv = (500/dist)*(mouse.speed*DEF.cursorForce);
            d.vx += Math.cos(ang)*-mv; d.vy += Math.sin(ang)*-mv;
          }
        } else if(DEF.bulgeOnly){
          d.sx += (d.ax - d.sx)*0.1; d.sy += (d.ay - d.sy)*0.1;
        }
        if(!DEF.bulgeOnly){
          d.vx *= 0.9; d.vy *= 0.9;
          d.x = d.ax + d.vx; d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx)*0.1; d.sy += (d.y - d.sy)*0.1;
        }
        var drawX = d.sx, drawY = d.sy;
        if(DEF.waveAmplitude > 0){
          drawY += Math.sin(d.ax*0.03 + t)*DEF.waveAmplitude;
          drawX += Math.cos(d.ay*0.03 + t*0.7)*DEF.waveAmplitude*0.5;
        }
        if(DEF.sparkle){
          var hash = ((i*2654435761) ^ (frameCount>>3)) >>> 0;
          var rr = (hash % 100) < 3 ? rad*1.8 : rad;
          ctx.moveTo(drawX + rr, drawY); ctx.arc(drawX, drawY, rr, 0, TWO_PI);
        } else {
          ctx.moveTo(drawX + rad, drawY); ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      }
      ctx.fill();
      if(glowOpacity > 0.01){ // cursor glow — SVG overlay in the original, same canvas here
        var gl = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, DEF.glowRadius);
        gl.addColorStop(0, DEF.glowColor); gl.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = glowOpacity; ctx.fillStyle = gl;
        ctx.fillRect(mouse.x - DEF.glowRadius, mouse.y - DEF.glowRadius, DEF.glowRadius*2, DEF.glowRadius*2);
        ctx.globalAlpha = 1;
      }
      if(!red) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function init(){ var els=document.querySelectorAll('.dot-field'); for(var i=0;i<els.length;i++) start(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
