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
    slots: [['w-cai4dan1', 'the menu'], ['w-shui3', 'water'], ['w-re4shui3', 'hot water'], ['w-cha2', 'tea'], ['w-zhe4ge', 'this one'], ['w-fang2ka3', 'the room card'], ['w-yao4', 'medicine'], ['w-piao4', 'a ticket']],
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
];
