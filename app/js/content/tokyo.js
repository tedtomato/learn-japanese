// Section 1: survival Japanese for a trip to Tokyo. Taught by sound and romaji — no reading needed yet.
// Word: [jp, romaji, english, emoji]. Sentence: { jp: [chunks], romaji (one word per chunk), en }.

export const TOKYO_UNITS = [
  {
    id: 'hello',
    title: 'Hello & thank you',
    desc: 'The polite basics you will use all day',
    lessons: [
      { title: 'Hello', words: [
        ['こんにちは', 'konnichiwa', 'hello', '👋'],
        ['ありがとう', 'arigatou', 'thank you', '🙏'],
        ['すみません', 'sumimasen', 'excuse me / sorry', '🙇'],
      ] },
      { title: 'Yes and no', words: [
        ['はい', 'hai', 'yes', '✅'],
        ['いいえ', 'iie', 'no', '❌'],
        ['ありがとうございます', 'arigatou gozaimasu', 'thank you very much', '💐'],
      ] },
      { title: 'Morning to night', words: [
        ['おはようございます', 'ohayou gozaimasu', 'good morning', '🌅'],
        ['こんばんは', 'konbanwa', 'good evening', '🌆'],
        ['さようなら', 'sayounara', 'goodbye', '👋'],
      ] },
    ],
  },
  {
    id: 'around',
    title: 'Getting around',
    desc: 'Stations, trains and finding the toilet',
    lessons: [
      { title: 'Trains', words: [
        ['えき', 'eki', 'station', '🚉'],
        ['でんしゃ', 'densha', 'train', '🚆'],
        ['ちかてつ', 'chikatetsu', 'subway', '🚇'],
      ] },
      { title: 'Taxi & tickets', words: [
        ['トイレ', 'toire', 'toilet', '🚻'],
        ['タクシー', 'takushii', 'taxi', '🚕'],
        ['きっぷ', 'kippu', 'ticket', '🎫'],
      ] },
      { title: 'Which way?', words: [
        ['どこ', 'doko', 'where', '❓'],
        ['みぎ', 'migi', 'right', '➡️'],
        ['ひだり', 'hidari', 'left', '⬅️'],
        ['まっすぐ', 'massugu', 'straight ahead', '⬆️'],
      ] },
      { title: 'Where is…?', sentences: [
        { jp: ['トイレ', 'は', 'どこ', 'です', 'か'], romaji: 'toire wa doko desu ka', en: 'Where is the toilet' },
        { jp: ['えき', 'は', 'どこ', 'です', 'か'], romaji: 'eki wa doko desu ka', en: 'Where is the station' },
        { jp: ['ちかてつ', 'は', 'どこ', 'です', 'か'], romaji: 'chikatetsu wa doko desu ka', en: 'Where is the subway' },
      ] },
    ],
  },
  {
    id: 'food',
    title: 'Food & konbini',
    desc: 'Order, eat and pay',
    lessons: [
      { title: 'Ordering', words: [
        ['これ', 'kore', 'this', '👇'],
        ['ください', 'kudasai', 'please give me', '🤲'],
        ['おねがいします', 'onegaishimasu', 'please', '🙏'],
      ] },
      { title: 'Drinks & snacks', words: [
        ['みず', 'mizu', 'water', '💧'],
        ['おいしい', 'oishii', 'delicious', '😋'],
        ['コンビニ', 'konbini', 'convenience store', '🏪'],
      ] },
      { title: 'At the table', words: [
        ['いただきます', 'itadakimasu', 'said before eating', '🥢'],
        ['ごちそうさまでした', 'gochisousama deshita', 'thanks for the meal', '😊'],
        ['おかいけい', 'okaikei', 'the bill', '🧾'],
      ] },
      { title: 'This, please!', sentences: [
        { jp: ['これ', 'を', 'ください'], romaji: 'kore o kudasai', en: 'This please' },
        { jp: ['みず', 'を', 'ください'], romaji: 'mizu o kudasai', en: 'Water please' },
        { jp: ['おかいけい', 'を', 'おねがいします'], romaji: 'okaikei o onegaishimasu', en: 'The bill please' },
      ] },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping & help',
    desc: 'Prices, paying by card and asking for help',
    lessons: [
      { title: 'Paying', words: [
        ['いくら', 'ikura', 'how much', '💴'],
        ['カード', 'kaado', 'card', '💳'],
        ['だいじょうぶ', 'daijoubu', "it's okay", '👌'],
      ] },
      { title: 'Help!', words: [
        ['わかりません', 'wakarimasen', "I don't understand", '🤷'],
        ['えいご', 'eigo', 'English', '🇬🇧'],
        ['たすけて', 'tasukete', 'help!', '🆘'],
      ] },
      { title: 'Questions', sentences: [
        { jp: ['いくら', 'です', 'か'], romaji: 'ikura desu ka', en: 'How much is it' },
        { jp: ['カード', 'は', 'つかえます', 'か'], romaji: 'kaado wa tsukaemasu ka', en: 'Can I use a card' },
        { jp: ['えいご', 'が', 'はなせます', 'か'], romaji: 'eigo ga hanasemasu ka', en: 'Can you speak English' },
      ] },
    ],
  },
];
