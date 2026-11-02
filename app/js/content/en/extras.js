// Fun facts about the UK (and a few about the wider English-speaking world) and travel phrases,
// shown between lessons. Same shapes as ../extras.js. The facts are written in simple English so
// they double as reading practice. In the phrases, `jp` holds the English phrase (spoken), `say`
// a pronunciation respelled for French speakers, and `en` the French meaning.

export const FACTS = [
  {"id": 1, "category": "Food & Drink", "title": "A Nation of Tea Drinkers", "text": "Tea is the favourite hot drink in the UK. Most people drink black tea with a splash of milk, and 'Shall I put the kettle on?' is a classic way to welcome a guest.", "icon": "tea"},
  {"id": 2, "category": "Food & Drink", "title": "Fish and Chips", "text": "Fish and chips became a popular meal in the 1800s. During the Second World War it was one of the few foods that was never rationed.", "icon": "fish"},
  {"id": 3, "category": "Food & Drink", "title": "The Full English", "text": "A full English breakfast usually has eggs, bacon, sausages, baked beans, grilled tomato, mushrooms and toast. Scotland, Wales and Northern Ireland have their own versions.", "icon": "food"},
  {"id": 4, "category": "Food & Drink", "title": "Sunday Roast", "text": "Many families eat a Sunday roast: roast meat with roast potatoes, vegetables and gravy. With roast beef you often get a Yorkshire pudding, a crispy batter cup.", "icon": "food"},
  {"id": 5, "category": "Food & Drink", "title": "Afternoon Tea", "text": "Afternoon tea became fashionable in the 1840s thanks to Anna, Duchess of Bedford, who felt hungry between lunch and a late dinner. Today it means tea, small sandwiches, cakes and scones with jam and cream.", "icon": "sweets"},
  {"id": 6, "category": "Food & Drink", "title": "Jam or Cream First?", "text": "In Devon, people usually put clotted cream on a scone first and jam on top. In Cornwall, it is the other way round: jam first, then cream. Both sides take it very seriously!", "icon": "bread"},
  {"id": 7, "category": "Food & Drink", "title": "A National Curry", "text": "Curry is one of the most popular meals in Britain. In 2001, the Foreign Secretary Robin Cook called chicken tikka masala 'a true British national dish'.", "icon": "food"},

  {"id": 8, "category": "Cities & Landmarks", "title": "Big Ben Is a Bell", "text": "Big Ben is the name of the great bell inside the clock tower at the Houses of Parliament. The tower itself was renamed the Elizabeth Tower in 2012.", "icon": "tower"},
  {"id": 9, "category": "Cities & Landmarks", "title": "Free Museums", "text": "Many of the UK's big national museums, like the British Museum and the Natural History Museum in London, are free to enter.", "icon": "book"},
  {"id": 10, "category": "Cities & Landmarks", "title": "A Castle on a Volcano", "text": "Edinburgh Castle stands on Castle Rock, the remains of an ancient volcano that has been extinct for millions of years.", "icon": "castle"},
  {"id": 11, "category": "Cities & Landmarks", "title": "Stonehenge", "text": "Stonehenge, in the south of England, was built in stages starting around 5,000 years ago. Nobody knows for sure what it was used for.", "icon": "rocks"},
  {"id": 12, "category": "Cities & Landmarks", "title": "Roman Bath", "text": "The city of Bath is named after its Roman baths, built around natural hot springs nearly 2,000 years ago. The whole city is a UNESCO World Heritage Site.", "icon": "city"},
  {"id": 13, "category": "Cities & Landmarks", "title": "The Ravens of the Tower", "text": "A legend says the kingdom will fall if the ravens ever leave the Tower of London, so at least six ravens are always kept there.", "icon": "castle"},

  {"id": 14, "category": "History & Royals", "title": "Four Nations", "text": "The United Kingdom is made of four nations: England, Scotland, Wales and Northern Ireland. Great Britain is the island with England, Scotland and Wales.", "icon": "globe"},
  {"id": 15, "category": "History & Royals", "title": "The Union Jack", "text": "The UK flag, the Union Jack, combines three crosses: the red cross of St George for England, the white diagonal cross of St Andrew for Scotland and the red diagonal cross of St Patrick for Ireland.", "icon": "flag"},
  {"id": 16, "category": "History & Royals", "title": "Seventy Years a Queen", "text": "Queen Elizabeth II reigned for 70 years, from 1952 to 2022, longer than any other British monarch. Her son became King Charles III.", "icon": "castle"},
  {"id": 17, "category": "History & Royals", "title": "Magna Carta", "text": "In 1215, King John agreed to the Magna Carta, a document saying that even the king had to follow the law.", "icon": "book"},
  {"id": 18, "category": "History & Royals", "title": "Hadrian's Wall", "text": "The Romans started building Hadrian's Wall in AD 122. It ran about 117 kilometres across the north of England, and long parts of it can still be walked today.", "icon": "rocks"},
  {"id": 19, "category": "History & Royals", "title": "Number 10", "text": "The Prime Minister lives and works at 10 Downing Street in London. Its famous black front door cannot be opened from the outside.", "icon": "house"},

  {"id": 20, "category": "Nature & Weather", "title": "Always Raining?", "text": "The UK is known for rain, but it is not the same everywhere: the mountains of western Scotland and Wales are very wet, while London and the east of England are much drier.", "icon": "umbrella"},
  {"id": 21, "category": "Nature & Weather", "title": "Ben Nevis", "text": "Ben Nevis, in the Scottish Highlands, is the highest mountain in the UK at 1,345 metres. Its top is often in the clouds.", "icon": "mountain"},
  {"id": 22, "category": "Nature & Weather", "title": "Loch Ness", "text": "Loch Ness in Scotland is famous for its legendary monster, Nessie. The lake is so deep that it holds more fresh water than all the lakes of England and Wales together.", "icon": "wave"},
  {"id": 23, "category": "Nature & Weather", "title": "The White Cliffs", "text": "The White Cliffs of Dover are made of chalk. On a clear day, you can see France from the top.", "icon": "sea"},
  {"id": 24, "category": "Nature & Weather", "title": "The Giant's Causeway", "text": "In Northern Ireland, the Giant's Causeway has about 40,000 stone columns made by an ancient volcanic eruption. Legend says a giant built it.", "icon": "volcano"},
  {"id": 25, "category": "Nature & Weather", "title": "The Lake District", "text": "The Lake District is England's largest national park. Its lakes and hills inspired poets like William Wordsworth and the author Beatrix Potter.", "icon": "tree"},

  {"id": 26, "category": "Traditions & Festivals", "title": "Bonfire Night", "text": "On 5 November, people light bonfires and watch fireworks. It remembers the Gunpowder Plot of 1605, when Guy Fawkes and others tried to blow up Parliament.", "icon": "star"},
  {"id": 27, "category": "Traditions & Festivals", "title": "Pancake Day", "text": "Shrove Tuesday, the day before Lent starts, is called Pancake Day. Some towns hold pancake races, where runners flip a pancake in a frying pan as they run.", "icon": "food"},
  {"id": 28, "category": "Traditions & Festivals", "title": "Christmas Crackers", "text": "At Christmas dinner, two people pull a cracker until it breaks with a bang. Inside there is a paper crown, a small gift and a very bad joke.", "icon": "star"},
  {"id": 29, "category": "Traditions & Festivals", "title": "Boxing Day", "text": "26 December is Boxing Day, a public holiday in the UK. Today many people spend it watching football, walking or shopping in the sales.", "icon": "calendar"},
  {"id": 30, "category": "Traditions & Festivals", "title": "Notting Hill Carnival", "text": "Every August, the Notting Hill Carnival in London celebrates Caribbean culture with music, costumes and food. It is one of the biggest street festivals in Europe.", "icon": "music"},
  {"id": 31, "category": "Traditions & Festivals", "title": "Burns Night", "text": "On 25 January, Scots celebrate the poet Robert Burns with a supper of haggis, poems and songs. Burns also wrote the words of 'Auld Lang Syne', sung at New Year.", "icon": "book"},

  {"id": 32, "category": "Language & Accents", "title": "French in English", "text": "After the Norman Conquest of 1066, French was the language of England's rulers for centuries. That is why English has words like 'beef' (from 'boeuf') next to the old English 'cow'.", "icon": "speech"},
  {"id": 33, "category": "Language & Accents", "title": "So Many Accents", "text": "British accents change a lot from place to place. Scouse from Liverpool, Geordie from Newcastle and Cockney from London all sound very different.", "icon": "speech"},
  {"id": 34, "category": "Language & Accents", "title": "Rhyming Slang", "text": "In Cockney rhyming slang, a word is replaced by a phrase that rhymes with it: 'apples and pears' means 'stairs'.", "icon": "fruit"},
  {"id": 35, "category": "Language & Accents", "title": "Welsh", "text": "Welsh is an official language in Wales, and road signs there are written in both Welsh and English. 'Croeso' means 'welcome'.", "icon": "speech"},
  {"id": 36, "category": "Language & Accents", "title": "A Very Long Name", "text": "A village in Wales has one of the longest place names in Europe: Llanfairpwllgwyngyll, which is usually shortened from a 58-letter name.", "icon": "book"},
  {"id": 37, "category": "Language & Accents", "title": "Colour or Color?", "text": "British and American spelling are different: colour and color, centre and center. Noah Webster's American dictionary of 1828 made many of these changes popular in the US.", "icon": "book"},
  {"id": 38, "category": "Language & Accents", "title": "A World Language", "text": "English is an official language in dozens of countries, from Australia and Canada to India, Nigeria and Jamaica. Each has its own words, like the Australian 'arvo' for 'afternoon'.", "icon": "globe"},

  {"id": 39, "category": "Transport & Travel", "title": "The Oldest Underground", "text": "The London Underground opened in 1863. It was the first underground railway in the world, and Londoners call it 'the Tube'.", "icon": "train"},
  {"id": 40, "category": "Transport & Travel", "title": "Mind the Gap", "text": "On the Tube, a voice reminds passengers to 'mind the gap' between the train and the platform. The phrase is now printed on T-shirts and mugs.", "icon": "train"},
  {"id": 41, "category": "Transport & Travel", "title": "Driving on the Left", "text": "In the UK, cars drive on the left. On London streets, words painted on the road tell visitors to 'look right' or 'look left' before crossing.", "icon": "taxi"},
  {"id": 42, "category": "Transport & Travel", "title": "The Knowledge", "text": "To drive a black cab in London, drivers must pass 'The Knowledge', a test on thousands of streets and places. Learning it usually takes several years.", "icon": "taxi"},
  {"id": 43, "category": "Transport & Travel", "title": "The Channel Tunnel", "text": "The Channel Tunnel opened in 1994 under the sea between England and France. The Eurostar train goes from London to Paris in just over two hours.", "icon": "bullet"},
  {"id": 44, "category": "Transport & Travel", "title": "Red Buses", "text": "London's red double-decker buses are famous around the world. You cannot pay with cash on them: you tap a bank card, a phone or an Oyster card.", "icon": "bus"},

  {"id": 45, "category": "Sport & Daily Life", "title": "The Home of Football", "text": "The Football Association was founded in London in 1863 and wrote the first official rules of the modern game.", "icon": "football"},
  {"id": 46, "category": "Sport & Daily Life", "title": "Wimbledon", "text": "Wimbledon, first played in 1877, is the oldest tennis tournament in the world. Players must wear white, and fans eat strawberries and cream.", "icon": "fruit"},
  {"id": 47, "category": "Sport & Daily Life", "title": "Rugby School", "text": "The sport of rugby is named after Rugby School in England, where it was developed in the 1800s.", "icon": "school"},
  {"id": 48, "category": "Sport & Daily Life", "title": "The Queue", "text": "The British are famous for queueing: people wait patiently in line, and jumping the queue is seen as very rude.", "icon": "person"},
  {"id": 49, "category": "Sport & Daily Life", "title": "Talking About the Weather", "text": "Weather is the favourite small talk in Britain. 'Lovely day, isn't it?' is an easy way to start a chat with almost anyone.", "icon": "sun"},
  {"id": 50, "category": "Sport & Daily Life", "title": "The Pub Quiz", "text": "Many pubs hold a weekly quiz night, where teams of friends answer questions on sport, music, history and more to win a prize.", "icon": "beer"},
];

export const PHRASES = [
  {"id": 1, "category": "Les bases polies", "jp": "Hello", "romaji": "", "say": "Hé-lo", "en": "Bonjour", "icon": "speech"},
  {"id": 2, "category": "Les bases polies", "jp": "Thank you", "romaji": "", "say": "Sènk-iou", "en": "Merci", "icon": "speech"},
  {"id": 3, "category": "Les bases polies", "jp": "Please", "romaji": "", "say": "Pliiz", "en": "S'il vous plaît", "icon": "speech"},
  {"id": 4, "category": "Les bases polies", "jp": "Sorry", "romaji": "", "say": "So-ri", "en": "Désolé / Pardon", "icon": "bowing"},
  {"id": 5, "category": "Les bases polies", "jp": "Excuse me", "romaji": "", "say": "Ex-kiouz mi", "en": "Excusez-moi", "icon": "speech"},
  {"id": 6, "category": "Les bases polies", "jp": "Nice to meet you", "romaji": "", "say": "Naïss tou mit-iou", "en": "Enchanté", "icon": "person"},
  {"id": 7, "category": "Les bases polies", "jp": "How are you?", "romaji": "", "say": "Hao ar iou ?", "en": "Comment allez-vous ?", "icon": "speech"},
  {"id": 8, "category": "Les bases polies", "jp": "See you later", "romaji": "", "say": "Sii iou lé-teu", "en": "À plus tard", "icon": "speech"},

  {"id": 9, "category": "Se déplacer", "jp": "Where is the station?", "romaji": "", "say": "Ouèr iz ze sté-cheun ?", "en": "Où est la gare ?", "icon": "train"},
  {"id": 10, "category": "Se déplacer", "jp": "A return to London, please", "romaji": "", "say": "Eu ri-teurn tou Leun-deun, pliiz", "en": "Un aller-retour pour Londres, s'il vous plaît", "icon": "ticket"},
  {"id": 11, "category": "Se déplacer", "jp": "Which platform?", "romaji": "", "say": "Ouitch plat-form ?", "en": "Quel quai ?", "icon": "train"},
  {"id": 12, "category": "Se déplacer", "jp": "Does this bus go to the centre?", "romaji": "", "say": "Deuz ziss beuss go tou ze senn-teu ?", "en": "Ce bus va-t-il au centre-ville ?", "icon": "bus"},
  {"id": 13, "category": "Se déplacer", "jp": "Is it far?", "romaji": "", "say": "Iz it far ?", "en": "C'est loin ?", "icon": "globe"},
  {"id": 14, "category": "Se déplacer", "jp": "I'm lost", "romaji": "", "say": "Aïm lost", "en": "Je suis perdu", "icon": "person"},

  {"id": 15, "category": "Au restaurant & au pub", "jp": "A table for two, please", "romaji": "", "say": "Eu té-beul for tou, pliiz", "en": "Une table pour deux, s'il vous plaît", "icon": "food"},
  {"id": 16, "category": "Au restaurant & au pub", "jp": "Can I have the menu?", "romaji": "", "say": "Kèn aï hav ze mè-niou ?", "en": "Je peux avoir la carte ?", "icon": "book"},
  {"id": 17, "category": "Au restaurant & au pub", "jp": "I'd like a coffee, please", "romaji": "", "say": "Aïd laïk eu ko-fi, pliiz", "en": "Je voudrais un café, s'il vous plaît", "icon": "coffee"},
  {"id": 18, "category": "Au restaurant & au pub", "jp": "Tap water, please", "romaji": "", "say": "Tap ouô-teu, pliiz", "en": "Une carafe d'eau, s'il vous plaît", "icon": "drink"},
  {"id": 19, "category": "Au restaurant & au pub", "jp": "Cheers!", "romaji": "", "say": "Tchiirz !", "en": "Santé !", "icon": "beer"},
  {"id": 20, "category": "Au restaurant & au pub", "jp": "Can I have the bill, please?", "romaji": "", "say": "Kèn aï hav ze bil, pliiz ?", "en": "L'addition, s'il vous plaît", "icon": "coin"},

  {"id": 21, "category": "Shopping & paiement", "jp": "How much is it?", "romaji": "", "say": "Hao meutch iz it ?", "en": "C'est combien ?", "icon": "coin"},
  {"id": 22, "category": "Shopping & paiement", "jp": "Can I pay by card?", "romaji": "", "say": "Kèn aï pé baï kard ?", "en": "Je peux payer par carte ?", "icon": "bank"},
  {"id": 23, "category": "Shopping & paiement", "jp": "I'm just looking, thanks", "romaji": "", "say": "Aïm djeust lou-king, sènks", "en": "Je regarde seulement, merci", "icon": "shop"},
  {"id": 24, "category": "Shopping & paiement", "jp": "Do you have a bigger size?", "romaji": "", "say": "Dou iou hav eu bi-gueu saïz ?", "en": "Vous l'avez dans une taille au-dessus ?", "icon": "shop"},
  {"id": 25, "category": "Shopping & paiement", "jp": "No bag, thanks", "romaji": "", "say": "No bag, sènks", "en": "Pas besoin de sac, merci", "icon": "shop"},

  {"id": 26, "category": "À l'hôtel", "jp": "I have a reservation", "romaji": "", "say": "Aï hav eu ré-zeu-vé-cheun", "en": "J'ai une réservation", "icon": "hotel"},
  {"id": 27, "category": "À l'hôtel", "jp": "What's the Wi-Fi password?", "romaji": "", "say": "Ouots ze ouaï-faï pass-oueurd ?", "en": "Quel est le mot de passe du wifi ?", "icon": "hotel"},
  {"id": 28, "category": "À l'hôtel", "jp": "What time is breakfast?", "romaji": "", "say": "Ouot taïm iz brèk-feust ?", "en": "À quelle heure est le petit-déjeuner ?", "icon": "food"},
  {"id": 29, "category": "À l'hôtel", "jp": "Can I leave my bags here?", "romaji": "", "say": "Kèn aï liiv maï bagz hiir ?", "en": "Je peux laisser mes bagages ici ?", "icon": "hotel"},
  {"id": 30, "category": "À l'hôtel", "jp": "What time is check-out?", "romaji": "", "say": "Ouot taïm iz tchèk-aot ?", "en": "À quelle heure faut-il libérer la chambre ?", "icon": "bed"},

  {"id": 31, "category": "Urgences & santé", "jp": "Help!", "romaji": "", "say": "Hèlp !", "en": "Au secours !", "icon": "siren"},
  {"id": 32, "category": "Urgences & santé", "jp": "Call an ambulance!", "romaji": "", "say": "Kôl eun am-biou-leunss !", "en": "Appelez une ambulance !", "icon": "medical"},
  {"id": 33, "category": "Urgences & santé", "jp": "I need a doctor", "romaji": "", "say": "Aï niid eu dok-teu", "en": "J'ai besoin d'un médecin", "icon": "medical"},
  {"id": 34, "category": "Urgences & santé", "jp": "Where is the nearest chemist?", "romaji": "", "say": "Ouèr iz ze nii-reust ké-mist ?", "en": "Où est la pharmacie la plus proche ?", "icon": "medical"},
  {"id": 35, "category": "Urgences & santé", "jp": "I don't understand", "romaji": "", "say": "Aï dount eun-deu-stand", "en": "Je ne comprends pas", "icon": "speech"},
  {"id": 36, "category": "Urgences & santé", "jp": "Can you speak slowly, please?", "romaji": "", "say": "Kèn iou spiik slo-li, pliiz ?", "en": "Vous pouvez parler lentement, s'il vous plaît ?", "icon": "speech"},
];
