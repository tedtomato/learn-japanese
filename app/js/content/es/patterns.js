// Pattern drills (substitution drills) for the Spanish course: one sentence pattern, many words
// swapped into its slot. Same shape as ../patterns.js. jp is the fixed part of the pattern; by default
// it comes after the slot (slot + jp), and `slotLast: true` puts the slot at the end (jp + slot).
// en(word) makes the English. slots: [word id, English inside the sentence]. Slot words keep their
// article (la playa), so every pattern is chosen to read correctly with them.
// A drill opens once three of its slot words are learned, and only uses learned ones.
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export const PATTERNS = [
  {
    id: 'donde-esta', jp: 'dónde está', romaji: 'dónde está', slotLast: true, title: 'dónde está ___', meaning: 'Where is ___?', art: '🗺️',
    en: (w) => `Where is ${w}?`,
    slots: [['w-el-bano', 'the toilet'], ['w-la-estacion', 'the station'], ['w-el-hotel', 'the hotel'], ['w-el-metro', 'the metro'], ['w-el-aeropuerto', 'the airport'], ['w-la-playa', 'the beach'], ['w-el-mercado', 'the market'], ['w-la-farmacia', 'the pharmacy'], ['w-el-hospital', 'the hospital'], ['w-la-llave', 'the key']],
  },
  {
    id: 'por-favor', jp: 'por favor', romaji: 'por favor', title: '___ por favor', meaning: '___, please', art: '🤲',
    en: (w) => `${cap(w)}, please`,
    slots: [['w-la-carta', 'the menu'], ['w-la-cuenta', 'the bill'], ['w-el-agua', 'the water'], ['w-el-pan', 'the bread']],
  },
  {
    id: 'me-gusta', jp: 'me gusta', romaji: 'me gusta', slotLast: true, title: 'me gusta ___', meaning: 'I like ___', art: '😍',
    en: (w) => `I like ${w}`,
    slots: [['w-el-cafe', 'coffee'], ['w-el-vino', 'wine'], ['w-el-queso', 'cheese'], ['w-el-jamon', 'ham'], ['w-la-paella', 'paella'], ['w-la-playa', 'the beach'], ['w-el-verano', 'summer'], ['w-la-primavera', 'spring'], ['w-el-mar', 'the sea'], ['w-la-montana', 'the mountains']],
  },
  {
    id: 'quiero', jp: 'quiero', romaji: 'quiero', slotLast: true, title: 'quiero ___', meaning: 'I want ___', art: '🙋',
    en: (w) => `I want ${w}`,
    slots: [['w-comer', 'to eat'], ['w-beber', 'to drink'], ['w-dormir', 'to sleep'], ['w-trabajar', 'to work'], ['w-hablar', 'to speak'], ['w-vivir', 'to live'], ['w-leer', 'to read'], ['w-ir', 'to go']],
  },
  {
    id: 'voy-a', jp: 'voy a', romaji: 'voy a', slotLast: true, title: 'voy a ___', meaning: 'I\'m going to ___', art: '🏃',
    en: (w) => `I'm going to ${w}`,
    slots: [['w-la-playa', 'the beach'], ['w-la-estacion', 'the station'], ['w-la-montana', 'the mountains'], ['w-la-farmacia', 'the pharmacy'], ['w-la-tienda', 'the shop'], ['w-la-panaderia', 'the bakery'], ['w-la-fiesta', 'the party']],
  },
  {
    id: 'me-duele', jp: 'me duele', romaji: 'me duele', slotLast: true, title: 'me duele ___', meaning: 'My ___ hurts', art: '🤕',
    en: (w) => `My ${w} hurts`,
    slots: [['w-la-cabeza', 'head'], ['w-la-garganta', 'throat'], ['w-el-estomago', 'stomach'], ['w-la-mano', 'hand'], ['w-el-pie', 'foot'], ['w-la-espalda', 'back'], ['w-el-diente', 'tooth']],
  },
];
