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
    },

    /* ==================== Beginner B (Unit B) ==================== */
    /* JIC Chinese Beginner B. Transcribed from the textbook page scans; pinyin
       follows the book. New lesson ids (b1…) appended at the end so existing
       Beginner A card IDs (lessonId:index) stay stable. */
    {
      id: "b1",
      title: "B1 · 昨天的电影怎么样？How was the movie?",
      words: [
        { hanzi: "昨天",   pinyin: "zuó tiān",    pos: "n.",   en: "yesterday" },
        { hanzi: "今天",   pinyin: "jīn tiān",    pos: "n.",   en: "today" },
        { hanzi: "天气",   pinyin: "tiān qì",     pos: "n.",   en: "weather" },
        { hanzi: "怎么样", pinyin: "zěn me yàng", pos: "adv.", en: "how is it?" },
        { hanzi: "有意思", pinyin: "yǒu yì sī",   pos: "adj.", en: "interesting" },
        { hanzi: "游泳",   pinyin: "yóu yǒng",    pos: "v.",   en: "to swim" },
        { hanzi: "时候",   pinyin: "shí hou",     pos: "n.",   en: "time, moment" },
        { hanzi: "现在",   pinyin: "xiàn zài",    pos: "n.",   en: "now" },
        { hanzi: "没问题", pinyin: "méi wèn tí",  pos: "",     en: "no problem" },
        { hanzi: "得",     pinyin: "de",          pos: "",     en: "(descriptive complement)" },
        { hanzi: "非常",   pinyin: "fēi cháng",   pos: "adv.", en: "very, extremely" },
        { hanzi: "打球",   pinyin: "dǎ qiú",      pos: "v.",   en: "to play ball (basketball, tennis…)" },
        { hanzi: "了",     pinyin: "le",          pos: "",     en: "(past-tense marker)" },
        { hanzi: "太…了",  pinyin: "tài … le",    pos: "",     en: "too / so …" }
      ]
    },
    {
      id: "b2",
      title: "B2 · 请问现在是几点？What time is it?",
      words: [
        { hanzi: "晚上",   pinyin: "wǎn shàng",   pos: "n.",   en: "evening, night" },
        { hanzi: "几点",   pinyin: "jǐ diǎn",     pos: "",     en: "what time?" },
        { hanzi: "到",     pinyin: "dào",         pos: "v.",   en: "to arrive; to, until" },
        { hanzi: "每天",   pinyin: "měi tiān",    pos: "n.",   en: "every day" },
        { hanzi: "几个",   pinyin: "jǐ gè",       pos: "",     en: "how many" },
        { hanzi: "小时",   pinyin: "xiǎo shí",    pos: "n.",   en: "hour" },
        { hanzi: "从",     pinyin: "cóng",        pos: "prep.",en: "from" },
        { hanzi: "可以",   pinyin: "kě yǐ",       pos: "v.",   en: "can, may" },
        { hanzi: "见",     pinyin: "jiàn",        pos: "v.",   en: "to see, to meet" },
        { hanzi: "分",     pinyin: "fēn",         pos: "n.",   en: "minute" },
        { hanzi: "半",     pinyin: "bàn",         pos: "n.",   en: "half" },
        { hanzi: "刻",     pinyin: "kè",          pos: "n.",   en: "a quarter (15 min)" },
        { hanzi: "分钟",   pinyin: "fēn zhōng",   pos: "n.",   en: "minute(s) (duration)" }
      ]
    },
    {
      id: "b3",
      title: "B3 · 请问房里有什么？In the room (measure words 1)",
      words: [
        { hanzi: "房",     pinyin: "fáng",        pos: "n.",   en: "room" },
        { hanzi: "里",     pinyin: "lǐ",          pos: "n.",   en: "inside" },
        { hanzi: "要",     pinyin: "yào",         pos: "v.",   en: "to want; will" },
        { hanzi: "买",     pinyin: "mǎi",         pos: "v.",   en: "to buy" },
        { hanzi: "东西",   pinyin: "dōng xī",     pos: "n.",   en: "things, stuff" },
        { hanzi: "还",     pinyin: "hái",         pos: "adv.", en: "also, still" },
        { hanzi: "杯",     pinyin: "bēi",         pos: "m.",   en: "(cup / glass of)" },
        { hanzi: "咖啡",   pinyin: "kā fēi",      pos: "n.",   en: "coffee" },
        { hanzi: "绿茶",   pinyin: "lǜ chá",      pos: "n.",   en: "green tea" },
        { hanzi: "冰水",   pinyin: "bīng shuǐ",   pos: "n.",   en: "ice water" },
        { hanzi: "本",     pinyin: "běn",         pos: "m.",   en: "(measure for books)" },
        { hanzi: "本子",   pinyin: "běn zi",      pos: "n.",   en: "notebook" },
        { hanzi: "书",     pinyin: "shū",         pos: "n.",   en: "book" }
      ]
    },
    {
      id: "b4",
      title: "B4 · 房里有什么？In the room (measure words 2)",
      words: [
        { hanzi: "词典",   pinyin: "cí diǎn",     pos: "n.",   en: "dictionary" },
        { hanzi: "块",     pinyin: "kuài",        pos: "m.",   en: "(piece of); yuan" },
        { hanzi: "蛋糕",   pinyin: "dàn gāo",     pos: "n.",   en: "cake" },
        { hanzi: "面包",   pinyin: "miàn bāo",    pos: "n.",   en: "bread" },
        { hanzi: "香皂",   pinyin: "xiāng zào",   pos: "n.",   en: "soap" },
        { hanzi: "钱",     pinyin: "qián",        pos: "n.",   en: "money" },
        { hanzi: "双",     pinyin: "shuāng",      pos: "m.",   en: "(pair of)" },
        { hanzi: "鞋",     pinyin: "xié",         pos: "n.",   en: "shoes" },
        { hanzi: "袜子",   pinyin: "wà zi",       pos: "n.",   en: "socks" },
        { hanzi: "筷子",   pinyin: "kuài zi",     pos: "n.",   en: "chopsticks" },
        { hanzi: "手套",   pinyin: "shǒu tào",    pos: "n.",   en: "gloves" },
        { hanzi: "只",     pinyin: "zhī",         pos: "m.",   en: "(measure for animals)" },
        { hanzi: "狗",     pinyin: "gǒu",         pos: "n.",   en: "dog" },
        { hanzi: "猫",     pinyin: "māo",         pos: "n.",   en: "cat" }
      ]
    },
    {
      id: "b5",
      title: "B5 · 房里有什么？In the room (measure words 3)",
      words: [
        { hanzi: "小鸟",   pinyin: "xiǎo niǎo",   pos: "n.",   en: "little bird" },
        { hanzi: "眼睛",   pinyin: "yǎn jīng",    pos: "n.",   en: "eyes" },
        { hanzi: "张",     pinyin: "zhāng",       pos: "m.",   en: "(measure for flat things)" },
        { hanzi: "纸巾",   pinyin: "zhǐ jīn",     pos: "n.",   en: "tissue" },
        { hanzi: "机票",   pinyin: "jī piào",     pos: "n.",   en: "plane ticket" },
        { hanzi: "车票",   pinyin: "chē piào",    pos: "n.",   en: "bus / train ticket" },
        { hanzi: "照片",   pinyin: "zhào piàn",   pos: "n.",   en: "photo" },
        { hanzi: "个",     pinyin: "gè",          pos: "m.",   en: "(general measure word)" },
        { hanzi: "柠檬",   pinyin: "níng méng",   pos: "n.",   en: "lemon" },
        { hanzi: "苹果",   pinyin: "píng guǒ",    pos: "n.",   en: "apple" },
        { hanzi: "香蕉",   pinyin: "xiāng jiāo",  pos: "n.",   en: "banana" },
        { hanzi: "西瓜",   pinyin: "xī guā",      pos: "n.",   en: "watermelon" },
        { hanzi: "鸡蛋",   pinyin: "jī dàn",      pos: "n.",   en: "egg" }
      ]
    },
    {
      id: "b6",
      title: "B6 · 我的生日是八月二十一号 Birthdays & dates",
      words: [
        { hanzi: "生日",   pinyin: "shēng rì",       pos: "n.",   en: "birthday" },
        { hanzi: "号",     pinyin: "hào",            pos: "n.",   en: "date; number" },
        { hanzi: "祝",     pinyin: "zhù",            pos: "v.",   en: "to wish" },
        { hanzi: "快乐",   pinyin: "kuài lè",        pos: "adj.", en: "happy" },
        { hanzi: "开心",   pinyin: "kāi xīn",        pos: "adj.", en: "happy, glad" },
        { hanzi: "聚会",   pinyin: "jù huì",         pos: "n.",   en: "party, gathering" },
        { hanzi: "过",     pinyin: "guò",            pos: "v.",   en: "to celebrate, to spend" },
        { hanzi: "长寿面", pinyin: "cháng shòu miàn",pos: "n.",   en: "longevity noodles" },
        { hanzi: "月",     pinyin: "yuè",            pos: "n.",   en: "month" },
        { hanzi: "星期",   pinyin: "xīng qī",        pos: "n.",   en: "week" },
        { hanzi: "几月",   pinyin: "jǐ yuè",         pos: "",     en: "which month?" },
        { hanzi: "几号",   pinyin: "jǐ hào",         pos: "",     en: "which date?" },
        { hanzi: "星期几", pinyin: "xīng qī jǐ",     pos: "",     en: "which day of the week?" }
      ]
    },
    {
      id: "b7",
      title: "B7 · 你明天要做什么？Future plans (1)",
      words: [
        { hanzi: "明天",   pinyin: "míng tiān",   pos: "n.",   en: "tomorrow" },
        { hanzi: "在",     pinyin: "zài",         pos: "adv.", en: "(in the middle of doing)" },
        { hanzi: "电视",   pinyin: "diàn shì",    pos: "n.",   en: "television" },
        { hanzi: "没有",   pinyin: "méi yǒu",     pos: "v.",   en: "did not; to not have" },
        { hanzi: "做",     pinyin: "zuò",         pos: "v.",   en: "to do, to make" },
        { hanzi: "学习",   pinyin: "xué xí",      pos: "v.",   en: "to study" },
        { hanzi: "汉语",   pinyin: "hàn yǔ",      pos: "n.",   en: "Chinese (language)" },
        { hanzi: "上午",   pinyin: "shàng wǔ",    pos: "n.",   en: "morning" },
        { hanzi: "同学",   pinyin: "tóng xué",    pos: "n.",   en: "classmate" },
        { hanzi: "学校",   pinyin: "xué xiào",    pos: "n.",   en: "school" },
        { hanzi: "衣服",   pinyin: "yī fú",       pos: "n.",   en: "clothes" },
        { hanzi: "商场",   pinyin: "shāng chǎng", pos: "n.",   en: "shopping mall" },
        { hanzi: "健身房", pinyin: "jiàn shēn fáng",pos: "n.", en: "gym" },
        { hanzi: "运动",   pinyin: "yùn dòng",    pos: "v.",   en: "to exercise" }
      ]
    },
    {
      id: "b8",
      title: "B8 · 你明天要做什么？Future plans (2)",
      words: [
        { hanzi: "同事",   pinyin: "tóng shì",    pos: "n.",   en: "colleague" },
        { hanzi: "客户",   pinyin: "kè hù",       pos: "n.",   en: "customer, client" },
        { hanzi: "开会",   pinyin: "kāi huì",     pos: "v.",   en: "to have a meeting" },
        { hanzi: "唐人街", pinyin: "táng rén jiē",pos: "n.",   en: "Chinatown" },
        { hanzi: "墨尔本", pinyin: "mò ěr běn",   pos: "n.",   en: "Melbourne" },
        { hanzi: "西藏",   pinyin: "xī zàng",     pos: "n.",   en: "Tibet" },
        { hanzi: "旅游",   pinyin: "lǚ yóu",      pos: "v.",   en: "to travel" },
        { hanzi: "酒吧",   pinyin: "jiǔ bā",      pos: "n.",   en: "bar" },
        { hanzi: "喝酒",   pinyin: "hē jiǔ",      pos: "v.",   en: "to drink (alcohol)" },
        { hanzi: "吃饭",   pinyin: "chī fàn",     pos: "v.",   en: "to eat, to have a meal" },
        { hanzi: "明年",   pinyin: "míng nián",   pos: "n.",   en: "next year" },
        { hanzi: "这周五", pinyin: "zhè zhōu wǔ", pos: "",     en: "this Friday" },
        { hanzi: "下周五", pinyin: "xià zhōu wǔ", pos: "",     en: "next Friday" },
        { hanzi: "好朋友", pinyin: "hǎo péng yǒu",pos: "n.",   en: "good friend" }
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
  },

  /* ---- Beginner B ---- */
  {
    id: "b-movie", title: "How was the movie?", lesson: "B1",
    turns: [
      { who: "app", hanzi: "昨天的电影怎么样？", pinyin: "zuótiān de diànyǐng zěnmeyàng", en: "How was the movie yesterday?" },
      { who: "you", hanzi: "很有意思。今天天气很好，我们去喝咖啡，怎么样？", pinyin: "hěn yǒuyìsi, jīntiān tiānqì hěn hǎo, wǒmen qù hē kāfēi, zěnmeyàng", en: "Very interesting. The weather's nice today — shall we go for coffee?" },
      { who: "app", hanzi: "好，什么时候去？", pinyin: "hǎo, shénme shíhou qù", en: "Sure — when shall we go?" },
      { who: "you", hanzi: "现在去，好吗？",   pinyin: "xiànzài qù, hǎo ma",   en: "Let's go now, okay?" },
      { who: "app", hanzi: "好，没问题。",     pinyin: "hǎo, méi wèntí",       en: "Okay, no problem." }
    ]
  },
  {
    id: "b-ball", title: "How did the game go?", lesson: "B1",
    turns: [
      { who: "app", hanzi: "昨天的咖啡喝得怎么样？", pinyin: "zuótiān de kāfēi hē de zěnmeyàng", en: "How was the coffee yesterday?" },
      { who: "you", hanzi: "非常好。你昨天去打球了，对吗？", pinyin: "fēicháng hǎo, nǐ zuótiān qù dǎqiú le, duì ma", en: "Very good. You went to play ball yesterday, right?" },
      { who: "app", hanzi: "对。我们在学校打球。", pinyin: "duì, wǒmen zài xuéxiào dǎqiú", en: "Yes. We played at school." },
      { who: "you", hanzi: "打得怎么样？",         pinyin: "dǎ de zěnmeyàng",           en: "How did it go?" },
      { who: "app", hanzi: "打得太有意思了。",     pinyin: "dǎ de tài yǒuyìsi le",      en: "It was so much fun." }
    ]
  },
  {
    id: "b-time", title: "What time is it?", lesson: "B2",
    turns: [
      { who: "app", hanzi: "今天晚上你去看电影吗？", pinyin: "jīntiān wǎnshàng nǐ qù kàn diànyǐng ma", en: "Are you going to see a movie tonight?" },
      { who: "you", hanzi: "我们几点去？",           pinyin: "wǒmen jǐ diǎn qù",                      en: "What time shall we go?" },
      { who: "app", hanzi: "我们八点到电影院。",     pinyin: "wǒmen bā diǎn dào diànyǐngyuàn",        en: "We'll get to the cinema at eight." },
      { who: "you", hanzi: "请问现在是几点？",       pinyin: "qǐngwèn xiànzài shì jǐ diǎn",           en: "Excuse me, what time is it now?" },
      { who: "app", hanzi: "现在是下午三点。",       pinyin: "xiànzài shì xiàwǔ sān diǎn",            en: "It's three in the afternoon." },
      { who: "you", hanzi: "好，我们八点电影院见！", pinyin: "hǎo, wǒmen bā diǎn diànyǐngyuàn jiàn",  en: "Great — see you at the cinema at eight!" }
    ]
  },
  {
    id: "b-yoga", title: "Every day", lesson: "B2",
    turns: [
      { who: "app", hanzi: "你每天做瑜伽吗？",       pinyin: "nǐ měitiān zuò yújiā ma",     en: "Do you do yoga every day?" },
      { who: "you", hanzi: "对，我每天做一个小时。", pinyin: "duì, wǒ měitiān zuò yí gè xiǎoshí", en: "Yes, I do it an hour every day." },
      { who: "app", hanzi: "从几点到几点？",         pinyin: "cóng jǐ diǎn dào jǐ diǎn",    en: "From what time to what time?" },
      { who: "you", hanzi: "从五点到六点。",         pinyin: "cóng wǔ diǎn dào liù diǎn",   en: "From five to six." },
      { who: "app", hanzi: "晚上可以去看电影。",     pinyin: "wǎnshàng kěyǐ qù kàn diànyǐng", en: "Then we can go to a movie in the evening." }
    ]
  },
  {
    id: "b-room", title: "What's in the room?", lesson: "B3",
    turns: [
      { who: "app", hanzi: "请问房里有什么？",         pinyin: "qǐngwèn fáng lǐ yǒu shénme",           en: "What's in the room?" },
      { who: "you", hanzi: "房里有一只小狗和五张照片。", pinyin: "fáng lǐ yǒu yì zhī xiǎogǒu hé wǔ zhāng zhàopiàn", en: "There's a little dog and five photos." },
      { who: "app", hanzi: "桌子上有什么？",           pinyin: "zhuōzi shàng yǒu shénme",              en: "What's on the table?" },
      { who: "you", hanzi: "有两本书和三块蛋糕。",     pinyin: "yǒu liǎng běn shū hé sān kuài dàngāo", en: "Two books and three pieces of cake." },
      { who: "app", hanzi: "还有咖啡吗？",             pinyin: "hái yǒu kāfēi ma",                     en: "Is there coffee too?" },
      { who: "you", hanzi: "有，还有一杯绿茶。",       pinyin: "yǒu, hái yǒu yì bēi lǜchá",            en: "Yes, and a cup of green tea." }
    ]
  },
  {
    id: "b-shop", title: "Going shopping", lesson: "B5",
    turns: [
      { who: "app", hanzi: "你今天下午忙吗？",         pinyin: "nǐ jīntiān xiàwǔ máng ma",            en: "Are you busy this afternoon?" },
      { who: "you", hanzi: "不忙，我要去买东西。",     pinyin: "bù máng, wǒ yào qù mǎi dōngxi",       en: "Not busy — I'm going shopping." },
      { who: "app", hanzi: "你要买什么？",             pinyin: "nǐ yào mǎi shénme",                   en: "What are you going to buy?" },
      { who: "you", hanzi: "我要买一双鞋和两双袜子。", pinyin: "wǒ yào mǎi yì shuāng xié hé liǎng shuāng wàzi", en: "A pair of shoes and two pairs of socks." },
      { who: "app", hanzi: "你还要买什么？",           pinyin: "nǐ hái yào mǎi shénme",               en: "What else?" },
      { who: "you", hanzi: "我还要买两张机票。",       pinyin: "wǒ hái yào mǎi liǎng zhāng jīpiào",   en: "Two plane tickets as well." }
    ]
  },
  {
    id: "b-birthday", title: "Happy birthday", lesson: "B6",
    turns: [
      { who: "app", hanzi: "今天是你的生日，祝你生日快乐！", pinyin: "jīntiān shì nǐ de shēngrì, zhù nǐ shēngrì kuàilè", en: "Today is your birthday — happy birthday!" },
      { who: "you", hanzi: "谢谢你来我的生日聚会。",     pinyin: "xièxie nǐ lái wǒ de shēngrì jùhuì",   en: "Thanks for coming to my birthday party." },
      { who: "app", hanzi: "你们过生日吃什么？",         pinyin: "nǐmen guò shēngrì chī shénme",        en: "What do you eat for a birthday?" },
      { who: "you", hanzi: "我们吃长寿面。",             pinyin: "wǒmen chī chángshòumiàn",             en: "We eat longevity noodles." },
      { who: "app", hanzi: "你的生日是几月几号？",       pinyin: "nǐ de shēngrì shì jǐ yuè jǐ hào",     en: "What's the date of your birthday?" },
      { who: "you", hanzi: "我的生日是八月二十一号。",   pinyin: "wǒ de shēngrì shì bā yuè èrshíyī hào", en: "My birthday is the 21st of August." }
    ]
  },
  {
    id: "b-plans", title: "What will you do tomorrow?", lesson: "B7",
    turns: [
      { who: "app", hanzi: "你昨天晚上八点在看电视吗？", pinyin: "nǐ zuótiān wǎnshàng bā diǎn zài kàn diànshì ma", en: "Were you watching TV at 8 last night?" },
      { who: "you", hanzi: "我没有在看电视，我在喝咖啡。", pinyin: "wǒ méiyǒu zài kàn diànshì, wǒ zài hē kāfēi", en: "I wasn't watching TV, I was drinking coffee." },
      { who: "app", hanzi: "你明天要做什么？",           pinyin: "nǐ míngtiān yào zuò shénme",          en: "What will you do tomorrow?" },
      { who: "you", hanzi: "我明天要学习汉语。",         pinyin: "wǒ míngtiān yào xuéxí hànyǔ",         en: "Tomorrow I'll study Chinese." },
      { who: "app", hanzi: "你明天晚上要看电视吗？",     pinyin: "nǐ míngtiān wǎnshàng yào kàn diànshì ma", en: "Will you watch TV tomorrow evening?" },
      { who: "you", hanzi: "我明天不要看电视。",         pinyin: "wǒ míngtiān búyào kàn diànshì",       en: "I won't watch TV tomorrow." }
    ]
  },
  {
    id: "b-plans2", title: "Where will you go?", lesson: "B7",
    turns: [
      { who: "app", hanzi: "你明天上午要做什么？",     pinyin: "nǐ míngtiān shàngwǔ yào zuò shénme",  en: "What will you do tomorrow morning?" },
      { who: "you", hanzi: "我要去学校学习。",         pinyin: "wǒ yào qù xuéxiào xuéxí",             en: "I'm going to school to study." },
      { who: "app", hanzi: "你和谁去？",               pinyin: "nǐ hé shéi qù",                       en: "Who are you going with?" },
      { who: "you", hanzi: "我和同学去。",             pinyin: "wǒ hé tóngxué qù",                    en: "With my classmates." },
      { who: "app", hanzi: "下午呢？",                 pinyin: "xiàwǔ ne",                            en: "And in the afternoon?" },
      { who: "you", hanzi: "下午我要去健身房运动。",   pinyin: "xiàwǔ wǒ yào qù jiànshēnfáng yùndòng", en: "In the afternoon I'll go to the gym to work out." }
    ]
  }
];
