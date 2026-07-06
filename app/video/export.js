/* motion-anything · video export (in-browser, no server, no watermark)
 * Renders a VideoComp frame-by-frame to a canvas, encodes with WebCodecs VideoEncoder,
 * and muxes to mp4 with the vendored mp4-muxer (MIT). Returns a Blob.
 *
 * Loaded as an ES module: import { exportMp4, canExport } from './export.js'
 */
import { Muxer, ArrayBufferTarget } from './vendor/mp4-muxer.js';

/* feature-detect: WebCodecs present? */
export function canExport() {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
}

/* pick the first H.264 codec string the platform can actually encode at this size/fps */
async function pickCodec(width, height, fps, bitrate) {
  var candidates = ['avc1.640028', 'avc1.4D0028', 'avc1.42E01E', 'avc1.42001f'];
  for (var i = 0; i < candidates.length; i++) {
    try {
      var res = await VideoEncoder.isConfigSupported({
        codec: candidates[i], width: width, height: height, bitrate: bitrate, framerate: fps
      });
      if (res && res.supported) return candidates[i];
    } catch (e) { /* try next */ }
  }
  return null;
}

/* exportMp4(comp, { fps, bitrate, scale }, onProgress) -> Promise<Blob>
 *   onProgress(p) — p in 0..1 */
export async function exportMp4(comp, opts, onProgress) {
  opts = opts || {};
  if (!canExport()) throw new Error('这个浏览器不支持 WebCodecs（请用较新的 Chrome/Edge）。');

  var fps = opts.fps || comp.fps || 30;
  var W = Math.round((comp.w || 1280) * (opts.scale || 1));
  var H = Math.round((comp.h || 720) * (opts.scale || 1));
  // even dimensions required by H.264
  if (W % 2) W++; if (H % 2) H++;
  var bitrate = opts.bitrate || Math.min(24e6, Math.max(2e6, Math.round(W * H * fps * 0.2)));

  var codec = await pickCodec(W, H, fps, bitrate);
  if (!codec) throw new Error('这个设备无法用 WebCodecs 编码 H.264。');

  var dur = comp.duration();
  var totalFrames = Math.max(1, Math.round(dur * fps));

  // offscreen render target at export resolution (don't disturb the live preview canvas)
  var canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d', { alpha: false });
  var sx = W / (comp.w || W), sy = H / (comp.h || H);

  var muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H, frameRate: fps },
    fastStart: 'in-memory'
  });

  var encoder = new VideoEncoder({
    output: function (chunk, meta) { muxer.addVideoChunk(chunk, meta); },
    error: function (e) { throw e; }
  });
  encoder.configure({ codec: codec, width: W, height: H, bitrate: bitrate, framerate: fps });

  var frameDurUs = Math.round(1e6 / fps);
  for (var i = 0; i < totalFrames; i++) {
    var t = i / fps;
    // seek any video layers to this frame's media time first (await the decoded frame)
    if (comp.seekMedia) { try { await comp.seekMedia(Math.min(t, dur)); } catch (e) {} }
    // render at comp space, scaled to export size
    ctx.save();
    if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
    comp.renderFrame(ctx, Math.min(t, dur));
    ctx.restore();

    var frame = new VideoFrame(canvas, { timestamp: i * frameDurUs, duration: frameDurUs });
    encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();

    if (onProgress) onProgress(i / totalFrames);
    // throttle so the encoder queue doesn't balloon memory
    if (encoder.encodeQueueSize > 8) {
      await new Promise(function (r) { setTimeout(r, 0); });
      while (encoder.encodeQueueSize > 4) { await new Promise(function (r) { setTimeout(r, 4); }); }
    }
  }

  await encoder.flush();
  muxer.finalize();
  if (onProgress) onProgress(1);

  var buf = muxer.target.buffer;
  return new Blob([buf], { type: 'video/mp4' });
}

/* convenience: export + trigger a browser download */
export async function exportAndDownload(comp, opts, onProgress, filename) {
  var blob = await exportMp4(comp, opts, onProgress);
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename || 'launch.mp4';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  return blob;
}
