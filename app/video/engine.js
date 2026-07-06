/* motion-anything · video engine (canvas compositor)
 * Architecture decision (2026-06-29): the launch-video line renders to a <canvas> (not DOM),
 * so it can export to mp4 fully in-browser via WebCodecs + Mediabunny — no server, no watermark.
 * It shares the HTML line's "motion brain": keyframe tracks {prop:[{t,v}]} + linear/eased interp.
 *
 * Composition model (JSON, portable — the motion-as-JSON wedge):
 *   { w, h, fps, bg, duration,                       // px / px / number / css color / seconds
 *     layers: [ {
 *       id, type:'text'|'rect'|'ellipse'|'image',
 *       start, end,                                   // visible window in comp seconds (optional)
 *       x, y,                                         // center position (comp px)
 *       w, h, radius,                                 // box size (rect/image) / corner radius
 *       text, font, size, weight, color, align,       // text
 *       fill,                                         // shape fill
 *       src, _img,                                    // image url / preloaded HTMLImageElement
 *       opacity, scale, rotate,                       // base transform (overridden by tracks)
 *       tracks: { opacity:[{t,v,ease}], x:[], y:[], scale:[], rotate:[] }  // t in comp seconds
 *     } ] }
 *
 * This is brick #1: model + frame render + play loop. Export + editor UI land next.
 */
(function (global) {
  'use strict';

  var EASE = {
    linear: function (p) { return p; },
    ease: function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; },
    'ease-in': function (p) { return p * p; },
    'ease-out': function (p) { return 1 - (1 - p) * (1 - p); },
    'ease-in-out': function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; },
    spring: function (p) { return 1 - Math.cos(p * Math.PI * (1 + 2 * 0.3)) * Math.exp(-p * 4); }
  };

  /* value of a keyframe track at comp-time t (seconds); null when the track is empty */
  function sample(track, t) {
    if (!track || !track.length) return null;
    if (t <= track[0].t) return track[0].v;
    var last = track[track.length - 1];
    if (t >= last.t) return last.v;
    for (var i = 1; i < track.length; i++) {
      if (t <= track[i].t) {
        var a = track[i - 1], b = track[i];
        var span = (b.t - a.t) || 1e-6;
        var p = (t - a.t) / span;
        var fn = EASE[b.ease || a.ease || 'linear'] || EASE.linear;
        return a.v + (b.v - a.v) * fn(p);
      }
    }
    return last.v;
  }

  /* resolve a single animated property: base value, overridden by its track when present */
  function prop(layer, key, base, t) {
    var tr = layer.tracks && layer.tracks[key];
    var v = sample(tr, t);
    return v == null ? (layer[key] != null ? layer[key] : base) : v;
  }

  /* point at fraction p (0..1) along a polyline path [{x,y}…], by arc length */
  function pathPos(path, p) {
    if (!path || !path.length) return null;
    if (path.length === 1) return { x: path[0].x, y: path[0].y };
    var segs = [], total = 0, i;
    for (i = 1; i < path.length; i++) { var len = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); segs.push(len); total += len; }
    if (total === 0) return { x: path[0].x, y: path[0].y };
    p = Math.max(0, Math.min(1, p));
    var target = p * total, acc = 0;
    for (i = 0; i < segs.length; i++) {
      if (acc + segs[i] >= target) { var f = (target - acc) / (segs[i] || 1); return { x: path[i].x + (path[i + 1].x - path[i].x) * f, y: path[i].y + (path[i + 1].y - path[i].y) * f }; }
      acc += segs[i];
    }
    return { x: path[path.length - 1].x, y: path[path.length - 1].y };
  }

  /* generate a standard-shape path (points in comp coords) */
  function makeShapePath(kind, cx, cy, r) {
    var pts = [], n = 48, i;
    if (kind === 'line') { return [{ x: cx - r, y: cy }, { x: cx + r, y: cy }]; }
    if (kind === 'arc') { for (i = 0; i <= n; i++) { var a = Math.PI - Math.PI * (i / n); pts.push({ x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r }); } return pts; }
    /* circle */ for (i = 0; i <= n; i++) { var t = Math.PI * 2 * (i / n) - Math.PI / 2; pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r }); } return pts;
  }

  function bbox(path) {
    var mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
    path.forEach(function (p) { if (p.x < mnx) mnx = p.x; if (p.y < mny) mny = p.y; if (p.x > mxx) mxx = p.x; if (p.y > mxy) mxy = p.y; });
    return { minx: mnx, miny: mny, maxx: mxx, maxy: mxy, w: mxx - mnx, h: mxy - mny, cx: (mnx + mxx) / 2, cy: (mny + mxy) / 2 };
  }
  /* Chaikin corner-cutting → a smooth curve through the rough drawing (endpoints kept) */
  function chaikin(path, iter) {
    var pts = path.slice();
    for (var k = 0; k < (iter || 2); k++) {
      var out = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        out.push({ x: a.x * .75 + b.x * .25, y: a.y * .75 + b.y * .25 });
        out.push({ x: a.x * .25 + b.x * .75, y: a.y * .25 + b.y * .75 });
      }
      out.push(pts[pts.length - 1]); pts = out;
    }
    return pts;
  }
  /* interpret a rough drawn path as a regular shape ('line'|'smooth'|'circle'|'ellipse'|'rect') */
  function shapeFromPath(kind, path) {
    if (!path || path.length < 2) return null;
    var bb = bbox(path), i;
    if (kind === 'line') return [{ x: path[0].x, y: path[0].y }, { x: path[path.length - 1].x, y: path[path.length - 1].y }];
    if (kind === 'smooth') return chaikin(path, 2);
    if (kind === 'rect') return [{ x: bb.minx, y: bb.miny }, { x: bb.maxx, y: bb.miny }, { x: bb.maxx, y: bb.maxy }, { x: bb.minx, y: bb.maxy }, { x: bb.minx, y: bb.miny }];
    if (kind === 'ellipse') { var e = [], n = 48, rx = bb.w / 2 || 1, ry = bb.h / 2 || 1; for (i = 0; i <= n; i++) { var a = Math.PI * 2 * (i / n) - Math.PI / 2; e.push({ x: bb.cx + Math.cos(a) * rx, y: bb.cy + Math.sin(a) * ry }); } return e; }
    /* circle: centroid + mean radius (so an open circle-ish scribble becomes a clean circle) */
    var cx = 0, cy = 0; path.forEach(function (p) { cx += p.x; cy += p.y; }); cx /= path.length; cy /= path.length;
    var r = 0; path.forEach(function (p) { r += Math.hypot(p.x - cx, p.y - cy); }); r /= path.length;
    return makeShapePath('circle', cx, cy, r || Math.max(bb.w, bb.h) / 2);
  }

  function VideoComp(data) {
    data = data || {};
    this.w = data.w || 1920;
    this.h = data.h || 1080;
    this.fps = data.fps || 30;
    this.bg = data.bg || '#0b0b12';
    this.layers = (data.layers || []).map(function (l, i) { var c = Object.assign({}, l); if (!c.id) c.id = 'L' + i + '_' + Math.random().toString(36).slice(2, 6); return c; });
    this._duration = data.duration || 0;
    this._raf = 0; this._t = 0; this._playing = false;
    this.onframe = null; // (t) => void  — UI hook for scrubber sync
  }

  VideoComp.prototype.setDuration = function (s) { this._duration = Math.max(0.2, +s || 0.2); };
  VideoComp.prototype.duration = function () {
    if (this._duration) return this._duration;
    var d = 0;
    this.layers.forEach(function (l) {
      if (l.end != null) d = Math.max(d, l.end);
      var tr = l.tracks || {};
      Object.keys(tr).forEach(function (k) { (tr[k] || []).forEach(function (kf) { d = Math.max(d, kf.t); }); });
    });
    return d || 3;
  };

  /* preload any image/video layers; resolves when all are ready (or immediately if none) */
  VideoComp.prototype.preload = function () { return preloadLayers(this.layers); };
  /* preview: sync this scene's own video layers (+ any attached editing-shared) to comp-time t */
  VideoComp.prototype.syncMedia = function (t, playing) {
    var self = this;
    this.layers.forEach(function (l) { if (l.type === 'video' && l._vid) syncVid(l, t, playing); });
    var es = (this._editShared || []).concat(this._editSharedFront || []);
    es.forEach(function (l) { if (l.type === 'video' && l._vid) syncVid(l, (self._editSceneStart || 0) + t, playing); });
  };
  /* export: seek this scene's video layers to comp-time t (await before drawing the frame) */
  VideoComp.prototype.seekMedia = function (t) { return seekMediaLayers(this.layers, t); };

  /* paint one layer (transform + draw) into ctx at comp-time t. Shared by VideoComp scenes
   * and Movie-level shared layers so a video/image/shape layer renders identically anywhere. */
  function paintLayer(ctx, l, t, W, H) {
    if (l.start != null && t < l.start) return;
    if (l.end != null && t > l.end) return;
    var op = prop(l, 'opacity', 1, t);
    if (op <= 0.001) return;
    var x, y;
    if (l.path && l.path.length > 1) {                 // path drives position via the offset track (0..1)
      var pos = pathPos(l.path, prop(l, 'offset', 0, t));
      x = pos.x; y = pos.y;
    } else { x = prop(l, 'x', W / 2, t); y = prop(l, 'y', H / 2, t); }
    var sc = prop(l, 'scale', 1, t);
    var rot = prop(l, 'rotate', 0, t);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, op));
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot * Math.PI / 180);
    if (sc !== 1) ctx.scale(sc, sc);
    drawLayer(ctx, l, t);
    ctx.restore();
  }

  /* draw a single frame at comp-time t (seconds) into a 2D context sized to the comp.
   * overlay=true draws the editor selection outline — NEVER passed by the exporter, so it
   * stays out of the final mp4.
   * noBg=true skips the clear+bg fill (so the scene composites over an already-drawn shared
   * background). withEditShared=true draws Movie-level shared layers attached for editing preview. */
  VideoComp.prototype.renderFrame = function (ctx, t, overlay, noBg, withEditShared) {
    var W = this.w, H = this.h;
    ctx.save();
    if (!noBg) { ctx.clearRect(0, 0, W, H); if (this.bg) { ctx.fillStyle = this.bg; ctx.fillRect(0, 0, W, H); } }
    var k, et = (this._editSceneStart || 0) + t;
    if (withEditShared && this._editShared) for (k = 0; k < this._editShared.length; k++) paintLayer(ctx, this._editShared[k], et, W, H);
    for (var i = 0; i < this.layers.length; i++) paintLayer(ctx, this.layers[i], t, W, H);
    if (withEditShared && this._editSharedFront) for (k = 0; k < this._editSharedFront.length; k++) paintLayer(ctx, this._editSharedFront[k], et, W, H);
    if (overlay) {
      // the path being drawn right now (set by the editor)
      if (this._pendingPath && this._pendingPath.length > 1) strokePath(ctx, this._pendingPath, '#39d98a', Math.max(2, W / 480), false);
      var sl = this.selectedId && this.layer(this.selectedId);
      if (sl) {
        if (sl.path && sl.path.length > 1) strokePath(ctx, sl.path, 'rgba(109,84,230,.8)', Math.max(2, W / 540), true);
        if (!(sl.start != null && t < sl.start) && !(sl.end != null && t > sl.end)) {
          var b = this.bounds(sl, t);
          ctx.save();
          ctx.strokeStyle = '#6d54e6'; ctx.lineWidth = Math.max(2, W / 640); ctx.setLineDash([W / 120, W / 160]);
          ctx.strokeRect(b.x, b.y, b.w, b.h);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  };

  function strokePath(ctx, path, color, lw, dashed) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([lw * 3, lw * 3]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
    ctx.restore();
  }

  /* ---- kinetic typography: per-character / per-word text reveal on a canvas text layer ----
   * A text layer carries: kinetic = { type, stagger(sec), dur(sec), start(sec) }.
   * Each glyph/word i animates over [start + i*stagger, +dur]; `start` defaults to the layer's
   * visible start. Purely a draw-time effect (no tracks), so it renders identically in export. */
  var KINETIC = [
    { id: 'char-rise',   word: false, label: 'Chars rise' },
    { id: 'char-fade',   word: false, label: 'Chars fade' },
    { id: 'char-pop',    word: false, label: 'Chars pop' },
    { id: 'char-drop',   word: false, label: 'Chars drop' },
    { id: 'char-blur',   word: false, label: 'Chars deblur' },
    { id: 'char-flip',   word: false, label: 'Chars flip' },
    { id: 'char-spin',   word: false, label: 'Chars spin-in' },
    { id: 'typewriter',  word: false, label: 'Typewriter' },
    { id: 'wave',        word: false, label: 'Wave (ambient)' },
    { id: 'word-rise',   word: true,  label: 'Words rise' },
    { id: 'word-fade',   word: true,  label: 'Words fade' },
    { id: 'word-pop',    word: true,  label: 'Words pop' },
    { id: 'word-blur',   word: true,  label: 'Words deblur' }
  ];
  function backOut(p) { var c = 1.70158 * 1.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
  function drawKineticText(ctx, l, t) {
    var size = l.size || 64, weight = l.weight || 700, font = l.font || 'Inter, system-ui, sans-serif';
    ctx.font = weight + ' ' + size + 'px ' + font;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    var col = l.color || '#fff';
    var k = l.kinetic || {}, type = k.type || 'char-rise';
    var byWord = /^word/.test(type);
    var stagger = k.stagger != null ? k.stagger : (byWord ? 0.09 : 0.035);
    var dur = k.dur != null ? k.dur : (byWord ? 0.6 : 0.45);
    var kStart = k.start != null ? k.start : (l.start || 0);
    var align = l.align || 'center';
    var lines = String(l.text == null ? '' : l.text).split('\n');
    var lineH = size * 1.28, totalH = lines.length * lineH;
    var eo = EASE['ease-out'];
    var unit = 0;                                     // global glyph/word index → continuous stagger
    for (var li = 0; li < lines.length; li++) {
      var lineY = -totalH / 2 + lineH / 2 + li * lineH;
      var raw = lines[li];
      var toks = byWord
        ? raw.split(/(\s+)/).filter(function (s) { return s.length; }).map(function (s) { return { s: s, sp: /^\s+$/.test(s) }; })
        : raw.split('').map(function (s) { return { s: s, sp: s === ' ' }; });
      var widths = toks.map(function (tk) { return ctx.measureText(tk.s).width; });
      var lineW = widths.reduce(function (a, b) { return a + b; }, 0);
      var x = align === 'left' ? 0 : align === 'right' ? -lineW : -lineW / 2;
      for (var i = 0; i < toks.length; i++) {
        var tk = toks[i], w = widths[i];
        if (tk.sp) { x += w; continue; }
        var st = kStart + unit * stagger;
        var p = dur <= 0 ? 1 : (t - st) / dur;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        var cx = x + w / 2;                            // glyph center for transforms
        if (type === 'typewriter') {
          if (t >= st) { ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fillText(tk.s, x, lineY); }
        } else if (type === 'wave') {
          ctx.globalAlpha = 1; ctx.fillStyle = col;
          ctx.fillText(tk.s, x, lineY + Math.sin(t * 3.2 + unit * 0.5) * size * 0.14);
        } else {
          ctx.save(); ctx.fillStyle = col;
          var e = eo(p);
          ctx.globalAlpha = /fade|blur/.test(type) ? p : e;
          ctx.translate(cx, lineY);
          if (type === 'char-rise' || type === 'word-rise') ctx.translate(0, (1 - e) * size * 0.75);
          else if (type === 'char-drop') ctx.translate(0, -(1 - e) * size * 0.75);
          else if (type === 'char-pop' || type === 'word-pop') { var s = backOut(p); ctx.scale(s, s); }
          else if (type === 'char-blur' || type === 'word-blur') { try { ctx.filter = 'blur(' + ((1 - p) * size * 0.14) + 'px)'; } catch (e2) {} }
          else if (type === 'char-flip') ctx.scale(1, Math.max(0.02, e));
          else if (type === 'char-spin') { ctx.rotate((1 - e) * -0.9); ctx.scale(0.4 + 0.6 * e, 0.4 + 0.6 * e); }
          ctx.fillText(tk.s, -w / 2, 0);
          ctx.restore();
        }
        x += w; unit++;
      }
    }
    ctx.globalAlpha = 1; ctx.filter = 'none';
  }

  function drawLayer(ctx, l, t) {
    if (l.type === 'text') {
      if (l.kinetic && l.kinetic.type && l.kinetic.type !== 'none') { drawKineticText(ctx, l, t || 0); return; }
      ctx.fillStyle = l.color || '#fff';
      var size = l.size || 64, weight = l.weight || 700, font = l.font || 'Inter, system-ui, sans-serif';
      ctx.font = weight + ' ' + size + 'px ' + font;
      ctx.textAlign = l.align || 'center';
      ctx.textBaseline = 'middle';
      var lines0 = String(l.text == null ? '' : l.text).split('\n');
      if (lines0.length > 1) {
        var lh0 = size * 1.25, top0 = -(lines0.length * lh0) / 2 + lh0 / 2;
        for (var li0 = 0; li0 < lines0.length; li0++) ctx.fillText(lines0[li0], 0, top0 + li0 * lh0);
      } else ctx.fillText(l.text || '', 0, 0);
    } else if (l.type === 'rect') {
      var w = l.w || 200, h = l.h || 120, r = l.radius || 0;
      ctx.fillStyle = l.fill || '#6d54e6';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, r); else ctx.rect(-w / 2, -h / 2, w, h);
      ctx.fill();
    } else if (l.type === 'ellipse') {
      var rw = (l.w || 160) / 2, rh = (l.h || l.w || 160) / 2;
      ctx.fillStyle = l.fill || '#6d54e6';
      ctx.beginPath();
      ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (l.type === 'image' && l._img) {
      var iw = l.w || l._img.width, ih = l.h || l._img.height;
      ctx.drawImage(l._img, -iw / 2, -ih / 2, iw, ih);
    } else if (l.type === 'video' && l._vid && l._vid.readyState >= 2) {
      var vw = l.w || l._vid.videoWidth, vh = l.h || l._vid.videoHeight;
      ctx.drawImage(l._vid, -vw / 2, -vh / 2, vw, vh);
    }
  }

  /* ---- video-layer media helpers (preview = play the <video>; export = seek per frame) ---- */
  var MEDIA_HOOK = null;   // editor sets this to redraw the live canvas when a seeked frame is ready

  /* media time of a video layer at comp-time t: in-point + (t - layer.start) * rate, looped by default */
  function mediaTimeFor(l, t) {
    var v = l._vid; if (!v) return 0;
    var d = v.duration || 0, mt = (l.clipStart || 0) + (t - (l.start || 0)) * (l.rate || 1);
    if (d > 0) { if (l.loop === false) mt = Math.max(0, Math.min(d - 0.05, mt)); else { mt = mt % d; if (mt < 0) mt += d; } }
    return mt < 0 ? 0 : mt;
  }
  /* preview sync: while playing, let the element play (correct only on >0.3s drift); else pause+seek */
  function syncVid(l, t, playing) {
    var v = l._vid; if (!v) return;
    var mt = mediaTimeFor(l, t);
    if (playing) {
      if (Math.abs(v.currentTime - mt) > 0.3) { try { v.currentTime = mt; } catch (e) {} }
      if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    } else {
      if (!v.paused) v.pause();
      try { v.currentTime = mt; } catch (e) {}
    }
  }
  /* export sync: seek a video layer to its frame at comp-time t and resolve once the frame is ready */
  function seekOne(l, t) {
    return new Promise(function (res) {
      var v = l._vid, mt = mediaTimeFor(l, t);
      if (!v) { res(); return; }
      if (Math.abs(v.currentTime - mt) < 0.012) { res(); return; }
      var done = false;
      function f() { if (done) return; done = true; v.removeEventListener('seeked', f); res(); }
      v.addEventListener('seeked', f);
      try { v.pause(); v.currentTime = mt; } catch (e) { f(); }
      setTimeout(f, 250);
    });
  }
  function seekMediaLayers(layers, t) {
    var jobs = [];
    (layers || []).forEach(function (l) { if (l.type === 'video' && l._vid) jobs.push(seekOne(l, t)); });
    return jobs.length ? Promise.all(jobs) : Promise.resolve();
  }
  /* load image + video layer media; resolves when all are ready (or immediately if none) */
  function preloadLayers(layers) {
    var jobs = [];
    (layers || []).forEach(function (l) {
      if (l.type === 'image' && l.src && !l._img) {
        jobs.push(new Promise(function (res) { var im = new Image(); im.onload = function () { l._img = im; res(); }; im.onerror = function () { res(); }; im.src = l.src; }));
      } else if (l.type === 'video' && l.src && !l._vid) {
        jobs.push(new Promise(function (res) {
          var v = document.createElement('video');
          v.muted = true; v.playsInline = true; v.preload = 'auto'; v.loop = l.loop !== false; v.crossOrigin = 'anonymous';
          var done = false;
          function ok() { if (done) return; done = true; l._vid = v; if (l.w == null) l.w = v.videoWidth || 1280; if (l.h == null) l.h = v.videoHeight || 720; res(); }
          v.addEventListener('loadeddata', ok); v.addEventListener('canplay', ok);
          v.addEventListener('seeked', function () { if (MEDIA_HOOK) MEDIA_HOOK(); });
          v.onerror = function () { if (!done) { done = true; res(); } };
          v.src = l.src; setTimeout(ok, 6000);
        }));
      }
    });
    return jobs.length ? Promise.all(jobs) : Promise.resolve();
  }

  /* resolved animated value of a layer property at time t (base overridden by its track) */
  VideoComp.prototype.valueAt = function (layer, key, base, t) { return prop(layer, key, base, t); };

  /* axis-aligned bounding box of a layer at time t, in comp coords {x,y,w,h} (top-left + size) */
  VideoComp.prototype.bounds = function (layer, t) {
    var cx, cy;
    if (layer.path && layer.path.length > 1) { var pp = pathPos(layer.path, prop(layer, 'offset', 0, t)); cx = pp.x; cy = pp.y; }
    else { cx = prop(layer, 'x', this.w / 2, t); cy = prop(layer, 'y', this.h / 2, t); }
    var sc = prop(layer, 'scale', 1, t);
    var w, h;
    if (layer.type === 'text') {
      if (!this._mctx) { var mc = document.createElement('canvas'); this._mctx = mc.getContext('2d'); }
      var size = layer.size || 64;
      this._mctx.font = (layer.weight || 700) + ' ' + size + 'px ' + (layer.font || 'Inter, system-ui, sans-serif');
      w = this._mctx.measureText(layer.text || '').width; h = size * 1.2;
    } else if (layer.type === 'ellipse') {
      w = layer.w || 160; h = layer.h || layer.w || 160;
    } else { w = layer.w || 200; h = layer.h || 120; }
    w *= sc; h *= sc;
    return { x: cx - w / 2, y: cy - h / 2, w: w, h: h, cx: cx, cy: cy };
  };

  /* topmost layer id under comp-space point (cx,cy) at time t — for click-to-select */
  VideoComp.prototype.hitTest = function (cx, cy, t) {
    for (var i = this.layers.length - 1; i >= 0; i--) {
      var l = this.layers[i];
      if (l.start != null && t < l.start) continue;
      if (l.end != null && t > l.end) continue;
      if (prop(l, 'opacity', 1, t) <= 0.02) continue;
      var b = this.bounds(l, t);
      if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) return l.id;
    }
    return null;
  };

  VideoComp.prototype.addLayer = function (layer) {
    if (!layer.id) layer.id = 'L' + Date.now().toString(36) + Math.floor(Math.random() * 1e3);
    this.layers.push(layer);
    return layer.id;
  };
  VideoComp.prototype.removeLayer = function (id) {
    this.layers = this.layers.filter(function (l) { return l.id !== id; });
  };
  VideoComp.prototype.layer = function (id) { return this.layers.find(function (l) { return l.id === id; }); };

  /* set (or update) a keyframe for layer[id].tracks[key] at time t (seconds) — auto-keyframe */
  VideoComp.prototype.setKey = function (id, key, t, v, ease) {
    var l = this.layer(id); if (!l) return;
    if (!l.tracks) l.tracks = {};
    var tr = l.tracks[key] || (l.tracks[key] = []);
    var idx = -1;
    for (var i = 0; i < tr.length; i++) { if (Math.abs(tr[i].t - t) < 0.02) { idx = i; break; } }
    if (idx >= 0) { tr[idx].v = v; if (ease) tr[idx].ease = ease; }
    else { tr.push({ t: t, v: v, ease: ease || 'ease-out' }); tr.sort(function (a, b) { return a.t - b.t; }); }
  };
  VideoComp.prototype.clearTrack = function (id, key) { var l = this.layer(id); if (l && l.tracks) delete l.tracks[key]; };
  /* move an existing keyframe's time (no re-sort mid-drag → call sortKeys on drop) */
  VideoComp.prototype.moveKey = function (id, key, i, t) { var l = this.layer(id); if (l && l.tracks && l.tracks[key] && l.tracks[key][i]) l.tracks[key][i].t = Math.max(0, t); };
  VideoComp.prototype.sortKeys = function (id, key) { var l = this.layer(id); if (l && l.tracks && l.tracks[key]) l.tracks[key].sort(function (a, b) { return a.t - b.t; }); };
  /* every keyframe of a layer as flat {key,i,t} list — for the timeline/dopesheet */
  VideoComp.prototype.allKeys = function (id) {
    var l = this.layer(id), out = []; if (!l || !l.tracks) return out;
    Object.keys(l.tracks).forEach(function (key) { (l.tracks[key] || []).forEach(function (k, i) { out.push({ key: key, i: i, t: k.t, v: k.v }); }); });
    return out;
  };

  /* attach a motion path to a layer and seed an offset track so it travels the whole path over [from,to] */
  VideoComp.prototype.attachPath = function (id, path, from, to) {
    var l = this.layer(id); if (!l || !path || path.length < 2) return;
    l.path = path.map(function (p) { return { x: Math.round(p.x), y: Math.round(p.y) }; });
    if (!l.tracks) l.tracks = {};
    var a = from == null ? 0 : from, b = to == null ? this.duration() : to;
    l.tracks.offset = [{ t: a, v: 0 }, { t: b, v: 1, ease: 'ease-in-out' }];
  };
  VideoComp.prototype.detachPath = function (id) { var l = this.layer(id); if (!l) return; delete l.path; if (l.tracks) delete l.tracks.offset; };
  VideoComp.prototype.toJSON = function () {
    return { w: this.w, h: this.h, fps: this.fps, bg: this.bg, duration: this._duration || this.duration(),
      layers: this.layers.map(function (l) { var c = Object.assign({}, l); delete c._img; delete c._vid; return c; }) };
  };

  /* size a display <canvas> to the comp resolution and fit it into its CSS box (letterboxed) */
  VideoComp.prototype.mount = function (canvas) {
    canvas.width = this.w; canvas.height = this.h;
    canvas.style.aspectRatio = this.w + ' / ' + this.h;
    canvas.style.width = '100%'; canvas.style.height = 'auto';
    this._ctx = canvas.getContext('2d');
    this.seek(0);
    return this;
  };

  VideoComp.prototype.seek = function (t) {
    this._t = Math.max(0, Math.min(this.duration(), t));
    if (this.syncMedia) this.syncMedia(this._t, this._playing);
    if (this._ctx) this.renderFrame(this._ctx, this._t, this._editing, false, true);
    if (this.onframe) this.onframe(this._t);
  };
  VideoComp.prototype.redraw = function () { if (this._ctx) this.renderFrame(this._ctx, this._t, this._editing, false, true); };

  VideoComp.prototype.play = function () {
    if (this._playing || !this._ctx) return;
    this._playing = true;
    if (this.syncMedia) this.syncMedia(this._t, true);
    var self = this, dur = this.duration(), last = performance.now();
    if (this._t >= dur) this._t = 0;
    function loop(now) {
      if (!self._playing) return;
      var dt = (now - last) / 1000; last = now;
      self._t += dt;
      if (self._t >= dur) { self._t = dur; self.renderFrame(self._ctx, self._t, self._editing); if (self.onframe) self.onframe(self._t); self.pause(); return; }
      self.renderFrame(self._ctx, self._t, self._editing);
      if (self.onframe) self.onframe(self._t);
      self._raf = requestAnimationFrame(loop);
    }
    this._raf = requestAnimationFrame(loop);
  };

  VideoComp.prototype.pause = function () { this._playing = false; if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; if (this.syncMedia) this.syncMedia(this._t, false); };
  VideoComp.prototype.isPlaying = function () { return this._playing; };
  VideoComp.prototype.time = function () { return this._t; };

  /* ============================================================================
   * Movie — a sequence of scenes (each a VideoComp) with transitions between them.
   * Exposes the same interface the exporter/transport use (w/h/fps/duration/renderFrame/
   * mount/play/seek), so export.js works on a Movie unchanged.
   * ========================================================================== */
  function Movie(data) {
    data = data || {};
    this.scenes = (data.scenes || []).map(function (s) { return s instanceof VideoComp ? s : new VideoComp(s); });
    this.transitions = data.transitions || [];   // length scenes-1; {type:'cut'|'dissolve'|'push'|'fade', dur}
    // shared layers — drawn in selected scenes, sampled at movie-global time (e.g. one video background
    // spanning several scenes). scenes:null = every scene; z:'back' (default) behind content, 'front' on top.
    this.shared = (data.shared || []).map(function (l, i) { var c = Object.assign({}, l); if (!c.id) c.id = 'S' + i + '_' + Math.random().toString(36).slice(2, 6); if (c.scenes === undefined) c.scenes = null; return c; });
    var s0 = this.scenes[0];
    this.w = s0 ? s0.w : (data.w || 1280);
    this.h = s0 ? s0.h : (data.h || 720);
    this.fps = s0 ? s0.fps : (data.fps || 30);
    this._raf = 0; this._t = 0; this._playing = false; this.onframe = null; this._editing = false; this._editIdx = 0;
  }
  Movie.prototype._tr = function (i) { var t = this.transitions[i]; return (t && t.type !== 'cut' && t.dur) ? Math.max(0, t.dur) : 0; };
  Movie.prototype.starts = function () {
    var s = [0];
    for (var i = 1; i < this.scenes.length; i++) s[i] = s[i - 1] + this.scenes[i - 1].duration() - this._tr(i - 1);
    return s;
  };
  Movie.prototype.duration = function () {
    if (!this.scenes.length) return 1;
    var s = this.starts(), n = this.scenes.length - 1;
    return s[n] + this.scenes[n].duration();
  };
  Movie.prototype.activeIndex = function (t) {
    var s = this.starts(), idx = 0;
    for (var i = 0; i < s.length; i++) if (t >= s[i] - 1e-6) idx = i;
    return idx;
  };
  Movie.prototype._scratch = function () {
    if (!this._ca) { this._ca = document.createElement('canvas'); this._cb = document.createElement('canvas'); }
    this._ca.width = this.w; this._ca.height = this.h; this._cb.width = this.w; this._cb.height = this.h;
    return [this._ca.getContext('2d'), this._cb.getContext('2d')];
  };
  /* shared layers that participate in scene index i at the given z-order */
  Movie.prototype._sharedFor = function (i, z) {
    return (this.shared || []).filter(function (l) { if ((l.z || 'back') !== z) return false; if (!l.scenes) return true; return l.scenes.indexOf(i) >= 0; });
  };
  Movie.prototype._drawShared = function (ctx, layers, t) { for (var k = 0; k < layers.length; k++) paintLayer(ctx, layers[k], t, this.w, this.h); };
  /* composite scene i (with its shared back/front layers) into ctx; shared sampled at movie-global t */
  Movie.prototype._drawScene = function (ctx, i, t, overlay) {
    var s = this.starts(), backs = this._sharedFor(i, 'back'), fronts = this._sharedFor(i, 'front');
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, this.w, this.h); ctx.restore();
    this._drawShared(ctx, backs, t);
    this.scenes[i].renderFrame(ctx, t - s[i], overlay, backs.length > 0, false);   // skip scene bg when a shared background is present
    this._drawShared(ctx, fronts, t);
  };
  Movie.prototype.renderFrame = function (ctx, t, overlay) {
    var W = this.w, H = this.h, s = this.starts(), i = this.activeIndex(t);
    var inTrans = false, p = 0, ni = i + 1;
    if (i < this.scenes.length - 1) {
      var trDur = this._tr(i), winStart = s[i + 1];     // overlap window = [s[i+1], s[i]+d_i]
      if (trDur > 0 && t >= winStart) { inTrans = true; p = Math.min(1, (t - winStart) / trDur); }
    }
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (!inTrans) {
      this._drawScene(ctx, i, t, overlay && i === this._editIdx);
    } else {
      var cs = this._scratch(), ca = cs[0], cb = cs[1], type = (this.transitions[i] || {}).type || 'dissolve';
      this._drawScene(ca, i, t, false);
      this._drawScene(cb, ni, t, false);
      if (type === 'push') {
        ctx.drawImage(this._ca, -p * W, 0);
        ctx.drawImage(this._cb, (1 - p) * W, 0);
      } else if (type === 'fade') {                       // through black
        if (p < 0.5) { ctx.globalAlpha = 1 - p * 2; ctx.drawImage(this._ca, 0, 0); }
        else { ctx.globalAlpha = (p - 0.5) * 2; ctx.drawImage(this._cb, 0, 0); }
        ctx.globalAlpha = 1;
      } else {                                            // dissolve (crossfade)
        ctx.globalAlpha = 1 - p; ctx.drawImage(this._ca, 0, 0);
        ctx.globalAlpha = p; ctx.drawImage(this._cb, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  };
  Movie.prototype.preload = function () { return Promise.all(this.scenes.map(function (s) { return s.preload(); }).concat([preloadLayers(this.shared)])); };
  /* preview: sync the active scene's own videos (local t) + shared videos (global t) */
  Movie.prototype.syncMedia = function (t, playing) {
    var s = this.starts(), i = this.activeIndex(t);
    if (this.scenes[i]) this.scenes[i].syncMedia(t - s[i], playing);
    (this.shared || []).forEach(function (l) { if (l.type === 'video' && l._vid) syncVid(l, t, playing); });
  };
  /* export: seek the active scene's + shared videos to global t before drawing */
  Movie.prototype.seekMedia = function (t) {
    var s = this.starts(), i = this.activeIndex(t), jobs = [];
    if (this.scenes[i]) jobs.push(this.scenes[i].seekMedia(t - s[i]));
    if (i < this.scenes.length - 1) jobs.push(this.scenes[i + 1].seekMedia(t - s[i + 1]));   // incoming scene during a transition
    jobs.push(seekMediaLayers(this.shared, t));
    return Promise.all(jobs);
  };
  /* shared-layer management (used by the editor's "whole-film video background") */
  Movie.prototype.addShared = function (layer) { if (!layer.id) layer.id = 'S' + Date.now().toString(36) + Math.floor(Math.random() * 1e3); if (layer.scenes === undefined) layer.scenes = null; this.shared.push(layer); return layer.id; };
  Movie.prototype.removeShared = function (id) { this.shared = this.shared.filter(function (l) { return l.id !== id; }); };
  Movie.prototype.sharedLayer = function (id) { return this.shared.find(function (l) { return l.id === id; }); };
  Movie.prototype.setSharedScenes = function (id, arr) { var l = this.sharedLayer(id); if (!l) return; l.scenes = (arr && arr.length < this.scenes.length) ? arr.slice() : null; };
  Movie.prototype.mount = VideoComp.prototype.mount;
  Movie.prototype.seek = VideoComp.prototype.seek;
  Movie.prototype.redraw = VideoComp.prototype.redraw;
  Movie.prototype.play = VideoComp.prototype.play;
  Movie.prototype.pause = VideoComp.prototype.pause;
  Movie.prototype.isPlaying = VideoComp.prototype.isPlaying;
  Movie.prototype.time = VideoComp.prototype.time;
  Movie.prototype.editScene = function () { return this.scenes[this._editIdx]; };
  Movie.prototype.addScene = function (sceneData) {
    var sc = sceneData instanceof VideoComp ? sceneData : new VideoComp(sceneData || { w: this.w, h: this.h, fps: this.fps, bg: '#0b0b12', duration: 3, layers: [] });
    this.scenes.push(sc);
    if (this.scenes.length > 1) this.transitions[this.scenes.length - 2] = this.transitions[this.scenes.length - 2] || { type: 'dissolve', dur: 0.6 };
    return this.scenes.length - 1;
  };
  Movie.prototype.removeScene = function (idx) {
    this.scenes.splice(idx, 1); this.transitions.splice(Math.max(0, idx - 1), 1);
    if (this._editIdx >= this.scenes.length) this._editIdx = this.scenes.length - 1;
  };
  Movie.prototype.setTransition = function (gap, type, dur) {
    this.transitions[gap] = { type: type, dur: dur == null ? 0.6 : dur };
  };
  Movie.prototype.toJSON = function () {
    return { w: this.w, h: this.h, fps: this.fps, transitions: this.transitions,
      shared: (this.shared || []).map(function (l) { var c = Object.assign({}, l); delete c._img; delete c._vid; return c; }),
      scenes: this.scenes.map(function (s) { return s.toJSON(); }) };
  };

  global.MAVideo = { VideoComp: VideoComp, Movie: Movie, sample: sample, EASE: EASE, pathPos: pathPos, makeShapePath: makeShapePath, shapeFromPath: shapeFromPath,
    KINETIC: KINETIC, setMediaHook: function (fn) { MEDIA_HOOK = fn; } };
})(typeof window !== 'undefined' ? window : this);
