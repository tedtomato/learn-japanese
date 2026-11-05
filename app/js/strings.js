// Learner-facing strings that depend on the language of the meanings (`L.gloss`). English is the
// default and is the key itself; the English course is for French speakers, so it has a French table.
// Only the lesson instructions and the lesson player are covered, not the whole app.
import { L } from './lang.js';

const FRENCH = {
  // Instructions (generate.js)
  'What sound is this?': 'Quel est ce son ?',
  'What does this mean?': 'Que veut dire ceci ?',
  'How do you say “{en}”?': 'Comment dit-on « {en} » en {lang} ?',
  'What do you hear?': 'Qu’entends-tu ?',
  'Which one means “{en}”?': 'Lequel veut dire « {en} » ?',
  'How do you read this?': 'Comment lit-on ceci ?',
  'Say it out loud': 'Dis-le à voix haute',
  'Translate this sentence': 'Traduis cette phrase',
  'Tap what you hear': 'Touche ce que tu entends',
  'Fast talk! Tap the words you hear': 'À toute vitesse ! Touche les mots que tu entends',
  'Translate into {lang}': 'Traduis en {lang}',
  'Tap the matching pairs': 'Associe les paires',
  'Type what you hear': 'Écris ce que tu entends',
  'Type the meaning': 'Écris le sens en français',
  'Fill the gap — {en}': 'Complète la phrase — {en}',
  'Which article goes with “{en}”?': 'Quel article va avec « {en} » ?',
  // Player
  'Nicely done!': 'Bien joué !',
  'Great job!': 'Très bien !',
  'Correct!': 'Correct !',
  'Awesome!': 'Génial !',
  'You got it!': 'Tu as trouvé !',
  'Perfect!': 'Parfait !',
  'Well done!': 'Bravo !',
  'Brilliant!': 'Génial !',
  'Check': 'Vérifier',
  'Continue': 'Continuer',
  'Got it': 'Compris',
  '😎 I knew it': '😎 Je le savais',
  '🤔 I guessed': '🤔 J\'ai deviné',
  'Explain': 'Expliquer',
  'Correct answer:': 'Bonne réponse :',
  'Speed bonus': 'Bonus de vitesse',
  'Speed bonus +{n} XP': 'Bonus de vitesse +{n} XP',
  'A bit slow': 'Un peu lent',
  'Almost right': 'Presque juste',
  'Used a hint': 'Indice utilisé',
  'we\'ll practise it again': 'on le retravaillera',
  'You got everything right! Let\'s go over the ones that took you a little longer.': 'Tout est juste ! Revoyons ceux qui t’ont pris un peu plus de temps.',
  'Let\'s go over the ones you missed, and the ones that took you a little longer.': 'Revoyons ceux que tu as ratés, et ceux qui t’ont pris un peu plus de temps.',
  'Let\'s correct the exercises you missed!': 'Corrigeons les exercices que tu as ratés !',
  'New character': 'Nouveau caractère',
  'New word': 'Nouveau mot',
  'New phrase': 'Nouvelle phrase',
  'New kanji': 'Nouveau kanji',
  'New kanji word': 'Nouveau mot en kanji',
  'New radical': 'Nouveau radical',
  'Practice': 'Entraînement',
  'Pick an answer': 'Choisis une réponse',
  'Pick a guess': 'Fais une hypothèse',
  'New word — have a guess!': 'Nouveau mot — devine !',
  'Good guess!': 'Bien deviné !',
  'Nice try!': 'Bien essayé !',
  'Can\'t listen now': 'Je ne peux pas écouter',
  'Can\'t speak now': 'Je ne peux pas parler',
  'I don\'t know': 'Je ne sais pas',
  'How do you say this in {lang}?': 'Comment dit-on cela en {lang} ?',
  'Type it in {lang}…': 'Écris-le en {lang}…',
  'Type what you hear…': 'Écris ce que tu entends…',
  'Type the meaning…': 'Écris le sens…',
  'Your answer': 'Ta réponse',
  'Practice complete!': 'Entraînement terminé !',
  'Story complete!': 'Histoire terminée !',
  'Perfect lesson!': 'Leçon parfaite !',
  'Lesson complete!': 'Leçon terminée !',
};

const TABLES = { French: FRENCH };
// The course language's name, in the language of the interface.
const NAMES = { French: { English: 'anglais', French: 'français', Spanish: 'espagnol', Japanese: 'japonais', Chinese: 'chinois' } };

export function t(key, vars = {}) {
  const text = TABLES[L.gloss]?.[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

// "English" → "anglais" in the English course.
export const langName = () => NAMES[L.gloss]?.[L.name] ?? L.name;
