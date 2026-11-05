// The English course for French speakers: themed units of essential words and sentences, same
// format as the other courses (../units.js) but without romanisation. British English, with the
// American alternatives in the notes. The `en` fields hold the meanings, written in FRENCH here.
//
// Word: [english, sens en français, art (emoji drawn in the cartoon art set), extras?]
//   extras: { note: usage / culture tip (in French), alt: [other forms speech recognition may return] }
// Sentence: { jp: [english chunks], en: French translation, alt?: [other accepted translations] }
// Lesson: { title, words?, sentences?, grammar?: id of a grammar card shown before the sentences }
// Unit: { id, title, desc, facts: [fun-fact categories], phrases: [phrase categories], lessons, dialogues?: [ids] }

const FACT = {
  food: 'Food & Drink',
  city: 'Cities & Landmarks',
  history: 'History & Royals',
  nature: 'Nature & Weather',
  traditions: 'Traditions & Festivals',
  language: 'Language & Accents',
  transport: 'Transport & Travel',
  sport: 'Sport & Daily Life',
};

const PH = {
  polite: 'Les bases polies',
  around: 'Se déplacer',
  food: 'Au restaurant & au pub',
  shop: 'Shopping & paiement',
  hotel: 'À l\'hôtel',
  help: 'Urgences & santé',
};

export const SECTIONS_DATA = [
  {
    id: 'uk',
    title: 'First trip to the UK',
    units: [
      {
        id: 'hello',
        title: 'Bonjour & merci',
        desc: 'Saluer, remercier et s\'excuser… beaucoup',
        facts: [FACT.language, FACT.traditions],
        phrases: [PH.polite],
        dialogues: ['d-hello'],
        lessons: [
          { title: 'Bonjour', words: [
            ['hello', 'bonjour', '👋', { note: 'Marche à toute heure, avec tout le monde.' }],
            ['hi', 'salut', '🙋', { note: 'Plus décontracté que hello, mais très courant, même avec des inconnus.' }],
            ['good morning', 'bonjour (le matin)', '🌅', { note: 'Jusqu\'à midi environ. Ensuite : good afternoon.' }],
            ['good evening', 'bonsoir', '🌃', { note: 'Pour saluer en arrivant le soir. Pour partir, on dit good night.' }],
          ] },
          { title: 'Merci', words: [
            ['thank you', 'merci', '🙏', { note: 'Le th se prononce langue entre les dents : ni « s » ni « z ». Dans les prononciations de l\'appli, il est noté TH (THènk-iou).' }],
            ['thanks', 'merci (familier)', '👍', { note: 'Un peu plus léger que thank you. Les Britanniques disent aussi cheers.' }],
            ['please', 's\'il vous plaît', '🤲', { note: 'Indispensable au Royaume-Uni : oublier please peut paraître impoli.' }],
            ['you\'re welcome', 'de rien', '😊', { note: 'Tout à fait courant au Royaume-Uni aussi. Plus décontracté : no worries, not at all ou no problem.', alt: ['you are welcome'] }],
          ] },
          { title: 'Pardon', words: [
            ['sorry', 'désolé', '😔', { note: 'Les Britanniques disent sorry tout le temps, même quand c\'est vous qui les bousculez !' }],
            ['excuse me', 'excusez-moi', '🙋', { note: 'Pour attirer l\'attention ou passer devant quelqu\'un.' }],
            ['pardon', 'pardon ? (je n\'ai pas compris)', '❓', { note: 'Pour faire répéter. Les Américains disent plutôt excuse me? ou sorry?' }],
            ['no problem', 'pas de problème', '👌'],
          ] },
          { title: 'Oui & non', words: [
            ['yes', 'oui', '✅', { note: 'À l\'oral : yeah (ouais).', alt: ['yeah'] }],
            ['no', 'non', '❌', { note: 'Seul, il peut sembler sec : no, thanks (non merci) est plus poli.' }],
            ['OK', 'd\'accord', '👌', { alt: ['okay', 'ok'] }],
          ] },
          { title: 'Au revoir', words: [
            ['goodbye', 'au revoir', '👋', { note: 'Un peu formel. Au quotidien : bye ou bye-bye.' }],
            ['bye', 'salut (en partant)', '✌️'],
            ['see you later', 'à plus tard', '📅', { note: 'Souvent juste see you ! Ne promet pas vraiment de se revoir le jour même.' }],
            ['good night', 'bonne nuit', '🌙', { note: 'Pour partir le soir ou aller se coucher.' }],
          ] },
          { title: 'Comment ça va ?', grammar: 'be', sentences: [
            { jp: ['how', 'are', 'you'], en: 'Comment allez-vous', alt: ['Comment vas-tu', 'Comment ça va', 'Ça va', 'Comment tu vas', 'Tu vas bien', 'Vous allez bien'] },
            { jp: ['I\'m', 'fine', 'thanks'], en: 'Je vais bien merci', alt: ['Ça va merci', 'Bien merci', 'Je vais bien', 'Très bien merci'] },
            { jp: ['and', 'you'], en: 'Et vous', alt: ['Et toi'] },
            { jp: ['nice', 'to', 'meet', 'you'], en: 'Enchanté', alt: ['Enchantée', 'Ravi de vous rencontrer', 'Ravie de vous rencontrer', 'Ravi de te rencontrer', 'Ravie de te rencontrer'] },
          ] },
        ],
      },
      {
        id: 'around',
        title: 'Se déplacer',
        desc: 'Gares, métro, bus et trouver les toilettes',
        facts: [FACT.transport, FACT.city],
        phrases: [PH.around, PH.hotel],
        dialogues: ['d-station'],
        lessons: [
          { title: 'À la gare', words: [
            ['station', 'gare / station', '🚉'],
            ['train', 'train', '🚆'],
            ['platform', 'quai', '🚏', { note: 'Le quai porte un numéro : platform 9. Aux États-Unis : track.' }],
            ['ticket', 'billet / ticket', '🎫'],
          ] },
          { title: 'Métro & bus', words: [
            ['the Tube', 'le métro de Londres', '🚇', { note: 'Surnom du London Underground. Ailleurs : underground ; aux États-Unis : subway.', alt: ['tube', 'the tube'] }],
            ['bus', 'bus', '🚌', { note: 'À Londres, les bus rouges à impériale s\'appellent double-deckers. On paie sans contact, pas en espèces.' }],
            ['bus stop', 'arrêt de bus', '🚏'],
            ['taxi', 'taxi', '🚕', { note: 'Les taxis noirs londoniens : black cabs. Aux États-Unis : cab.', alt: ['cab'] }],
          ] },
          { title: 'Lieux', words: [
            ['hotel', 'hôtel', '🏨', { note: 'Le h se prononce : a hotel, pas an hotel.' }],
            ['toilet', 'toilettes', '🚻', { note: 'Familier : the loo. Aux États-Unis, on dit restroom ou bathroom.', alt: ['toilets'] }],
            ['map', 'plan / carte', '🗺️'],
            ['airport', 'aéroport', '✈️'],
          ] },
          { title: 'Directions', words: [
            ['where', 'où', '❓'],
            ['left', 'gauche', '⬅️', { note: 'On the left = à gauche. Attention : au Royaume-Uni, on roule à gauche !' }],
            ['right', 'droite', '➡️', { note: 'On the right = à droite. Right veut aussi dire « exact ».' }],
            ['straight on', 'tout droit', '⬆️', { note: 'Aux États-Unis : straight ahead.', alt: ['straight ahead'] }],
          ] },
          { title: 'Billets', words: [
            ['single', 'aller simple', '➡️', { note: 'A single to York = un aller simple pour York. Aux États-Unis : one-way.' }],
            ['return', 'aller-retour', '🔁', { note: 'Aux États-Unis : round trip.' }],
            ['next', 'prochain', '⏭️', { note: 'The next train = le prochain train.' }],
            ['queue', 'file d\'attente / faire la queue', '🧍', { note: 'Les Britanniques font la queue très sagement. Aux États-Unis : line.' }],
            ['reservation', 'réservation', '📋', { note: 'Aussi : booking (très courant pour un hôtel ou un train). I have a reservation = j\'ai une réservation.', alt: ['booking'] }],
          ] },
          { title: 'Où est… ?', grammar: 'where-is', sentences: [
            { jp: ['where', 'is', 'the', 'station'], en: 'Où est la gare', alt: ['Où se trouve la gare', 'La gare est où', 'Elle est où la gare', 'Où est la station'] },
            { jp: ['where', 'are', 'the', 'toilets'], en: 'Où sont les toilettes', alt: ['Où se trouvent les toilettes', 'Les toilettes sont où', 'Elles sont où les toilettes'] },
            { jp: ['it\'s', 'on', 'the', 'left'], en: 'C\'est à gauche', alt: ['À gauche', 'Elle est à gauche', 'Il est à gauche', 'C\'est sur la gauche'] },
            { jp: ['go', 'straight on'], en: 'Allez tout droit', alt: ['Va tout droit', 'Tout droit', 'Continuez tout droit', 'Continue tout droit'] },
          ] },
          { title: 'Au guichet', sentences: [
            { jp: ['a', 'return', 'to', 'London', 'please'], en: 'Un aller-retour pour Londres s\'il vous plaît', alt: ['Un aller-retour pour Londres s\'il te plaît', 'Un aller-retour pour Londres'] },
            { jp: ['when', 'is', 'the', 'next', 'train'], en: 'Quand est le prochain train', alt: ['Le prochain train est quand', 'À quelle heure est le prochain train', 'C\'est quand le prochain train'] },
            { jp: ['which', 'platform'], en: 'Quel quai', alt: ['Quel quai s\'il vous plaît', 'C\'est quel quai'] },
          ] },
        ],
      },
      {
        id: 'food',
        title: 'Manger & boire',
        desc: 'Commander au café et au pub, et demander l\'addition',
        facts: [FACT.food],
        phrases: [PH.food],
        dialogues: ['d-cafe'],
        lessons: [
          { title: 'Boissons', words: [
            ['water', 'eau', '💧', { note: 'Tap water = l\'eau du robinet, gratuite au restaurant si on la demande.' }],
            ['tea', 'thé', '🍵', { note: 'Au Royaume-Uni, le thé se boit le plus souvent noir, avec un nuage de lait.' }],
            ['coffee', 'café', '☕', { note: 'Un expresso se dit espresso, pas express !' }],
            ['milk', 'lait', '🥛'],
          ] },
          { title: 'Au pub', words: [
            ['pub', 'pub', '🍺', { note: 'Abréviation de public house. Au pub, on commande et on paie au bar : pas de service à table.' }],
            ['pint', 'pinte (environ 57 cl)', '🍺', { note: 'La pinte britannique fait 568 ml. Demi : a half.' }],
            ['cheers', 'santé ! / merci', '🍻', { note: 'Deux sens : « santé ! » en trinquant, et un « merci » familier très britannique (à un serveur, un chauffeur, un ami : cheers, mate!).' }],
            ['wine', 'vin', '🍷'],
            ['beer', 'bière', '🍺', { note: 'Au pub : a pint of beer, ou simplement a pint. Les bières pression : lager (blonde), bitter (brune, servie peu fraîche), ale.' }],
          ] },
          { title: 'Plats', words: [
            ['fish and chips', 'poisson-frites', '🐟', { note: 'Chips = frites au Royaume-Uni (fries aux États-Unis). Les chips françaises s\'appellent crisps.', alt: ['fish & chips', 'fish n chips'] }],
            ['breakfast', 'petit-déjeuner', '🍳', { note: 'Le full English breakfast : œufs, bacon, saucisses, haricots, champignons, tomate et toast.' }],
            ['sandwich', 'sandwich', '🍞'],
            ['cake', 'gâteau', '🍰'],
          ] },
          { title: 'Goûts', words: [
            ['delicious', 'délicieux', '😋', { note: 'Plus courant à l\'oral : lovely ou really good.' }],
            ['hungry', 'qui a faim', '🍽️', { note: 'On dit I\'m hungry (avec be) : j\'ai faim.' }],
            ['thirsty', 'qui a soif', '🥤', { note: 'I\'m thirsty = j\'ai soif.' }],
            ['vegetarian', 'végétarien', '🥗', { note: 'Les menus britanniques indiquent souvent (V) pour vegetarian et (VG) pour vegan.' }],
          ] },
          { title: 'L\'addition', words: [
            ['menu', 'carte (du restaurant)', '📋'],
            ['bill', 'addition', '🧾', { note: 'Aux États-Unis : check.' }],
            ['waiter', 'serveur', '🧑‍🍳', { note: 'On n\'appelle pas « Waiter ! » : on lève la main et on dit excuse me.' }],
            ['tip', 'pourboire', '🪙', { note: 'Environ 10 % au restaurant s\'il n\'est pas déjà inclus (service charge). Pas au pub.' }],
          ] },
          { title: 'Je voudrais…', grammar: 'would-like', sentences: [
            { jp: ['I\'d', 'like', 'a', 'coffee'], en: 'Je voudrais un café', alt: ['J\'aimerais un café', 'Un café s\'il vous plaît', 'Je voudrais un café s\'il vous plaît'] },
            { jp: ['I\'d', 'like', 'some', 'water'], en: 'Je voudrais de l\'eau', alt: ['J\'aimerais de l\'eau', 'De l\'eau s\'il vous plaît', 'Je voudrais un peu d\'eau'] },
            { jp: ['a', 'pint', 'please'], en: 'Une pinte s\'il vous plaît', alt: ['Une pinte s\'il te plaît', 'Une pinte'] },
            { jp: ['I\'m', 'vegetarian'], en: 'Je suis végétarien', alt: ['Je suis végétarienne'] },
          ] },
          { title: 'À table', sentences: [
            { jp: ['it\'s', 'delicious'], en: 'C\'est délicieux', alt: ['C\'est très bon', 'C\'est bon', 'Délicieux'] },
            { jp: ['I\'m', 'hungry'], en: 'J\'ai faim', alt: ['J\'ai très faim'] },
            { jp: ['can', 'I', 'have', 'the', 'bill', 'please'], en: 'Je peux avoir l\'addition s\'il vous plaît', alt: ['L\'addition s\'il vous plaît', 'Puis-je avoir l\'addition s\'il vous plaît', 'Est-ce que je peux avoir l\'addition s\'il vous plaît', 'Je peux avoir l\'addition'] },
          ] },
        ],
      },
      {
        id: 'shopping',
        title: 'Shopping & argent',
        desc: 'Les prix, les livres et les pence, payer par carte',
        facts: [FACT.city, FACT.sport],
        phrases: [PH.shop],
        dialogues: ['d-shop'],
        lessons: [
          { title: 'Combien ?', words: [
            ['how much', 'combien', '💰', { note: 'How much is it? = c\'est combien ?' }],
            ['price', 'prix', '🏷️'],
            ['cheap', 'pas cher', '👍', { note: 'Cheap peut aussi vouloir dire « de mauvaise qualité ». Plus flatteur : good value.' }],
            ['expensive', 'cher', '😱'],
          ] },
          { title: 'L\'argent', words: [
            ['pound', 'livre (sterling)', '🪙', { note: '£1 = one pound. Le signe £ se place devant le nombre : £5.' }],
            ['pence', 'pence (centimes)', '🪙', { note: '100 pence = 1 livre. À l\'oral on dit souvent p : 50p = fifty p.', alt: ['p', 'penny'] }],
            ['cash', 'espèces / liquide', '💵'],
            ['card', 'carte (bancaire)', '💳', { note: 'Le sans contact (contactless) est partout, même pour un café.' }],
          ] },
          { title: 'Au magasin', words: [
            ['shop', 'magasin', '🏪', { note: 'Aux États-Unis : store.' }],
            ['bag', 'sac', '🛍️', { note: 'Les sacs en plastique sont payants : on vous demandera Do you need a bag?' }],
            ['receipt', 'ticket de caisse', '🧾', { note: 'Le p ne se prononce pas : « ri-sîte ».' }],
            ['closed', 'fermé', '❌'],
            ['open', 'ouvert', '✅', { note: 'Open / closed sur la porte des magasins. Aussi un verbe : What time do you open? = vous ouvrez à quelle heure ?' }],
          ] },
          { title: 'Vêtements', words: [
            ['jumper', 'pull', '🧥', { note: 'Aux États-Unis : sweater.', alt: ['sweater'] }],
            ['T-shirt', 'tee-shirt', '👕', { alt: ['t-shirt', 'tshirt'] }],
            ['shoes', 'chaussures', '👢'],
            ['umbrella', 'parapluie', '☂️', { note: 'Le meilleur achat d\'un séjour au Royaume-Uni !' }],
          ] },
          { title: 'C\'est combien ?', grammar: 'do-question', sentences: [
            { jp: ['how much', 'is', 'this'], en: 'Combien ça coûte', alt: ['C\'est combien', 'Ça coûte combien', 'Combien coûte ceci', 'Combien est-ce'] },
            { jp: ['do', 'you', 'have', 'a', 'bag'], en: 'Vous avez un sac', alt: ['Avez-vous un sac', 'Est-ce que vous avez un sac', 'Tu as un sac', 'As-tu un sac'] },
            { jp: ['can', 'I', 'pay', 'by', 'card'], en: 'Je peux payer par carte', alt: ['Puis-je payer par carte', 'Est-ce que je peux payer par carte', 'Je peux payer avec la carte'] },
            { jp: ['it\'s', 'too', 'expensive'], en: 'C\'est trop cher', alt: ['Trop cher'] },
          ] },
          { title: 'Je regarde', sentences: [
            { jp: ['I\'m', 'just', 'looking'], en: 'Je regarde seulement', alt: ['Je regarde juste', 'Je ne fais que regarder', 'Je regarde'] },
            { jp: ['do', 'you', 'take', 'cash'], en: 'Vous acceptez les espèces', alt: ['Acceptez-vous les espèces', 'Vous prenez le liquide', 'Est-ce que vous acceptez les espèces', 'Vous acceptez le liquide'] },
            { jp: ['the', 'shop', 'is', 'closed'], en: 'Le magasin est fermé', alt: ['La boutique est fermée'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday English',
    units: [
      {
        id: 'numbers',
        title: 'Nombres & heure',
        desc: 'Compter, dire l\'heure et parler des jours',
        facts: [FACT.history, FACT.sport],
        phrases: [PH.shop, PH.hotel],
        dialogues: ['d-time'],
        lessons: [
          { title: '1 à 4', words: [
            ['one', 'un', '1️⃣', { alt: ['1'] }],
            ['two', 'deux', '2️⃣', { note: 'Se prononce comme to et too : le contexte fait la différence.', alt: ['2'] }],
            ['three', 'trois', '3️⃣', { note: 'Le th se prononce langue entre les dents, pas « tri ».', alt: ['3'] }],
            ['four', 'quatre', '4️⃣', { alt: ['4', 'for'] }],
          ] },
          { title: '5 à 8', words: [
            ['five', 'cinq', '5️⃣', { alt: ['5'] }],
            ['six', 'six', '6️⃣', { alt: ['6'] }],
            ['seven', 'sept', '7️⃣', { alt: ['7'] }],
            ['eight', 'huit', '8️⃣', { alt: ['8', 'ate'] }],
          ] },
          { title: '9 à 100', words: [
            ['nine', 'neuf', '9️⃣', { alt: ['9'] }],
            ['ten', 'dix', '🔟', { alt: ['10'] }],
            ['twenty', 'vingt', '🔢', { note: 'Puis twenty-one, twenty-two… Plus simple qu\'en français : pas de soixante-dix !', alt: ['20'] }],
            ['hundred', 'cent', '💯', { note: 'On dit a hundred ou one hundred. 250 = two hundred and fifty (le and est britannique).', alt: ['100', 'a hundred', 'one hundred'] }],
          ] },
          { title: 'L\'heure', words: [
            ['o\'clock', 'heure(s) pile', '🕐', { note: 'Seulement pour l\'heure pile : three o\'clock = 3 h 00.', alt: ['oclock'] }],
            ['half past', 'et demie', '🕧', { note: 'Half past two = 2 h 30. À l\'oral britannique, on raccourcit : half two = 2 h 30 (et non 1 h 30 !).' }],
            ['quarter', 'quart', '🕒', { note: 'Quarter past = et quart ; quarter to = moins le quart.' }],
            ['minute', 'minute', '⏱️'],
          ] },
          { title: 'Les jours', words: [
            ['today', 'aujourd\'hui', '📅'],
            ['tomorrow', 'demain', '📅'],
            ['Monday', 'lundi', '📅', { note: 'Les jours prennent une majuscule en anglais : Monday, Tuesday, Wednesday…', alt: ['monday'] }],
            ['yesterday', 'hier', '📅', { note: 'Yesterday morning = hier matin, yesterday evening = hier soir.' }],
            ['weekend', 'week-end', '😎'],
          ] },
          { title: 'Quelle heure est-il ?', grammar: 'time', sentences: [
            { jp: ['what', 'time', 'is', 'it'], en: 'Quelle heure est-il', alt: ['Il est quelle heure', 'Quelle heure il est'] },
            { jp: ['it\'s', 'three', 'o\'clock'], en: 'Il est trois heures', alt: ['Il est 3 heures', 'Il est 3 h', 'Trois heures'] },
            { jp: ['it\'s', 'half past', 'two'], en: 'Il est deux heures et demie', alt: ['Il est 2 h 30', 'Il est deux heures trente', 'Deux heures et demie'] },
            { jp: ['see', 'you', 'tomorrow'], en: 'À demain', alt: ['On se voit demain', 'À demain alors'] },
          ] },
          { title: 'Deux billets', grammar: 'plural', sentences: [
            { jp: ['two', 'tickets', 'please'], en: 'Deux billets s\'il vous plaît', alt: ['Deux tickets s\'il vous plaît', 'Deux billets s\'il te plaît', 'Deux billets'] },
            { jp: ['three', 'coffees', 'please'], en: 'Trois cafés s\'il vous plaît', alt: ['Trois cafés s\'il te plaît', 'Trois cafés'] },
            { jp: ['I\'ve', 'got', 'two', 'bags'], en: 'J\'ai deux sacs', alt: ['J\'ai 2 sacs'] },
          ] },
        ],
      },
      {
        id: 'people',
        title: 'Les gens & la famille',
        desc: 'Se présenter, parler de sa famille et de son métier',
        facts: [FACT.history, FACT.language],
        phrases: [PH.polite],
        dialogues: ['d-meet'],
        lessons: [
          { title: 'La famille', words: [
            ['family', 'famille', '🧑‍🤝‍🧑'],
            ['mum', 'maman', '💝', { note: 'Aux États-Unis : mom. Plus formel : mother.', alt: ['mom', 'mother'] }],
            ['dad', 'papa', '👔', { note: 'Plus formel : father.', alt: ['father'] }],
            ['grandma', 'mamie', '🧓', { note: 'Plus formel : grandmother. Aussi : nan ou nana dans beaucoup de familles britanniques.', alt: ['grandmother', 'granny', 'nan', 'nana'] }],
          ] },
          { title: 'Frères & sœurs', words: [
            ['brother', 'frère', '👫'],
            ['sister', 'sœur', '👫'],
            ['child', 'enfant', '🎒', { note: 'Pluriel irrégulier : children. Familier : kid, kids.', alt: ['kid'] }],
            ['children', 'enfants', '🎒', { alt: ['kids'] }],
          ] },
          { title: 'Les gens', words: [
            ['friend', 'ami / amie', '🤝', { note: 'Pas de genre en anglais : friend vaut pour un ami comme pour une amie.' }],
            ['man', 'homme', '🧑', { note: 'Pluriel irrégulier : men.' }],
            ['woman', 'femme', '🧑', { note: 'Pluriel irrégulier : women (prononcé « oui-mine »).' }],
            ['name', 'nom / prénom', '📛', { note: 'First name = prénom, surname = nom de famille.' }],
          ] },
          { title: 'Métiers', words: [
            ['teacher', 'professeur', '🧑‍🏫'],
            ['student', 'étudiant', '🧑‍🎓'],
            ['doctor', 'médecin', '🧑‍⚕️', { note: 'S\'abrège Dr devant un nom : Dr Smith.' }],
            ['chef', 'cuisinier / chef', '🧑‍🍳', { note: 'Ch se prononce « ch » comme en français : un mot emprunté !' }],
          ] },
          { title: 'Nationalités', words: [
            ['French', 'français', '🇫🇷', { note: 'Les nationalités et les langues prennent une majuscule en anglais.', alt: ['french'] }],
            ['English', 'anglais', '🇬🇧', { note: 'English = d\'Angleterre. Un Écossais ou un Gallois est British, pas English !', alt: ['english'] }],
            ['British', 'britannique', '🇬🇧', { alt: ['british'] }],
            ['American', 'américain', '🇺🇸', { alt: ['american'] }],
          ] },
          { title: 'Je m\'appelle…', grammar: 'possessive', sentences: [
            { jp: ['my', 'name', 'is', 'Emma'], en: 'Je m\'appelle Emma', alt: ['Mon nom est Emma', 'Mon prénom est Emma', 'Moi c\'est Emma'] },
            { jp: ['I\'m', 'French'], en: 'Je suis français', alt: ['Je suis française'] },
            { jp: ['where', 'are', 'you', 'from'], en: 'D\'où venez-vous', alt: ['D\'où viens-tu', 'Tu viens d\'où', 'Vous venez d\'où', 'D\'où est-ce que tu viens'] },
            { jp: ['this', 'is', 'my', 'sister'], en: 'Voici ma sœur', alt: ['C\'est ma sœur', 'Je te présente ma sœur', 'Je vous présente ma sœur'] },
          ] },
          { title: 'Mon métier', grammar: 'a-an', sentences: [
            { jp: ['she', 'is', 'a', 'teacher'], en: 'Elle est professeure', alt: ['Elle est professeur', 'Elle est prof', 'Elle est enseignante', 'C\'est une prof', 'C\'est une professeure'] },
            { jp: ['he', 'is', 'a', 'doctor'], en: 'Il est médecin', alt: ['Il est docteur', 'C\'est un médecin'] },
            { jp: ['I\'m', 'a', 'student'], en: 'Je suis étudiant', alt: ['Je suis étudiante'] },
            { jp: ['I\'ve', 'got', 'a', 'brother'], en: 'J\'ai un frère' },
          ] },
        ],
      },
      {
        id: 'home',
        title: 'Maison & quotidien',
        desc: 'La maison, les objets et les habitudes de tous les jours',
        facts: [FACT.traditions, FACT.city],
        phrases: [PH.hotel],
        dialogues: ['d-flat'],
        lessons: [
          { title: 'La maison', words: [
            ['house', 'maison', '🏠'],
            ['flat', 'appartement', '🏙️', { note: 'Aux États-Unis : apartment.', alt: ['apartment'] }],
            ['bedroom', 'chambre', '🛏️'],
            ['kitchen', 'cuisine', '🍳'],
            ['room', 'pièce / chambre d\'hôtel', '🛎️', { note: 'Une chambre d\'hôtel : a room (a double room, a single room). Pour la chambre à coucher chez soi : bedroom.' }],
          ] },
          { title: 'Dehors & dedans', words: [
            ['garden', 'jardin', '🌳', { note: 'Aux États-Unis : yard. Les Britanniques adorent jardiner.' }],
            ['door', 'porte', '🚪'],
            ['key', 'clé', '🔑', { alt: ['keys'] }],
          ] },
          { title: 'Objets', words: [
            ['sofa', 'canapé', '🛋️', { note: 'Aussi : settee ou couch.', alt: ['couch', 'settee'] }],
            ['phone', 'téléphone', '📱', { note: 'Un portable : a mobile (phone). Aux États-Unis : a cell phone.', alt: ['mobile'] }],
            ['kettle', 'bouilloire', '♨️', { note: 'Chaque foyer britannique en a une : on met la bouilloire en route (put the kettle on) à toute occasion.' }],
          ] },
          { title: 'Verbes du quotidien', words: [
            ['work', 'travailler', '💼'],
            ['eat', 'manger', '🍽️'],
            ['sleep', 'dormir', '😴'],
            ['live', 'habiter / vivre', '🏠', { note: 'I live in London = j\'habite à Londres.' }],
          ] },
          { title: 'Moments', words: [
            ['morning', 'matin', '🌅'],
            ['evening', 'soir', '🌃'],
            ['night', 'nuit', '🌙'],
            ['every day', 'tous les jours', '📅', { note: 'En deux mots ! Everyday en un mot est un adjectif : everyday English = l\'anglais de tous les jours.' }],
          ] },
          { title: 'Ma journée', grammar: 'present-simple', sentences: [
            { jp: ['I', 'work', 'every day'], en: 'Je travaille tous les jours', alt: ['Je travaille chaque jour'] },
            { jp: ['she', 'works', 'in', 'London'], en: 'Elle travaille à Londres' },
            { jp: ['I', 'live', 'in', 'a', 'flat'], en: 'J\'habite dans un appartement', alt: ['Je vis dans un appartement', 'J\'habite un appartement', 'Je vis en appartement', 'J\'habite en appartement'] },
            { jp: ['we', 'eat', 'in', 'the', 'kitchen'], en: 'Nous mangeons dans la cuisine', alt: ['On mange dans la cuisine', 'On mange à la cuisine'] },
          ] },
          { title: 'Il y a…', grammar: 'there-is', sentences: [
            { jp: ['there', 'is', 'a', 'garden'], en: 'Il y a un jardin', alt: ['Il y a un jardin ici'] },
            { jp: ['there', 'are', 'two', 'bedrooms'], en: 'Il y a deux chambres', alt: ['Il y a 2 chambres'] },
            { jp: ['where', 'are', 'my', 'keys'], en: 'Où sont mes clés', alt: ['Mes clés sont où', 'Elles sont où mes clés'] },
          ] },
        ],
      },
      {
        id: 'weather',
        title: 'Météo & saisons',
        desc: 'Le sujet de conversation préféré des Britanniques',
        facts: [FACT.nature],
        phrases: [PH.polite],
        dialogues: ['d-weather'],
        lessons: [
          { title: 'Le temps', words: [
            ['weather', 'temps (météo)', '☁️', { note: 'Ne pas confondre avec whether (si), qui se prononce pareil.' }],
            ['sun', 'soleil', '☀️'],
            ['rain', 'pluie', '☂️', { note: 'It\'s raining = il pleut. Une petite pluie fine : drizzle.' }],
            ['snow', 'neige', '❄️'],
          ] },
          { title: 'Quel temps fait-il ?', words: [
            ['sunny', 'ensoleillé', '☀️', { note: 'It\'s sunny = il fait beau, il y a du soleil.' }],
            ['cloudy', 'nuageux', '☁️'],
            ['windy', 'venteux', '🍃', { note: 'It\'s windy = il y a du vent.' }],
            ['lovely', 'magnifique / adorable', '😍', { note: 'Mot préféré des Britanniques : a lovely day, lovely tea, lovely to see you…' }],
          ] },
          { title: 'Chaud & froid', words: [
            ['hot', 'chaud', '🔥', { note: 'It\'s hot = il fait chaud. Plus doux : warm.' }],
            ['warm', 'doux / tiède', '😌'],
            ['cold', 'froid', '🧊', { note: 'It\'s cold = il fait froid ; I\'m cold = j\'ai froid.' }],
          ] },
          { title: 'Saisons', words: [
            ['spring', 'printemps', '🌸'],
            ['summer', 'été', '☀️'],
            ['autumn', 'automne', '🍃', { note: 'Aux États-Unis : fall.', alt: ['fall'] }],
            ['winter', 'hiver', '❄️'],
          ] },
          { title: 'Il pleut !', sentences: [
            { jp: ['it\'s', 'raining'], en: 'Il pleut', alt: ['Il est en train de pleuvoir'] },
            { jp: ['it\'s', 'cold', 'today'], en: 'Il fait froid aujourd\'hui', alt: ['Aujourd\'hui il fait froid'] },
            { jp: ['it\'s', 'a', 'lovely', 'day'], en: 'C\'est une belle journée', alt: ['Il fait beau aujourd\'hui', 'Quelle belle journée', 'C\'est une journée magnifique'] },
            { jp: ['I', 'love', 'summer'], en: 'J\'adore l\'été', alt: ['J\'aime l\'été'] },
          ] },
          { title: 'Prends un parapluie', sentences: [
            { jp: ['take', 'an', 'umbrella'], en: 'Prends un parapluie', alt: ['Prenez un parapluie'] },
            { jp: ['it\'s', 'sunny', 'in', 'London'], en: 'Il fait beau à Londres', alt: ['Il y a du soleil à Londres', 'C\'est ensoleillé à Londres'] },
            { jp: ['I', 'don\'t', 'like', 'winter'], en: 'Je n\'aime pas l\'hiver', alt: ['J\'aime pas l\'hiver'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'real',
    title: 'Real English',
    units: [
      {
        id: 'feelings',
        title: 'Émotions & small talk',
        desc: 'Dire comment on se sent et faire la conversation',
        facts: [FACT.sport, FACT.traditions],
        phrases: [PH.polite],
        dialogues: ['d-smalltalk'],
        lessons: [
          { title: 'Comment te sens-tu ?', words: [
            ['happy', 'heureux / content', '😊'],
            ['sad', 'triste', '😔'],
            ['tired', 'fatigué', '😴'],
            ['bored', 'qui s\'ennuie', '🙄', { note: 'I\'m bored = je m\'ennuie. Attention : I\'m boring = je suis ennuyeux !' }],
          ] },
          { title: 'Émotions fortes', words: [
            ['excited', 'impatient / tout excité', '🤩', { note: 'Faux ami : I\'m excited = j\'ai hâte, c\'est génial ! Rien de gênant.' }],
            ['angry', 'en colère', '😤'],
            ['worried', 'inquiet', '😔'],
            ['relaxed', 'détendu', '😌'],
          ] },
          { title: 'Réagir', words: [
            ['really', 'vraiment / ah bon ?', '😲', { note: 'Really? = ah bon ? Pour montrer qu\'on écoute.' }],
            ['great', 'super', '👍'],
            ['not bad', 'pas mal', '👌', { note: 'Litote très britannique : not bad peut vouloir dire « très bien » !' }],
          ] },
          { title: 'Loisirs', words: [
            ['football', 'football', '⚽', { note: 'Aux États-Unis : soccer (football = football américain). Familier au Royaume-Uni : footy.', alt: ['soccer'] }],
            ['music', 'musique', '🎵'],
            ['film', 'film', '🎭', { note: 'Aux États-Unis : movie. Aller au cinéma : go to the cinema (US : the movies).', alt: ['movie'] }],
            ['book', 'livre', '📖'],
            ['holiday', 'vacances', '✈️', { note: 'On holiday = en vacances. Aux États-Unis : vacation.', alt: ['vacation'] }],
          ] },
          { title: 'J\'aime, je n\'aime pas', grammar: 'negation', sentences: [
            { jp: ['I\'m', 'tired'], en: 'Je suis fatigué', alt: ['Je suis fatiguée'] },
            { jp: ['I\'m', 'not', 'sad'], en: 'Je ne suis pas triste', alt: ['Je suis pas triste'] },
            { jp: ['I', 'like', 'football'], en: 'J\'aime le football', alt: ['J\'aime le foot', 'J\'adore le foot', 'J\'adore le football'] },
            { jp: ['I', 'don\'t', 'like', 'rain'], en: 'Je n\'aime pas la pluie', alt: ['J\'aime pas la pluie'] },
          ] },
          { title: 'Et toi ?', sentences: [
            { jp: ['do', 'you', 'like', 'music'], en: 'Tu aimes la musique', alt: ['Aimes-tu la musique', 'Vous aimez la musique', 'Aimez-vous la musique', 'Est-ce que tu aimes la musique'] },
            { jp: ['are', 'you', 'OK'], en: 'Ça va', alt: ['Tu vas bien', 'Vous allez bien', 'Ça va bien', 'Tout va bien'] },
            { jp: ['not bad', 'thanks'], en: 'Pas mal merci', alt: ['Pas mal, merci', 'Ça va merci'] },
            { jp: ['I\'m', 'on', 'holiday'], en: 'Je suis en vacances' },
          ] },
        ],
      },
      {
        id: 'help',
        title: 'Aide & santé',
        desc: 'Pharmacie, médecin, urgences… et faire répéter',
        facts: [FACT.history, FACT.nature],
        phrases: [PH.help],
        dialogues: ['d-chemist'],
        lessons: [
          { title: 'Urgences', words: [
            ['help', 'à l\'aide / aider', '🆘', { note: 'Help! = au secours ! Le numéro d\'urgence au Royaume-Uni est le 999 (le 112 marche aussi).' }],
            ['police', 'police', '👮'],
            ['ambulance', 'ambulance', '🚑'],
            ['hospital', 'hôpital', '🏥', { note: 'Les urgences : A&E (Accident and Emergency). Aux États-Unis : the ER.' }],
          ] },
          { title: 'Santé', words: [
            ['chemist', 'pharmacie', '💊', { note: 'Aussi : pharmacy. Aux États-Unis : drugstore.', alt: ['pharmacy', 'chemist\'s'] }],
            ['medicine', 'médicament', '💊'],
            ['headache', 'mal de tête', '🤕', { note: 'Ache = douleur : toothache (mal de dents), stomach ache (mal de ventre).' }],
            ['a cold', 'un rhume', '🤧', { note: 'I\'ve got a cold = j\'ai un rhume.' }],
            ['allergic', 'allergique', '🤧', { note: 'I\'m allergic to nuts = je suis allergique aux noix. À dire au restaurant avant de commander.' }],
          ] },
          { title: 'Problèmes', words: [
            ['lost', 'perdu', '🗺️', { note: 'I\'m lost = je suis perdu. I\'ve lost my bag = j\'ai perdu mon sac.' }],
            ['passport', 'passeport', '📕'],
            ['wallet', 'portefeuille', '💰', { note: 'Pour un porte-monnaie : purse. Aux États-Unis, purse = sac à main.' }],
            ['need', 'avoir besoin de', '🙋', { note: 'I need = j\'ai besoin de, il me faut.' }],
          ] },
          { title: 'Comprendre', words: [
            ['understand', 'comprendre', '🤷'],
            ['slowly', 'lentement', '⏱️'],
            ['again', 'encore / de nouveau', '🔁'],
            ['speak', 'parler', '🗣️'],
          ] },
          { title: 'J\'ai besoin d\'un médecin', sentences: [
            { jp: ['I', 'need', 'a', 'doctor'], en: 'J\'ai besoin d\'un médecin', alt: ['Il me faut un médecin', 'J\'ai besoin d\'un docteur'] },
            { jp: ['call', 'an', 'ambulance'], en: 'Appelez une ambulance', alt: ['Appelle une ambulance'] },
            { jp: ['I\'ve', 'got', 'a', 'headache'], en: 'J\'ai mal à la tête', alt: ['J\'ai un mal de tête'] },
            { jp: ['I\'ve', 'lost', 'my', 'passport'], en: 'J\'ai perdu mon passeport' },
          ] },
          { title: 'Vous pouvez répéter ?', grammar: 'can', sentences: [
            { jp: ['can', 'you', 'help', 'me'], en: 'Vous pouvez m\'aider', alt: ['Pouvez-vous m\'aider', 'Tu peux m\'aider', 'Peux-tu m\'aider', 'Est-ce que vous pouvez m\'aider'] },
            { jp: ['I', 'don\'t', 'understand'], en: 'Je ne comprends pas', alt: ['Je comprends pas'] },
            { jp: ['can', 'you', 'speak', 'slowly'], en: 'Vous pouvez parler lentement', alt: ['Pouvez-vous parler lentement', 'Tu peux parler lentement', 'Vous pouvez parler doucement'] },
            { jp: ['do', 'you', 'speak', 'French'], en: 'Vous parlez français', alt: ['Parlez-vous français', 'Tu parles français', 'Est-ce que vous parlez français', 'Est-ce que tu parles français', 'Parles-tu français'] },
            { jp: ['can', 'you', 'say', 'that', 'again'], en: 'Vous pouvez répéter', alt: ['Pouvez-vous répéter', 'Tu peux répéter', 'Vous pouvez le redire', 'Pouvez-vous répéter ça'] },
          ] },
        ],
      },
      {
        id: 'casual',
        title: 'Familier & argot',
        desc: 'Parler comme un vrai Britannique (ou presque)',
        facts: [FACT.language, FACT.food],
        phrases: [PH.food, PH.polite],
        dialogues: ['d-pub'],
        lessons: [
          { title: 'Salut, mon pote', words: [
            ['mate', 'pote', '🤝', { note: 'Très courant, même avec un inconnu : Cheers, mate! Aux États-Unis : buddy, dude.' }],
            ['hiya', 'coucou', '👋', { note: 'Salut amical, surtout dans le nord de l\'Angleterre.' }],
            ['all right', 'salut, ça va ?', '🙋', { note: 'Souvent dit « alright? » : c\'est un bonjour, pas une vraie question. Réponse : Yeah, you?', alt: ['alright'] }],
            ['ta', 'merci (très familier)', '🙏', { note: 'Surtout dans le nord de l\'Angleterre.' }],
          ] },
          { title: 'Génial !', words: [
            ['brilliant', 'génial', '🤩', { note: 'Très britannique ; familier : brill.' }],
            ['cool', 'cool', '😎'],
            ['awesome', 'génial (US)', '💯', { note: 'Plutôt américain, mais très répandu chez les jeunes Britanniques.' }],
            ['no worries', 'pas de souci', '👌', { note: 'Venu d\'Australie, très courant pour répondre à un merci.' }],
          ] },
          { title: 'Argot britannique', words: [
            ['quid', 'livre (argent, familier)', '💵', { note: 'Invariable : five quid, jamais five quids.' }],
            ['loo', 'les toilettes (familier)', '🚽'],
            ['knackered', 'crevé', '😴'],
            ['gutted', 'dégoûté / très déçu', '😔'],
          ] },
          { title: 'Un petit thé ?', words: [
            ['cuppa', 'une tasse de thé', '🍵', { note: 'De cup of : Fancy a cuppa? = Un petit thé ?' }],
            ['fancy', 'avoir envie de', '😋', { note: 'Fancy a drink? = ça te dit un verre ? Aux États-Unis : want a drink?' }],
            ['fair enough', 'soit / c\'est juste', '👍', { note: 'Pour accepter un argument ou un refus sans discuter : « soit », « d\'accord, c\'est raisonnable ».' }],
            ['bless you', 'à vos souhaits', '🤧'],
          ] },
          { title: 'Comme au pub', sentences: [
            { jp: ['fancy', 'a', 'cuppa'], en: 'Tu veux un thé', alt: ['Un petit thé', 'Ça te dit un thé', 'Tu as envie d\'un thé', 'Tu veux une tasse de thé'] },
            { jp: ['I\'m', 'knackered'], en: 'Je suis crevé', alt: ['Je suis crevée', 'Je suis épuisé', 'Je suis épuisée', 'Je suis claqué'] },
            { jp: ['it\'s', 'five', 'quid'], en: 'Ça fait cinq livres', alt: ['C\'est cinq livres', 'Cinq livres', 'Ça coûte cinq livres'] },
            { jp: ['let\'s', 'go', 'to', 'the', 'pub'], en: 'Allons au pub', alt: ['On va au pub', 'Si on allait au pub'] },
          ] },
          { title: 'Cheers, mate', sentences: [
            { jp: ['cheers', 'mate'], en: 'Merci mon pote', alt: ['Merci mec', 'Merci l\'ami', 'Santé mon pote'] },
            { jp: ['that\'s', 'brilliant'], en: 'C\'est génial', alt: ['C\'est super', 'C\'est top', 'Génial'] },
            { jp: ['where\'s', 'the', 'loo'], en: 'Où sont les toilettes', alt: ['Elles sont où les toilettes', 'Où sont les WC', 'C\'est où les toilettes'] },
          ] },
        ],
      },
    ],
  },
];

// Mini-dialogues ("Listen in"): who: 0 = cast[0], 1 = cast[1] (woman = Emma, woman2 = Olivia).
// `jp` holds the English line, `en` its French translation.
export const DIALOGUES = {
  'd-hello': {
    title: 'Première rencontre',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Hello! I\'m Emma. Nice to meet you.', en: 'Bonjour ! Je suis Emma. Enchantée.' },
      { who: 1, jp: 'Hi, Emma! I\'m Olivia. How are you?', en: 'Salut, Emma ! Je suis Olivia. Comment vas-tu ?' },
      { who: 0, jp: 'I\'m fine, thanks. And you?', en: 'Je vais bien, merci. Et toi ?' },
      { who: 1, jp: 'Very well, thank you!', en: 'Très bien, merci !' },
    ],
    question: 'Comment va Olivia ?',
    options: ['Très bien', 'Elle est fatiguée', 'Elle est malade'],
  },
  'd-station': {
    title: 'À la gare',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Excuse me, where is platform 4?', en: 'Excusez-moi, où est le quai 4 ?' },
      { who: 1, jp: 'Go straight on. It\'s on the left.', en: 'Allez tout droit. C\'est à gauche.' },
      { who: 0, jp: 'Thanks! When is the next train to Oxford?', en: 'Merci ! Quand est le prochain train pour Oxford ?' },
      { who: 1, jp: 'In ten minutes.', en: 'Dans dix minutes.' },
    ],
    question: 'Où est le quai 4 ?',
    options: ['Tout droit, puis à gauche', 'Tout droit, puis à droite', 'À côté de l\'hôtel'],
  },
  'd-cafe': {
    title: 'Au café',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Hi! What can I get you?', en: 'Bonjour ! Qu\'est-ce que je vous sers ?' },
      { who: 1, jp: 'I\'d like a tea with milk, please.', en: 'Je voudrais un thé au lait, s\'il vous plaît.' },
      { who: 0, jp: 'Anything to eat?', en: 'Quelque chose à manger ?' },
      { who: 1, jp: 'A piece of cake, please. Thank you!', en: 'Une part de gâteau, s\'il vous plaît. Merci !' },
      { who: 0, jp: 'Of course! Take a seat.', en: 'Bien sûr ! Installez-vous.' },
    ],
    question: 'Qu\'est-ce qu\'Olivia commande ?',
    options: ['Un thé au lait et du gâteau', 'Un café et un sandwich', 'Une pinte et du poisson-frites'],
  },
  'd-shop': {
    title: 'Le pull',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Excuse me, how much is this jumper?', en: 'Excusez-moi, combien coûte ce pull ?' },
      { who: 1, jp: 'It\'s forty pounds.', en: 'Il fait quarante livres.' },
      { who: 0, jp: 'Oh, that\'s too expensive. I\'m just looking, thanks.', en: 'Oh, c\'est trop cher. Je regarde seulement, merci.' },
      { who: 1, jp: 'No problem!', en: 'Pas de problème !' },
    ],
    question: 'Est-ce qu\'Olivia achète le pull ?',
    options: ['Non, il est trop cher', 'Oui, elle paie en espèces', 'Oui, elle paie par carte'],
  },
  'd-time': {
    title: 'On se voit quand ?',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'What time is the train tomorrow?', en: 'À quelle heure est le train demain ?' },
      { who: 1, jp: 'At half past seven.', en: 'À sept heures et demie.' },
      { who: 0, jp: 'OK! See you at seven o\'clock at the station?', en: 'D\'accord ! On se retrouve à sept heures à la gare ?' },
      { who: 1, jp: 'Yes, see you tomorrow!', en: 'Oui, à demain !' },
    ],
    question: 'À quelle heure se retrouvent-elles ?',
    options: ['À sept heures, à la gare', 'À sept heures et demie, au pub', 'À huit heures, au pub'],
  },
  'd-meet': {
    title: 'Faire connaissance',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Where are you from, Emma?', en: 'Tu viens d\'où, Emma ?' },
      { who: 1, jp: 'I\'m from Manchester. And you?', en: 'Je viens de Manchester. Et toi ?' },
      { who: 0, jp: 'I\'m from Edinburgh. I\'m a teacher.', en: 'Je viens d\'Édimbourg. Je suis professeure.' },
      { who: 1, jp: 'Oh! My sister is a teacher too!', en: 'Oh ! Ma sœur aussi est professeure !' },
    ],
    question: 'Qui est professeure ?',
    options: ['Olivia et la sœur d\'Emma', 'Emma et sa mère', 'Personne'],
  },
  'd-flat': {
    title: 'Le nouvel appartement',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'I live in a new flat now!', en: 'J\'habite dans un nouvel appartement maintenant !' },
      { who: 1, jp: 'Oh, OK! Is there a garden?', en: 'Ah, d\'accord ! Il y a un jardin ?' },
      { who: 0, jp: 'No, but there are two bedrooms and a big kitchen.', en: 'Non, mais il y a deux chambres et une grande cuisine.' },
      { who: 1, jp: 'OK! I\'ll put the kettle on.', en: 'D\'accord ! Je mets la bouilloire en route.' },
    ],
    question: 'Qu\'est-ce qu\'il n\'y a pas dans l\'appartement ?',
    options: ['Un jardin', 'Une cuisine', 'Des chambres'],
  },
  'd-weather': {
    title: 'Encore la pluie',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'It\'s raining again!', en: 'Il pleut encore !' },
      { who: 1, jp: 'Yes, and it\'s cold. Typical British summer!', en: 'Oui, et il fait froid. Un été britannique typique !' },
      { who: 0, jp: 'Take an umbrella. Tomorrow will be sunny.', en: 'Prends un parapluie. Demain, il fera beau.' },
    ],
    question: 'Quel temps fera-t-il demain ?',
    options: ['Il fera beau', 'Il pleuvra', 'Il neigera'],
  },
  'd-smalltalk': {
    title: 'Lundi matin',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Hi! How was your weekend?', en: 'Salut ! C\'était comment, ton week-end ?' },
      { who: 1, jp: 'Not bad, thanks. I watched the football. You?', en: 'Pas mal, merci. J\'ai regardé le foot. Et toi ?' },
      { who: 0, jp: 'I\'m tired. My brother had a party!', en: 'Je suis fatiguée. Mon frère a fait une fête !' },
    ],
    question: 'Pourquoi Emma est-elle fatiguée ?',
    options: ['Son frère a fait une fête', 'Elle a joué au football', 'Elle a beaucoup travaillé'],
  },
  'd-chemist': {
    title: 'À la pharmacie',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Hello, can you help me? I\'ve got a headache.', en: 'Bonjour, vous pouvez m\'aider ? J\'ai mal à la tête.' },
      { who: 1, jp: 'Of course. Take two of these every four hours.', en: 'Bien sûr. Prenez-en deux toutes les quatre heures.' },
      { who: 0, jp: 'Sorry, can you speak slowly?', en: 'Pardon, vous pouvez parler lentement ?' },
      { who: 1, jp: 'Two tablets… every four hours.', en: 'Deux comprimés… toutes les quatre heures.' },
    ],
    question: 'Combien de comprimés Olivia doit-elle prendre ?',
    options: ['Deux toutes les quatre heures', 'Quatre toutes les deux heures', 'Un seul par jour'],
  },
  'd-pub': {
    title: 'Au pub',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Fancy a drink? It\'s my round.', en: 'Ça te dit un verre ? C\'est ma tournée.' },
      { who: 1, jp: 'Brilliant! A pint, please.', en: 'Génial ! Une pinte, s\'il te plaît.' },
      { who: 0, jp: 'Here you go. Cheers!', en: 'Et voilà. Santé !' },
      { who: 1, jp: 'Cheers, mate! I\'ll get the next one.', en: 'Santé ! La prochaine, c\'est pour moi.' },
    ],
    question: 'Qui paie la première tournée ?',
    options: ['Emma : c\'est sa tournée', 'Olivia', 'Chacune paie la sienne'],
  },
};
