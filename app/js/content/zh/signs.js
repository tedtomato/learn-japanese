// Sign spotter (Chinese course): travel situations in China where you pick the right real-looking
// sign. `need` lists the hanzi (from ./hanzi.js) that must be learned before the situation is asked.
// Signs: t text, r pinyin, say text for the Chinese voice (characters are read directly, so say = t),
// en meaning. style: yellow station sign, blue / street sign, wood plaque, vertical menu strip, order
// button, price tag, door plate, round red-ring prohibition sign, red STOP sign (停).
const S = {
  exit: { t: '出口', r: 'chūkǒu', say: '出口', en: 'exit' },
  entrance: { t: '入口', r: 'rùkǒu', say: '入口', en: 'entrance' },
  men: { t: '男', r: 'nán', say: '男', en: 'men' },
  women: { t: '女', r: 'nǚ', say: '女', en: 'women' },
  toilet: { t: '厕所', r: 'cèsuǒ', say: '厕所', en: 'toilet' },
  washroom: { t: '洗手间', r: 'xǐshǒujiān', say: '洗手间', en: 'washroom, toilet' },
  east: { t: '东出口', r: 'dōng chūkǒu', say: '东出口', en: 'east exit' },
  west: { t: '西出口', r: 'xī chūkǒu', say: '西出口', en: 'west exit' },
  south: { t: '南出口', r: 'nán chūkǒu', say: '南出口', en: 'south exit' },
  north: { t: '北出口', r: 'běi chūkǒu', say: '北出口', en: 'north exit' },
  metro: { t: '地铁', r: 'dìtiě', say: '地铁', en: 'metro' },
  railway: { t: '火车站', r: 'huǒchēzhàn', say: '火车站', en: 'railway station' },
  busStation: { t: '汽车站', r: 'qìchēzhàn', say: '汽车站', en: 'bus station' },
  taxi: { t: '出租车', r: 'chūzūchē', say: '出租车', en: 'taxi' },
  parking: { t: '停车场', r: 'tíngchēchǎng', say: '停车场', en: 'car park' },
  left: { t: '左', r: 'zuǒ', say: '左', en: 'left' },
  right: { t: '右', r: 'yòu', say: '右', en: 'right' },
  push: { t: '推', r: 'tuī', say: '推', en: 'push' },
  pull: { t: '拉', r: 'lā', say: '拉', en: 'pull' },
  doorOpen: { t: '开', r: 'kāi', say: '开', en: 'open (doors)' },
  doorClose: { t: '关', r: 'guān', say: '关', en: 'close (doors)' },
  up: { t: '上', r: 'shàng', say: '上', en: 'up' },
  down: { t: '下', r: 'xià', say: '下', en: 'down' },
  shopOpen: { t: '营业中', r: 'yíngyè zhōng', say: '营业中', en: 'open for business' },
  shopClosed: { t: '休息中', r: 'xiūxi zhōng', say: '休息中', en: 'closed (resting)' },
  noSmoking: { t: '禁止吸烟', r: 'jìnzhǐ xīyān', say: '禁止吸烟', en: 'no smoking' },
  smoking: { t: '吸烟区', r: 'xīyānqū', say: '吸烟区', en: 'smoking area' },
  noEntry: { t: '禁止入内', r: 'jìnzhǐ rùnèi', say: '禁止入内', en: 'no entry' },
  stop: { t: '停', r: 'tíng', say: '停', en: 'stop' },
  slow: { t: '慢', r: 'màn', say: '慢', en: 'slow down' },
  free: { t: '免费', r: 'miǎnfèi', say: '免费', en: 'free (no charge)' },
  big: { t: '大杯', r: 'dàbēi', say: '大杯', en: 'large cup' },
  mid: { t: '中杯', r: 'zhōngbēi', say: '中杯', en: 'medium cup' },
  small: { t: '小杯', r: 'xiǎobēi', say: '小杯', en: 'small cup' },
  one: { t: '一位', r: 'yí wèi', say: '一位', en: '1 person' },
  two: { t: '两位', r: 'liǎng wèi', say: '两位', en: '2 people' },
  three: { t: '三位', r: 'sān wèi', say: '三位', en: '3 people' },
  water: { t: '矿泉水', r: 'kuàngquánshuǐ', say: '矿泉水', en: 'mineral water' },
  beer: { t: '啤酒', r: 'píjiǔ', say: '啤酒', en: 'beer' },
  baijiu: { t: '白酒', r: 'báijiǔ', say: '白酒', en: 'baijiu (strong liquor)' },
  tea: { t: '绿茶', r: 'lǜchá', say: '绿茶', en: 'green tea' },
  rice: { t: '米饭', r: 'mǐfàn', say: '米饭', en: 'steamed rice' },
  noodles: { t: '面条', r: 'miàntiáo', say: '面条', en: 'noodles' },
  beefNoodles: { t: '牛肉面', r: 'niúròumiàn', say: '牛肉面', en: 'beef noodle soup' },
  veg: { t: '青菜', r: 'qīngcài', say: '青菜', en: 'green vegetables' },
  fish: { t: '烤鱼', r: 'kǎoyú', say: '烤鱼', en: 'grilled fish' },
  chicken: { t: '宫保鸡丁', r: 'gōngbǎo jīdīng', say: '宫保鸡丁', en: 'kung pao chicken' },
  hotpot: { t: '火锅', r: 'huǒguō', say: '火锅', en: 'hot pot' },
  hospital: { t: '医院', r: 'yīyuàn', say: '医院', en: 'hospital' },
  pharmacy: { t: '药店', r: 'yàodiàn', say: '药店', en: 'pharmacy' },
  school: { t: '学校', r: 'xuéxiào', say: '学校', en: 'school' },
  cashOnly: { t: '只收现金', r: 'zhǐ shōu xiànjīn', say: '只收现金', en: 'cash only' },
  wechat: { t: '微信支付', r: 'wēixìn zhīfù', say: '微信支付', en: 'WeChat Pay accepted' },
  china: { t: '中国', r: 'zhōngguó', say: '中国', en: 'China' },
  foreigners: { t: '外国人', r: 'wàiguórén', say: '外国人', en: 'foreigners' },
  chinese: { t: '中国公民', r: 'zhōngguó gōngmín', say: '中国公民', en: 'Chinese citizens' },
  mountain: { t: '登山入口', r: 'dēngshān rùkǒu', say: '登山入口', en: 'trailhead (mountain path)' },
  forest: { t: '森林公园', r: 'sēnlín gōngyuán', say: '森林公园', en: 'forest park' },
};

// Chinese reading of a whole number below 10,000 (for the voice): 35 → 三十五, 120 → 一百二十.
const DIGITS = '零一二三四五六七八九';
const cn = (n) => {
  if (n < 10) return DIGITS[n];
  if (n < 20) return '十' + (n % 10 ? DIGITS[n % 10] : '');
  const units = [[1000, '千'], [100, '百'], [10, '十']];
  let out = '', zero = false;
  for (const [u, name] of units) {
    const d = Math.floor(n / u) % 10;
    if (d) { out += (zero ? '零' : '') + DIGITS[d] + name; zero = false; } else if (out) zero = true;
  }
  if (n % 10) out += (zero ? '零' : '') + DIGITS[n % 10];
  return out;
};
const tag = (art, price, en) => ({ t: `${price}元`, art, r: `${price} yuán`, say: `${cn(price)}元`, en });

export const SIGN_SCENES = [
  { id: 'exit', need: ['出', '口'], q: 'Your train has arrived. Which sign leads out of the station?', style: 'yellow', answer: S.exit, wrong: [S.entrance, S.metro] },
  { id: 'entrance', need: ['入', '口'], q: 'At the museum: which door is the way in?', style: 'blue', answer: S.entrance, wrong: [S.exit] },
  { id: 'men', need: ['男', '女'], q: 'You need the men\'s toilet. Which door?', style: 'wood', answer: S.men, wrong: [S.women] },
  { id: 'toilet', need: ['出', '入', '口'], q: 'You are looking for the toilets. Which sign do you follow? (It\'s neither in nor out.)', style: 'blue', answer: S.toilet, wrong: [S.exit, S.entrance] },
  { id: 'washroom', need: ['地', '铁', '出', '口'], q: 'In the mall you need a washroom. Which sign?', style: 'blue', answer: S.washroom, wrong: [S.metro, S.exit] },
  { id: 'east', need: ['东', '西', '南', '北', '出', '口'], q: 'Your hotel says: "use the east exit". Which sign?', style: 'yellow', answer: S.east, wrong: [S.west, S.south, S.north] },
  { id: 'north', need: ['东', '西', '南', '北', '出', '口'], q: 'The park is by the north exit. Which sign?', style: 'yellow', answer: S.north, wrong: [S.east, S.west, S.south] },
  { id: 'metro', need: ['地', '铁', '车', '站'], q: 'You want the metro, not the bus station. Which sign?', style: 'street', answer: S.metro, wrong: [S.busStation, S.taxi] },
  { id: 'railway', need: ['火', '车', '站', '地', '铁'], q: 'Your overnight train leaves from the railway station. Which sign do you follow?', style: 'street', answer: S.railway, wrong: [S.metro, S.busStation] },
  { id: 'right', need: ['左', '右'], q: 'The map says: turn right. Which sign?', style: 'street', answer: S.right, wrong: [S.left] },
  { id: 'left', need: ['左', '右'], q: 'The map says: turn left. Which sign?', style: 'street', answer: S.left, wrong: [S.right] },
  { id: 'push', need: ['推', '拉'], q: 'The café door has a metal plate. You want to push it open. Which plate says push?', style: 'door', answer: S.push, wrong: [S.pull] },
  { id: 'pull', need: ['推', '拉'], q: 'Leaving the shop: this door opens towards you. Which plate says pull?', style: 'door', answer: S.pull, wrong: [S.push] },
  { id: 'lift-open', need: ['开', '关'], q: 'Someone is running for the lift! Which button keeps the doors open?', style: 'button', answer: S.doorOpen, wrong: [S.doorClose] },
  { id: 'closed', need: ['中'], q: 'It\'s 10 p.m. Which sign on the shop door means it\'s closed? (营业 = in business, 休息 = resting.)', style: 'wood', answer: S.shopClosed, wrong: [S.shopOpen] },
  { id: 'up', need: ['上', '下'], q: 'Your room is on the 18th floor and you are in the lobby. Which lift button?', style: 'button', answer: S.up, wrong: [S.down] },
  { id: 'no-smoking', need: ['禁', '止', '烟'], q: 'You want a table where nobody smokes. Which sign?', style: 'round', answer: S.noSmoking, wrong: [S.smoking] },
  { id: 'no-entry', need: ['禁', '止', '入'], q: 'A rope across a temple courtyard. Which sign tells you not to go in?', style: 'round', answer: S.noEntry, wrong: [S.entrance, S.exit] },
  { id: 'stop', need: ['止'], q: 'Cycling through Yangshuo. Which red road sign means STOP?', style: 'stop', answer: S.stop, wrong: [S.slow] },
  { id: 'free', need: ['元', '十'], q: 'Two temples. Which one is free to enter?', style: 'tag', answer: S.free, wrong: [tag('🎫', 40, 'ticket, 40 yuan')] },
  { id: 'yuan', need: ['元'], q: 'You have 20元 left. What can you buy?', style: 'tag', answer: tag('🥟', 15, 'dumplings, 15 yuan'), wrong: [tag('🍲', 98, 'hot pot, 98 yuan'), tag('🦆', 168, 'Peking duck, 168 yuan')] },
  { id: 'big', need: ['大', '小', '中'], q: 'Thirsty! You want a large milk tea. Which button?', style: 'button', answer: S.big, wrong: [S.mid, S.small] },
  { id: 'two', need: ['一', '三'], q: 'The waiter asks how many. A table for two — which do you point at?', style: 'button', answer: S.two, wrong: [S.one, S.three] },
  { id: 'water', need: ['水', '酒'], q: 'You want water, not alcohol. Which drink on the menu?', style: 'menu', answer: S.water, wrong: [S.beer, S.baijiu] },
  { id: 'noodles', need: ['米', '面', '肉'], q: 'You are craving noodles. Which item on the menu?', style: 'menu', answer: S.beefNoodles, wrong: [S.rice, S.veg] },
  { id: 'fish', need: ['鱼', '鸡', '火'], q: 'You feel like fish tonight. Which dish?', style: 'menu', answer: S.fish, wrong: [S.chicken, S.hotpot] },
  { id: 'hospital', need: ['医', '院', '药'], q: 'Your friend has broken an ankle. Which building?', style: 'street', answer: S.hospital, wrong: [S.pharmacy, S.school] },
  { id: 'pharmacy', need: ['医', '院', '药'], q: 'You just need some headache tablets. Which shop?', style: 'street', answer: S.pharmacy, wrong: [S.hospital] },
  { id: 'cash-only', need: ['钱'], q: 'Your phone is dead but you have banknotes. Which noodle stall is fine?', style: 'wood', answer: S.cashOnly, wrong: [S.wechat] },
  { id: 'passport', need: ['中', '国', '人'], q: 'Passport control: which queue is for foreign visitors?', style: 'blue', answer: S.foreigners, wrong: [S.chinese] },
  { id: 'trail', need: ['山', '入', '口', '林'], q: 'Hiking day! Which sign marks the start of the mountain path?', style: 'wood', answer: S.mountain, wrong: [S.forest, S.exit] },
];
