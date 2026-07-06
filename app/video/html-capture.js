/* motion-anything · HTML → video capture (in-browser, no server, no watermark)
 *
 * The HTML line ("component-level motion on a real page") can export its artifact to mp4.
 * How it works — the "freezable timeline" convention + a frame grabber:
 *   1. Every artifact ships window.__maTimeline (injected by MA_RUNTIME): seek(Tms) positions and
 *      PAUSES every entrance animation at global time T; duration() is the last animation's end.
 *   2. For each frame we seek the timeline, rasterize the live DOM to an <img> via the dependency-free
 *      SVG <foreignObject> trick, and hand it to the existing WebCodecs exporter (export.js) as a
 *      VideoComp-shaped adapter (w/h/fps/duration/seekMedia/renderFrame).
 *
 * Honest limitations (documented for the user): the foreignObject rasterizer captures CSS/DOM/SVG and
 * same-origin images, but NOT live <canvas>/WebGL/<video> backing stores or cross-origin images.
 * For WebGL / gaussian-splatting / video-heavy pages, use the canvas compositor (video line) or the
 * per-canvas captureStream path — see captureCanvasElement() below.
 */
import { exportMp4 } from './export.js';

/* Serialize a document's <body> (+ all its <style> rules) into an SVG data-URL that renders the DOM. */
function docToSvgUrl(doc, W, H) {
  var styleText = '';
  var styles = doc.querySelectorAll('style');
  for (var i = 0; i < styles.length; i++) styleText += styles[i].textContent + '\n';
  var body = doc.body.cloneNode(true);
  // scripts don't render and can break XML parsing; drop them
  var scr = body.querySelectorAll('script'); for (var j = 0; j < scr.length; j++) scr[j].remove();
  var bg = (doc.body && doc.defaultView) ? doc.defaultView.getComputedStyle(doc.body).backgroundColor : '';
  var bodyXml = new XMLSerializer().serializeToString(body);
  var wrap = '<div xmlns="http://www.w3.org/1999/xhtml" style="width:' + W + 'px;height:' + H + 'px;overflow:hidden;'
    + (bg && bg !== 'rgba(0, 0, 0, 0)' ? 'background:' + bg + ';' : '') + '">'
    + '<style>' + styleText.replace(/<\/style>/gi, '<\\/style>') + '</style>'
    + bodyXml + '</div>';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">'
    + '<foreignObject x="0" y="0" width="100%" height="100%">' + wrap + '</foreignObject></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function loadImage(url) {
  return new Promise(function (res, rej) {
    var img = new Image();
    img.onload = function () { res(img); };
    img.onerror = function () { rej(new Error('rasterize failed (cross-origin asset or invalid markup)')); };
    img.src = url;
  });
}

/* Build a VideoComp-shaped adapter over a live artifact document. */
export function HtmlComp(doc, opts) {
  opts = opts || {};
  var win = doc.defaultView || window;
  this.doc = doc;
  this.w = opts.w || (doc.documentElement && doc.documentElement.clientWidth) || win.innerWidth || 1280;
  this.h = opts.h || (doc.documentElement && doc.documentElement.clientHeight) || win.innerHeight || 720;
  this.fps = opts.fps || 30;
  var tl = win.__maTimeline;
  this._durMs = (tl && tl.duration && tl.duration()) || (opts.durationMs || 4000);
  this._pad = opts.padMs != null ? opts.padMs : 700;   // hold the final frame a beat
  this._img = null;
}
HtmlComp.prototype.duration = function () { return (this._durMs + this._pad) / 1000; };
HtmlComp.prototype.seekMedia = function (t) {
  var self = this, win = this.doc.defaultView || window;
  var Tms = Math.min(t * 1000, this._durMs);
  try { if (win.__maTimeline) win.__maTimeline.seek(Tms); } catch (e) {}
  return loadImage(docToSvgUrl(this.doc, this.w, this.h)).then(function (img) { self._img = img; })
    .catch(function () { /* keep the previous frame on a rasterize error */ });
};
HtmlComp.prototype.renderFrame = function (ctx, t) {
  ctx.save();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, this.w, this.h);
  if (this._img) { try { ctx.drawImage(this._img, 0, 0, this.w, this.h); } catch (e) {} }
  ctx.restore();
};

/* Public: export an artifact document to an mp4 Blob (reusing the WebCodecs pipeline). */
export async function captureHtmlToMp4(doc, opts, onProgress) {
  var comp = new HtmlComp(doc, opts);
  return exportMp4(comp, { fps: comp.fps, scale: (opts && opts.scale) || 1 }, onProgress);
}

/* Public: export an artifact document to an animated GIF Blob.
 * Same freezable-timeline frame grab as mp4; encoding via the vendored gifenc (MIT).
 * GIFs are palette media — default to 12fps and <=640px wide to keep files sane. */
export async function captureHtmlToGif(doc, opts, onProgress) {
  opts = opts || {};
  var mod = await import('./vendor/gifenc.js');
  var comp = new HtmlComp(doc, Object.assign({}, opts, { fps: opts.fps || 12 }));
  var fps = comp.fps;
  var scale = opts.scale || Math.min(1, 640 / comp.w);
  var W = Math.max(2, Math.round(comp.w * scale)), H = Math.max(2, Math.round(comp.h * scale));
  var canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var gif = mod.GIFEncoder();
  var total = Math.max(1, Math.ceil(comp.duration() * fps));
  for (var i = 0; i < total; i++) {
    var t = i / fps;
    await comp.seekMedia(t);
    ctx.save(); ctx.scale(scale, scale); comp.renderFrame(ctx, t); ctx.restore();
    var data = ctx.getImageData(0, 0, W, H).data;
    var palette = mod.quantize(data, 256);
    var index = mod.applyPalette(data, palette);
    gif.writeFrame(index, W, H, { palette: palette, delay: Math.round(1000 / fps) });
    if (onProgress) onProgress((i + 1) / total);
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

/* WebGL / animated-canvas path: a live <canvas> (incl. WebGL) CAN be captured via captureStream.
 * Returns a webm Blob. Use for gaussian-splatting / shader pages where the foreignObject grabber
 * cannot see the GL backing store. Records in real time for `seconds`. */
export function captureCanvasElement(canvas, seconds, mime) {
  return new Promise(function (res, rej) {
    if (!canvas.captureStream) { rej(new Error('canvas.captureStream unsupported')); return; }
    var type = mime || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm');
    var stream = canvas.captureStream(30);
    var chunks = [];
    var rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 12e6 });
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = function () { res(new Blob(chunks, { type: type })); };
    rec.onerror = function (e) { rej(e.error || e); };
    rec.start();
    setTimeout(function () { try { rec.stop(); } catch (e) { rej(e); } }, Math.max(500, (seconds || 5) * 1000));
  });
}
