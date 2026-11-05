// Hanzi (simplified Chinese characters), taught with the radical + mnemonic method: every character
// with its parts and a micro-story, then straight away in common words so the pinyin is seen in real
// vocabulary. Same shapes as ../kanji.js: `on` holds the pinyin with tone mark, `kun` is unused ('').
// Lessons are woven into the course after units (see course.js) via their `unit` pin.

export const RADICALS = [];

// parts: [[part, its meaning]]; words: [hanzi, pinyin, pinyin, english]
export const KANJI = [
  // hello
  { k: '中', meaning: 'middle, China', on: 'zhōng', kun: '', parts: [['口', 'box'], ['丨', 'line']], story: 'An arrow shot straight through the middle of a box — China saw itself as the Middle Kingdom.',
    words: [['中国', 'zhōngguó', 'zhōngguó', 'China (middle kingdom)'], ['中文', 'zhōngwén', 'zhōngwén', 'Chinese language']] },
  { k: '国', meaning: 'country', on: 'guó', kun: '', parts: [['囗', 'border'], ['玉', 'jade']], story: 'Precious jade guarded inside a border wall — that is a country.',
    words: [['中国', 'zhōngguó', 'zhōngguó', 'China'], ['外国人', 'wàiguórén', 'wàiguórén', 'foreigner']] },
  { k: '人', meaning: 'person', on: 'rén', kun: '', parts: [['人', 'person']], story: 'A person striding along on two legs.',
    words: [['中国人', 'zhōngguórén', 'zhōngguórén', 'Chinese person'], ['人', 'rén', 'rén', 'person']] },
  { k: '你', meaning: 'you', on: 'nǐ', kun: '', parts: [['亻', 'person'], ['尔', 'you']], story: 'The person standing next to you, pointing back — "you!"',
    words: [['你好', 'nǐhǎo', 'nǐhǎo', 'hello'], ['你们', 'nǐmen', 'nǐmen', 'you (plural)']] },
  { k: '好', meaning: 'good', on: 'hǎo', kun: '', parts: [['女', 'woman'], ['子', 'child']], story: 'A woman holding her child — all is good.',
    words: [['你好', 'nǐhǎo', 'nǐhǎo', 'hello (you good)'], ['好吃', 'hǎochī', 'hǎochī', 'delicious']] },

  // around
  { k: '入', meaning: 'enter', on: 'rù', kun: '', parts: [['入', 'person stepping in']], story: 'A person stepping in through a doorway, one leg first.',
    words: [['入口', 'rùkǒu', 'rùkǒu', 'entrance (enter + mouth)']] },
  { k: '出', meaning: 'go out', on: 'chū', kun: '', parts: [['山', 'mountain'], ['山', 'mountain']], story: 'Two mountains stacked up — climb over them to get out!',
    words: [['出口', 'chūkǒu', 'chūkǒu', 'exit (out + mouth)'], ['出租车', 'chūzūchē', 'chūzūchē', 'taxi']] },
  { k: '口', meaning: 'mouth, opening', on: 'kǒu', kun: '', parts: [['口', 'mouth']], story: 'An open mouth saying "ah" — or any doorway you pass through.',
    words: [['出口', 'chūkǒu', 'chūkǒu', 'exit'], ['人口', 'rénkǒu', 'rénkǒu', 'population (people mouths)']] },
  { k: '男', meaning: 'man, male', on: 'nán', kun: '', parts: [['田', 'field'], ['力', 'power']], story: 'Power in the rice field — the man doing the ploughing.',
    words: [['男', 'nán', 'nán', 'men (toilet sign)'], ['男人', 'nánrén', 'nánrén', 'man']] },
  { k: '女', meaning: 'woman, female', on: 'nǚ', kun: '', parts: [['女', 'woman']], story: 'A woman kneeling gracefully, arms crossed.',
    words: [['女', 'nǚ', 'nǚ', 'women (toilet sign)'], ['女人', 'nǚrén', 'nǚrén', 'woman']] },
  { k: '左', meaning: 'left', on: 'zuǒ', kun: '', parts: [['𠂇', 'hand'], ['工', 'tool']], story: 'The hand that holds the carpenter\'s tool steady is the left one.',
    words: [['左', 'zuǒ', 'zuǒ', 'left'], ['左边', 'zuǒbian', 'zuǒbian', 'left side']] },
  { k: '右', meaning: 'right', on: 'yòu', kun: '', parts: [['𠂇', 'hand'], ['口', 'mouth']], story: 'The hand that feeds your mouth is the right one.',
    words: [['右', 'yòu', 'yòu', 'right'], ['右边', 'yòubian', 'yòubian', 'right side']] },

  // food
  { k: '水', meaning: 'water', on: 'shuǐ', kun: '', parts: [['水', 'water']], story: 'A stream in the middle with splashes flying off both sides.',
    words: [['水', 'shuǐ', 'shuǐ', 'water'], ['开水', 'kāishuǐ', 'kāishuǐ', 'boiled water']] },
  { k: '茶', meaning: 'tea', on: 'chá', kun: '', parts: [['艹', 'grass'], ['人', 'person'], ['木', 'tree']], story: 'A person sitting between the grass above and the tree below, sipping leaf tea.',
    words: [['茶', 'chá', 'chá', 'tea'], ['绿茶', 'lǜchá', 'lǜchá', 'green tea']] },
  { k: '酒', meaning: 'alcohol', on: 'jiǔ', kun: '', parts: [['氵', 'water'], ['酉', 'wine jar']], story: 'The water that comes out of the wine jar is alcohol.',
    words: [['酒', 'jiǔ', 'jiǔ', 'alcohol'], ['啤酒', 'píjiǔ', 'píjiǔ', 'beer']] },

  // shopping
  { k: '元', meaning: 'yuan (money)', on: 'yuán', kun: '', parts: [['二', 'two'], ['儿', 'legs']], story: 'Two coins balanced on a pair of legs, walking out of your wallet — one yuan.',
    words: [['元', 'yuán', 'yuán', 'yuan'], ['十元', 'shíyuán', 'shíyuán', 'ten yuan']] },
  { k: '钱', meaning: 'money', on: 'qián', kun: '', parts: [['钅', 'metal'], ['戋', 'small slices']], story: 'Metal cut into small slices: coins, money.',
    words: [['钱', 'qián', 'qián', 'money'], ['多少钱', 'duōshao qián', 'duōshao qián', 'how much?']] },
  { k: '开', meaning: 'open', on: 'kāi', kun: '', parts: [['一', 'bar'], ['廾', 'two hands']], story: 'Two hands lift the bar off the gate: open!',
    words: [['开', 'kāi', 'kāi', 'open'], ['开门', 'kāimén', 'kāimén', 'to open the door']] },
  { k: '关', meaning: 'close, shut', on: 'guān', kun: '', parts: [['丷', 'two bolts'], ['天', 'big gate']], story: 'Two bolts slide across the top of the big gate: it\'s shut.',
    words: [['关', 'guān', 'guān', 'close'], ['关门', 'guānmén', 'guānmén', 'closed (shut door)']] },
  { k: '推', meaning: 'push', on: 'tuī', kun: '', parts: [['扌', 'hand'], ['隹', 'bird']], story: 'Your hand pushes the bird off the branch — fly!',
    words: [['推', 'tuī', 'tuī', 'push (door sign)']] },
  { k: '拉', meaning: 'pull', on: 'lā', kun: '', parts: [['扌', 'hand'], ['立', 'stand']], story: 'Your hand pulls a fallen friend back up to stand.',
    words: [['拉', 'lā', 'lā', 'pull (door sign)'], ['拉面', 'lāmiàn', 'lāmiàn', 'hand-pulled noodles']] },
  { k: '门', meaning: 'door, gate', on: 'mén', kun: '', parts: [['门', 'door']], story: 'A swing door seen from the front, with a little handle at the top.',
    words: [['门', 'mén', 'mén', 'door'], ['门口', 'ménkǒu', 'ménkǒu', 'doorway']] },

  // numbers
  { k: '一', meaning: 'one', on: 'yī', kun: '', parts: [['一', 'one line']], story: 'One finger lying flat.',
    words: [['一', 'yī', 'yī', 'one'], ['一位', 'yíwèi', 'yíwèi', 'one person (polite)']] },
  { k: '二', meaning: 'two', on: 'èr', kun: '', parts: [['二', 'two lines']], story: 'Two fingers lying flat.',
    words: [['二', 'èr', 'èr', 'two'], ['二十', 'èrshí', 'èrshí', 'twenty']] },
  { k: '三', meaning: 'three', on: 'sān', kun: '', parts: [['三', 'three lines']], story: 'Three fingers lying flat.',
    words: [['三', 'sān', 'sān', 'three'], ['三十', 'sānshí', 'sānshí', 'thirty']] },
  { k: '十', meaning: 'ten', on: 'shí', kun: '', parts: [['十', 'cross']], story: 'Two hands crossed — all ten fingers.',
    words: [['十', 'shí', 'shí', 'ten'], ['十元', 'shíyuán', 'shíyuán', 'ten yuan']] },

  // hotel
  { k: '上', meaning: 'up, above', on: 'shàng', kun: '', parts: [['一', 'ground'], ['卜', 'mark pointing up']], story: 'A little flag planted on the ground, pointing up.',
    words: [['上', 'shàng', 'shàng', 'up (lift button)'], ['楼上', 'lóushàng', 'lóushàng', 'upstairs']] },
  { k: '下', meaning: 'down, below', on: 'xià', kun: '', parts: [['一', 'ceiling'], ['卜', 'mark hanging down']], story: 'A lamp hanging down from the ceiling.',
    words: [['下', 'xià', 'xià', 'down (lift button)'], ['楼下', 'lóuxià', 'lóuxià', 'downstairs']] },
  { k: '大', meaning: 'big', on: 'dà', kun: '', parts: [['人', 'person'], ['一', 'outstretched arms']], story: 'A person stretching their arms wide: "it was THIS big!"',
    words: [['大', 'dà', 'dà', 'big'], ['大杯', 'dàbēi', 'dàbēi', 'large cup']] },
  { k: '小', meaning: 'small', on: 'xiǎo', kun: '', parts: [['小', 'three small drops']], story: 'A tiny hook with two crumbs beside it — everything here is small.',
    words: [['小', 'xiǎo', 'xiǎo', 'small'], ['小杯', 'xiǎobēi', 'xiǎobēi', 'small cup']] },

  // eating-out
  { k: '米', meaning: 'rice (grain)', on: 'mǐ', kun: '', parts: [['米', 'rice plant']], story: 'Grains of rice scattered from a crossed-over rice stalk.',
    words: [['米饭', 'mǐfàn', 'mǐfàn', 'cooked rice'], ['米', 'mǐ', 'mǐ', 'rice; metre']] },
  { k: '面', meaning: 'noodles, face', on: 'miàn', kun: '', parts: [['面', 'face in a frame']], story: 'A face framed in a window, slurping a bowl of noodles.',
    words: [['面条', 'miàntiáo', 'miàntiáo', 'noodles'], ['牛肉面', 'niúròumiàn', 'niúròumiàn', 'beef noodle soup']] },
  { k: '肉', meaning: 'meat', on: 'ròu', kun: '', parts: [['冂', 'frame'], ['人', 'person'], ['人', 'person']], story: 'A rack of meat on the hook, with the marbling drawn twice.',
    words: [['肉', 'ròu', 'ròu', 'meat'], ['牛肉', 'niúròu', 'niúròu', 'beef']] },
  { k: '菜', meaning: 'vegetable, dish', on: 'cài', kun: '', parts: [['艹', 'grass'], ['采', 'hand picking from a tree']], story: 'A hand picking green leaves from the plant: vegetables — and any dish on the menu.',
    words: [['菜', 'cài', 'cài', 'dish; vegetable'], ['菜单', 'càidān', 'càidān', 'menu']] },

  // trains
  { k: '车', meaning: 'vehicle, car', on: 'chē', kun: '', parts: [['车', 'cart seen from above']], story: 'A cart seen from above: the axle through the middle and a wheel on each side.',
    words: [['火车', 'huǒchē', 'huǒchē', 'train (fire vehicle)'], ['出租车', 'chūzūchē', 'chūzūchē', 'taxi']] },
  { k: '站', meaning: 'station, stand', on: 'zhàn', kun: '', parts: [['立', 'stand'], ['占', 'occupy']], story: 'The spot where you stand and occupy a place to wait: a station.',
    words: [['车站', 'chēzhàn', 'chēzhàn', 'station'], ['火车站', 'huǒchēzhàn', 'huǒchēzhàn', 'railway station']] },
  { k: '地', meaning: 'ground, earth', on: 'dì', kun: '', parts: [['土', 'earth'], ['也', 'also']], story: 'Earth, and also more earth — the ground beneath your feet.',
    words: [['地铁', 'dìtiě', 'dìtiě', 'metro (ground iron)'], ['地图', 'dìtú', 'dìtú', 'map']] },
  { k: '铁', meaning: 'iron', on: 'tiě', kun: '', parts: [['钅', 'metal'], ['失', 'lose']], story: 'The metal that loses its shine to rust: iron.',
    words: [['地铁', 'dìtiě', 'dìtiě', 'metro, subway'], ['高铁', 'gāotiě', 'gāotiě', 'high-speed rail']] },
  { k: '东', meaning: 'east', on: 'dōng', kun: '', parts: [['东', 'sun behind a tree']], story: 'Once a sun rising behind a tree — sunrise is in the east.',
    words: [['东', 'dōng', 'dōng', 'east'], ['东西', 'dōngxi', 'dōngxi', 'thing, stuff (east-west)']] },
  { k: '西', meaning: 'west', on: 'xī', kun: '', parts: [['西', 'bird on its nest']], story: 'A bird settling into its nest as the sun sets in the west.',
    words: [['西', 'xī', 'xī', 'west'], ['西安', 'xī\'ān', 'xī\'ān', 'Xi\'an (western peace)']] },
  { k: '南', meaning: 'south', on: 'nán', kun: '', parts: [['十', 'ten'], ['冂', 'frame'], ['丷', 'horns'], ['干', 'dry']], story: 'Ten frames of crops drying in the warm southern sun.',
    words: [['南', 'nán', 'nán', 'south'], ['南京', 'nánjīng', 'nánjīng', 'Nanjing (southern capital)']] },
  { k: '北', meaning: 'north', on: 'běi', kun: '', parts: [['北', 'two people back to back']], story: 'Two people sitting back to back, turning away from the cold north wind.',
    words: [['北', 'běi', 'běi', 'north'], ['北京', 'běijīng', 'běijīng', 'Beijing (northern capital)']] },

  // help
  { k: '医', meaning: 'medicine, doctor', on: 'yī', kun: '', parts: [['匚', 'box'], ['矢', 'arrow']], story: 'An arrow pulled out and locked away in the doctor\'s box.',
    words: [['医院', 'yīyuàn', 'yīyuàn', 'hospital'], ['医生', 'yīshēng', 'yīshēng', 'doctor']] },
  { k: '院', meaning: 'courtyard, institution', on: 'yuàn', kun: '', parts: [['阝', 'hill'], ['完', 'complete']], story: 'A complete compound built by the hill: a courtyard, a hospital.',
    words: [['医院', 'yīyuàn', 'yīyuàn', 'hospital'], ['电影院', 'diànyǐngyuàn', 'diànyǐngyuàn', 'cinema']] },
  { k: '药', meaning: 'medicine (drug)', on: 'yào', kun: '', parts: [['艹', 'grass'], ['约', 'measured thread']], story: 'Herbs (grass) weighed out by careful measure: medicine.',
    words: [['药', 'yào', 'yào', 'medicine'], ['药店', 'yàodiàn', 'yàodiàn', 'pharmacy']] },
  { k: '禁', meaning: 'forbid', on: 'jìn', kun: '', parts: [['林', 'woods'], ['示', 'altar']], story: 'An altar hidden in the sacred woods — entry forbidden!',
    words: [['禁止', 'jìnzhǐ', 'jìnzhǐ', 'prohibited'], ['禁烟', 'jìnyān', 'jìnyān', 'no smoking']] },
  { k: '止', meaning: 'stop', on: 'zhǐ', kun: '', parts: [['止', 'footprint']], story: 'A footprint planted firmly on the ground: stop right there.',
    words: [['禁止', 'jìnzhǐ', 'jìnzhǐ', 'prohibited (forbid + stop)']] },
  { k: '烟', meaning: 'smoke, cigarette', on: 'yān', kun: '', parts: [['火', 'fire'], ['因', 'cause']], story: 'Fire is the cause of smoke.',
    words: [['吸烟', 'xīyān', 'xīyān', 'to smoke'], ['禁止吸烟', 'jìnzhǐxīyān', 'jìnzhǐxīyān', 'no smoking']] },

  // people
  { k: '老', meaning: 'old', on: 'lǎo', kun: '', parts: [['耂', 'old man'], ['匕', 'bent figure']], story: 'An old man with long hair, bent over his walking stick.',
    words: [['老师', 'lǎoshī', 'lǎoshī', 'teacher'], ['老人', 'lǎorén', 'lǎorén', 'elderly person']] },
  { k: '师', meaning: 'master, teacher', on: 'shī', kun: '', parts: [['丨', 'line'], ['帀', 'wrap around']], story: 'A line of students wrapped around their master.',
    words: [['老师', 'lǎoshī', 'lǎoshī', 'teacher'], ['师傅', 'shīfu', 'shīfu', 'master (polite for drivers, cooks)']] },
  { k: '学', meaning: 'study', on: 'xué', kun: '', parts: [['⺍', 'sparks'], ['冖', 'roof'], ['子', 'child']], story: 'Sparks of ideas flying above a child under the school roof.',
    words: [['学生', 'xuésheng', 'xuésheng', 'student'], ['学校', 'xuéxiào', 'xuéxiào', 'school']] },
  { k: '生', meaning: 'life, be born', on: 'shēng', kun: '', parts: [['生', 'sprout from the earth']], story: 'A sprout pushing up through the earth into life.',
    words: [['学生', 'xuésheng', 'xuésheng', 'student'], ['先生', 'xiānsheng', 'xiānsheng', 'Mr., sir']] },

  // meals
  { k: '火', meaning: 'fire', on: 'huǒ', kun: '', parts: [['火', 'flames']], story: 'A campfire with sparks leaping out on both sides.',
    words: [['火锅', 'huǒguō', 'huǒguō', 'hot pot (fire pot)'], ['火车', 'huǒchē', 'huǒchē', 'train']] },
  { k: '鱼', meaning: 'fish', on: 'yú', kun: '', parts: [['⺈', 'head'], ['田', 'scaly body'], ['一', 'tail']], story: 'A fish swimming down the page: head on top, scaly body, flat tail.',
    words: [['鱼', 'yú', 'yú', 'fish'], ['烤鱼', 'kǎoyú', 'kǎoyú', 'grilled fish']] },
  { k: '鸡', meaning: 'chicken', on: 'jī', kun: '', parts: [['又', 'hand'], ['鸟', 'bird']], story: 'The bird you can catch with one hand: a chicken.',
    words: [['鸡', 'jī', 'jī', 'chicken'], ['宫保鸡丁', 'gōngbǎojīdīng', 'gōngbǎojīdīng', 'kung pao chicken']] },

  // world
  { k: '山', meaning: 'mountain', on: 'shān', kun: '', parts: [['山', 'three peaks']], story: 'Three peaks, the middle one tallest.',
    words: [['山', 'shān', 'shān', 'mountain'], ['爬山', 'páshān', 'páshān', 'to climb a mountain']] },
  { k: '木', meaning: 'tree, wood', on: 'mù', kun: '', parts: [['木', 'tree']], story: 'A tree: trunk, branches and roots.',
    words: [['木头', 'mùtou', 'mùtou', 'wood'], ['树木', 'shùmù', 'shùmù', 'trees']] },
  { k: '林', meaning: 'woods', on: 'lín', kun: '', parts: [['木', 'tree'], ['木', 'tree']], story: 'Two trees side by side make a small wood.',
    words: [['树林', 'shùlín', 'shùlín', 'woods'], ['森林', 'sēnlín', 'sēnlín', 'forest']] },
];

export const KANJI_LESSONS = [
  { title: 'Characters: China', kanji: ['中', '国', '人'], unit: 'hello' },
  { title: 'Characters: hello', kanji: ['你', '好'], unit: 'hello' },
  { title: 'Characters: entrance & exit', kanji: ['入', '出', '口'], unit: 'around' },
  { title: 'Characters: toilets & directions', kanji: ['男', '女', '左', '右'], unit: 'around' },
  { title: 'Characters: drinks', kanji: ['水', '茶', '酒'], unit: 'food' },
  { title: 'Characters: money & open/closed', kanji: ['元', '钱', '开', '关'], unit: 'shopping' },
  { title: 'Characters: push & pull', kanji: ['推', '拉', '门'], unit: 'shopping' },
  { title: 'Characters: one, two, three', kanji: ['一', '二', '三', '十'], unit: 'numbers' },
  { title: 'Characters: lifts & sizes', kanji: ['上', '下', '大', '小'], unit: 'hotel' },
  { title: 'Characters: rice & noodles', kanji: ['米', '面', '肉', '菜'], unit: 'eating-out' },
  { title: 'Characters: metro & station', kanji: ['车', '站', '地', '铁'], unit: 'trains' },
  { title: 'Characters: station exits', kanji: ['东', '西', '南', '北'], unit: 'trains' },
  { title: 'Characters: hospital & pharmacy', kanji: ['医', '院', '药'], unit: 'help' },
  { title: 'Characters: no smoking', kanji: ['禁', '止', '烟'], unit: 'help' },
  { title: 'Characters: teachers & students', kanji: ['老', '师', '学', '生'], unit: 'people' },
  { title: 'Characters: hot pot, fish & chicken', kanji: ['火', '鱼', '鸡'], unit: 'meals' },
  { title: 'Characters: mountains & woods', kanji: ['山', '木', '林'], unit: 'world' },
];
