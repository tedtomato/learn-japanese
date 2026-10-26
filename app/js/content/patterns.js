// Pattern drills (substitution drills): one sentence pattern, many words swapped into its slot, so
// learners can build sentences they never memorised. jp/romaji are the pattern after the slot;
// en(word) makes the English. slots: [word id, English inside the sentence]. A drill opens once
// three of its slot words are learned, and only uses learned ones.
export const PATTERNS = [
  {
    id: 'kudasai', jp: 'をください', romaji: 'o kudasai', title: '___ をください', meaning: '___, please', art: '🙏',
    en: (w) => `${w}, please`,
    slots: [['w-koohii', 'Coffee'], ['w-mizu', 'Water'], ['w-ocha', 'Green tea'], ['w-biiru', 'Beer'], ['w-nihonshu', 'Sake'], ['w-kore', 'This'], ['w-sushi', 'Sushi'], ['w-raamen', 'Ramen'], ['w-gohan', 'Rice'], ['w-kippu', 'A ticket']],
  },
  {
    id: 'doko', jp: 'はどこですか', romaji: 'wa doko desu ka', title: '___ はどこですか', meaning: 'Where is ___?', art: '🗺️',
    en: (w) => `Where is the ${w}?`,
    slots: [['w-eki', 'station'], ['w-toire', 'toilet'], ['w-hoteru', 'hotel'], ['w-resutoran', 'restaurant'], ['w-otearai', 'restroom'], ['w-chikatetsu', 'subway'], ['w-hoomu', 'platform'], ['w-norikae', 'transfer']],
  },
  {
    id: 'onegai', jp: 'でおねがいします', romaji: 'de onegaishimasu', title: '___ でおねがいします', meaning: 'By / in ___, please', art: '💳',
    en: (w) => `${w}, please`,
    slots: [['w-kaado', 'By card'], ['w-genkin', 'In cash'], ['w-eigo', 'In English']],
  },
  {
    id: 'ikura', jp: 'はいくらですか', romaji: 'wa ikura desu ka', title: '___ はいくらですか', meaning: 'How much is ___?', art: '💴',
    en: (w) => `How much is ${w}?`,
    slots: [['w-kore', 'this'], ['w-kippu', 'the ticket'], ['w-koohii', 'the coffee'], ['w-biiru', 'the beer'], ['w-raamen', 'the ramen'], ['w-sushi', 'the sushi']],
  },
  {
    id: 'suki', jp: 'がすきです', romaji: 'ga suki desu', title: '___ がすきです', meaning: 'I like ___', art: '😋',
    en: (w) => `I like ${w}`,
    slots: [['w-sushi', 'sushi'], ['w-raamen', 'ramen'], ['w-neko', 'cats'], ['w-inu', 'dogs'], ['w-sakana', 'fish'], ['w-niku', 'meat'], ['w-yasai', 'vegetables'], ['w-ringo', 'apples'], ['w-biiru', 'beer'], ['w-ocha', 'green tea']],
  },
  {
    id: 'made', jp: 'までおねがいします', romaji: 'made onegaishimasu', title: '___ までおねがいします', meaning: 'To ___, please', art: '🚕',
    en: (w) => `To ${w}, please`,
    slots: [['w-eki', 'the station'], ['w-hoteru', 'the hotel'], ['w-kyouto', 'Kyoto'], ['w-resutoran', 'the restaurant']],
  },
];
