#!/usr/bin/env node
/* motion-anything CLI (minimal, zero-dependency).
 * Commands:
 *   motion list                 List available motion recipes.
 *   motion add <recipe-id>      Export a recipe as a portable skill bundle.
 *   motion gallery              Open the possibility gallery in your browser.
 *
 * The repo root is resolved by walking up from this file, so it works whether run
 * locally (node cli/bin/motion.js) or installed.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(dir, 'recipes')) &&
      fs.existsSync(path.join(dir, 'MOTION-SPEC.md'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const REPO = findRepoRoot(__dirname) || findRepoRoot(process.cwd());

function fail(msg) {
  console.error('✗ ' + msg);
  process.exit(1);
}

if (!REPO) {
  fail(
    'Could not locate the motion-anything repo (no recipes/ + MOTION-SPEC.md found).\n' +
      '  Run from inside the repo, or: npx motion-anything <command>'
  );
}

const RECIPES_DIR = path.join(REPO, 'recipes');

/* --- tiny manifest reader (good enough for the few top-level scalar fields we need) --- */
function readManifest(file) {
  const text = fs.readFileSync(file, 'utf8');
  const grab = (key) => {
    const m = text.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'));
    return m ? m[1].trim() : '';
  };
  const grabList = (key) => {
    const m = text.match(new RegExp('^' + key + ':\\s*\\[(.*)\\]', 'm'));
    return m
      ? m[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  };
  return {
    file,
    dir: path.dirname(file),
    id: grab('id'),
    name: grab('name'),
    description: grab('description'),
    category: grab('category'),
    surfaces: grabList('surfaces'),
    tech: grabList('tech'),
  };
}

function allRecipes() {
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'recipe.motion.yaml') out.push(readManifest(full));
    }
  }
  if (fs.existsSync(RECIPES_DIR)) walk(RECIPES_DIR);
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

function cmdList() {
  const recipes = allRecipes();
  if (!recipes.length) {
    console.log('No recipes yet. Add one under recipes/<surface>/<id>/ (see AGENTS.md).');
    return;
  }
  console.log('\n✨ motion-anything — ' + recipes.length + ' recipe(s)\n');
  for (const r of recipes) {
    const surf = r.surfaces.length ? '[' + r.surfaces.join(', ') + ']' : '';
    console.log('  ' + r.id.padEnd(22) + (r.category || '').padEnd(20) + surf);
    if (r.description) console.log('  ' + ' '.repeat(22) + r.description.replace(/\s+/g, ' '));
    console.log('');
  }
  console.log('Reuse one in your agent:  motion add <id>');
  console.log('See them in motion:       motion gallery\n');
}

function cmdAdd(id) {
  if (!id) fail('Usage: motion add <recipe-id>   (try: motion list)');
  const r = allRecipes().find((x) => x.id === id);
  if (!r) fail('Unknown recipe "' + id + '". Run: motion list');

  const destRoot = path.join(process.cwd(), 'motion-skills', id);
  fs.mkdirSync(destRoot, { recursive: true });

  let copied = 0;
  for (const f of fs.readdirSync(r.dir)) {
    if (f === 'recipe.motion.yaml') continue; // manifest is for the library, not the bundle
    fs.copyFileSync(path.join(r.dir, f), path.join(destRoot, f));
    copied++;
  }
  console.log('\n✓ Exported "' + id + '" as a skill bundle (' + copied + ' files):');
  console.log('  ' + path.relative(process.cwd(), destRoot));
  console.log('\nHand it to your AI agent:');
  console.log('  • Claude Code / Cursor / Codex: point the agent at the SKILL.md in that folder,');
  console.log('    or copy the folder into your agent\'s skills directory.');
  console.log('  • Then just say what you want, e.g. "use ' + id + ' on this page".\n');
}

function openInBrowser(target) {
  const platform = process.platform;
  const cmd =
    platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  const child =
    platform === 'win32'
      ? spawn('cmd', ['/c', 'start', '', target], { stdio: 'ignore', detached: true })
      : spawn(cmd, [target], { stdio: 'ignore', detached: true });
  child.on('error', () => {
    console.log('Open this in your browser:\n  ' + target);
  });
  child.unref();
}

function cmdGallery() {
  const gallery = path.join(REPO, 'gallery', 'index.html');
  if (!fs.existsSync(gallery)) fail('gallery/index.html not found.');
  console.log('Opening the possibility gallery…\n  ' + gallery);
  openInBrowser(gallery);
}

function cmdServe(portArg) {
  const http = require('http');
  const https = require('https');
  const os = require('os');
  const appDir = path.join(REPO, 'app');
  if (!fs.existsSync(appDir)) fail('app/ not found.');
  const port = parseInt(portArg, 10) || 4321;
  const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2',
  };

  /* ---------- local-CLI engine: scan installed CLIs + generate via headless CLI ---------- */
  const { execSync, execFileSync, spawnSync } = require('child_process');
  /* Engine definitions. Each entry says HOW to drive that agent headlessly (mirrors the runtime
   * defs in open-design's apps/daemon/src/runtimes/defs/):
   *   mode 'claude' = claude-style `-p --output-format stream-json` (Claude Code only)
   *   mode 'events' = JSONL event stream; `family` picks the per-CLI parser (codex / cursor / opencode)
   *   mode 'plain'  = raw text on stdout (grok-build wants the prompt via --prompt-file; gemini via stdin)
   *   mode 'acp'    = ACP JSON-RPC over stdio (Open Design Cloud via vela, Hermes)
   * `bins` = candidate binary names probed in order (first found wins). */
  const KNOWN_CLIS = [
    { id: 'claude', name: 'Claude Code', vendor: 'Anthropic', mode: 'claude' },
    { id: 'codex', name: 'Codex CLI', vendor: 'OpenAI', mode: 'events', family: 'codex',
      // The app uses Codex as a headless text generator; avoid user MCP/hook config that can block unrelated HTML edits.
      args: ['exec', '--json', '--skip-git-repo-check', '--ignore-user-config', '--sandbox', 'workspace-write', '-c', 'sandbox_workspace_write.network_access=true'],
      cwdFlag: '-C' },
    { id: 'cursor-agent', name: 'Cursor Agent', vendor: 'Cursor', mode: 'events', family: 'cursor',
      args: ['--print', '--output-format', 'stream-json', '--force'], cwdFlag: '--workspace' },
    { id: 'opencode', name: 'OpenCode', vendor: 'OpenCode', bins: ['opencode', 'opencode-cli'], mode: 'events', family: 'opencode',
      args: ['run', '--format', 'json'] },
    { id: 'grok-build', name: 'Grok Build', vendor: 'xAI', bins: ['grok'], mode: 'plain', promptViaFile: '--prompt-file' },
    { id: 'hermes', name: 'Hermes', vendor: 'xAI', mode: 'acp', args: ['acp', '--accept-hooks'] },
    { id: 'gemini', name: 'Gemini CLI', vendor: 'Google', mode: 'plain' },
    // Open Design Cloud (formerly AMR) — the `vela` CLI starts a private OpenCode server and
    // bridges it over ACP. id stays 'amr' so saved selections/configs keep working.
    { id: 'amr', bins: ['vela'], name: 'Open Design Cloud', vendor: 'nexu.io', mode: 'acp',
      args: ['agent', 'run', '--runtime', 'opencode'] },
    // BYOK — direct hosted-API calls with the user's own key (no CLI). "installed" = key configured.
    { id: 'byok', name: 'BYOK API', vendor: 'Anthropic / OpenAI / Google', mode: 'byok' },
  ];
  function engineDef(cli) {
    return KNOWN_CLIS.find(function (c) { return c.id === cli; }) || null;
  }
  function firstResolvedBin(out) {
    var lines = String(out || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) return '';
    if (process.platform === 'win32') {
      var runnable = /\.(?:cmd|bat|exe|com)$/i;
      for (var i = 0; i < lines.length; i++) { if (runnable.test(lines[i])) return lines[i]; }
    }
    return lines[0];
  }
  function whichBin(bin) {
    try {
      if (process.platform === 'win32') {
        return firstResolvedBin(execFileSync('where.exe', [bin], { stdio: ['ignore', 'pipe', 'ignore'] }));
      }
      return execSync('command -v ' + bin, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    }
    catch (e) { return ''; }
  }
  function resolveEngineBin(def) {
    var cands = def.bins || [def.id];
    for (var i = 0; i < cands.length; i++) {
      var found = whichBin(cands[i]);
      if (found) return found;
    }
    return cands[0];
  }
  function resolveNamedBin(cli, fallback) {
    var id = (cli && /^[a-z0-9-]+$/.test(cli)) ? cli : fallback;
    var def = engineDef(id);
    return def ? resolveEngineBin(def) : (whichBin(id) || id);
  }
  function quoteCmdArg(arg) {
    return '"' + String(arg).replace(/"/g, '\\"') + '"';
  }
  function spawnCli(bin, args, opts) {
    opts = Object.assign({}, opts || {});
    if (process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(bin)) {
      opts.windowsVerbatimArguments = true;
      var cmdLine = '"' + [bin].concat(args || []).map(quoteCmdArg).join(' ') + '"';
      return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', cmdLine], opts);
    }
    return spawn(bin, args, opts);
  }
  function killCli(child, signal) {
    if (!child) return;
    if (process.platform === 'win32' && child.pid) {
      try { spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); return; } catch (e) {}
    }
    try { child.kill(signal || 'SIGKILL'); } catch (e) {}
  }
  function scanClis() {
    return KNOWN_CLIS.map(function (c) {
      if (c.mode === 'byok') {
        var bc = readByokConfig();
        return Object.assign({}, c, { path: bc.key ? '(hosted API · ' + (bc.provider || 'anthropic') + ')' : '', installed: !!bc.key, provider: bc.provider || 'anthropic' });
      }
      var cands = c.bins || [c.id], found = '';
      for (var i = 0; i < cands.length && !found; i++) found = whichBin(cands[i]);
      return Object.assign({}, c, { path: found, installed: !!found });
    });
  }
  // Read a brand spec (DESIGN.md) by id — checks the bundled systems first, then imported user plugins.
  function readDesignSystem(id) {
    if (!/^[A-Za-z0-9_-]+$/.test(String(id || ''))) return null;
    const roots = [path.join(appDir, 'design-systems'), path.join(appDir, 'user-plugins')];
    for (const root of roots) {
      const file = path.join(root, id, 'DESIGN.md');
      if (path.dirname(path.dirname(file)) !== root) continue;
      try { return fs.readFileSync(file, 'utf8'); } catch (e) {}
    }
    return null;
  }
  // ----- imported user plugins (design systems / motion recipes) -----
  const USER_PLUGINS_DIR = path.join(appDir, 'user-plugins');
  function grabField(text, key) {
    const m = String(text).match(new RegExp('^\\s*' + key + '\\s*:\\s*(.+)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
  }
  function pluginMeta(id) {
    const dir = path.join(USER_PLUGINS_DIR, id);
    const has = (f) => fs.existsSync(path.join(dir, f));
    if (has('DESIGN.md')) {
      let name = id, tagline = '', color = '#8b7cf6', category = '';
      try { const man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')); name = man.name || name; category = man.category || ''; } catch (e) {}
      try {
        const d = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8');
        if (name === id) { const h = d.match(/^#\s+(.+)$/m); if (h) name = h[1].replace(/^design system\s+(inspired by|based on)\s+/i, '').trim(); }
        for (const ln of d.split('\n')) { const m = ln.match(/^>\s*(.+)$/); if (m && !/^category:/i.test(m[1].trim())) { tagline = m[1].trim(); break; } }
      } catch (e) {}
      try { const tk = (JSON.parse(fs.readFileSync(path.join(dir, 'design-tokens.json'), 'utf8')).tokens) || [];
        const a = tk.find((t) => t.name === '--accent'); if (a && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(a.value)) color = a.value; } catch (e) {}
      return { kind: 'design', id, name, tagline, color, category };
    }
    let spec = '';
    if (has('recipe.motion.yaml')) { try { spec = fs.readFileSync(path.join(dir, 'recipe.motion.yaml'), 'utf8'); } catch (e) {} }
    else if (has('SKILL.md')) { try { spec = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'); } catch (e) {} }
    if (spec) {
      return { kind: 'motion', id, name: grabField(spec, 'name') || id,
        desc: grabField(spec, 'description') || grabField(spec, 'desc') || '',
        cat: grabField(spec, 'category') || grabField(spec, 'intent') || 'entrance',
        surfaces: ['web'], target: [], tags: [], status: 'ready' };
    }
    return null;
  }
  function listUserPlugins() {
    const out = { designSystems: [], motions: [] };
    if (!fs.existsSync(USER_PLUGINS_DIR)) return out;
    for (const d of fs.readdirSync(USER_PLUGINS_DIR, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const m = pluginMeta(d.name); if (!m) continue;
      (m.kind === 'design' ? out.designSystems : out.motions).push(m);
    }
    return out;
  }
  function importPlugin(name, files, cb) {
    let base = String(name || 'plugin').split('/').pop().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'plugin';
    let id = base, dir = path.join(USER_PLUGINS_DIR, id), n = 1;
    while (fs.existsSync(dir)) { id = base + '-' + (++n); dir = path.join(USER_PLUGINS_DIR, id); }
    let total = 0;
    try {
      fs.mkdirSync(dir, { recursive: true });
      for (const f of (files || [])) {
        const parts = String(f.path || '').split('/');
        const rel = parts.length > 1 ? parts.slice(1).join('/') : parts[0];   // drop the top folder segment
        if (!rel || rel.indexOf('..') >= 0 || rel.charAt(0) === '/') continue;
        const dest = path.join(dir, rel);
        if (dest !== dir && !dest.startsWith(dir + path.sep)) continue;
        total += Buffer.byteLength(String(f.content || ''));
        if (total > 8 * 1024 * 1024) throw new Error('plugin too large');
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, String(f.content || ''));
      }
    } catch (e) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {} return cb(e); }
    const meta = pluginMeta(id);
    if (!meta) { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
      return cb(new Error('not a recognizable plugin (need DESIGN.md, recipe.motion.yaml, or SKILL.md)')); }
    cb(null, { id, type: meta.kind, name: meta.name });
  }

  // ----- import a plugin straight from GitHub (Contents API → fetch only the subpath, pure Node) -----
  const PLUG_TEXT_RE = /\.(md|markdown|json|ya?ml|css|js|mjs|ts|txt|html?|svg|csv)$/i;
  function httpsGet(url, cb, redirects) {
    redirects = redirects || 0;
    const req = https.get(url, { headers: { 'User-Agent': 'motion-anything', 'Accept': 'application/vnd.github+json' } }, function (res) {
      if ([301, 302, 307, 308].indexOf(res.statusCode) >= 0 && res.headers.location && redirects < 4) {
        res.resume(); return httpsGet(res.headers.location, cb, redirects + 1);
      }
      let data = ''; res.on('data', (d) => (data += d)); res.on('end', () => cb(null, res.statusCode, data));
    });
    req.on('error', (e) => cb(e));
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  }
  function httpsGetP(url) { return new Promise((resolve, reject) => httpsGet(url, (e, s, b) => (e ? reject(e) : resolve({ status: s, body: b })))); }
  function parseGithub(src) {
    src = String(src || '').trim();
    let m = src.match(/^github:([^/\s]+)\/([^/@\s]+)(?:@([^/\s]+))?(?:\/(.+))?$/);
    if (!m) m = src.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?(?:\/tree\/([^/\s]+)(?:\/(.+))?)?\/?$/);
    if (!m) return null;
    return { owner: m[1], repo: m[2], ref: m[3] || '', subpath: (m[4] || '').replace(/\/+$/, '') };
  }
  async function ghContents(g, p) {
    let url = 'https://api.github.com/repos/' + g.owner + '/' + g.repo + '/contents/' +
      p.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    if (g.ref) url += '?ref=' + encodeURIComponent(g.ref);
    const r = await httpsGetP(url);
    if (r.status === 404) throw new Error('not found on GitHub (check owner/repo/ref/subpath)');
    if (r.status === 403) throw new Error('GitHub rate limit reached — try again later');
    if (r.status !== 200) throw new Error('GitHub error ' + r.status);
    return JSON.parse(r.body);
  }
  async function fetchGithubPlugin(source) {
    const g = parseGithub(source);
    if (!g) throw new Error('unrecognized source — use github:owner/repo[@ref][/subpath]');
    const top = g.subpath ? g.subpath.split('/').pop() : g.repo;
    const files = []; let total = 0;
    async function walk(p) {
      const items = await ghContents(g, p);
      const arr = Array.isArray(items) ? items : [items];
      for (const it of arr) {
        if (files.length >= 200) break;
        if (it.type === 'dir') { await walk(it.path); }
        else if (it.type === 'file' && PLUG_TEXT_RE.test(it.name) && it.size <= 512 * 1024 && it.download_url) {
          const r = await httpsGetP(it.download_url);
          if (r.status === 200) {
            total += Buffer.byteLength(r.body);
            if (total > 8 * 1024 * 1024) throw new Error('plugin too large');
            const rel = g.subpath ? it.path.slice(g.subpath.length).replace(/^\/+/, '') : it.path;
            files.push({ path: top + '/' + rel, content: r.body });
          }
        }
      }
    }
    await walk(g.subpath || '');
    if (!files.length) throw new Error('no plugin files found at that path');
    return { name: top, files };
  }

  // ----- import a plugin from an uploaded .zip (base64) — extracted with the system `unzip` -----
  function importZip(zipName, zipB64, cb) {
    let buf;
    try { buf = Buffer.from(String(zipB64 || ''), 'base64'); } catch (e) { return cb(new Error('bad zip data')); }
    if (!buf.length) return cb(new Error('empty zip'));
    if (buf.length > 8 * 1024 * 1024) return cb(new Error('zip too large (max 8MB)'));
    let tmp;
    try { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-zip-')); } catch (e) { return cb(e); }
    const cleanup = () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {} };
    try {
      const zipPath = path.join(tmp, 'plugin.zip');
      const outDir = path.join(tmp, 'out');
      fs.writeFileSync(zipPath, buf);
      fs.mkdirSync(outDir, { recursive: true });
      try { require('child_process').execFileSync('unzip', ['-o', '-q', zipPath, '-d', outDir], { stdio: 'ignore' }); }
      catch (e) { cleanup(); return cb(new Error('could not unzip (is `unzip` installed?)')); }
      // strip a single common top-level folder (mac "Compress" makes one); ignore __MACOSX
      let entries = fs.readdirSync(outDir).filter((n) => n !== '__MACOSX');
      let root = outDir, top;
      if (entries.length === 1 && fs.statSync(path.join(outDir, entries[0])).isDirectory()) {
        root = path.join(outDir, entries[0]); top = entries[0];
      } else { top = String(zipName || 'plugin').replace(/\.zip$/i, ''); }
      const files = [];
      (function walk(dir, rel) {
        for (const n of fs.readdirSync(dir)) {
          if (n === '__MACOSX' || n.charAt(0) === '.') continue;
          const full = path.join(dir, n), r = rel ? rel + '/' + n : n;
          const st = fs.statSync(full);
          if (st.isDirectory()) { walk(full, r); }
          else if (PLUG_TEXT_RE.test(n) && st.size <= 512 * 1024 && files.length < 200) {
            files.push({ path: top + '/' + r, content: fs.readFileSync(full, 'utf8') });
          }
        }
      })(root, '');
      cleanup();
      if (!files.length) return cb(new Error('no plugin files found in the zip'));
      importPlugin(top, files, cb);
    } catch (e) { cleanup(); cb(e); }
  }

  // Motion profiles = the "how it moves" axis (parallel to the design system's "how it looks").
  const MOTION_DEFAULT = '- Tasteful motion, animating transform/opacity only for 60fps: a short staggered fade+rise entrance on load; scroll-reveal for sections as they enter view; a magnetic primary button that leans toward the cursor; and at most ONE celebratory delight moment (e.g. a like burst). Durations 200-600ms, ease-out.';
  const MOTION_PROFILES = {
    subtle:    '- MOTION PROFILE = Subtle: minimal, restrained motion. Short quick fades only (120-260ms, ease-out). No travel-heavy entrances, no bounce, no particles. Lean toward stillness; animate only where it aids clarity.',
    lively:    '- MOTION PROFILE = Lively: energetic, confident motion. Staggered entrances with a bit more travel, springy easing (cubic-bezier(.34,1.56,.64,1)) on key elements, hover micro-interactions, and two small delightful moments. Durations 220-520ms.',
    playful:   '- MOTION PROFILE = Playful: characterful, fun motion. Bouncy spring easing, pop/wobble on interactions, a confetti-style delight on a primary action. Keep it fun but still GPU-safe (transform/opacity) and not constantly moving.',
    cinematic: '- MOTION PROFILE = Cinematic: slow, dramatic motion. Deliberate reveals (500-900ms, ease-in-out), layered/parallax-feel scroll reveals, one strong hero entrance. Fewer but bigger moments; no busy micro-motion.',
    none:      '- MOTION PROFILE = Static: essentially no animation. No entrance animations, no particles, no parallax. Only essential state transitions (<=150ms). Treat the page as if prefers-reduced-motion is always on.'
  };
  function motionLine(motionProfile) { return MOTION_PROFILES[motionProfile] || MOTION_DEFAULT; }
  // OD design-templates (HTML prototypes + decks) — match a brief to a proven single-file structure.
  var HTML_TEMPLATES = (function () {
    try { return JSON.parse(fs.readFileSync(path.join(appDir, 'data', 'html-templates.json'), 'utf8')).templates || []; }
    catch (e) { return []; }
  })();
  function matchHtmlTemplates(brief, n) {
    if (!HTML_TEMPLATES.length) return [];
    var text = String(brief || '').toLowerCase();
    var words = text.split(/[^a-z0-9一-鿿]+/).filter(function (w) { return w.length > 2; });
    var scored = HTML_TEMPLATES.map(function (t) {
      var hay = (t.title + ' ' + t.summary + ' ' + (t.tags || []).join(' ') + ' ' + t.category).toLowerCase();
      var score = 0; words.forEach(function (w) { if (hay.indexOf(w) >= 0) score++; });
      (t.tags || []).forEach(function (tg) { if (tg && text.indexOf(String(tg).toLowerCase()) >= 0) score += 2; }); // exact trigger hit weighs more
      return { t: t, score: score };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, n || 2).map(function (x) { return x.t; });
  }
  function buildPrompt(brief, designSystem, motionProfile) {
    const ds = readDesignSystem(designSystem);
    const tpls = matchHtmlTemplates(brief, 2);
    const visualLine = ds
      ? '- Follow the DESIGN SYSTEM below EXACTLY — its palette, typography, spacing, radii, shadows, and voice. Use its real hex values and fonts. Real, plausible copy (no lorem ipsum).'
      : '- Modern, clean, restrained visual design. Light theme. System font stack. Real, plausible copy (no lorem ipsum).';
    return [
      'You are motion-anything, an expert at tasteful, restrained web motion.',
      'Produce a COMPLETE, self-contained, single-file HTML document (inline <style> and <script>, NO external dependencies, NO CDN links, NO frameworks) for this request:',
      '',
      '"""' + brief + '"""',
      '',
      'Requirements:',
      visualLine,
      motionLine(motionProfile),
      (tpls.length ? ('- REFERENCE STRUCTURE (a proven single-file layout that fits this brief — adapt the best-fitting one\'s STRUCTURE & sections, do NOT copy it verbatim, keep it on-brand): ' + tpls.map(function (t) { return t.title + ' — ' + t.summary; }).join('  ||  ')) : ''),
      '- MUST include a prefers-reduced-motion fallback that disables travel and particles.',
      '- Output ONLY the HTML document, starting exactly with <!doctype html>. No prose, no markdown code fences.',
      (ds ? '\n— DESIGN SYSTEM (follow exactly) —\n"""\n' + ds + '\n"""' : ''),
    ].filter(Boolean).join('\n');
  }
  function extractHtml(out) {
    let s = String(out);
    const fence = s.match(/```html\s*([\s\S]*?)```/i) || s.match(/```\s*([\s\S]*?)```/);
    if (fence) s = fence[1];
    const i = s.search(/<!doctype html>|<html[\s>]/i);
    if (i >= 0) s = s.slice(i);
    return s.trim();
  }
  // Strip harness-injected auth/session vars so the spawned CLI uses the user's own stored login.
  function cleanEnv() {
    const e = Object.assign({}, process.env);
    Object.keys(e).forEach(function (k) {
      if (/^(ANTHROPIC_|CLAUDE_CODE|CLAUDECODE|CLAUDE_AGENT|CLAUDE_EFFORT|AI_AGENT|BAGGAGE)/.test(k)) delete e[k];
    });
    return e;
  }
  function runGenerate(brief, cli, designSystem, motionProfile, cb) {
    // provider-agnostic: claude-style `-p` CLIs and AMR (ACP) both resolve to raw text here
    runAgentText(buildPrompt(brief, designSystem, motionProfile), cli, 240000, function (e, out, err) {
      if (e) return cb(e);
      const html = extractHtml(out);
      if (!/<html|<!doctype/i.test(html)) return cb(new Error('No HTML produced. ' + (err || out).slice(0, 240)));
      const slug = 'gen-' + Date.now();
      const dir = path.join(appDir, 'projects', slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      // record a little metadata so the history list can show a real title
      try {
        fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({
          slug: slug, brief: String(brief || '').slice(0, 300), cli: cli || 'claude',
          designSystem: designSystem || null, motionProfile: motionProfile || null, created: Date.now()
        }, null, 2));
      } catch (e) {}
      cb(null, { slug: slug, path: 'projects/' + slug + '/index.html', bytes: html.length });
    });
  }

  function buildEditPrompt(currentHtml, instruction, scope, designSystem, motionProfile) {
    const ds = readDesignSystem(designSystem);
    const mp = MOTION_PROFILES[motionProfile];
    return [
      'You are motion-anything, an expert at tasteful, restrained web motion and clean web design.',
      'Below is the CURRENT complete single-file HTML document for a page. Apply the user\'s requested change and return the FULL updated document.',
      '',
      'Rules:',
      '- Preserve everything not related to the request (structure, copy, layout, styles, scripts). Make the smallest change that satisfies the request.',
      '- Keep it a COMPLETE self-contained single-file document: inline <style>/<script>, NO external dependencies, NO CDN, NO frameworks.',
      '- Keep motion tasteful and GPU-safe (transform/opacity, 200-600ms, ease-out) and KEEP the existing prefers-reduced-motion fallback.',
      (mp ? '- Any motion you add or change must match this ' + mp.replace(/^-\s*/, '') : ''),
      (ds ? '- Keep the page consistent with the DESIGN SYSTEM below (palette, typography, spacing, radii, voice). Any new or changed UI must use its real hex values and fonts.' : ''),
      (scope ? '- IMPORTANT: only change the following part of the page, leave the rest untouched: ' + scope : ''),
      '',
      'USER REQUEST:',
      '"""' + instruction + '"""',
      '',
      'CURRENT HTML:',
      '"""',
      currentHtml,
      '"""',
      (ds ? '\n— DESIGN SYSTEM (stay consistent with it) —\n"""\n' + ds + '\n"""' : ''),
      '',
      'Output ONLY the full updated HTML document, starting exactly with <!doctype html>. No prose, no markdown code fences.',
    ].filter(Boolean).join('\n');
  }
  function projectMeta(slug) {
    const dir = safeProjectDir(slug); if (!dir) return {};
    try { return JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (e) { return {}; }
  }
  function runEdit(slug, instruction, cli, scope, designSystem, motionProfile, cb) {
    const dir = safeProjectDir(slug);
    const idx = dir && path.join(dir, 'index.html');
    if (!dir || !fs.existsSync(idx)) return cb(new Error('project not found: ' + slug));
    let current = '';
    try { current = fs.readFileSync(idx, 'utf8'); } catch (e) { return cb(e); }
    const meta = projectMeta(slug);
    const ds = designSystem || meta.designSystem || '';            // fall back to the project's own brand
    const mp = motionProfile || meta.motionProfile || '';          // …and its own motion profile
    runAgentText(buildEditPrompt(current, instruction, scope, ds, mp), cli, 240000, function (e, out, err) {
      if (e) return cb(e);
      const html = extractHtml(out);
      if (!/<html|<!doctype/i.test(html)) return cb(new Error('No HTML produced. ' + (err || out).slice(0, 240)));
      fs.writeFileSync(idx, html);
      cb(null, { slug: slug, path: 'projects/' + slug + '/index.html', bytes: html.length });
    });
  }

  // A5 fallback: turn a free-form motion request into ONE component animation as strict JSON.
  function buildMotionPrompt(instruction, component, triggers, effects) {
    return [
      'You are motion-anything. Convert the user request into ONE component animation, as STRICT JSON only.',
      'Target component: "' + component + '".',
      'Allowed "trigger" values: ' + triggers.join(', ') + '.',
      'Allowed "effect" values: ' + effects.join(', ') + '.',
      'Compatibility: hover/click triggers may ONLY use reaction effects (pop, pulse, shake, wobble, sink). load/scroll may use any effect.',
      'Allowed "easing": ease-out, ease-in-out, bounce, linear, spring.',
      'Numeric ranges: duration 100-1500 (ms), delay 0-800 (ms), distance 0-80 (px).',
      'USER REQUEST: """' + instruction + '"""',
      'Output ONLY one JSON object, e.g. {"trigger":"hover","effect":"pop","duration":420,"easing":"spring","delay":0,"distance":12}. No prose, no markdown fences.'
    ].join('\n');
  }
  function runMotionSuggest(body, cb) {
    runAgentText(buildMotionPrompt(String(body.instruction || ''), String(body.component || 'element'), body.triggers || [], body.effects || []), body.cli, 120000, function (e, out, err) {
      if (e) return cb(e);
      const m = String(out).match(/\{[\s\S]*\}/);
      if (!m) return cb(new Error('no JSON from agent. ' + (err || out).slice(0, 160)));
      let j; try { j = JSON.parse(m[0]); } catch (e2) { return cb(new Error('bad JSON from agent')); }
      cb(null, j);
    });
  }

  // V6: replicate a reference clip's motion into an editable canvas-video composition (JSON).
  function buildReplicatePrompt(meta, framePaths) {
    return [
      'You are a motion designer recreating a reference video clip as an EDITABLE composition.',
      'Here are sampled frames in time order (local file paths you can open):',
      framePaths.map(function (p, i) { return 'Frame ' + (i + 1) + ': ' + p; }).join('\n'),
      'The clip is about ' + Math.round(meta.w) + 'x' + Math.round(meta.h) + ', ~' + Number(meta.duration || 3).toFixed(1) + 's.',
      'Recreate its overall motion (entrances, movement, emphasis) for our canvas video engine.',
      'Output ONLY ONE JSON object — no prose, no markdown fence.',
      'Schema: {"w":int,"h":int,"fps":30,"bg":"#hex","duration":seconds,"layers":[',
      '  {"type":"text|rect|ellipse","text":"...","size":px,"weight":700,"color":"#hex","fill":"#hex",',
      '   "w":px,"h":px,"radius":px,"x":centerPx,"y":centerPx,"opacity":1,',
      '   "tracks":{"x":[{"t":sec,"v":num}],"y":[...],"scale":[...],"rotate":[...],"opacity":[...]}}',
      ']}',
      'Rules: only those layer types and track props; keyframe t in seconds within duration; x/y are the layer CENTER in comp pixels; keep it tasteful and minimal (≤6 layers); match colors and timing you see.'
    ].join('\n');
  }
  function runReplicate(body, cb) {
    var frames = Array.isArray(body.frames) ? body.frames.slice(0, 10) : [];
    if (!frames.length) return cb(new Error('no frames'));
    var tmp;
    try { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-ref-')); } catch (e) { return cb(e); }
    var paths = [];
    try {
      frames.forEach(function (d, i) {
        var m = String(d).match(/^data:image\/\w+;base64,(.+)$/); if (!m) return;
        var buf = Buffer.from(m[1], 'base64'); if (buf.length > 1.5e6) return;   // cap each frame
        var fp = path.join(tmp, 'frame' + i + '.jpg'); fs.writeFileSync(fp, buf); paths.push(fp);
      });
    } catch (e) { /* fall through with whatever wrote */ }
    if (!paths.length) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} return cb(new Error('could not decode frames')); }
    runAgentText(buildReplicatePrompt(body, paths), body.cli, 180000, function (e, out, err) {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
      if (e) return cb(e);
      var mm = String(out).match(/\{[\s\S]*\}/);
      if (!mm) return cb(new Error('no JSON from agent. ' + (err || out).slice(0, 160)));
      var j; try { j = JSON.parse(mm[0]); } catch (e2) { return cb(new Error('bad JSON from agent')); }
      cb(null, j);
    });
  }

  // W5: generate / chat-edit a canvas-video composition (JSON) via claude.
  var VIDEO_SCHEMA = '{"w":1280,"h":720,"fps":30,'
    + '"transitions":[{"type":"cut|dissolve|push|fade","dur":0.6}],   // length = scenes-1; the transition BETWEEN consecutive scenes\n'
    + '"scenes":[{"bg":"#hex","duration":sec,"layers":[\n'
    + '  {"type":"text","text":"Line one\\nLine two","size":px,"weight":400-800,"color":"#hex","font":"Inter, sans-serif","align":"center|left|right","x":centerPx,"y":centerPx,\n'
    + '     "kinetic":{"type":"char-rise|char-fade|char-pop|char-drop|char-blur|char-flip|char-spin|typewriter|wave|word-rise|word-fade|word-pop|word-blur","stagger":0.04,"dur":0.5,"start":0},\n'
    + '     "tracks":{"opacity":[{"t":sec,"v":0-1,"ease":"ease-out"}],"y":[{"t":0,"v":..},{"t":0.5,"v":..,"ease":"ease-out"}],"x":[],"scale":[],"rotate":[],"offset":[]}},\n'
    + '  {"type":"rect|ellipse","fill":"#hex","w":px,"h":px,"radius":px,"x":centerPx,"y":centerPx,"tracks":{...}},\n'
    + '  {"type":"image","src":"https://...","w":px,"h":px,"x":centerPx,"y":centerPx,"tracks":{...}}\n'
    + ']}]}\n'
    + '// ease values: linear | ease | ease-in | ease-out | ease-in-out | spring. keyframe t is SECONDS within that scene\'s duration.\n'
    + '// "offset" (0..1) only on a layer that ALSO has "path":[{"x":px,"y":px},...] — it travels the path.\n'
    + '// "kinetic" is per-character/word text motion, drawn by the engine — use it on the hero line of each scene.';
  // MOTION VOCABULARY — the taste engine fed into generation. This is the product's USP: instead of
  // fade/slide, the agent composes from these curated, tasteful moves so generated video looks alive.
  var MOTION_VOCAB = [
    '— MOTION VOCABULARY (compose from these; do NOT just fade/slide everything) —',
    '• KINETIC HERO LINE — the single highest-impact move. The hero/title line of EVERY scene must carry a "kinetic" reveal (char-rise, word-pop, typewriter, char-blur…). Pick one that fits the mood: char-rise/word-rise for confident, typewriter for technical, char-pop/word-pop for playful, char-blur for premium, wave for ambient loops.',
    '• STAGGERED ENTRANCE (错峰入场) — never bring sibling elements in at the same instant. Offset each layer\'s entrance by 0.08–0.16s so they cascade. For a group of bullets/stats, stagger their opacity+y tracks in sequence.',
    '• RISE + FADE (the tasteful default for supporting lines) — opacity 0→1 with a y offset of +36px→0 over ~0.5s, ease-out. Clean, never cheap.',
    '• OVERSHOOT / SPRING landing — entrances should LAND, not glide: scale 0.8→1.0 (or 0→1) finishing on "spring" or "ease-out". Use for logos, badges, key numbers.',
    '• PATH MOTION (路径运动) — for an accent shape/dot/icon, give it a "path":[{x,y},…] and animate "offset" 0→1 so it arcs across the frame instead of teleporting.',
    '• AMBIENT LIFE during holds — while a line is held on screen, keep one subtle motion alive (a slow scale pulse 1.0→1.03→1.0, a drifting accent, or a "wave" kinetic title) so no frame is frozen.',
    '• EXIT BEFORE A TRANSITION — in the last ~0.4s of a scene, ease outgoing elements out (opacity→0 and/or scale up 1→1.08), so the transition feels intentional, not a hard cut.',
    '• RHYTHM / BEATS — establish a beat inside each scene (hero in → hold → supporting detail in → CTA/number), and VARY it scene to scene. Everything-at-once = PPT and is wrong.'
  ].join('\n');
  // Cinematic quality steering (step 4): named intents the user can invoke ("cinematic", "no PPT", "max text motion").
  var CINEMATIC_STEER = [
    '— DIRECTION: make it a CINEMATIC PRODUCT LAUNCH, not a slide deck —',
    '• Few elements per scene (≤4), generous negative space, big confident type. Let motion (not clutter) carry meaning.',
    '• Use a real transition between every scene (dissolve/push/fade) — reserve "cut" for a deliberate hard beat.',
    '• Max out text motion: the hero line animates with kinetic typography; supporting lines rise+fade, staggered.',
    '• Pace it: hooks land fast, feature beats breathe, the CTA lands with an overshoot. Total ~8–20s across 2–4 scenes.'
  ].join('\n');
  // Curated video-template catalog (collected from nexu-io/open-design, incl. all HyperFrames templates).
  // Used to match a request to a proven structure and guide generation.
  var VIDEO_TEMPLATES = (function () {
    try { return JSON.parse(fs.readFileSync(path.join(appDir, 'data', 'video-templates.json'), 'utf8')).templates || []; }
    catch (e) { return []; }
  })();
  function matchVideoTemplates(brief, doc, n) {
    if (!VIDEO_TEMPLATES.length) return [];
    var text = (String(brief || '') + ' ' + String(doc || '')).toLowerCase();
    var words = text.split(/[^a-z0-9一-鿿]+/).filter(function (w) { return w.length > 2; });
    var scored = VIDEO_TEMPLATES.map(function (t) {
      var hay = (t.title + ' ' + t.summary + ' ' + (t.tags || []).join(' ') + ' ' + t.category).toLowerCase();
      var score = 0; words.forEach(function (w) { if (hay.indexOf(w) >= 0) score++; });
      return { t: t, score: score };
    }).filter(function (x) { return x.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, n || 3).map(function (x) { return x.t; });
    if (!top.length) {   // weak/cross-language overlap → sensible launch-flavoured defaults
      top = VIDEO_TEMPLATES.filter(function (t) { return /Marketing|Product|Cinematic|Branding/i.test(t.category); }).slice(0, n || 3);
    }
    return top;
  }
  function buildVideoGenPrompt(brief, doc, w, h, designSystem, motionProfile, tpls) {
    const ds = readDesignSystem(designSystem);
    const mp = MOTION_PROFILES[motionProfile];
    return [
      'You are a motion designer creating a product LAUNCH VIDEO as an EDITABLE canvas composition.',
      'Brief: ' + (brief || '(none)'),
      '- START WITH A ONE-SENTENCE PLAN of the video (how many scenes + the angle), so the user can follow your thinking, then do the work.',
      '- RESEARCH FIRST IF NEEDED: if the brief references a URL, GitHub repo, product, or release, use the WebFetch tool to read the actual pages (the repo README and the GitHub releases / changelog URL, e.g. <repo>/releases) and get the REAL highlights, feature names, numbers and positioning, then design the video from what you actually learned. Use WebFetch / WebSearch ONLY — do NOT use gh, git or Bash (they are not available to you here). Do the minimum research needed.',
      '- USE REAL, SPECIFIC CONTENT: pick the 3–5 most important CONCRETE highlights and make each feature scene about ONE specific highlight, using its real name/wording. NO vague filler ("powerful", "amazing", "the future") with no substance. If you genuinely cannot find real content, say so in your reply and make a minimal honest version instead of hollow scenes.',
      doc ? ('Product doc (use real names/words from it):\n' + String(doc).slice(0, 18000)) : '',
      'Canvas ~' + Math.round(w || 1280) + 'x' + Math.round(h || 720) + '. Make a tasteful 2–4 scene launch video: a title/hook scene, one or two feature beats, a closing CTA. Use transitions between scenes.',
      CINEMATIC_STEER,
      MOTION_VOCAB,
      (tpls && tpls.length ? ('— REFERENCE TEMPLATES (proven video structures that fit this request — adapt the BEST-FITTING one to our canvas: text/shape/image/video layers + keyframe tracks; follow its scene structure & pacing, NOT any tool-specific commands) —\n' + tpls.map(function (t) { return '• ' + t.title + ' [' + t.category + ', ' + t.aspect + ']: ' + t.summary; }).join('\n')) : ''),
      ds ? '- ON-BRAND: use the DESIGN SYSTEM below for ALL colors and type — real hex values for scene "bg", text "color" and shape "fill", and its typeface family in text-layer "font". Match its palette and voice.' : '',
      mp ? mp.replace(/^-\s*MOTION PROFILE\s*=/, '- PACING =') + ' Apply this pacing to durations, easing and how busy the motion is.' : '',
      'When you are done, output the composition as a SINGLE JSON object matching this schema. Put it LAST in your reply; a ```json fenced block is fine. No commentary after it.',
      VIDEO_SCHEMA,
      'Rules: only those layer/track types; keyframe t in seconds within each scene duration; x/y are the layer CENTER in comp px; "offset" (0..1) only on a layer that also has a "path":[{x,y}] array; entrances animate opacity/scale/position; EVERY scene\'s hero line uses "kinetic"; keep it minimal, on-brand, and richly animated per the MOTION VOCABULARY above.',
      (ds ? '\n— DESIGN SYSTEM (use its real colors & fonts) —\n"""\n' + ds.slice(0, 12000) + '\n"""' : '')
    ].filter(Boolean).join('\n');
  }
  function buildVideoEditPrompt(comp, instruction, designSystem, motionProfile) {
    const ds = readDesignSystem(designSystem);
    return [
      'You are editing an existing canvas VIDEO composition (JSON below). Apply this change: ' + instruction,
      '- MOTION TOOLS you can use: a text layer\'s "kinetic":{type,stagger,dur,start} gives per-character/word reveals (types: char-rise, char-fade, char-pop, char-drop, char-blur, char-flip, char-spin, typewriter, wave, word-rise, word-fade, word-pop, word-blur). Keyframe "tracks" (opacity/x/y/scale/rotate, ease: ease-out/spring/…) drive entrance/emphasis/exit; "offset" 0→1 with a "path" makes a layer travel. Prefer STAGGERED entrances and a kinetic hero line over plain fade/slide.',
      ds ? '- Any new or changed layers must use the DESIGN SYSTEM colors/fonts below (real hex values, its typeface).' : '',
      'Return ONLY the full updated JSON object (same schema, all scenes/layers kept unless the change removes them) — no prose, no fence.',
      'Schema: ' + VIDEO_SCHEMA,
      'Current composition JSON:',
      JSON.stringify(comp).slice(0, 60000),
      (ds ? '\n— DESIGN SYSTEM (use its real colors & fonts) —\n"""\n' + ds.slice(0, 12000) + '\n"""' : '')
    ].filter(Boolean).join('\n');
  }
  // Pull the composition JSON out of an agent reply that may contain research prose + tool chatter:
  // prefer the LAST ```json fenced block, else the outermost {...} span.
  function extractJsonBlock(out) {
    var s = String(out);
    var fences = s.match(/```(?:json)?\s*[\s\S]*?```/gi);
    if (fences && fences.length) {
      for (var k = fences.length - 1; k >= 0; k--) {
        var inner = fences[k].replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        if (inner[0] === '{') return inner;
      }
    }
    var i = s.indexOf('{'), j = s.lastIndexOf('}');
    return (i >= 0 && j > i) ? s.slice(i, j + 1) : null;
  }
  // the agent's conversational text (its explanation / research summary), with the JSON + code fences removed
  function proseFrom(out, block) {
    var s = String(out).replace(/```[\s\S]*?```/g, ' ');
    if (block) { var idx = s.indexOf(block); if (idx >= 0) s = s.slice(0, idx) + s.slice(idx + block.length); }
    return s.replace(/\s+/g, ' ').trim().slice(0, 700);
  }
  // Read-only research tools pre-approved for headless runs (so WebFetch/WebSearch work without a prompt).
  var AGENT_TOOLS = 'WebFetch,WebSearch,Read,Glob,Grep';
  function runClaudeJson(promptText, cli, cb, timeoutMs) {
    var bin = resolveNamedBin(cli, 'claude');
    var TO = timeoutMs || 180000;
    var child = spawnCli(bin, ['-p', '--allowedTools', AGENT_TOOLS], { cwd: REPO, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] });
    try { child.stdin.write(promptText); child.stdin.end(); } catch (e) {}
    var out = '', err = '', timedOut = false;
    var killer = setTimeout(function () { timedOut = true; killCli(child); }, TO);
    child.stdout.on('data', function (d) { out += d; });
    child.stderr.on('data', function (d) { err += d; });
    child.on('error', function (e) { clearTimeout(killer); cb(e); });
    child.on('close', function () {
      clearTimeout(killer);
      var block = extractJsonBlock(out);
      if (!block) {
        if (timedOut) return cb(new Error('agent timed out (' + Math.round(TO / 1000) + 's)'));
        var tail = String(err || out || '').trim().slice(-220);
        return cb(new Error(tail ? ('agent returned no JSON: ' + tail) : 'agent produced no output — check that claude is logged in (not on a $0 API key).'));
      }
      var j; try { j = JSON.parse(block); } catch (e) { return cb(new Error('agent returned invalid JSON')); }
      cb(null, j, proseFrom(out, block));
    });
  }

  /* ---- streaming agent runner: parse `claude -p --output-format stream-json` events live ---- */
  function toolSummary(name, input) {
    try {
      if (!input) return '';
      if (input.url) return String(input.url);
      if (input.command) return String(input.command).slice(0, 60);
      if (input.file_path) return String(input.file_path);
      if (input.pattern || input.query || input.prompt) return String(input.pattern || input.query || input.prompt).slice(0, 60);
      var k = Object.keys(input)[0]; return k ? String(input[k]).slice(0, 50) : '';
    } catch (e) { return ''; }
  }
  // Normalize one JSONL line into events: [{kind:'text'|'tool'|'result', ...}]
  function parseStreamLine(line) {
    var obj; try { obj = JSON.parse(line); } catch (e) { return null; }
    if (obj.type === 'assistant' && obj.message && Array.isArray(obj.message.content)) {
      var out = [];
      obj.message.content.forEach(function (b) {
        if (b.type === 'text' && b.text) out.push({ kind: 'text', text: b.text });
        else if (b.type === 'tool_use') out.push({ kind: 'tool', name: b.name || 'tool', summary: toolSummary(b.name, b.input) });
      });
      return out.length ? out : null;
    }
    if (obj.type === 'result') return [{ kind: 'result', text: (typeof obj.result === 'string' ? obj.result : '') }];
    return null;
  }
  // on = { text(t), tool(name,summary), done(json, prose), error(err) }.  Returns the child (to kill on disconnect).
  function runClaudeStream(promptText, cli, timeoutMs, on) {
    var bin = resolveNamedBin(cli, 'claude');
    var TO = timeoutMs || 600000, child;
    // pre-approve read-only research tools so headless -p can actually fetch release notes etc.
    // (no Bash/Write/Edit → the agent can research but can't run commands or modify files)
    try { child = spawnCli(bin, ['-p', '--output-format', 'stream-json', '--verbose', '--allowedTools', AGENT_TOOLS], { cwd: REPO, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { on.error && on.error(e); return null; }
    try { child.stdin.write(promptText); child.stdin.end(); } catch (e) {}
    var buf = '', full = '', resultText = '', err = '', timedOut = false, ended = false;
    var killer = setTimeout(function () { timedOut = true; killCli(child); }, TO);
    child.stdout.on('data', function (d) {
      buf += d; var lines = buf.split('\n'); buf = lines.pop();
      lines.forEach(function (ln) {
        if (!ln.trim()) return;
        var evs = parseStreamLine(ln); if (!evs) return;
        evs.forEach(function (ev) {
          if (ev.kind === 'text') { full += ev.text + '\n'; on.text && on.text(ev.text); }
          else if (ev.kind === 'tool') { on.tool && on.tool(ev.name, ev.summary); }
          else if (ev.kind === 'result') { resultText = ev.text || resultText; }
        });
      });
    });
    child.stderr.on('data', function (d) { err += d; });
    child.on('error', function (e) { if (ended) return; ended = true; clearTimeout(killer); on.error && on.error(e); });
    child.on('close', function () {
      if (ended) return; ended = true; clearTimeout(killer);
      var text = resultText || full, block = extractJsonBlock(text);
      if (!block) {
        if (timedOut) return on.error && on.error(new Error('agent timed out (' + Math.round(TO / 1000) + 's)'));
        var tail = String(err || text || '').trim().slice(-220);
        return on.error && on.error(new Error(tail ? ('agent returned no JSON: ' + tail) : 'agent produced no output — check that claude is logged in.'));
      }
      var j; try { j = JSON.parse(block); } catch (e) { return on.error && on.error(new Error('agent returned invalid JSON')); }
      on.done && on.done(j, proseFrom(text, block));
    });
    return child;
  }
  /* ---- AMR engine (vela CLI): ACP JSON-RPC over stdio ----
   * AMR = Open Design Cloud's agent runtime, productized as the `vela` CLI. `vela acp` speaks
   * ACP JSON-RPC over the child's stdio (see open-design docs/new-agent-runtime-acp.md; this is
   * a minimal port of apps/daemon/src/acp.ts). Lifecycle:
   *   initialize → session/new(cwd) → session/set_model (vela REJECTS prompts until a model is
   *   set; the synthetic 'default' id must be skipped) → session/prompt → session/update
   *   notifications (agent_message_chunk = text, agent_thought_chunk = thinking, tool_call = tool)
   *   → response to session/prompt = turn finished.
   * Env (BYOK): VELA_RUNTIME_KEY (OpenRouter-compatible key) + VELA_LINK_URL (endpoint) — read
   * from app/user-amr.json (written by /api/amr-config, gitignored) with process.env as fallback. */
  var AMR_CONFIG_FILE = path.join(appDir, 'user-amr.json');
  var AMR_DEFAULT_MODEL = 'deepseek-v3.2';
  function readAmrConfig() { try { return JSON.parse(fs.readFileSync(AMR_CONFIG_FILE, 'utf8')); } catch (e) { return {}; } }
  function writeAmrConfig(cfg) {
    var cur = readAmrConfig();
    ['key', 'linkUrl', 'model', 'bin'].forEach(function (k) { if (cfg[k] !== undefined) { var v = String(cfg[k] || '').trim(); if (v) cur[k] = v; else delete cur[k]; } });
    fs.writeFileSync(AMR_CONFIG_FILE, JSON.stringify(cur, null, 2));
    return cur;
  }
  function amrEnv() {
    var cfg = readAmrConfig(), e = cleanEnv();
    if (cfg.key) e.VELA_RUNTIME_KEY = cfg.key;
    if (cfg.linkUrl) e.VELA_LINK_URL = cfg.linkUrl;
    return e;
  }
  // Recursively pull assistant text out of an ACP update payload (port of extractAcpTextValue).
  function extractAcpText(v, depth) {
    depth = depth || 0; if (depth > 4) return null;
    if (typeof v === 'string') return v.length ? v : null;
    if (Array.isArray(v)) { var t = v.map(function (x) { return extractAcpText(x, depth + 1); }).filter(Boolean).join(''); return t.length ? t : null; }
    if (!v || typeof v !== 'object') return null;
    var keys = ['text', 'delta', 'content', 'message', 'output', 'answer', 'value', 'body', 'parts', 'choices'];
    for (var i = 0; i < keys.length; i++) { var t2 = extractAcpText(v[keys[i]], depth + 1); if (t2) return t2; }
    return null;
  }
  // Auto-approve permission requests, preferring the widest allow (same order Open Design uses).
  function chooseAcpPermission(options) {
    var list = Array.isArray(options) ? options : [];
    var hit = list.find(function (o) { return o && o.optionId === 'approve_for_session'; }); if (hit) return 'approve_for_session';
    hit = list.find(function (o) { return o && o.kind === 'allow_always'; }); if (hit && hit.optionId) return hit.optionId;
    hit = list.find(function (o) { return o && o.kind === 'allow_once'; }); if (hit && hit.optionId) return hit.optionId;
    return null;
  }
  // Same `on` contract as runClaudeStream: { text(t), tool(name,summary), done(json, prose), error(err) }.
  // opts.raw = resolve with the raw accumulated text (on.done(null, fullText)) instead of extracting JSON.
  function runAcpStream(promptText, timeoutMs, on, opts) {
    opts = opts || {};
    var cfg = readAmrConfig();
    var bin = (opts.bin || cfg.bin || 'vela'); if (!/^[a-z0-9-]+$/.test(bin)) bin = 'vela';
    // vela's ACP stdio mode is `vela agent run --runtime opencode` (per open-design defs/amr.ts);
    // other ACP agents pass their own args (hermes: `acp --accept-hooks`).
    var args = opts.args || ['agent', 'run', '--runtime', 'opencode'];
    var model = String(opts.model || cfg.model || AMR_DEFAULT_MODEL);
    var TO = timeoutMs || 600000, child;
    try { child = spawnCli(bin, args, { cwd: REPO, env: amrEnv(), stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { on.error && on.error(e); return null; }
    var nextId = 3, sessionId = null, promptId = null, setModelId = null;
    var buf = '', full = '', errTail = '', ended = false, timedOut = false;
    var killer = setTimeout(function () { timedOut = true; killCli(child); }, TO);
    function fin(err) {
      if (ended) return; ended = true; clearTimeout(killer);
      try { child.stdin.end(); } catch (e) {}                       // EOF lets vela tear down its private server
      var term = setTimeout(function () { killCli(child, 'SIGTERM'); }, 1500);
      if (term.unref) term.unref();                                  // grace period, but don't hold the process open
      if (err) return on.error && on.error(err);
      if (opts.raw) return on.done && on.done(null, full);
      var block = extractJsonBlock(full);
      if (!block) return on.error && on.error(new Error(full.trim()
        ? 'agent returned no JSON: ' + full.trim().slice(-220)
        : ('AMR produced no output' + (errTail ? ': ' + errTail.trim().slice(-200) : ' — check the vela key (Settings → Execution mode → AMR).'))));
      var j; try { j = JSON.parse(block); } catch (e) { return on.error && on.error(new Error('agent returned invalid JSON')); }
      on.done && on.done(j, proseFrom(full, block));
    }
    function rpc(id, method, params) { try { child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: id, method: method, params: params }) + '\n'); } catch (e) { fin(e); } }
    function rpcResult(id, result) { try { child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: id, result: result }) + '\n'); } catch (e) {} }
    function sendPrompt() {
      if (promptId != null || ended) return;
      promptId = nextId++;
      rpc(promptId, 'session/prompt', { sessionId: sessionId, prompt: [{ type: 'text', text: promptText }] });
    }
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (d) {
      buf += d; var lines = buf.split('\n'); buf = lines.pop();
      lines.forEach(function (ln) {
        ln = ln.trim(); if (!ln || ended) return;
        var obj; try { obj = JSON.parse(ln); } catch (e) { return; }          // stderr-grade noise on stdout — skip
        if (obj.error) {
          if (obj.id === setModelId && promptId === null) { setModelId = null; sendPrompt(); return; }  // model select failed → try the agent default
          return fin(new Error('AMR: ' + ((obj.error && obj.error.message) || 'json-rpc error')));
        }
        if (obj.method === 'session/request_permission') {
          var optId = chooseAcpPermission(obj.params && obj.params.options);
          if (optId != null && (typeof obj.id === 'number' || typeof obj.id === 'string')) rpcResult(obj.id, { outcome: { outcome: 'selected', optionId: optId } });
          else fin(new Error('AMR asked for a permission with no allow option'));
          return;
        }
        if (obj.method === 'session/update') {
          var u = (obj.params && obj.params.update) || {};
          if (u.sessionUpdate === 'agent_message_chunk') { var t = extractAcpText(u); if (t) { full += t; on.text && on.text(t); } return; }
          if (u.sessionUpdate === 'agent_thought_chunk') { return; }          // thinking — not surfaced in the chat stream (yet)
          if (u.sessionUpdate === 'tool_call') { on.tool && on.tool(String(u.title || u.kind || 'tool'), String(u.kind && u.title ? u.kind : '')); }
          return;
        }
        if (obj.id === 1) { rpc(2, 'session/new', { cwd: REPO, mcpServers: [] }); return; }
        if (obj.id === 2) {
          sessionId = (obj.result && obj.result.sessionId) || null;
          if (!sessionId) return fin(new Error('AMR session/new returned no sessionId'));
          if (model && model !== 'default') { setModelId = nextId++; rpc(setModelId, 'session/set_model', { sessionId: sessionId, modelId: model }); }
          else sendPrompt();
          return;
        }
        if (setModelId != null && obj.id === setModelId) { setModelId = null; sendPrompt(); return; }
        if (promptId != null && obj.id === promptId) { fin(null); return; }
      });
    });
    child.stderr.on('data', function (d) { errTail = (errTail + d).slice(-4000); });
    child.on('error', function (e) { fin(e); });
    child.on('close', function () {
      if (!ended) fin(timedOut
        ? new Error('AMR timed out (' + Math.round(TO / 1000) + 's)')
        : new Error('AMR exited before completing' + (errTail ? ': ' + errTail.trim().slice(-200) : ' — is `vela` logged in / configured?')));
    });
    rpc(1, 'initialize', { protocolVersion: 1, clientCapabilities: { terminal: false }, clientInfo: { name: 'motion-anything', version: '0.1.0' } });
    return child;
  }
  /* ---- per-family JSONL event parsers for mode:'events' CLIs (codex / cursor / opencode).
   * Each returns [{kind:'text'|'tool'|'result'|'error', ...}] or null — same event shape
   * parseStreamLine produces for claude, so all four families feed one streaming loop. ---- */
  function parseCodexLine(line) {
    var obj; try { obj = JSON.parse(line); } catch (e) { return null; }
    if (obj.type === 'item.completed' && obj.item && obj.item.type === 'agent_message' && typeof obj.item.text === 'string' && obj.item.text)
      return [{ kind: 'text', text: obj.item.text }];
    if ((obj.type === 'item.started' || obj.type === 'item.completed') && obj.item && obj.item.type === 'command_execution')
      return obj.type === 'item.started' ? [{ kind: 'tool', name: 'Bash', summary: String(obj.item.command || '').slice(0, 60) }] : null;
    if (obj.type === 'turn.failed' || obj.type === 'error')
      return [{ kind: 'error', message: String((obj.error && obj.error.message) || obj.message || 'Codex error') }];
    return null;
  }
  function parseOpenCodeLine(line) {
    var obj; try { obj = JSON.parse(line); } catch (e) { return null; }
    var part = obj.part || {};
    if (obj.type === 'text' && typeof part.text === 'string' && part.text) return [{ kind: 'text', text: part.text }];
    if (obj.type === 'tool_use' && typeof part.tool === 'string') return [{ kind: 'tool', name: part.tool, summary: '' }];
    // OpenCode emits structured error frames on stdout and still exits 0 — surface them as real failures.
    if (obj.type === 'error') return [{ kind: 'error', message: String((obj.error && obj.error.message) || obj.message || 'OpenCode error') }];
    return null;
  }
  var EVENT_PARSERS = { codex: parseCodexLine, cursor: parseStreamLine /* cursor-agent's stream-json is claude-shaped */, opencode: parseOpenCodeLine };
  // mode:'events' runner — spawn the CLI, feed the prompt on stdin, stream-parse its JSONL.
  function runEventStream(promptText, def, timeoutMs, on, opts) {
    opts = opts || {};
    var bin = resolveEngineBin(def);
    var args = (def.args || []).slice();
    if (def.cwdFlag) args.push(def.cwdFlag, REPO);
    var parse = EVENT_PARSERS[def.family] || parseStreamLine;
    var TO = timeoutMs || 600000, child;
    try { child = spawnCli(bin, args, { cwd: REPO, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { on.error && on.error(e); return null; }
    try { child.stdin.write(promptText); child.stdin.end(); } catch (e) {}
    var buf = '', full = '', resultText = '', err = '', streamErr = null, timedOut = false, ended = false;
    var killer = setTimeout(function () { timedOut = true; killCli(child); }, TO);
    child.stdout.on('data', function (d) {
      buf += d; var lines = buf.split('\n'); buf = lines.pop();
      lines.forEach(function (ln) {
        if (!ln.trim()) return;
        var evs = parse(ln); if (!evs) return;
        evs.forEach(function (ev) {
          if (ev.kind === 'text') { full += ev.text + '\n'; on.text && on.text(ev.text); }
          else if (ev.kind === 'tool') { on.tool && on.tool(ev.name, ev.summary); }
          else if (ev.kind === 'result') { resultText = ev.text || resultText; }
          else if (ev.kind === 'error') { streamErr = streamErr || new Error(def.name + ': ' + ev.message); }
        });
      });
    });
    child.stderr.on('data', function (d) { err += d; });
    child.on('error', function (e) { if (ended) return; ended = true; clearTimeout(killer); on.error && on.error(e); });
    child.on('close', function () {
      if (ended) return; ended = true; clearTimeout(killer);
      if (streamErr) return on.error && on.error(streamErr);
      if (timedOut) return on.error && on.error(new Error(def.name + ' timed out (' + Math.round(TO / 1000) + 's)'));
      var text = resultText || full;
      if (opts.raw) return on.done && on.done(null, text);
      var block = extractJsonBlock(text);
      if (!block) {
        var tail = String(err || text || '').trim().slice(-220);
        return on.error && on.error(new Error(tail ? ('agent returned no JSON: ' + tail) : (def.name + ' produced no output — is it installed and logged in?')));
      }
      var j; try { j = JSON.parse(block); } catch (e) { return on.error && on.error(new Error('agent returned invalid JSON')); }
      on.done && on.done(j, proseFrom(text, block));
    });
    return child;
  }
  // mode:'plain' runner — raw text on stdout. grok-build wants the prompt via --prompt-file;
  // gemini (and anything else) reads it from stdin.
  function runPlainAgent(promptText, def, timeoutMs, on, opts) {
    opts = opts || {};
    var bin = resolveEngineBin(def);
    var args = (def.args || []).slice(), tmpFile = null;
    if (def.promptViaFile) {
      try { tmpFile = path.join(os.tmpdir(), 'ma-prompt-' + Date.now() + '.txt'); fs.writeFileSync(tmpFile, promptText); }
      catch (e) { on.error && on.error(e); return null; }
      args.push(def.promptViaFile, tmpFile);
    }
    var TO = timeoutMs || 600000, child;
    try { child = spawnCli(bin, args, { cwd: REPO, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] }); }
    catch (e) { on.error && on.error(e); return null; }
    if (!tmpFile) { try { child.stdin.write(promptText); } catch (e) {} }
    try { child.stdin.end(); } catch (e) {}
    var out = '', err = '', timedOut = false, ended = false;
    var killer = setTimeout(function () { timedOut = true; killCli(child); }, TO);
    child.stdout.on('data', function (d) { out += d; });
    child.stderr.on('data', function (d) { err += d; });
    function cleanup() { if (tmpFile) { try { fs.unlinkSync(tmpFile); } catch (e) {} } }
    child.on('error', function (e) { if (ended) return; ended = true; clearTimeout(killer); cleanup(); on.error && on.error(e); });
    child.on('close', function () {
      if (ended) return; ended = true; clearTimeout(killer); cleanup();
      if (timedOut) return on.error && on.error(new Error(def.name + ' timed out (' + Math.round(TO / 1000) + 's)'));
      if (opts.raw) return on.done && on.done(null, out);
      var block = extractJsonBlock(out);
      if (!block) {
        var tail = String(err || out || '').trim().slice(-220);
        return on.error && on.error(new Error(tail ? ('agent returned no JSON: ' + tail) : (def.name + ' produced no output — is it installed and logged in?')));
      }
      var j; try { j = JSON.parse(block); } catch (e) { return on.error && on.error(new Error('agent returned invalid JSON')); }
      on.done && on.done(j, proseFrom(out, block));
    });
    return child;
  }
  /* ---- BYOK engine: direct hosted-API calls with the user's own key (no CLI, non-streaming) ----
   * Providers: anthropic (Messages API) / openai (Chat Completions) / google (generateContent).
   * Key + provider + model live in app/user-byok.json (written by /api/byok-config, gitignored). */
  var BYOK_CONFIG_FILE = path.join(appDir, 'user-byok.json');
  var BYOK_DEFAULT_MODELS = { anthropic: 'claude-opus-4-8', openai: 'gpt-5.5', google: 'gemini-2.5-pro' };
  function readByokConfig() { try { return JSON.parse(fs.readFileSync(BYOK_CONFIG_FILE, 'utf8')); } catch (e) { return {}; } }
  function writeByokConfig(cfg) {
    var cur = readByokConfig();
    ['provider', 'key', 'model'].forEach(function (k) { if (cfg[k] !== undefined) { var v = String(cfg[k] || '').trim(); if (v) cur[k] = v; else delete cur[k]; } });
    fs.writeFileSync(BYOK_CONFIG_FILE, JSON.stringify(cur, null, 2));
    return cur;
  }
  function byokRequest(cfg, promptText) {
    var provider = cfg.provider || 'anthropic';
    var model = cfg.model || BYOK_DEFAULT_MODELS[provider] || BYOK_DEFAULT_MODELS.anthropic;
    if (provider === 'openai') return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
      body: { model: model, messages: [{ role: 'user', content: promptText }] },
      text: function (j) { return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; }
    };
    if (provider === 'google') return {
      url: 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(cfg.key),
      headers: { 'Content-Type': 'application/json' },
      body: { contents: [{ parts: [{ text: promptText }] }] },
      text: function (j) { var c = j.candidates && j.candidates[0]; var parts = (c && c.content && c.content.parts) || []; return parts.map(function (p) { return p.text || ''; }).join(''); }
    };
    return {  // anthropic (default)
      url: 'https://api.anthropic.com/v1/messages',
      headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01' },
      body: { model: model, max_tokens: 16000, messages: [{ role: 'user', content: promptText }] },
      text: function (j) { return (j.content || []).map(function (b) { return b.text || ''; }).join(''); }
    };
  }
  function runByokStream(promptText, timeoutMs, on, opts) {
    opts = opts || {};
    var cfg = readByokConfig();
    if (!cfg.key) { on.error && on.error(new Error('BYOK is not configured — add your API key in Settings → Execution mode → BYOK.')); return null; }
    var req = byokRequest(cfg, promptText);
    var ctl = new AbortController();
    var killer = setTimeout(function () { ctl.abort(); }, timeoutMs || 600000);
    fetch(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body), signal: ctl.signal })
      .then(function (r) {
        return r.text().then(function (bodyText) {
          if (!r.ok) {
            var hint = (r.status === 401 || r.status === 403) ? 'API key rejected — check the key in Settings → BYOK.'
              : (r.status === 404 ? 'model not found — check the model id in Settings → BYOK.' : bodyText.slice(0, 220));
            throw new Error('BYOK (' + (cfg.provider || 'anthropic') + ') HTTP ' + r.status + ': ' + hint);
          }
          var j; try { j = JSON.parse(bodyText); } catch (e) { throw new Error('BYOK: provider returned non-JSON'); }
          return req.text(j) || '';
        });
      })
      .then(function (full) {
        clearTimeout(killer);
        if (full) { on.text && on.text(full); }
        if (opts.raw) return on.done && on.done(null, full);
        var block = extractJsonBlock(full);
        if (!block) return on.error && on.error(new Error(full.trim() ? 'agent returned no JSON: ' + full.trim().slice(-220) : 'BYOK returned an empty reply.'));
        var j2; try { j2 = JSON.parse(block); } catch (e) { return on.error && on.error(new Error('agent returned invalid JSON')); }
        on.done && on.done(j2, proseFrom(full, block));
      })
      .catch(function (e) {
        clearTimeout(killer);
        on.error && on.error(e.name === 'AbortError' ? new Error('BYOK timed out (' + Math.round((timeoutMs || 600000) / 1000) + 's)') : e);
      });
    return { kill: function () { try { ctl.abort(); } catch (e) {} } };   // child-shaped enough for callers that .kill on disconnect
  }
  /* ---- provider dispatch: route by the engine's mode (see KNOWN_CLIS) ---- */
  function acpOptsFor(def) {
    // Open Design Cloud keeps its configured model; other ACP agents (hermes) run their own default.
    return def.id === 'amr' ? { args: def.args } : { bin: resolveEngineBin(def), args: def.args, model: 'default' };
  }
  function runAgentStream(promptText, cli, timeoutMs, on) {
    var def = engineDef(cli);
    if (def && def.mode === 'acp') return runAcpStream(promptText, timeoutMs, on, acpOptsFor(def));
    if (def && def.mode === 'events') return runEventStream(promptText, def, timeoutMs, on);
    if (def && def.mode === 'plain') return runPlainAgent(promptText, def, timeoutMs, on);
    if (def && def.mode === 'byok') return runByokStream(promptText, timeoutMs, on);
    return runClaudeStream(promptText, cli, timeoutMs, on);
  }
  function runAgentJson(promptText, cli, cb, timeoutMs) {
    var def = engineDef(cli);
    if (!def || def.mode === 'claude') return runClaudeJson(promptText, cli, cb, timeoutMs);
    return runAgentStream(promptText, cli, timeoutMs, { done: function (j, prose) { cb(null, j, prose); }, error: function (e) { cb(e); } });
  }
  // Raw-text runner for the HTML line (generate/edit want a full HTML document, not JSON).
  // cb(err, outText, errText) — mirrors the old inline `spawn(bin, ['-p'])` collect-and-close shape.
  function runAgentText(promptText, cli, timeoutMs, cb) {
    var def = engineDef(cli);
    var onRaw = { done: function (_null, fullText) { cb(null, String(fullText || ''), ''); }, error: function (e) { cb(e, '', ''); } };
    if (def && def.mode === 'acp') return runAcpStream(promptText, timeoutMs, onRaw, Object.assign(acpOptsFor(def), { raw: true }));
    if (def && def.mode === 'events') return runEventStream(promptText, def, timeoutMs, onRaw, { raw: true });
    if (def && def.mode === 'plain') return runPlainAgent(promptText, def, timeoutMs, onRaw, { raw: true });
    if (def && def.mode === 'byok') return runByokStream(promptText, timeoutMs, onRaw, { raw: true });
    var bin = resolveNamedBin(cli, 'claude');
    var child = spawnCli(bin, ['-p'], { cwd: REPO, env: cleanEnv(), stdio: ['pipe', 'pipe', 'pipe'] });
    try { child.stdin.write(promptText); child.stdin.end(); } catch (e) {}
    var out = '', err = '';
    var killer = setTimeout(function () { killCli(child); }, timeoutMs || 240000);
    child.stdout.on('data', function (d) { out += d; });
    child.stderr.on('data', function (d) { err += d; });
    child.on('error', function (e) { clearTimeout(killer); cb(e, '', ''); });
    child.on('close', function () { clearTimeout(killer); cb(null, out, err); });
    return child;
  }

  // Self-verification pass: critique the produced composition against the brief and return an improved one.
  function buildVideoVerifyPrompt(comp, brief, designSystem) {
    var ds = readDesignSystem(designSystem);
    return [
      'You just produced this launch-video composition (JSON) for the brief below. Now review it like a demanding art director, then return an IMPROVED version.',
      'Brief: ' + (brief || '(none)'),
      'Check hard: (1) does EVERY feature scene use a SPECIFIC, concrete highlight (real names/numbers), not vague filler? (2) is each scene CLEAN — few elements, generous spacing, big readable type, nothing cramped or ugly? (3) is the pacing/rhythm tasteful (not everything at once)? (4) on-brand colors & fonts? (5) MOTION RICHNESS — does the hero line of each scene carry a "kinetic" reveal, are entrances STAGGERED (not simultaneous), and is there a real transition between scenes? If any scene is just fade/slide, upgrade it using the motion vocabulary (kinetic hero line, staggered rise+fade, overshoot landings, a path-motion accent, ambient life during holds).',
      ds ? '- Keep brand colors/fonts from the DESIGN SYSTEM values.' : '',
      'State in ONE line what you improved, then output the improved composition as a SINGLE JSON object (same schema) LAST (a ```json fence is fine). If it was already good, tighten it anyway.',
      'Schema: ' + VIDEO_SCHEMA,
      'Current JSON:',
      JSON.stringify(comp).slice(0, 60000),
      (ds ? '\n— DESIGN SYSTEM —\n"""\n' + ds.slice(0, 8000) + '\n"""' : '')
    ].filter(Boolean).join('\n');
  }
  function sseHead(res) { res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' }); }
  function sse(res, event, data) { try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data || {}) + '\n\n'); } catch (e) {} }

  // List previously generated projects (disk is the source of truth).
  function listProjects() {
    const root = path.join(appDir, 'projects');
    if (!fs.existsSync(root)) return [];
    return fs.readdirSync(root, { withFileTypes: true })
      .filter(function (d) { return d.isDirectory() && d.name !== 'landing-demo'; })
      .map(function (d) {
        const dir = path.join(root, d.name);
        const idx = path.join(dir, 'index.html');
        const compf = path.join(dir, 'comp.json');
        let meta = {};
        try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (e) {}
        // video project = meta says so, or a comp.json with no index.html
        if (meta.kind === 'video' || (!fs.existsSync(idx) && fs.existsSync(compf))) {
          if (!fs.existsSync(compf)) return null;
          const st = fs.statSync(compf);
          let title = meta.title || meta.brief || d.name;
          return { slug: d.name, kind: 'video', path: 'projects/' + d.name + '/comp.json', title: title, created: meta.created || st.mtimeMs, bytes: st.size, designSystem: meta.designSystem || '', motionProfile: meta.motionProfile || '' };
        }
        if (!fs.existsSync(idx)) return null;
        let title = meta.title || meta.brief || '';
        if (!title) {
          try { const h = fs.readFileSync(idx, 'utf8'); const m = h.match(/<title[^>]*>([^<]*)<\/title>/i); if (m && m[1].trim()) title = m[1].trim(); } catch (e) {}
        }
        if (!title) title = d.name;
        const st = fs.statSync(idx);
        return { slug: d.name, kind: 'web', path: 'projects/' + d.name + '/index.html', title: title, created: meta.created || st.mtimeMs, bytes: st.size, designSystem: meta.designSystem || '', motionProfile: meta.motionProfile || '' };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.created - a.created; });
  }

  // Resolve a project dir from a slug, with safety checks (no traversal, never the demo).
  function safeProjectDir(slug) {
    if (!/^[A-Za-z0-9_-]+$/.test(String(slug || ''))) return null;
    if (slug === 'landing-demo') return null;
    const root = path.join(appDir, 'projects');
    const dir = path.join(root, slug);
    if (path.dirname(dir) !== root) return null;
    return dir;
  }
  // ============================ Skills registry (the Skills page) ============================
  // Every SKILL.md we ship: the router + vendored companions (skills/), each recipe folder
  // (recipes/<surface>/<id>/), and any user-authored skills (app/user-skills/). Parsed from
  // frontmatter; enable/disable state persisted in app/user-skills/_state.json.
  var USER_SKILLS_DIR = path.join(appDir, 'user-skills');
  function parseSkillFrontmatter(txt) {
    var out = { name: '', description: '', triggers: [], mode: '', category: '' };
    var m = String(txt).match(/^---\s*\n([\s\S]*?)\n---/);
    if (!m) { var h = String(txt).match(/^#\s+(.+)$/m); if (h) out.name = h[1].trim(); return out; }
    var lines = m[1].split('\n');
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i], mm;
      if ((mm = l.match(/^name:\s*(.+)$/))) out.name = mm[1].trim().replace(/^["']|["']$/g, '');
      else if (l.match(/^description:\s*\|/)) { var buf = []; i++; while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^[a-zA-Z_]+:/.test(lines[i])) { buf.push(lines[i].trim()); i++; } i--; out.description = buf.join(' ').replace(/\s+/g, ' ').trim(); }
      else if ((mm = l.match(/^description:\s*(.+)$/))) out.description = mm[1].trim().replace(/^["']|["']$/g, '');
      else if (l.match(/^triggers:/)) { var j = i + 1; while (j < lines.length && /^\s*-\s+/.test(lines[j])) { out.triggers.push(lines[j].replace(/^\s*-\s+/, '').trim().replace(/^["']|["']$/g, '')); j++; } i = j - 1; }
      else if ((mm = l.match(/^\s+mode:\s*(.+)$/)) && !out.mode) out.mode = mm[1].trim().replace(/^["']|["']$/g, '');
      else if ((mm = l.match(/^\s+category:\s*(.+)$/)) && !out.category) out.category = mm[1].trim().replace(/^["']|["']$/g, '');
    }
    return out;
  }
  // find the first SKILL.md down each branch of root (handles skills/gsap/gsap-core nesting)
  function findSkillDirs(root, depth, baseRel, acc) {
    if (depth < 0 || !fs.existsSync(root)) return acc;
    fs.readdirSync(root, { withFileTypes: true }).forEach(function (d) {
      if (!d.isDirectory() || d.name.charAt(0) === '.' || d.name.charAt(0) === '_') return;
      var dir = path.join(root, d.name), rel = (baseRel ? baseRel + '/' : '') + d.name;
      if (fs.existsSync(path.join(dir, 'SKILL.md'))) acc.push({ rel: rel, dir: dir });
      else findSkillDirs(dir, depth - 1, rel, acc);
    });
    return acc;
  }
  function skillState() { try { return JSON.parse(fs.readFileSync(path.join(USER_SKILLS_DIR, '_state.json'), 'utf8')); } catch (e) { return { disabled: [] }; } }
  function saveSkillState(s) { fs.mkdirSync(USER_SKILLS_DIR, { recursive: true }); fs.writeFileSync(path.join(USER_SKILLS_DIR, '_state.json'), JSON.stringify(s, null, 2)); }
  // encode a skill id from its repo-relative dir (e.g. "skills/web-clone", "recipes/web/tilt-3d")
  function skillId(relDir) { return relDir.replace(/\\/g, '/'); }
  function resolveSkillDir(id) {
    if (!id || /\.\.|^\/|~/.test(id)) return null;
    var dir = path.join(REPO, id);
    var ok = [path.join(REPO, 'skills'), path.join(REPO, 'recipes'), USER_SKILLS_DIR].some(function (r) { return dir === r || dir.indexOf(r + path.sep) === 0; });
    if (!ok || !fs.existsSync(path.join(dir, 'SKILL.md'))) return null;
    return dir;
  }
  function listSkills() {
    var st = skillState(), disabled = st.disabled || [], items = [];
    function add(rel, dir, type, source) {
      var fm; try { fm = parseSkillFrontmatter(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8')); } catch (e) { return; }
      var id = skillId(path.relative(REPO, dir));
      items.push({ id: id, name: fm.name || rel.split('/').pop(), type: type,
        category: fm.category || fm.mode || (type === 'recipe' ? 'motion' : ''), description: fm.description || '',
        triggers: (fm.triggers || []).slice(0, 12), source: source, enabled: disabled.indexOf(id) < 0 });
    }
    findSkillDirs(path.join(REPO, 'skills'), 2, 'skills', []).forEach(function (e) { add(e.rel, e.dir, 'skill', 'built-in'); });
    findSkillDirs(path.join(REPO, 'recipes'), 2, 'recipes', []).forEach(function (e) { add(e.rel, e.dir, 'recipe', 'built-in'); });
    findSkillDirs(USER_SKILLS_DIR, 1, 'app/user-skills', []).forEach(function (e) { add(e.rel, e.dir, 'skill', 'user'); });
    items.sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    return items;
  }
  function skillDetail(id) {
    var dir = resolveSkillDir(id); if (!dir) return null;
    var body = ''; try { body = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'); } catch (e) {}
    var files = [];
    (function walk(d, rel) {
      fs.readdirSync(d, { withFileTypes: true }).forEach(function (f) {
        if (f.name.charAt(0) === '.') return;
        var rp = (rel ? rel + '/' : '') + f.name;
        if (f.isDirectory()) walk(path.join(d, f.name), rp);
        else { var sz = 0; try { sz = fs.statSync(path.join(d, f.name)).size; } catch (e) {} files.push({ path: rp, bytes: sz }); }
      });
    })(dir, '');
    files.sort(function (a, b) { return a.path < b.path ? -1 : 1; });
    return { id: id, body: body, files: files };
  }
  function createUserSkill(body) {
    var name = String((body && body.name) || '').trim();
    var slug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'skill';
    var dir = path.join(USER_SKILLS_DIR, slug), n = 1;
    while (fs.existsSync(dir)) { dir = path.join(USER_SKILLS_DIR, slug + '-' + (++n)); }
    fs.mkdirSync(dir, { recursive: true });
    var triggers = String((body && body.triggers) || '').split(/[\n,]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var fm = ['---', 'name: ' + (name || slug), 'description: |', '  ' + String((body && body.description) || '').replace(/\n/g, '\n  '),
      'triggers:'].concat(triggers.map(function (t) { return '  - "' + t.replace(/"/g, '\\"') + '"'; }))
      .concat(['od:', '  mode: prototype', '  surface: web', '---', '']).join('\n');
    fs.writeFileSync(path.join(dir, 'SKILL.md'), fm + (String((body && body.md) || '# ' + (name || slug) + '\n')));
    return skillId(path.relative(REPO, dir));
  }
  // ================= HyperFrames HTML→video render (high-quality path) =================
  // Wrap a self-contained HTML artifact as a minimal HyperFrames composition: the artifact runs in
  // a same-origin srcdoc iframe; a single paused GSAP timeline (what HF drives per frame) seeks the
  // iframe's CSS/WAAPI animations to the same time — so any CSS-animation page renders faithfully to
  // MP4 via HF's frame-accurate Chrome capture (WebGL-capable). rAF/JS-clock motion is not seekable
  // this way (a known limit; see HTML-TO-VIDEO.md). Requires `npx hyperframes` (Node ≥22 + FFmpeg).
  var HF_BIN = process.env.HYPERFRAMES_BIN || 'npx';
  function hfArgs(rest) { return HF_BIN === 'npx' ? ['--yes', 'hyperframes@latest'].concat(rest) : rest; }
  function hfWrapperHtml(artifactHtml, o) {
    o = o || {}; var dur = Math.max(1, Math.min(60, +o.duration || 6));
    var res = o.resolution === 'portrait' ? 'portrait' : 'landscape';
    var W = res === 'portrait' ? 1080 : 1920, H = res === 'portrait' ? 1920 : 1080;
    var srcdoc = String(artifactHtml).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return '<!doctype html>\n<html lang="en" data-resolution="' + res + '">\n<head>\n' +
      '<meta charset="UTF-8"/>\n<meta name="viewport" content="width=' + W + ', height=' + H + '"/>\n' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:#000}#ma{width:' + W + 'px;height:' + H + 'px;border:0;display:block}</style>\n' +
      '</head>\n<body>\n' +
      '<div id="root" data-composition-id="main" data-start="0" data-duration="' + dur + '" data-width="' + W + '" data-height="' + H + '">\n' +
      '<iframe id="ma" sandbox="allow-same-origin allow-scripts" srcdoc="' + srcdoc + '"></iframe>\n' +
      '</div>\n<script>\n' +
      '// HyperFrames drives this per frame: __hf.seek(t) sets every page animation to time t (seconds).\n' +
      'var anims=[];\n' +
      'function grab(){ try{ var d=document.getElementById("ma").contentDocument; anims=(d&&d.getAnimations)?d.getAnimations():[]; anims.forEach(function(a){try{a.pause();}catch(e){}}); }catch(e){ anims=[]; } }\n' +
      'grab();\n' +
      'window.__hf={ duration:' + dur + ', seek:function(t){ if(!anims.length) grab(); anims.forEach(function(a){ try{a.currentTime=(t||0)*1000;}catch(e){} }); } };\n' +
      'window.__timelines=window.__timelines||{};\n' +
      '</' + 'script>\n</body>\n</html>\n';
  }
  function hfRender(slug, o, cb) {
    var pdir = safeProjectDir(slug); if (!pdir) return cb(new Error('invalid slug'));
    var idx = path.join(pdir, 'index.html'); if (!fs.existsSync(idx)) return cb(new Error('no HTML artifact for this project'));
    var html; try { html = fs.readFileSync(idx, 'utf8'); } catch (e) { return cb(e); }
    var tmp; try { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-hf-')); fs.writeFileSync(path.join(tmp, 'index.html'), hfWrapperHtml(html, o)); } catch (e) { return cb(e); }
    var out = path.join(pdir, 'launch.mp4');
    var args = hfArgs(['render', '--quality', (o.quality || 'high'), '--resolution', (o.resolution === 'portrait' ? 'portrait' : 'landscape'), '--output', out]);
    var child, err = '', done = false;
    try { child = spawn(HF_BIN, args, { cwd: tmp, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { return cb(e); }
    var killer = setTimeout(function () { try { child.kill('SIGKILL'); } catch (e) {} }, 600000);
    child.stdout.on('data', function (d) { process.stdout.write('  ▮ hf ' + String(d).replace(/\s+$/, '').slice(-72) + '\r'); });
    child.stderr.on('data', function (d) { err += d; });
    child.on('error', function (e) { if (done) return; done = true; clearTimeout(killer); cb(e); });
    child.on('close', function (code) {
      if (done) return; done = true; clearTimeout(killer);
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
      if (fs.existsSync(out) && fs.statSync(out).size > 1000) return cb(null, { path: 'projects/' + slug + '/launch.mp4', bytes: fs.statSync(out).size });
      cb(new Error('hyperframes render failed (exit ' + code + '). ' + String(err).trim().slice(-220)));
    });
  }
  function readBody(req, cb) { let b = ''; req.on('data', function (d) { b += d; }); req.on('end', function () { try { cb(null, b ? JSON.parse(b) : {}); } catch (e) { cb(e); } }); }
  function sendJson(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); }
  function handleApi(req, res) {
    if (req.method === 'GET' && req.url === '/api/clis') return sendJson(res, 200, { clis: scanClis() });
    // AMR (vela) BYOK config — key is stored locally in app/user-amr.json and never echoed back in full.
    if (req.method === 'GET' && req.url === '/api/amr-config') {
      var ac = readAmrConfig();
      return sendJson(res, 200, { hasKey: !!ac.key, keyTail: ac.key ? String(ac.key).slice(-4) : '', linkUrl: ac.linkUrl || '', model: ac.model || AMR_DEFAULT_MODEL });
    }
    if (req.method === 'POST' && req.url === '/api/amr-config') {
      return readBody(req, function (e, body) {
        if (e) return sendJson(res, 400, { error: 'bad JSON' });
        try { var saved = writeAmrConfig({ key: body.key, linkUrl: body.linkUrl, model: body.model }); }
        catch (e2) { return sendJson(res, 500, { error: String(e2.message || e2) }); }
        return sendJson(res, 200, { ok: true, hasKey: !!saved.key, model: saved.model || AMR_DEFAULT_MODEL });
      });
    }
    // BYOK config — key stored locally in app/user-byok.json, echoed as tail-4 only.
    if (req.method === 'GET' && req.url === '/api/byok-config') {
      var bc = readByokConfig();
      return sendJson(res, 200, { hasKey: !!bc.key, keyTail: bc.key ? String(bc.key).slice(-4) : '', provider: bc.provider || 'anthropic', model: bc.model || '' });
    }
    if (req.method === 'POST' && req.url === '/api/byok-config') {
      return readBody(req, function (e, body) {
        if (e) return sendJson(res, 400, { error: 'bad JSON' });
        var prov = String(body.provider || '').trim();
        if (prov && ['anthropic', 'openai', 'google'].indexOf(prov) < 0) return sendJson(res, 400, { error: 'unknown provider' });
        try { var saved = writeByokConfig({ provider: prov, key: body.key, model: body.model }); }
        catch (e2) { return sendJson(res, 500, { error: String(e2.message || e2) }); }
        return sendJson(res, 200, { ok: true, hasKey: !!saved.key, provider: saved.provider || 'anthropic', model: saved.model || '' });
      });
    }
    if (req.method === 'GET' && req.url === '/api/projects') return sendJson(res, 200, { projects: listProjects() });
    // ---- HyperFrames HTML→video (high-quality render) ----
    if (req.method === 'POST' && req.url === '/api/hf-render') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.slug) return sendJson(res, 400, { error: 'slug required' });
        console.log('  ▮ hf-render: ' + body.slug + ' (' + (body.resolution || 'landscape') + ', ' + (body.duration || 6) + 's)');
        hfRender(body.slug, { duration: body.duration, resolution: body.resolution, quality: body.quality }, function (err, r) {
          if (err) { console.log('  ▮ hf-render failed: ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          console.log('  ▮ hf-render ok: ' + r.path + ' (' + Math.round(r.bytes / 1024) + ' KB)');
          return sendJson(res, 200, { ok: true, path: r.path, bytes: r.bytes });
        });
      });
    }
    // ---- Skills registry ----
    if (req.method === 'GET' && req.url === '/api/skills') return sendJson(res, 200, { skills: listSkills() });
    if (req.method === 'GET' && req.url.indexOf('/api/skills/detail') === 0) {
      var qid = ''; try { qid = decodeURIComponent((req.url.split('?id=')[1] || '').split('&')[0]); } catch (e) {}
      var det = skillDetail(qid); return det ? sendJson(res, 200, det) : sendJson(res, 404, { error: 'not found' });
    }
    if (req.method === 'POST' && req.url === '/api/skills/toggle') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.id) return sendJson(res, 400, { error: 'bad request' });
        var st = skillState(), dis = st.disabled || [], i = dis.indexOf(body.id);
        if (body.enabled === false) { if (i < 0) dis.push(body.id); } else { if (i >= 0) dis.splice(i, 1); }
        st.disabled = dis; saveSkillState(st);
        console.log('  ⊞ skill ' + (body.enabled === false ? 'disabled' : 'enabled') + ': ' + body.id);
        return sendJson(res, 200, { ok: true, enabled: body.enabled !== false });
      });
    }
    if (req.method === 'POST' && req.url === '/api/skills/new') {
      return readBody(req, function (e, body) {
        if (e || !body || !String(body.name || '').trim()) return sendJson(res, 400, { error: 'name required' });
        try { var id = createUserSkill(body); console.log('  ⊞ new user skill: ' + id); return sendJson(res, 200, { ok: true, id: id }); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
      });
    }
    if (req.method === 'POST' && req.url === '/api/skills/delete') {
      return readBody(req, function (e, body) {
        var id = body && body.id;
        if (!id || id.indexOf('app/user-skills/') !== 0) return sendJson(res, 400, { error: 'only user skills can be deleted' });
        var dir = resolveSkillDir(id); if (!dir) return sendJson(res, 404, { error: 'not found' });
        try { fs.rmSync(dir, { recursive: true, force: true }); var st = skillState(); st.disabled = (st.disabled || []).filter(function (x) { return x !== id; }); saveSkillState(st); return sendJson(res, 200, { ok: true }); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/delete') {
      return readBody(req, function (e, body) {
        const dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        try { fs.rmSync(dir, { recursive: true, force: true }); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  🗑  deleted ' + body.slug);
        return sendJson(res, 200, { ok: true });
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/rename') {
      return readBody(req, function (e, body) {
        const dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        const title = String((body && body.title) || '').slice(0, 300).trim();
        if (!title) return sendJson(res, 400, { error: 'empty title' });
        let meta = {};
        try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (e2) {}
        meta.slug = body.slug; meta.title = title; if (!meta.created) meta.created = Date.now();
        try { fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2)); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  ✎  renamed ' + body.slug + ' → ' + title);
        return sendJson(res, 200, { ok: true });
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/save') {
      return readBody(req, function (e, body) {
        const dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        const html = body && body.html;
        if (typeof html !== 'string' || !html.trim()) return sendJson(res, 400, { error: 'empty html' });
        if (html.length > 5 * 1024 * 1024) return sendJson(res, 413, { error: 'too large' });
        try { fs.writeFileSync(path.join(dir, 'index.html'), html); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  💾  saved motion → ' + body.slug + ' (' + Buffer.byteLength(html) + ' bytes)');
        return sendJson(res, 200, { ok: true, bytes: Buffer.byteLength(html) });
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-project/save') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.comp) return sendJson(res, 400, { error: 'missing comp' });
        var slug = (body.slug && /^[A-Za-z0-9_-]+$/.test(body.slug) && body.slug !== 'landing-demo') ? body.slug : ('vid-' + Date.now());
        var dir = safeProjectDir(slug);
        if (!dir) return sendJson(res, 400, { error: 'invalid slug' });
        var json;
        try { json = JSON.stringify(body.comp); } catch (err) { return sendJson(res, 400, { error: 'bad comp' }); }
        if (json.length > 8 * 1024 * 1024) return sendJson(res, 413, { error: 'too large' });
        try {
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'comp.json'), json);
          var meta = {};
          try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (_) {}
          meta.slug = slug; meta.kind = 'video';
          meta.title = String(body.title || meta.title || 'Launch video').slice(0, 300);
          meta.designSystem = body.designSystem || meta.designSystem || null;
          meta.motionProfile = body.motionProfile || meta.motionProfile || null;
          if (!meta.created) meta.created = Date.now();
          fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
          if (typeof body.chat === 'string' && body.chat.length < 4 * 1024 * 1024) fs.writeFileSync(path.join(dir, 'chat.html'), body.chat);   // persist the left-side conversation
        } catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  💾  saved video → ' + slug + ' (' + Buffer.byteLength(json) + ' bytes)');
        return sendJson(res, 200, { ok: true, slug: slug });
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/chat') {   // persist the left-side conversation for any project (HTML or video)
      return readBody(req, function (e, body) {
        var dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        if (typeof body.chat !== 'string' || body.chat.length > 4 * 1024 * 1024) return sendJson(res, 400, { error: 'bad chat' });
        try { fs.writeFileSync(path.join(dir, 'chat.html'), body.chat); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        return sendJson(res, 200, { ok: true });
      });
    }
    if (req.method === 'GET' && req.url === '/api/user-plugins') return sendJson(res, 200, listUserPlugins());
    if (req.method === 'POST' && req.url === '/api/plugin/import') {
      return readBody(req, function (e, body) {
        if (e || !body) return sendJson(res, 400, { error: 'bad request' });
        function finishImport(err, r) {
          if (err) { console.log('  ✗ plugin import: ' + err.message);
            return sendJson(res, /recognizable/.test(err.message || '') ? 422 : 500, { error: String(err.message || err) }); }
          console.log('  ⊕ imported plugin ' + r.id + ' (' + r.type + ')');
          sendJson(res, 200, Object.assign({ ok: true }, r));
        }
        if (body.source) {   // From GitHub
          console.log('  ⎇ importing plugin from ' + String(body.source).slice(0, 80));
          return fetchGithubPlugin(body.source)
            .then(function (pkg) { importPlugin(pkg.name, pkg.files, finishImport); })
            .catch(function (err) { console.log('  ✗ github import: ' + err.message); sendJson(res, 502, { error: String(err.message || err) }); });
        }
        if (body.zipB64) {   // Upload zip
          console.log('  ⤓ importing plugin from zip ' + String(body.zipName || ''));
          return importZip(body.zipName, body.zipB64, finishImport);
        }
        if (!Array.isArray(body.files) || !body.files.length) return sendJson(res, 400, { error: 'no files' });
        importPlugin(body.name, body.files, finishImport);
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/import') {
      return readBody(req, function (e, body) {
        if (e || !body) return sendJson(res, 400, { error: 'bad request' });
        let html = body && body.html;
        if (typeof html !== 'string' || !html.trim()) return sendJson(res, 400, { error: 'empty html' });
        if (html.length > 5 * 1024 * 1024) return sendJson(res, 413, { error: 'too large' });
        const name = String((body && body.name) || 'imported.html').slice(0, 200);
        // Wrap a bare fragment into a minimal full document so the preview + component editor work.
        if (!/<html[\s>]|<!doctype html/i.test(html)) {
          html = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' +
            name.replace(/[<>&]/g, '') + '</title>\n</head>\n<body>\n' + html + '\n</body>\n</html>\n';
        }
        const slug = 'import-' + Date.now();
        const dir = path.join(appDir, 'projects', slug);
        let title = name.replace(/\.html?$/i, '');
        const tm = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (tm && tm[1].trim()) title = tm[1].trim();
        try {
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, 'index.html'), html);
          fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({
            slug: slug, title: title, brief: 'Imported: ' + name, imported: true, created: Date.now()
          }, null, 2));
        } catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  ⤓ imported ' + name + ' → ' + slug + ' (' + Buffer.byteLength(html) + ' bytes)');
        return sendJson(res, 200, { ok: true, slug: slug, path: 'projects/' + slug + '/index.html', title: title });
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/design-system') {
      return readBody(req, function (e, body) {
        const dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        const ds = String((body && body.designSystem) || '');
        if (ds && !/^[A-Za-z0-9_-]+$/.test(ds)) return sendJson(res, 400, { error: 'bad design system id' });
        let meta = {}; try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (e2) {}
        meta.slug = body.slug; meta.designSystem = ds || null; if (!meta.created) meta.created = Date.now();
        try { fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2)); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  ◐ ' + body.slug + ' design system → ' + (ds || '(none)'));
        return sendJson(res, 200, { ok: true });
      });
    }
    if (req.method === 'POST' && req.url === '/api/project/motion-profile') {
      return readBody(req, function (e, body) {
        const dir = safeProjectDir(body && body.slug);
        if (!dir || !fs.existsSync(dir)) return sendJson(res, 400, { error: 'invalid slug' });
        const mp = String((body && body.motionProfile) || '');
        if (mp && !/^[A-Za-z0-9_-]+$/.test(mp)) return sendJson(res, 400, { error: 'bad motion profile id' });
        let meta = {}; try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch (e2) {}
        meta.slug = body.slug; meta.motionProfile = mp || null; if (!meta.created) meta.created = Date.now();
        try { fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2)); }
        catch (err) { return sendJson(res, 500, { error: String(err.message || err) }); }
        console.log('  ✦ ' + body.slug + ' motion profile → ' + (mp || '(default)'));
        return sendJson(res, 200, { ok: true });
      });
    }
    if (req.method === 'POST' && req.url === '/api/motion-suggest') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.instruction) return sendJson(res, 400, { error: 'missing instruction' });
        console.log('  ✦ motion-suggest [' + String(body.component || '') + ']: ' + String(body.instruction).slice(0, 60));
        runMotionSuggest(body, function (err, motion) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          sendJson(res, 200, { ok: true, motion: motion });
        });
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-replicate') {
      return readBody(req, function (e, body) {
        if (e || !body || !Array.isArray(body.frames) || !body.frames.length) return sendJson(res, 400, { error: 'missing frames' });
        console.log('  ✦ video-replicate: ' + body.frames.length + ' frames, ' + Math.round(body.w || 0) + 'x' + Math.round(body.h || 0));
        runReplicate(body, function (err, comp) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          sendJson(res, 200, { ok: true, comp: comp });
        });
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-generate-stream') {
      return readBody(req, function (e, body) {
        if (e || !body || (!body.brief && !body.doc)) return sendJson(res, 400, { error: 'missing brief or doc' });
        var tpls = matchVideoTemplates(body.brief, body.doc, 3);
        var tlist = tpls.map(function (t) { return { id: t.id, title: t.title }; });
        console.log('  ✦ video-generate-stream: ' + String(body.brief || '').slice(0, 50) + (tpls.length ? ' ~' + tpls.length + 'tpl' : ''));
        sseHead(res);
        sse(res, 'templates', { templates: tlist });
        sse(res, 'phase', { phase: 'generate' });
        var alive = true; res.on('close', function () { alive = false; });   // client disconnected (NOT the request body finishing)
        var child = runAgentStream(buildVideoGenPrompt(body.brief, body.doc, body.w, body.h, body.designSystem, body.motionProfile, tpls), body.cli, 600000, {
          text: function (t) { sse(res, 'text', { text: t }); },
          tool: function (n, s) { sse(res, 'tool', { name: n, summary: s }); },
          error: function (err) { console.log('  ✗ ' + err.message); sse(res, 'error', { error: String(err.message || err) }); res.end(); },
          done: function (comp, note) {
            if (!alive) return res.end();
            if (body.verify === false) { sse(res, 'done', { comp: comp, note: note, templates: tlist }); return res.end(); }
            sse(res, 'phase', { phase: 'verify' });   // auto self-verification pass
            var vchild = runAgentStream(buildVideoVerifyPrompt(comp, body.brief, body.designSystem), body.cli, 300000, {
              text: function (t) { sse(res, 'text', { text: t }); },
              tool: function (n, s) { sse(res, 'tool', { name: n, summary: s }); },
              error: function () { sse(res, 'done', { comp: comp, note: note, templates: tlist }); res.end(); },   // verify failed → keep phase-1
              done: function (comp2, note2) { sse(res, 'done', { comp: comp2 || comp, note: note2 || note, refined: true, templates: tlist }); res.end(); }
            });
            res.on('close', function () { killCli(vchild); });
          }
        });
        res.on('close', function () { killCli(child); });
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-edit-stream') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.comp || !body.instruction) return sendJson(res, 400, { error: 'missing comp or instruction' });
        console.log('  ✎ video-edit-stream: ' + String(body.instruction).slice(0, 50));
        sseHead(res);
        sse(res, 'phase', { phase: 'edit' });
        var child = runAgentStream(buildVideoEditPrompt(body.comp, body.instruction, body.designSystem, body.motionProfile), body.cli, 300000, {
          text: function (t) { sse(res, 'text', { text: t }); },
          tool: function (n, s) { sse(res, 'tool', { name: n, summary: s }); },
          error: function (err) { console.log('  ✗ ' + err.message); sse(res, 'error', { error: String(err.message || err) }); res.end(); },
          done: function (comp, note) { sse(res, 'done', { comp: comp, note: note }); res.end(); }
        });
        res.on('close', function () { killCli(child); });
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-generate') {
      return readBody(req, function (e, body) {
        if (e || !body || (!body.brief && !body.doc)) return sendJson(res, 400, { error: 'missing brief or doc' });
        var tpls = matchVideoTemplates(body.brief, body.doc, 3);
        console.log('  ✦ video-generate: ' + String(body.brief || '').slice(0, 60) + (body.doc ? ' [+doc ' + String(body.doc).length + ']' : '') + (body.designSystem ? ' [' + body.designSystem + ']' : '') + (body.motionProfile ? ' {' + body.motionProfile + '}' : '') + (tpls.length ? ' ~' + tpls.length + 'tpl' : ''));
        runAgentJson(buildVideoGenPrompt(body.brief, body.doc, body.w, body.h, body.designSystem, body.motionProfile, tpls), body.cli, function (err, comp, note) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          sendJson(res, 200, { ok: true, comp: comp, note: note || '', templates: tpls.map(function (t) { return { id: t.id, title: t.title }; }) });
        }, 600000);   // generous cap: the agent may research a repo/URL before producing
      });
    }
    if (req.method === 'POST' && req.url === '/api/video-edit') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.comp || !body.instruction) return sendJson(res, 400, { error: 'missing comp or instruction' });
        console.log('  ✎ video-edit: ' + String(body.instruction).slice(0, 60) + (body.designSystem ? ' [' + body.designSystem + ']' : ''));
        runAgentJson(buildVideoEditPrompt(body.comp, body.instruction, body.designSystem, body.motionProfile), body.cli, function (err, comp, note) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          sendJson(res, 200, { ok: true, comp: comp, note: note || '' });
        }, 300000);
      });
    }
    if (req.method === 'POST' && req.url === '/api/edit') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.slug || !body.instruction) return sendJson(res, 400, { error: 'missing slug or instruction' });
        console.log('  ✎ editing ' + body.slug + (body.designSystem ? ' [' + body.designSystem + ']' : '') + (body.motionProfile ? ' {' + body.motionProfile + '}' : '') + ': ' + String(body.instruction).slice(0, 70) + '…');
        runEdit(body.slug, body.instruction, body.cli, body.scope, body.designSystem, body.motionProfile, function (err, r) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          console.log('  ✓ updated ' + r.path + ' (' + r.bytes + ' bytes)');
          sendJson(res, 200, Object.assign({ ok: true }, r));
        });
      });
    }
    if (req.method === 'POST' && req.url === '/api/generate') {
      return readBody(req, function (e, body) {
        if (e || !body || !body.brief) return sendJson(res, 400, { error: 'missing brief' });
        console.log('  → generating via ' + (body.cli || 'claude') +
          (body.designSystem ? ' [' + body.designSystem + ']' : '') + (body.motionProfile ? ' {' + body.motionProfile + '}' : '') + ': ' + String(body.brief).slice(0, 60) + '…');
        runGenerate(body.brief, body.cli, body.designSystem, body.motionProfile, function (err, r) {
          if (err) { console.log('  ✗ ' + err.message); return sendJson(res, 500, { error: String(err.message || err) }); }
          console.log('  ✓ wrote ' + r.path + ' (' + r.bytes + ' bytes)');
          sendJson(res, 200, Object.assign({ ok: true }, r));
        });
      });
    }
    return sendJson(res, 404, { error: 'no such api' });
  }

  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) return handleApi(req, res);
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel === '/') rel = '/index.html';
    // serve the app dir; also expose the repo's recipes/ for live previews
    let file = path.join(appDir, rel);
    if (rel.startsWith('/recipes/')) file = path.join(REPO, rel);
    if (!file.startsWith(REPO)) { res.writeHead(403); return res.end('forbidden'); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('not found: ' + rel); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  server.listen(port, '127.0.0.1', () => {
    const url = 'http://127.0.0.1:' + port + '/';
    console.log('\n✨ motion-anything is running:\n  ' + url + '\n\nPress Ctrl+C to stop.\n');
    openInBrowser(url);
  });
  server.on('error', (e) => fail('Could not start server on port ' + port + ': ' + e.message));
}

function cmdHelp() {
  console.log(
    [
      '',
      '✨ motion-anything — the agentic motion layer',
      '',
      'Usage:',
      '  motion serve [port]        Run the motion-anything app locally (default 4321)',
      '  motion list                List available motion recipes',
      '  motion add <recipe-id>     Export a recipe as a portable skill bundle',
      '  motion gallery             Open the possibility gallery in your browser',
      '',
      'Docs: README.md · recipes: AGENTS.md · the standard: MOTION-SPEC.md',
      '',
    ].join('\n')
  );
}

const [, , cmd, arg] = process.argv;
switch (cmd) {
  case 'list':
    cmdList();
    break;
  case 'add':
    cmdAdd(arg);
    break;
  case 'gallery':
    cmdGallery();
    break;
  case 'serve':
  case 'studio':
    cmdServe(arg);
    break;
  case undefined:
  case 'help':
  case '-h':
  case '--help':
    cmdHelp();
    break;
  default:
    fail('Unknown command "' + cmd + '". Run: motion help');
}
