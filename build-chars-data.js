/*
 * Builds chars-data.js: for every character used in data.js (lessons and
 * dialogues), its short meaning, reading, parts and a memory hook, plus the
 * meanings of those parts. Source: Make Me a Hanzi's dictionary.txt
 * (github.com/skishore/makemeahanzi, LGPL-3.0), downloaded on first run.
 *
 * Run with:  node build-chars-data.js
 * Re-run after adding words. Hand-written hooks in HOOKS below win over the
 * generated ones.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const SRC_URL = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const CACHE = path.join(__dirname, ".mmah-dictionary.txt");   // gitignored

// Hooks written by hand for the characters where the generated one is weak.
const HOOKS = {
  "好": "A woman 女 with her child 子. That's good.",
  "买": "买 buy vs 卖 sell: when you sell, you put something 十 on top to pass on.",
  "卖": "卖 sell has an extra 十 on top of 买 buy: you add something on top when you sell it on.",
  "人": "A person walking: two legs.",
  "入": "入 enter leans the other way from 人 person: a person stepping in.",
  "大": "A person 人 with arms stretched wide: big.",
  "太": "大 big with an extra dot: too big.",
  "天": "A line over a big 大 person: the sky above.",
  "口": "An open mouth.",
  "日": "The sun, drawn as a box with a line.",
  "月": "A crescent moon.",
  "山": "Three mountain peaks.",
  "木": "A tree with branches and roots.",
  "林": "Two trees 木: a wood.",
  "休": "A person 亻 leaning on a tree 木: rest.",
  "明": "Sun 日 and moon 月 together: bright.",
  "男": "Strength 力 in the field 田: a man.",
  "家": "A pig 豕 under a roof 宀: home.",
  "安": "A woman 女 under a roof 宀: safe, peaceful.",
  "字": "A child 子 under a roof 宀, learning to write: character.",
  "学": "A child 子 under a roof, studying: learn.",
  "们": "Person 亻 plus 门 mén for the sound: the plural for people.",
  "你": "A person 亻, the one you're talking to: you.",
  "他": "A person 亻: he.",
  "她": "A woman 女: she.",
  "吗": "A mouth 口 plus 马 mǎ for the sound: the question particle.",
  "妈": "A woman 女 plus 马 mǎ for the sound: mum.",
  "听": "A mouth 口 and an axe 斤: listen closely.",
  "说": "Speech 讠 plus 兑 for the sound: speak.",
  "看": "A hand 手 shading the eye 目: look.",
  "吃": "A mouth 口 plus 乞 for the sound: eat.",
  "喝": "A mouth 口 plus 曷 hé for the sound: drink.",
  "中": "A line through the middle of a box: middle.",
  "国": "Jade 玉 inside a border 囗: country.",
  "小": "A small thing split in two: small.",
  "不": "A bird flying up and not coming back: not.",
  "是": "The sun 日 over something correct: is, yes.",
  "七": "A cross with a hooked tail: seven.",
  "六": "A lid 亠 over two legs 八: six.",
  "十": "A full cross: ten, complete.",
  "千": "A slash 丿 over ten 十: a thousand.",
  "为": "Two drops around strength 力: to do, for.",
  "么": "A small hook 丿 over 厶: the ending of 什么, what.",
  "也": "A curving stroke that trails on: also.",
  "习": "A wing with frost 冫 on it, flapping again and again: practise.",
  "事": "A hand holding a writing brush over a mouth 口: a matter to deal with.",
  "以": "A person 人 with something in hand: using, by means of.",
  "关": "Two horns 丷 over the sky 天: closing the gate, to close.",
  "兴": "Hands lifting something up together: to rise, excited.",
  "务": "Slow steps 夂 with strength 力: a task, work to do.",
  "动": "Strength 力 moving the clouds 云: to move.",
  "午": "A pestle standing upright at midday: noon.",
  "卫": "A hook guarding a line: to guard.",
  "厅": "A cliff 厂 over a nail 丁 dīng: a hall.",
  "去": "Earth 土 over 厶: someone leaving the ground, to go.",
  "员": "A mouth 口 over a shell 贝, money: a staff member paid to talk.",
  "商": "A stand with goods on display: trade, business.",
  "场": "Earth 土 in the sun: an open ground, a place.",
  "尔": "A small 小 figure under a hat: you, that.",
  "德": "Walking 彳 with a straight heart 心: virtue.",
  "时": "The sun 日 measured by an inch 寸 of shadow: time.",
  "有": "A hand holding meat 月: to have.",
  "桌": "Something tall 卓 standing on wood 木: a table.",
  "欢": "A hand 又 and a yawning mouth 欠, laughing: happy.",
  "每": "A mother 母 with a hat on: each, every.",
  "皂": "White 白 over seven 七: soap.",
  "的": "White 白 and a ladle 勺: the target in the middle, and the everyday 'of'.",
  "答": "Bamboo 竹 over together 合: a written reply, answer.",
  "系": "A hand 丿 over silk thread 糸: tied together, a system.",
  "脑": "Flesh 月 with a head on top: brain.",
  "茶": "Grass 艹 over a person 人 and a tree 木: tea.",
  "蛋": "An insect 虫 under 疋: an egg.",
  "过": "Walking 辶 an inch 寸 further: to pass.",
  "这": "Walking 辶 to the writing 文 right here: this.",
  "那": "A city 阝 over there: that.",
  "餐": "Food 食 at the bottom: a meal.",
  "了": "A child wrapped up with no arms: done, finished.",
  // Beginner C
  "价": "A person 亻 in the middle 介 of a deal: the price.",
  "体": "A person 亻 at the root 本 of things: the body.",
  "便": "A person 亻 who changes 更 things to make life easy: convenient, and cheap in 便宜.",
  "前": "Two horns 丷 over a boat 月 with a knife 刂 cutting ahead: the front.",
  "发": "A friend 友 with a flick of hair: to send out, and 头发 hair.",
  "右": "A hand 𠂇 raising a mouth 口 to eat: the right hand, the one you eat with.",
  "后": "A figure bent over a mouth 口, giving orders from the back: behind, after.",
  "岁": "A mountain 山 over an evening 夕: the years pile up like mountains.",
  "市": "A lid 亠 over a cloth hung on a pole 巾: a stall's sign at the market.",
  "应": "Under a roof 广, the marks of a heart answering: what you should do (应该).",
  "斤": "A picture of an axe: an old weight, now half a kilo.",
  "毛": "A picture of a feather or a tuft of hair: fur, and 10 cents.",
  "牙": "A picture of a tooth with its long root.",
  "用": "A picture of a bucket with a handle: something to use.",
};

function download() {
  return new Promise((resolve, reject) => {
    const get = url => https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return get(res.headers.location);
      if (res.statusCode !== 200) return reject(new Error("HTTP " + res.statusCode));
      const out = []; res.on("data", d => out.push(d)); res.on("end", () => resolve(Buffer.concat(out).toString("utf8")));
    }).on("error", reject);
    get(SRC_URL);
  });
}

const short = def => {
  if (!def) return "";
  let s = def.split(/;/)[0].split(/,/)[0].trim();
  s = s.replace(/\(.*?\)/g, "").replace(/^radical number \d+\s*/i, "").trim();
  return s.length > 28 ? s.slice(0, 28).replace(/\s\S*$/, "") : s;
};
const IDC = /[⿰-⿻]/;

(async () => {
  let text;
  if (fs.existsSync(CACHE)) text = fs.readFileSync(CACHE, "utf8");
  else { text = await download(); fs.writeFileSync(CACHE, text); }
  const dict = {};
  for (const line of text.split("\n")) { if (line.trim()) { const e = JSON.parse(line); dict[e.character] = e; } }

  const sandbox = {};
  new Function("window", fs.readFileSync(path.join(__dirname, "data.js"), "utf8"))(sandbox);
  const used = new Set();
  const addAll = s => { for (const ch of s || "") if (/[一-鿿]/.test(ch)) used.add(ch); };
  for (const l of sandbox.VOCAB.lessons) for (const w of l.words) addAll(w.hanzi);
  for (const d of sandbox.DIALOGUES || []) for (const t of d.turns || []) addAll(t.hanzi);

  const chars = {}, parts = {};
  let missing = [];
  for (const ch of [...used].sort()) {
    const e = dict[ch];
    if (!e) { missing.push(ch); continue; }
    const et = e.etymology || {};
    const comps = [...(e.decomposition || "")].filter(c => !IDC.test(c) && c !== "？" && /[^\s]/.test(c) && c !== ch);
    const roles = comps.map(c => et.type === "pictophonetic" ? (c === et.phonetic ? "s" : c === et.semantic ? "m" : "") : et.type === "ideographic" ? "m" : "");
    comps.forEach(c => { if (dict[c] && !parts[c]) parts[c] = [short(dict[c].definition), (dict[c].pinyin || [""])[0]]; });
    let hook = HOOKS[ch];
    if (!hook) {
      if (et.type === "ideographic" && et.hint) hook = et.hint.replace(/\s+/g, " ") + ".";
      else if (et.type === "pictophonetic" && et.semantic && et.phonetic && parts[et.semantic] && parts[et.phonetic])
        hook = `${et.semantic} ${parts[et.semantic][0]} gives the meaning; ${et.phonetic} ${parts[et.phonetic][1]} gives the sound.`;
      else if (et.type === "pictographic" && et.hint) hook = "A picture: " + et.hint.replace(/\s+/g, " ") + ".";
      else if (et.type === "pictophonetic" && et.semantic && parts[et.semantic]) hook = `${et.semantic} ${parts[et.semantic][0]} points to the meaning.`;
    }
    chars[ch] = {
      d: short(e.definition),
      p: (e.pinyin || [])[0] || "",
      t: { ideographic: "i", pictophonetic: "p", pictographic: "g" }[et.type] || "",
      c: comps.length > 1 || et.type ? comps.map((c, i) => [c, roles[i]]) : [],
      h: hook || "",
      r: e.radical || ""
    };
  }
  const out = "/* Auto-generated by build-chars-data.js from Make Me a Hanzi (LGPL-3.0). Do not edit by hand. */\n" +
    "window.CHARS_DATA = " + JSON.stringify({ chars, parts }) + ";\n";
  fs.writeFileSync(path.join(__dirname, "chars-data.js"), out);
  console.log(`chars: ${Object.keys(chars).length}, parts: ${Object.keys(parts).length}, missing: ${missing.join("") || "none"}, size: ${Math.round(out.length / 1024)} KB`);
})();
