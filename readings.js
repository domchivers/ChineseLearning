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
  },
  {
    id: "r6", chapter: 5, title: "上班", py: "shàng bān", en: "Getting to work",
    sentences: [
      ["我|wǒ|I", "每天|měi tiān|every day", "坐|zuò|take", "地铁|dì tiě|the underground", "上班|shàng bān|to work", "。"],
      ["我|wǒ|I", "的|de|'s", "朋友|péng you|friend", "每天|měi tiān|every day", "开车|kāi chē|drives", "上班|shàng bān|to work", "。"],
      ["上班|shàng bān|morning", "高峰|gāo fēng|rush hour", "堵车|dǔ chē|has jams", "，", "开车|kāi chē|driving", "没有|méi yǒu|isn't as", "坐|zuò|taking", "地铁|dì tiě|the underground", "快|kuài|fast", "。"],
      ["地铁|dì tiě|the underground", "也|yě|also", "比|bǐ|than", "出租车|chū zū chē|taxis", "便宜|pián yi|is cheaper", "。"],
      ["今天|jīn tiān|today", "比|bǐ|than", "昨天|zuó tiān|yesterday", "冷|lěng|is colder", "，", "我|wǒ|I", "不|bù|won't", "骑|qí|ride", "自行车|zì xíng chē|my bike", "。"]
    ],
    translation: "Every day I take the underground to work. My friend drives to work every day. The morning rush hour is jammed, so driving isn't as fast as the underground. The underground is cheaper than a taxi too. Today is colder than yesterday, so I won't ride my bike.",
    q: { text: "How does the writer get to work?", options: ["By underground", "By car", "By taxi"], answer: 0 }
  },
  {
    id: "r7", chapter: 6, title: "迷路了", py: "mí lù le", en: "Lost",
    sentences: [
      ["我|wǒ|I", "迷路|mí lù|got lost", "了|le|(!)", "！"],
      ["请问|qǐng wèn|excuse me", "，", "附近|fù jìn|nearby", "有|yǒu|is there", "银行|yín háng|a bank", "吗|ma|(?)", "？"],
      ["有|yǒu|there is", "，", "银行|yín háng|the bank", "离|lí|from", "这里|zhè lǐ|here", "不|bù|isn't", "远|yuǎn|far", "。"],
      ["往|wǎng|towards", "前|qián|ahead", "走|zǒu|walk", "，", "在|zài|at", "十字路口|shí zì lù kǒu|the crossroads", "往|wǎng|towards", "左|zuǒ|left", "拐|guǎi|turn", "。"],
      ["银行|yín háng|the bank", "就|jiù|is right", "在|zài|at", "饭店|fàn diàn|the restaurant", "对面|duì miàn|opposite", "。"]
    ],
    translation: "I'm lost! Excuse me, is there a bank nearby? Yes, the bank isn't far from here. Walk straight ahead and turn left at the crossroads. The bank is right opposite the restaurant.",
    q: { text: "Where is the bank?", options: ["Opposite the restaurant", "Next to the station", "Behind the market"], answer: 0 }
  },
  {
    id: "r8", chapter: 7, title: "感冒了", py: "gǎn mào le", en: "A cold",
    sentences: [
      ["今天|jīn tiān|today", "我|wǒ|I", "不舒服|bù shū fu|feel unwell", "。"],
      ["我|wǒ|I", "头|tóu|head", "疼|téng|hurts", "，", "嗓子|sǎng zi|throat", "也|yě|also", "疼|téng|hurts", "，", "还|hái|and also", "发烧|fā shāo|have a fever", "。"],
      ["最近|zuì jìn|lately", "感冒|gǎn mào|colds", "很|hěn|very", "流行|liú xíng|going around", "。"],
      ["医生|yī shēng|the doctor", "说|shuō|says", "我|wǒ|I", "应该|yīng gāi|should", "多|duō|a lot", "喝|hē|drink", "水|shuǐ|water", "。"],
      ["药|yào|the medicine", "一天|yì tiān|a day", "三|sān|three", "次|cì|times", "，", "一|yí|one", "次|cì|time", "一|yí|one", "片|piàn|tablet", "。"]
    ],
    translation: "I feel unwell today. My head hurts, my throat hurts too, and I have a fever. There's a cold going around lately. The doctor says I should drink lots of water. The medicine is three times a day, one tablet each time.",
    q: { text: "How often should the medicine be taken?", options: ["Three times a day", "Once a day", "Twice a day"], answer: 0 }
  },
  {
    id: "r9", chapter: 8, title: "去市场", py: "qù shì chǎng", en: "To the market",
    sentences: [
      ["今天|jīn tiān|today", "我|wǒ|I", "去|qù|go", "市场|shì chǎng|to the market", "买|mǎi|to buy", "苹果|píng guǒ|apples", "和|hé|and", "葡萄|pú tao|grapes", "。"],
      ["苹果|píng guǒ|apples", "一|yì|one", "斤|jīn|jin", "三|sān|three", "块|kuài|kuai", "，", "葡萄|pú tao|grapes", "一|yì|one", "斤|jīn|jin", "五|wǔ|five", "块|kuài|kuai", "。"],
      ["我|wǒ|I", "买|mǎi|bought", "了|le|(done)", "两|liǎng|two", "斤|jīn|jin", "苹果|píng guǒ|apples", "和|hé|and", "一|yì|one", "斤|jīn|jin", "葡萄|pú tao|grapes", "，", "一共|yí gòng|in total", "十一|shí yī|eleven", "块|kuài|kuai", "。"],
      ["我|wǒ|I", "还|hái|also", "想|xiǎng|want", "买|mǎi|to buy", "一|yí|one", "件|jiàn|(clothes)", "衬衫|chèn shān|shirt", "。"],
      ["我|wǒ|I", "喜欢|xǐ huan|like", "蓝色|lán sè|blue", "，", "我|wǒ|I", "穿|chuān|wear", "中码|zhōng mǎ|medium", "。"],
      ["衬衫|chèn shān|the shirt", "很|hěn|very", "漂亮|piào liang|pretty", "，", "也|yě|and", "不|bú|not", "贵|guì|expensive", "！"]
    ],
    translation: "Today I'm going to the market to buy apples and grapes. Apples are 3 kuai a jin; grapes are 5 kuai a jin. I bought two jin of apples and one jin of grapes, 11 kuai in total. I'd also like to buy a shirt. I like blue, and I wear a medium. The shirt is very pretty, and not expensive!",
    q: { text: "How much was the fruit altogether?", options: ["11 kuai", "8 kuai", "15 kuai"], answer: 0 }
  }
];
