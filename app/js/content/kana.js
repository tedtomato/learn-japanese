// Hiragana in chart order. Each entry: [kana, romaji, memory hint]. Katakana is derived from it.

export const HIRAGANA_ROWS = [
  {
    id: 'vowels',
    title: 'Vowels',
    kana: [
      ['あ', 'a', 'A cross with a big loop. Open wide: "Ahh!"'],
      ['い', 'i', 'Two little eels side by side: "ee"'],
      ['う', 'u', 'A sideways U wearing a hat: "oo"'],
      ['え', 'e', 'A bird flapping a wing: "eh?"'],
      ['お', 'o', 'A golfer mid-swing shouting "oh!"'],
    ],
  },
  {
    id: 'k',
    title: 'K-row',
    kana: [
      ['か', 'ka', 'A kite with a string trailing off: "ka"'],
      ['き', 'ki', 'A key with two teeth: "ki"'],
      ['く', 'ku', 'An open cuckoo beak: "ku"'],
      ['け', 'ke', 'A keg tipped on its side: "ke"'],
      ['こ', 'ko', 'Two coins stacked up: "ko"'],
    ],
  },
  {
    id: 's',
    title: 'S-row',
    kana: [
      ['さ', 'sa', 'A sword swinging over a curve: "sa"'],
      ['し', 'shi', 'A fishhook — she goes fishing: "shi"'],
      ['す', 'su', 'A swing with a loop in the rope: "su"'],
      ['せ', 'se', 'A mouth open to say "say": "se"'],
      ['そ', 'so', 'A zig-zag sewing stitch: "so"'],
    ],
  },
  {
    id: 't',
    title: 'T-row',
    kana: [
      ['た', 'ta', 'Looks like the letters t and a: "ta"'],
      ['ち', 'chi', 'A cheerleader with a big curve: "chi"'],
      ['つ', 'tsu', 'A tsunami wave rolling in: "tsu"'],
      ['て', 'te', 'A hand reaching out (te means hand): "te"'],
      ['と', 'to', 'A toe with a thorn stuck in it: "to"'],
    ],
  },
  {
    id: 'n',
    title: 'N-row',
    kana: [
      ['な', 'na', 'A knot tied under a cross: "na"'],
      ['に', 'ni', 'A knee next to two lines: "ni"'],
      ['ぬ', 'nu', 'Noodles twirled on chopsticks: "nu"'],
      ['ね', 'ne', 'A cat (neko) curling its tail: "ne"'],
      ['の', 'no', 'A "no entry" swirl: "no"'],
    ],
  },
  {
    id: 'h',
    title: 'H-row',
    kana: [
      ['は', 'ha', 'An H next to an a: "ha"'],
      ['ひ', 'hi', 'A big grin: "hee hee"'],
      ['ふ', 'fu', 'Mount Fuji with clouds around it: "fu"'],
      ['へ', 'he', 'A small hill. Hey, climb it: "he"'],
      ['ほ', 'ho', 'Like は with an extra line on top: "ho"'],
    ],
  },
  {
    id: 'm',
    title: 'M-row',
    kana: [
      ['ま', 'ma', 'Mama in a long flowing dress: "ma"'],
      ['み', 'mi', 'Looks like the number 21. Me at 21: "mi"'],
      ['む', 'mu', 'A cow with its head down: "moo"'],
      ['め', 'me', 'An eye (me means eye): "me"'],
      ['も', 'mo', 'A fishhook with more bait: "mo"'],
    ],
  },
  {
    id: 'r',
    title: 'R-row',
    kana: [
      ['ら', 'ra', 'A rabbit with one ear up: "ra"'],
      ['り', 'ri', 'Two reeds by the river: "ri"'],
      ['る', 'ru', 'A route ending in a loop: "ru"'],
      ['れ', 're', 'Someone kneeling to pray: "re"'],
      ['ろ', 'ro', 'Like る but the road has no loop: "ro"'],
    ],
  },
  {
    id: 'ywn',
    title: 'Y, W and N',
    kana: [
      ['や', 'ya', 'A yak with big horns: "ya"'],
      ['ゆ', 'yu', 'A fish swimming toward you: "yu"'],
      ['よ', 'yo', 'A yo-yo hanging on a string: "yo"'],
      ['わ', 'wa', 'A wasp with a curled tail: "wa"'],
      ['を', 'wo', 'Someone tripping over: "whoa!" Said "o", used as a particle'],
      ['ん', 'n', 'A lowercase n written in one stroke: "n"'],
    ],
  },
  {
    id: 'dakuten',
    title: 'Voiced sounds',
    kana: [
      ['が', 'ga', 'か + two dots (゛) makes it voiced: "ga"'],
      ['ぎ', 'gi', 'き + ゛ = "gi"'],
      ['ぐ', 'gu', 'く + ゛ = "gu"'],
      ['げ', 'ge', 'け + ゛ = "ge"'],
      ['ご', 'go', 'こ + ゛ = "go"'],
      ['ざ', 'za', 'さ + ゛ = "za"'],
      ['じ', 'ji', 'し + ゛ = "ji"'],
      ['ず', 'zu', 'す + ゛ = "zu"'],
      ['ぜ', 'ze', 'せ + ゛ = "ze"'],
      ['ぞ', 'zo', 'そ + ゛ = "zo"'],
      ['だ', 'da', 'た + ゛ = "da"'],
      ['ぢ', 'di', 'ち + ゛ = "ji" (rare, written di)'],
      ['づ', 'du', 'つ + ゛ = "zu" (rare, written du)'],
      ['で', 'de', 'て + ゛ = "de"'],
      ['ど', 'do', 'と + ゛ = "do"'],
      ['ば', 'ba', 'は + ゛ = "ba"'],
      ['び', 'bi', 'ひ + ゛ = "bi"'],
      ['ぶ', 'bu', 'ふ + ゛ = "bu"'],
      ['べ', 'be', 'へ + ゛ = "be"'],
      ['ぼ', 'bo', 'ほ + ゛ = "bo"'],
      ['ぱ', 'pa', 'は + a little circle (゜) = "pa"'],
      ['ぴ', 'pi', 'ひ + ゜ = "pi"'],
      ['ぷ', 'pu', 'ふ + ゜ = "pu"'],
      ['ぺ', 'pe', 'へ + ゜ = "pe"'],
      ['ぽ', 'po', 'ほ + ゜ = "po"'],
    ],
  },
];

export const kanaId = (kana) => `k-${kana}`;

// Small kana that change the sound before or after them. `say` is what to speak (a lone small
// kana has no sound of its own).
const SMALL = [
  ['っ', 'small tsu', 'Small っ doubles the next sound with a tiny pause: きっぷ = kip-pu', 'きっぷ'],
  ['ゃ', 'small ya', 'Small ゃ blends with the sound before it: し + ゃ = sha (でんしゃ densha)', 'しゃ'],
  ['ゅ', 'small yu', 'Small ゅ blends with the sound before it: き + ゅ = kyu (きゅう kyuu)', 'きゅ'],
  ['ょ', 'small yo', 'Small ょ blends with the sound before it: じ + ょ = jo (だいじょうぶ daijoubu)', 'じょ'],
];

const toKatakana = (h) => String.fromCharCode(h.charCodeAt(0) + 0x60);

// Every character the course can teach: char → { romaji, hint, script, say }.
export const KANA = new Map();
for (const row of HIRAGANA_ROWS) {
  for (const [k, romaji, hint] of row.kana) {
    KANA.set(k, { romaji, hint, script: 'hiragana' });
    KANA.set(toKatakana(k), { romaji, hint: `Katakana “${romaji}” — the same sound as hiragana ${k}. Katakana is used for foreign words.`, script: 'katakana' });
  }
}
for (const [k, romaji, hint, say] of SMALL) {
  KANA.set(k, { romaji, hint, script: 'hiragana', say });
  KANA.set(toKatakana(k), { romaji, hint: `Katakana version of ${k}. ${hint}`, script: 'katakana', say: [...say].map(toKatakana).join('') });
}
KANA.set('ー', { romaji: 'long vowel', hint: 'The dash stretches the vowel before it: タクシー = ta-ku-shii', script: 'katakana', say: 'ター' });

export const KATAKANA_ROWS = HIRAGANA_ROWS.map((row) => ({ ...row, kana: row.kana.map(([k, r]) => [toKatakana(k), r]) }));
