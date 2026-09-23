/*
 * Short reads, one per chapter, written only with words taught up to that
 * chapter. Each token is "汉字|pin yin|meaning"; punctuation stays plain.
 * Check with:  node check-readings.js
 */
window.READINGS = [
  {
    id: "r1", chapter: 0, title: "我的朋友", py: "wǒ de péng you", en: "My friend",
    sentences: [
      ["你好|nǐ hǎo|hello", "！", "我|wǒ|I", "是|shì|am", "英国人|Yīng guó rén|British", "。"],
      ["我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "是|shì|is", "中国人|Zhōng guó rén|Chinese", "。"],
      ["我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "说|shuō|speaks", "汉语|Hàn yǔ|Chinese", "，", "也|yě|also", "说|shuō|speaks", "英语|Yīng yǔ|English", "。"],
      ["我|wǒ|I", "不|bù|don't", "说|shuō|speak", "日语|Rì yǔ|Japanese", "，", "也|yě|also", "不|bù|don't", "说|shuō|speak", "法语|Fǎ yǔ|French", "。"],
      ["我|wǒ|I", "很|hěn|very", "高兴|gāo xìng|happy", "认识|rèn shi|to meet", "你|nǐ|you", "！"]
    ],
    translation: "Hello! I'm British. My friend is Chinese. My friend speaks Chinese, and English too. I don't speak Japanese, or French either. Very happy to meet you!",
    q: { text: "What does the friend speak?", options: ["Chinese and English", "Japanese and French", "Only English"], answer: 0 }
  },
  {
    id: "r2", chapter: 1, title: "在公司", py: "zài gōng sī", en: "At work",
    sentences: [
      ["我|wǒ|I", "是|shì|am", "工程师|gōng chéng shī|an engineer", "，", "在|zài|at", "公司|gōng sī|a company", "工作|gōng zuò|work", "。"],
      ["我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "是|shì|is", "老师|lǎo shī|a teacher", "，", "在|zài|at", "学校|xué xiào|a school", "工作|gōng zuò|works", "。"],
      ["我|wǒ|I", "和|hé|and", "我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "都|dōu|both", "很|hěn|very", "忙|máng|busy", "。"],
      ["我|wǒ|I", "喝|hē|drink", "咖啡|kā fēi|coffee", "，", "我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "喝|hē|drinks", "茶|chá|tea", "。"],
      ["我|wǒ|I", "在|zài|at", "家|jiā|home", "听|tīng|listen to", "音乐|yīn yuè|music", "，", "我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "在|zài|at", "家|jiā|home", "看|kàn|reads", "书|shū|books", "。"]
    ],
    translation: "I'm an engineer and work at a company. My friend is a teacher and works at a school. My friend and I are both very busy. I drink coffee; my friend drinks tea. At home I listen to music, and my friend reads.",
    q: { text: "Where does the friend work?", options: ["At a school", "At a company", "At a hospital"], answer: 0 }
  },
  {
    id: "r3", chapter: 2, title: "今天", py: "jīn tiān", en: "Today",
    sentences: [
      ["今天|jīn tiān|today", "天气|tiān qì|weather", "非常|fēi cháng|very", "好|hǎo|good", "。"],
      ["昨天|zuó tiān|yesterday", "天气|tiān qì|weather", "不|bù|not", "好|hǎo|good", "，", "今天|jīn tiān|today", "太|tài|so", "好|hǎo|good", "了|le|(!)", "！"],
      ["我|wǒ|I", "每天|měi tiān|every day", "从|cóng|from", "五|wǔ|five", "点|diǎn|o'clock", "到|dào|to", "六|liù|six", "点|diǎn|o'clock", "游泳|yóu yǒng|swim", "。"],
      ["我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "今天|jīn tiān|today", "打球|dǎ qiú|played ball", "了|le|(done)", "。"],
      ["晚上|wǎn shang|in the evening", "我|wǒ|I", "可以|kě yǐ|can", "见|jiàn|see", "我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "。"]
    ],
    translation: "The weather is very good today. Yesterday it wasn't good; today it's great! Every day I swim from five to six. My friend played ball today. In the evening I can see my friend.",
    q: { text: "When does the writer swim?", options: ["From five to six every day", "In the evening", "Only yesterday"], answer: 0 }
  },
  {
    id: "r4", chapter: 3, title: "买东西", py: "mǎi dōng xi", en: "Shopping",
    sentences: [
      ["今天|jīn tiān|today", "我|wǒ|I", "去|qù|go", "商店|shāng diàn|the shop", "买|mǎi|buy", "东西|dōng xi|things", "。"],
      ["我|wǒ|I", "买|mǎi|bought", "了|le|(done)", "一|yì|one", "本|běn|(for books)", "词典|cí diǎn|dictionary", "和|hé|and", "三|sān|three", "个|ge|(measure)", "苹果|píng guǒ|apples", "。"],
      ["我|wǒ|I", "还|hái|also", "要|yào|want", "买|mǎi|to buy", "一|yì|one", "双|shuāng|pair", "鞋|xié|shoes", "，", "鞋|xié|the shoes", "三十|sān shí|thirty", "块|kuài|yuan", "。"],
      ["我|wǒ|I", "在|zài|at", "商店|shāng diàn|the shop", "喝|hē|drank", "了|le|(done)", "一|yì|one", "杯|bēi|cup", "绿茶|lǜ chá|green tea", "。"]
    ],
    translation: "Today I went to the shop to buy things. I bought a dictionary and three apples. I also want a pair of shoes; the shoes are thirty yuan. At the shop I drank a cup of green tea.",
    q: { text: "What did the writer buy?", options: ["A dictionary and three apples", "Three dictionaries", "A pair of shoes and a cake"], answer: 0 }
  },
  {
    id: "r5", chapter: 4, title: "生日", py: "shēng rì", en: "Birthday",
    sentences: [
      ["明天|míng tiān|tomorrow", "是|shì|is", "我|wǒ|I", "的|de|'s", "生日|shēng rì|birthday", "！"],
      ["上午|shàng wǔ|in the morning", "我|wǒ|I", "要|yào|will", "去|qù|go", "健身房|jiàn shēn fáng|to the gym", "运动|yùn dòng|to exercise", "。"],
      ["晚上|wǎn shang|in the evening", "我|wǒ|I", "和|hé|and", "同学|tóng xué|classmates", "去|qù|go", "吃饭|chī fàn|out to eat", "。"],
      ["我|wǒ|I", "很|hěn|very", "开心|kāi xīn|happy", "。"],
      ["明年|míng nián|next year", "我|wǒ|I", "要|yào|will", "去|qù|go", "中国|Zhōng guó|China", "旅游|lǚ yóu|to travel", "！"]
    ],
    translation: "Tomorrow is my birthday! In the morning I'll go to the gym to exercise. In the evening my classmates and I are going out to eat. I'm really happy. Next year I'm going travelling in China!",
    q: { text: "What will the writer do in the morning?", options: ["Exercise at the gym", "Eat with classmates", "Travel to China"], answer: 0 }
  }
];
