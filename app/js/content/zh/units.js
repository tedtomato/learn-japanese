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
        dialogues: ['d-hello-2'],
        lessons: [
          { title: 'Hello', words: [
            ['你好', 'nǐhǎo', 'hello', '👋', { note: 'The everyday hello, any time of day.' }],
            ['您好', 'nínhǎo', 'hello (polite)', '🙇', { note: '您 is the polite "you": for older people, hotel and shop staff, people you respect.' }],
            ['早上好', 'zǎoshang hǎo', 'good morning', '🌅', { note: 'Friends often just say 早 (zǎo).' }],
          ] },
          { title: 'Thank you', words: [
            ['谢谢', 'xièxie', 'thank you', '🙏', { note: 'Between close friends and family it is said less than in English — too many thanks can sound distant.' }],
            ['不客气', 'búkèqi', 'you\'re welcome', '😊', { note: 'Literally "no need to be polite" (客气 = polite, a guest\'s manners). Also: 不用谢 (no need to thank).' }],
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
        dialogues: ['d-station', 'd-around-2'],
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
            ['一张票', 'yì zhāng piào', 'one ticket', '🎫', { note: 'Tickets need a measure word: 张 is for flat things (tickets, paper). 我要一张票 = I\'d like a ticket.' }],
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
          { title: 'Directions', words: [
            ['请问', 'qǐngwèn', 'excuse me, may I ask…', '💬', { note: 'The polite way to start a question to a stranger: 请问，洗手间在哪里？' }],
            ['然后', 'ránhòu', 'then / afterwards', '⏭️', { note: 'Links steps: 一直走，然后在右边 = go straight, then it\'s on the right.' }],
          ], sentences: [
            { jp: ['请问', '洗手间', '在', '哪里'], romaji: 'qǐngwèn xǐshǒujiān zài nǎlǐ', en: 'Excuse me, where is the restroom', alt: ['Excuse me, where is the toilet', 'Excuse me, where is the bathroom', 'Where is the restroom, please'] },
            { jp: ['在', '左边'], romaji: 'zài zuǒbian', en: 'It is on the left', alt: ['It\'s on the left', 'On the left'] },
            { jp: ['一直', '走'], romaji: 'yìzhí zǒu', en: 'Go straight ahead', alt: ['Go straight', 'Straight ahead'] },
            { jp: ['洗手间', '在', '那里'], romaji: 'xǐshǒujiān zài nàlǐ', en: 'The restroom is over there', alt: ['The toilet is over there', 'The bathroom is there'] },
          ] },
        ],
      },
      {
        id: 'numbers',
        title: 'Numbers, prices & time',
        desc: 'Count, read prices in yuan and tell the time',
        facts: [FACT.language, FACT.festivals],
        phrases: ['Shopping & Paying'],
        dialogues: ['d-numbers-2'],
        lessons: [
          { title: '1 to 3', words: [
            ['一', 'yī', 'one', '1️⃣', { note: 'Said yī alone, but yí or yì before another word: 一个 yí ge, 一杯 yì bēi.', alt: ['1'] }],
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
        id: 'food',
        title: 'Food & drinks',
        desc: 'Order, say cheers and ask for the bill',
        facts: [FACT.food],
        phrases: ['Dining & Food'],
        dialogues: ['d-tea', 'd-food-2'],
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
            ['还是', 'háishi', 'or (in a question)', '🔄', { note: 'Offers a choice: 热的还是冰的？ = hot or iced?' }],
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
        dialogues: ['d-price', 'd-wechat', 'd-shopping-2'],
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
            ['请帮我', 'qǐng bāng wǒ', 'please help me', '🤝', { note: 'The everyday way to ask for help — lost, stuck with a bag, need a hand.' }],
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
        id: 'hotel',
        title: 'At the hotel',
        desc: 'Check in, find your room, Wi-Fi and breakfast',
        facts: [FACT.modern, FACT.city],
        phrases: ['Hotel & Practical Questions'],
        dialogues: ['d-hotel', 'd-hotel-2'],
        lessons: [
          { title: 'Checking in', words: [
            ['预订', 'yùdìng', 'reservation', '📋', { note: 'Also used as a verb: to book.' }],
            ['办理入住', 'bànlǐ rùzhù', 'check in', '🛎️', { note: '入住 = move in. Hotels will ask for your passport.' }],
            ['护照', 'hùzhào', 'passport', '📓', { note: 'Hotels scan it at check-in — keep it with you, not in the suitcase.' }],
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
        dialogues: ['d-eating-2'],
        lessons: [
          { title: 'Table for…', words: [
            ['一个人', 'yí ge rén', 'one person', '🧍'],
            ['两个人', 'liǎng ge rén', 'two people', '👫', { note: 'Staff ask 几位? (how many people?) — answer with the number.' }],
            ['菜单', 'càidān', 'menu', '🗒️', { note: 'Many restaurants have you order by scanning a QR code on the table.' }],
            ['推荐', 'tuījiàn', 'recommend', '👍'],
          ] },
          { title: 'Special requests', words: [
            ['过敏', 'guòmǐn', 'allergic', '🤧'],
            ['吃素', 'chīsù', 'eat vegetarian', '🥗', { note: 'Buddhist vegetarian restaurants (素食馆) are a great choice.' }],
            ['不要肉', 'bú yào ròu', 'no meat, please', '🙅', { note: 'Dishes "without meat" may still use meat broth or lard — ask clearly.' }],
          ] },
          { title: 'Ordering', grammar: 'ge', sentences: [
            { jp: ['两', '个', '人'], romaji: 'liǎng ge rén', en: 'Two people', alt: ['A table for two', 'We are two', 'There are two of us'] },
            { jp: ['请', '给', '我', '菜单'], romaji: 'qǐng gěi wǒ càidān', en: 'The menu please', alt: ['Menu please', 'Please give me the menu', 'Can I have the menu'] },
            { jp: ['你', '推荐', '什么'], romaji: 'nǐ tuījiàn shénme', en: 'What do you recommend', alt: ['What would you recommend'] },
            { jp: ['再', '来', '一', '瓶', '啤酒'], romaji: 'zài lái yì píng píjiǔ', en: 'One more bottle of beer', alt: ['Another beer please', 'Another bottle of beer', 'One more beer please'] },
          ] },
          { title: 'Allergies', words: [
            ['花生', 'huāshēng', 'peanut', '🥜', { note: 'Very common in Chinese cooking (宫保鸡丁!).' }],
            ['素食', 'sùshí', 'vegetarian food', '🥦'],
            ['再来一个', 'zài lái yí ge', 'one more', '➕', { note: '来 (come) is the casual way to order: 来一个 = one of those!' }],
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
        dialogues: ['d-taxi', 'd-trains-2'],
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
        dialogues: ['d-help-2'],
        lessons: [
          { title: 'Feeling ill', words: [
            ['疼', 'téng', 'hurts / painful', '🤕', { note: 'Point and say 这里疼 — "it hurts here".' }],
            ['药', 'yào', 'medicine', '💊', { note: 'Pharmacies often sell both Western and traditional Chinese medicine (中药).' }],
            ['药店', 'yàodiàn', 'pharmacy', '🏪', { note: 'Look for a green cross sign.' }],
            ['怎么了', 'zěnme le', 'what\'s wrong?', '❓', { note: 'What a pharmacist or doctor asks. Answer by pointing: 这里疼.' }],
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
        dialogues: ['d-meet', 'd-people-2'],
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
            ['司机', 'sījī', 'driver', '🚌', { note: 'Taxi and bus drivers. Address a taxi driver as 师傅 (shīfu, "master").' }],
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
          { title: 'We & they', words: [
            ['我们', 'wǒmen', 'we / us', '🧑‍🤝‍🧑', { note: '们 makes people words plural. 咱们 (zánmen) is a friendlier "we" that includes the listener.' }],
            ['你们', 'nǐmen', 'you (all)', '👫', { note: 'The plural of 你. For one polite person it is 您; "you all" is simply 你们.' }],
            ['他们', 'tāmen', 'they / them', '🧍', { note: '他们 for men or mixed groups, 她们 for all women, 它们 for things — all sound the same: tāmen.' }],
            ['那个', 'nàge', 'that one', '👇', { note: 'The partner of 这个 (this one). Point and say 那个!' }],
          ] },
          { title: 'We are…', grammar: 'men', sentences: [
            { jp: ['我们', '是', '朋友'], romaji: 'wǒmen shì péngyou', en: 'We are friends', alt: ['We\'re friends'] },
            { jp: ['你们', '是', '学生', '吗'], romaji: 'nǐmen shì xuésheng ma', en: 'Are you students', alt: ['Are you all students', 'Are you (all) students'] },
            { jp: ['他们', '是', '老师'], romaji: 'tāmen shì lǎoshī', en: 'They are teachers', alt: ['They\'re teachers'] },
            { jp: ['我们', '去', '北京'], romaji: 'wǒmen qù Běijīng', en: 'We are going to Beijing', alt: ['We go to Beijing', 'We\'re going to Beijing'] },
            { jp: ['那个', '很', '漂亮'], romaji: 'nàge hěn piàoliang', en: 'That one is beautiful', alt: ['That one is very beautiful', 'That is beautiful', 'That is pretty', 'That one is pretty'] },
          ] },
        ],
      },
      {
        id: 'meals',
        title: 'Food words',
        desc: 'Rice, noodles, dumplings — and what you like',
        facts: [FACT.food, FACT.festivals],
        dialogues: ['d-dumplings', 'd-meals-2'],
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
        dialogues: ['d-world-2'],
        lessons: [
          { title: 'Animals', words: [
            ['猫', 'māo', 'cat', '🐱'],
            ['狗', 'gǒu', 'dog', '🐶'],
            ['鸟', 'niǎo', 'bird', '🐦'],
            ['熊猫', 'xióngmāo', 'panda', '🐼', { note: 'Literally "bear cat". See them in Chengdu (成都) or at the Beijing Zoo.' }],
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
      {
        id: 'verbs',
        title: 'Everyday verbs',
        desc: 'Come, eat, drink, want, speak, buy — the verbs you use all day',
        facts: [FACT.language, FACT.food],
        dialogues: ['d-verbs-2'],
        lessons: [
          { title: 'Come, eat, drink', words: [
            ['来', 'lái', 'to come', '🏃', { note: 'Also "bring" when ordering: 来一瓶啤酒 = a beer, please.' }],
            ['吃', 'chī', 'to eat', '🍽️', { note: '吃饭 (eat rice) means "have a meal" — whatever the food is.' }],
            ['喝', 'hē', 'to drink', '🥤', { note: 'Soup is 喝 too: you drink it, not eat it.' }],
          ] },
          { title: 'Want, have, need', words: [
            ['想', 'xiǎng', 'to want to / to think', '💝', { note: '想 + verb = "would like to": 我想去. 要 is stronger — "I want / I\'ll have".' }],
            ['有', 'yǒu', 'to have / there is', '🤲', { note: 'Its "not" form is always 没有, never 不有.' }],
            ['需要', 'xūyào', 'to need', '📋', { note: '需要 + noun or verb: 我需要帮助 = I need help.' }],
          ] },
          { title: 'Be, speak, understand', words: [
            ['是', 'shì', 'to be (is / am / are)', '✅', { note: 'Links two nouns only: 我是学生. Never before an adjective — use 很.' }],
            ['说', 'shuō', 'to speak / to say', '🗣️', { note: '说英语 = speak English.' }],
            ['懂', 'dǒng', 'to understand', '🔎', { note: '我懂了 = I get it. 听不懂 = hear it but can\'t make sense of it.' }],
          ] },
          { title: 'Buy, look, return', words: [
            ['买', 'mǎi', 'to buy', '🛍️', { note: 'Not to be confused with 卖 (mài), "to sell" — same sound, falling tone.' }],
            ['看', 'kàn', 'to look / watch / read', '📺', { note: 'One verb for looking, watching films and reading: 看书, 看电影.' }],
            ['回', 'huí', 'to go back / return', '🔁', { note: '回酒店 = go back to the hotel. No word for "to" is needed.' }],
          ] },
          { title: 'I eat, I drink', grammar: 'svo', sentences: [
            { jp: ['我', '吃', '饺子'], romaji: 'wǒ chī jiǎozi', en: 'I eat dumplings', alt: ['I\'m eating dumplings', 'I am eating dumplings'] },
            { jp: ['你', '喝', '茶', '吗'], romaji: 'nǐ hē chá ma', en: 'Do you drink tea', alt: ['Are you drinking tea', 'Do you want tea'] },
            { jp: ['我', '想', '喝', '水'], romaji: 'wǒ xiǎng hē shuǐ', en: 'I want to drink water', alt: ['I would like to drink water', 'I\'d like some water', 'I want water'] },
            { jp: ['我', '想', '买', '票'], romaji: 'wǒ xiǎng mǎi piào', en: 'I want to buy a ticket', alt: ['I would like to buy a ticket', 'I\'d like to buy a ticket'] },
            { jp: ['我', '想', '看', '熊猫'], romaji: 'wǒ xiǎng kàn xióngmāo', en: 'I want to see pandas', alt: ['I want to see the pandas', 'I want to see a panda', 'I would like to see pandas'] },
          ] },
          { title: 'Can you speak it?', sentences: [
            { jp: ['你', '说', '英语', '吗'], romaji: 'nǐ shuō Yīngyǔ ma', en: 'Do you speak English', alt: ['Can you speak English', 'Are you speaking English'] },
            { jp: ['我', '有', '票'], romaji: 'wǒ yǒu piào', en: 'I have a ticket', alt: ['I\'ve got a ticket', 'I have the ticket'] },
            { jp: ['你', '想', '回', '酒店', '吗'], romaji: 'nǐ xiǎng huí jiǔdiàn ma', en: 'Do you want to go back to the hotel', alt: ['Would you like to return to the hotel', 'Do you want to go back to the hotel'] },
          ] },
        ],
      },
      {
        id: 'calendar',
        title: 'Days, dates & time',
        desc: 'Count to 100, name the days and say when things happen',
        facts: [FACT.language, FACT.festivals],
        dialogues: ['d-calendar-2'],
        lessons: [
          { title: '11 to 100', words: [
            ['十一', 'shíyī', 'eleven', '🔢', { note: 'Ten + one. 12 is 十二, 13 is 十三…', alt: ['11'] }],
            ['二十', 'èrshí', 'twenty', '🔢', { note: 'Two tens. 21 is 二十一, 30 is 三十.', alt: ['20'] }],
            ['五十', 'wǔshí', 'fifty', '🔢', { alt: ['50'] }],
            ['九十九', 'jiǔshíjiǔ', 'ninety-nine', '🔢', { note: 'Nine tens and nine. No special words from 11 to 99 — just stack the digits.', alt: ['99'] }],
            ['一百', 'yìbǎi', 'one hundred', '💯', { alt: ['100'] }],
          ] },
          { title: 'Minutes', words: [
            ['分', 'fēn', 'minute (on the clock)', '🕐', { note: '三点十分 = 3:10. After 点 you can drop 分 for the last digit: 三点五分 = 3:05.' }],
            ['分钟', 'fēnzhōng', 'minutes (how long)', '⏱️', { note: '十分钟 = ten minutes — a length of time, not a time on the clock.' }],
            ['一刻', 'yíkè', 'a quarter of an hour', '🕒', { note: '三点一刻 = a quarter past three (3:15). 三刻 = 3:45 on the clock.' }],
          ] },
          { title: 'Days of the week', words: [
            ['星期一', 'xīngqīyī', 'Monday', '📅', { note: '星期 + number: 星期二 is Tuesday, 星期三 Wednesday… Monday is 1.' }],
            ['星期五', 'xīngqīwǔ', 'Friday', '📅'],
            ['星期天', 'xīngqītiān', 'Sunday', '📅', { note: 'Sunday is the odd one out: 星期天 or 星期日, not "星期七".' }],
            ['今天', 'jīntiān', 'today', '☀️'],
            ['明天', 'míngtiān', 'tomorrow', '🌄'],
          ] },
          { title: 'Months & dates', words: [
            ['月', 'yuè', 'month / moon', '🌙', { note: 'Months are just numbers: 一月 January, 十一月 November. The word for "moon" is the same.' }],
            ['号', 'hào', 'day of the month', '📍', { note: 'Spoken for dates: 二十号 = the 20th. In writing you will also see 日.' }],
            ['十一月', 'shíyīyuè', 'November', '📅', { note: 'On 11/11 China holds Singles\' Day, the biggest shopping day of the year.' }],
            ['昨天', 'zuótiān', 'yesterday', '⏭️'],
          ] },
          { title: 'When?', grammar: 'time', sentences: [
            { jp: ['我', '七', '点', '半', '吃', '早饭'], romaji: 'wǒ qī diǎn bàn chī zǎofàn', en: 'I eat breakfast at 7:30', alt: ['I have breakfast at half past seven', 'I eat breakfast at half past seven', 'I have breakfast at 7:30'] },
            { jp: ['星期一', '我', '去', '北京'], romaji: 'xīngqīyī wǒ qù Běijīng', en: 'On Monday I go to Beijing', alt: ['I go to Beijing on Monday', 'I\'m going to Beijing on Monday'] },
            { jp: ['今天', '几', '号'], romaji: 'jīntiān jǐ hào', en: 'What is the date today', alt: ['What date is it today', 'What\'s the date today', 'Which day of the month is it today'] },
            { jp: ['明天', '我', '三', '点', '来'], romaji: 'míngtiān wǒ sān diǎn lái', en: 'Tomorrow I come at three', alt: ['I\'ll come at three tomorrow', 'I am coming at three tomorrow', 'I will come tomorrow at three'] },
            { jp: ['十一月', '二十', '号'], romaji: 'shíyīyuè èrshí hào', en: 'It is November 20th', alt: ['November 20th', 'The 20th of November', 'It\'s November 20th'] },
          ] },
        ],
      },
      {
        id: 'no-and-past',
        title: 'No, not & did',
        desc: 'Say what you don\'t do, don\'t have — and what you already did',
        facts: [FACT.language, FACT.modern],
        dialogues: ['d-negative-2'],
        lessons: [
          { title: 'Not', words: [
            ['不', 'bù', 'not (before a verb or adjective)', '🙅', { note: 'Says what you don\'t, won\'t or aren\'t. Changes to bú before a 4th tone: 不是 búshì.' }],
            ['没', 'méi', 'did not / have not', '❌', { note: 'The "not" for the past: 没去 = didn\'t go. Never 不 for a past event.' }],
            ['没有', 'méiyǒu', 'don\'t have / there isn\'t', '🤷', { note: 'The negative of 有: 我没有票 = I don\'t have a ticket.' }],
          ] },
          { title: 'Done!', words: [
            ['了', 'le', '(it happened / now changed)', '🏁', { note: 'Small word after the verb: 我吃了 = I ate. It marks "done", not a tense.' }],
            ['已经', 'yǐjīng', 'already', '⏱️', { note: '我已经吃了 = I\'ve already eaten.' }],
            ['还没', 'háiméi', 'not yet', '⏭️', { note: 'A great short answer: 吃了吗? → 还没. = Eaten yet? Not yet.' }],
            ['刚才', 'gāngcái', 'just now', '⌚'],
          ] },
          { title: 'I don\'t…', grammar: 'bu', sentences: [
            { jp: ['我', '不', '去'], romaji: 'wǒ bú qù', en: 'I am not going', alt: ['I\'m not going', 'I won\'t go', 'I don\'t go'] },
            { jp: ['我', '不', '喝', '咖啡'], romaji: 'wǒ bù hē kāfēi', en: 'I don\'t drink coffee', alt: ['I do not drink coffee', 'I am not drinking coffee'] },
            { jp: ['我', '不', '想', '去'], romaji: 'wǒ bù xiǎng qù', en: 'I don\'t want to go', alt: ['I do not want to go'] },
            { jp: ['我', '不', '懂'], romaji: 'wǒ bù dǒng', en: 'I don\'t understand', alt: ['I do not understand', 'I don\'t get it'] },
            { jp: ['他', '不', '是', '老师'], romaji: 'tā bú shì lǎoshī', en: 'He is not a teacher', alt: ['He\'s not a teacher', 'She is not a teacher', 'She\'s not a teacher'] },
          ] },
          { title: 'I didn\'t…', grammar: 'mei', sentences: [
            { jp: ['我', '没有', '票'], romaji: 'wǒ méiyǒu piào', en: 'I don\'t have a ticket', alt: ['I have no ticket', 'I do not have a ticket'] },
            { jp: ['我', '没', '去', '北京'], romaji: 'wǒ méi qù Běijīng', en: 'I didn\'t go to Beijing', alt: ['I did not go to Beijing', 'I haven\'t been to Beijing', 'I have not been to Beijing'] },
            { jp: ['他', '没', '来'], romaji: 'tā méi lái', en: 'He didn\'t come', alt: ['He did not come', 'She didn\'t come', 'She did not come', 'He hasn\'t come', 'He has not come'] },
            { jp: ['我', '还没', '吃', '早饭'], romaji: 'wǒ háiméi chī zǎofàn', en: 'I haven\'t eaten breakfast yet', alt: ['I have not had breakfast yet', 'I haven\'t had breakfast yet', 'I have not eaten breakfast yet'] },
          ] },
          { title: 'I did!', grammar: 'le', sentences: [
            { jp: ['我', '吃', '了'], romaji: 'wǒ chī le', en: 'I ate', alt: ['I have eaten', 'I\'ve eaten', 'I already ate', 'I have eaten it'] },
            { jp: ['我', '买', '了', '票'], romaji: 'wǒ mǎi le piào', en: 'I bought a ticket', alt: ['I bought the ticket', 'I have bought a ticket', 'I\'ve bought a ticket'] },
            { jp: ['我', '去', '了', '北京'], romaji: 'wǒ qù le Běijīng', en: 'I went to Beijing', alt: ['I have been to Beijing', 'I\'ve gone to Beijing'] },
            { jp: ['他', '来', '了'], romaji: 'tā lái le', en: 'He came', alt: ['He has come', 'He is here', 'She came', 'She has come', 'She is here', 'He\'s here', 'She\'s here'] },
            { jp: ['我', '看', '了', '熊猫'], romaji: 'wǒ kàn le xióngmāo', en: 'I saw the pandas', alt: ['I saw pandas', 'I saw a panda', 'I saw the panda', 'I have seen the pandas', 'I watched the pandas'] },
          ] },
        ],
      },
      {
        id: 'questions',
        title: 'Asking questions',
        desc: 'Who, when, why, which one, how much — ask anyone anything',
        facts: [FACT.language, FACT.modern],
        dialogues: ['d-questions-2'],
        lessons: [
          { title: 'Who, when, why', words: [
            ['谁', 'shéi', 'who', '🧍', { note: 'Also pronounced shuí. Stays where the answer goes: 他是谁? → 他是我的朋友.', alt: ['shui'] }],
            ['什么时候', 'shénme shíhou', 'when', '🕐', { note: 'Literally "what time" — goes before the verb: 你什么时候去?' }],
            ['为什么', 'wèishénme', 'why', '🤷', { note: 'Before the verb as well: 你为什么不去? = why aren\'t you going?' }],
          ] },
          { title: 'Which, how much', words: [
            ['哪个', 'nǎge', 'which one', '🎯', { note: '哪 (nǎ, 3rd tone) = which; 那 (nà, 4th tone) = that. Don\'t mix them up!' }],
            ['多少', 'duōshao', 'how much / how many', '💯', { note: 'For big or unknown amounts: 多少人? Prices use 多少钱.' }],
            ['怎么', 'zěnme', 'how', '🛣️', { note: '你怎么去? = how do you get there? 怎么了? = what\'s wrong?' }],
            ['几', 'jǐ', 'how many (small number)', '🔟', { note: 'For numbers under about ten: 几点, 几号, 几个.' }],
          ] },
          { title: 'Ask anything', grammar: 'qwords', sentences: [
            { jp: ['他', '是', '谁'], romaji: 'tā shì shéi', en: 'Who is he', alt: ['Who is she', 'Who are they', 'Who is that'] },
            { jp: ['你', '什么时候', '去'], romaji: 'nǐ shénmeshíhou qù', en: 'When are you going', alt: ['When do you go', 'When will you go'] },
            { jp: ['你', '为什么', '不', '去'], romaji: 'nǐ wèishénme bú qù', en: 'Why aren\'t you going', alt: ['Why are you not going', 'Why don\'t you go', 'Why do you not go'] },
            { jp: ['你', '要', '哪个'], romaji: 'nǐ yào nǎge', en: 'Which one do you want', alt: ['Which do you want', 'Which one would you like'] },
            { jp: ['你', '怎么', '去'], romaji: 'nǐ zěnme qù', en: 'How are you going', alt: ['How do you go', 'How do you get there', 'How will you go'] },
          ] },
          { title: 'More questions', sentences: [
            { jp: ['你', '喝', '什么'], romaji: 'nǐ hē shénme', en: 'What do you drink', alt: ['What are you drinking', 'What will you drink', 'What would you like to drink'] },
            { jp: ['苹果', '多少', '钱'], romaji: 'píngguǒ duōshao qián', en: 'How much are the apples', alt: ['How much is the apple', 'How much is an apple', 'How much are apples'] },
            { jp: ['你', '想', '吃', '什么'], romaji: 'nǐ xiǎng chī shénme', en: 'What do you want to eat', alt: ['What would you like to eat', 'What do you feel like eating'] },
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
        dialogues: ['d-niu', 'd-casual-2'],
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

  // second dialogue of each unit
  'd-hello-2': {
    title: 'Good morning, neighbour',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '早上好！', en: 'Good morning!' },
      { who: 1, jp: '早上好，你好吗？', en: 'Good morning, how are you?' },
      { who: 0, jp: '我很好，谢谢。你呢？', en: 'I\'m fine, thanks. And you?' },
      { who: 1, jp: '我也很好。', en: 'I\'m fine too.' },
    ],
    question: 'What time of day is it?',
    options: ['Morning', 'Evening', 'Night'],
    questions: [
      { question: 'What time of day is it?', options: ['Morning', 'Evening', 'Night'] },
      { question: 'How are they?', options: ['Both are fine', 'One is ill', 'Both are sorry'] },
    ],
  },
  'd-around-2': {
    title: 'Where is the restroom?',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '请问，洗手间在哪里？', en: 'Excuse me, where is the restroom?' },
      { who: 1, jp: '在左边。', en: 'It\'s on the left.' },
      { who: 0, jp: '谢谢！', en: 'Thank you!' },
      { who: 1, jp: '不客气。', en: 'You\'re welcome.' },
    ],
    question: 'Where is the restroom?',
    options: ['On the left', 'On the right', 'Straight ahead'],
    questions: [
      { question: 'Where is the restroom?', options: ['On the left', 'On the right', 'Straight ahead'] },
      { question: 'How does the first speaker begin?', options: ['With "excuse me"', 'With "goodbye"', 'With "sorry"'] },
    ],
  },
  'd-numbers-2': {
    title: 'What time is it?',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '请问，现在几点？', en: 'Excuse me, what time is it now?' },
      { who: 1, jp: '现在三点半。', en: 'It\'s half past three.' },
      { who: 0, jp: '火车几点？', en: 'What time is the train?' },
      { who: 1, jp: '四点。', en: 'At four.' },
    ],
    question: 'What time is it now?',
    options: ['3:30', '4:00', '3:00'],
    questions: [
      { question: 'What time is it now?', options: ['3:30', '4:00', '3:00'] },
      { question: 'When is the train?', options: ['At 4:00', 'At 3:30', 'At 5:00'] },
    ],
  },
  'd-food-2': {
    title: 'Not spicy',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '服务员，我要饺子。', en: 'Waiter, I\'d like dumplings.' },
      { who: 1, jp: '好的，要辣吗？', en: 'Okay, spicy?' },
      { who: 0, jp: '不要辣，谢谢。', en: 'Not spicy, thanks.' },
      { who: 1, jp: '好嘞！', en: 'You got it!' },
    ],
    question: 'What does the customer order?',
    options: ['Dumplings', 'Noodles', 'Rice'],
    questions: [
      { question: 'What does the customer order?', options: ['Dumplings', 'Noodles', 'Rice'] },
      { question: 'How does the customer want it?', options: ['Not spicy', 'Very spicy', 'Cold'] },
    ],
  },
  'd-shopping-2': {
    title: 'A bit cheaper?',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '这个多少钱？', en: 'How much is this?' },
      { who: 1, jp: '五十块。', en: '50 yuan.' },
      { who: 0, jp: '太贵了！便宜一点吧。', en: 'Too expensive! A bit cheaper, please.' },
      { who: 1, jp: '好的，四十块。', en: 'Okay, 40 yuan.' },
    ],
    question: 'What is the first price?',
    options: ['50 yuan', '40 yuan', '100 yuan'],
    questions: [
      { question: 'What is the first price?', options: ['50 yuan', '40 yuan', '100 yuan'] },
      { question: 'What is the final price?', options: ['40 yuan', '50 yuan', '30 yuan'] },
    ],
  },
  'd-hotel-2': {
    title: 'The Wi-Fi password',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '请问，无线网密码是多少？', en: 'Excuse me, what is the Wi-Fi password?' },
      { who: 1, jp: '密码是八八八八。', en: 'The password is 8888.' },
      { who: 0, jp: '谢谢。我的房间在哪里？', en: 'Thanks. Where is my room?' },
      { who: 1, jp: '在右边。', en: 'On the right.' },
    ],
    question: 'What does the guest ask about first?',
    options: ['The Wi-Fi password', 'Breakfast time', 'A taxi'],
    questions: [
      { question: 'What does the guest ask about first?', options: ['The Wi-Fi password', 'Breakfast time', 'A taxi'] },
      { question: 'Where is the room?', options: ['On the right', 'On the left', 'Straight ahead'] },
    ],
  },
  'd-eating-2': {
    title: 'An allergy',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '你好，我对花生过敏。', en: 'Hello, I\'m allergic to peanuts.' },
      { who: 1, jp: '没问题，不要花生。', en: 'No problem, no peanuts.' },
      { who: 0, jp: '谢谢！再来一瓶啤酒。', en: 'Thanks! One more beer, please.' },
    ],
    question: 'What is the customer allergic to?',
    options: ['Peanuts', 'Fish', 'Meat'],
    questions: [
      { question: 'What is the customer allergic to?', options: ['Peanuts', 'Fish', 'Meat'] },
      { question: 'What does she ask for at the end?', options: ['Another beer', 'Another tea', 'The bill'] },
    ],
  },
  'd-trains-2': {
    title: 'Is this the right train?',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '请问，这是去上海的吗？', en: 'Excuse me, is this the one to Shanghai?' },
      { who: 1, jp: '是的，三号站台。', en: 'Yes, platform 3.' },
      { who: 0, jp: '谢谢！', en: 'Thank you!' },
    ],
    question: 'Where is the train going?',
    options: ['Shanghai', 'Beijing', 'Nanjing'],
    questions: [
      { question: 'Where is the train going?', options: ['Shanghai', 'Beijing', 'Nanjing'] },
      { question: 'Which platform is it?', options: ['Platform 3', 'Platform 5', 'Platform 1'] },
    ],
  },
  'd-help-2': {
    title: 'At the pharmacy',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '你好，你怎么了？', en: 'Hello, what\'s wrong?' },
      { who: 1, jp: '我这里疼。', en: 'It hurts here.' },
      { who: 0, jp: '请等一下，这是药。', en: 'Please wait a moment — here is some medicine.' },
      { who: 1, jp: '谢谢！', en: 'Thank you!' },
    ],
    question: 'What is the customer\'s problem?',
    options: ['Something hurts', 'She is lost', 'She is hungry'],
    questions: [
      { question: 'What is the customer\'s problem?', options: ['Something hurts', 'She is lost', 'She is hungry'] },
      { question: 'What does the pharmacist give her?', options: ['Medicine', 'A ticket', 'Some tea'] },
    ],
  },
  'd-people-2': {
    title: 'My friend',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '这是我的朋友，她叫丽丽。', en: 'This is my friend, her name is Lili.' },
      { who: 1, jp: '你好，我叫安娜。', en: 'Hello, my name is Anna.' },
      { who: 0, jp: '你是学生吗？', en: 'Are you a student?' },
      { who: 1, jp: '是的，我是学生。', en: 'Yes, I\'m a student.' },
    ],
    question: 'Who is Lili?',
    options: ['The speaker\'s friend', 'A teacher', 'A driver'],
    questions: [
      { question: 'Who is Lili?', options: ['The speaker\'s friend', 'A teacher', 'A driver'] },
      { question: 'What is Anna?', options: ['A student', 'A teacher', 'A doctor'] },
    ],
  },
  'd-meals-2': {
    title: 'What do you like?',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '你喜欢吃什么？', en: 'What do you like to eat?' },
      { who: 1, jp: '我喜欢面条。你呢？', en: 'I like noodles. And you?' },
      { who: 0, jp: '我不吃肉，我喜欢鱼。', en: 'I don\'t eat meat, I like fish.' },
      { who: 1, jp: '好，我们吃鱼。', en: 'Okay, let\'s eat fish.' },
    ],
    question: 'What does the second speaker like?',
    options: ['Noodles', 'Fish', 'Dumplings'],
    questions: [
      { question: 'What does the second speaker like?', options: ['Noodles', 'Fish', 'Dumplings'] },
      { question: 'Who does not eat meat?', options: ['The one who asked first', 'The one who answered first', 'Both of them'] },
    ],
  },
  'd-world-2': {
    title: 'At the zoo',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '看！那是熊猫！', en: 'Look! That\'s a panda!' },
      { who: 1, jp: '太可爱了！你喜欢猫吗？', en: 'So cute! Do you like cats?' },
      { who: 0, jp: '我有一只猫，我也喜欢熊猫。', en: 'I have a cat, and I like pandas too.' },
    ],
    question: 'What do they see?',
    options: ['A panda', 'A bird', 'A dog'],
    questions: [
      { question: 'What do they see?', options: ['A panda', 'A bird', 'A dog'] },
      { question: 'What pet does the first speaker have?', options: ['A cat', 'A dog', 'A bird'] },
    ],
  },
  'd-casual-2': {
    title: 'Good luck!',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '明天我有考试。', en: 'I have an exam tomorrow.' },
      { who: 1, jp: '加油！', en: 'Go for it!' },
      { who: 0, jp: '谢谢！', en: 'Thanks!' },
      { who: 1, jp: '没事，你太厉害了！', en: 'No worries, you\'re amazing!' },
    ],
    question: 'What does the first speaker have tomorrow?',
    options: ['An exam', 'A trip', 'A birthday'],
    questions: [
      { question: 'What does the first speaker have tomorrow?', options: ['An exam', 'A trip', 'A birthday'] },
      { question: 'How does the friend cheer her on?', options: ['"Go for it!"', '"Good night!"', '"Sorry!"'] },
    ],
  },
  'd-verbs-2': {
    title: 'Lunch order',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '你想吃什么？', en: 'What do you want to eat?' },
      { who: 1, jp: '我想吃饺子，也想喝茶。', en: 'I want dumplings, and I want tea too.' },
      { who: 0, jp: '我也想喝茶。', en: 'I want tea too.' },
    ],
    question: 'What does the second speaker want to eat?',
    options: ['Dumplings', 'Noodles', 'Rice'],
    questions: [
      { question: 'What does the second speaker want to eat?', options: ['Dumplings', 'Noodles', 'Rice'] },
      { question: 'What do they both want to drink?', options: ['Tea', 'Beer', 'Water'] },
    ],
  },
  'd-calendar-2': {
    title: 'Making plans',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '星期五你去哪里？', en: 'Where are you going on Friday?' },
      { who: 1, jp: '我去北京。你呢？', en: 'I\'m going to Beijing. And you?' },
      { who: 0, jp: '我星期天去。', en: 'I\'m going on Sunday.' },
      { who: 1, jp: '好，星期一见！', en: 'Okay, see you on Monday!' },
    ],
    question: 'Where is the second speaker going on Friday?',
    options: ['Beijing', 'Shanghai', 'Nanjing'],
    questions: [
      { question: 'Where is the second speaker going on Friday?', options: ['Beijing', 'Shanghai', 'Nanjing'] },
      { question: 'When will they meet?', options: ['Monday', 'Friday', 'Sunday'] },
    ],
  },
  'd-negative-2': {
    title: 'Not yet',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: '你吃早饭了吗？', en: 'Have you had breakfast?' },
      { who: 1, jp: '还没，我不饿。', en: 'Not yet, I\'m not hungry.' },
      { who: 0, jp: '我吃了。你想喝茶吗？', en: 'I have. Would you like tea?' },
      { who: 1, jp: '好，我想喝茶。', en: 'Yes, I\'d like tea.' },
    ],
    question: 'Has the second speaker had breakfast?',
    options: ['Not yet', 'Yes', 'Only tea'],
    questions: [
      { question: 'Has the second speaker had breakfast?', options: ['Not yet', 'Yes', 'Only tea'] },
      { question: 'What does the second speaker want?', options: ['Tea', 'Rice', 'Coffee'] },
    ],
  },
  'd-questions-2': {
    title: 'Who is that?',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: '他是谁？', en: 'Who is he?' },
      { who: 1, jp: '他是我的老师。', en: 'He is my teacher.' },
      { who: 0, jp: '他什么时候来？', en: 'When is he coming?' },
      { who: 1, jp: '星期五。', en: 'On Friday.' },
    ],
    question: 'Who is he?',
    options: ['The speaker\'s teacher', 'A taxi driver', 'A friend'],
    questions: [
      { question: 'Who is he?', options: ['The speaker\'s teacher', 'A taxi driver', 'A friend'] },
      { question: 'When is he coming?', options: ['On Friday', 'On Monday', 'On Sunday'] },
    ],
  },
};
