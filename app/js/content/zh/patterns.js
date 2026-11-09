// Pattern drills (substitution drills) for the Mandarin course: one sentence pattern, many words
// swapped into its slot. Same shape as ../patterns.js. jp/romaji are the fixed part of the
// pattern; by default it comes after the slot (slot + jp), and `slotLast: true` puts the slot at
// the end instead (jp + slot), as Chinese often does. en(word) makes the English.
// slots: [word id, English inside the sentence]. A drill opens once three of its slot words are
// learned, and only uses learned ones.
export const PATTERNS = [
  {
    id: 'wo-yao', jp: '我要', romaji: 'wǒ yào', slotLast: true, title: '我要 ___', meaning: 'I want ___', art: '🙋',
    en: (w) => `I want ${w}`,
    slots: [['w-ka1fei1', 'coffee'], ['w-cha2', 'tea'], ['w-shui3', 'water'], ['w-re4shui3', 'hot water'], ['w-pi2jiu3', 'beer'], ['w-zhe4ge', 'this one'], ['w-piao4', 'a ticket'], ['w-jiao3zi', 'dumplings'], ['w-mi3fan4', 'rice'], ['w-mian4tiao2', 'noodles']],
  },
  {
    id: 'zai-nali', jp: '在哪里', romaji: 'zài nǎlǐ', title: '___ 在哪里', meaning: 'Where is ___?', art: '🗺️',
    en: (w) => `Where is the ${w}?`,
    slots: [['w-che1zhan4', 'station'], ['w-di4tie3', 'subway'], ['w-huo3che1zhan4', 'train station'], ['w-ce4suo3', 'toilet'], ['w-xi3shou3jian1', 'restroom'], ['w-jiu3dian4', 'hotel'], ['w-can1ting1', 'restaurant'], ['w-zhan4tai2', 'platform'], ['w-yao4dian4', 'pharmacy'], ['w-yi1yuan4', 'hospital']],
  },
  {
    id: 'duoshao-qian', jp: '多少钱', romaji: 'duōshao qián', title: '___ 多少钱', meaning: 'How much is ___?', art: '💴',
    en: (w) => `How much is ${w}?`,
    slots: [['w-zhe4ge', 'this'], ['w-piao4', 'the ticket'], ['w-ka1fei1', 'the coffee'], ['w-cha2', 'the tea'], ['w-pi2jiu3', 'the beer'], ['w-fang2jian1', 'the room'], ['w-ping2guo3', 'the apple'], ['w-shui3guo3', 'the fruit']],
  },
  {
    id: 'qing-gei-wo', jp: '请给我', romaji: 'qǐng gěi wǒ', slotLast: true, title: '请给我 ___', meaning: 'Please give me ___', art: '🙏',
    en: (w) => `Please give me ${w}`,
    slots: [['w-cai4dan1', 'the menu'], ['w-shui3', 'water'], ['w-re4shui3', 'hot water'], ['w-cha2', 'tea'], ['w-zhe4ge', 'this one'], ['w-fang2ka3', 'the room card'], ['w-yao4', 'medicine'], ['w-yi4-zhang1-piao4', 'a ticket']],
  },
  {
    id: 'xihuan', jp: '我喜欢', romaji: 'wǒ xǐhuan', slotLast: true, title: '我喜欢 ___', meaning: 'I like ___', art: '😋',
    en: (w) => `I like ${w}`,
    slots: [['w-jiao3zi', 'dumplings'], ['w-mian4tiao2', 'noodles'], ['w-bao1zi', 'steamed buns'], ['w-cha2', 'tea'], ['w-ka1fei1', 'coffee'], ['w-mao1', 'cats'], ['w-gou3', 'dogs'], ['w-xiong2mao1', 'pandas'], ['w-shui3guo3', 'fruit'], ['w-yu2', 'fish']],
  },
  {
    id: 'qu', jp: '去', romaji: 'qù', slotLast: true, title: '去 ___', meaning: 'To ___, please', art: '🚕',
    en: (w) => `To ${w}, please`,
    slots: [['w-jiu3dian4', 'the hotel'], ['w-huo3che1zhan4', 'the train station'], ['w-yi1yuan4', 'the hospital'], ['w-bei3jing1', 'Beijing'], ['w-shang4hai3', 'Shanghai'], ['w-nan2jing1', 'Nanjing'], ['w-can1ting1', 'the restaurant']],
  },
  {
    id: 'wo-chi', jp: '我吃', romaji: 'wǒ chī', slotLast: true, title: '我吃 ___', meaning: 'I eat ___', art: '🍽️',
    en: (w) => `I eat ${w}`,
    slots: [['w-jiao3zi', 'dumplings'], ['w-mian4tiao2', 'noodles'], ['w-mi3fan4', 'rice'], ['w-bao1zi', 'steamed buns'], ['w-rou4', 'meat'], ['w-yu2', 'fish'], ['w-ji1', 'chicken'], ['w-ping2guo3', 'an apple']],
  },
  {
    id: 'wo-he', jp: '我喝', romaji: 'wǒ hē', slotLast: true, title: '我喝 ___', meaning: 'I drink ___', art: '🥤',
    en: (w) => `I drink ${w}`,
    slots: [['w-cha2', 'tea'], ['w-ka1fei1', 'coffee'], ['w-shui3', 'water'], ['w-re4shui3', 'hot water'], ['w-pi2jiu3', 'beer']],
  },
  {
    id: 'wo-bu-yao', jp: '我不要', romaji: 'wǒ bú yào', slotLast: true, title: '我不要 ___', meaning: 'I don\'t want ___', art: '🙅',
    en: (w) => `I don't want ${w}`,
    slots: [['w-rou4', 'meat'], ['w-la4', 'spicy food'], ['w-bing1-de', 'an iced one'], ['w-ji1', 'chicken'], ['w-yu2', 'fish'], ['w-zhe4ge', 'this one'], ['w-pi2jiu3', 'beer']],
  },
  {
    id: 'wo-xiang', jp: '我想', romaji: 'wǒ xiǎng', slotLast: true, title: '我想 ___', meaning: 'I want to ___', art: '💝',
    en: (w) => `I want to ${w}`,
    slots: [['w-qu4', 'go'], ['w-chi1', 'eat'], ['w-he1', 'drink'], ['w-mai3', 'buy'], ['w-kan4', 'look'], ['w-lai2', 'come'], ['w-hui2', 'go back']],
  },
  {
    id: 'wo-bu', jp: '我不', romaji: 'wǒ bù', slotLast: true, title: '我不 ___', meaning: 'I don\'t ___', art: '🙅',
    en: (w) => `I don't ${w}`,
    slots: [['w-chi1', 'eat'], ['w-he1', 'drink'], ['w-mai3', 'buy'], ['w-kan4', 'look'], ['w-dong3', 'understand'], ['w-shuo1', 'speak'], ['w-xi3huan', 'like it']],
  },
  {
    id: 'verb-le', jp: '了', romaji: 'le', title: '___ 了', meaning: '___ (done)', art: '🏁',
    en: (w) => `${w}`,
    slots: [['w-chi1', 'I ate'], ['w-he1', 'I drank'], ['w-mai3', 'I bought it'], ['w-qu4', 'I went'], ['w-lai2', 'I came'], ['w-kan4', 'I saw it'], ['w-hui2', 'I went back']],
  },
  {
    id: 'mei-verb', jp: '没', romaji: 'méi', slotLast: true, title: '没 ___', meaning: 'didn\'t ___', art: '❌',
    en: (w) => `${w}`,
    slots: [['w-chi1', 'I didn\'t eat'], ['w-he1', 'I didn\'t drink'], ['w-mai3', 'I didn\'t buy it'], ['w-qu4', 'I didn\'t go'], ['w-lai2', 'I didn\'t come'], ['w-kan4', 'I didn\'t see it'], ['w-hui2', 'I didn\'t go back']],
  },
  {
    id: 'xingqi-wo-qu', jp: '我去北京', romaji: 'wǒ qù Běijīng', title: '___ 我去北京', meaning: '___ I go to Beijing', art: '📅',
    en: (w) => `${w} I go to Beijing`,
    slots: [['w-xing1qi1yi1', 'On Monday'], ['w-xing1qi1wu3', 'On Friday'], ['w-xing1qi1tian1', 'On Sunday'], ['w-jin1tian1', 'Today'], ['w-ming2tian1', 'Tomorrow']],
  },
];
