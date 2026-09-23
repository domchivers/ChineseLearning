/*
 * 步步 Path Editor — local server.
 *
 * Reads the path straight out of the app (app.js, data.js, images/path) every
 * time the editor loads, and writes the layout back into app.js when you save.
 * No dependencies: plain Node. Start it with start.bat next to this file.
 *
 *   GET  /                 the editor
 *   GET  /app/...          the app's own files (art, fonts, and the app itself for preview)
 *   GET  /api/project      chapters, stones, art, layout and build number, as the app has them now
 *   GET  /api/events       server-sent events: "changed" when app.js or data.js change on disk
 *   POST /api/save         { layout, baseHash, bump } -> writes PATH_LAYOUT into app.js
 *   POST /api/publish      { message } -> git commit of the saved files and push
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFile, exec } = require("child_process");

const HERE = __dirname;
const APP = path.resolve(HERE, "..", "..");
const UI = path.join(HERE, "ui");
const BACKUPS = path.join(HERE, "backups");
const PORT_FIRST = +(process.env.PORT || 5178);
const FILES = { app: path.join(APP, "app.js"), data: path.join(APP, "data.js"), index: path.join(APP, "index.html"), sw: path.join(APP, "sw.js") };

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

const read = f => fs.readFileSync(f, "utf8");
const hash = s => crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);
const log = (...a) => console.log(new Date().toLocaleTimeString(), ...a);

/* ---- pulling literals out of app.js -------------------------------------
   Finds `const NAME = ` and returns the object/array literal after it, by
   bracket matching that skips strings and comments. */
function literalSpan(src, name) {
  const m = new RegExp("\\bconst " + name + "\\s*=\\s*").exec(src);
  if (!m) throw new Error("app.js has no `const " + name + "`");
  let i = m.index + m[0].length;
  const open = src[i], close = open === "{" ? "}" : open === "[" ? "]" : null;
  if (!close) throw new Error("`" + name + "` is not an object or array literal");
  let depth = 0, j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === '"' || c === "'" || c === "`") { const q = c; j++; while (j < src.length && src[j] !== q) { if (src[j] === "\\") j++; j++; } continue; }
    if (c === "/" && src[j + 1] === "/") { while (j < src.length && src[j] !== "\n") j++; continue; }
    if (c === "/" && src[j + 1] === "*") { j = src.indexOf("*/", j + 2) + 1; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) break;
  }
  return { start: i, end: j + 1, text: src.slice(i, j + 1) };
}
const evalLiteral = text => new Function("return (" + text + ");")();
const literal = (src, name) => evalLiteral(literalSpan(src, name).text);

function loadVocab() {
  const w = {};
  new Function("window", read(FILES.data))(w);
  return w.VOCAB;
}

// The same rule the app uses (lessonHero in app.js): the first character of a
// lesson's words that no earlier stone shows, word-initial characters first.
function heroes(lessons) {
  const cjk = s => [...s].filter(c => /[一-鿿]/.test(c));
  const used = new Set(), out = {};
  lessons.forEach(l => {
    const firsts = l.words.map(w => cjk(w.hanzi)[0]).filter(Boolean);
    const ch = firsts.find(c => !used.has(c)) || l.words.flatMap(w => cjk(w.hanzi)).find(c => !used.has(c)) || firsts[0] || "字";
    used.add(ch); out[l.id] = ch;
  });
  return out;
}

// Which picture each piece of art uses in each theme: <art>-light/-dark.webp
// when the art has night versions, else one <art>.webp for both.
function artFiles(names) {
  const dir = path.join(APP, "images", "path"), have = new Set(fs.readdirSync(dir));
  const out = {};
  names.forEach(a => {
    out[a] = {};
    ["light", "dark"].forEach(t => {
      const f = have.has(`${a}-${t}.webp`) ? `${a}-${t}.webp` : have.has(`${a}.webp`) ? `${a}.webp` : null;
      out[a][t] = f && "app/images/path/" + f;
    });
  });
  return out;
}

function buildNumber() {
  const m = /zh-beginner-a-v(\d+)/.exec(read(FILES.sw));
  return m ? +m[1] : null;
}

function project() {
  const src = read(FILES.app), vocab = loadVocab();
  const chapters = literal(src, "CHAPTERS"), art = literal(src, "ART");
  const lessonIds = new Set(vocab.lessons.map(l => l.id));
  const missing = chapters.flatMap(c => c.lessons).filter(id => !lessonIds.has(id));
  const titles = Object.fromEntries(vocab.lessons.map(l => [l.id, l.title]));
  return {
    hash: hash(src + read(FILES.data)),
    build: buildNumber(),
    loadedAt: Date.now(),
    chapters, titles, missing,
    heroes: heroes(vocab.lessons),
    layout: literal(src, "PATH_LAYOUT"),
    art, artFiles: artFiles(Object.keys(art)),
    slabs: literal(src, "SLABS"),
    lights: literal(src, "PATH_LIGHTS"),
    template: literal(src, "PATH_TEMPLATE"),
    cfg: literal(src, "PATH_CFG"),
    phoneMax: +(/pathIsPhone = \(\) => window\.matchMedia\("\(max-width: (\d+)px\)"\)/.exec(src) || [0, 699])[1],
    hero: literal(src, "HERO"),
    stoneRatio: +(/const STONE_RATIO\s*=\s*([\d.]+)/.exec(src) || [0, 1.62])[1],
    git: gitStatus()
  };
}

let gitCache = { at: 0, v: null };
function gitStatus() { return gitCache.v; }
function refreshGit() {
  execFile("git", ["status", "--porcelain", "--branch"], { cwd: APP }, (err, out) => {
    if (err) { gitCache.v = { ok: false }; return; }
    const lines = out.trim().split("\n"), head = lines.shift() || "";
    const ahead = +(/ahead (\d+)/.exec(head) || [0, 0])[1];
    gitCache.v = { ok: true, branch: (/## ([^.\s]+)/.exec(head) || [0, "?"])[1], dirty: lines.filter(Boolean).map(l => l.slice(3)), ahead };
  });
}

/* ---- writing the layout back -------------------------------------------- */
function formatLayout(layout) {
  const clean = {
    version: 1, phone: true,
    headers: layout.headers || {},
    pieces: (layout.pieces || []).map(p => ({ art: p.art, stone: p.stone, dx: +(+p.dx).toFixed(1), dy: +(+p.dy).toFixed(1),
      w: +(+p.w).toFixed(1), flip: !!p.flip, behind: !!p.behind }))
  };
  // one line per piece, so a change reads cleanly in a diff
  const q = JSON.stringify;
  const heads = Object.entries(clean.headers).map(([k, v]) => `${q(k)}: ${q(v)}`).join(", ");
  const rows = clean.pieces.map(p => `      { art: ${q(p.art)}, stone: ${q(p.stone)}, dx: ${p.dx}, dy: ${p.dy}, w: ${p.w}, flip: ${p.flip}, behind: ${p.behind} }`);
  return "{\n    version: 1,\n    phone: true,\n    headers: { " + heads + " },\n    pieces: [\n" + rows.join(",\n") + (rows.length ? "\n" : "") + "    ]\n  }";
}

function bumpBuild() {
  const old = buildNumber(); if (old == null) throw new Error("couldn't find the build number in sw.js");
  const next = old + 1;
  const swap = (file, pairs) => {
    let s = read(file);
    pairs.forEach(([a, b]) => { s = s.split(a).join(b); });
    fs.writeFileSync(file, s);
  };
  swap(FILES.sw, [[`?v=${old}"`, `?v=${next}"`], [`zh-beginner-a-v${old}"`, `zh-beginner-a-v${next}"`]]);
  swap(FILES.index, [[`?v=${old}"`, `?v=${next}"`]]);
  swap(FILES.app, [[`const ASSET_V = "?v=${old}"`, `const ASSET_V = "?v=${next}"`]]);
  return { from: old, to: next };
}

function backup() {
  fs.mkdirSync(BACKUPS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const f = path.join(BACKUPS, `app.js.${stamp}.bak`);
  fs.copyFileSync(FILES.app, f);
  // keep the newest 30
  fs.readdirSync(BACKUPS).filter(n => n.endsWith(".bak")).sort().reverse().slice(30).forEach(n => fs.unlinkSync(path.join(BACKUPS, n)));
  return path.basename(f);
}

function save(body) {
  const src = read(FILES.app);
  const now = hash(src + read(FILES.data));
  if (body.baseHash && body.baseHash !== now) {
    const e = new Error("The app's files changed since the editor loaded them. Reload to pick up the changes; your edits are kept as a draft.");
    e.status = 409; throw e;
  }
  const span = literalSpan(src, "PATH_LAYOUT");
  const text = formatLayout(body.layout);
  evalLiteral(text);                         // must parse before it goes anywhere near the app
  const bak = backup();
  fs.writeFileSync(FILES.app, src.slice(0, span.start) + text + src.slice(span.end));
  let build = null;
  if (body.bump !== false) build = bumpBuild();
  selfWrite = Date.now();
  refreshGit();
  log(`saved layout: ${body.layout.pieces.length} pieces${build ? `, build v${build.from} → v${build.to}` : ""} (backup ${bak})`);
  return { ok: true, backup: bak, build, hash: hash(read(FILES.app) + read(FILES.data)), pieces: body.layout.pieces.length };
}

// Runs git in the app folder; resolves with { code, out }.
const git = args => new Promise(resolve =>
  execFile("git", args, { cwd: APP }, (err, out, errOut) => resolve({ code: err ? (err.code || 1) : 0, out: ((out || "") + (errOut || "")).trim() })));

// Commits only the files the editor writes (app.js, index.html, sw.js) and
// pushes, which puts the layout live on the phone.
async function publish(body) {
  const msg = String(body.message || "Path layout").slice(0, 200);
  const fail = m => Object.assign(new Error(m), { status: 500 });
  let r = await git(["add", "--", "app.js", "index.html", "sw.js"]);
  if (r.code) throw fail(r.out);
  const staged = (await git(["diff", "--cached", "--quiet", "--", "app.js", "index.html", "sw.js"])).code !== 0;
  if (staged) {
    r = await git(["commit", "-m", msg + "\n\nSaved from the path editor.", "--", "app.js", "index.html", "sw.js"]);
    if (r.code) throw fail(r.out);
  }
  r = await git(["push", "origin", "HEAD"]);
  refreshGit();
  if (r.code) throw fail((staged ? "Committed, but the push failed: " : "The push failed: ") + r.out);
  log("published: " + msg);
  return { ok: true, committed: staged, output: r.out.split("\n").slice(-1)[0] };
}

/* ---- watching the app for changes made elsewhere -------------------------- */
const clients = new Set();
let selfWrite = 0, watchTimer = null;
function announce() {
  if (Date.now() - selfWrite < 1500) return;       // our own save, not news
  clearTimeout(watchTimer);
  watchTimer = setTimeout(() => {
    let h = null; try { h = hash(read(FILES.app) + read(FILES.data)); } catch (e) { return; }
    refreshGit();
    clients.forEach(res => res.write(`event: changed\ndata: ${JSON.stringify({ hash: h })}\n\n`));
    log("app files changed on disk");
  }, 300);
}
[FILES.app, FILES.data].forEach(f => fs.watchFile(f, { interval: 700 }, announce));
fs.watch(path.join(APP, "images", "path"), announce);
setInterval(refreshGit, 15000); refreshGit();

/* ---- http ----------------------------------------------------------------- */
function send(res, code, body, type) {
  res.writeHead(code, { "Content-Type": type || "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function serveFile(res, root, rel) {
  const f = path.normalize(path.join(root, rel));
  if (!f.startsWith(root)) return send(res, 403, "forbidden", "text/plain");
  fs.stat(f, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, "not found", "text/plain");
    res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(f).pipe(res);
  });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = ""; req.on("data", d => { s += d; if (s.length > 5e6) req.destroy(); });
    req.on("end", () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(Object.assign(e, { status: 400 })); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = decodeURIComponent(url.pathname);
  try {
    if (p === "/api/project") return send(res, 200, project());
    if (p === "/api/events") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
      res.write("retry: 2000\n\n"); clients.add(res);
      const ping = setInterval(() => res.write(": ping\n\n"), 20000);
      req.on("close", () => { clearInterval(ping); clients.delete(res); });
      return;
    }
    if (p === "/api/save" && req.method === "POST") return send(res, 200, save(await readBody(req)));
    if (p === "/api/publish" && req.method === "POST") return send(res, 200, await publish(await readBody(req)));
    if (p === "/api/git") { refreshGit(); return setTimeout(() => send(res, 200, gitStatus() || {}), 400); }
    // The preview runs the real app, but never its offline cache: a service
    // worker here would keep showing old files. This one removes itself.
    if (p === "/app/sw.js") return send(res, 200, "self.addEventListener('install',()=>self.skipWaiting());" +
      "self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));", "text/javascript; charset=utf-8");
    if (p.startsWith("/app/")) return serveFile(res, APP, p.slice(5));
    if (p === "/" || p === "/index.html") return serveFile(res, UI, "index.html");
    return serveFile(res, UI, p.slice(1));
  } catch (e) {
    log("error:", e.message);
    return send(res, e.status || 500, { ok: false, error: e.message });
  }
});

function listen(port, tries) {
  server.once("error", err => {
    if (err.code === "EADDRINUSE" && tries > 0) return listen(port + 1, tries - 1);
    console.error("Could not start the server: " + err.message); process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://localhost:${port}/`;
    console.log("");
    console.log("  步步 Path Editor");
    console.log("  ────────────────");
    console.log("  Editing:  " + APP);
    console.log("  Open:     " + url);
    console.log("");
    console.log("  Keep this window open while you edit. Close it to stop the editor.");
    console.log("");
    if (!process.env.NO_OPEN) exec(process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`);
  });
}
listen(PORT_FIRST, 10);
