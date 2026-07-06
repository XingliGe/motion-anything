/* dot-grid.js — motion-anything recipe · interaction · faithful canvas 2D port (dependency-free).
 * A grid of dots that lights up near the pointer, gets shoved by fast pointer moves, and blasts
 * outward on click — each dot springs back elastically. The original uses GSAP InertiaPlugin
 * (paid); this port replaces it with an underdamped spring integrator (impulse + elastic return,
 * one integrator). Real defaults from source. */
(function(g){ 'use strict';
  var DEF = { dotSize:16, gap:32, baseColor:'#5227FF', activeColor:'#5227FF', proximity:150,
    speedTrigger:100, shockRadius:250, shockStrength:5, maxSpeed:5000 };
  var SPRING_K = 90, SPRING_C = 11, IMPULSE = 9; // underdamped ≈ elastic.out feel
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function hexToRgb(hex){ var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? { r:parseInt(m[1],16), g:parseInt(m[2],16), b:parseInt(m[3],16) } : { r:0,g:0,b:0 }; }
  function throttle(fn, limit){ var last=0; return function(){ var now=performance.now();
    if(now-last>=limit){ last=now; fn.apply(this, arguments); } }; }
  function start(el){
    if(el.__ma) return; el.__ma = 1;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var baseRgb = hexToRgb(DEF.baseColor), activeRgb = hexToRgb(DEF.activeColor);
    var dots = [], W=0, H=0, dpr = Math.min(g.devicePixelRatio||1, 2);
    function buildGrid(){
      var r = el.getBoundingClientRect(); W=r.width; H=r.height;
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var cell = DEF.dotSize + DEF.gap;
      var cols = Math.floor((W + DEF.gap) / cell), rows = Math.floor((H + DEF.gap) / cell);
      var startX = (W - (cell*cols - DEF.gap))/2 + DEF.dotSize/2;
      var startY = (H - (cell*rows - DEF.gap))/2 + DEF.dotSize/2;
      dots = [];
      for(var y=0;y<rows;y++) for(var x=0;x<cols;x++)
        dots.push({ cx:startX + x*cell, cy:startY + y*cell, ox:0, oy:0, vx:0, vy:0 });
    }
    buildGrid();
    g.addEventListener('resize', buildGrid);
    var mouse = { x:-9999, y:-9999, lx:0, ly:0, lt:0 };
    var proxSq = DEF.proximity*DEF.proximity;
    function impulse(dot, pushX, pushY){ dot.vx += pushX*IMPULSE; dot.vy += pushY*IMPULSE; }
    el.addEventListener('pointermove', throttle(function(e){
      var r = el.getBoundingClientRect();
      var now = performance.now(), dt = mouse.lt ? now - mouse.lt : 16;
      var mvx = (e.clientX - mouse.lx)/dt*1000, mvy = (e.clientY - mouse.ly)/dt*1000;
      var speed = Math.hypot(mvx, mvy);
      if(speed > DEF.maxSpeed){ var s = DEF.maxSpeed/speed; mvx*=s; mvy*=s; speed = DEF.maxSpeed; }
      mouse.lt = now; mouse.lx = e.clientX; mouse.ly = e.clientY;
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if(speed > DEF.speedTrigger){
        for(var i=0;i<dots.length;i++){ var d = dots[i];
          var dist = Math.hypot(d.cx - mouse.x, d.cy - mouse.y);
          if(dist < DEF.proximity && Math.hypot(d.vx, d.vy) < 40)
            impulse(d, (d.cx - mouse.x)*0.02 + mvx*0.005, (d.cy - mouse.y)*0.02 + mvy*0.005);
        }
      }
    }, 50), { passive:true });
    el.addEventListener('click', function(e){
      var r = el.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
      for(var i=0;i<dots.length;i++){ var d = dots[i];
        var dist = Math.hypot(d.cx - cx, d.cy - cy);
        if(dist < DEF.shockRadius){
          var falloff = Math.max(0, 1 - dist/DEF.shockRadius);
          impulse(d, (d.cx - cx)*DEF.shockStrength*falloff*0.06, (d.cy - cy)*DEF.shockStrength*falloff*0.06);
        }
      }
    });
    var red = reduced(), lastT = 0;
    function draw(t){
      var dt = Math.min(0.033, lastT ? (t - lastT)/1000 : 0.016); lastT = t;
      ctx.clearRect(0, 0, W, H);
      for(var i=0;i<dots.length;i++){ var d = dots[i];
        // underdamped spring toward rest — shove + elastic return in one integrator
        d.vx += (-SPRING_K*d.ox - SPRING_C*d.vx)*dt*10; d.vy += (-SPRING_K*d.oy - SPRING_C*d.vy)*dt*10;
        d.ox += d.vx*dt; d.oy += d.vy*dt;
        var dx = d.cx - mouse.x, dy = d.cy - mouse.y, dsq = dx*dx + dy*dy;
        var fill = DEF.baseColor;
        if(dsq <= proxSq){
          var k = 1 - Math.sqrt(dsq)/DEF.proximity;
          fill = 'rgb(' + Math.round(baseRgb.r + (activeRgb.r-baseRgb.r)*k) + ',' +
            Math.round(baseRgb.g + (activeRgb.g-baseRgb.g)*k) + ',' +
            Math.round(baseRgb.b + (activeRgb.b-baseRgb.b)*k) + ')';
        }
        ctx.beginPath();
        ctx.arc(d.cx + d.ox, d.cy + d.oy, DEF.dotSize/2, 0, Math.PI*2);
        ctx.fillStyle = fill; ctx.fill();
      }
      if(!red) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
  function init(){ var els=document.querySelectorAll('.dot-grid'); for(var i=0;i<els.length;i++) start(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
