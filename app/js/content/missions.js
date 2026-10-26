// Real-world missions: short role-plays at the end of each section 1 unit. Each step is a line from
// the other person (who: cast key, jp/romaji/en) and/or a prompt, then replies to pick from. A reply
// is { jp, romaji, en, ok, note } — note explains a wrong (or funny) choice; replies with only `en`
// check understanding of what was said. Unlocked once the unit's lessons are done.
const R = (jp, romaji, en, ok = false, note = '') => ({ jp, romaji, en, ok, note });
const E = (en, ok = false, note = '') => ({ en, ok, note });

export const MISSIONS = [
  {
    id: 'meet-mika', unit: 'tokyo-hello', art: '🏮', title: 'Meet your host',
    setting: 'You arrive at your homestay in Tokyo. Mika opens the door.',
    reward: 'Mika welcomes you in — you made a great first impression!',
    steps: [
      { who: 'woman2', jp: 'はじめまして！ミカです。', romaji: 'hajimemashite! mika desu', en: 'Nice to meet you! I\'m Mika.',
        replies: [R('はじめまして', 'hajimemashite', 'nice to meet you', true), R('おやすみなさい', 'oyasuminasai', 'good night', false, 'That\'s "good night" — you just arrived!'), R('じゃあね', 'jaa ne', 'bye', false, 'That\'s "bye" — leaving already?')] },
      { who: 'woman2', jp: 'おげんきですか。', romaji: 'ogenki desu ka', en: 'How are you?',
        replies: [R('げんきです', 'genki desu', 'I am well', true), R('いいえ', 'iie', 'no', false, '"No" is a strange answer to "how are you?"'), R('もしもし', 'moshi moshi', 'hello (phone)', false, 'That\'s how you say hello on the phone.')] },
      { who: 'woman2', jp: 'これ、どうぞ。', romaji: 'kore, douzo', en: 'Here, this is for you. 🎁',
        replies: [R('ありがとうございます', 'arigatou gozaimasu', 'thank you (polite)', true), R('おはようございます', 'ohayou gozaimasu', 'good morning', false, 'That\'s "good morning" — say thank you for the gift!'), R('はい', 'hai', 'yes', false, '"Yes"… then say thank you!')] },
      { who: 'woman2', jp: 'おやすみなさい！', romaji: 'oyasuminasai', en: 'Good night!',
        replies: [R('おやすみなさい', 'oyasuminasai', 'good night', true), R('こんにちは', 'konnichiwa', 'hello', false, '"Hello" at bedtime? Say good night!'), R('おはようございます', 'ohayou gozaimasu', 'good morning', false, 'Not yet — that\'s for tomorrow morning!')] },
    ],
  },
  {
    id: 'find-station', unit: 'tokyo-around', art: '🗺️', title: 'Lost in Shinjuku',
    setting: 'You need the station, but the streets all look the same. You stop Yuki, a passer-by.',
    reward: 'You found the station — and the right exit!',
    steps: [
      { prompt: 'Get her attention politely.',
        replies: [R('すみません', 'sumimasen', 'excuse me', true), R('またね', 'mata ne', 'see you', false, '"See you" — you only just met!'), R('いいえ', 'iie', 'no', false, '"No" — a confusing way to start!')] },
      { who: 'woman', jp: 'はい？', romaji: 'hai?', en: 'Yes?',
        replies: [R('えきはどこですか', 'eki wa doko desu ka', 'where is the station?', true), R('トイレはどこですか', 'toire wa doko desu ka', 'where is the toilet?', false, 'That asks for the toilet!'), R('ホテルはどこですか', 'hoteru wa doko desu ka', 'where is the hotel?', false, 'That asks for the hotel.')] },
      { who: 'woman', jp: 'まっすぐです。それから、みぎです。', romaji: 'massugu desu. sorekara, migi desu', en: 'Straight ahead. Then, to the right.', prompt: 'Which way do you go?',
        replies: [E('⬆️ Straight, then ➡️ right', true), E('⬆️ Straight, then ⬅️ left', false, 'ひだり is left — she said みぎ (right).'), E('⬅️ Left, then ⬆️ straight', false, 'まっすぐ (straight) came first, then みぎ (right).')] },
      { prompt: 'Thank her politely.',
        replies: [R('ありがとうございます', 'arigatou gozaimasu', 'thank you (polite)', true), R('おやすみなさい', 'oyasuminasai', 'good night', false, '"Good night" — it\'s the middle of the day!'), R('もしもし', 'moshi moshi', 'hello (phone)', false, 'That\'s for the phone.')] },
    ],
  },
  {
    id: 'cafe', unit: 'tokyo-food', art: '☕', title: 'Café order',
    setting: 'You walk into a little café. Mika works here!',
    reward: 'Coffee, thanks and the bill — like a local!',
    steps: [
      { who: 'woman2', jp: 'いらっしゃいませ！', romaji: 'irasshaimase!', en: 'Welcome! (what shops say)',
        replies: [R('こんにちは', 'konnichiwa', 'hello', true, 'A friendly hello works — or just a smile and a nod.'), R('ごちそうさまでした', 'gochisousama deshita', 'thanks for the meal', false, 'That\'s for after you eat!'), R('いただきます', 'itadakimasu', 'said before eating', false, 'The food isn\'t here yet!')] },
      { who: 'woman2', jp: 'なにに しますか。', romaji: 'nani ni shimasu ka', en: 'What would you like?',
        replies: [R('コーヒーをください', 'koohii o kudasai', 'coffee please', true), R('おかいけいをおねがいします', 'okaikei o onegaishimasu', 'the bill please', false, 'The bill? You haven\'t ordered yet!'), R('からい', 'karai', 'spicy', false, '"Spicy" — not a drink!')] },
      { who: 'woman2', jp: 'ホットですか、アイスですか。', romaji: 'hotto desu ka, aisu desu ka', en: 'Hot or iced?',
        replies: [R('ホット', 'hotto', 'hot', true), R('アイス', 'aisu', 'iced', true), R('おゆ', 'oyu', 'hot water', false, 'That\'s a cup of plain hot water!')] },
      { who: 'woman2', jp: 'どうぞ。', romaji: 'douzo', en: 'Here you go. ☕', prompt: 'What do you say before you drink?',
        replies: [R('いただきます', 'itadakimasu', 'said before eating', true), R('ごちそうさまでした', 'gochisousama deshita', 'thanks for the meal', false, 'That\'s for when you have finished!'), R('かんぱい', 'kanpai', 'cheers!', false, '"Cheers!" — but you\'re drinking alone!')] },
      { prompt: 'Delicious! Tell Mika.',
        replies: [R('とてもおいしいです', 'totemo oishii desu', 'it is very good', true), R('からい', 'karai', 'spicy', false, 'A spicy coffee? Say it\'s delicious!'), R('わかりません', 'wakarimasen', 'I don\'t understand', false, 'Say it\'s delicious: とてもおいしいです.')] },
      { prompt: 'Time to go. Ask for the bill.',
        replies: [R('おかいけいをおねがいします', 'okaikei o onegaishimasu', 'the bill please', true), R('これをください', 'kore o kudasai', 'this please', false, 'That orders something else!'), R('ビールとみず', 'biiru to mizu', 'beer and water', false, 'More drinks? Ask for the bill!')] },
      { prompt: 'On the way out, thank them for the meal.',
        replies: [R('ごちそうさまでした', 'gochisousama deshita', 'thanks for the meal', true), R('いただきます', 'itadakimasu', 'said before eating', false, 'That\'s for before — now it\'s ごちそうさまでした.'), R('はじめまして', 'hajimemashite', 'nice to meet you', false, 'You met already!')] },
    ],
  },
  {
    id: 'konbini', unit: 'tokyo-shopping', art: '🍙', title: 'Konbini run',
    setting: 'Late night snack! You take a rice ball to the counter of a convenience store.',
    reward: 'Onigiri secured — and paid by card!',
    steps: [
      { who: 'woman', jp: 'いらっしゃいませ！', romaji: 'irasshaimase!', en: 'Welcome!', prompt: 'Ask how much the rice ball is.',
        replies: [R('これはいくらですか', 'kore wa ikura desu ka', 'how much is this?', true), R('たすけて', 'tasukete', 'help!', false, '"Help!" — a bit dramatic for a rice ball!'), R('カードでおねがいします', 'kaado de onegaishimasu', 'by card please', false, 'You don\'t know the price yet!')] },
      { who: 'woman', jp: '150えんです。', romaji: 'hyaku gojuu en desu', en: 'It\'s 150 yen.', prompt: 'How much is it?',
        replies: [E('150 yen', true), E('500 yen', false, 'ひゃくごじゅう = 150.'), E('1,500 yen', false, 'Cheaper than that: ひゃくごじゅう = 150.')] },
      { who: 'woman', jp: 'ふくろ、いりますか。', romaji: 'fukuro, irimasu ka', en: 'Do you need a bag?',
        replies: [R('いいえ、だいじょうぶです', 'iie, daijoubu desu', 'no, it\'s okay', true), R('わかりません', 'wakarimasen', 'I don\'t understand', true, 'Honest! She shows you a bag, and you shake your head. 😄'), R('いただきます', 'itadakimasu', 'said before eating', false, 'Not yet — pay first!')] },
      { prompt: 'Pay by card.',
        replies: [R('カードでおねがいします', 'kaado de onegaishimasu', 'by card please', true), R('げんき', 'genki', 'well / healthy', false, '"Healthy" — close to げんきん (cash), but you wanted card!'), R('おかいけい', 'okaikei', 'the bill', false, 'That\'s for restaurants — say カードでおねがいします.')] },
      { who: 'woman', jp: 'ありがとうございました！', romaji: 'arigatou gozaimashita', en: 'Thank you very much!',
        replies: [R('どうも', 'doumo', 'thanks', true), R('ありがとうございます', 'arigatou gozaimasu', 'thank you', true), R('はじめまして', 'hajimemashite', 'nice to meet you', false, 'You\'re leaving — just say thanks!')] },
    ],
  },
  {
    id: 'check-in', unit: 'tokyo-hotel', art: '🏨', title: 'Hotel check-in',
    setting: 'After a long flight you reach your hotel in Shinjuku. Yuki is at the front desk.',
    reward: 'Key in hand, Wi-Fi on, breakfast at 7 — time to rest!',
    steps: [
      { who: 'woman', jp: 'いらっしゃいませ！', romaji: 'irasshaimase!', en: 'Welcome!', prompt: 'Tell her you have a reservation.',
        replies: [R('よやくがあります', 'yoyaku ga arimasu', 'I have a reservation', true), R('へやはどこですか', 'heya wa doko desu ka', 'where is the room?', false, 'Not yet — check in first!'), R('おかいけい', 'okaikei', 'the bill', false, 'That\'s for restaurants.')] },
      { who: 'woman', jp: 'パスポートをおねがいします。', romaji: 'pasupooto o onegaishimasu', en: 'Your passport, please.', prompt: 'What does she want?',
        replies: [E('🛂 Your passport', true), E('💳 Your card', false, 'パスポート = passport (English said the Japanese way).'), E('🔑 The key', false, 'She asks for your パスポート (passport).')] },
      { who: 'woman', jp: 'こちらが かぎです。', romaji: 'kochira ga kagi desu', en: 'Here is your key.',
        replies: [R('ありがとうございます', 'arigatou gozaimasu', 'thank you', true), R('いただきます', 'itadakimasu', 'said before eating', false, 'You can\'t eat a key! Say thank you.'), R('すみません', 'sumimasen', 'excuse me', false, 'Say thank you — ありがとうございます.')] },
      { prompt: 'Ask for the Wi-Fi password.',
        replies: [R('ワイファイのパスワードは？', 'waifai no pasuwaado wa?', 'the Wi-Fi password?', true), R('あさごはんはなんじですか', 'asagohan wa nanji desu ka', 'what time is breakfast?', false, 'That asks about breakfast — next question!'), R('にもつ', 'nimotsu', 'luggage', false, '"Luggage"? Ask for the パスワード.')] },
      { prompt: 'Now ask what time breakfast is.',
        replies: [R('あさごはんはなんじですか', 'asagohan wa nanji desu ka', 'what time is breakfast?', true), R('おやすみなさい', 'oyasuminasai', 'good night', false, 'A bit early for bed — ask about breakfast!'), R('かぎをください', 'kagi o kudasai', 'the key please', false, 'You already have the key!')] },
      { who: 'woman', jp: '7じからです。', romaji: 'shichi-ji kara desu', en: 'From 7 o\'clock.', prompt: 'When is breakfast?',
        replies: [E('🕖 From 7 o\'clock', true), E('🕘 From 9 o\'clock', false, 'しち (7) じ (o\'clock) から (from).'), E('🕚 Until 11 o\'clock', false, 'から means "from": from 7.')] },
    ],
  },
];
