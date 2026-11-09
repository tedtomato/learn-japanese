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
        dialogues: ['d-morning', 'd-farewell'],
        lessons: [
          { title: 'Hello', words: [
            ['こんにちは', 'konnichiwa', 'hello', '👋', { note: 'The everyday hello, from late morning to evening.' }],
            ['おはよう', 'ohayou', 'good morning (casual)', '🌅', { note: 'With friends and family. To be polite, say おはようございます.' }],
            ['おはようございます', 'ohayou gozaimasu', 'good morning (polite)', '🌄', { note: 'Polite: shops, hotels, colleagues, people you don\'t know.' }],
            ['こんばんは', 'konbanwa', 'good evening', '🌃', { note: 'After dark. The last は is read "wa", as a particle.' }],
          ] },
          { title: 'Thank you', words: [
            ['ありがとう', 'arigatou', 'thanks (friends & family)', '🤗', { note: 'Casual — with friends and family.' }],
            ['ありがとうございます', 'arigatou gozaimasu', 'thank you (polite)', '🙇', { note: 'Polite — the safe choice with anyone you don\'t know well.' }],
            ['どうも', 'doumo', 'thanks (quick)', '👍', { note: 'A quick, light thanks — when someone holds a door or hands you something.' }],
            ['どうぞ', 'douzo', 'please / here you go', '🤲', { note: 'Said when offering something or inviting you to go ahead.' }],
          ] },
          { title: 'Very polite thanks', words: [
            ['どうもありがとう', 'doumo arigatou', 'thanks a lot (casual)', '💝', { note: 'Warm and casual, with friends and family.' }],
            ['どうもありがとうございます', 'doumo arigatou gozaimasu', 'thank you very much (formal)', '💐', { note: 'Formal and very polite.' }],
            ['ありがとうございました', 'arigatou gozaimashita', 'thank you (for what you did)', '🛍️', { note: 'Past tense: for something already done. Shop staff say it as you leave.' }],
          ] },
          { title: 'Yes, no & sorry', words: [
            ['はい', 'hai', 'yes', '✅', { note: 'Also means "I\'m listening" or "here you go".' }],
            ['いいえ', 'iie', 'no', '❌', { note: 'Quite direct. People often soften a no with ちょっと… ("well, a bit…").' }],
            ['けっこうです', 'kekkou desu', 'no thank you / that is fine', '🙅', { note: 'A polite way to decline an offer. Depending on the tone it can also mean "that is fine".', alt: ['結構です'] }],
          ] },
          { title: 'Sorry & understood', words: [
            ['すみません', 'sumimasen', 'excuse me / sorry', '🙋', { note: 'To get attention (even to call a waiter), to apologise, or as a light thank-you.' }],
            ['ごめんなさい', 'gomen nasai', 'I am sorry', '😔', { note: 'A more personal apology, for when you are really at fault.' }],
            ['わかりました', 'wakarimashita', 'understood', '✅', { note: 'Literally "I have understood". Polite: わかりません means "I don\'t understand".', alt: ['分かりました'] }],
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
        dialogues: ['d-station', 'd-taxi'],
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
        dialogues: ['d-coffee', 'd-bill'],
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
            ['ふくろ', 'fukuro', 'bag (shop bag)', '🛍️', { note: 'Shops ask ふくろ、いりますか ("do you need a bag?").', alt: ['袋'] }],
            ['いらっしゃいませ', 'irasshaimase', 'welcome (said by shop staff)', '🏪', { note: 'You hear it when you walk into a shop or restaurant. You do not need to answer.' }],
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
        id: 'numbers',
        title: 'Numbers, prices & time',
        desc: 'Count, read prices in yen and tell the time',
        facts: [FACT.society, FACT.festivals],
        dialogues: ['d-time', 'd-yen'],
        lessons: [
          { title: '1 to 3', words: [['いち', 'ichi', 'one', '1️⃣'], ['に', 'ni', 'two', '2️⃣'], ['さん', 'san', 'three', '3️⃣']] },
          { title: '4 to 6', words: [['よん', 'yon', 'four', '4️⃣', { note: 'Also し, but よん is safer — し sounds like "death".' }], ['ご', 'go', 'five', '5️⃣'], ['ろく', 'roku', 'six', '6️⃣']] },
          { title: '7 to 10', words: [['なな', 'nana', 'seven', '7️⃣', { note: 'Also しち (shichi), as in しちじ = 7 o\'clock.' }], ['はち', 'hachi', 'eight', '8️⃣'], ['きゅう', 'kyuu', 'nine', '9️⃣', { note: 'Also く (ku), as in くじ = 9 o\'clock.' }], ['じゅう', 'juu', 'ten', '🔟']] },
          { title: 'Tens', words: [
            ['じゅう', 'juu', 'ten', '🔟', { note: 'Numbers are built like Lego: 11 = じゅういち (10 + 1), 25 = にじゅうご (2 × 10 + 5).', alt: ['十'] }],
            ['にじゅう', 'nijuu', 'twenty', '🔢', { note: 'に (2) + じゅう (10). 21 is にじゅういち.', alt: ['二十'] }],
            ['さんじゅう', 'sanjuu', 'thirty', '🔢', { note: 'さん (3) + じゅう (10). 99 is きゅうじゅうきゅう (9 × 10 + 9).', alt: ['三十'] }],
            ['ごじゅう', 'gojuu', 'fifty', '🔢', { note: 'ご (5) + じゅう (10). 100 is ひゃく.', alt: ['五十'] }],
          ] },
          { title: 'Big numbers', words: [
            ['ひゃく', 'hyaku', 'hundred', '💯', { note: '500 = ごひゃく (five hundred). 300 is さんびゃく — the sound softens.', alt: ['百'] }],
            ['せん', 'sen', 'thousand', '🪙', { note: '2,000 = にせん. 3,000 is さんぜん.', alt: ['千'] }],
            ['まん', 'man', 'ten thousand', '💰', { note: 'Japanese counts in ten-thousands: 10,000 yen = いちまんえん.', alt: ['万'] }],
          ] },
          { title: 'Yen & time', words: [
            ['えん', 'en', 'yen', '💴', { note: 'After the price: ひゃくえん = 100 yen.', alt: ['円'] }],
            ['じ', 'ji', 'o\'clock', '🕒', { note: 'After the hour: さんじ = 3 o\'clock. 4 is よじ, 7 is しちじ, 9 is くじ.', alt: ['時'] }],
            ['はん', 'han', 'half past', '🕧', { note: 'After the hour: さんじはん = half past three.', alt: ['半'] }],
            ['いま', 'ima', 'now', '⌚', { alt: ['今'] }],
          ] },
          { title: 'Minutes, a.m. & p.m.', words: [
            ['ふん', 'fun', 'minute', '⏱️', { note: 'After a number: ごふん = 5 minutes. After 1, 3, 4, 6, 8 and 10 it sounds like ぷん: いっぷん, さんぷん, よんぷん, ろっぷん, はっぷん, じゅっぷん.', alt: ['分', 'ぷん'] }],
            ['ごぜん', 'gozen', 'a.m. (morning)', '🌄', { note: 'Before the hour: ごぜん しちじ = 7 a.m.', alt: ['午前'] }],
            ['ごご', 'gogo', 'p.m. (afternoon)', '🌉', { note: 'Before the hour: ごご さんじ = 3 p.m.', alt: ['午後'] }],
          ] },
          { title: 'How much? What time?', grammar: 'desu', sentences: [
            { jp: ['ごひゃく', 'えん', 'です'], romaji: 'gohyaku en desu', en: 'It is 500 yen', alt: ['It\'s 500 yen', '500 yen'] },
            { jp: ['せん', 'えん', 'です'], romaji: 'sen en desu', en: 'It is 1,000 yen', alt: ['It\'s 1000 yen', 'It is 1000 yen', '1000 yen'] },
            { jp: ['いま', 'なんじ', 'です', 'か'], romaji: 'ima nanji desu ka', en: 'What time is it now', alt: ['What time is it'] },
            { jp: ['さんじ', 'はん', 'です'], romaji: 'sanji han desu', en: 'It is half past three', alt: ['It\'s half past three', 'It is 3:30', 'It\'s 3:30'] },
          ] },
          { title: 'Counting on', sentences: [
            { jp: ['ごじゅう', 'えん', 'です'], romaji: 'gojuu en desu', en: 'It is 50 yen', alt: ['It\'s 50 yen', '50 yen'] },
            { jp: ['ひゃく', 'ごじゅう', 'えん', 'です'], romaji: 'hyaku gojuu en desu', en: 'It is 150 yen', alt: ['It\'s 150 yen', '150 yen'] },
            { jp: ['いま', 'ごご', 'さんじ', 'です'], romaji: 'ima gogo sanji desu', en: 'It is 3 p.m. now', alt: ['It\'s 3 p.m. now', 'It is 3 pm now', 'It\'s 3 pm now', 'It is 3 p.m.', 'It is 3 pm'] },
            { jp: ['ごぜん', 'しちじ', 'はん', 'です'], romaji: 'gozen shichiji han desu', en: 'It is 7:30 a.m.', alt: ['It\'s 7:30 a.m.', 'It is 7:30 am', 'It\'s 7:30 am', 'It is half past seven in the morning'] },
            { jp: ['いま', 'さんじ', 'じゅうごふん', 'です'], romaji: 'ima sanji juugofun desu', en: 'It is 3:15 now', alt: ['It\'s 3:15 now', 'It is 3:15', 'It\'s 3:15', 'It is a quarter past three'] },
          ] },
        ],
      },
      {
        id: 'hotel',
        title: 'At the hotel',
        desc: 'Check in, find your room, Wi-Fi and breakfast',
        facts: [FACT.daily, FACT.wellness],
        phrases: ['Practical Everyday Questions & Phrases'],
        dialogues: ['d-checkin', 'd-breakfast'],
        lessons: [
          { title: 'Checking in', words: [
            ['よやく', 'yoyaku', 'reservation', '📋', { alt: ['予約'] }],
            ['チェックイン', 'chekkuin', 'check-in', '🛎️', { note: 'English said the Japanese way. Check-out is チェックアウト.' }],
            ['へや', 'heya', 'room', '🚪', { alt: ['部屋'] }],
            ['パスポート', 'pasupooto', 'passport', '📕', { note: 'English said the Japanese way. You show it at check-in.' }],
            ['かぎ', 'kagi', 'key', '🔑', { alt: ['鍵'] }],
          ] },
          { title: 'Hotel life', words: [
            ['あさごはん', 'asagohan', 'breakfast', '🍳', { note: 'あさ (morning) + ごはん (meal, rice).', alt: ['朝ご飯', '朝ごはん'] }],
            ['なんじ', 'nanji', 'what time', '🕐', { alt: ['何時'] }],
            ['ワイファイ', 'waifai', 'Wi-Fi', '📶'],
            ['パスワード', 'pasuwaado', 'password', '🔐'],
            ['にもつ', 'nimotsu', 'luggage', '🧳', { alt: ['荷物'] }],
          ] },
          { title: 'At the front desk', grammar: 'subj', words: [
            ['あります', 'arimasu', 'there is / I have', '📋', { note: 'Polite "there is / have" for things (not people or animals — those use います).' }],
          ], sentences: [
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
      {
        id: 'eating-out',
        title: 'Eating out',
        desc: 'A table for two, recommendations, allergies and one more drink',
        facts: [FACT.food],
        phrases: ['Dining & Food'],
        dialogues: ['d-table', 'd-allergy'],
        lessons: [
          { title: 'Table for…', words: [
            ['ひとり', 'hitori', 'one person', '🧍', { note: 'Counting people: ひとり, ふたり, then さんにん (3)…', alt: ['一人'] }],
            ['ふたり', 'futari', 'two people', '👫', { alt: ['二人'] }],
            ['メニュー', 'menyuu', 'menu', '🗒️'],
            ['おすすめ', 'osusume', 'recommendation', '👍', { note: 'Ask for it — staff love to help.', alt: ['お勧め', 'お薦め'] }],
          ] },
          { title: 'Special requests', words: [
            ['アレルギー', 'arerugii', 'allergy', '🤧'],
            ['ベジタリアン', 'bejitarian', 'vegetarian', '🥗'],
            ['いりません', 'irimasen', 'I don\'t need it', '🙅', { note: 'A polite "no thanks" — for a bag, a straw, or meat in your dish.', alt: ['要りません'] }],
          ] },
          { title: 'Ordering', grammar: 'wa', sentences: [
            { jp: ['ふたり', 'です'], romaji: 'futari desu', en: 'Two people', alt: ['A table for two', 'We are two', 'There are two of us'] },
            { jp: ['メニュー', 'を', 'おねがいします'], romaji: 'menyuu o onegaishimasu', en: 'The menu please', alt: ['Menu please', 'Can I have the menu'] },
            { jp: ['おすすめ', 'は', 'なん', 'です', 'か'], romaji: 'osusume wa nan desu ka', en: 'What do you recommend', alt: ['What is your recommendation', 'What is recommended'] },
            { jp: ['もう', 'いっぱい', 'ください'], romaji: 'mou ippai kudasai', en: 'One more please', alt: ['Another one please', 'One more glass please'] },
          ] },
          { title: 'Allergies', sentences: [
            { jp: ['わたし', 'は', 'ベジタリアン', 'です'], romaji: 'watashi wa bejitarian desu', en: 'I am vegetarian', alt: ['I\'m vegetarian', 'I am a vegetarian'] },
            { jp: ['たまご', 'アレルギー', 'が', 'あります'], romaji: 'tamago arerugii ga arimasu', en: 'I have an egg allergy', alt: ['I am allergic to eggs', 'I\'m allergic to eggs'] },
            { jp: ['にく', 'は', 'いりません'], romaji: 'niku wa irimasen', en: 'No meat please', alt: ['I don\'t need meat', 'No meat'] },
          ] },
        ],
      },
      {
        id: 'trains',
        title: 'Trains & taxis',
        desc: 'Platforms, changing trains, the next stop and taxis',
        facts: [FACT.transport],
        phrases: ['Getting Around & Transit'],
        dialogues: ['d-platform', 'd-transfer'],
        lessons: [
          { title: 'On the platform', words: [
            ['ホーム', 'hoomu', 'platform', '🚉', { note: 'From the English "platform" — Japanese uses only the end.' }],
            ['なんばんせん', 'nanbansen', 'which platform', '🔢', { note: 'Platforms are numbered: 3ばんせん = platform 3.', alt: ['何番線'] }],
            ['つぎ', 'tsugi', 'next', '⏭️', { alt: ['次'] }],
            ['のりかえ', 'norikae', 'transfer (change trains)', '🔄', { alt: ['乗り換え'] }],
          ] },
          { title: 'Going places', words: [
            ['いきます', 'ikimasu', 'go / goes (polite)', '➡️', { note: 'The polite form of "to go".', alt: ['行きます'] }],
            ['きます', 'kimasu', 'come / comes (polite)', '🫵', { note: 'いきます goes away from here, きます comes toward you.', alt: ['来ます'] }],
            ['まで', 'made', 'to / until', '🏁', { note: 'After a place: ホテル まで = to the hotel.' }],
            ['きょうと', 'kyouto', 'Kyoto', '⛩️', { alt: ['京都'] }],
          ] },
          { title: 'Which train?', grammar: 'ka', sentences: [
            { jp: ['これ', 'は', 'きょうと', 'に', 'いきます', 'か'], romaji: 'kore wa kyouto ni ikimasu ka', en: 'Does this go to Kyoto', alt: ['Does this train go to Kyoto', 'Is this going to Kyoto'] },
            { jp: ['なんばんせん', 'です', 'か'], romaji: 'nanbansen desu ka', en: 'Which platform is it', alt: ['Which platform', 'What platform is it'] },
            { jp: ['つぎ', 'は', 'きょうと', 'です'], romaji: 'tsugi wa kyouto desu', en: 'The next stop is Kyoto', alt: ['Next is Kyoto', 'The next station is Kyoto'] },
          ] },
          { title: 'Transfers & taxis', sentences: [
            { jp: ['のりかえ', 'は', 'どこ', 'です', 'か'], romaji: 'norikae wa doko desu ka', en: 'Where do I change trains', alt: ['Where is the transfer', 'Where do I transfer'] },
            { jp: ['えき', 'まで', 'おねがいします'], romaji: 'eki made onegaishimasu', en: 'To the station please', alt: ['Take me to the station please'] },
            { jp: ['ホテル', 'まで', 'おねがいします'], romaji: 'hoteru made onegaishimasu', en: 'To the hotel please', alt: ['Take me to the hotel please'] },
          ] },
        ],
      },
      {
        id: 'help',
        title: 'Help & health',
        desc: 'Pharmacy, doctor, police and "I\'m lost"',
        facts: [FACT.daily, FACT.wellness],
        phrases: ['Important Locations & Emergency'],
        dialogues: ['d-pharmacy', 'd-doctor'],
        lessons: [
          { title: 'Feeling ill', words: [
            ['いたい', 'itai', 'it hurts', '🤕', { alt: ['痛い'] }],
            ['くすり', 'kusuri', 'medicine', '💊', { alt: ['薬'] }],
            ['やっきょく', 'yakkyoku', 'pharmacy', '⚕️', { note: 'The word on the sign (薬局). Drugstore chains are called ドラッグストア.', alt: ['薬局'] }],
            ['びょういん', 'byouin', 'hospital', '🏥', { alt: ['病院'] }],
          ] },
          { title: 'Getting help', words: [
            ['いしゃ', 'isha', 'doctor', '🧑‍⚕️', { alt: ['医者'] }],
            ['きゅうきゅうしゃ', 'kyuukyuusha', 'ambulance', '🚑', { note: 'Emergency number in Japan: 119 for ambulance and fire, 110 for police.', alt: ['救急車'] }],
            ['けいさつ', 'keisatsu', 'police', '👮', { alt: ['警察'] }],
            ['こうばん', 'kouban', 'police box', '🚓', { note: 'Small police posts on street corners — great for directions and lost things.', alt: ['交番'] }],
          ] },
          { title: 'Lost', words: [
            ['みち', 'michi', 'road / way', '🛣️', { alt: ['道'] }],
            ['ここ', 'koko', 'here', '📍'],
            ['まよいました', 'mayoimashita', 'I got lost', '🗺️', { note: 'Past tense of まよいます (to lose your way): みち に まよいました.', alt: ['迷いました'] }],
          ] },
          { title: 'Call for help', grammar: 'subj', sentences: [
            { jp: ['ここ', 'が', 'いたい', 'です'], romaji: 'koko ga itai desu', en: 'It hurts here', alt: ['Here hurts', 'It hurts right here'] },
            { jp: ['いしゃ', 'を', 'よんで', 'ください'], romaji: 'isha o yonde kudasai', en: 'Please call a doctor', alt: ['Call a doctor please'] },
            { jp: ['きゅうきゅうしゃ', 'を', 'よんで', 'ください'], romaji: 'kyuukyuusha o yonde kudasai', en: 'Please call an ambulance', alt: ['Call an ambulance please'] },
          ] },
          { title: 'Finding help', sentences: [
            { jp: ['みち', 'に', 'まよいました'], romaji: 'michi ni mayoimashita', en: 'I am lost', alt: ['I\'m lost', 'I got lost', 'I lost my way'] },
            { jp: ['やっきょく', 'は', 'どこ', 'です', 'か'], romaji: 'yakkyoku wa doko desu ka', en: 'Where is the pharmacy', alt: ['Where is a pharmacy', 'Where\'s the pharmacy'] },
            { jp: ['びょういん', 'は', 'どこ', 'です', 'か'], romaji: 'byouin wa doko desu ka', en: 'Where is the hospital', alt: ['Where is a hospital', 'Where\'s the hospital'] },
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
        id: 'people',
        title: 'People & jobs',
        desc: 'Introduce yourself and say what you do',
        facts: [FACT.society],
        dialogues: ['d-meet', 'd-friend'],
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
          { title: 'He, she, we', words: [
            ['かれ', 'kare', 'he / boyfriend', '🧍', { note: 'Also "boyfriend". Japanese often uses the name + さん instead of "he".', alt: ['彼'] }],
            ['かのじょ', 'kanojo', 'she / girlfriend', '🧍', { note: 'Also "girlfriend". Like かれ, it is used less than "she" in English.', alt: ['彼女'] }],
            ['わたしたち', 'watashitachi', 'we / us', '🧑‍🤝‍🧑', { note: 'たち makes a group: わたし → わたしたち. "They" is かれら.', alt: ['私たち', '私達'] }],
            ['みなさん', 'minasan', 'everyone / all of you', '👫', { note: 'The polite way to address a group: みなさん、こんにちは！', alt: ['皆さん'] }],
          ] },
          { title: 'This, that, over there', words: [
            ['それ', 'sore', 'that (near you)', '👉', { note: 'Three distances: これ (near me), それ (near you), あれ (far from both).' }],
            ['あれ', 'are', 'that (over there)', '🗼', { note: 'Far from both of you: あれ は えき です = that over there is the station.' }],
            ['そこ', 'soko', 'there (near you)', '📍', { note: 'ここ (here), そこ (there), あそこ (over there).' }],
            ['あそこ', 'asoko', 'over there', '🏯', { note: 'Pointing far away: あそこ に トイレ が あります.' }],
          ] },
          { title: 'Who is who?', sentences: [
            { jp: ['かれ', 'は', 'せんせい', 'です'], romaji: 'kare wa sensei desu', en: 'He is a teacher', alt: ['He\'s a teacher', 'My boyfriend is a teacher'] },
            { jp: ['かのじょ', 'は', 'いしゃ', 'です'], romaji: 'kanojo wa isha desu', en: 'She is a doctor', alt: ['She\'s a doctor', 'My girlfriend is a doctor'] },
            { jp: ['わたしたち', 'は', 'がくせい', 'です'], romaji: 'watashitachi wa gakusei desu', en: 'We are students', alt: ['We\'re students'] },
            { jp: ['あれ', 'は', 'えき', 'です'], romaji: 'are wa eki desu', en: 'That over there is the station', alt: ['That is the station', 'That\'s the station', 'Over there is the station'] },
          ] },
        ],
      },
      {
        id: 'meals',
        title: 'Food words',
        desc: 'What you eat, and what you like',
        facts: [FACT.food],
        dialogues: ['d-lunch', 'd-like'],
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
        id: 'verbs',
        title: 'Verbs: do and don\'t',
        desc: 'Say what you eat, drink and buy — and what you don\'t or did',
        facts: [FACT.society, FACT.food],
        dialogues: ['d-drinks', 'd-yesterday'],
        lessons: [
          { title: 'Eat, drink, buy', words: [
            ['たべます', 'tabemasu', 'eat / will eat (polite)', '🍽️', { note: 'The polite form of たべる. The same form means "I eat" and "I will eat".', alt: ['食べます'] }],
            ['のみます', 'nomimasu', 'drink / will drink (polite)', '🥤', { note: 'Used for any drink — and even for soup and medicine!', alt: ['飲みます'] }],
            ['かいます', 'kaimasu', 'buy / will buy (polite)', '🛍️', { alt: ['買います'] }],
            ['みます', 'mimasu', 'see / watch (polite)', '📺', { note: 'Also "look at": ほん を みます.', alt: ['見ます'] }],
          ] },
          { title: 'Talk and understand', words: [
            ['はなします', 'hanashimasu', 'speak / talk (polite)', '🗣️', { note: 'えいご を はなします = I speak English. "Can speak" is はなせます.', alt: ['話します'] }],
            ['わかります', 'wakarimasu', 'understand (polite)', '✅', { note: 'The opposite is わかりません; "I understood" is わかりました.', alt: ['分かります'] }],
            ['します', 'shimasu', 'do (polite)', '🎯', { note: 'The most flexible verb. Add it to a noun to make an action: しゅくだい します = do homework.' }],
          ] },
          { title: 'There is, I want', words: [
            ['あります', 'arimasu', 'there is / I have', '📋', { note: 'Polite "there is / have" for things (not people or animals — those use います).' }],
            ['います', 'imasu', 'there is (a person / animal)', '🧍', { note: 'For living things: ともだち が います = I have a friend.', alt: ['居ます'] }],
            ['ほしい', 'hoshii', 'want (a thing)', '🙏', { note: 'みず が ほしい です = I want water. For wanting to do something, the ending is たい (たべたい).', alt: ['欲しい'] }],
          ] },
          { title: 'I eat, I drink', grammar: 'masu', sentences: [
            { jp: ['すし', 'を', 'たべます'], romaji: 'sushi o tabemasu', en: 'I eat sushi', alt: ['I will eat sushi', 'I\'ll eat sushi', 'I am eating sushi', 'I\'m eating sushi'] },
            { jp: ['おちゃ', 'を', 'のみます'], romaji: 'ocha o nomimasu', en: 'I drink tea', alt: ['I will drink tea', 'I\'ll drink tea', 'I drink green tea', 'I will drink green tea'] },
            { jp: ['ほん', 'を', 'かいます'], romaji: 'hon o kaimasu', en: 'I buy a book', alt: ['I will buy a book', 'I\'ll buy a book', 'I am buying a book'] },
            { jp: ['えいご', 'を', 'はなします'], romaji: 'eigo o hanashimasu', en: 'I speak English', alt: ['I will speak English', 'I\'ll speak English'] },
          ] },
          { title: 'I don\'t…', grammar: 'masen', sentences: [
            { jp: ['にく', 'を', 'たべません'], romaji: 'niku o tabemasen', en: 'I do not eat meat', alt: ['I don\'t eat meat', 'I will not eat meat', 'I won\'t eat meat'] },
            { jp: ['ビール', 'を', 'のみません'], romaji: 'biiru o nomimasen', en: 'I do not drink beer', alt: ['I don\'t drink beer', 'I will not drink beer', 'I won\'t drink beer'] },
            { jp: ['さかな', 'を', 'たべません'], romaji: 'sakana o tabemasen', en: 'I do not eat fish', alt: ['I don\'t eat fish', 'I will not eat fish', 'I won\'t eat fish'] },
            { jp: ['これ', 'は', 'わかりません'], romaji: 'kore wa wakarimasen', en: 'I do not understand this', alt: ['I don\'t understand this', 'I do not understand it', 'I don\'t understand it'] },
          ] },
          { title: 'Yesterday', grammar: 'mashita', words: [
            ['きのう', 'kinou', 'yesterday', '🌙', { note: 'No particle needed: きのう ラーメン を たべました.', alt: ['昨日'] }],
          ], sentences: [
            { jp: ['きのう', 'ラーメン', 'を', 'たべました'], romaji: 'kinou raamen o tabemashita', en: 'I ate ramen yesterday', alt: ['Yesterday I ate ramen', 'I had ramen yesterday', 'Yesterday I had ramen'] },
            { jp: ['きのう', 'ビール', 'を', 'のみました'], romaji: 'kinou biiru o nomimashita', en: 'I drank beer yesterday', alt: ['Yesterday I drank beer', 'I had beer yesterday'] },
            { jp: ['きのう', 'にく', 'を', 'たべません', 'でした'], romaji: 'kinou niku o tabemasen deshita', en: 'I did not eat meat yesterday', alt: ['I didn\'t eat meat yesterday', 'Yesterday I did not eat meat', 'Yesterday I didn\'t eat meat'] },
            { jp: ['きのう', 'ほん', 'を', 'かいません', 'でした'], romaji: 'kinou hon o kaimasen deshita', en: 'I did not buy a book yesterday', alt: ['I didn\'t buy a book yesterday', 'Yesterday I did not buy a book', 'Yesterday I didn\'t buy a book'] },
          ] },
          { title: 'I want, I have', sentences: [
            { jp: ['みず', 'が', 'ほしい', 'です'], romaji: 'mizu ga hoshii desu', en: 'I want water', alt: ['I would like water', 'I\'d like water'] },
            { jp: ['ともだち', 'が', 'います'], romaji: 'tomodachi ga imasu', en: 'I have a friend', alt: ['There is a friend', 'I have friends', 'A friend is here'] },
            { jp: ['ワイファイ', 'が', 'あります'], romaji: 'waifai ga arimasu', en: 'There is Wi-Fi', alt: ['There\'s Wi-Fi', 'There is wifi', 'We have Wi-Fi', 'It has Wi-Fi'] },
            { jp: ['ねこ', 'が', 'います'], romaji: 'neko ga imasu', en: 'There is a cat', alt: ['There\'s a cat', 'I have a cat', 'We have a cat'] },
          ] },
          { title: 'It is not…', grammar: 'janai', words: [
            ['じゃない', 'janai', 'is not (add です to be polite)', '❌', { note: 'せんせい じゃない です = "is not a teacher". Also written じゃありません.' }],
            ['ちがいます', 'chigaimasu', 'that is wrong / no', '🙅', { note: 'A soft "no, that is not right": polite correction of a mistake.', alt: ['違います'] }],
          ], sentences: [
            { jp: ['わたし', 'は', 'せんせい', 'じゃない', 'です'], romaji: 'watashi wa sensei janai desu', en: 'I am not a teacher', alt: ['I\'m not a teacher'] },
            { jp: ['これ', 'は', 'ビール', 'じゃない', 'です'], romaji: 'kore wa biiru janai desu', en: 'This is not beer', alt: ['This isn\'t beer', 'It is not beer', 'It\'s not beer'] },
            { jp: ['ここ', 'は', 'えき', 'じゃない', 'です'], romaji: 'koko wa eki janai desu', en: 'This is not the station', alt: ['Here is not the station', 'This isn\'t the station', 'Here isn\'t the station'] },
          ] },
        ],
      },
      {
        id: 'calendar',
        title: 'Days, dates & time',
        desc: 'Days of the week, months and dates — and "on Monday" and "at seven"',
        facts: [FACT.festivals, FACT.society],
        dialogues: ['d-day', 'd-date'],
        lessons: [
          { title: 'Today and tomorrow', words: [
            ['きょう', 'kyou', 'today', '☀️', { alt: ['今日'] }],
            ['あした', 'ashita', 'tomorrow', '🌅', { alt: ['明日'] }],
            ['きのう', 'kinou', 'yesterday', '🌙', { note: 'No particle needed: きのう ラーメン を たべました.', alt: ['昨日'] }],
            ['まいにち', 'mainichi', 'every day', '🔁', { alt: ['毎日'] }],
          ] },
          { title: 'Monday to Thursday', words: [
            ['げつようび', 'getsuyoubi', 'Monday', '🌙', { note: 'Days are named after the moon, fire, water, wood, gold, earth and sun — and end in ようび.', alt: ['月曜日'] }],
            ['かようび', 'kayoubi', 'Tuesday', '🔥', { note: 'か = fire.', alt: ['火曜日'] }],
            ['すいようび', 'suiyoubi', 'Wednesday', '💧', { note: 'すい = water.', alt: ['水曜日'] }],
            ['もくようび', 'mokuyoubi', 'Thursday', '🌳', { note: 'もく = wood.', alt: ['木曜日'] }],
          ] },
          { title: 'Friday to Sunday', words: [
            ['きんようび', 'kinyoubi', 'Friday', '💰', { note: 'きん = gold (money).', alt: ['金曜日'] }],
            ['どようび', 'doyoubi', 'Saturday', '🪨', { note: 'ど = earth.', alt: ['土曜日'] }],
            ['にちようび', 'nichiyoubi', 'Sunday', '☀️', { note: 'にち = sun.', alt: ['日曜日'] }],
            ['なんようび', 'nanyoubi', 'which day of the week', '❓', { note: 'なん + ようび: きょう は なんようび です か.', alt: ['何曜日'] }],
          ] },
          { title: 'Months', words: [
            ['しがつ', 'shigatsu', 'April', '🌸', { note: 'Month = number + がつ: いちがつ (January), にがつ, さんがつ… but April is しがつ, not よんがつ.', alt: ['四月'] }],
            ['しちがつ', 'shichigatsu', 'July', '🌊', { note: 'July is しちがつ (not なながつ). The other irregular one is くがつ.', alt: ['七月'] }],
            ['くがつ', 'kugatsu', 'September', '🍃', { note: 'く, not きゅう: くがつ.', alt: ['九月'] }],
            ['じゅうにがつ', 'juunigatsu', 'December', '❄️', { note: 'じゅう (10) + に (2) + がつ. November is じゅういちがつ.', alt: ['十二月'] }],
            ['なんがつ', 'nangatsu', 'which month', '❓', { alt: ['何月'] }],
          ] },
          { title: 'Dates', words: [
            ['にち', 'nichi', 'day of the month', '📅', { note: 'Number + にち: じゅうごにち = the 15th. The first days are special: ついたち, ふつか…', alt: ['日'] }],
            ['ついたち', 'tsuitachi', 'the 1st', '1️⃣', { alt: ['一日', '1日'] }],
            ['ふつか', 'futsuka', 'the 2nd', '2️⃣', { note: 'Also "two days".', alt: ['二日', '2日'] }],
            ['はつか', 'hatsuka', 'the 20th', '🔢', { note: 'The 20th is special too. 21st is にじゅういちにち.', alt: ['二十日', '20日'] }],
            ['なんにち', 'nannichi', 'what date', '❓', { alt: ['何日'] }],
          ] },
          { title: 'On Monday, at seven', grammar: 'time', sentences: [
            { jp: ['げつようび', 'に', 'いきます'], romaji: 'getsuyoubi ni ikimasu', en: 'I go on Monday', alt: ['I will go on Monday', 'I\'ll go on Monday', 'I am going on Monday', 'I\'m going on Monday'] },
            { jp: ['ごぜん', 'しちじ', 'はん', 'に', 'たべます'], romaji: 'gozen shichiji han ni tabemasu', en: 'I eat at 7:30 a.m.', alt: ['I eat at 7:30 am', 'I will eat at 7:30 a.m.', 'I eat at half past seven in the morning'] },
            { jp: ['あした', 'ごご', 'さんじ', 'に', 'きます'], romaji: 'ashita gogo sanji ni kimasu', en: 'I will come at 3 p.m. tomorrow', alt: ['I\'ll come at 3 p.m. tomorrow', 'I will come at 3 pm tomorrow', 'Tomorrow I will come at 3 p.m.', 'I am coming at 3 pm tomorrow'] },
            { jp: ['まいにち', 'しちじ', 'に', 'たべます'], romaji: 'mainichi shichiji ni tabemasu', en: 'I eat at seven every day', alt: ['Every day I eat at seven', 'I eat at 7 every day', 'I eat at 7 o\'clock every day'] },
          ] },
          { title: 'Which day? What date?', sentences: [
            { jp: ['きょう', 'は', 'なんようび', 'です', 'か'], romaji: 'kyou wa nanyoubi desu ka', en: 'What day is it today', alt: ['What day of the week is it today', 'What day is today'] },
            { jp: ['あした', 'は', 'かようび', 'です'], romaji: 'ashita wa kayoubi desu', en: 'Tomorrow is Tuesday', alt: ['It is Tuesday tomorrow'] },
            { jp: ['きょう', 'は', 'なんがつ', 'なんにち', 'です', 'か'], romaji: 'kyou wa nangatsu nannichi desu ka', en: 'What is the date today', alt: ['What date is it today', 'What is today\'s date', 'What month and day is it today'] },
            { jp: ['しがつ', 'ついたち', 'です'], romaji: 'shigatsu tsuitachi desu', en: 'It is April 1st', alt: ['It\'s April 1st', 'April 1st', 'It is the 1st of April'] },
          ] },
        ],
      },
      {
        id: 'asking',
        title: 'Asking questions',
        desc: 'Who, what, when, why, which and how',
        facts: [FACT.society],
        dialogues: ['d-who', 'd-why'],
        lessons: [
          { title: 'Who? What? When?', words: [
            ['だれ', 'dare', 'who', '🧑', { note: 'Polite: どなた. だれ の ほん = whose book.', alt: ['誰'] }],
            ['なに', 'nani', 'what', '❔', { note: 'Before です or の it shortens to なん: なん です か.', alt: ['何'] }],
            ['いつ', 'itsu', 'when', '⌚', { note: 'No particle: いつ いきます か = when do you go?' }],
          ] },
          { title: 'Why? Which? How?', words: [
            ['どうして', 'doushite', 'why', '❓', { note: 'どうして です か = why is that? Answer with から (because).' }],
            ['どれ', 'dore', 'which one (of three or more)', '👉', { note: 'Same family as どこ (where): これ, それ, あれ, どれ.' }],
            ['どう', 'dou', 'how', '🤷', { note: 'ラーメン は どう です か = how is the ramen?' }],
          ] },
          { title: 'Ask away', grammar: 'qwords', sentences: [
            { jp: ['なに', 'を', 'たべます', 'か'], romaji: 'nani o tabemasu ka', en: 'What do you eat', alt: ['What will you eat', 'What are you eating', 'What will you have'] },
            { jp: ['だれ', 'が', 'きます', 'か'], romaji: 'dare ga kimasu ka', en: 'Who is coming', alt: ['Who will come', 'Who comes'] },
            { jp: ['いつ', 'きょうと', 'に', 'いきます', 'か'], romaji: 'itsu kyouto ni ikimasu ka', en: 'When do you go to Kyoto', alt: ['When will you go to Kyoto', 'When are you going to Kyoto'] },
          ] },
          { title: 'More questions', sentences: [
            { jp: ['どれ', 'が', 'おいしい', 'です', 'か'], romaji: 'dore ga oishii desu ka', en: 'Which one is delicious', alt: ['Which one is good', 'Which is delicious'] },
            { jp: ['どうして', 'です', 'か'], romaji: 'doushite desu ka', en: 'Why is that', alt: ['Why', 'Why is it', 'Why is it so'] },
            { jp: ['ラーメン', 'は', 'どう', 'です', 'か'], romaji: 'raamen wa dou desu ka', en: 'How is the ramen', alt: ['How is ramen', 'How about the ramen'] },
          ] },
        ],
      },
      {
        id: 'world',
        title: 'Around you',
        desc: 'Animals, nature and things',
        facts: [FACT.nature],
        dialogues: ['d-pets', 'd-sea'],
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
// Newer dialogues use dlg(): lines are [who, jp, en], and `questions` holds one or more
// { question, options } (first option is the right one); the first also stays in `question`/`options`.
const Q = (question, ...options) => ({ question, options });
const dlg = (title, cast, lines, ...questions) => ({
  title, cast, lines: lines.map(([who, jp, en]) => ({ who, jp, en })), question: questions[0].question, options: questions[0].options, questions,
});

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
    question: 'Can she pay by card?',
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
  'd-morning': dlg('Good morning', ['woman', 'woman2'], [
    [0, 'おはようございます！', 'Good morning!'],
    [1, 'おはようございます。おげんきですか。', 'Good morning. How are you?'],
    [0, 'はい、げんきです。ありがとうございます。', 'I am well, thank you.'],
  ], Q('How is she?', 'She is well', 'She is sick', 'She is lost'), Q('What time of day is it?', 'Morning', 'Evening', 'Night')),
  'd-farewell': dlg('Saying goodbye', ['woman2', 'woman'], [
    [0, 'ありがとうございました。', 'Thank you very much.'],
    [1, 'いいえ。またね！', 'Not at all. See you!'],
    [0, 'はい、またね。おやすみなさい。', 'Yes, see you. Good night.'],
  ], Q('What do they say at the end?', 'See you, good night', 'Nice to meet you', 'Excuse me, sorry'), Q('Who says thank you first?', 'The first speaker', 'The second speaker', 'Nobody')),
  'd-taxi': dlg('In a taxi', ['woman', 'woman2'], [
    [0, 'ホテルまでおねがいします。', 'To the hotel please.'],
    [1, 'わかりました。', 'Understood.'],
    [1, 'ここですか。', 'Is it here?'],
    [0, 'はい、ありがとうございます。', 'Yes, thank you.'],
  ], Q('Where does she want to go?', 'To the hotel', 'To the station', 'To the sea'), Q('Do they arrive?', 'Yes, it is the right place', 'No, they are lost', 'She gets out at the station')),
  'd-bill': dlg('The bill', ['woman2', 'woman'], [
    [0, 'おかいけいをおねがいします。', 'The bill please.'],
    [1, 'カードですか、げんきんですか。', 'Card or cash?'],
    [0, 'カードでおねがいします。', 'By card please.'],
    [1, 'ありがとうございました。', 'Thank you very much.'],
  ], Q('How does she pay?', 'By card', 'In cash', 'She does not pay'), Q('Where are they?', 'In a restaurant', 'At a station', 'At a hotel')),
  'd-time': dlg('What time is it?', ['woman', 'woman2'], [
    [0, 'すみません、いまなんじですか。', 'Excuse me, what time is it now?'],
    [1, 'さんじはんです。', 'It is half past three.'],
    [0, 'ありがとうございます。', 'Thank you.'],
  ], Q('What time is it?', '3:30', '3:00', '7:30'), Q('What does the first speaker want to know?', 'The time', 'The price', 'The way to the station')),
  'd-yen': dlg('Is it 500 yen?', ['woman2', 'woman'], [
    [0, 'これはごひゃくえんですか。', 'Is this 500 yen?'],
    [1, 'いいえ、ひゃくごじゅうえんです。', 'No, it is 150 yen.'],
    [0, 'わかりました。これをください。', 'I see. This please.'],
  ], Q('How much is it really?', '150 yen', '500 yen', '50 yen'), Q('What does she do in the end?', 'She buys it', 'She leaves', 'She asks for the bill')),
  'd-checkin': dlg('Checking in', ['woman', 'woman2'], [
    [0, 'チェックインをおねがいします。', 'Check-in please.'],
    [1, 'パスポートをおねがいします。', 'Your passport please.'],
    [0, 'はい、どうぞ。よやくがあります。', 'Here you are. I have a reservation.'],
  ], Q('What does the clerk ask for?', 'The passport', 'The key', 'The card'), Q('What does the guest have?', 'A reservation', 'A ticket', 'An allergy')),
  'd-breakfast': dlg('Breakfast time', ['woman2', 'woman'], [
    [0, 'あさごはんはなんじですか。', 'What time is breakfast?'],
    [1, 'ごぜんしちじはんです。', 'It is 7:30 a.m.'],
    [0, 'ありがとうございます。', 'Thank you.'],
  ], Q('When is breakfast?', 'At 7:30 in the morning', 'At 7:30 in the evening', 'At 3:30'), Q('What is she asking about?', 'Breakfast', 'The Wi-Fi', 'Her room')),
  'd-table': dlg('A table for two', ['woman', 'woman2'], [
    [0, 'ふたりです。', 'Two people.'],
    [1, 'どうぞ。', 'This way please.'],
    [0, 'メニューをおねがいします。', 'The menu please.'],
  ], Q('How many are they?', 'Two', 'One', 'Three'), Q('What does she ask for?', 'The menu', 'The bill', 'A taxi')),
  'd-allergy': dlg('An allergy', ['woman2', 'woman'], [
    [0, 'たまごアレルギーがあります。', 'I have an egg allergy.'],
    [1, 'わかりました。たまごはいりませんね。', 'Understood. No eggs, right?'],
    [0, 'はい、だいじょうぶです。ありがとうございます。', 'Yes, that is fine. Thank you.'],
  ], Q('What is she allergic to?', 'Eggs', 'Fish', 'Meat'), Q('How does she feel at the end?', 'It is okay now', 'Angry', 'Confused')),
  'd-platform': dlg('Which platform?', ['woman', 'woman2'], [
    [0, 'すみません、きょうとはなんばんせんですか。', 'Excuse me, which platform is Kyoto?'],
    [1, 'さんばんせんです。', 'Platform 3.'],
    [0, 'ありがとうございます。', 'Thank you.'],
  ], Q('Which platform?', 'Platform 3', 'Platform 1', 'Platform 5'), Q('Where does she want to go?', 'Kyoto', 'The hotel', 'The sea')),
  'd-transfer': dlg('Changing trains', ['woman2', 'woman'], [
    [0, 'のりかえはどこですか。', 'Where do I change trains?'],
    [1, 'つぎのえきです。', 'At the next station.'],
    [0, 'わかりました。', 'Understood.'],
  ], Q('Where does she change?', 'At the next station', 'Right here', 'At the hotel'), Q('What is she asking about?', 'Transferring', 'The price', 'A taxi')),
  'd-pharmacy': dlg('Looking for a pharmacy', ['woman', 'woman2'], [
    [0, 'すみません、やっきょくはどこですか。', 'Excuse me, where is the pharmacy?'],
    [1, 'まっすぐです。みぎです。', 'Straight ahead. On the right.'],
    [0, 'ありがとうございます！', 'Thank you!'],
  ], Q('Where is the pharmacy?', 'Straight ahead, on the right', 'On the left', 'At the station'), Q('What does she need?', 'A pharmacy', 'A hotel', 'A taxi')),
  'd-doctor': dlg('At the clinic', ['woman2', 'woman'], [
    [0, 'ここがいたいです。', 'It hurts here.'],
    [1, 'だいじょうぶですか。いしゃをよびます。', 'Are you okay? I will call a doctor.'],
    [0, 'おねがいします。', 'Please do.'],
  ], Q('What will the second speaker do?', 'Call a doctor', 'Call a taxi', 'Bring tea'), Q('What is wrong?', 'Something hurts', 'She lost her key', 'She is hungry')),
  'd-friend': dlg('My friend', ['woman2', 'woman'], [
    [0, 'こちらはともだちです。かれはせんせいです。', 'This is my friend. He is a teacher.'],
    [1, 'はじめまして。', 'Nice to meet you.'],
    [0, 'わたしたちはがくせいです。', 'We are students.'],
  ], Q('What is the friend\'s job?', 'Teacher', 'Doctor', 'Chef'), Q('What are the speakers?', 'Students', 'Doctors', 'Engineers')),
  'd-lunch': dlg('Lunch', ['woman', 'woman2'], [
    [0, 'いただきます！', 'Let\'s eat!'],
    [1, 'ごはんとさかなです。', 'It is rice and fish.'],
    [0, 'とてもおいしいです。', 'It is very good.'],
  ], Q('What are they eating?', 'Rice and fish', 'Ramen', 'Sushi and beer'), Q('What does she think of it?', 'It is very good', 'It is too spicy', 'It is cold')),
  'd-like': dlg('Do you like fish?', ['woman2', 'woman'], [
    [0, 'さかながすきですか。', 'Do you like fish?'],
    [1, 'はい、すきです。にくはたべません。', 'Yes, I do. I do not eat meat.'],
    [0, 'わかりました。', 'Understood.'],
  ], Q('What does she not eat?', 'Meat', 'Fish', 'Vegetables'), Q('Does she like fish?', 'Yes', 'No', 'She does not know')),
  'd-drinks': dlg('Drinks', ['woman', 'woman2'], [
    [0, 'ビールをのみますか。', 'Do you drink beer?'],
    [1, 'いいえ、のみません。おちゃをのみます。', 'No, I don\'t. I drink tea.'],
    [0, 'じゃあ、おちゃをください。', 'Then, tea please.'],
  ], Q('What does the second speaker drink?', 'Tea', 'Beer', 'Water'), Q('Does she drink beer?', 'No', 'Yes', 'Only on Fridays')),
  'd-yesterday': dlg('Yesterday', ['woman2', 'woman'], [
    [0, 'きのうラーメンをたべました。', 'I ate ramen yesterday.'],
    [1, 'いいですね！わたしはたべませんでした。', 'Nice! I did not.'],
    [0, 'きょうたべますか。', 'Will you eat it today?'],
  ], Q('What did the first speaker eat yesterday?', 'Ramen', 'Sushi', 'Nothing'), Q('Did the second speaker eat ramen yesterday?', 'No', 'Yes', 'She ate two bowls')),
  'd-day': dlg('What day is it?', ['woman', 'woman2'], [
    [0, 'きょうはなんようびですか。', 'What day is it today?'],
    [1, 'きんようびです。', 'It is Friday.'],
    [0, 'じゃあ、あしたはどようびですね。', 'Then tomorrow is Saturday.'],
  ], Q('What day is it today?', 'Friday', 'Monday', 'Sunday'), Q('What day is tomorrow?', 'Saturday', 'Sunday', 'Thursday')),
  'd-date': dlg('A date', ['woman2', 'woman'], [
    [0, 'きょうはなんがつなんにちですか。', 'What is the date today?'],
    [1, 'しがつふつかです。', 'It is April 2nd.'],
    [0, 'ありがとうございます。', 'Thank you.'],
  ], Q('What is the date?', 'April 2nd', 'April 1st', 'July 2nd'), Q('What month is it?', 'April', 'July', 'September')),
  'd-who': dlg('Who is that?', ['woman', 'woman2'], [
    [0, 'あれはだれですか。', 'Who is that over there?'],
    [1, 'かのじょはせんせいです。', 'She is a teacher.'],
    [0, 'そうですか。', 'I see.'],
  ], Q('Who is that person?', 'A teacher', 'A doctor', 'A student'), Q('What does the first speaker ask?', 'Who someone is', 'What time it is', 'Where the station is')),
  'd-why': dlg('Why the station?', ['woman2', 'woman'], [
    [0, 'どうしてえきにいきますか。', 'Why are you going to the station?'],
    [1, 'ともだちがきます。', 'A friend is coming.'],
    [0, 'いつきますか。', 'When is she coming?'],
    [1, 'ごごさんじにきます。', 'At 3 p.m.'],
  ], Q('Why is she going to the station?', 'A friend is coming', 'She is buying a ticket', 'She is lost'), Q('When does the friend come?', 'At 3 p.m.', 'At 3 a.m.', 'At 7:30')),
  'd-pets': dlg('Pets', ['woman', 'woman2'], [
    [0, 'ねこがいますか。', 'Do you have a cat?'],
    [1, 'はい、ねこといぬがいます。', 'Yes, I have a cat and a dog.'],
    [0, 'いいですね！', 'Lovely!'],
  ], Q('What pets does she have?', 'A cat and a dog', 'A bird', 'A cat only'), Q('What does the first speaker ask?', 'If she has a cat', 'If she likes fish', 'If she has a car')),
  'd-sea': dlg('A day out', ['woman2', 'woman'], [
    [0, 'うみはきれいです。', 'The sea is beautiful.'],
    [1, 'はい、とてもきれいです。くるまでいきますか。', 'Yes, very. Shall we go by car?'],
    [0, 'いいえ、でんしゃでいきます。', 'No, we go by train.'],
  ], Q('How do they go?', 'By train', 'By car', 'By taxi'), Q('What is pretty?', 'The sea', 'The mountain', 'The sky')),
};
