// The Mandarin course: themed units of essential words and sentences, same format as the
// Japanese course (../units.js). Simplified characters, standard mainland usage.
// The field named `jp` holds the Chinese characters; the field named `romaji` holds pinyin
// with tone marks (one syllable per character; 不 and 一 written as spoken: bú yào, yì bēi).
//
// Word: [hanzi, pinyin, english, art (emoji drawn in the cartoon art set), extras?]
//   extras: { note: when / how it is used, alt: [other spellings speech recognition may return] }
// Sentence: { jp: [chunks], romaji (one pinyin word per chunk), en, alt?: [other accepted translations] }
// Lesson: { title, words?, sentences?, grammar?: id of a grammar card shown before the sentences }
// Unit: { id, title, desc, facts: [fun-fact categories for breaks], lessons, dialogues?: [ids] }

const FACT = {
  food: 'Food & Tea Culture',
  city: 'Cities & Architecture',
  history: 'History & Dynasties',
  nature: 'Nature & Wildlife',
  festivals: 'Festivals & Traditions',
  modern: 'Modern Life & Technology',
  language: 'Language & Characters',
  transport: 'Transport & Travel',
};

export const SECTIONS_DATA = [
  {
    id: 'china',
    title: 'First trip to China',
    units: [
      {
        id: 'hello',
        title: 'Hello & thank you',
        desc: 'Greet people, thank them and say sorry',
        facts: [FACT.language, FACT.festivals],
        phrases: ['Key Polite Basics'],
        lessons: [
          { title: 'Hello', words: [
            ['你好', 'nǐhǎo', 'hello', '👋', { note: 'The everyday hello, any time of day.' }],
            ['您好', 'nínhǎo', 'hello (polite)', '🙇', { note: '您 is the polite "you": for older people, hotel and shop staff, people you respect.' }],
            ['早上好', 'zǎoshang hǎo', 'good morning', '🌅', { note: 'Friends often just say 早 (zǎo).' }],
          ] },
          { title: 'Thank you', words: [
            ['谢谢', 'xièxie', 'thank you', '🙏', { note: 'Between close friends and family it is said less than in English — too many thanks can sound distant.' }],
            ['不客气', 'búkèqi', 'you\'re welcome', '😊', { note: 'Literally "don\'t be a guest". Also: 不用谢 (no need to thank).' }],
            ['请', 'qǐng', 'please', '🤲', { note: 'Goes first: 请 + what you ask. 请进 = please come in.' }],
          ] },
          { title: 'Sorry', words: [
            ['对不起', 'duìbuqǐ', 'sorry', '😔', { note: 'A real apology. To get attention, say 不好意思 or 你好 instead.' }],
            ['没关系', 'méi guānxi', 'it doesn\'t matter', '👌', { note: 'The usual reply to 对不起.' }],
            ['不好意思', 'bù hǎoyìsi', 'excuse me / sorry (light)', '🙋', { note: 'A light sorry — bumping into someone, or "excuse me" to ask something.' }],
          ] },
          { title: 'Yes & no', words: [
            ['是的', 'shìde', 'yes, that\'s right', '✅', { note: 'Chinese has no single word for "yes": people repeat the verb (要 = yes, I want it) or say 对 (right).' }],
            ['不是', 'búshì', 'no, it isn\'t', '❌', { note: '不 is said bú before a 4th tone.' }],
            ['对', 'duì', 'right / correct', '👍'],
          ] },
          { title: 'Goodbye', words: [
            ['再见', 'zàijiàn', 'goodbye', '🏃', { note: 'Literally "see again". Friends also say 拜拜 (báibái, bye-bye).' }],
            ['晚安', 'wǎn\'ān', 'good night', '🌙', { note: 'Only when going to bed. For "good evening" just say 你好.' }],
            ['明天见', 'míngtiān jiàn', 'see you tomorrow', '📅'],
          ] },
          { title: 'How are you?', grammar: 'ma', sentences: [
            { jp: ['你好', '吗'], romaji: 'nǐhǎo ma', en: 'How are you', alt: ['Are you well', 'How are you doing'] },
            { jp: ['我', '很', '好'], romaji: 'wǒ hěn hǎo', en: 'I am fine', alt: ['I\'m fine', 'I am well', 'I\'m well', 'I am good', 'I\'m good'] },
            { jp: ['你', '呢'], romaji: 'nǐ ne', en: 'And you', alt: ['What about you', 'How about you'] },
            { jp: ['谢谢', '你'], romaji: 'xièxie nǐ', en: 'Thank you', alt: ['Thanks', 'Thank you very much'] },
          ] },
        ],
      },
      {
        id: 'around',
        title: 'Getting around',
        desc: 'Stations, the subway, taxis and finding the toilet',
        facts: [FACT.transport, FACT.city],
        phrases: ['Getting Around & Transit'],
        dialogues: ['d-station'],
        lessons: [
          { title: 'Stations', words: [
            ['车站', 'chēzhàn', 'station / stop', '🚏'],
            ['地铁', 'dìtiě', 'subway', '🚇', { note: 'Beijing and Shanghai have some of the biggest subways in the world. Signs are in English too.' }],
            ['火车站', 'huǒchēzhàn', 'train station', '🚉', { note: '火车 (fire vehicle) = train, 站 = station.' }],
          ] },
          { title: 'Toilet & taxi', words: [
            ['厕所', 'cèsuǒ', 'toilet', '🚻', { note: 'Direct and common. 洗手间 sounds nicer.' }],
            ['洗手间', 'xǐshǒujiān', 'restroom', '🚾', { note: 'Literally "wash-hands room" — the polite word. Carry tissues: many public toilets have no paper!' }],
            ['出租车', 'chūzūchē', 'taxi', '🚕', { note: 'Most people book one with an app (滴滴, Dīdī).' }],
          ] },
          { title: 'Tickets & places', words: [
            ['票', 'piào', 'ticket', '🎫'],
            ['酒店', 'jiǔdiàn', 'hotel', '🏨', { note: '酒 means alcohol, but 酒店 is simply a hotel.' }],
            ['饭馆', 'fànguǎn', 'restaurant (small)', '🍜', { note: 'A small local restaurant.' }],
            ['餐厅', 'cāntīng', 'restaurant / dining room', '🍽️'],
          ] },
          { title: 'Which way?', words: [
            ['哪里', 'nǎlǐ', 'where', '❓', { note: 'In Beijing you will hear 哪儿 (nǎr) instead — same meaning.', alt: ['哪儿'] }],
            ['左边', 'zuǒbian', 'left side', '⬅️'],
            ['右边', 'yòubian', 'right side', '➡️'],
            ['一直走', 'yìzhí zǒu', 'go straight ahead', '⬆️'],
          ] },
          { title: 'Where is…?', grammar: 'zai', sentences: [
            { jp: ['厕所', '在', '哪里'], romaji: 'cèsuǒ zài nǎlǐ', en: 'Where is the toilet', alt: ['Where is the bathroom', 'Where\'s the toilet'] },
            { jp: ['地铁站', '在', '哪里'], romaji: 'dìtiězhàn zài nǎlǐ', en: 'Where is the subway station', alt: ['Where\'s the subway station', 'Where is the metro station'] },
            { jp: ['酒店', '在', '哪里'], romaji: 'jiǔdiàn zài nǎlǐ', en: 'Where is the hotel', alt: ['Where\'s the hotel'] },
            { jp: ['在', '右边'], romaji: 'zài yòubian', en: 'It is on the right', alt: ['It\'s on the right', 'On the right'] },
          ] },
          { title: 'Directions', sentences: [
            { jp: ['在', '左边'], romaji: 'zài zuǒbian', en: 'It is on the left', alt: ['It\'s on the left', 'On the left'] },
            { jp: ['一直', '走'], romaji: 'yìzhí zǒu', en: 'Go straight ahead', alt: ['Go straight', 'Straight ahead'] },
            { jp: ['洗手间', '在', '那里'], romaji: 'xǐshǒujiān zài nàlǐ', en: 'The restroom is over there', alt: ['The toilet is over there', 'The bathroom is there'] },
          ] },
        ],
      },
      {
        id: 'food',
        title: 'Food & drinks',
        desc: 'Order, say cheers and ask for the bill',
        facts: [FACT.food],
        phrases: ['Dining & Food'],
        dialogues: ['d-tea'],
        lessons: [
          { title: 'Ordering', words: [
            ['这个', 'zhège', 'this one', '👇', { note: 'Point and say 这个 — it works everywhere!' }],
            ['我要', 'wǒ yào', 'I want / I\'ll have', '🙋', { note: 'The normal way to order. Not rude at all in Chinese.' }],
            ['请给我', 'qǐng gěi wǒ', 'please give me', '🤲', { note: 'A bit more polite than 我要.' }],
          ] },
          { title: 'Drinks', words: [
            ['水', 'shuǐ', 'water', '💧'],
            ['热水', 'rèshuǐ', 'hot water', '♨️', { note: 'Chinese people love drinking hot water — hotels and trains have hot water dispensers.' }],
            ['茶', 'chá', 'tea', '🍵', { note: 'Green tea (绿茶) and oolong (乌龙茶) are favourites.' }],
            ['咖啡', 'kāfēi', 'coffee', '☕'],
          ] },
          { title: 'Cheers!', words: [
            ['啤酒', 'píjiǔ', 'beer', '🍺', { note: '青岛 (Qīngdǎo) is the famous Chinese beer.' }],
            ['干杯', 'gānbēi', 'cheers!', '🍻', { note: 'Literally "dry the glass" — at dinners it can mean drinking it all!' }],
            ['冰的', 'bīng de', 'iced / cold', '🧊', { note: 'Drinks often come warm or room temperature. Ask for 冰的 if you want it cold.' }],
          ] },
          { title: 'Tastes', words: [
            ['好吃', 'hǎochī', 'delicious', '😋', { note: 'For food. For drinks say 好喝 (hǎohē).' }],
            ['辣', 'là', 'spicy', '🌶️', { note: 'Sichuan and Hunan food can be very spicy!' }],
            ['不要辣', 'bú yào là', 'not spicy, please', '🙅', { note: 'Even "a little spicy" (微辣) can be quite hot.' }],
          ] },
          { title: 'I want this', grammar: 'yao', sentences: [
            { jp: ['我', '要', '这个'], romaji: 'wǒ yào zhège', en: 'I want this one', alt: ['I want this', 'This one please', 'I\'ll have this'] },
            { jp: ['我', '要', '咖啡'], romaji: 'wǒ yào kāfēi', en: 'I want coffee', alt: ['I would like coffee', 'Coffee please'] },
            { jp: ['请', '给', '我', '一', '杯', '茶'], romaji: 'qǐng gěi wǒ yì bēi chá', en: 'Please give me a cup of tea', alt: ['A cup of tea please', 'A tea please'] },
            { jp: ['不', '要', '辣'], romaji: 'bú yào là', en: 'Not spicy please', alt: ['No spice please', 'Not spicy'] },
          ] },
          { title: 'The bill', words: [
            ['买单', 'mǎidān', 'the bill please', '🧾', { note: 'Call it out to the staff. 结账 means the same.' }],
            ['结账', 'jiézhàng', 'pay the bill', '💳'],
            ['服务员', 'fúwùyuán', 'waiter / waitress', '🧑‍🍳', { note: 'Call it out to get attention. Many people just say 你好!' }],
          ], sentences: [
            { jp: ['很', '好吃'], romaji: 'hěn hǎochī', en: 'It is delicious', alt: ['It\'s delicious', 'Very delicious', 'Very tasty'] },
            { jp: ['服务员', '买单'], romaji: 'fúwùyuán mǎidān', en: 'Waiter the bill please', alt: ['The bill please', 'Check please'] },
            { jp: ['干杯'], romaji: 'gānbēi', en: 'Cheers' },
          ] },
        ],
      },
      {
        id: 'shopping',
        title: 'Shopping & help',
        desc: 'Prices, bargaining, paying by phone and asking for help',
        facts: [FACT.modern, FACT.city],
        phrases: ['Shopping & Paying', 'Help & Emergency'],
        dialogues: ['d-price', 'd-wechat'],
        lessons: [
          { title: 'How much?', words: [
            ['多少钱', 'duōshao qián', 'how much (money)', '💴'],
            ['太贵了', 'tài guì le', 'too expensive!', '😱', { note: 'At markets, bargaining is normal. Not in malls or supermarkets.' }],
            ['便宜一点', 'piányi yìdiǎn', 'a bit cheaper', '🤏', { note: 'Smile and ask: 便宜一点吧? (Can you make it cheaper?)' }],
          ] },
          { title: 'Paying', words: [
            ['微信支付', 'Wēixìn zhīfù', 'WeChat Pay', '📱', { note: 'China pays by phone: scan a QR code. Set it up with a foreign card before you go.', alt: ['微信'] }],
            ['支付宝', 'Zhīfùbǎo', 'Alipay', '📲', { note: 'The other big mobile payment app. Works with foreign cards too.' }],
            ['现金', 'xiànjīn', 'cash', '💵', { note: 'Shops must accept cash, but small vendors may have no change.' }],
            ['刷卡', 'shuākǎ', 'pay by card', '💳', { note: 'Literally "swipe card". Foreign cards work mostly in big hotels and malls.' }],
          ] },
          { title: 'Help!', words: [
            ['我听不懂', 'wǒ tīng bu dǒng', 'I don\'t understand', '🤷', { note: 'Literally "I hear but don\'t understand".' }],
            ['英语', 'Yīngyǔ', 'English', '🔤', { alt: ['英文'] }],
            ['救命', 'jiùmìng', 'help!', '🆘', { note: 'Only in an emergency — literally "save life".' }],
            ['没问题', 'méi wèntí', 'no problem', '👌'],
          ] },
          { title: 'Questions', grammar: 'ma', sentences: [
            { jp: ['这个', '多少', '钱'], romaji: 'zhège duōshao qián', en: 'How much is this', alt: ['How much is this one', 'How much is it'] },
            { jp: ['可以', '用', '微信', '吗'], romaji: 'kěyǐ yòng Wēixìn ma', en: 'Can I use WeChat', alt: ['Can I pay with WeChat', 'Can I use WeChat Pay'] },
            { jp: ['你', '会', '说', '英语', '吗'], romaji: 'nǐ huì shuō Yīngyǔ ma', en: 'Can you speak English', alt: ['Do you speak English'] },
            { jp: ['请', '等', '一下'], romaji: 'qǐng děng yíxià', en: 'Please wait a moment', alt: ['Wait a moment please', 'One moment please'] },
          ] },
        ],
      },
      {
        id: 'numbers',
        title: 'Numbers, prices & time',
        desc: 'Count, read prices in yuan and tell the time',
        facts: [FACT.language, FACT.festivals],
        phrases: ['Shopping & Paying'],
        lessons: [
          { title: '1 to 3', words: [
            ['一', 'yī', 'one', '1️⃣', { note: 'Said yī alone, but yí or yì before another word: 一个 yí gè, 一杯 yì bēi.', alt: ['1'] }],
            ['二', 'èr', 'two', '2️⃣', { note: 'For counting and in numbers (十二 = 12). For "two of something", use 两.', alt: ['2'] }],
            ['三', 'sān', 'three', '3️⃣', { alt: ['3'] }],
          ] },
          { title: '4 to 6', words: [
            ['四', 'sì', 'four', '4️⃣', { note: 'Sounds like 死 (death), so buildings often skip the 4th floor.', alt: ['4'] }],
            ['五', 'wǔ', 'five', '5️⃣', { alt: ['5'] }],
            ['六', 'liù', 'six', '6️⃣', { note: 'A lucky number: it sounds like "smooth".', alt: ['6'] }],
          ] },
          { title: '7 to 10', words: [
            ['七', 'qī', 'seven', '7️⃣', { alt: ['7'] }],
            ['八', 'bā', 'eight', '8️⃣', { note: 'The luckiest number: it sounds like 发 (get rich). The Beijing Olympics opened on 8/8/08 at 8:08 pm!', alt: ['8'] }],
            ['九', 'jiǔ', 'nine', '9️⃣', { alt: ['9'] }],
            ['十', 'shí', 'ten', '🔟', { note: 'Numbers build like Lego: 十一 = 11, 二十 = 20, 五十五 = 55.', alt: ['10'] }],
          ] },
          { title: 'Big numbers', words: [
            ['两', 'liǎng', 'two (of something)', '✌️', { note: 'Before a measure word: 两个人 (two people), 两点 (2 o\'clock). Never 二个.', alt: ['2'] }],
            ['百', 'bǎi', 'hundred', '💯', { note: '一百 = 100, 三百 = 300.', alt: ['100'] }],
            ['千', 'qiān', 'thousand', '🪙', { note: '一千 = 1,000.', alt: ['1000'] }],
            ['万', 'wàn', 'ten thousand', '💰', { note: 'Chinese counts in ten-thousands: 10,000 = 一万.', alt: ['10000'] }],
          ] },
          { title: 'Money & time', words: [
            ['块', 'kuài', 'yuan (spoken)', '💴', { note: 'What people say: 五十块 = 50 yuan. 元 is the written word on price tags.' }],
            ['元', 'yuán', 'yuan (written)', '🏷️', { note: 'The currency is the renminbi (RMB); its unit is the yuan, ¥.' }],
            ['点', 'diǎn', 'o\'clock', '🕒', { note: 'After the hour: 三点 = 3 o\'clock. 2 o\'clock is 两点.' }],
            ['半', 'bàn', 'half past', '🕧', { note: 'After the hour: 三点半 = half past three.' }],
            ['现在', 'xiànzài', 'now', '⌚'],
          ] },
          { title: 'How much? What time?', grammar: 'ji', sentences: [
            { jp: ['五十', '块'], romaji: 'wǔshí kuài', en: '50 yuan', alt: ['Fifty yuan', 'It is 50 yuan', 'It\'s 50 yuan'] },
            { jp: ['一百', '块'], romaji: 'yìbǎi kuài', en: '100 yuan', alt: ['One hundred yuan', 'It is 100 yuan', 'It\'s 100 yuan'] },
            { jp: ['现在', '几', '点'], romaji: 'xiànzài jǐ diǎn', en: 'What time is it now', alt: ['What time is it'] },
            { jp: ['三', '点', '半'], romaji: 'sān diǎn bàn', en: 'Half past three', alt: ['It is half past three', 'It\'s 3:30', '3:30'] },
          ] },
        ],
      },
      {
        id: 'hotel',
        title: 'At the hotel',
        desc: 'Check in, find your room, Wi-Fi and breakfast',
        facts: [FACT.modern, FACT.city],
        phrases: ['Hotel & Practical Questions'],
        dialogues: ['d-hotel'],
        lessons: [
          { title: 'Checking in', words: [
            ['预订', 'yùdìng', 'reservation', '📋', { note: 'Also used as a verb: to book.' }],
            ['办理入住', 'bànlǐ rùzhù', 'check in', '🛎️', { note: '入住 = move in. Hotels will ask for your passport (护照, hùzhào).' }],
            ['房间', 'fángjiān', 'room', '🚪'],
            ['房卡', 'fángkǎ', 'room key card', '🔑'],
          ] },
          { title: 'Hotel life', words: [
            ['早饭', 'zǎofàn', 'breakfast', '🍳', { note: 'Hotel signs often say 早餐 (zǎocān) — same meaning.', alt: ['早餐'] }],
            ['几点', 'jǐ diǎn', 'what time', '🕐'],
            ['无线网', 'wúxiànwǎng', 'Wi-Fi', '📶', { note: 'Most people simply say "WiFi" in English.', alt: ['WiFi', 'wifi', 'Wi-Fi'] }],
            ['密码', 'mìmǎ', 'password', '🔐'],
            ['行李', 'xíngli', 'luggage', '🧳'],
          ] },
          { title: 'At the front desk', grammar: 'you', sentences: [
            { jp: ['我', '有', '预订'], romaji: 'wǒ yǒu yùdìng', en: 'I have a reservation', alt: ['I have a booking', 'I\'ve got a reservation'] },
            { jp: ['我', '要', '办理', '入住'], romaji: 'wǒ yào bànlǐ rùzhù', en: 'I would like to check in', alt: ['I want to check in', 'Check-in please'] },
            { jp: ['无线网', '密码', '是', '多少'], romaji: 'wúxiànwǎng mìmǎ shì duōshao', en: 'What is the Wi-Fi password', alt: ['What\'s the Wi-Fi password', 'What is the WiFi password'] },
          ] },
          { title: 'Breakfast & bags', grammar: 'de', sentences: [
            { jp: ['早饭', '几', '点'], romaji: 'zǎofàn jǐ diǎn', en: 'What time is breakfast', alt: ['When is breakfast'] },
            { jp: ['可以', '寄存', '行李', '吗'], romaji: 'kěyǐ jìcún xíngli ma', en: 'Can I leave my luggage', alt: ['Can you keep my luggage', 'Can I store my bags'] },
            { jp: ['我', '的', '房间', '在', '哪里'], romaji: 'wǒ de fángjiān zài nǎlǐ', en: 'Where is my room', alt: ['Where\'s my room'] },
          ] },
        ],
      },
      {
        id: 'eating-out',
        title: 'Eating out',
        desc: 'A table for two, recommendations, allergies and one more beer',
        facts: [FACT.food],
        phrases: ['Dining & Food'],
        lessons: [
          { title: 'Table for…', words: [
            ['一个人', 'yí gè rén', 'one person', '🧍'],
            ['两个人', 'liǎng gè rén', 'two people', '👫', { note: 'Staff ask 几位? (how many people?) — answer with the number.' }],
            ['菜单', 'càidān', 'menu', '🗒️', { note: 'Many restaurants have you order by scanning a QR code on the table.' }],
            ['推荐', 'tuījiàn', 'recommend', '👍'],
          ] },
          { title: 'Special requests', words: [
            ['过敏', 'guòmǐn', 'allergic', '🤧'],
            ['吃素', 'chīsù', 'eat vegetarian', '🥗', { note: 'Buddhist vegetarian restaurants (素食馆) are a great choice.' }],
            ['不要肉', 'bú yào ròu', 'no meat, please', '🙅', { note: 'Dishes "without meat" may still use meat broth or lard — ask clearly.' }],
          ] },
          { title: 'Ordering', grammar: 'ge', sentences: [
            { jp: ['两', '个', '人'], romaji: 'liǎng gè rén', en: 'Two people', alt: ['A table for two', 'We are two', 'There are two of us'] },
            { jp: ['请', '给', '我', '菜单'], romaji: 'qǐng gěi wǒ càidān', en: 'The menu please', alt: ['Menu please', 'Please give me the menu', 'Can I have the menu'] },
            { jp: ['你', '推荐', '什么'], romaji: 'nǐ tuījiàn shénme', en: 'What do you recommend', alt: ['What would you recommend'] },
            { jp: ['再', '来', '一', '瓶', '啤酒'], romaji: 'zài lái yì píng píjiǔ', en: 'One more bottle of beer', alt: ['Another beer please', 'Another bottle of beer', 'One more beer please'] },
          ] },
          { title: 'Allergies', words: [
            ['花生', 'huāshēng', 'peanut', '🥜', { note: 'Very common in Chinese cooking (宫保鸡丁!).' }],
            ['素食', 'sùshí', 'vegetarian food', '🥦'],
            ['再来一个', 'zài lái yí gè', 'one more', '➕', { note: '来 (come) is the casual way to order: 来一个 = one of those!' }],
          ], sentences: [
            { jp: ['我', '吃素'], romaji: 'wǒ chīsù', en: 'I am vegetarian', alt: ['I\'m vegetarian', 'I eat vegetarian', 'I am a vegetarian'] },
            { jp: ['我', '对', '花生', '过敏'], romaji: 'wǒ duì huāshēng guòmǐn', en: 'I am allergic to peanuts', alt: ['I\'m allergic to peanuts', 'I have a peanut allergy'] },
            { jp: ['不', '要', '肉'], romaji: 'bú yào ròu', en: 'No meat please', alt: ['No meat', 'I don\'t want meat'] },
          ] },
        ],
      },
      {
        id: 'trains',
        title: 'Trains & taxis',
        desc: 'High-speed trains, platforms, changing lines and taxis',
        facts: [FACT.transport],
        phrases: ['Getting Around & Transit'],
        dialogues: ['d-taxi'],
        lessons: [
          { title: 'On the platform', words: [
            ['高铁', 'gāotiě', 'high-speed train', '🚄', { note: 'China has the world\'s largest high-speed rail network: Beijing to Shanghai in about 4.5 hours.' }],
            ['站台', 'zhàntái', 'platform', '🚉'],
            ['几号站台', 'jǐ hào zhàntái', 'which platform', '🔢', { note: '号 = number: 三号站台 = platform 3.' }],
            ['下一站', 'xià yí zhàn', 'next stop', '⏭️'],
          ] },
          { title: 'Going places', words: [
            ['换乘', 'huànchéng', 'transfer (change lines)', '🔄'],
            ['去', 'qù', 'to go', '➡️'],
            ['到', 'dào', 'to arrive / to (a place)', '🏁', { note: 'Taxi drivers say 到了 — "we\'re here".' }],
          ] },
          { title: 'Big cities', words: [
            ['北京', 'Běijīng', 'Beijing', '🏯', { note: 'Literally "northern capital".' }],
            ['上海', 'Shànghǎi', 'Shanghai', '🌃', { note: 'Literally "on the sea".' }],
            ['南京', 'Nánjīng', 'Nanjing', '🏙️', { note: 'Literally "southern capital".' }],
          ] },
          { title: 'Which train?', grammar: 'qu', sentences: [
            { jp: ['这', '是', '去', '上海', '的', '吗'], romaji: 'zhè shì qù Shànghǎi de ma', en: 'Is this the one to Shanghai', alt: ['Does this go to Shanghai', 'Is this going to Shanghai', 'Is this the train to Shanghai'] },
            { jp: ['几', '号', '站台'], romaji: 'jǐ hào zhàntái', en: 'Which platform', alt: ['Which platform is it', 'What platform'] },
            { jp: ['下', '一', '站', '是', '北京'], romaji: 'xià yí zhàn shì Běijīng', en: 'The next stop is Beijing', alt: ['Next stop Beijing', 'The next station is Beijing'] },
          ] },
          { title: 'Transfers & taxis', sentences: [
            { jp: ['在', '哪里', '换乘'], romaji: 'zài nǎlǐ huànchéng', en: 'Where do I transfer', alt: ['Where do I change trains', 'Where do I change lines'] },
            { jp: ['去', '酒店'], romaji: 'qù jiǔdiàn', en: 'To the hotel', alt: ['To the hotel please', 'Go to the hotel'] },
            { jp: ['到', '火车站'], romaji: 'dào huǒchēzhàn', en: 'To the train station', alt: ['To the train station please', 'To the station'] },
          ] },
        ],
      },
      {
        id: 'help',
        title: 'Help & health',
        desc: 'Pharmacies, doctors and what to say in an emergency',
        facts: [FACT.modern, FACT.history],
        phrases: ['Help & Emergency'],
        lessons: [
          { title: 'Feeling ill', words: [
            ['疼', 'téng', 'hurts / painful', '🤕', { note: 'Point and say 这里疼 — "it hurts here".' }],
            ['药', 'yào', 'medicine', '💊', { note: 'Pharmacies often sell both Western and traditional Chinese medicine (中药).' }],
            ['药店', 'yàodiàn', 'pharmacy', '🏪', { note: 'Look for a green cross sign.' }],
          ] },
          { title: 'Doctor & hospital', words: [
            ['医院', 'yīyuàn', 'hospital', '🏥', { note: 'In China you go to a hospital even for small things — there are few GP clinics.' }],
            ['医生', 'yīshēng', 'doctor', '🧑‍⚕️'],
            ['救护车', 'jiùhùchē', 'ambulance', '🚑', { note: 'Ambulance: 120. Police: 110. Fire: 119.' }],
          ] },
          { title: 'Lost', words: [
            ['警察', 'jǐngchá', 'police', '👮'],
            ['迷路', 'mílù', 'to get lost', '🗺️'],
            ['这里', 'zhèlǐ', 'here', '📍', { alt: ['这儿'] }],
          ] },
          { title: 'It hurts here', grammar: 'qing', sentences: [
            { jp: ['这里', '疼'], romaji: 'zhèlǐ téng', en: 'It hurts here', alt: ['Here hurts', 'I have pain here'] },
            { jp: ['请', '叫', '医生'], romaji: 'qǐng jiào yīshēng', en: 'Please call a doctor', alt: ['Call a doctor please', 'Please get a doctor'] },
            { jp: ['请', '叫', '救护车'], romaji: 'qǐng jiào jiùhùchē', en: 'Please call an ambulance', alt: ['Call an ambulance please', 'Call an ambulance'] },
          ] },
          { title: 'Where is…?', grammar: 'le', sentences: [
            { jp: ['我', '迷路', '了'], romaji: 'wǒ mílù le', en: 'I am lost', alt: ['I\'m lost', 'I got lost', 'I have lost my way'] },
            { jp: ['药店', '在', '哪里'], romaji: 'yàodiàn zài nǎlǐ', en: 'Where is the pharmacy', alt: ['Where\'s the pharmacy', 'Where is a pharmacy'] },
            { jp: ['医院', '在', '哪里'], romaji: 'yīyuàn zài nǎlǐ', en: 'Where is the hospital', alt: ['Where\'s the hospital', 'Where is a hospital'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday Chinese',
    units: [
      {
        id: 'people',
        title: 'People & jobs',
        desc: 'Say who you are, where you\'re from and what you do',
        facts: [FACT.language, FACT.modern],
        dialogues: ['d-meet'],
        lessons: [
          { title: 'I & you', words: [
            ['我', 'wǒ', 'I / me', '🙋'],
            ['你', 'nǐ', 'you', '👉'],
            ['他', 'tā', 'he / she', '🧑', { note: '他 (he) and 她 (she) sound exactly the same: tā. Only the writing differs.', alt: ['她'] }],
          ] },
          { title: 'People', words: [
            ['朋友', 'péngyou', 'friend', '🤝'],
            ['老师', 'lǎoshī', 'teacher', '🧑‍🏫', { note: 'Also a respectful way to address any teacher-like expert.' }],
            ['学生', 'xuésheng', 'student', '🧑‍🎓'],
            ['医生', 'yīshēng', 'doctor', '🧑‍⚕️'],
          ] },
          { title: 'Where from?', words: [
            ['美国人', 'Měiguórén', 'American', '🇺🇸', { note: '美国 (beautiful country) = USA, + 人 (person).' }],
            ['英国人', 'Yīngguórén', 'British', '🇬🇧'],
            ['中国人', 'Zhōngguórén', 'Chinese (person)', '🇨🇳', { note: '中国 = "middle kingdom".' }],
            ['工作', 'gōngzuò', 'work / job', '💼'],
          ] },
          { title: 'I am…', grammar: 'shi', sentences: [
            { jp: ['我', '是', '学生'], romaji: 'wǒ shì xuésheng', en: 'I am a student', alt: ['I\'m a student'] },
            { jp: ['我', '是', '美国人'], romaji: 'wǒ shì Měiguórén', en: 'I am American', alt: ['I\'m American', 'I am from America'] },
            { jp: ['他', '是', '老师'], romaji: 'tā shì lǎoshī', en: 'He is a teacher', alt: ['He\'s a teacher', 'She is a teacher'] },
            { jp: ['我', '不', '是', '中国人'], romaji: 'wǒ bú shì Zhōngguórén', en: 'I am not Chinese', alt: ['I\'m not Chinese'] },
          ] },
          { title: 'Names', grammar: 'de', words: [
            ['名字', 'míngzi', 'name', '📛'],
            ['叫', 'jiào', 'to be called', '🗣️', { note: '我叫… = my name is… (literally "I am called…").' }],
            ['什么', 'shénme', 'what', '❔', { note: 'Stays where the answer goes: 你叫什么? → 我叫安娜.' }],
          ], sentences: [
            { jp: ['你', '叫', '什么', '名字'], romaji: 'nǐ jiào shénme míngzi', en: 'What is your name', alt: ['What\'s your name'] },
            { jp: ['我', '叫', '安娜'], romaji: 'wǒ jiào Ānnà', en: 'My name is Anna', alt: ['I am Anna', 'I\'m Anna', 'I am called Anna'] },
            { jp: ['她', '是', '我', '的', '朋友'], romaji: 'tā shì wǒ de péngyou', en: 'She is my friend', alt: ['She\'s my friend', 'He is my friend'] },
          ] },
        ],
      },
      {
        id: 'meals',
        title: 'Food words',
        desc: 'Rice, noodles, dumplings — and what you like',
        facts: [FACT.food, FACT.festivals],
        dialogues: ['d-dumplings'],
        lessons: [
          { title: 'Staples', words: [
            ['米饭', 'mǐfàn', 'rice (cooked)', '🍚', { note: 'Southern China eats more rice, the north more noodles and buns.' }],
            ['面条', 'miàntiáo', 'noodles', '🍜', { note: 'Long noodles mean long life — eaten on birthdays.' }],
            ['饺子', 'jiǎozi', 'dumplings', '🥟', { note: 'Families make them together for Chinese New Year.' }],
            ['包子', 'bāozi', 'steamed bun', '🫓', { note: 'A classic breakfast, filled with meat or vegetables.' }],
          ] },
          { title: 'Meat & fish', words: [
            ['鱼', 'yú', 'fish', '🐟', { note: 'Sounds like 余 (surplus), so fish is served at New Year.' }],
            ['肉', 'ròu', 'meat', '🥩', { note: 'On its own, 肉 usually means pork.' }],
            ['鸡', 'jī', 'chicken', '🍗'],
            ['鸡蛋', 'jīdàn', 'egg', '🥚', { note: 'Literally "chicken egg".' }],
          ] },
          { title: 'Fruit & veg', words: [
            ['菜', 'cài', 'vegetables / dish', '🥬', { note: 'Also means "a dish": 点菜 = to order food.' }],
            ['水果', 'shuǐguǒ', 'fruit', '🍉'],
            ['苹果', 'píngguǒ', 'apple', '🍎', { note: 'Sounds like 平安 (peace) — apples are given on Christmas Eve!' }],
            ['喜欢', 'xǐhuan', 'to like', '❤️'],
          ] },
          { title: 'I like dumplings', grammar: 'bu', sentences: [
            { jp: ['我', '喜欢', '饺子'], romaji: 'wǒ xǐhuan jiǎozi', en: 'I like dumplings', alt: ['I love dumplings'] },
            { jp: ['我', '不', '喜欢', '鱼'], romaji: 'wǒ bù xǐhuan yú', en: 'I don\'t like fish', alt: ['I do not like fish'] },
            { jp: ['我', '也', '喜欢', '面条'], romaji: 'wǒ yě xǐhuan miàntiáo', en: 'I like noodles too', alt: ['I also like noodles'] },
            { jp: ['我', '不', '吃', '肉'], romaji: 'wǒ bù chī ròu', en: 'I don\'t eat meat', alt: ['I do not eat meat'] },
          ] },
        ],
      },
      {
        id: 'world',
        title: 'Around you',
        desc: 'Animals, nature and everyday things',
        facts: [FACT.nature],
        lessons: [
          { title: 'Animals', words: [
            ['猫', 'māo', 'cat', '🐱'],
            ['狗', 'gǒu', 'dog', '🐶'],
            ['鸟', 'niǎo', 'bird', '🐦'],
            ['熊猫', 'xióngmāo', 'panda', '🐼', { note: 'Literally "bear cat". See them in Chengdu (成都).' }],
          ] },
          { title: 'Nature', words: [
            ['山', 'shān', 'mountain', '⛰️', { note: 'Looks like three peaks!' }],
            ['海', 'hǎi', 'sea', '🌊'],
            ['天', 'tiān', 'sky / day', '☁️', { note: 'Also "day": 今天 = today.' }],
          ] },
          { title: 'Things', words: [
            ['车', 'chē', 'car / vehicle', '🚗'],
            ['书', 'shū', 'book', '📕'],
            ['雨伞', 'yǔsǎn', 'umbrella', '☂️', { note: 'Never give an umbrella as a gift: 伞 sounds like 散 (to split up).' }],
            ['漂亮', 'piàoliang', 'beautiful', '✨'],
          ] },
          { title: 'Very cute', grammar: 'hen', sentences: [
            { jp: ['熊猫', '很', '可爱'], romaji: 'xióngmāo hěn kě\'ài', en: 'Pandas are very cute', alt: ['The panda is very cute', 'Pandas are cute'] },
            { jp: ['山', '很', '漂亮'], romaji: 'shān hěn piàoliang', en: 'The mountain is beautiful', alt: ['The mountains are beautiful', 'The mountain is very beautiful'] },
            { jp: ['我', '有', '一', '只', '猫'], romaji: 'wǒ yǒu yì zhī māo', en: 'I have a cat', alt: ['I\'ve got a cat', 'I have one cat'] },
            { jp: ['这', '是', '我', '的', '书'], romaji: 'zhè shì wǒ de shū', en: 'This is my book', alt: ['That is my book'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'real',
    title: 'Real Chinese',
    units: [
      {
        id: 'casual',
        title: 'Casual & slang',
        desc: 'What friends really say — and what you\'ll see online',
        facts: [FACT.modern, FACT.language],
        dialogues: ['d-niu'],
        lessons: [
          { title: 'Okay!', words: [
            ['好的', 'hǎo de', 'okay', '👌', { note: 'The everyday "okay / sure".' }],
            ['好嘞', 'hǎo lei', 'okey-dokey!', '😄', { note: 'Cheerful "you got it!" — very Beijing, heard from waiters and drivers.' }],
            ['没事', 'méishì', 'no worries', '😌', { note: 'Reply to sorry or thanks — "it\'s nothing".' }],
          ] },
          { title: 'Awesome!', words: [
            ['六六六', 'liùliùliù', 'awesome!', '🎮', { note: 'Gamer slang for "smooth, skilled". Typed as 666 in chats and livestreams.', alt: ['666'] }],
            ['牛', 'niú', 'awesome / badass', '🐮', { note: 'Literally "cow"! 太牛了 = so awesome. Casual — not for your boss.' }],
            ['厉害', 'lìhai', 'amazing / impressive', '🤩', { note: 'Polite enough for anyone: 你好厉害! = you\'re amazing!' }],
            ['绝了', 'jué le', 'perfect / unbeatable', '💯', { note: 'Internet slang: something is so good it\'s "the end".' }],
          ] },
          { title: 'Really?', words: [
            ['哈哈', 'hāhā', 'haha', '😂', { note: 'Online people also type 哈哈哈 — or 2333 for laughing!' }],
            ['真的吗', 'zhēnde ma', 'really?', '😲'],
            ['加油', 'jiāyóu', 'go for it! / you can do it!', '💪', { note: 'Literally "add oil". Shouted at sports games and before exams.' }],
          ] },
          { title: 'So good!', grammar: 'tai', sentences: [
            { jp: ['太', '好吃', '了'], romaji: 'tài hǎochī le', en: 'So delicious', alt: ['It\'s so delicious', 'Super delicious', 'Very delicious'] },
            { jp: ['你', '太', '厉害', '了'], romaji: 'nǐ tài lìhai le', en: 'You are amazing', alt: ['You\'re amazing', 'You are so amazing', 'You\'re awesome'] },
            { jp: ['太', '牛', '了'], romaji: 'tài niú le', en: 'So awesome', alt: ['That\'s awesome', 'Awesome', 'That is so cool'] },
            { jp: ['真的', '吗'], romaji: 'zhēnde ma', en: 'Really', alt: ['Is that true', 'Seriously'] },
          ] },
        ],
      },
    ],
  },
];

// Two-person dialogues for listening comprehension. Speakers are cast characters.
// The first option is the right answer (it is shuffled when shown).
export const DIALOGUES = {
  'd-station': {
    title: 'In the subway',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '你好，请问地铁站在哪里？', en: 'Hello, excuse me, where is the subway station?' },
      { who: 1, jp: '一直走，然后在右边。', en: 'Go straight, then it\'s on the right.' },
      { who: 0, jp: '谢谢！', en: 'Thank you!' },
      { who: 1, jp: '不客气。', en: 'You\'re welcome.' },
    ],
    question: 'What did they talk about?',
    options: ['Where the subway station is', 'The price of a ticket', 'Which train is the fastest'],
  },
  'd-tea': {
    title: 'At the teahouse',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '你好，你要什么？', en: 'Hello, what would you like?' },
      { who: 1, jp: '请给我一杯茶。', en: 'A cup of tea, please.' },
      { who: 0, jp: '热的还是冰的？', en: 'Hot or iced?' },
      { who: 1, jp: '热的，谢谢。', en: 'Hot, thanks.' },
    ],
    question: 'What did the customer order?',
    options: ['A hot tea', 'An iced tea', 'A coffee'],
  },
  'd-price': {
    title: 'At the market',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '这个多少钱？', en: 'How much is this?' },
      { who: 1, jp: '一百块。', en: '100 yuan.' },
      { who: 0, jp: '太贵了！便宜一点吧。', en: 'Too expensive! A bit cheaper, please.' },
      { who: 1, jp: '好吧，八十块。', en: 'Okay, 80 yuan.' },
    ],
    question: 'What happened?',
    options: ['She bargained the price down to 80 yuan', 'She paid 100 yuan without asking', 'She asked where the toilet is'],
  },
  'd-wechat': {
    title: 'Paying',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '可以用微信吗？', en: 'Can I use WeChat?' },
      { who: 1, jp: '可以，请扫这里。', en: 'Yes, please scan here.' },
      { who: 0, jp: '好的，谢谢。', en: 'Okay, thanks.' },
    ],
    question: 'How does she pay?',
    options: ['With WeChat, by scanning a code', 'With cash', 'She does not pay'],
  },
  'd-hotel': {
    title: 'At the front desk',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '您好，我有预订。', en: 'Hello, I have a reservation.' },
      { who: 1, jp: '好的，请给我您的护照。', en: 'Okay, your passport please.' },
      { who: 0, jp: '给您。早饭几点？', en: 'Here you are. What time is breakfast?' },
      { who: 1, jp: '七点到十点。', en: 'From 7 to 10.' },
    ],
    question: 'When is breakfast?',
    options: ['From 7 to 10', 'From 6 to 9', 'There is no breakfast'],
  },
  'd-taxi': {
    title: 'In a taxi',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '你好，去哪里？', en: 'Hello, where to?' },
      { who: 1, jp: '去火车站，谢谢。', en: 'To the train station, thanks.' },
      { who: 0, jp: '好嘞！', en: 'You got it!' },
    ],
    question: 'Where is the passenger going?',
    options: ['To the train station', 'To the hotel', 'To the hospital'],
  },
  'd-meet': {
    title: 'Meeting someone',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '你好，我叫王丽。你叫什么名字？', en: 'Hello, I\'m Wang Li. What\'s your name?' },
      { who: 1, jp: '我叫安娜，我是美国人。', en: 'My name is Anna, I\'m American.' },
      { who: 0, jp: '我是老师。你呢？', en: 'I\'m a teacher. And you?' },
      { who: 1, jp: '我是学生。', en: 'I\'m a student.' },
    ],
    question: 'Who are they?',
    options: ['A teacher and an American student', 'Two doctors', 'A Chinese student and a British teacher'],
  },
  'd-dumplings': {
    title: 'Hungry friends',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '我饿了！', en: 'I\'m hungry!' },
      { who: 1, jp: '我们去吃饺子吧！', en: 'Let\'s go eat dumplings!' },
      { who: 0, jp: '好啊，我很喜欢饺子。', en: 'Great, I really like dumplings.' },
    ],
    question: 'What are they going to do?',
    options: ['Eat dumplings', 'Take a taxi', 'Go to the sea'],
  },
  'd-niu': {
    title: 'Big news',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '明天我去北京看熊猫！', en: 'Tomorrow I\'m going to Beijing to see pandas!' },
      { who: 1, jp: '真的吗？太牛了！', en: 'Really? So awesome!' },
      { who: 0, jp: '哈哈，加油学中文！', en: 'Haha, keep going with your Chinese!' },
    ],
    question: 'What is the news?',
    options: ['She is going to Beijing to see pandas', 'She lost her ticket', 'She does not like pandas'],
  },
};
