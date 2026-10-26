// The course: themed units of essential words and sentences. Kana are not taught in separate
// sections — each unit gets short "Read it" lessons for the characters its own words use (see
// course.js). Kanji lessons, grammar cards and dialogues are woven in by id.
//
// Word: [jp, romaji, english, art (emoji drawn in the cartoon art set), extras?]
//   extras: { note: when / how it is used, alt: [other spellings speech recognition may return] }
// Sentence: { jp: [chunks], romaji (one word per chunk), en, alt?: [other accepted translations] }
// Lesson: { title, words?, sentences?, grammar?: id of a grammar card shown before the sentences }
// Unit: { id, title, desc, facts: [fun-fact categories for breaks], lessons, dialogues?: [ids] }

const FACT = {
  daily: 'Hospitality, Public Services & Daily Life',
  nature: 'Nature, Wildlife & Geography',
  transport: 'Engineering, Transport & Convenience',
  food: 'Food Culture & Culinary Mastery',
  city: 'City Life, Architecture & Shinto Beliefs',
  festivals: 'Festivals, Tradition & Martial Arts',
  history: 'Feudal History, Attire & Classical Arts',
  pop: 'Pop Culture, Gaming & Entertainment',
  society: 'Modern Society, Work & Education',
  wellness: 'Wellness, Traditions & Uniquely Japanese Concepts',
};

export const SECTIONS_DATA = [
  {
    id: 'tokyo',
    title: 'First trip to Japan',
    units: [
      {
        id: 'hello',
        title: 'Hello & thank you',
        desc: 'Greet people and thank them the right way',
        facts: [FACT.society, FACT.wellness],
        phrases: ['Key Polite Basics'],
        lessons: [
          { title: 'Hello', words: [
            ['こんにちは', 'konnichiwa', 'hello', '👋', { note: 'The everyday hello, from late morning to evening.' }],
            ['おはよう', 'ohayou', 'good morning (casual)', '🌅', { note: 'With friends and family. To be polite, say おはようございます.' }],
            ['おはようございます', 'ohayou gozaimasu', 'good morning (polite)', '🌄', { note: 'Polite: shops, hotels, colleagues, people you don\'t know.' }],
          ] },
          { title: 'Thank you', words: [
            ['ありがとう', 'arigatou', 'thanks (friends & family)', '🤗', { note: 'Casual — with friends and family.' }],
            ['ありがとうございます', 'arigatou gozaimasu', 'thank you (polite)', '🙇', { note: 'Polite — the safe choice with anyone you don\'t know well.' }],
            ['どうも', 'doumo', 'thanks (quick)', '👍', { note: 'A quick, light thanks — when someone holds a door or hands you something.' }],
          ] },
          { title: 'Very polite thanks', words: [
            ['どうもありがとう', 'doumo arigatou', 'thanks a lot (casual)', '💝', { note: 'Warm and casual, with friends and family.' }],
            ['どうもありがとうございます', 'doumo arigatou gozaimasu', 'thank you very much (formal)', '💐', { note: 'Formal and very polite.' }],
            ['ありがとうございました', 'arigatou gozaimashita', 'thank you (for what you did)', '🛍️', { note: 'Past tense: for something already done. Shop staff say it as you leave.' }],
          ] },
          { title: 'Yes, no & sorry', words: [
            ['はい', 'hai', 'yes', '✅', { note: 'Also means "I\'m listening" or "here you go".' }],
            ['いいえ', 'iie', 'no', '❌', { note: 'Quite direct. People often soften a no with ちょっと… ("well, a bit…").' }],
            ['すみません', 'sumimasen', 'excuse me / sorry', '🙋', { note: 'To get attention (even to call a waiter), to apologise, or as a light thank-you.' }],
          ] },
          { title: 'See you!', words: [
            ['じゃあね', 'jaa ne', 'bye (casual)', '🏃', { note: 'With friends and family. さようなら sounds like a long or final farewell, so it is rarely used.' }],
            ['またね', 'mata ne', 'see you', '🔁', { note: 'Casual "see you again".' }],
            ['おやすみ', 'oyasumi', 'good night (casual)', '😴', { note: 'With friends and family.' }],
            ['おやすみなさい', 'oyasumi nasai', 'good night (polite)', '🌙' ],
          ] },
          { title: 'How are you?', grammar: 'desu', words: [
            ['はじめまして', 'hajimemashite', 'nice to meet you', '🤝', { note: 'Only the first time you meet someone.' }],
            ['もしもし', 'moshimoshi', 'hello (on the phone)', '📞', { note: 'Only on the phone.' }],
            ['げんき', 'genki', 'well / healthy', '💪'],
          ], sentences: [
            { jp: ['げんき', 'です'], romaji: 'genki desu', en: 'I am well', alt: ['I\'m well', 'I am fine'] },
            { jp: ['おげんき', 'です', 'か'], romaji: 'ogenki desu ka', en: 'How are you', alt: ['Are you well'] },
          ] },
        ],
      },
      {
        id: 'around',
        title: 'Getting around',
        desc: 'Stations, trains and finding the toilet',
        facts: [FACT.transport, FACT.city],
        phrases: ['Getting Around & Transit'],
        dialogues: ['d-station'],
        lessons: [
          { title: 'Trains', words: [
            ['えき', 'eki', 'station', '🚉', { alt: ['駅'] }],
            ['でんしゃ', 'densha', 'train', '🚆', { alt: ['電車'] }],
            ['ちかてつ', 'chikatetsu', 'subway', '🚇', { alt: ['地下鉄'] }],
          ] },
          { title: 'Toilet & taxi', words: [
            ['トイレ', 'toire', 'toilet', '🚻', { note: 'Katakana: a word borrowed from English.' }],
            ['おてあらい', 'otearai', 'restroom (polite)', '🚾', { note: 'More polite than トイレ.', alt: ['お手洗い'] }],
            ['タクシー', 'takushii', 'taxi', '🚕'],
          ] },
          { title: 'Tickets & hotels', words: [
            ['きっぷ', 'kippu', 'ticket', '🎫', { alt: ['切符'] }],
            ['しんかんせん', 'shinkansen', 'bullet train', '🚄', { alt: ['新幹線'] }],
            ['ホテル', 'hoteru', 'hotel', '🏨'],
            ['レストラン', 'resutoran', 'restaurant', '🍽️'],
          ] },
          { title: 'Which way?', words: [
            ['どこ', 'doko', 'where', '❓'],
            ['みぎ', 'migi', 'right', '➡️', { alt: ['右'] }],
            ['ひだり', 'hidari', 'left', '⬅️', { alt: ['左'] }],
            ['まっすぐ', 'massugu', 'straight ahead', '⬆️', { alt: ['真っ直ぐ'] }],
          ] },
          { title: 'Where is…?', grammar: 'ka', sentences: [
            { jp: ['トイレ', 'は', 'どこ', 'です', 'か'], romaji: 'toire wa doko desu ka', en: 'Where is the toilet', alt: ['Where is the bathroom', 'Where\'s the toilet'] },
            { jp: ['えき', 'は', 'どこ', 'です', 'か'], romaji: 'eki wa doko desu ka', en: 'Where is the station', alt: ['Where\'s the station'] },
            { jp: ['ホテル', 'は', 'どこ', 'です', 'か'], romaji: 'hoteru wa doko desu ka', en: 'Where is the hotel', alt: ['Where\'s the hotel'] },
            { jp: ['みぎ', 'です'], romaji: 'migi desu', en: 'It is on the right', alt: ['It\'s on the right', 'It is right'] },
          ] },
        ],
      },
      {
        id: 'food',
        title: 'Food & drinks',
        desc: 'Order, say cheers and pay the bill',
        facts: [FACT.food],
        phrases: ['Dining & Food'],
        dialogues: ['d-coffee'],
        lessons: [
          { title: 'Ordering', words: [
            ['これ', 'kore', 'this', '👇'],
            ['ください', 'kudasai', 'please give me', '🤲', { note: 'After the thing you want: コーヒー ください.' }],
            ['おねがいします', 'onegaishimasu', 'please', '🙏', { note: 'A polite "please" for requests.', alt: ['お願いします'] }],
          ] },
          { title: 'Drinks', words: [
            ['みず', 'mizu', 'water (cold)', '💧', { alt: ['水'] }],
            ['おゆ', 'oyu', 'hot water', '♨️', { alt: ['お湯'] }],
            ['おちゃ', 'ocha', 'green tea', '🍵', { alt: ['お茶'] }],
            ['コーヒー', 'koohii', 'coffee', '☕'],
          ] },
          { title: 'Cheers!', words: [
            ['かんぱい', 'kanpai', 'cheers!', '🍻', { alt: ['乾杯'] }],
            ['ビール', 'biiru', 'beer', '🍺'],
            ['おさけ', 'osake', 'alcohol', '🍶', { note: 'Any alcohol. Japanese rice wine is にほんしゅ.', alt: ['お酒'] }],
            ['にほんしゅ', 'nihonshu', 'sake (rice wine)', '🍶', { alt: ['日本酒'] }],
          ] },
          { title: 'Tastes', words: [
            ['おいしい', 'oishii', 'delicious', '😋', { alt: ['美味しい'] }],
            ['からい', 'karai', 'spicy', '🌶️', { alt: ['辛い'] }],
            ['ホット', 'hotto', 'hot (drink)', '🔥'],
            ['アイス', 'aisu', 'iced (drink)', '🧊'],
          ] },
          { title: 'This and that', grammar: 'to', sentences: [
            { jp: ['これ', 'を', 'ください'], romaji: 'kore o kudasai', en: 'This please', alt: ['I would like this', 'This one please'] },
            { jp: ['みず', 'と', 'おちゃ'], romaji: 'mizu to ocha', en: 'Water and tea', alt: ['Water and green tea'] },
            { jp: ['コーヒー', 'を', 'ください'], romaji: 'koohii o kudasai', en: 'Coffee please', alt: ['A coffee please'] },
            { jp: ['ビール', 'と', 'みず'], romaji: 'biiru to mizu', en: 'Beer and water' },
          ] },
          { title: 'At the table', words: [
            ['いただきます', 'itadakimasu', 'said before eating', '🥢', { note: 'Said before every meal — like "thank you for the food".' }],
            ['ごちそうさまでした', 'gochisousama deshita', 'thanks for the meal', '😊', { note: 'Said after eating, also to the restaurant staff as you leave.' }],
            ['おかいけい', 'okaikei', 'the bill', '🧾', { alt: ['お会計'] }],
          ], sentences: [
            { jp: ['おかいけい', 'を', 'おねがいします'], romaji: 'okaikei o onegaishimasu', en: 'The bill please', alt: ['Check please'] },
            { jp: ['とても', 'おいしい', 'です'], romaji: 'totemo oishii desu', en: 'It is very good', alt: ['It\'s very good', 'It is very delicious', 'It\'s very delicious'] },
          ] },
        ],
      },
      {
        id: 'shopping',
        title: 'Shopping & help',
        desc: 'Prices, paying by card and asking for help',
        facts: [FACT.daily, FACT.city],
        phrases: ['Convenience Store (Konbini) & Shopping', 'Important Locations & Emergency', 'Practical Everyday Questions & Phrases'],
        dialogues: ['d-price', 'd-card'],
        lessons: [
          { title: 'Paying', words: [
            ['いくら', 'ikura', 'how much', '💴'],
            ['カード', 'kaado', 'card', '💳'],
            ['げんきん', 'genkin', 'cash', '💵', { alt: ['現金'] }],
          ] },
          { title: 'Help!', words: [
            ['わかりません', 'wakarimasen', 'I don\'t understand', '🤷', { alt: ['分かりません'] }],
            ['えいご', 'eigo', 'English', '🔤', { alt: ['英語'] }],
            ['たすけて', 'tasukete', 'help!', '🆘', { alt: ['助けて'] }],
            ['だいじょうぶ', 'daijoubu', 'it\'s okay', '👌', { alt: ['大丈夫'] }],
          ] },
          { title: 'Questions', grammar: 'de', sentences: [
            { jp: ['これ', 'は', 'いくら', 'です', 'か'], romaji: 'kore wa ikura desu ka', en: 'How much is this', alt: ['How much is it'] },
            { jp: ['カード', 'で', 'おねがいします'], romaji: 'kaado de onegaishimasu', en: 'By card please', alt: ['With card please', 'Card please'] },
            { jp: ['えいご', 'が', 'はなせます', 'か'], romaji: 'eigo ga hanasemasu ka', en: 'Can you speak English', alt: ['Do you speak English'] },
            { jp: ['ちょっと', 'まって', 'ください'], romaji: 'chotto matte kudasai', en: 'Please wait a moment', alt: ['Wait a moment please', 'One moment please'] },
          ] },
        ],
      },
      {
        id: 'hotel',
        title: 'At the hotel',
        desc: 'Check in, find your room, Wi-Fi and breakfast',
        facts: [FACT.daily, FACT.wellness],
        phrases: ['Practical Everyday Questions & Phrases'],
        lessons: [
          { title: 'Checking in', words: [
            ['よやく', 'yoyaku', 'reservation', '📋', { alt: ['予約'] }],
            ['チェックイン', 'chekkuin', 'check-in', '🛎️', { note: 'English said the Japanese way. Check-out is チェックアウト.' }],
            ['へや', 'heya', 'room', '🚪', { alt: ['部屋'] }],
            ['かぎ', 'kagi', 'key', '🔑', { alt: ['鍵'] }],
          ] },
          { title: 'Hotel life', words: [
            ['あさごはん', 'asagohan', 'breakfast', '🍳', { note: 'あさ (morning) + ごはん (meal, rice).', alt: ['朝ご飯', '朝ごはん'] }],
            ['なんじ', 'nanji', 'what time', '🕐', { alt: ['何時'] }],
            ['ワイファイ', 'waifai', 'Wi-Fi', '📶'],
            ['パスワード', 'pasuwaado', 'password', '🔐'],
            ['にもつ', 'nimotsu', 'luggage', '🧳', { alt: ['荷物'] }],
          ] },
          { title: 'At the front desk', grammar: 'ga', sentences: [
            { jp: ['よやく', 'が', 'あります'], romaji: 'yoyaku ga arimasu', en: 'I have a reservation', alt: ['I have a booking', 'I\'ve got a reservation'] },
            { jp: ['チェックイン', 'を', 'おねがいします'], romaji: 'chekkuin o onegaishimasu', en: 'Check-in please', alt: ['I would like to check in', 'Check in please'] },
            { jp: ['ワイファイ', 'の', 'パスワード', 'は'], romaji: 'waifai no pasuwaado wa', en: 'What is the Wi-Fi password', alt: ['The Wi-Fi password?', 'What\'s the Wi-Fi password'] },
          ] },
          { title: 'Breakfast & bags', sentences: [
            { jp: ['あさごはん', 'は', 'なんじ', 'です', 'か'], romaji: 'asagohan wa nanji desu ka', en: 'What time is breakfast', alt: ['When is breakfast'] },
            { jp: ['にもつ', 'を', 'あずかって', 'ください'], romaji: 'nimotsu o azukatte kudasai', en: 'Please keep my luggage', alt: ['Please look after my luggage', 'Please hold my bags'] },
            { jp: ['へや', 'は', 'どこ', 'です', 'か'], romaji: 'heya wa doko desu ka', en: 'Where is the room', alt: ['Where is my room'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday Japanese',
    units: [
      {
        id: 'numbers',
        title: 'Numbers 1–10',
        desc: 'Count from one to ten',
        facts: [FACT.society, FACT.festivals],
        lessons: [
          { title: '1 to 3', words: [['いち', 'ichi', 'one', '1️⃣'], ['に', 'ni', 'two', '2️⃣'], ['さん', 'san', 'three', '3️⃣']] },
          { title: '4 to 6', words: [['よん', 'yon', 'four', '4️⃣', { note: 'Also し, but よん is safer — し sounds like "death".' }], ['ご', 'go', 'five', '5️⃣'], ['ろく', 'roku', 'six', '6️⃣']] },
          { title: '7 to 10', words: [['なな', 'nana', 'seven', '7️⃣'], ['はち', 'hachi', 'eight', '8️⃣'], ['きゅう', 'kyuu', 'nine', '9️⃣'], ['じゅう', 'juu', 'ten', '🔟']] },
        ],
      },
      {
        id: 'people',
        title: 'People & jobs',
        desc: 'Introduce yourself and say what you do',
        facts: [FACT.society],
        dialogues: ['d-meet'],
        lessons: [
          { title: 'Me and you', words: [
            ['わたし', 'watashi', 'I / me', '🙋', { alt: ['私'] }],
            ['あなた', 'anata', 'you', '🫵', { note: 'Often left out — Japanese uses the person\'s name + さん instead.' }],
            ['ともだち', 'tomodachi', 'friend', '🧑‍🤝‍🧑', { alt: ['友達'] }],
          ] },
          { title: 'Jobs', words: [
            ['せんせい', 'sensei', 'teacher', '🧑‍🏫', { alt: ['先生'], note: 'Also used for doctors and lawyers, as a title.' }],
            ['いしゃ', 'isha', 'doctor', '🧑‍⚕️', { alt: ['医者'] }],
            ['べんごし', 'bengoshi', 'lawyer', '⚖️', { alt: ['弁護士'] }],
          ] },
          { title: 'More jobs', words: [
            ['がくせい', 'gakusei', 'student', '🎒', { alt: ['学生'] }],
            ['かいしゃいん', 'kaishain', 'office worker', '💼', { alt: ['会社員'] }],
            ['エンジニア', 'enjinia', 'engineer', '🧑‍💻'],
            ['シェフ', 'shefu', 'chef', '🧑‍🍳'],
          ] },
          { title: 'I am…', grammar: 'wa', sentences: [
            { jp: ['わたし', 'は', 'がくせい', 'です'], romaji: 'watashi wa gakusei desu', en: 'I am a student', alt: ['I\'m a student'] },
            { jp: ['ともだち', 'は', 'いしゃ', 'です'], romaji: 'tomodachi wa isha desu', en: 'My friend is a doctor', alt: ['The friend is a doctor', 'A friend is a doctor'] },
            { jp: ['せんせい', 'と', 'いしゃ'], romaji: 'sensei to isha', en: 'A teacher and a doctor', alt: ['Teacher and doctor'] },
            { jp: ['べんごし', 'と', 'エンジニア'], romaji: 'bengoshi to enjinia', en: 'A lawyer and an engineer', alt: ['Lawyer and engineer'] },
          ] },
          { title: 'Names', grammar: 'san', words: [
            ['なまえ', 'namae', 'name', '🏷️', { alt: ['名前'] }],
          ], sentences: [
            { jp: ['わたし', 'の', 'なまえ', 'は', 'ゆき', 'です'], romaji: 'watashi no namae wa yuki desu', en: 'My name is Yuki' },
            { jp: ['たなか', 'さん', 'は', 'せんせい', 'です', 'か'], romaji: 'tanaka san wa sensei desu ka', en: 'Is Mr Tanaka a teacher', alt: ['Is Ms Tanaka a teacher', 'Is Tanaka a teacher'] },
          ] },
        ],
      },
      {
        id: 'meals',
        title: 'Food words',
        desc: 'What you eat, and what you like',
        facts: [FACT.food],
        lessons: [
          { title: 'Meals', words: [
            ['ごはん', 'gohan', 'rice / meal', '🍚', { alt: ['ご飯'] }],
            ['さかな', 'sakana', 'fish', '🐟', { alt: ['魚'] }],
            ['にく', 'niku', 'meat', '🥩', { alt: ['肉'] }],
          ] },
          { title: 'Fresh food', words: [
            ['やさい', 'yasai', 'vegetables', '🥦', { alt: ['野菜'] }],
            ['りんご', 'ringo', 'apple', '🍎'],
            ['たまご', 'tamago', 'egg', '🥚', { alt: ['卵'] }],
          ] },
          { title: 'Favourites', words: [
            ['すし', 'sushi', 'sushi', '🍣', { alt: ['寿司'] }],
            ['ラーメン', 'raamen', 'ramen', '🍜'],
            ['すき', 'suki', 'to like', '😍', { alt: ['好き'] }],
          ] },
          { title: 'I like sushi', grammar: 'ga', sentences: [
            { jp: ['すし', 'が', 'すき', 'です'], romaji: 'sushi ga suki desu', en: 'I like sushi' },
            { jp: ['さかな', 'と', 'ごはん'], romaji: 'sakana to gohan', en: 'Fish and rice' },
            { jp: ['これ', 'は', 'なん', 'です', 'か'], romaji: 'kore wa nan desu ka', en: 'What is this', alt: ['What\'s this'] },
            { jp: ['ラーメン', 'は', 'おいしい', 'です'], romaji: 'raamen wa oishii desu', en: 'Ramen is delicious', alt: ['The ramen is delicious'] },
          ] },
        ],
      },
      {
        id: 'world',
        title: 'Around you',
        desc: 'Animals, nature and things',
        facts: [FACT.nature],
        lessons: [
          { title: 'Animals', words: [['ねこ', 'neko', 'cat', '🐈', { alt: ['猫'] }], ['いぬ', 'inu', 'dog', '🐕', { alt: ['犬'] }], ['とり', 'tori', 'bird', '🐦', { alt: ['鳥'] }]] },
          { title: 'Nature', words: [['やま', 'yama', 'mountain', '⛰️', { alt: ['山'] }], ['うみ', 'umi', 'sea', '🌊', { alt: ['海'] }], ['そら', 'sora', 'sky', '☁️', { alt: ['空'] }]] },
          { title: 'Things', words: [['くるま', 'kuruma', 'car', '🚗', { alt: ['車'] }], ['ほん', 'hon', 'book', '📖', { alt: ['本'] }], ['かさ', 'kasa', 'umbrella', '☂️', { alt: ['傘'] }]] },
          { title: 'Pretty!', words: [['きれい', 'kirei', 'pretty / clean', '✨', { alt: ['綺麗'] }]], sentences: [
            { jp: ['ねこ', 'と', 'いぬ'], romaji: 'neko to inu', en: 'Cats and dogs', alt: ['A cat and a dog', 'Cat and dog'] },
            { jp: ['うみ', 'は', 'きれい', 'です'], romaji: 'umi wa kirei desu', en: 'The sea is pretty', alt: ['The sea is beautiful'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'real',
    title: 'Real Japanese',
    units: [
      {
        id: 'casual',
        title: 'Casual & slang',
        desc: 'What friends really say',
        facts: [FACT.pop],
        dialogues: ['d-ramen', 'd-maji'],
        lessons: [
          { title: 'Really?!', words: [
            ['まじ', 'maji', 'really?!', '😲', { note: 'Very casual — friends only.' }],
            ['やばい', 'yabai', 'amazing / crazy', '🤯', { note: 'Can be good or bad depending on tone!' }],
            ['めっちゃ', 'meccha', 'super / very', '💯', { note: 'Casual "very", from western Japan.' }],
          ] },
          { title: 'Funny & lame', words: [
            ['うける', 'ukeru', 'so funny', '😂'],
            ['ダサい', 'dasai', 'lame / uncool', '🙄'],
            ['ダメ', 'dame', 'no good / not allowed', '🙅'],
          ] },
          { title: 'People talk', words: [
            ['イケメン', 'ikemen', 'handsome guy', '😎'],
            ['ムカつく', 'mukatsuku', 'annoying', '😤', { note: 'Rude — use with care!' }],
            ['ググる', 'guguru', 'to google', '🔎'],
          ], sentences: [
            { jp: ['めっちゃ', 'おいしい'], romaji: 'meccha oishii', en: 'Super delicious', alt: ['Very delicious', 'So delicious'] },
            { jp: ['それ', 'は', 'ダメ', 'です'], romaji: 'sore wa dame desu', en: 'That is not allowed', alt: ['That\'s not allowed', 'That is no good', 'That\'s no good'] },
          ] },
        ],
      },
    ],
  },
];

// Two-person dialogues for listening comprehension. Speakers are cast characters.
export const DIALOGUES = {
  'd-station': {
    title: 'At the station',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'すみません、えきはどこですか。', en: 'Excuse me, where is the station?' },
      { who: 1, jp: 'まっすぐです。それから、みぎです。', en: 'Straight ahead. Then, to the right.' },
      { who: 0, jp: 'ありがとうございます！', en: 'Thank you!' },
    ],
    question: 'What did they talk about?',
    options: ['Where the station is', 'The price of a ticket', 'Which train is the fastest'],
  },
  'd-coffee': {
    title: 'At the café',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'コーヒーをください。', en: 'A coffee please.' },
      { who: 1, jp: 'ホットですか、アイスですか。', en: 'Hot or iced?' },
      { who: 0, jp: 'アイスでおねがいします。', en: 'Iced please.' },
    ],
    question: 'What did the customer order?',
    options: ['An iced coffee', 'A hot coffee', 'A green tea'],
  },
  'd-price': {
    title: 'At a shop',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'これはいくらですか。', en: 'How much is this?' },
      { who: 1, jp: 'ごひゃくえんです。', en: 'It is 500 yen.' },
      { who: 0, jp: 'じゃあ、これをください。', en: 'Then, this please.' },
    ],
    question: 'What happened?',
    options: ['She asked the price and bought it', 'She asked where the toilet is', 'She asked for the bill at a restaurant'],
  },
  'd-card': {
    title: 'Paying',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'カードでいいですか。', en: 'Is a card okay?' },
      { who: 1, jp: 'すみません、げんきんだけです。', en: 'Sorry, cash only.' },
      { who: 0, jp: 'わかりました。', en: 'Understood.' },
    ],
    question: 'Can he pay by card?',
    options: ['No, it is cash only', 'Yes, cards are fine', 'He did not ask about paying'],
  },
  'd-meet': {
    title: 'Meeting someone',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'はじめまして、たなかです。', en: 'Nice to meet you, I\'m Tanaka.' },
      { who: 1, jp: 'はじめまして、ゆきです。せんせいです。', en: 'Nice to meet you, I\'m Yuki. I\'m a teacher.' },
      { who: 0, jp: 'わたしはいしゃです。よろしくおねがいします。', en: 'I\'m a doctor. Pleased to meet you.' },
    ],
    question: 'What are their jobs?',
    options: ['A doctor and a teacher', 'A lawyer and a student', 'A chef and an engineer'],
  },
  'd-ramen': {
    title: 'Hungry friends',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'おなかすいた！', en: 'I\'m hungry!' },
      { who: 1, jp: 'ラーメンたべよう！めっちゃおいしいよ。', en: 'Let\'s eat ramen! It\'s super good.' },
      { who: 0, jp: 'いいね！', en: 'Sounds good!' },
    ],
    question: 'What are they going to do?',
    options: ['Eat ramen', 'Take a taxi', 'Go to the sea'],
  },
  'd-maji': {
    title: 'Big news',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'あしたにほんにいくよ！', en: 'I\'m going to Japan tomorrow!' },
      { who: 1, jp: 'まじ？やばい！', en: 'Really? Amazing!' },
      { who: 0, jp: 'すしをたくさんたべる！', en: 'I\'ll eat lots of sushi!' },
    ],
    question: 'What is the news?',
    options: ['She is going to Japan tomorrow', 'She lost her ticket', 'She does not like sushi'],
  },
};
