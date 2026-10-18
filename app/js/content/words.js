// Vocabulary and sentences. Words in the hiragana units only use kana taught up to that unit.
// Word: [jp, romaji, english, emoji]. Sentence: { jp: [chunks], romaji, en }.

export const KANA_UNIT_WORDS = {
  vowels: [
    ['あい', 'ai', 'love', '❤️'],
    ['いえ', 'ie', 'house', '🏠'],
    ['うえ', 'ue', 'above', '⬆️'],
    ['あお', 'ao', 'blue', '🔵'],
    ['いい', 'ii', 'good', '👍'],
  ],
  k: [
    ['かお', 'kao', 'face', '🙂'],
    ['あか', 'aka', 'red', '🔴'],
    ['えき', 'eki', 'station', '🚉'],
    ['あき', 'aki', 'autumn', '🍂'],
    ['こえ', 'koe', 'voice', '🗣️'],
    ['いく', 'iku', 'to go', '🚶'],
  ],
  s: [
    ['すし', 'sushi', 'sushi', '🍣'],
    ['あさ', 'asa', 'morning', '🌅'],
    ['いす', 'isu', 'chair', '🪑'],
    ['かさ', 'kasa', 'umbrella', '☂️'],
    ['しお', 'shio', 'salt', '🧂'],
    ['すき', 'suki', 'to like', '😍'],
  ],
  t: [
    ['たこ', 'tako', 'octopus', '🐙'],
    ['くつ', 'kutsu', 'shoes', '👟'],
    ['て', 'te', 'hand', '✋'],
    ['した', 'shita', 'below', '⬇️'],
    ['そと', 'soto', 'outside', '🌳'],
    ['ちかてつ', 'chikatetsu', 'subway', '🚇'],
  ],
  n: [
    ['ねこ', 'neko', 'cat', '🐱'],
    ['いぬ', 'inu', 'dog', '🐶'],
    ['なつ', 'natsu', 'summer', '☀️'],
    ['なに', 'nani', 'what', '❓'],
    ['おかね', 'okane', 'money', '💰'],
    ['にく', 'niku', 'meat', '🥩'],
  ],
  h: [
    ['はな', 'hana', 'flower', '🌼'],
    ['ひと', 'hito', 'person', '🧍'],
    ['ふね', 'fune', 'ship', '🚢'],
    ['ほし', 'hoshi', 'star', '⭐'],
    ['はし', 'hashi', 'chopsticks', '🥢'],
    ['ひこうき', 'hikouki', 'airplane', '✈️'],
  ],
  m: [
    ['みみ', 'mimi', 'ear', '👂'],
    ['むし', 'mushi', 'bug', '🐛'],
    ['め', 'me', 'eye', '👁️'],
    ['うみ', 'umi', 'sea', '🌊'],
    ['さかな', 'sakana', 'fish', '🐟'],
    ['まち', 'machi', 'town', '🏘️'],
  ],
  r: [
    ['さくら', 'sakura', 'cherry blossom', '🌸'],
    ['くるま', 'kuruma', 'car', '🚗'],
    ['はる', 'haru', 'spring', '🌱'],
    ['とり', 'tori', 'bird', '🐦'],
    ['いろ', 'iro', 'color', '🎨'],
    ['そら', 'sora', 'sky', '☁️'],
  ],
  ywn: [
    ['やま', 'yama', 'mountain', '⛰️'],
    ['ゆき', 'yuki', 'snow', '❄️'],
    ['よる', 'yoru', 'night', '🌙'],
    ['ほん', 'hon', 'book', '📖'],
    ['にほん', 'nihon', 'Japan', '🗾'],
    ['わたし', 'watashi', 'I / me', '🙋'],
    ['みかん', 'mikan', 'mandarin orange', '🍊'],
  ],
  dakuten: [
    ['かぎ', 'kagi', 'key', '🔑'],
    ['ごはん', 'gohan', 'rice / meal', '🍚'],
    ['みず', 'mizu', 'water', '💧'],
    ['かぜ', 'kaze', 'wind', '🌬️'],
    ['でんわ', 'denwa', 'phone', '📞'],
    ['ともだち', 'tomodachi', 'friend', '🧑‍🤝‍🧑'],
    ['かばん', 'kaban', 'bag', '👜'],
    ['えんぴつ', 'enpitsu', 'pencil', '✏️'],
    ['たまご', 'tamago', 'egg', '🥚'],
  ],
};

// Section 2: first words and sentences. Lessons list words introduced, then sentences.
export const WORD_UNITS = [
  {
    id: 'greetings',
    title: 'Greetings',
    desc: 'Say hello, thank you and goodbye',
    lessons: [
      { title: 'Hello', words: [
        ['おはよう', 'ohayou', 'good morning', '🌄'],
        ['こんにちは', 'konnichiwa', 'hello', '👋'],
        ['こんばんは', 'konbanwa', 'good evening', '🌆'],
      ] },
      { title: 'Goodbye', words: [
        ['さようなら', 'sayounara', 'goodbye', '🫡'],
        ['おやすみ', 'oyasumi', 'good night', '😴'],
        ['ありがとう', 'arigatou', 'thank you', '🙏'],
      ] },
      { title: 'Yes and no', words: [
        ['はい', 'hai', 'yes', '✅'],
        ['いいえ', 'iie', 'no', '❌'],
        ['すみません', 'sumimasen', 'excuse me', '🙇'],
      ] },
      { title: 'Polite phrases', sentences: [
        { jp: ['おはよう', 'ございます'], romaji: 'ohayou gozaimasu', en: 'Good morning' },
        { jp: ['ありがとう', 'ございます'], romaji: 'arigatou gozaimasu', en: 'Thank you very much' },
      ] },
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers 1–10',
    desc: 'Count from one to ten',
    lessons: [
      { title: '1 to 3', words: [
        ['いち', 'ichi', 'one', '1️⃣'],
        ['に', 'ni', 'two', '2️⃣'],
        ['さん', 'san', 'three', '3️⃣'],
      ] },
      { title: '4 to 6', words: [
        ['よん', 'yon', 'four', '4️⃣'],
        ['ご', 'go', 'five', '5️⃣'],
        ['ろく', 'roku', 'six', '6️⃣'],
      ] },
      { title: '7 to 10', words: [
        ['なな', 'nana', 'seven', '7️⃣'],
        ['はち', 'hachi', 'eight', '8️⃣'],
        ['きゅう', 'kyuu', 'nine', '9️⃣'],
        ['じゅう', 'juu', 'ten', '🔟'],
      ] },
    ],
  },
  {
    id: 'me',
    title: 'About me',
    desc: 'Introduce yourself',
    lessons: [
      { title: 'People', words: [
        ['あなた', 'anata', 'you', '🫵'],
        ['がくせい', 'gakusei', 'student', '🎒'],
        ['せんせい', 'sensei', 'teacher', '🧑‍🏫'],
      ] },
      { title: 'Meeting someone', words: [
        ['なまえ', 'namae', 'name', '🏷️'],
        ['にほんじん', 'nihonjin', 'Japanese person', '🇯🇵'],
        ['はじめまして', 'hajimemashite', 'nice to meet you', '🤝'],
      ] },
      { title: 'I am…', sentences: [
        { jp: ['わたし', 'は', 'がくせい', 'です'], romaji: 'watashi wa gakusei desu', en: 'I am a student' },
        { jp: ['わたし', 'は', 'せんせい', 'です'], romaji: 'watashi wa sensei desu', en: 'I am a teacher' },
        { jp: ['あなた', 'は', 'がくせい', 'です', 'か'], romaji: 'anata wa gakusei desu ka', en: 'Are you a student' },
      ] },
      { title: 'My name is…', sentences: [
        { jp: ['わたし', 'の', 'なまえ', 'は', 'さくら', 'です'], romaji: 'watashi no namae wa sakura desu', en: 'My name is Sakura' },
        { jp: ['ともだち', 'は', 'にほんじん', 'です'], romaji: 'tomodachi wa nihonjin desu', en: 'My friend is Japanese' },
      ] },
    ],
  },
  {
    id: 'food',
    title: 'Food & drink',
    desc: 'Order something to eat',
    lessons: [
      { title: 'Drinks', words: [
        ['おちゃ', 'ocha', 'green tea', '🍵'],
        ['ください', 'kudasai', 'please (give me)', '🙏'],
        ['おいしい', 'oishii', 'delicious', '😋'],
      ] },
      { title: 'Food', words: [
        ['りんご', 'ringo', 'apple', '🍎'],
        ['やさい', 'yasai', 'vegetables', '🥦'],
        ['これ', 'kore', 'this', '👇'],
      ] },
      { title: 'Ordering', sentences: [
        { jp: ['みず', 'を', 'ください'], romaji: 'mizu o kudasai', en: 'Water please' },
        { jp: ['おちゃ', 'を', 'ください'], romaji: 'ocha o kudasai', en: 'Tea please' },
        { jp: ['すし', 'が', 'すき', 'です'], romaji: 'sushi ga suki desu', en: 'I like sushi' },
      ] },
      { title: 'What is this?', sentences: [
        { jp: ['これ', 'は', 'りんご', 'です'], romaji: 'kore wa ringo desu', en: 'This is an apple' },
        { jp: ['これ', 'は', 'なん', 'です', 'か'], romaji: 'kore wa nan desu ka', en: 'What is this' },
        { jp: ['さかな', 'は', 'おいしい', 'です'], romaji: 'sakana wa oishii desu', en: 'The fish is delicious' },
      ] },
    ],
  },
];
