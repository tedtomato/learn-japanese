// Pattern drills (substitution drills) for the French course: one sentence pattern, many words
// swapped into its slot. Same shape as ../patterns.js. jp/romaji are the fixed part of the
// pattern; by default it comes after the slot (slot + jp), and `slotLast: true` puts the slot at
// the end instead (jp + slot). Slot words keep their article (la gare), so each sentence reads
// correctly. en(word) makes the English. slots: [word id, English inside the sentence].
// A drill opens once three of its slot words are learned, and only uses learned ones.
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export const PATTERNS = [
  {
    id: 'ou-est', jp: 'où est', romaji: 'où est', slotLast: true, title: 'où est ___', meaning: 'Where is ___?', art: '🗺️',
    en: (w) => `Where is ${w}?`,
    slots: [['w-la-gare', 'the train station'], ['w-le-metro', 'the metro'], ['w-l-arret-de-bus', 'the bus stop'], ['w-l-hotel', 'the hotel'], ['w-le-musee', 'the museum'], ['w-la-pharmacie', 'the pharmacy'], ['w-la-boulangerie', 'the bakery'], ['w-le-marche', 'the market'], ['w-l-hopital', 'the hospital'], ['w-la-plage', 'the beach']],
  },
  {
    id: 'je-voudrais', jp: 'je voudrais', romaji: 'je voudrais', slotLast: true, title: 'je voudrais ___', meaning: 'I would like ___', art: '🙋',
    en: (w) => `I would like ${w}`,
    slots: [['w-la-carte', 'the menu'], ['w-l-addition', 'the bill'], ['w-la-cle', 'the key'], ['w-le-recu', 'the receipt']],
  },
  {
    id: 'c-est-combien', jp: 'c\'est combien,', romaji: 'c\'est combien,', slotLast: true, title: 'c\'est combien, ___', meaning: 'How much is ___?', art: '💰',
    en: (w) => `How much is ${w}?`,
    slots: [['w-le-billet', 'the ticket'], ['w-le-sac', 'the bag'], ['w-la-carte-postale', 'the postcard'], ['w-le-cadeau', 'the gift'], ['w-le-pain', 'the bread'], ['w-la-baguette', 'the baguette'], ['w-le-croissant', 'the croissant'], ['w-le-fromage', 'the cheese'], ['w-le-taxi', 'the taxi'], ['w-le-parapluie', 'the umbrella']],
  },
  {
    id: 'j-aime', jp: 'j\'aime', romaji: 'j\'aime', slotLast: true, title: 'j\'aime ___', meaning: 'I like ___', art: '😋',
    en: (w) => `I like ${w}`,
    slots: [['w-le-fromage', 'cheese'], ['w-le-pain', 'bread'], ['w-le-vin', 'wine'], ['w-le-cafe', 'coffee'], ['w-le-the', 'tea'], ['w-la-biere', 'beer'], ['w-la-mer', 'the sea'], ['w-la-montagne', 'the mountains'], ['w-le-printemps', 'spring'], ['w-l-hiver', 'winter']],
  },
  {
    id: 'voici', jp: 'voici', romaji: 'voici', slotLast: true, title: 'voici ___', meaning: 'Here is ___', art: '👉',
    en: (w) => `Here is ${w}`,
    slots: [['w-la-cle', 'the key'], ['w-la-chambre', 'the room'], ['w-le-billet', 'the ticket'], ['w-la-carte', 'the menu'], ['w-l-addition', 'the bill'], ['w-le-passeport', 'the passport'], ['w-le-recu', 'the receipt'], ['w-la-maison', 'the house'], ['w-la-carte-bancaire', 'the bank card']],
  },
  {
    id: 'est-a-gauche', jp: 'est à gauche', romaji: 'est à gauche', title: '___ est à gauche', meaning: '___ is on the left', art: '⬅️',
    en: (w) => `${cap(w)} is on the left`,
    slots: [['w-la-gare', 'the station'], ['w-le-metro', 'the metro'], ['w-l-hotel', 'the hotel'], ['w-la-pharmacie', 'the pharmacy'], ['w-le-musee', 'the museum'], ['w-la-boulangerie', 'the bakery'], ['w-le-supermarche', 'the supermarket'], ['w-l-arret-de-bus', 'the bus stop']],
  },
  // Verb drills: the verb is fixed, the object changes. Feminine words keep their article after à / de.
  {
    id: 'je-prends', jp: 'je prends', romaji: 'je prends', slotLast: true, title: 'je prends ___', meaning: 'I take ___', art: '🤏',
    en: (w) => `I take ${w}`,
    slots: [['w-le-metro', 'the metro'], ['w-le-bus', 'the bus'], ['w-le-train', 'the train'], ['w-le-taxi', 'a taxi'], ['w-le-pain', 'the bread'], ['w-le-croissant', 'a croissant'], ['w-le-cafe', 'a coffee'], ['w-le-billet', 'the ticket']],
  },
  {
    id: 'je-mange', jp: 'je mange', romaji: 'je mange', slotLast: true, title: 'je mange ___', meaning: 'I eat ___', art: '🍽️',
    en: (w) => `I eat ${w}`,
    slots: [['w-le-pain', 'bread'], ['w-la-baguette', 'the baguette'], ['w-le-croissant', 'a croissant'], ['w-le-fromage', 'cheese']],
  },
  {
    id: 'je-bois', jp: 'je bois', romaji: 'je bois', slotLast: true, title: 'je bois ___', meaning: 'I drink ___', art: '🥤',
    en: (w) => `I drink ${w}`,
    slots: [['w-le-cafe', 'coffee'], ['w-le-the', 'tea'], ['w-le-vin', 'wine'], ['w-la-biere', 'beer'], ['w-l-eau', 'water'], ['w-le-jus-d-orange', 'orange juice']],
  },
  {
    id: 'je-vais-a', jp: 'je vais à', romaji: 'je vais à', slotLast: true, title: 'je vais à ___', meaning: 'I am going to ___', art: '🏃',
    en: (w) => `I am going to ${w}`,
    slots: [['w-la-gare', 'the station'], ['w-la-plage', 'the beach'], ['w-la-maison', 'home'], ['w-la-pharmacie', 'the pharmacy'], ['w-la-boulangerie', 'the bakery'], ['w-l-hotel', 'the hotel'], ['w-l-hopital', 'the hospital'], ['w-la-montagne', 'the mountains']],
  },
  {
    id: 'tu-as', jp: 'tu as', romaji: 'tu as', slotLast: true, title: 'tu as ___?', meaning: 'Do you have ___?', art: '🎒',
    en: (w) => `Do you have ${w}?`,
    slots: [['w-la-cle', 'the key'], ['w-le-billet', 'the ticket'], ['w-le-passeport', 'the passport'], ['w-le-portefeuille', 'the wallet'], ['w-le-telephone', 'the phone'], ['w-le-livre', 'the book']],
  },
  {
    id: 'vous-avez', jp: 'vous avez', romaji: 'vous avez', slotLast: true, title: 'vous avez ___?', meaning: 'Do you have ___? (polite)', art: '🛍️',
    en: (w) => `Do you have ${w}?`,
    slots: [['w-la-carte', 'the menu'], ['w-la-chambre', 'a room'], ['w-le-pain', 'bread'], ['w-le-fromage', 'cheese'], ['w-le-sac', 'a bag'], ['w-la-carte-postale', 'postcards']],
  },
  {
    id: 'on-va-a', jp: 'on va à', romaji: 'on va à', slotLast: true, title: 'on va à ___', meaning: 'Let\'s go to ___', art: '👉',
    en: (w) => `Let's go to ${w}`,
    slots: [['w-la-plage', 'the beach'], ['w-la-mer', 'the sea'], ['w-la-montagne', 'the mountains'], ['w-la-gare', 'the station'], ['w-la-maison', 'home'], ['w-la-boulangerie', 'the bakery']],
  },
  {
    id: 'j-ai-besoin-de', jp: 'j\'ai besoin de', romaji: 'j\'ai besoin de', slotLast: true, title: 'j\'ai besoin de ___', meaning: 'I need ___', art: '🤲',
    en: (w) => `I need ${w}`,
    slots: [['w-la-cle', 'the key'], ['w-la-carte', 'the card'], ['w-la-chambre', 'a room'], ['w-l-ambulance', 'an ambulance'], ['w-l-eau', 'water'], ['w-la-police', 'the police']],
  },
];
