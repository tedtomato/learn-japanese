// Pattern drills (substitution drills) for the English course: one sentence pattern, many words
// swapped into its slot. Same shape as ../patterns.js. jp/romaji are the fixed part of the
// pattern; by default it comes after the slot (slot + jp), and `slotLast: true` puts the slot at
// the end instead (jp + slot). en(word) makes the FRENCH meaning (the language of the meanings in
// this course). slots: [word id, French inside the sentence]. A drill opens once three of its slot
// words are learned, and only uses learned ones.
export const PATTERNS = [
  {
    id: 'where-is', jp: 'Where is the', romaji: 'Where is the', slotLast: true, title: 'Where is the ___', meaning: 'Où est ___ ?', art: '🗺️',
    en: (w) => `Où est ${w} ?`,
    slots: [['w-station', 'la gare'], ['w-hotel', 'l\'hôtel'], ['w-toilet', 'les toilettes'], ['w-bus-stop', 'l\'arrêt de bus'], ['w-airport', 'l\'aéroport'], ['w-shop', 'le magasin'], ['w-pub', 'le pub'], ['w-hospital', 'l\'hôpital'], ['w-chemist', 'la pharmacie']],
  },
  {
    id: 'id-like', jp: 'I\'d like a', romaji: 'I\'d like a', slotLast: true, title: 'I\'d like a ___', meaning: 'Je voudrais un(e) ___', art: '🙋',
    en: (w) => `Je voudrais ${w}`,
    slots: [['w-coffee', 'un café'], ['w-tea', 'un thé'], ['w-pint', 'une pinte'], ['w-sandwich', 'un sandwich'], ['w-ticket', 'un billet'], ['w-return', 'un aller-retour'], ['w-single', 'un aller simple'], ['w-bag', 'un sac'], ['w-t-shirt', 'un tee-shirt'], ['w-taxi', 'un taxi']],
  },
  {
    id: 'how-much', jp: 'How much is the', romaji: 'How much is the', slotLast: true, title: 'How much is the ___', meaning: 'Combien coûte ___ ?', art: '💰',
    en: (w) => `Combien coûte ${w} ?`,
    slots: [['w-ticket', 'le billet'], ['w-coffee', 'le café'], ['w-cake', 'le gâteau'], ['w-jumper', 'le pull'], ['w-t-shirt', 'le tee-shirt'], ['w-umbrella', 'le parapluie'], ['w-bag', 'le sac'], ['w-sandwich', 'le sandwich'], ['w-wine', 'le vin']],
  },
  {
    id: 'i-like', jp: 'I like', romaji: 'I like', slotLast: true, title: 'I like ___', meaning: 'J\'aime ___', art: '😋',
    en: (w) => `J'aime ${w}`,
    slots: [['w-tea', 'le thé'], ['w-coffee', 'le café'], ['w-music', 'la musique'], ['w-football', 'le football'], ['w-summer', 'l\'été'], ['w-winter', 'l\'hiver'], ['w-cake', 'le gâteau'], ['w-wine', 'le vin'], ['w-snow', 'la neige'], ['w-rain', 'la pluie']],
  },
  {
    id: 'i-need', jp: 'I need a', romaji: 'I need a', slotLast: true, title: 'I need a ___', meaning: 'J\'ai besoin d\'un(e) ___', art: '🆘',
    en: (w) => `J'ai besoin ${w}`,
    slots: [['w-doctor', 'd\'un médecin'], ['w-taxi', 'd\'un taxi'], ['w-map', 'd\'un plan'], ['w-ticket', 'd\'un billet'], ['w-bag', 'd\'un sac'], ['w-key', 'd\'une clé'], ['w-phone', 'd\'un téléphone']],
  },
  {
    id: 'please', jp: 'please', romaji: 'please', title: '___ please', meaning: '___, s\'il vous plaît', art: '🤲',
    en: (w) => `${w}, s'il vous plaît`,
    slots: [['w-water', 'De l\'eau'], ['w-tea', 'Du thé'], ['w-coffee', 'Du café'], ['w-milk', 'Du lait'], ['w-wine', 'Du vin'], ['w-fish-and-chips', 'Un poisson-frites']],
  },
  {
    id: 'i-want-to', jp: 'I want to', romaji: 'I want to', slotLast: true, title: 'I want to ___', meaning: 'Je veux ___', art: '🎁',
    en: (w) => `Je veux ${w}`,
    slots: [['w-go', 'aller'], ['w-eat', 'manger'], ['w-drink', 'boire'], ['w-sleep', 'dormir'], ['w-buy', 'acheter'], ['w-speak', 'parler'], ['w-order', 'commander'], ['w-try', 'essayer']],
  },
  {
    id: 'i-dont', jp: 'I don\'t', romaji: 'I don\'t', slotLast: true, title: 'I don\'t ___', meaning: 'Je ne ___ pas', art: '🙅',
    en: (w) => (/^[aeiouhéè]/.test(w) ? `Je n'${w} pas` : `Je ne ${w} pas`),
    slots: [['w-eat', 'mange'], ['w-drink', 'bois'], ['w-work', 'travaille'], ['w-sleep', 'dors'], ['w-understand', 'comprends'], ['w-speak', 'parle'], ['w-like', 'aime'], ['w-want', 'veux']],
  },
  {
    id: 'she-can', jp: 'She can', romaji: 'She can', slotLast: true, title: 'She can ___', meaning: 'Elle peut ___', art: '💪',
    en: (w) => `Elle peut ${w}`,
    slots: [['w-speak', 'parler'], ['w-come', 'venir'], ['w-go', 'aller'], ['w-work', 'travailler'], ['w-help', 'aider'], ['w-drink', 'boire']],
  },
  {
    id: 'lets', jp: 'Let\'s', romaji: 'Let\'s', slotLast: true, title: 'Let\'s ___', meaning: 'Si on ___ ?', art: '🤝',
    en: (w) => `Si on ${w} ?`,
    slots: [['w-go', 'allait'], ['w-eat', 'mangeait'], ['w-drink', 'buvait un verre'], ['w-try', 'essayait'], ['w-buy', 'achetait'], ['w-sleep', 'dormait']],
  },
  {
    id: 'im-feeling', jp: 'I\'m', romaji: 'I\'m', slotLast: true, title: 'I\'m ___', meaning: 'Je suis ___', art: '😊',
    en: (w) => `Je suis ${w}`,
    slots: [['w-happy', 'heureux'], ['w-sad', 'triste'], ['w-tired', 'fatigué'], ['w-angry', 'en colère'], ['w-relaxed', 'détendu'], ['w-excited', 'impatient'], ['w-worried', 'inquiet'], ['w-lost', 'perdu']],
  },
  {
    id: 'do-you', jp: 'Do you', romaji: 'Do you', slotLast: true, title: 'Do you ___ ?', meaning: 'Est-ce que tu ___ ?', art: '❓',
    en: (w) => `Est-ce que tu ${w} ?`,
    slots: [['w-eat', 'manges'], ['w-drink', 'bois'], ['w-speak', 'parles'], ['w-work', 'travailles'], ['w-live', 'habites'], ['w-understand', 'comprends'], ['w-like', 'aimes']],
  },
  {
    id: 'i-verb', jp: 'I', romaji: 'I', slotLast: true, title: 'I ___', meaning: 'Je ___', art: '🙋',
    en: (w) => (/^[aeiouhéè]/.test(w) ? `J'${w}` : `Je ${w}`),
    slots: [['w-eat', 'mange'], ['w-drink', 'bois'], ['w-work', 'travaille'], ['w-sleep', 'dors'], ['w-live', 'habite'], ['w-speak', 'parle'], ['w-like', 'aime']],
  },
];
