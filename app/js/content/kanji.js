// Kanji, taught with the radical + mnemonic method: foundational radicals first, every kanji with
// its parts and a micro-story, then straight away in compound words (jukugo) so the readings are
// seen in real vocabulary. Lessons are woven into the course after units (see course.js).

export const RADICALS = [
  { r: '人', name: 'person', story: 'A person striding along on two legs.' },
  { r: '口', name: 'mouth / opening', story: 'An open mouth — or any box-shaped opening, like a door.' },
  { r: '木', name: 'tree', story: 'A trunk with branches reaching out and roots spreading below.' },
  { r: '氵', name: 'water', story: 'Three drops of water splashing — always on the left side of a kanji.' },
  { r: '日', name: 'sun / day', story: 'The sun, with a sunspot in the middle.' },
  { r: '田', name: 'rice field', story: 'A field split into four paddies, seen from above.' },
  { r: '力', name: 'power', story: 'An arm flexing its muscle.' },
  { r: '女', name: 'woman', story: 'A woman kneeling gracefully, arms crossed.' },
  { r: '子', name: 'child', story: 'A baby wrapped in a blanket with its arms out.' },
];

// parts: [[part, its meaning]]; words: [jp, kana, romaji, english]
export const KANJI = [
  { k: '日', meaning: 'sun, day', on: 'nichi, jitsu', kun: 'hi', parts: [['日', 'sun']], story: 'The sun itself — and one sun rising and setting makes a day.',
    words: [['日本', 'にほん', 'nihon', 'Japan'], ['日よう日', 'にちようび', 'nichiyoubi', 'Sunday']] },
  { k: '本', meaning: 'origin, book', on: 'hon', kun: 'moto', parts: [['木', 'tree'], ['一', 'line']], story: 'A tree with a line marking its roots — where things come from. Books are made from trees, so it also means book.',
    words: [['本', 'ほん', 'hon', 'book'], ['日本', 'にほん', 'nihon', 'Japan (origin of the sun)']] },
  { k: '人', meaning: 'person', on: 'jin, nin', kun: 'hito', parts: [['人', 'person']], story: 'A person walking, legs apart.',
    words: [['日本人', 'にほんじん', 'nihonjin', 'Japanese person'], ['人', 'ひと', 'hito', 'person']] },

  { k: '口', meaning: 'mouth, opening', on: 'kou', kun: 'kuchi', parts: [['口', 'mouth']], story: 'An open mouth saying "ah".',
    words: [['口', 'くち', 'kuchi', 'mouth'], ['人口', 'じんこう', 'jinkou', 'population (people mouths)']] },
  { k: '入', meaning: 'enter', on: 'nyuu', kun: 'iru, hairu', parts: [['人', 'person (flipped)']], story: 'A person stepping in through a doorway, one leg first.',
    words: [['入口', 'いりぐち', 'iriguchi', 'entrance (enter + opening)'], ['入る', 'はいる', 'hairu', 'to enter']] },
  { k: '出', meaning: 'exit, go out', on: 'shutsu', kun: 'deru', parts: [['山', 'mountain'], ['山', 'mountain']], story: 'Two mountains stacked up — climb over them to get out!',
    words: [['出口', 'でぐち', 'deguchi', 'exit (out + opening)'], ['出る', 'でる', 'deru', 'to go out']] },

  { k: '木', meaning: 'tree', on: 'moku', kun: 'ki', parts: [['木', 'tree']], story: 'A tree: trunk, branches and roots.',
    words: [['木', 'き', 'ki', 'tree'], ['木よう日', 'もくようび', 'mokuyoubi', 'Thursday']] },
  { k: '林', meaning: 'woods', on: 'rin', kun: 'hayashi', parts: [['木', 'tree'], ['木', 'tree']], story: 'Two trees side by side make a small wood.',
    words: [['林', 'はやし', 'hayashi', 'woods (also a family name)']] },
  { k: '森', meaning: 'forest', on: 'shin', kun: 'mori', parts: [['木', 'tree'], ['木', 'tree'], ['木', 'tree']], story: 'Three trees — so many that it becomes a deep forest.',
    words: [['森', 'もり', 'mori', 'forest'], ['森林', 'しんりん', 'shinrin', 'forest, woodland']] },

  { k: '水', meaning: 'water', on: 'sui', kun: 'mizu', parts: [['水', 'water']], story: 'A stream in the middle with water splashing out on both sides.',
    words: [['水', 'みず', 'mizu', 'water'], ['水よう日', 'すいようび', 'suiyoubi', 'Wednesday']] },
  { k: '酒', meaning: 'alcohol, sake', on: 'shu', kun: 'sake', parts: [['氵', 'water'], ['酉', 'jar']], story: 'Water poured from a big jar — but this water makes you merry!',
    words: [['お酒', 'おさけ', 'osake', 'alcohol'], ['日本酒', 'にほんしゅ', 'nihonshu', 'Japanese sake (Japan + alcohol)']] },
  { k: '海', meaning: 'sea', on: 'kai', kun: 'umi', parts: [['氵', 'water'], ['毎', 'every']], story: 'Water every way you look — the sea.',
    words: [['海', 'うみ', 'umi', 'sea'], ['海外', 'かいがい', 'kaigai', 'abroad (beyond the sea)']] },

  { k: '一', meaning: 'one', on: 'ichi', kun: 'hito(tsu)', parts: [['一', 'one line']], story: 'One finger held sideways.',
    words: [['一人', 'ひとり', 'hitori', 'one person, alone']] },
  { k: '二', meaning: 'two', on: 'ni', kun: 'futa(tsu)', parts: [['一', 'line'], ['一', 'line']], story: 'Two fingers, two lines.',
    words: [['二人', 'ふたり', 'futari', 'two people']] },
  { k: '三', meaning: 'three', on: 'san', kun: 'mit(tsu)', parts: [['一', 'line'], ['二', 'two']], story: 'Three lines — easy!',
    words: [['三人', 'さんにん', 'sannin', 'three people']] },

  { k: '大', meaning: 'big', on: 'dai, tai', kun: 'oo(kii)', parts: [['人', 'person'], ['一', 'arms']], story: 'A person stretching their arms out wide: "It was THIS big!"',
    words: [['大きい', 'おおきい', 'ookii', 'big'], ['大学', 'だいがく', 'daigaku', 'university (big learning)']] },
  { k: '小', meaning: 'small', on: 'shou', kun: 'chii(sai)', parts: [['亅', 'hook'], ['八', 'two drops']], story: 'A tiny hook with two crumbs falling off — something small.',
    words: [['小さい', 'ちいさい', 'chiisai', 'small']] },
  { k: '中', meaning: 'middle, inside', on: 'chuu', kun: 'naka', parts: [['口', 'box'], ['丨', 'line']], story: 'A line shot right through the middle of a box.',
    words: [['中', 'なか', 'naka', 'inside'], ['中国', 'ちゅうごく', 'chuugoku', 'China (middle country)']] },

  { k: '先', meaning: 'ahead, previous', on: 'sen', kun: 'saki', parts: [['⺧', 'cow'], ['儿', 'legs']], story: 'Legs walking ahead of the cow, leading the way.',
    words: [['先生', 'せんせい', 'sensei', 'teacher (born ahead)']] },
  { k: '生', meaning: 'life, birth', on: 'sei', kun: 'i(kiru), u(mareru)', parts: [['⺧', 'sprout'], ['土', 'ground']], story: 'A plant sprouting from the ground — new life.',
    words: [['学生', 'がくせい', 'gakusei', 'student (learning life)'], ['先生', 'せんせい', 'sensei', 'teacher']] },
  { k: '学', meaning: 'study, learning', on: 'gaku', kun: 'mana(bu)', parts: [['⺍', 'sparkles'], ['冖', 'roof'], ['子', 'child']], story: 'A child under the school roof, with ideas sparkling above.',
    words: [['学生', 'がくせい', 'gakusei', 'student'], ['大学', 'だいがく', 'daigaku', 'university']] },

  { k: '男', meaning: 'man', on: 'dan', kun: 'otoko', parts: [['田', 'rice field'], ['力', 'power']], story: 'The one with power working in the rice field — a man (in old farming days).',
    words: [['男の子', 'おとこのこ', 'otoko no ko', 'boy'], ['男', 'おとこ', 'otoko', 'man']] },
  { k: '女', meaning: 'woman', on: 'jo', kun: 'onna', parts: [['女', 'woman']], story: 'A woman kneeling gracefully.',
    words: [['女の子', 'おんなのこ', 'onna no ko', 'girl'], ['女', 'おんな', 'onna', 'woman']] },
  { k: '子', meaning: 'child', on: 'shi', kun: 'ko', parts: [['子', 'child']], story: 'A baby wrapped up with its arms out.',
    words: [['男の子', 'おとこのこ', 'otoko no ko', 'boy (man + child)'], ['女の子', 'おんなのこ', 'onna no ko', 'girl (woman + child)']] },

  { k: '手', meaning: 'hand', on: 'shu', kun: 'te', parts: [['手', 'hand']], story: 'A hand: fingers spread across the top, the wrist curling down.',
    words: [['お手洗い', 'おてあらい', 'otearai', 'toilet (hand-washing place)'], ['手', 'て', 'te', 'hand']] },

  { k: '右', meaning: 'right', on: 'u, yuu', kun: 'migi', parts: [['ナ', 'hand'], ['口', 'mouth']], story: 'A hand bringing food to the mouth — the right hand you eat with.',
    words: [['右', 'みぎ', 'migi', 'right'], ['右側', 'みぎがわ', 'migigawa', 'right side']] },
  { k: '左', meaning: 'left', on: 'sa', kun: 'hidari', parts: [['ナ', 'hand'], ['工', 'tool']], story: 'A hand holding a tool steady while the right hand works — the left hand.',
    words: [['左', 'ひだり', 'hidari', 'left'], ['左側', 'ひだりがわ', 'hidarigawa', 'left side']] },

  { k: '東', meaning: 'east', on: 'tou', kun: 'higashi', parts: [['木', 'tree'], ['日', 'sun']], story: 'The sun rising behind a tree — that way is east.',
    words: [['東口', 'ひがしぐち', 'higashiguchi', 'east exit'], ['東京', 'とうきょう', 'toukyou', 'Tokyo (eastern capital)']] },
  { k: '西', meaning: 'west', on: 'sei, sai', kun: 'nishi', parts: [['西', 'bird in its nest']], story: 'A bird settling into its nest as the sun sets in the west.',
    words: [['西口', 'にしぐち', 'nishiguchi', 'west exit'], ['西', 'にし', 'nishi', 'west']] },
  { k: '南', meaning: 'south', on: 'nan', kun: 'minami', parts: [['十', 'cross'], ['冂', 'hut'], ['¥', 'yen sign (looks like it)']], story: 'A hut with a ¥ sign inside — rich and sunny, down south.',
    words: [['南口', 'みなみぐち', 'minamiguchi', 'south exit'], ['南', 'みなみ', 'minami', 'south']] },
  { k: '北', meaning: 'north', on: 'hoku', kun: 'kita', parts: [['北', 'two people back to back']], story: 'Two people sitting back to back, turning away from the cold north wind.',
    words: [['北口', 'きたぐち', 'kitaguchi', 'north exit'], ['北海道', 'ほっかいどう', 'hokkaidou', 'Hokkaido (northern island)']] },

  { k: '電', meaning: 'electricity', on: 'den', kun: '', parts: [['雨', 'rain'], ['田', 'field'], ['乚', 'tail']], story: 'Rain over a field — and a lightning bolt with a tail. Electricity!',
    words: [['電車', 'でんしゃ', 'densha', 'train (electric car)'], ['電話', 'でんわ', 'denwa', 'phone']] },
  { k: '車', meaning: 'car, vehicle', on: 'sha', kun: 'kuruma', parts: [['車', 'cart']], story: 'A cart seen from above: the body in the middle, an axle through it.',
    words: [['車', 'くるま', 'kuruma', 'car'], ['電車', 'でんしゃ', 'densha', 'train']] },
  { k: '駅', meaning: 'station', on: 'eki', kun: '', parts: [['馬', 'horse'], ['尺', 'measure']], story: 'Where horses were changed after a measured distance — a station.',
    words: [['駅', 'えき', 'eki', 'station']] },

  { k: '円', meaning: 'yen, circle', on: 'en', kun: 'maru(i)', parts: [['冂', 'frame'], ['一', 'line']], story: 'A coin in a frame — money, yen.',
    words: [['百円', 'ひゃくえん', 'hyaku en', '100 yen'], ['円', 'えん', 'en', 'yen']] },
  { k: '何', meaning: 'what', on: 'ka', kun: 'nani, nan', parts: [['亻', 'person'], ['可', 'can']], story: 'A person asking "can I…? what?"',
    words: [['何', 'なに', 'nani', 'what'], ['何時', 'なんじ', 'nanji', 'what time']] },
  { k: '時', meaning: 'time, hour', on: 'ji', kun: 'toki', parts: [['日', 'sun'], ['寺', 'temple']], story: 'The temple bell rings as the sun moves — telling the time.',
    words: [['何時', 'なんじ', 'nanji', 'what time'], ['時', 'とき', 'toki', 'time']] },
];

// Lessons in teaching order: the signs a traveller meets first (exits, toilets, stations,
// directions, prices), then everyday kanji. Radicals are explained inside each kanji's parts.
// `unit` pins a lesson to the unit it belongs with (numbers, trains); the others are spread out.
export const KANJI_LESSONS = [
  { title: 'Kanji: Japan', kanji: ['日', '本', '人'] },
  { title: 'Kanji: entrance & exit', kanji: ['口', '入', '出'] },
  { title: 'Kanji: toilets', kanji: ['男', '女', '手'] },
  { title: 'Kanji: trains', kanji: ['電', '車', '駅'], unit: 'trains' },
  { title: 'Kanji: left & right', kanji: ['右', '左', '中'] },
  { title: 'Kanji: station exits', kanji: ['東', '西', '南', '北'], unit: 'trains' },
  { title: 'Kanji: money & time', kanji: ['円', '何', '時'], unit: 'numbers' },
  { title: 'Kanji: one, two, three', kanji: ['一', '二', '三'], unit: 'numbers' },
  { title: 'Kanji: big & small', kanji: ['大', '小', '子'] },
  { title: 'Kanji: water & sake', kanji: ['水', '酒', '海'] },
  { title: 'Kanji: school', kanji: ['先', '生', '学'] },
  { title: 'Kanji: trees', kanji: ['木', '林', '森'] },
];
