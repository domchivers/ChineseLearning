/*
 * Vocabulary data for 中文 Beginner A (JIC Language School, ©2022).
 * Transcribed from the textbook page scans in ../Beginner_A.
 *
 * Each lesson: { id, title, words: [ { hanzi, pinyin, pos, en } ] }
 *   hanzi  – Chinese characters (simplified)
 *   pinyin – pinyin WITH tone marks
 *   pos    – part of speech (may be "" if the book doesn't give one)
 *   en     – English meaning
 *
 * The app builds one flashcard per UNIQUE word (a word repeated in a later
 * lesson is shown once, in its first lesson) and derives card IDs from
 * lesson id + word index, so keep existing order stable when editing.
 *
 * After adding/changing words, run:  node fetch-hanzi-data.js
 * to download stroke data for any new characters.
 */
window.VOCAB = {
  meta: {
    title: "中文 Beginner A",
    source: "JIC Language School (©2022)"
  },
  lessons: [
    {
      id: "useful",
      title: "Useful Expressions",
      words: [
        { hanzi: "提问",       pinyin: "tí wèn",          pos: "",     en: "question" },
        { hanzi: "回答",       pinyin: "huí dá",          pos: "",     en: "answer" },
        { hanzi: "对不起",     pinyin: "duì bu qǐ",       pos: "",     en: "sorry" },
        { hanzi: "没关系",     pinyin: "méi guān xi",     pos: "",     en: "no worries" },
        { hanzi: "请进",       pinyin: "qǐng jìn",        pos: "",     en: "please come in" },
        { hanzi: "请坐",       pinyin: "qǐng zuò",        pos: "",     en: "please sit down" },
        { hanzi: "请说",       pinyin: "qǐng shuō",       pos: "",     en: "please say" },
        { hanzi: "请问",       pinyin: "qǐng wèn",        pos: "",     en: "may I ask … please?" },
        { hanzi: "为什么",     pinyin: "wèi shén me",     pos: "",     en: "why?" },
        { hanzi: "是/不是",    pinyin: "shì / bù shì",    pos: "",     en: "yes / no" },
        { hanzi: "对",         pinyin: "duì",             pos: "",     en: "correct / right" },
        { hanzi: "你明白了吗", pinyin: "nǐ míng bai le ma", pos: "",   en: "do you understand?" },
        { hanzi: "我明白了",   pinyin: "wǒ míng bai le",  pos: "",     en: "I understand." },
        { hanzi: "我不明白",   pinyin: "wǒ bù míng bai",  pos: "",     en: "I don't understand." },
        { hanzi: "再见",       pinyin: "zài jiàn",        pos: "",     en: "bye" }
      ]
    },
    {
      id: "l1",
      title: "Lesson 1 · 你好 Hello",
      words: [
        { hanzi: "你好",   pinyin: "nǐ hǎo",    pos: "n.",    en: "hello" },
        { hanzi: "你",     pinyin: "nǐ",        pos: "pron.", en: "you" },
        { hanzi: "好",     pinyin: "hǎo",       pos: "adj.",  en: "good" },
        { hanzi: "我",     pinyin: "wǒ",        pos: "pron.", en: "I, me" },
        { hanzi: "叫",     pinyin: "jiào",      pos: "v.",    en: "to call, to be called" },
        { hanzi: "请",     pinyin: "qǐng",      pos: "",      en: "please" },
        { hanzi: "问",     pinyin: "wèn",       pos: "v.",    en: "to ask" },
        { hanzi: "什么",   pinyin: "shénme",    pos: "",      en: "what" },
        { hanzi: "名字",   pinyin: "míng zì",   pos: "n.",    en: "name" },
        { hanzi: "很",     pinyin: "hěn",       pos: "adv.",  en: "very" },
        { hanzi: "高兴",   pinyin: "gāo xìng",  pos: "adj.",  en: "happy" },
        { hanzi: "认识",   pinyin: "rèn shi",   pos: "v.",    en: "to know (somebody)" },
        { hanzi: "也",     pinyin: "yě",        pos: "",      en: "also" },
        { hanzi: "吗",     pinyin: "ma",        pos: "",      en: "(turns a statement into a question)" },
        { hanzi: "呢",     pinyin: "ne",        pos: "",      en: "(used after a noun/pronoun to form an “And …?” question)" },
        { hanzi: "谢谢",   pinyin: "xiè xie",   pos: "",      en: "thank you" },
        { hanzi: "不客气", pinyin: "bù kè qì",  pos: "",      en: "you are welcome" },
        { hanzi: "不",     pinyin: "bù",        pos: "",      en: "no, not" }
      ]
    },
    {
      id: "l2",
      title: "Lesson 2 · 我来自中国 (I come from China)",
      words: [
        { hanzi: "早上",     pinyin: "zǎo shàng",   pos: "n.", en: "morning" },
        { hanzi: "是",       pinyin: "shì",         pos: "",   en: "is / am / are; yes" },
        { hanzi: "的",       pinyin: "de",          pos: "",   en: "(possessive particle) ’s" },
        { hanzi: "朋友",     pinyin: "péng yǒu",    pos: "n.", en: "friend" },
        { hanzi: "来自",     pinyin: "lái zì",      pos: "v.", en: "to come from" },
        { hanzi: "中国",     pinyin: "zhōng guó",   pos: "n.", en: "China" },
        { hanzi: "国",       pinyin: "guó",         pos: "n.", en: "country" },
        { hanzi: "英国",     pinyin: "yīng guó",    pos: "n.", en: "the UK" },
        { hanzi: "人",       pinyin: "rén",         pos: "n.", en: "person, people" },
        { hanzi: "澳大利亚", pinyin: "ào dà lì yà", pos: "n.", en: "Australia" },
        { hanzi: "说",       pinyin: "shuō",        pos: "v.", en: "to speak" },
        { hanzi: "英语",     pinyin: "yīng yǔ",     pos: "n.", en: "English (language)" },
        { hanzi: "语",       pinyin: "yǔ",          pos: "n.", en: "language" }
      ]
    },
    {
      id: "l2-countries",
      title: "Countries, People & Languages",
      words: [
        { hanzi: "中国人",     pinyin: "zhōng guó rén", pos: "n.", en: "Chinese (person)" },
        { hanzi: "中文",       pinyin: "zhōng wén",     pos: "n.", en: "Chinese (language)" },
        { hanzi: "汉语",       pinyin: "hàn yǔ",        pos: "n.", en: "Chinese (language)" },
        { hanzi: "英国人",     pinyin: "yīng guó rén",  pos: "n.", en: "British (person)" },
        { hanzi: "日本",       pinyin: "rì běn",        pos: "n.", en: "Japan" },
        { hanzi: "日本人",     pinyin: "rì běn rén",    pos: "n.", en: "Japanese (person)" },
        { hanzi: "日语",       pinyin: "rì yǔ",         pos: "n.", en: "Japanese (language)" },
        { hanzi: "意大利",     pinyin: "yì dà lì",      pos: "n.", en: "Italy" },
        { hanzi: "意大利人",   pinyin: "yì dà lì rén",  pos: "n.", en: "Italian (person)" },
        { hanzi: "意大利语",   pinyin: "yì dà lì yǔ",   pos: "n.", en: "Italian (language)" },
        { hanzi: "法国",       pinyin: "fǎ guó",        pos: "n.", en: "France" },
        { hanzi: "法国人",     pinyin: "fǎ guó rén",    pos: "n.", en: "French (person)" },
        { hanzi: "法语",       pinyin: "fǎ yǔ",         pos: "n.", en: "French (language)" },
        { hanzi: "德国",       pinyin: "dé guó",        pos: "n.", en: "Germany" },
        { hanzi: "德国人",     pinyin: "dé guó rén",    pos: "n.", en: "German (person)" },
        { hanzi: "德语",       pinyin: "dé yǔ",         pos: "n.", en: "German (language)" }
      ]
    },
    {
      id: "l3",
      title: "Lesson 3 · 我的工作是工程师 (I am an engineer)",
      words: [
        { hanzi: "都",         pinyin: "dōu",            pos: "adv.",     en: "both, all" },
        { hanzi: "忙",         pinyin: "máng",           pos: "adj.",     en: "busy" },
        { hanzi: "工作",       pinyin: "gōng zuò",       pos: "n./v.",    en: "job, work" },
        { hanzi: "工程师",     pinyin: "gōng chéng shī", pos: "n.",       en: "engineer" },
        { hanzi: "公司",       pinyin: "gōng sī",        pos: "n.",       en: "company" },
        { hanzi: "在",         pinyin: "zài",            pos: "v./prep.", en: "at, in, on" },
        { hanzi: "学校",       pinyin: "xué xiào",       pos: "n.",       en: "school" },
        { hanzi: "银行",       pinyin: "yín háng",       pos: "n.",       en: "bank" },
        { hanzi: "家",         pinyin: "jiā",            pos: "n.",       en: "home, family" },
        { hanzi: "医院",       pinyin: "yī yuàn",        pos: "n.",       en: "hospital" },
        { hanzi: "商店",       pinyin: "shāng diàn",     pos: "n.",       en: "shop, store" },
        { hanzi: "餐厅",       pinyin: "cān tīng",       pos: "n.",       en: "restaurant" },
        { hanzi: "电影院",     pinyin: "diàn yǐng yuàn", pos: "n.",       en: "cinema" },
        { hanzi: "医生",       pinyin: "yī shēng",       pos: "n.",       en: "doctor" },
        { hanzi: "老师",       pinyin: "lǎo shī",        pos: "n.",       en: "teacher" },
        { hanzi: "学生",       pinyin: "xué shēng",      pos: "n.",       en: "student" },
        { hanzi: "厨师",       pinyin: "chú shī",        pos: "n.",       en: "chef, cook" },
        { hanzi: "销售员",     pinyin: "xiāo shòu yuán", pos: "n.",       en: "salesperson" },
        { hanzi: "服务员",     pinyin: "fú wù yuán",     pos: "n.",       en: "waiter, attendant" },
        { hanzi: "公司职员",   pinyin: "gōng sī zhí yuán", pos: "n.",     en: "company employee" },
        { hanzi: "银行职员",   pinyin: "yín háng zhí yuán", pos: "n.",    en: "bank clerk" }
      ]
    },
    {
      id: "l4",
      title: "Lesson 4 · 那是王博的电脑 (That is Wang Bo's computer)",
      words: [
        { hanzi: "桌子",   pinyin: "zhuō zi",   pos: "n.", en: "table" },
        { hanzi: "电脑",   pinyin: "diàn nǎo",  pos: "n.", en: "computer, laptop" },
        { hanzi: "和",     pinyin: "hé",        pos: "",   en: "and" },
        { hanzi: "书",     pinyin: "shū",       pos: "n.", en: "book" },
        { hanzi: "那",     pinyin: "nà",        pos: "",   en: "that" },
        { hanzi: "谁",     pinyin: "shuí",      pos: "",   en: "who" },
        { hanzi: "这里",   pinyin: "zhè lǐ",    pos: "",   en: "here" },
        { hanzi: "对",     pinyin: "duì",       pos: "",   en: "correct, right" },
        { hanzi: "这个",   pinyin: "zhè gè",    pos: "",   en: "this (one)" },
        { hanzi: "有",     pinyin: "yǒu",       pos: "v.", en: "to have" },
        { hanzi: "那个",   pinyin: "nà gè",     pos: "",   en: "that (one)" },
        { hanzi: "哪个",   pinyin: "nǎ gè",     pos: "",   en: "which (one)" },
        { hanzi: "那里",   pinyin: "nà lǐ",     pos: "",   en: "there" },
        { hanzi: "哪里",   pinyin: "nǎ lǐ",     pos: "",   en: "where" },
        { hanzi: "电话",   pinyin: "diàn huà",  pos: "n.", en: "telephone" },
        { hanzi: "电灯",   pinyin: "diàn dēng", pos: "n.", en: "lamp, electric light" },
        { hanzi: "电视",   pinyin: "diàn shì",  pos: "n.", en: "television" },
        { hanzi: "门",     pinyin: "mén",       pos: "n.", en: "door" },
        { hanzi: "椅子",   pinyin: "yǐ zi",     pos: "n.", en: "chair" },
        { hanzi: "衣服",   pinyin: "yī fú",     pos: "n.", en: "clothes" },
        { hanzi: "米饭",   pinyin: "mǐ fàn",    pos: "n.", en: "(cooked) rice" },
        { hanzi: "水",     pinyin: "shuǐ",      pos: "n.", en: "water" },
        { hanzi: "咖啡",   pinyin: "kā fēi",    pos: "n.", en: "coffee" },
        { hanzi: "茶",     pinyin: "chá",       pos: "n.", en: "tea" },
        { hanzi: "书包",   pinyin: "shū bāo",   pos: "n.", en: "schoolbag, backpack" },
        { hanzi: "钱",     pinyin: "qián",      pos: "n.", en: "money" },
        { hanzi: "钱包",   pinyin: "qián bāo",  pos: "n.", en: "wallet, purse" }
      ]
    },
    {
      id: "l5",
      title: "Lesson 5 · 他们的电话号码是… (Their phone number is…)",
      words: [
        { hanzi: "知道",       pinyin: "zhī dào",         pos: "v.",   en: "to know" },
        { hanzi: "不好意思",   pinyin: "bù hǎo yì si",    pos: "",     en: "sorry, excuse me" },
        { hanzi: "电话号码",   pinyin: "diàn huà hào mǎ", pos: "n.",   en: "telephone number" },
        { hanzi: "太…了",      pinyin: "tài … le",        pos: "",     en: "so / too (+ adjective)" },
        { hanzi: "喂",         pinyin: "wéi",             pos: "",     en: "hello (answering the phone)" },
        { hanzi: "棒",         pinyin: "bàng",            pos: "adj.", en: "excellent, great" },
        { hanzi: "没",         pinyin: "méi",             pos: "adv.", en: "have not, did not" }
      ]
    },
    {
      id: "numbers",
      title: "Numbers · 数字 (0–1000)",
      words: [
        { hanzi: "零",   pinyin: "líng",    pos: "", en: "0" },
        { hanzi: "一",   pinyin: "yī",      pos: "", en: "1" },
        { hanzi: "二",   pinyin: "èr",      pos: "", en: "2" },
        { hanzi: "三",   pinyin: "sān",     pos: "", en: "3" },
        { hanzi: "四",   pinyin: "sì",      pos: "", en: "4" },
        { hanzi: "五",   pinyin: "wǔ",      pos: "", en: "5" },
        { hanzi: "六",   pinyin: "liù",     pos: "", en: "6" },
        { hanzi: "七",   pinyin: "qī",      pos: "", en: "7" },
        { hanzi: "八",   pinyin: "bā",      pos: "", en: "8" },
        { hanzi: "九",   pinyin: "jiǔ",     pos: "", en: "9" },
        { hanzi: "十",   pinyin: "shí",     pos: "", en: "10" },
        { hanzi: "十一", pinyin: "shí yī",  pos: "", en: "11" },
        { hanzi: "十二", pinyin: "shí èr",  pos: "", en: "12" },
        { hanzi: "十三", pinyin: "shí sān", pos: "", en: "13" },
        { hanzi: "十四", pinyin: "shí sì",  pos: "", en: "14" },
        { hanzi: "十五", pinyin: "shí wǔ",  pos: "", en: "15" },
        { hanzi: "十六", pinyin: "shí liù", pos: "", en: "16" },
        { hanzi: "十七", pinyin: "shí qī",  pos: "", en: "17" },
        { hanzi: "十八", pinyin: "shí bā",  pos: "", en: "18" },
        { hanzi: "十九", pinyin: "shí jiǔ", pos: "", en: "19" },
        { hanzi: "二十", pinyin: "èr shí",  pos: "", en: "20" },
        { hanzi: "三十", pinyin: "sān shí", pos: "", en: "30" },
        { hanzi: "四十", pinyin: "sì shí",  pos: "", en: "40" },
        { hanzi: "五十", pinyin: "wǔ shí",  pos: "", en: "50" },
        { hanzi: "六十", pinyin: "liù shí", pos: "", en: "60" },
        { hanzi: "七十", pinyin: "qī shí",  pos: "", en: "70" },
        { hanzi: "八十", pinyin: "bā shí",  pos: "", en: "80" },
        { hanzi: "九十", pinyin: "jiǔ shí", pos: "", en: "90" },
        { hanzi: "一百", pinyin: "yì bǎi",  pos: "", en: "100" },
        { hanzi: "一千", pinyin: "yì qiān", pos: "", en: "1000" }
      ]
    },
    {
      id: "l6",
      title: "Lesson 6 · 你在做什么 (What are you doing?)",
      words: [
        { hanzi: "做",     pinyin: "zuò",     pos: "v.",    en: "to do, to make" },
        { hanzi: "学习",   pinyin: "xué xí",  pos: "v./n.", en: "to study" },
        { hanzi: "去",     pinyin: "qù",      pos: "v.",    en: "to go" },
        { hanzi: "听",     pinyin: "tīng",    pos: "v.",    en: "to listen" },
        { hanzi: "音乐",   pinyin: "yīn yuè", pos: "n.",    en: "music" },
        { hanzi: "看",     pinyin: "kàn",     pos: "v.",    en: "to look, watch, read" },
        { hanzi: "吃",     pinyin: "chī",     pos: "v.",    en: "to eat" },
        { hanzi: "喝",     pinyin: "hē",      pos: "v.",    en: "to drink" },
        { hanzi: "学",     pinyin: "xué",     pos: "v.",    en: "to study, to learn" },
        { hanzi: "洗",     pinyin: "xǐ",      pos: "v.",    en: "to wash" },
        { hanzi: "打",     pinyin: "dǎ",      pos: "v.",    en: "to hit, play, make (a call)" },
        { hanzi: "来",     pinyin: "lái",     pos: "v.",    en: "to come" }
      ]
    }
  ]
};

/*
 * Conversation dialogues for roleplay/speaking practice, built from the
 * Beginner A lesson patterns. Each turn: { who: "app" | "you", hanzi, pinyin, en }.
 * "you" turns are what the learner says; set free:true for open answers
 * (e.g. your own name) that shouldn't be pronunciation-checked.
 */
window.DIALOGUES = [
  {
    id: "greet", title: "Saying hello", lesson: "Lesson 1",
    turns: [
      { who: "app", hanzi: "你好！",             pinyin: "nǐ hǎo",                    en: "Hello!" },
      { who: "you", hanzi: "你好！",             pinyin: "nǐ hǎo",                    en: "Hello!" },
      { who: "app", hanzi: "你叫什么名字？",     pinyin: "nǐ jiào shénme míngzi",     en: "What's your name?" },
      { who: "you", hanzi: "我叫大卫。",         pinyin: "wǒ jiào Dàwèi",             en: "My name is David.", free: true },
      { who: "app", hanzi: "很高兴认识你。",     pinyin: "hěn gāoxìng rènshi nǐ",     en: "Nice to meet you." },
      { who: "you", hanzi: "我也很高兴认识你。", pinyin: "wǒ yě hěn gāoxìng rènshi nǐ", en: "Nice to meet you too." },
      { who: "app", hanzi: "再见！",             pinyin: "zài jiàn",                  en: "Goodbye!" },
      { who: "you", hanzi: "再见！",             pinyin: "zài jiàn",                  en: "Goodbye!" }
    ]
  },
  {
    id: "origin", title: "Where are you from?", lesson: "Lesson 2",
    turns: [
      { who: "app", hanzi: "你来自哪里？",   pinyin: "nǐ láizì nǎlǐ",       en: "Where are you from?" },
      { who: "you", hanzi: "我来自英国。",   pinyin: "wǒ láizì yīngguó",    en: "I come from the UK." },
      { who: "app", hanzi: "你说英语吗？",   pinyin: "nǐ shuō yīngyǔ ma",   en: "Do you speak English?" },
      { who: "you", hanzi: "是，我说英语。", pinyin: "shì, wǒ shuō yīngyǔ", en: "Yes, I speak English." },
      { who: "app", hanzi: "你也说中文！",   pinyin: "nǐ yě shuō zhōngwén", en: "You speak Chinese too!" },
      { who: "you", hanzi: "谢谢！",         pinyin: "xièxie",              en: "Thank you!" }
    ]
  },
  {
    id: "job", title: "What do you do?", lesson: "Lesson 3",
    turns: [
      { who: "app", hanzi: "你的工作是什么？",   pinyin: "nǐ de gōngzuò shì shénme",   en: "What's your job?" },
      { who: "you", hanzi: "我的工作是工程师。", pinyin: "wǒ de gōngzuò shì gōngchéngshī", en: "I'm an engineer." },
      { who: "app", hanzi: "你在哪里工作？",     pinyin: "nǐ zài nǎlǐ gōngzuò",        en: "Where do you work?" },
      { who: "you", hanzi: "我在公司工作。",     pinyin: "wǒ zài gōngsī gōngzuò",      en: "I work at a company." },
      { who: "app", hanzi: "你很忙吗？",         pinyin: "nǐ hěn máng ma",             en: "Are you busy?" },
      { who: "you", hanzi: "是，我很忙。",       pinyin: "shì, wǒ hěn máng",           en: "Yes, I'm busy." }
    ]
  },
  {
    id: "doing", title: "What are you doing?", lesson: "Lesson 6",
    turns: [
      { who: "app", hanzi: "你在做什么？",     pinyin: "nǐ zài zuò shénme",     en: "What are you doing?" },
      { who: "you", hanzi: "我在学习中文。",   pinyin: "wǒ zài xuéxí zhōngwén", en: "I'm studying Chinese." },
      { who: "app", hanzi: "太棒了！",         pinyin: "tài bàng le",           en: "That's great!" },
      { who: "you", hanzi: "我也喜欢听音乐。", pinyin: "wǒ yě xǐhuan tīng yīnyuè", en: "I also like listening to music.", free: true },
      { who: "app", hanzi: "我们一起学习吧！", pinyin: "wǒmen yìqǐ xuéxí ba",   en: "Let's study together!" }
    ]
  }
];
