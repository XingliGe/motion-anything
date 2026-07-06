/* waves.js — motion-anything recipe · ambient · faithful canvas 2D port (dependency-free).
 * A field of vertical lines warped by 2D perlin noise; the pointer drags nearby points with a
 * friction/tension spring wake. Direct port of the react-bits component (its perlin impl is
 * self-contained). Real defaults from source; line color via data-line-color (default black —
 * designed for light backgrounds). */
(function(g){ 'use strict';
  var DEF = { lineColor:'black', waveSpeedX:0.0125, waveSpeedY:0.005, waveAmpX:32, waveAmpY:16,
    xGap:10, yGap:32, friction:0.925, tension:0.005, maxCursorMove:100 };
  function reduced(){ return g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function Grad(x,y){ this.x=x; this.y=y; }
  Grad.prototype.dot2 = function(x,y){ return this.x*x + this.y*y; };
  function Noise(seed){
    this.grad3 = [new Grad(1,1),new Grad(-1,1),new Grad(1,-1),new Grad(-1,-1),
      new Grad(1,0),new Grad(-1,0),new Grad(1,0),new Grad(-1,0),
      new Grad(0,1),new Grad(0,-1),new Grad(0,1),new Grad(0,-1)];
    this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,
      21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,
      237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,
      111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,
      80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,
      3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,
      17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
      129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,
      238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
      184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,
      195,78,66,215,61,156,180];
    this.perm = new Array(512); this.gradP = new Array(512); this.seed(seed||0);
  }
  Noise.prototype.seed = function(seed){
    if(seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed); if(seed < 256) seed |= seed << 8;
    for(var i=0;i<256;i++){ var v = (i & 1) ? this.p[i] ^ (seed & 255) : this.p[i] ^ ((seed>>8) & 255);
      this.perm[i] = this.perm[i+256] = v; this.gradP[i] = this.gradP[i+256] = this.grad3[v % 12]; }
  };
  Noise.prototype.fade = function(t){ return t*t*t*(t*(t*6-15)+10); };
  Noise.prototype.lerp = function(a,b,t){ return (1-t)*a + t*b; };
  Noise.prototype.perlin2 = function(x,y){
    var X = Math.floor(x), Y = Math.floor(y); x -= X; y -= Y; X &= 255; Y &= 255;
    var n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
    var n01 = this.gradP[X + this.perm[Y+1]].dot2(x, y-1);
    var n10 = this.gradP[X+1 + this.perm[Y]].dot2(x-1, y);
    var n11 = this.gradP[X+1 + this.perm[Y+1]].dot2(x-1, y-1);
    var u = this.fade(x);
    return this.lerp(this.lerp(n00, n10, u), this.lerp(n01, n11, u), this.fade(y));
  };
  function start(el){
    if(el.__ma) return; el.__ma = 1;
    var lineColor = el.getAttribute('data-line-color') || DEF.lineColor;
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var noise = new Noise(Math.random());
    var lines = [], W=0, H=0;
    var mouse = { x:-10, y:0, lx:0, ly:0, sx:0, sy:0, v:0, vs:0, a:0, set:false };
    function setSize(){ var r = el.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = W; canvas.height = H; }
    function setLines(){
      lines = [];
      var oW = W + 200, oH = H + 30;
      var totalLines = Math.ceil(oW / DEF.xGap), totalPoints = Math.ceil(oH / DEF.yGap);
      var xStart = (W - DEF.xGap*totalLines)/2, yStart = (H - DEF.yGap*totalPoints)/2;
      for(var i=0;i<=totalLines;i++){ var pts = [];
        for(var j=0;j<=totalPoints;j++)
          pts.push({ x:xStart + DEF.xGap*i, y:yStart + DEF.yGap*j, wx:0, wy:0, cx:0, cy:0, cvx:0, cvy:0 });
        lines.push(pts);
      }
    }
    function movePoints(time){
      for(var i=0;i<lines.length;i++){ var pts = lines[i];
        for(var j=0;j<pts.length;j++){ var p = pts[j];
          var move = noise.perlin2((p.x + time*DEF.waveSpeedX)*0.002, (p.y + time*DEF.waveSpeedY)*0.0015)*12;
          p.wx = Math.cos(move)*DEF.waveAmpX; p.wy = Math.sin(move)*DEF.waveAmpY;
          var dx = p.x - mouse.sx, dy = p.y - mouse.sy;
          var dist = Math.hypot(dx, dy), l = Math.max(175, mouse.vs);
          if(dist < l){ var s = 1 - dist/l; var f = Math.cos(dist*0.001)*s;
            p.cvx += Math.cos(mouse.a)*f*l*mouse.vs*0.00065;
            p.cvy += Math.sin(mouse.a)*f*l*mouse.vs*0.00065; }
          p.cvx += (0 - p.cx)*DEF.tension; p.cvy += (0 - p.cy)*DEF.tension;
          p.cvx *= DEF.friction; p.cvy *= DEF.friction;
          p.cx += p.cvx*2; p.cy += p.cvy*2;
          p.cx = Math.min(DEF.maxCursorMove, Math.max(-DEF.maxCursorMove, p.cx));
          p.cy = Math.min(DEF.maxCursorMove, Math.max(-DEF.maxCursorMove, p.cy));
        }
      }
    }
    function moved(p, withCursor){
      var x = p.x + p.wx + (withCursor ? p.cx : 0), y = p.y + p.wy + (withCursor ? p.cy : 0);
      return { x: Math.round(x*10)/10, y: Math.round(y*10)/10 };
    }
    function drawLines(){
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath(); ctx.strokeStyle = lineColor;
      for(var i=0;i<lines.length;i++){ var pts = lines[i];
        var p1 = moved(pts[0], false); ctx.moveTo(p1.x, p1.y);
        for(var j=0;j<pts.length;j++){ var isLast = j === pts.length-1;
          p1 = moved(pts[j], !isLast);
          var p2 = moved(pts[j+1] || pts[pts.length-1], !isLast);
          ctx.lineTo(p1.x, p1.y);
          if(isLast) ctx.moveTo(p2.x, p2.y);
        }
      }
      ctx.stroke();
    }
    function updateMouse(x, y){ var r = el.getBoundingClientRect();
      mouse.x = x - r.left; mouse.y = y - r.top;
      if(!mouse.set){ mouse.sx = mouse.x; mouse.sy = mouse.y; mouse.lx = mouse.x; mouse.ly = mouse.y; mouse.set = true; } }
    el.addEventListener('mousemove', function(e){ updateMouse(e.clientX, e.clientY); }, { passive:true });
    el.addEventListener('touchmove', function(e){ var t = e.touches[0]; updateMouse(t.clientX, t.clientY); }, { passive:true });
    g.addEventListener('resize', function(){ setSize(); setLines(); });
    setSize(); setLines();
    var red = reduced();
    function tick(t){
      mouse.sx += (mouse.x - mouse.sx)*0.1; mouse.sy += (mouse.y - mouse.sy)*0.1;
      var d = Math.hypot(mouse.x - mouse.lx, mouse.y - mouse.ly);
      mouse.vs += (d - mouse.vs)*0.1; mouse.vs = Math.min(100, mouse.vs);
      mouse.a = Math.atan2(mouse.y - mouse.ly, mouse.x - mouse.lx);
      mouse.lx = mouse.x; mouse.ly = mouse.y;
      movePoints(t); drawLines();
      if(!red) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function init(){ var els=document.querySelectorAll('.waves'); for(var i=0;i<els.length;i++) start(els[i]); }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})(window);
