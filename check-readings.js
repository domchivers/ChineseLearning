// node check-readings.js — every character in a reading must be taught by the end of its chapter.
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/data.js", "utf8"), ctx);
vm.runInContext(fs.readFileSync(__dirname + "/readings.js", "utf8"), ctx);
const VOCAB = ctx.window.VOCAB, READINGS = ctx.window.READINGS;
const src = fs.readFileSync(__dirname + "/app.js", "utf8");
const CH = eval(src.slice(src.indexOf("const CHAPTERS = [") + 17, src.indexOf("];", src.indexOf("const CHAPTERS = [")) + 1));
const isHan = c => /\p{Script=Han}/u.test(c);
let bad = 0;
READINGS.forEach(r => {
  const ids = CH.slice(0, r.chapter + 1).flatMap(c => c.lessons);
  const words = VOCAB.lessons.filter(l => ids.includes(l.id)).flatMap(l => l.words);
  const chars = new Set(words.flatMap(w => [...w.hanzi].filter(isHan)));
  const miss = new Set();
  r.sentences.flat().forEach(t => { const h = t.split("|")[0]; [...h].filter(isHan).forEach(c => { if (!chars.has(c)) miss.add(c); }); if (t.includes("|") && t.split("|").length !== 3) { console.log("bad token", t); bad++; } });
  if (r.q.answer == null || !r.q.options[r.q.answer]) { console.log(r.id, "bad question"); bad++; }
  console.log(r.id, r.title, miss.size ? "MISSING " + [...miss].join(" ") : "ok");
  bad += miss.size;
});
process.exit(bad ? 1 : 0);
