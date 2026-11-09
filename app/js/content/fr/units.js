// The French course: themed units of essential words and sentences, same format as the
// Japanese course (../units.js) but without romanisation. Standard metropolitan French.
//
// Word: [french, english, art (emoji drawn in the cartoon art set), extras?]
//   Nouns come with their article (le, la, l', les) so the gender is learned with the word.
//   extras: { note: when / how it is used, alt: [other forms speech recognition may return] }
// Sentence: { jp: [chunks], en, alt?: [other accepted translations] }
//   Chunks are lowercase (except names) so tiles do not give the order away; no final punctuation.
// Lesson: { title, words?, sentences?, grammar?: id of a grammar card shown before the sentences }
// Unit: { id, title, desc, facts: [fun-fact categories for breaks], phrases, lessons, dialogues?: [ids] }

const FACT = {
  food: 'Food & Wine',
  city: 'Paris & Cities',
  history: 'History & Heritage',
  culture: 'Art & Culture',
  daily: 'Everyday Life & Customs',
  language: 'The French Language',
  nature: 'Regions & Nature',
  transport: 'Transport & Travel',
};

const PHRASE = {
  basics: 'Key Polite Basics',
  around: 'Getting Around',
  cafe: 'Café & Restaurant',
  shopping: 'Shopping & Paying',
  hotel: 'Hotel & Practical',
  help: 'Help & Emergency',
};

export const SECTIONS_DATA = [
  {
    id: 'france',
    title: 'First trip to France',
    units: [
      {
        id: 'hello',
        title: 'Hello & thank you',
        desc: 'Greet people, thank them and say sorry',
        facts: [FACT.language, FACT.daily],
        phrases: [PHRASE.basics],
        dialogues: ['d-bonjour', 'd-bonjour2'],
        lessons: [
          { title: 'Hello', words: [
            ['bonjour', 'hello / good morning', '👋', { note: 'Say it to everyone when you walk into a shop, a café or a bus. Skipping it sounds rude!' }],
            ['bonsoir', 'good evening', '🌙', { note: 'From late afternoon on, instead of bonjour.' }],
            ['salut', 'hi / bye (casual)', '😀', { note: 'Only with friends and people your age. It works for hello and for goodbye.' }],
            ['madame', 'madam / Mrs', '🪭', { note: 'Add it to a greeting to be polite: bonjour madame. Said on its own, it is how you address a woman.' }],
            ['monsieur', 'sir / Mr', '👔', { note: 'Bonjour monsieur. Never say "mademoiselle" anymore: madame is used for every adult woman.' }],
          ] },
          { title: 'Thank you', words: [
            ['merci', 'thank you', '🙏'],
            ['merci beaucoup', 'thank you very much', '🤗'],
            ['de rien', 'you\'re welcome', '😊', { note: 'Literally "of nothing". More formal: je vous en prie.' }],
          ] },
          { title: 'Please & sorry', words: [
            ['s\'il vous plaît', 'please', '🤲', { note: 'Polite form. To a friend or a child: s\'il te plaît.', alt: ['s\'il te plaît'] }],
            ['pardon', 'sorry / excuse me', '🙋', { note: 'For bumping into someone or squeezing past.' }],
            ['excusez-moi', 'excuse me', '🙇', { note: 'To get someone\'s attention before asking something.' }],
            ['désolé', 'sorry', '😔', { note: 'A real apology. A woman writes désolée (it sounds the same).', alt: ['désolée'] }],
          ] },
          { title: 'Yes & no', words: [
            ['oui', 'yes', '✅'],
            ['non', 'no', '❌'],
            ['d\'accord', 'okay / agreed', '👌', { note: 'Often shortened to d\'acc in casual speech.' }],
          ] },
          { title: 'Goodbye', words: [
            ['au revoir', 'goodbye', '🏃', { note: 'Literally "until seeing again". Say it when leaving a shop too.' }],
            ['bonne journée', 'have a nice day', '☀️', { note: 'Shop staff say it as you leave. Answer: vous aussi! (you too!)' }],
            ['bonne nuit', 'good night', '😴', { note: 'Only when going to bed. To say goodbye in the evening: bonne soirée.' }],
            ['à bientôt', 'see you soon', '📅'],
          ] },
          { title: 'How are you?', grammar: 'tu-vous', sentences: [
            { jp: ['comment', 'allez-vous'], en: 'How are you', alt: ['How are you doing', 'How do you do'] },
            { jp: ['ça', 'va', 'bien'], en: 'I am fine', alt: ['I\'m fine', 'I\'m good', 'I am good', 'I\'m well', 'I am well', 'It\'s going well', 'I\'m doing well'] },
            { jp: ['et', 'vous'], en: 'And you', alt: ['What about you', 'How about you'] },
            { jp: ['merci', 'beaucoup'], en: 'Thank you very much', alt: ['Thanks a lot', 'Thank you so much', 'Many thanks', 'Thanks very much'] },
          ] },
        ],
      },
      {
        id: 'around',
        title: 'Getting around',
        desc: 'Stations, the métro, tickets and finding the toilets',
        facts: [FACT.transport, FACT.city],
        phrases: [PHRASE.around],
        dialogues: ['d-metro', 'd-metro2'],
        lessons: [
          { title: 'Stations', words: [
            ['la gare', 'train station', '🚉', { note: 'Paris has several big stations: Gare du Nord, Gare de Lyon, Gare Montparnasse…' }],
            ['le métro', 'subway / metro', '🚇'],
            ['le bus', 'bus', '🚌'],
            ['l\'arrêt de bus', 'bus stop', '🚏'],
          ] },
          { title: 'Tickets & taxis', words: [
            ['le billet', 'ticket', '🎫', { note: 'For trains, planes and shows. A métro ticket is also un ticket.' }],
            ['le train', 'train', '🚆', { note: 'The TGV is France\'s high-speed train.' }],
            ['le taxi', 'taxi', '🚕'],
          ] },
          { title: 'Places', words: [
            ['les toilettes', 'toilets / restroom', '🚻', { note: 'Always plural in French, even for one toilet.' }],
            ['l\'hôtel', 'hotel', '🏨', { note: 'The h is silent: lo-tel.' }],
            ['le musée', 'museum', '🏺'],
            ['la rue', 'street', '🛣️'],
          ] },
          { title: 'Moving about', words: [
            ['aller', 'to go', '🏃', { note: 'Irregular: je vais, tu vas, il va, nous allons, vous allez, ils vont. Ça va? literally asks "does it go?"' }],
            ['venir', 'to come', '🫵', { note: 'Je viens, tu viens, il vient. Je viens de Londres = I come from London.' }],
            ['prendre', 'to take', '🤏', { note: 'Used for transport and food: je prends le métro, je prends un café.' }],
          ] },
          { title: 'Which way?', words: [
            ['où', 'where', '❓', { note: 'With an accent! Without it, ou means "or".' }],
            ['à gauche', 'on the left / to the left', '⬅️'],
            ['à droite', 'on the right / to the right', '➡️'],
            ['tout droit', 'straight ahead', '⬆️', { note: 'Careful: à droite (right) and tout droit (straight on) sound alike.' }],
          ] },
          { title: 'Where is…?', grammar: 'gender', sentences: [
            { jp: ['où', 'est', 'la', 'gare'], en: 'Where is the train station', alt: ['Where\'s the train station', 'Where is the station', 'Where\'s the station'] },
            { jp: ['où', 'sont', 'les', 'toilettes'], en: 'Where are the toilets', alt: ['Where is the toilet', 'Where\'s the toilet', 'Where is the bathroom', 'Where are the restrooms', 'Where is the restroom'] },
            { jp: ['où', 'est', 'le', 'métro'], en: 'Where is the metro', alt: ['Where\'s the metro', 'Where is the subway', 'Where\'s the subway'] },
            { jp: ['un', 'billet', 's\'il vous plaît'], en: 'A ticket please', alt: ['One ticket please', 'A ticket, please'] },
          ] },
          { title: 'Directions', sentences: [
            { jp: ['c\'est', 'à droite'], en: 'It is on the right', alt: ['It\'s on the right', 'It\'s to the right', 'On the right'] },
            { jp: ['c\'est', 'à gauche'], en: 'It is on the left', alt: ['It\'s on the left', 'It\'s to the left', 'On the left'] },
            { jp: ['allez', 'tout droit'], en: 'Go straight ahead', alt: ['Go straight on', 'Go straight', 'Straight ahead'] },
          ] },
          { title: 'I\'m going…', sentences: [
            { jp: ['je', 'vais', 'à', 'la', 'gare'], en: 'I am going to the train station', alt: ['I\'m going to the train station', 'I am going to the station', 'I\'m going to the station', 'I go to the station'] },
            { jp: ['je', 'prends', 'le', 'métro'], en: 'I take the metro', alt: ['I\'m taking the metro', 'I am taking the metro', 'I take the subway', 'I\'m taking the subway'] },
            { jp: ['tu', 'viens', 'avec', 'nous'], en: 'Are you coming with us', alt: ['You are coming with us', 'You\'re coming with us', 'Are you coming along', 'Do you come with us'] },
            { jp: ['on', 'prend', 'un', 'taxi'], en: 'We are taking a taxi', alt: ['We\'re taking a taxi', 'Let\'s take a taxi', 'We take a taxi', 'Shall we take a taxi'] },
          ] },
        ],
      },
      {
        id: 'food',
        title: 'Food & drinks',
        desc: 'Order at a café, say cheers and ask for the bill',
        facts: [FACT.food],
        phrases: [PHRASE.cafe],
        dialogues: ['d-cafe', 'd-cafe2'],
        lessons: [
          { title: 'At the café', words: [
            ['le café', 'coffee / café', '☕', { note: 'Un café is a small black espresso. With milk: un café crème. Le café is also the place.' }],
            ['le thé', 'tea', '🍵'],
            ['l\'eau', 'water', '💧', { note: 'Ask for une carafe d\'eau: tap water, free in restaurants.' }],
            ['le jus d\'orange', 'orange juice', '🍊'],
          ] },
          { title: 'Bread & cheese', words: [
            ['le pain', 'bread', '🍞'],
            ['la baguette', 'baguette', '🍞', { note: 'The long, crusty loaf. Many people buy one fresh every day.' }],
            ['le croissant', 'croissant', '🍪', { note: 'A breakfast treat. The chocolate one is a pain au chocolat (or chocolatine in the south-west!).' }],
            ['le fromage', 'cheese', '🧀'],
          ] },
          { title: 'Cheers!', words: [
            ['le vin', 'wine', '🍷', { note: 'Rouge (red), blanc (white) or rosé.' }],
            ['la bière', 'beer', '🍺', { note: 'Ask for un demi: a glass of draught beer.' }],
            ['santé', 'cheers!', '🍻', { note: 'Literally "health". Look people in the eye when you clink glasses!' }],
          ] },
          { title: 'Ordering', words: [
            ['je voudrais', 'I would like', '🙋', { note: 'The polite way to order or ask for anything.' }],
            ['la carte', 'menu', '📋', { note: 'Le menu is a set menu at a fixed price. La carte also means card or map.' }],
            ['l\'addition', 'bill / check', '🧾', { note: 'Staff will not bring it until you ask: they don\'t want to rush you.' }],
            ['le serveur', 'waiter', '🛎️', { note: 'A waitress is la serveuse. To call them, just say s\'il vous plaît!', alt: ['la serveuse'] }],
          ] },
          { title: 'Tastes', words: [
            ['délicieux', 'delicious', '😋', { note: 'With a feminine noun: délicieuse.', alt: ['délicieuse'] }],
            ['chaud', 'hot / warm', '🔥', { note: 'Careful: chaud means hot, not cold!' }],
            ['froid', 'cold', '🧊'],
          ] },
          { title: 'I would like…', grammar: 'voudrais', sentences: [
            { jp: ['je', 'voudrais', 'un', 'café'], en: 'I would like a coffee', alt: ['I\'d like a coffee', 'A coffee please', 'I want a coffee', 'I\'ll have a coffee'] },
            { jp: ['je', 'voudrais', 'de', 'l\'eau'], en: 'I would like some water', alt: ['I\'d like some water', 'I would like water', 'I\'d like water', 'Some water please'] },
            { jp: ['un', 'croissant', 's\'il vous plaît'], en: 'A croissant please', alt: ['One croissant please', 'A croissant, please'] },
            { jp: ['l\'addition', 's\'il vous plaît'], en: 'The bill please', alt: ['The check please', 'Check please', 'Bill please', 'The bill, please'] },
          ] },
          { title: 'It\'s delicious!', grammar: 'etre', sentences: [
            { jp: ['c\'est', 'délicieux'], en: 'It is delicious', alt: ['It\'s delicious', 'That\'s delicious', 'That is delicious', 'Delicious'] },
            { jp: ['le', 'café', 'est', 'chaud'], en: 'The coffee is hot', alt: ['The coffee\'s hot', 'The coffee is warm'] },
            { jp: ['la', 'bière', 'est', 'froide'], en: 'The beer is cold', alt: ['The beer\'s cold'] },
            { jp: ['à', 'votre', 'santé'], en: 'Cheers', alt: ['To your health', 'Your health'] },
          ] },
        ],
      },
      {
        id: 'shopping',
        title: 'Shopping & money',
        desc: 'Count to ten, prices, paying by card, markets and the bakery',
        facts: [FACT.daily, FACT.city],
        phrases: [PHRASE.shopping],
        dialogues: ['d-market', 'd-market2'],
        lessons: [
          { title: 'How much?', words: [
            ['combien', 'how much / how many', '💰', { note: 'C\'est combien? = how much is it?' }],
            ['cher', 'expensive', '😱', { note: 'Pas cher = cheap (literally "not expensive").' }],
            ['trop', 'too / too much', '🤯'],
          ] },
          { title: 'Paying', words: [
            ['l\'euro', 'euro', '🪙', { note: 'France has used the euro since 2002. Before that: the franc.' }],
            ['la carte bancaire', 'bank card', '💳', { note: 'Often just la carte or la CB. Cards are accepted almost everywhere.' }],
            ['les espèces', 'cash', '💵', { note: 'Also called le liquide.' }],
            ['le reçu', 'receipt', '🧾'],
          ] },
          { title: 'One to three', words: [
            ['un', 'one', '1️⃣', { note: 'Before a feminine noun it becomes une: une bière. Un and une also mean "a".', alt: ['1', 'une'] }],
            ['deux', 'two', '2️⃣', { alt: ['2'] }],
            ['trois', 'three', '3️⃣', { alt: ['3'] }],
          ] },
          { title: 'Four to six', words: [
            ['quatre', 'four', '4️⃣', { alt: ['4'] }],
            ['cinq', 'five', '5️⃣', { alt: ['5'] }],
            ['six', 'six', '6️⃣', { note: 'Said "siss" alone, but "si" before a consonant: six croissants.', alt: ['6'] }],
          ] },
          { title: 'Seven to ten', words: [
            ['sept', 'seven', '7️⃣', { note: 'The p is silent: "set".', alt: ['7'] }],
            ['huit', 'eight', '8️⃣', { alt: ['8'] }],
            ['neuf', 'nine', '9️⃣', { note: 'Neuf also means "new"!', alt: ['9'] }],
            ['dix', 'ten', '🔟', { alt: ['10'] }],
          ] },
          { title: 'Shops', words: [
            ['la boulangerie', 'bakery', '🍰', { note: 'Bread, croissants and cakes. Say bonjour when you come in!' }],
            ['la pharmacie', 'pharmacy', '💊', { note: 'Look for the green cross.' }],
            ['le marché', 'market', '🍎'],
            ['le supermarché', 'supermarket', '🏪'],
          ] },
          { title: 'Things to buy', words: [
            ['le sac', 'bag', '🎒', { note: 'Shops no longer give free plastic bags: bring your own.' }],
            ['la carte postale', 'postcard', '📮'],
            ['le cadeau', 'gift / present', '🎁', { note: 'C\'est pour offrir? = Is it a gift? Shops may wrap it for you.' }],
          ] },
          { title: 'Buying', words: [
            ['acheter', 'to buy', '🛍️', { note: 'J\'achète, tu achètes, nous achetons. Note the accent change: achète.' }],
            ['vouloir', 'to want', '🎯', { note: 'Je veux, tu veux, il veut, nous voulons. Je voudrais is the polite form of je veux.' }],
            ['avoir besoin de', 'to need', '🤲', { note: 'Literally "to have need of": j\'ai besoin d\'un sac. Before le or les it becomes du or des: j\'ai besoin du sac.' }],
          ] },
          { title: 'How much is it?', sentences: [
            { jp: ['c\'est', 'combien'], en: 'How much is it', alt: ['How much is this', 'How much does it cost', 'How much is that'] },
            { jp: ['c\'est', 'trop', 'cher'], en: 'It is too expensive', alt: ['It\'s too expensive', 'That\'s too expensive', 'Too expensive'] },
            { jp: ['je', 'peux', 'payer', 'par', 'carte'], en: 'Can I pay by card', alt: ['May I pay by card', 'Can I pay with a card', 'Can I pay with card'] },
          ] },
          { title: 'Not today', grammar: 'ne-pas', sentences: [
            { jp: ['ce', 'n\'est', 'pas', 'cher'], en: 'It is not expensive', alt: ['It\'s not expensive', 'It isn\'t expensive', 'It\'s cheap', 'That\'s not expensive'] },
            { jp: ['je', 'ne', 'comprends', 'pas'], en: 'I do not understand', alt: ['I don\'t understand'] },
            { jp: ['je', 'ne', 'sais', 'pas'], en: 'I do not know', alt: ['I don\'t know'] },
            { jp: ['je', 'regarde', 'seulement'], en: 'I am just looking', alt: ['I\'m just looking', 'Just looking', 'I\'m only looking'] },
            { jp: ['vous', 'parlez', 'anglais'], en: 'Do you speak English', alt: ['You speak English', 'Can you speak English'] },
          ] },
          { title: 'I want, I need', sentences: [
            { jp: ['je', 'veux', 'acheter', 'un', 'cadeau'], en: 'I want to buy a gift', alt: ['I want to buy a present', 'I\'d like to buy a gift'] },
            { jp: ['j\'ai', 'besoin', 'd\'un', 'sac'], en: 'I need a bag', alt: ['I have need of a bag', 'I\'m in need of a bag'] },
            { jp: ['elle', 'achète', 'du', 'pain'], en: 'She buys some bread', alt: ['She is buying some bread', 'She\'s buying bread', 'She buys bread', 'She is buying bread'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'everyday',
    title: 'Everyday French',
    units: [
      {
        id: 'numbers',
        title: 'Numbers & time',
        desc: 'Bigger numbers, days and telling the time',
        facts: [FACT.language, FACT.history],
        phrases: [PHRASE.hotel],
        dialogues: ['d-train', 'd-train2'],
        lessons: [
          { title: 'Eleven to fifteen', words: [
            ['onze', 'eleven', '🔢', { note: 'No elision: le onze, not l\'onze.', alt: ['11'] }],
            ['douze', 'twelve', '🔢', { alt: ['12'] }],
            ['treize', 'thirteen', '🔢', { alt: ['13'] }],
            ['quatorze', 'fourteen', '🔢', { alt: ['14'] }],
            ['quinze', 'fifteen', '🔢', { alt: ['15'] }],
          ] },
          { title: 'Sixteen to nineteen', words: [
            ['seize', 'sixteen', '🔢', { alt: ['16'] }],
            ['dix-sept', 'seventeen', '🔢', { note: 'Literally "ten-seven". From here on, the numbers are built like this.', alt: ['17'] }],
            ['dix-huit', 'eighteen', '🔢', { alt: ['18'] }],
            ['dix-neuf', 'nineteen', '🔢', { alt: ['19'] }],
          ] },
          { title: 'Tens', words: [
            ['trente', 'thirty', '🔢', { alt: ['30'] }],
            ['quarante', 'forty', '🔢', { alt: ['40'] }],
            ['soixante', 'sixty', '🔢', { alt: ['60'] }],
            ['quatre-vingts', 'eighty', '🔢', { note: 'Literally "four twenties". It loses its s before another number: quatre-vingt-un (81). Belgium and Switzerland say huitante or octante instead.', alt: ['80', 'quatre-vingt'] }],
            ['quatre-vingt-dix', 'ninety', '🔢', { note: 'Literally "four-twenty-ten". 91 is quatre-vingt-onze.', alt: ['90'] }],
          ] },
          { title: 'Bigger numbers', words: [
            ['vingt', 'twenty', '🔢', { note: 'The g and t are silent: "van".', alt: ['20'] }],
            ['cinquante', 'fifty', '🔢', { alt: ['50'] }],
            ['soixante-dix', 'seventy', '🔢', { note: 'Literally "sixty-ten". 80 is quatre-vingts: "four twenties"!', alt: ['70'] }],
            ['cent', 'a hundred', '💯', { alt: ['100'] }],
          ] },
          { title: 'Time', words: [
            ['l\'heure', 'hour / time (of day)', '🕐', { note: 'Times use the 24-hour clock: 15h = 3 p.m.' }],
            ['maintenant', 'now', '⏱️'],
            ['aujourd\'hui', 'today', '📅'],
            ['demain', 'tomorrow', '⏭️'],
          ] },
          { title: 'Days', words: [
            ['lundi', 'Monday', '📅', { note: 'Days and months take no capital letter in French.' }],
            ['mardi', 'Tuesday', '📅'],
            ['samedi', 'Saturday', '📅'],
            ['dimanche', 'Sunday', '📅', { note: 'Many shops are closed on Sunday, especially in small towns.' }],
          ] },
          { title: 'More days', words: [
            ['mercredi', 'Wednesday', '📅', { note: 'Mercredi is the traditional day off school for younger children.' }],
            ['jeudi', 'Thursday', '📅'],
            ['vendredi', 'Friday', '📅'],
          ] },
          { title: 'Weekend & day', words: [
            ['le week-end', 'weekend', '😎'],
            ['le matin', 'morning', '🌅'],
            ['le soir', 'evening', '🌃'],
          ] },
          { title: 'Half past', words: [
            ['midi', 'noon', '🕐', { note: 'Also means "south" — le Midi is the south of France.' }],
            ['minuit', 'midnight', '🌙'],
            ['et demie', 'half past', '🕧', { note: 'Il est sept heures et demie = 7:30. Demie is feminine because heure is: but midi et demi is masculine.', alt: ['et demi'] }],
            ['et quart', 'quarter past', '🕒', { note: 'Quarter to is moins le quart: huit heures moins le quart = 7:45.' }],
          ] },
          { title: 'Months (1)', words: [
            ['janvier', 'January', '📅', { note: 'Months take no capital letter. In January = en janvier.' }],
            ['février', 'February', '📅'],
            ['mars', 'March', '📅', { note: 'The s is pronounced: "marss".' }],
            ['avril', 'April', '📅'],
          ] },
          { title: 'Months (2)', words: [
            ['mai', 'May', '📅', { note: 'Au mois de mai, or en mai.' }],
            ['juin', 'June', '📅'],
            ['juillet', 'July', '📅', { note: 'The 14th of July is the national day.' }],
            ['août', 'August', '📅', { note: 'Said "oot". Many French people go on holiday in August.' }],
          ] },
          { title: 'Months (3)', words: [
            ['septembre', 'September', '📅', { note: 'September is la rentrée: back to school and work.' }],
            ['octobre', 'October', '📅'],
            ['novembre', 'November', '📅'],
            ['décembre', 'December', '📅'],
          ] },
          { title: 'Two, please', grammar: 'plural', sentences: [
            { jp: ['deux', 'cafés', 's\'il vous plaît'], en: 'Two coffees please', alt: ['Two coffees, please'] },
            { jp: ['trois', 'billets', 's\'il vous plaît'], en: 'Three tickets please', alt: ['Three tickets, please'] },
            { jp: ['les', 'croissants', 'sont', 'chauds'], en: 'The croissants are hot', alt: ['The croissants are warm'] },
          ] },
          { title: 'What time is it?', sentences: [
            { jp: ['quelle', 'heure', 'est-il'], en: 'What time is it', alt: ['What\'s the time'] },
            { jp: ['il', 'est', 'trois', 'heures'], en: 'It is three o\'clock', alt: ['It\'s three o\'clock', 'It\'s 3 o\'clock', 'It is 3 o\'clock', 'It\'s three'] },
            { jp: ['le', 'train', 'part', 'maintenant'], en: 'The train is leaving now', alt: ['The train leaves now', 'The train\'s leaving now'] },
            { jp: ['à', 'demain'], en: 'See you tomorrow', alt: ['Until tomorrow', 'Till tomorrow'] },
          ] },
          { title: 'At what time?', grammar: 'time', sentences: [
            { jp: ['il', 'est', 'sept', 'heures', 'et demie'], en: 'It is half past seven', alt: ['It\'s half past seven', 'It is seven thirty', 'It\'s seven thirty', 'It\'s 7:30', 'It is 7:30', 'It\'s seven-thirty'] },
            { jp: ['le', 'train', 'part', 'à', 'huit', 'heures'], en: 'The train leaves at eight o\'clock', alt: ['The train leaves at eight', 'The train departs at eight o\'clock', 'The train leaves at 8 o\'clock', 'The train leaves at 8'] },
            { jp: ['à', 'quelle', 'heure', 'part', 'le', 'train'], en: 'What time does the train leave', alt: ['At what time does the train leave', 'What time is the train leaving', 'When does the train leave'] },
            { jp: ['je', 'travaille', 'lundi'], en: 'I work on Monday', alt: ['I am working on Monday', 'I\'m working on Monday', 'I work Monday', 'I\'m working Monday'] },
            { jp: ['rendez-vous', 'à', 'midi'], en: 'See you at noon', alt: ['Let\'s meet at noon', 'Meet at noon', 'See you at midday', 'Let\'s meet at midday'] },
          ] },
          { title: 'Dates', sentences: [
            { jp: ['aujourd\'hui', 'c\'est', 'lundi'], en: 'Today is Monday', alt: ['Today it is Monday', 'It\'s Monday today', 'Today it\'s Monday'] },
            { jp: ['c\'est', 'le', 'quinze', 'mai'], en: 'It is the fifteenth of May', alt: ['It\'s the fifteenth of May', 'It is May fifteenth', 'It\'s May fifteenth', 'It\'s the 15th of May', 'It is the 15th of May', 'It\'s May 15th', 'It is May 15th'] },
            { jp: ['il', 'fait', 'chaud', 'en', 'juillet'], en: 'It is hot in July', alt: ['It\'s hot in July', 'It is warm in July', 'It\'s warm in July'] },
            { jp: ['mon', 'anniversaire', 'est', 'en', 'décembre'], en: 'My birthday is in December', alt: ['My birthday\'s in December'] },
          ] },
          { title: 'Numbers in use', sentences: [
            { jp: ['ça', 'fait', 'douze', 'euros'], en: 'That is twelve euros', alt: ['That\'s twelve euros', 'That comes to twelve euros', 'It is twelve euros', 'It\'s twelve euros', 'That makes twelve euros', 'That\'s 12 euros'] },
            { jp: ['j\'ai', 'trente', 'ans'], en: 'I am thirty years old', alt: ['I\'m thirty years old', 'I\'m thirty', 'I am thirty', 'I\'m 30', 'I am 30', 'I\'m 30 years old'] },
            { jp: ['le', 'billet', 'coûte', 'soixante', 'euros'], en: 'The ticket costs sixty euros', alt: ['The ticket is sixty euros', 'The ticket costs 60 euros', 'The ticket is 60 euros'] },
          ] },
        ],
      },
      {
        id: 'people',
        title: 'People & family',
        desc: 'Introduce yourself, your family and your job',
        facts: [FACT.history, FACT.culture],
        phrases: [PHRASE.basics],
        dialogues: ['d-meet', 'd-meet2'],
        lessons: [
          { title: 'Family', words: [
            ['la famille', 'family', '👫'],
            ['la mère', 'mother', '💐', { note: 'Mum is maman, dad is papa.' }],
            ['le père', 'father', '🧑'],
            ['les enfants', 'children', '🧑‍🤝‍🧑', { note: 'One child: l\'enfant.' }],
          ] },
          { title: 'Brothers & grandparents', words: [
            ['le frère', 'brother', '🧑‍🤝‍🧑'],
            ['la sœur', 'sister', '👫', { note: 'œ is two letters joined together, said like the "u" in "fur".', alt: ['la soeur'] }],
            ['la grand-mère', 'grandmother', '🧓', { note: 'Grandma is mamie, grandpa is papi.' }],
            ['le grand-père', 'grandfather', '🧓'],
          ] },
          { title: 'Friends & pets', words: [
            ['l\'ami', 'friend', '🤝', { note: 'A female friend is l\'amie — it sounds the same.', alt: ['l\'amie'] }],
            ['le chien', 'dog', '🐶'],
            ['le chat', 'cat', '🐱'],
          ] },
          { title: 'Jobs', words: [
            ['le professeur', 'teacher', '🧑‍🏫', { note: 'Often shortened to le prof (also la prof).' }],
            ['l\'étudiant', 'student', '🧑‍🎓', { note: 'A female student is l\'étudiante.', alt: ['l\'étudiante'] }],
            ['le médecin', 'doctor', '🧑‍⚕️', { note: 'Also le docteur when talking to one.' }],
            ['le cuisinier', 'cook', '🧑‍🍳', { note: 'A female cook is la cuisinière. The boss of the kitchen is le chef.' }],
          ] },
          { title: 'Where from?', words: [
            ['anglais', 'English', '🇬🇧', { note: 'Nationalities take no capital letter: je suis anglais. A woman says anglaise.', alt: ['anglaise'] }],
            ['américain', 'American', '🇺🇸', { note: 'A woman says américaine.', alt: ['américaine'] }],
            ['français', 'French', '🇫🇷', { note: 'A woman says française. The language is le français.', alt: ['française'] }],
          ] },
          { title: 'He, she, they', words: [
            ['il', 'he / it', '🧑', { note: 'Il is also "it" for masculine things: le train? Il part à huit heures.' }],
            ['elle', 'she / it', '💐', { note: 'Elle is also "it" for feminine things: la gare? Elle est à gauche.' }],
            ['ils', 'they (masculine or mixed)', '🧑‍🤝‍🧑', { note: 'Use ils for a group with at least one man or boy, even among a hundred women.' }],
            ['elles', 'they (all feminine)', '👫', { note: 'Only for groups with no men or boys. It sounds the same as elle.' }],
          ] },
          { title: 'I, you, we', words: [
            ['je', 'I', '🙋', { note: 'Becomes j\' before a vowel: j\'ai, j\'aime. Never a capital letter inside a sentence.' }],
            ['tu', 'you (friendly)', '👉', { note: 'For friends, family, children and pets.' }],
            ['nous', 'we', '🤝', { note: 'Nous sommes… sounds formal: in conversation, people say on est…' }],
            ['vous', 'you (polite or several people)', '🫵'],
          ] },
          { title: 'Who are you?', sentences: [
            { jp: ['je', 'm\'appelle', 'Camille'], en: 'My name is Camille', alt: ['I\'m Camille', 'I am Camille', 'I am called Camille', 'My name\'s Camille'] },
            { jp: ['comment', 'vous', 'appelez-vous'], en: 'What is your name', alt: ['What\'s your name'] },
            { jp: ['je', 'suis', 'anglais'], en: 'I am English', alt: ['I\'m English'] },
            { jp: ['je', 'suis', 'étudiant'], en: 'I am a student', alt: ['I\'m a student'] },
          ] },
          { title: 'My family', grammar: 'possessive', sentences: [
            { jp: ['voici', 'ma', 'famille'], en: 'This is my family', alt: ['Here is my family', 'Here\'s my family', 'Meet my family'] },
            { jp: ['mon', 'frère', 'est', 'médecin'], en: 'My brother is a doctor', alt: ['My brother\'s a doctor'] },
            { jp: ['ma', 'sœur', 'est', 'professeur'], en: 'My sister is a teacher', alt: ['My sister\'s a teacher'] },
            { jp: ['mes', 'enfants', 'sont', 'à', 'Paris'], en: 'My children are in Paris', alt: ['My kids are in Paris'] },
          ] },
          { title: 'Who is who?', grammar: 'pronouns', sentences: [
            { jp: ['il', 'est', 'médecin'], en: 'He is a doctor', alt: ['He\'s a doctor'] },
            { jp: ['elle', 'est', 'professeur'], en: 'She is a teacher', alt: ['She\'s a teacher'] },
            { jp: ['nous', 'sommes', 'amis'], en: 'We are friends', alt: ['We\'re friends'] },
            { jp: ['ils', 'sont', 'étudiants'], en: 'They are students', alt: ['They\'re students'] },
            { jp: ['elles', 'sont', 'à', 'Paris'], en: 'They are in Paris', alt: ['They\'re in Paris'] },
          ] },
        ],
      },
      {
        id: 'home',
        title: 'Home & daily life',
        desc: 'Rooms, things at home and everyday verbs',
        facts: [FACT.daily, FACT.culture],
        phrases: [PHRASE.hotel],
        dialogues: ['d-flat', 'd-flat2'],
        lessons: [
          { title: 'At home', words: [
            ['la maison', 'house / home', '🏠', { note: 'À la maison = at home.' }],
            ['la chambre', 'bedroom / hotel room', '🛏️'],
            ['la cuisine', 'kitchen / cooking', '🍳', { note: 'La cuisine française = French cooking.' }],
            ['la porte', 'door', '🚪'],
          ] },
          { title: 'Furniture', words: [
            ['le lit', 'bed', '😴'],
            ['le canapé', 'sofa', '🛋️'],
            ['la table', 'table', '🍽️'],
            ['la clé', 'key', '🔑', { note: 'Also spelled la clef — same sound.', alt: ['la clef'] }],
          ] },
          { title: 'Everyday things', words: [
            ['le téléphone', 'phone', '📱', { note: 'A mobile phone is un portable.' }],
            ['l\'ordinateur', 'computer', '🧑‍💻'],
            ['la télé', 'TV', '📺'],
            ['le livre', 'book', '📖'],
          ] },
          { title: 'Verbs', words: [
            ['manger', 'to eat', '🍽️'],
            ['boire', 'to drink', '🥤'],
            ['dormir', 'to sleep', '😴'],
            ['travailler', 'to work', '💼'],
          ] },
          { title: 'More verbs', words: [
            ['aimer', 'to like / to love', '❤️'],
            ['parler', 'to speak', '🗣️'],
            ['habiter', 'to live (somewhere)', '🏠', { note: 'The h is silent: j\'habite.' }],
          ] },
          { title: 'Be, have, do', words: [
            ['être', 'to be', '🧍', { note: 'Je suis, tu es, il est, nous sommes, vous êtes, ils sont. The most important verb in French.' }],
            ['avoir', 'to have', '🎒', { note: 'J\'ai, tu as, il a, nous avons, vous avez, ils ont. Also used for hunger, thirst and age.' }],
            ['faire', 'to do / to make', '✍️', { note: 'Je fais, tu fais, il fait, nous faisons, vous faites, ils font. Il fait beau uses it too.' }],
          ] },
          { title: 'There is…', grammar: 'il-y-a', sentences: [
            { jp: ['il', 'y', 'a', 'un', 'lit'], en: 'There is a bed', alt: ['There\'s a bed'] },
            { jp: ['il', 'y', 'a', 'du', 'pain'], en: 'There is some bread', alt: ['There\'s some bread', 'There is bread', 'There\'s bread'] },
            { jp: ['il', 'n\'y', 'a', 'pas', 'de', 'télé'], en: 'There is no TV', alt: ['There\'s no TV', 'There isn\'t a TV', 'There is not a TV', 'There\'s no television'] },
          ] },
          { title: 'I like…', grammar: 'aimer', sentences: [
            { jp: ['j\'aime', 'le', 'fromage'], en: 'I like cheese', alt: ['I love cheese'] },
            { jp: ['je', 'n\'aime', 'pas', 'le', 'thé'], en: 'I do not like tea', alt: ['I don\'t like tea'] },
            { jp: ['j\'habite', 'à', 'Paris'], en: 'I live in Paris' },
            { jp: ['je', 'parle', 'anglais'], en: 'I speak English', alt: ['I can speak English'] },
          ] },
          { title: 'I don\'t…', grammar: 'pas-de', sentences: [
            { jp: ['je', 'ne', 'mange', 'pas', 'de', 'viande'], en: 'I do not eat meat', alt: ['I don\'t eat meat'] },
            { jp: ['nous', 'n\'avons', 'pas', 'de', 'chien'], en: 'We do not have a dog', alt: ['We don\'t have a dog', 'We have no dog', 'We haven\'t got a dog'] },
            { jp: ['il', 'ne', 'dort', 'pas'], en: 'He is not sleeping', alt: ['He isn\'t sleeping', 'He does not sleep', 'He doesn\'t sleep', 'He\'s not sleeping'] },
            { jp: ['elle', 'ne', 'travaille', 'pas', 'dimanche'], en: 'She does not work on Sunday', alt: ['She doesn\'t work on Sunday', 'She does not work on Sundays', 'She doesn\'t work on Sundays', 'She isn\'t working on Sunday'] },
            { jp: ['je', 'ne', 'parle', 'pas', 'français'], en: 'I do not speak French', alt: ['I don\'t speak French'] },
          ] },
        ],
      },
      {
        id: 'weather',
        title: 'Weather & seasons',
        desc: 'Sun, rain, the four seasons and what to wear',
        facts: [FACT.nature],
        phrases: [PHRASE.around],
        dialogues: ['d-weather', 'd-weather2'],
        lessons: [
          { title: 'Weather', words: [
            ['le soleil', 'sun', '☀️'],
            ['la pluie', 'rain', '☂️'],
            ['la neige', 'snow', '❄️'],
            ['le vent', 'wind', '🍃'],
          ] },
          { title: 'Nice or not?', words: [
            ['il fait beau', 'the weather is nice', '😎', { note: 'Weather uses il fait… (literally "it makes").' }],
            ['il fait chaud', 'it\'s hot', '🔥'],
            ['il fait froid', 'it\'s cold', '🧊'],
            ['il pleut', 'it\'s raining', '☂️'],
          ] },
          { title: 'Seasons', words: [
            ['le printemps', 'spring', '🌸', { note: 'Au printemps = in spring. The other seasons take en: en été, en automne, en hiver.' }],
            ['l\'été', 'summer', '☀️'],
            ['l\'automne', 'autumn / fall', '🍃', { note: 'The m is silent: "o-ton".' }],
            ['l\'hiver', 'winter', '⛰️'],
          ] },
          { title: 'Nature', words: [
            ['la mer', 'sea', '🌊'],
            ['la plage', 'beach', '😎'],
            ['la montagne', 'mountain', '🏔️'],
            ['la forêt', 'forest', '🌳'],
          ] },
          { title: 'What to wear', words: [
            ['le manteau', 'coat', '🧥'],
            ['le parapluie', 'umbrella', '☂️', { note: 'Literally "against rain".' }],
            ['le t-shirt', 'T-shirt', '👕', { alt: ['le tee-shirt'] }],
          ] },
          { title: 'What\'s the weather like?', grammar: 'il-fait', sentences: [
            { jp: ['quel', 'temps', 'fait-il'], en: 'What is the weather like', alt: ['What\'s the weather like', 'How is the weather', 'How\'s the weather'] },
            { jp: ['il', 'fait', 'beau'], en: 'The weather is nice', alt: ['It\'s nice weather', 'It\'s nice out', 'It is nice', 'It\'s lovely weather', 'The weather is good'] },
            { jp: ['il', 'fait', 'froid', 'en', 'hiver'], en: 'It is cold in winter', alt: ['It\'s cold in winter'] },
            { jp: ['il', 'pleut', 'aujourd\'hui'], en: 'It is raining today', alt: ['It\'s raining today', 'It rains today'] },
          ] },
          { title: 'Let\'s go!', sentences: [
            { jp: ['on', 'va', 'à', 'la', 'plage'], en: 'Let\'s go to the beach', alt: ['We are going to the beach', 'We\'re going to the beach', 'Shall we go to the beach'] },
            { jp: ['je', 'voudrais', 'un', 'parapluie'], en: 'I would like an umbrella', alt: ['I\'d like an umbrella'] },
            { jp: ['la', 'mer', 'est', 'froide'], en: 'The sea is cold', alt: ['The sea\'s cold'] },
          ] },
        ],
      },
    ],
  },
  {
    id: 'real',
    title: 'Real French',
    units: [
      {
        id: 'feelings',
        title: 'Feelings & small talk',
        desc: 'Say how you feel, chat and react like a local',
        facts: [FACT.culture, FACT.language],
        phrases: [PHRASE.basics],
        dialogues: ['d-hungry', 'd-hungry2'],
        lessons: [
          { title: 'Feelings', words: [
            ['content', 'happy / glad', '😊', { note: 'A woman says contente.', alt: ['contente'] }],
            ['triste', 'sad', '😔'],
            ['fatigué', 'tired', '😴', { note: 'A woman writes fatiguée — it sounds the same.', alt: ['fatiguée'] }],
          ] },
          { title: 'Hungry & thirsty', words: [
            ['j\'ai faim', 'I\'m hungry', '😋', { note: 'Literally "I have hunger".' }],
            ['j\'ai soif', 'I\'m thirsty', '🥤'],
            ['j\'ai froid', 'I\'m cold', '🧥', { note: 'Never "je suis froid" — that means you are a cold person!' }],
            ['j\'ai chaud', 'I\'m hot', '🔥'],
          ] },
          { title: 'Nice to meet you', words: [
            ['enchanté', 'nice to meet you', '🤝', { note: 'A woman writes enchantée. Usually said with a handshake or la bise.', alt: ['enchantée'] }],
            ['bienvenue', 'welcome', '🤗'],
            ['bon appétit', 'enjoy your meal', '🍽️', { note: 'Said before eating. Everyone waits for it before starting.' }],
          ] },
          { title: 'Reactions', words: [
            ['génial', 'great / brilliant', '🤩'],
            ['super', 'super / great', '👍'],
            ['bien sûr', 'of course', '👌'],
            ['vraiment', 'really', '😲'],
          ] },
          { title: 'Question words', words: [
            ['pourquoi', 'why', '❔', { note: 'Answer with parce que (because).' }],
            ['quand', 'when', '🕒'],
            ['qui', 'who', '🔎'],
            ['comment', 'how', '❓'],
          ] },
          { title: 'What & which', words: [
            ['qu\'est-ce que', 'what (starting a question)', '❓', { note: 'Qu\'est-ce que c\'est? = what is it? Literally "what is it that…".' }],
            ['est-ce que', 'is it that… (makes a question)', '💬', { note: 'Put it before any statement to turn it into a yes/no question: est-ce que tu viens?' }],
            ['quel', 'which / what', '❔', { note: 'It agrees with the noun: quel train, quelle heure, quels billets, quelles toilettes.', alt: ['quelle', 'quels', 'quelles'] }],
          ] },
          { title: 'Ask anything', grammar: 'qwords', sentences: [
            { jp: ['qui', 'est-ce'], en: 'Who is it', alt: ['Who is that', 'Who\'s that', 'Who\'s it'] },
            { jp: ['qu\'est-ce que', 'c\'est'], en: 'What is it', alt: ['What is that', 'What\'s that', 'What\'s it'] },
            { jp: ['quand', 'part', 'le', 'train'], en: 'When does the train leave', alt: ['When is the train leaving', 'When does the train depart', 'When is the train leaving'] },
            { jp: ['où', 'habitez-vous'], en: 'Where do you live', alt: ['Where are you living'] },
            { jp: ['combien', 'coûte', 'le', 'billet'], en: 'How much is the ticket', alt: ['How much does the ticket cost', 'How much is a ticket'] },
          ] },
          { title: 'Know & understand', words: [
            ['comprendre', 'to understand', '👌', { note: 'Je comprends, tu comprends, il comprend. Also: to include.' }],
            ['savoir', 'to know (a fact)', '📚', { note: 'Je sais, tu sais, il sait. Connaître is for knowing a person or a place.' }],
            ['voir', 'to see', '🔎', { note: 'Je vois, tu vois, il voit. On se voit demain? = see you tomorrow?' }],
          ] },
          { title: 'Yesterday', words: [
            ['hier', 'yesterday', '📅', { note: 'The ie is said like "ye": "yair".' }],
            ['hier soir', 'last night / yesterday evening', '🌃'],
            ['déjà', 'already / ever', '✅', { note: 'Tu as déjà mangé? = have you already eaten?' }],
          ] },
          { title: 'I\'m hungry', grammar: 'avoir', sentences: [
            { jp: ['j\'ai', 'faim'], en: 'I am hungry', alt: ['I\'m hungry'] },
            { jp: ['tu', 'as', 'soif'], en: 'Are you thirsty', alt: ['You are thirsty', 'You\'re thirsty'] },
            { jp: ['nous', 'avons', 'froid'], en: 'We are cold', alt: ['We\'re cold'] },
            { jp: ['j\'ai', 'vingt', 'ans'], en: 'I am twenty years old', alt: ['I\'m twenty years old', 'I\'m twenty', 'I am twenty', 'I\'m 20', 'I am 20 years old', 'I\'m 20 years old'] },
          ] },
          { title: 'Small talk', grammar: 'question', sentences: [
            { jp: ['tu', 'es', 'fatigué'], en: 'Are you tired', alt: ['You are tired', 'You\'re tired'] },
            { jp: ['je', 'suis', 'très', 'content'], en: 'I am very happy', alt: ['I\'m very happy', 'I\'m really happy', 'I am very glad', 'I\'m very glad'] },
            { jp: ['c\'est', 'génial'], en: 'It is great', alt: ['It\'s great', 'That\'s great', 'That is great', 'It\'s brilliant', 'That\'s brilliant'] },
            { jp: ['pourquoi', 'tu', 'es', 'triste'], en: 'Why are you sad' },
          ] },
          { title: 'What did you do?', grammar: 'passe-compose', sentences: [
            { jp: ['hier', 'j\'ai', 'mangé', 'un', 'croissant'], en: 'Yesterday I ate a croissant', alt: ['I ate a croissant yesterday', 'Yesterday I had a croissant', 'Yesterday, I ate a croissant'] },
            { jp: ['j\'ai', 'parlé', 'avec', 'ma', 'sœur'], en: 'I spoke with my sister', alt: ['I talked with my sister', 'I spoke to my sister', 'I talked to my sister', 'I have spoken with my sister'] },
            { jp: ['nous', 'avons', 'bu', 'du', 'vin'], en: 'We drank some wine', alt: ['We drank wine', 'We had some wine', 'We have drunk wine'] },
            { jp: ['je', 'suis', 'allé', 'à', 'Paris'], en: 'I went to Paris', alt: ['I have been to Paris', 'I\'ve been to Paris', 'I have gone to Paris', 'I\'ve gone to Paris'] },
            { jp: ['elle', 'a', 'acheté', 'un', 'billet'], en: 'She bought a ticket', alt: ['She has bought a ticket', 'She\'s bought a ticket'] },
          ] },
        ],
      },
      {
        id: 'help',
        title: 'Help & health',
        desc: 'Emergencies, the pharmacy and saying what hurts',
        facts: [FACT.daily, FACT.nature],
        phrases: [PHRASE.help],
        dialogues: ['d-pharmacy', 'd-pharmacy2'],
        lessons: [
          { title: 'Help!', words: [
            ['au secours', 'help!', '🆘', { note: 'Only in an emergency.' }],
            ['la police', 'police', '👮', { note: 'Emergency number: 17 (or 112 from any phone in Europe).' }],
            ['l\'ambulance', 'ambulance', '🚑', { note: 'For a medical emergency call 15 (le SAMU) or 112.' }],
            ['les pompiers', 'fire brigade', '🚨', { note: 'Call 18. French firefighters also help with many medical emergencies.' }],
          ] },
          { title: 'Health', words: [
            ['l\'hôpital', 'hospital', '🏥'],
            ['le médicament', 'medicine', '💊'],
            ['malade', 'sick / ill', '🤧'],
            ['allergique', 'allergic', '🥜', { note: 'Je suis allergique aux… = I\'m allergic to…' }],
          ] },
          { title: 'Body', words: [
            ['la tête', 'head', '🤯'],
            ['la main', 'hand', '🤲'],
            ['le pied', 'foot', '👢', { note: 'À pied = on foot.' }],
            ['le bras', 'arm', '💪'],
          ] },
          { title: 'Problems', words: [
            ['perdu', 'lost', '🗺️', { note: 'Je suis perdu = I\'m lost. A woman says perdue.', alt: ['perdue'] }],
            ['le passeport', 'passport', '📕'],
            ['le portefeuille', 'wallet', '💰'],
            ['appeler', 'to call', '📞'],
          ] },
          { title: 'I need help', sentences: [
            { jp: ['j\'ai', 'mal', 'à', 'la', 'tête'], en: 'I have a headache', alt: ['My head hurts', 'I\'ve got a headache'] },
            { jp: ['j\'ai', 'perdu', 'mon', 'passeport'], en: 'I have lost my passport', alt: ['I\'ve lost my passport', 'I lost my passport'] },
            { jp: ['appelez', 'une', 'ambulance'], en: 'Call an ambulance', alt: ['Call an ambulance please'] },
            { jp: ['où', 'est', 'l\'hôpital'], en: 'Where is the hospital', alt: ['Where\'s the hospital'] },
          ] },
          { title: 'At the pharmacy', sentences: [
            { jp: ['je', 'suis', 'malade'], en: 'I am sick', alt: ['I\'m sick', 'I\'m ill', 'I am ill'] },
            { jp: ['je', 'suis', 'allergique', 'aux', 'cacahuètes'], en: 'I am allergic to peanuts', alt: ['I\'m allergic to peanuts'] },
            { jp: ['vous', 'parlez', 'anglais'], en: 'Do you speak English', alt: ['You speak English', 'Can you speak English'] },
          ] },
        ],
      },
      {
        id: 'casual',
        title: 'Casual & slang',
        desc: 'Talk like a French friend: slang, verlan and texting',
        facts: [FACT.language, FACT.food],
        phrases: [PHRASE.basics, PHRASE.cafe],
        dialogues: ['d-weekend', 'd-weekend2'],
        lessons: [
          { title: 'Hi & bye', words: [
            ['coucou', 'hi there!', '👋', { note: 'Very friendly — with family, close friends and in text messages.' }],
            ['à plus', 'see you later', '✌️', { note: 'Texted as A+. Also à toute (see you in a bit).', alt: ['à+'] }],
            ['bisous', 'kisses / love', '💝', { note: 'To end a message or a call with friends and family.' }],
          ] },
          { title: 'Cool words', words: [
            ['sympa', 'nice / friendly', '😊', { note: 'Short for sympathique. Very common.' }],
            ['trop bien', 'so good / awesome', '🤩', { note: 'In casual French, trop often means "really", not "too".' }],
            ['grave', 'totally / seriously', '💯', { note: 'Slang: "Tu viens? — Grave!" = "Coming? — Totally!"' }],
            ['bof', 'meh', '🤷', { note: 'With a shrug, when something is just okay.' }],
          ] },
          { title: 'Slang nouns', words: [
            ['le boulot', 'job / work', '💼'],
            ['le pote', 'mate / buddy', '🤝'],
            ['la bouffe', 'food / grub', '🍔'],
            ['le fric', 'money / cash', '💵', { note: 'Also le pognon, or la thune.' }],
          ] },
          { title: 'Verlan', words: [
            ['ouf', 'crazy / incredible', '🤯', { note: 'Verlan: fou (crazy) said backwards. C\'est ouf! = That\'s insane!' }],
            ['relou', 'annoying', '🙄', { note: 'Verlan of lourd (heavy).' }],
            ['chelou', 'weird / shady', '😲', { note: 'Verlan of louche (shady).' }],
            ['j\'en ai marre', 'I\'m fed up', '😤'],
          ] },
          { title: 'Casual chat', sentences: [
            { jp: ['c\'est', 'trop bien'], en: 'It is so good', alt: ['It\'s so good', 'It\'s great', 'It\'s awesome', 'That\'s so good', 'That\'s awesome', 'It\'s really good'] },
            { jp: ['c\'est', 'pas', 'grave'], en: 'No worries', alt: ['It doesn\'t matter', 'It\'s not a big deal', 'No problem', 'Never mind', 'It\'s okay'] },
            { jp: ['je', 'suis', 'crevé'], en: 'I am exhausted', alt: ['I\'m exhausted', 'I\'m knackered', 'I\'m beat', 'I\'m wiped out'] },
            { jp: ['on', 'va', 'au', 'café'], en: 'Let\'s go to the café', alt: ['Let\'s go to the cafe', 'We\'re going to the café', 'We are going to the cafe', 'Shall we go to the café'] },
          ] },
          { title: 'With friends', sentences: [
            { jp: ['mon', 'pote', 'est', 'sympa'], en: 'My mate is nice', alt: ['My friend is nice', 'My buddy is nice', 'My mate\'s nice'] },
            { jp: ['j\'ai', 'pas', 'de', 'fric'], en: 'I have no money', alt: ['I\'ve got no money', 'I don\'t have any money', 'I have no cash', 'I\'ve got no cash'] },
            { jp: ['c\'est', 'ouf'], en: 'It is crazy', alt: ['It\'s crazy', 'That\'s crazy', 'That\'s insane', 'It\'s insane', 'That\'s incredible'] },
            { jp: ['à', 'plus'], en: 'See you later', alt: ['See you', 'Later', 'See ya', 'See you soon'] },
          ] },
        ],
      },
    ],
  },
];

// Two-person dialogues for listening comprehension. Speakers are cast characters
// (woman = Camille, woman2 = Léa).
export const DIALOGUES = {
  'd-bonjour': {
    title: 'Good morning!',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Bonjour madame! Comment allez-vous?', en: 'Good morning, madam! How are you?' },
      { who: 1, jp: 'Très bien, merci. Et vous?', en: 'Very well, thank you. And you?' },
      { who: 0, jp: 'Ça va bien, merci. Bonne journée!', en: 'I\'m fine, thanks. Have a nice day!' },
      { who: 1, jp: 'Merci, vous aussi! Au revoir!', en: 'Thanks, you too! Goodbye!' },
    ],
    question: 'How is the conversation going?',
    options: ['They greet each other politely and say goodbye', 'One of them is lost', 'They order a coffee'],
  },
  'd-metro': {
    title: 'In the métro',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Excusez-moi, où est la gare de Lyon?', en: 'Excuse me, where is the Gare de Lyon?' },
      { who: 1, jp: 'Prenez le métro, ligne 1.', en: 'Take the métro, line 1.' },
      { who: 0, jp: 'Et le métro, c\'est où?', en: 'And where is the métro?' },
      { who: 1, jp: 'Allez tout droit, puis à gauche.', en: 'Go straight ahead, then left.' },
    ],
    question: 'How does she get to the métro?',
    options: ['Straight ahead, then left', 'Straight ahead, then right', 'She takes a taxi'],
  },
  'd-cafe': {
    title: 'At the café',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Bonjour! Qu\'est-ce que je vous sers?', en: 'Hello! What can I get you?' },
      { who: 1, jp: 'Je voudrais un café et un croissant, s\'il vous plaît.', en: 'I\'d like a coffee and a croissant, please.' },
      { who: 0, jp: 'Et avec ça?', en: 'Anything else?' },
      { who: 1, jp: 'Une carafe d\'eau, s\'il vous plaît. Merci!', en: 'A jug of water, please. Thanks!' },
    ],
    question: 'What does she order?',
    options: ['A coffee, a croissant and tap water', 'A beer and some cheese', 'A tea and a baguette'],
  },
  'd-market': {
    title: 'At the market',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Bonjour! C\'est combien, le fromage?', en: 'Hello! How much is the cheese?' },
      { who: 1, jp: 'Huit euros.', en: 'Eight euros.' },
      { who: 0, jp: 'D\'accord. Je peux payer par carte?', en: 'Okay. Can I pay by card?' },
      { who: 1, jp: 'Oui, bien sûr!', en: 'Yes, of course!' },
    ],
    question: 'How does she pay for the cheese?',
    options: ['By card, eight euros', 'In cash, eighteen euros', 'She does not buy it'],
  },
  'd-train': {
    title: 'At the station',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Deux billets pour Lyon, s\'il vous plaît.', en: 'Two tickets to Lyon, please.' },
      { who: 1, jp: 'Pour aujourd\'hui?', en: 'For today?' },
      { who: 0, jp: 'Non, pour demain matin.', en: 'No, for tomorrow morning.' },
      { who: 1, jp: 'Il y a un train à huit heures.', en: 'There is a train at eight o\'clock.' },
    ],
    question: 'When is the train?',
    options: ['Tomorrow at eight in the morning', 'Today at eight in the evening', 'Tomorrow at two'],
  },
  'd-meet': {
    title: 'Meeting someone',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Bonjour, je m\'appelle Léa. Et vous?', en: 'Hello, my name is Léa. And you?' },
      { who: 1, jp: 'Je m\'appelle Camille. Enchantée!', en: 'My name is Camille. Nice to meet you!' },
      { who: 0, jp: 'Vous êtes étudiante?', en: 'Are you a student?' },
      { who: 1, jp: 'Non, je suis professeur. Ma sœur est étudiante.', en: 'No, I\'m a teacher. My sister is a student.' },
    ],
    question: 'Who is the student?',
    options: ['Camille\'s sister', 'Camille', 'Léa\'s brother'],
  },
  'd-flat': {
    title: 'The new flat',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Voici la chambre. Il y a un lit et une table.', en: 'Here is the bedroom. There is a bed and a table.' },
      { who: 1, jp: 'Et il y a une télé?', en: 'And is there a TV?' },
      { who: 0, jp: 'Non, il n\'y a pas de télé. Désolée!', en: 'No, there is no TV. Sorry!' },
      { who: 1, jp: 'Pas de problème, j\'aime lire!', en: 'No problem, I like reading!' },
    ],
    question: 'What is missing from the room?',
    options: ['A TV', 'A bed', 'A table'],
  },
  'd-weather': {
    title: 'Beach day?',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Il fait beau aujourd\'hui! On va à la plage?', en: 'The weather is nice today! Shall we go to the beach?' },
      { who: 1, jp: 'Oui, mais demain il pleut.', en: 'Yes, but tomorrow it\'s raining.' },
      { who: 0, jp: 'Alors on y va maintenant!', en: 'Then let\'s go now!' },
    ],
    question: 'Why do they go to the beach today?',
    options: ['It\'s sunny today and rainy tomorrow', 'It\'s snowing today', 'The beach is closed tomorrow'],
  },
  'd-hungry': {
    title: 'Lunch time',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'J\'ai faim! Et toi?', en: 'I\'m hungry! And you?' },
      { who: 1, jp: 'Moi aussi, et j\'ai soif.', en: 'Me too, and I\'m thirsty.' },
      { who: 0, jp: 'On mange une crêpe?', en: 'Shall we have a crêpe?' },
      { who: 1, jp: 'Génial! Bonne idée!', en: 'Great! Good idea!' },
    ],
    question: 'What do they decide to do?',
    options: ['Eat a crêpe', 'Go to sleep', 'Buy a coat'],
  },
  'd-pharmacy': {
    title: 'At the pharmacy',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Bonjour, j\'ai mal à la tête.', en: 'Hello, I have a headache.' },
      { who: 1, jp: 'Vous êtes allergique à un médicament?', en: 'Are you allergic to any medicine?' },
      { who: 0, jp: 'Non.', en: 'No.' },
      { who: 1, jp: 'Alors voici du paracétamol. Deux fois par jour.', en: 'Then here is some paracetamol. Twice a day.' },
    ],
    question: 'What does the pharmacist give her?',
    options: ['Paracetamol, twice a day', 'A plaster for her foot', 'Nothing, she sends her to hospital'],
  },
  'd-weekend': {
    title: 'Weekend plans',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Coucou! Ça va?', en: 'Hi! How\'s it going?' },
      { who: 1, jp: 'Bof, je suis crevée. Trop de boulot!', en: 'Meh, I\'m exhausted. Too much work!' },
      { who: 0, jp: 'Ce week-end, on va au cinéma?', en: 'This weekend, shall we go to the cinema?' },
      { who: 1, jp: 'Grave! Trop bien! À plus!', en: 'Totally! Awesome! See you later!' },
    ],
    question: 'How is Léa feeling, and what will they do?',
    options: ['She is tired from work; they will go to the cinema', 'She is sick; they will stay home', 'She is hungry; they will go to a café'],
  },
};

// Second dialogues, one per unit. `questions` holds every comprehension question (the first one is
// also `question` / `options`, so older code keeps working); the first option is the right answer.
Object.assign(DIALOGUES, {
  'd-bonjour2': {
    title: 'Excuse me!',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Pardon, madame! Excusez-moi.', en: 'Sorry, madam! Excuse me.' },
      { who: 1, jp: 'Ce n\'est pas grave. Ça va?', en: 'It doesn\'t matter. Are you all right?' },
      { who: 0, jp: 'Oui, merci. Bonne soirée!', en: 'Yes, thanks. Have a nice evening!' },
      { who: 1, jp: 'Merci, bonne nuit!', en: 'Thanks, good night!' },
    ],
    question: 'What does the second woman say about the accident?',
    options: ['It does not matter', 'She is angry', 'She wants some money'],
    questions: [
      { question: 'What does the second woman say about the accident?', options: ['It does not matter', 'She is angry', 'She wants some money'] },
      { question: 'What time of day is it?', options: ['Evening', 'Morning', 'Midday'] },
    ],
  },
  'd-metro2': {
    title: 'A métro ticket',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Un billet pour la gare du Nord, s\'il vous plaît.', en: 'A ticket to the Gare du Nord, please.' },
      { who: 1, jp: 'Ça fait deux euros.', en: 'That\'s two euros.' },
      { who: 0, jp: 'Voici trois euros.', en: 'Here are three euros.' },
      { who: 1, jp: 'Voici votre monnaie. Bon voyage!', en: 'Here is your change. Have a good trip!' },
    ],
    question: 'How much does the ticket cost?',
    options: ['Two euros', 'Three euros', 'One euro'],
    questions: [
      { question: 'How much does the ticket cost?', options: ['Two euros', 'Three euros', 'One euro'] },
      { question: 'What does the clerk give back?', options: ['Her change', 'A receipt', 'A map'] },
    ],
  },
  'd-cafe2': {
    title: 'The bill, please',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'L\'addition, s\'il vous plaît.', en: 'The bill, please.' },
      { who: 1, jp: 'Voilà. Ça fait neuf euros.', en: 'Here you are. That\'s nine euros.' },
      { who: 0, jp: 'Je peux payer par carte?', en: 'Can I pay by card?' },
      { who: 1, jp: 'Oui, bien sûr!', en: 'Yes, of course!' },
      { who: 0, jp: 'Merci, c\'était délicieux!', en: 'Thanks, it was delicious!' },
    ],
    question: 'How much is the bill?',
    options: ['Nine euros', 'Eight euros', 'Nineteen euros'],
    questions: [
      { question: 'How much is the bill?', options: ['Nine euros', 'Eight euros', 'Nineteen euros'] },
      { question: 'How does she pay?', options: ['By card', 'In cash', 'She does not pay'] },
    ],
  },
  'd-market2': {
    title: 'At the baker\'s',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Bonjour! Je voudrais deux baguettes, s\'il vous plaît.', en: 'Hello! I\'d like two baguettes, please.' },
      { who: 1, jp: 'Voilà. Et avec ça?', en: 'Here you are. Anything else?' },
      { who: 0, jp: 'C\'est tout, merci. Combien je vous dois?', en: 'That\'s all, thanks. How much do I owe you?' },
      { who: 1, jp: 'Trois euros cinquante.', en: 'Three euros fifty.' },
    ],
    question: 'What does she buy?',
    options: ['Two baguettes', 'One croissant', 'Some cheese'],
    questions: [
      { question: 'What does she buy?', options: ['Two baguettes', 'One croissant', 'Some cheese'] },
      { question: 'How much does she owe?', options: ['3.50 euros', '5.30 euros', '13 euros'] },
    ],
  },
  'd-train2': {
    title: 'Train times',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Pardon, à quelle heure part le train pour Nice?', en: 'Excuse me, what time does the train to Nice leave?' },
      { who: 1, jp: 'Il part à midi et demi.', en: 'It leaves at half past twelve.' },
      { who: 0, jp: 'Et il arrive à quelle heure?', en: 'And what time does it arrive?' },
      { who: 1, jp: 'À dix-huit heures.', en: 'At 18:00.' },
    ],
    question: 'When does the train leave?',
    options: ['At half past twelve', 'At noon', 'At half past one'],
    questions: [
      { question: 'When does the train leave?', options: ['At half past twelve', 'At noon', 'At half past one'] },
      { question: 'When does it arrive?', options: ['At 6 p.m.', 'At 8 a.m.', 'At midnight'] },
    ],
  },
  'd-meet2': {
    title: 'A family photo',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Qui est-ce, sur la photo?', en: 'Who is that in the photo?' },
      { who: 1, jp: 'C\'est ma mère. Elle est médecin.', en: 'That\'s my mother. She is a doctor.' },
      { who: 0, jp: 'Et lui, c\'est ton frère?', en: 'And him, is he your brother?' },
      { who: 1, jp: 'Non, c\'est mon père! Mon frère est à Paris.', en: 'No, that\'s my father! My brother is in Paris.' },
    ],
    question: 'Who is the doctor?',
    options: ['Her mother', 'Her sister', 'Her father'],
    questions: [
      { question: 'Who is the doctor?', options: ['Her mother', 'Her sister', 'Her father'] },
      { question: 'Where is her brother?', options: ['In Paris', 'At home', 'At school'] },
    ],
  },
  'd-flat2': {
    title: 'Making coffee',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Tu veux un café?', en: 'Do you want a coffee?' },
      { who: 1, jp: 'Oui, avec du lait. Où est la cuisine?', en: 'Yes, with milk. Where is the kitchen?' },
      { who: 0, jp: 'Là-bas, à droite. Les tasses sont sur la table.', en: 'Over there, on the right. The cups are on the table.' },
      { who: 1, jp: 'Merci! Tu es sympa.', en: 'Thanks! You\'re nice.' },
    ],
    question: 'What does she want?',
    options: ['Coffee with milk', 'Tea', 'Water'],
    questions: [
      { question: 'What does she want?', options: ['Coffee with milk', 'Tea', 'Water'] },
      { question: 'Where is the kitchen?', options: ['On the right', 'On the left', 'Upstairs'] },
    ],
  },
  'd-weather2': {
    title: 'Packing for tomorrow',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Il pleut demain. Tu prends un parapluie?', en: 'It\'s raining tomorrow. Are you taking an umbrella?' },
      { who: 1, jp: 'Oui, et un manteau. Il fait froid le soir.', en: 'Yes, and a coat. It\'s cold in the evening.' },
      { who: 0, jp: 'Moi, je prends un t-shirt. Il fait chaud à midi!', en: 'Me, I\'m taking a T-shirt. It\'s hot at noon!' },
    ],
    question: 'What will the weather be like tomorrow?',
    options: ['Rainy', 'Snowy', 'Sunny all day'],
    questions: [
      { question: 'What will the weather be like tomorrow?', options: ['Rainy', 'Snowy', 'Sunny all day'] },
      { question: 'Why is the second woman taking a coat?', options: ['It gets cold in the evening', 'It is snowing', 'It is windy'] },
    ],
  },
  'd-hungry2': {
    title: 'A bad day',
    cast: ['woman2', 'woman'],
    lines: [
      { who: 0, jp: 'Pourquoi tu es triste aujourd\'hui?', en: 'Why are you sad today?' },
      { who: 1, jp: 'Je suis fatiguée. J\'ai perdu mon portefeuille hier.', en: 'I\'m tired. I lost my wallet yesterday.' },
      { who: 0, jp: 'Oh non! Tu veux un thé?', en: 'Oh no! Do you want a tea?' },
      { who: 1, jp: 'Oui, merci. Tu es sympa.', en: 'Yes, thanks. You\'re kind.' },
    ],
    question: 'Why is she sad?',
    options: ['She lost her wallet', 'She is hungry', 'She missed the train'],
    questions: [
      { question: 'Why is she sad?', options: ['She lost her wallet', 'She is hungry', 'She missed the train'] },
      { question: 'What is she offered?', options: ['Tea', 'Coffee', 'Cake'] },
    ],
  },
  'd-pharmacy2': {
    title: 'An emergency',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Au secours! Mon ami est malade!', en: 'Help! My friend is ill!' },
      { who: 1, jp: 'Appelez une ambulance. Où êtes-vous?', en: 'Call an ambulance. Where are you?' },
      { who: 0, jp: 'Nous sommes devant la gare.', en: 'We are in front of the station.' },
      { who: 1, jp: 'D\'accord, restez là. Les pompiers arrivent.', en: 'Okay, stay there. The firefighters are coming.' },
    ],
    question: 'Who is ill?',
    options: ['Her friend', 'Her sister', 'The pharmacist'],
    questions: [
      { question: 'Who is ill?', options: ['Her friend', 'Her sister', 'The pharmacist'] },
      { question: 'Where are they?', options: ['In front of the station', 'At the hospital', 'On the beach'] },
    ],
  },
  'd-weekend2': {
    title: 'A text message',
    cast: ['woman', 'woman2'],
    lines: [
      { who: 0, jp: 'Salut! Tu fais quoi samedi?', en: 'Hi! What are you doing on Saturday?' },
      { who: 1, jp: 'Rien de spécial. Pourquoi?', en: 'Nothing special. Why?' },
      { who: 0, jp: 'Mon pote fait une fête. C\'est trop bien, tu viens?', en: 'My mate is having a party. It\'s going to be awesome, are you coming?' },
      { who: 1, jp: 'Grave! C\'est à quelle heure?', en: 'Totally! What time is it?' },
    ],
    question: 'What is happening on Saturday?',
    options: ['A party at a friend\'s', 'A trip to the beach', 'An exam'],
    questions: [
      { question: 'What is happening on Saturday?', options: ['A party at a friend\'s', 'A trip to the beach', 'An exam'] },
      { question: 'What does the second woman ask at the end?', options: ['What time it starts', 'Where it is', 'Who is coming'] },
    ],
  },
});
