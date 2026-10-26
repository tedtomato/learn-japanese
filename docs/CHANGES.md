# Request tracker

Every request, and whether it is in the app. ✅ done · 🚧 in progress / next chunk · ⏳ planned · ❌ not doing (reason given).
Releases are listed in the in-app change log (Profile → App version).

## Batch 14 — 27 Oct 2026
| Request | Status | Release |
|---|---|---|
| Automated phone-screen tests on every update | ✅ scripts/screens.mjs (npm run screens): ~60 screens × light/dark at 393×851; fails on sideways scroll, text off-screen or cut, text < 13px (romaji < 10.5px), overflowing boxes, page errors; runs in the deploy pipeline before publishing | 0.76 |
| Tidy up the Practice tab | ✅ Today / Games / Library switcher | 0.77 |
| More travel units (hotel, restaurant extras, numbers & time, emergencies, transport) | 🚧 Unit 5 At the hotel + Hotel check-in mission (0.78); restaurant, numbers & time, emergencies, transport next | 0.78 |
| Deploy too slow with the phone check (~11 min) | ✅ uses the runner's Chrome (no download), dark theme only: check ~30 s | 0.78 |

## Batch 13 — 26 Oct 2026
| Request | Status | Release |
|---|---|---|
| Text too small / too big too often (check at my phone size) | ✅ audit of 30 screens at 393×851: reading text ≥ 14px, labels ≥ 13px, romaji ≥ 13px (11 when tight), Japanese answers 22px, headings capped; words never split across lines; speak bubble fits; fit-to-width floor raised | 0.75 |
| Kanji card squeezed to the right, parts wrapping (電 screenshot) | ✅ character stacked above new-item cards; card full width; compact parts row | 0.74 |
| How sure are you? (confidence rating) | ✅ "🤔 I guessed" after a right answer (comes back like a slow one); "😎 I knew it" undoes "a bit slow" | 0.69 |
| Guess first, then learn | ✅ up to 2 new words per lesson: hear/see it, guess the meaning from 3 (not scored), then its card | 0.70 |
| Recall without options (type the answer) | ✅ type the romaji for a known word (1 per lesson from level 2, 2 in reviews, 1 in practice); lenient (case, spaces, ou/o, ō); one-letter slip = "almost"; "I don't know"; no heart lost | 0.71 |
| Keyword mnemonics for words | ✅ 107 sound-alike tricks (compounds build on the base word); on new-word cards, in Explain, and as a hint on en→jp / jp→en / recall questions (using it = comes back sooner) | 0.72 |
| Substitution drills (patterns: ___ をください…) | ✅ Practice → Pattern drills: 5 patterns; 8 rounds (fill the blank ×5, type whole sentence ×3); only learned words, opens at 3; reviews the slot word; +1 gem each | 0.73 |

## Batch 12 — 25 Oct 2026
| Request | Status | Release |
|---|---|---|
| "Let's correct the exercises you missed" shown when nothing was missed (only slow) | ✅ wording depends on what happened (all right but slow / missed / both); countdown hidden on that screen | 0.68 |
| Mistakes review | ✅ "Fix your mistakes" card on Practice (words got wrong and not answered right since, 8 per session); all fixed = +5 gems | 0.64 |
| Listening mode for walks (hands-free audio) | ✅ Practice → Listening mode: English → pause to answer → Japanese ×2; weakest 20 words/phrases; screen kept awake; pause / next; 10 phrases = +5 XP (daily goal + streak) | 0.65 |
| Sign spotter (real-looking signs: 出口, 男/女, 東口, 円…) | ✅ Practice → Sign spotter: 19 travel situations (yellow station signs, blue/street signs, wooden toilet plaques, order buttons, vertical menu, price tags); unlocked from 3 situations; answers count as kanji reviews; +1 gem each | 0.66 |
| Real-world missions (role-play: order ramen, buy a ticket…) | ✅ Practice → Missions: 4 chats (Meet your host, Lost in Shinjuku, Café order, Konbini run), one per section 1 unit, unlocked when the unit's lessons are done; Japanese + romaji, English on tap, voices; wrong replies explained; 3 stars; +10 XP each time, 2 gems per new star | 0.67 |
| Remove "Tested by Geraldine" | ✅ reverted | — |

## Batch 11 — 22 Oct 2026
| Request | Status | Release |
|---|---|---|
| Tap what you hear: を + げんき marked wrong though it sounds like おげんき | ✅ sound-alike tiles never offered; same-sounding answers accepted | 0.62 |
| No katakana for now | ✅ no katakana lessons; Katakana practice/chart only shown if some were already learned | 0.60 |
| Less hiragana until the end | ✅ none in section 1, one 4-character lesson per unit after, the rest in the Kana corner at the end | 0.60 |
| Priority: key words, phrases and travel kanji | ✅ kanji from unit 1 (0.60); travel-sign kanji all in section 1 — 入口/出口, 男/女/お手洗い, 電車/駅, 右/左, 東西南北 exits, 円; radical-only lessons dropped (radicals still shown in each kanji's parts) | 0.61 |

## Batch 10 — 21 Oct 2026
| Request | Status | Release |
|---|---|---|
| Tap progress bars (words, kanji…) to see what they mean | ✅ | 0.52 |
| Bridge orientation wrong (went along the water) | ✅ along the path over the stream, seen slightly from the side: red arch visible, rails, posts, gold caps | 0.59 |
| Bridges look horrible — use stepping stones or planks to cross the streams | ✅ three flat stepping stones in the water; the trail stops at the banks | 0.59 |
| Bridges: side view, Japanese style (like the photo) | ✅ red arched taiko bridge with posts, rails, gold caps, reflection | 0.58 |
| Progress bar "Okay 57%" for a word right 17 of 18 times doesn't make sense | ✅ ⅔ accuracy + ⅓ lasting (full after surviving ~3 days); explanation text updated | 0.56 |
| Roadblock instead of the dog at the end of the path (more units on the way) | ✅ barrier, cones, blinking lamps, 工事中 sign | 0.55 |
| Fun facts quiz answers don't work / give too much away | ✅ 200 written questions (one per fact), plausible wrong answers on the same topic, answer never in the question, fact shown after answering | 0.54 |
| Quiz (multiple choice) about fun facts already shown | ✅ Practice → Fun facts → Quiz me (from 4 facts seen); fact name hidden, pick it from 4; +1 gem each | 0.53 |
| Notifications | ✅ option A: daily reminder via periodic background sync (Android Chrome, installed app; quiet before 9:00 and after 22:00; only if not studied today). Option B (GitHub-sent push at a fixed time) ⏳ not done | 0.51 |
| Profile: Day streak opens the calendar | ✅ | 0.50 |
| Explain the daily XP goal when tapping on it | ✅ explanation + goal picker | 0.49 |
| Write "Section 1 – Unit 4" etc. | ✅ lesson header and path pop-up (0.48); unit banners and Guide (0.57) | 0.57 |
| Use gems to buy hearts | ✅ 30 gems = full hearts; from the top-bar heart or the Out of hearts screen (lesson continues) | 0.47 |
| Animation overlay for a streak of 5 good answers in a row | ✅ at 5, 10, 15… with sound | 0.45 |
| Hiragana still difficult — what else? | ✅ two new characters at a time with a hear-and-pick mini practice; gentle Hiragana / Katakana practice drills on the Kana tab | 0.46 |

## Batch 9 — 20 Oct 2026
| Request | Status | Release |
|---|---|---|
| Kanji-only practice mode | ✅ Practice → Kanji tab → Start (8 kanji, one per character, most urgent first; unlocks at 3 kanji) | 0.44 |
| Hints not useful (word shown only in hiragana) | ✅ romaji word with the sound highlighted, kana underneath | 0.43 |
| Show a kanji in lesson breaks sometimes | ✅ ~1 break in 5 | 0.42 |
| Remove the useful phrase/fact card from the home screen | ✅ (facts still appear as lesson breaks; phrases in the Phrasebook) | 0.41 |
| Practise hiragana with common words | ✅ up to 2 familiar-word reading questions per Read it lesson (in ~21 of 27 lessons), untimed the first time, picture after answering | 0.40 |
| Hiragana learning too difficult | ✅ learn-one-check-one, 3 choices, no look-alikes, untimed first time, picture-word hint, memory word in feedback, no giveaway audio | 0.39 |

## Batch 8 — 19 Oct 2026
| Request | Status | Release |
|---|---|---|
| Tighten romaji spacing everywhere like the grammar cards | ✅ | 0.34 |
| Kanji answer options too small | ✅ 44 px, centred | 0.34 |
| Kanji too small in matching pairs | ✅ 38 px | 0.35 |
| Practice list: kanji words overflowing their box | ✅ box widens, word on one line | 0.36 |
| Strength bar too low for words I know well | ✅ bar = half review schedule progress + half accuracy (after a few answers); fades when overdue | 0.38 |
| Practice: same kanji listed several times; too much content on one page | ✅ one entry per character; Words / Kanji / Kana tabs; one-line entries | 0.37 |
| Translate-into-Japanese screen truncated; too much space under the English | ✅ tiles keep words on one line (they were stacking vertically); smaller answer area | 0.32 |
| Highlight the syllables in dialogues and tapped words | ✅ (dialogue text is hidden while listening, so highlighting starts once it is revealed) | 0.33 |
| Highlight the syllables when a phrase is spoken | ✅ karaoke-style, follows the voice's pace (and its position when the phone reports it) | 0.31 |

## Batch 7 — 18 Oct 2026
| Request | Status | Release |
|---|---|---|
| "Nice to meet you" card and question bubble cut off on the right | ✅ long words shrink to fit, then wrap | 0.12 |
| No pictures next to each answer | ✅ removed from answer choices (kept on the new-word card) | 0.12 |
| Remove auto jump to next exercise (no time to tap Explain) | ✅ removed, with its setting | 0.13 |
| Say the word in Japanese when tapping it | ✅ each word of a sentence is tappable (not in reading tests) | 0.30 |
| Whole sentences in hiragana too hard for beginners — provide help | ✅ romaji kept until characters are well known; sentences keep romaji longer; Show romaji button; setting Auto / Always | 0.29 |
| Where to see the daily streak → calendar when tapping the flame | ✅ month calendar (studied / goal reached / today), best streak, days studied, freezes | 0.28 |
| Practise again the next day what was learnt the day before | ✅ already scheduled (spaced repetition); now a Today's review card on Learn shows what's due, one tap to review | 0.27 |
| Long Japanese answer option cut off on the right | ✅ shrinks, then wraps (0.25); with romaji shown, romaji packs tighter first so it stays on one line (0.26) | 0.26 |
| Link hiragana to words people know, like sushi | ✅ 56 hiragana + 49 katakana linked to a familiar word, with picture; tap to hear | 0.24 |
| Show a kanji once with a memory clue before asking to recognise it | ✅ any never-answered item gets its card first (lessons and Practice); clue highlighted | 0.23 |
| Breaks: interesting facts about Japan, not useful phrases | ✅ (phrases stay in the Phrasebook and on the Learn page) | 0.22 |
| Stick to the original female voice; use a new adult female character for now | ✅ Mika added; Yuki and Mika only, natural voice; Ken, Sora and Hana kept for later | 0.21 |
| Ken still has a weird voice | ✅ no more heavy pitch shift (sounded robotic). A real male voice needs one installed on the phone | 0.20 |
| Missing a proper man voice | ✅ male voices detected (Android jac/jad, Apple, Microsoft); per-character voice picker in Profile; deeper fallback. Needs a male Japanese voice installed on the phone | 0.19 |
| Kanji peek: unclear "kun / on" lines under the meaning | ✅ plain labels: "Alone, say" / "In longer words" / "Example word" | 0.18 |
| Grammar card: Japanese word hardly readable | ✅ bigger, bolder, letters kept together | 0.17 |
| Japanese bridges crossing small streams on the path | ✅ two per unit | 0.16 |
| Game logo picture when sharing on WhatsApp | ✅ picture attached (share sheet → WhatsApp); link preview shows the logo otherwise | 0.15 |
| Unit Guide: long words spilling over the next card | ✅ | 0.15 |
| Zen pebbles and moss around the path | ✅ | 0.14 |
| Asked about kanji not learned yet | ✅ "Did you know" kanji stay in Practice; unlearned kanji not used as options | 0.12 |

## Batch 6 — 18 Oct 2026
| Request | Status | Release |
|---|---|---|
| English (romaji) text too small | ✅ ~40% bigger | 0.9 |
| Sound button too big | ✅ 72 px (was 110 px) | 0.9 |
| "Check update" says latest but app stuck on v0.8 | ✅ cause: Pages was also publishing straight from the branch and overwrote each release; source switched to GitHub Actions | 0.10 |
| Matching pairs: right column pushed off screen by long words | ✅ | 0.11 |
| Lesson pop-up on the path cut off at the left edge | ✅ positioned inside the screen | 0.11 |
| Moves too quickly to the next exercise | ✅ 2.5 s / 5 s, plus Auto-continue setting — later removed entirely (0.13) | 0.10 |

## Batch 5 — 18 Oct 2026
| Request | Status | Release |
|---|---|---|
| Only works on a mobile phone (not computer / tablet) | ✅ | 0.5 |
| Text on screen can't be selected | ✅ | 0.5 |
| Ship in chunks under 10 minutes; keep this tracker | ✅ | 0.5 |
| Game name spoken with an exclamation at start ("はじめ！") | ✅ (after the first tap — phones block sound before) | 0.5 |
| Start screen credits: "Beta version - Oct 26. Created by Seb and Claude AI", animated Claude logo | ✅ | 0.5 |
| Change log with versions, dates and key changes, shown when tapping the app version | ✅ | 0.5 |
| Bottom menu icons animate when tapped | ✅ | 0.5 |
| "Tokyo trip" → "First trip to Japan" | ✅ | 0.5 |
| Hidden test screen on Profile (double tap) to try features / unlock all, without touching real progress | ✅ double-tap the dog on Profile | 0.6 |
| App number not showing | ✅ on start screen and under My progress | 0.6 |
| Vegetation, bonsai trees, zen stones along the learning path, showing a path | ✅ | 0.7 |
| Share trophies and "Did you know?" on WhatsApp | ✅ (facts, phrases, kanji, achievements, unit trophies) | 0.8 |

## Batch 4
| Request | Status | Release |
|---|---|---|
| Match pairs: same height left and right | ✅ | 0.4 |
| Speed challenge: countdown at top, end-of-time sound, bonus when on time | ✅ | 0.4 |
| Continue automatically ~1 s after Check | ✅ (wrong answers wait 3.5 s, with Explain) | 0.4 |
| No emoji-looking pictures; cartoon style | ✅ partly — Twemoji flat cartoon set; custom drawings offered | 0.4 |
| Sakura petals at end of session | ✅ | 0.4 |
| Dog always animated | ✅ | 0.4 |
| Path pop-up truncated for left/right nodes | ✅ | 0.4 |
| "Did you know" in breaks follows the section theme | ✅ | 0.4 |
| Date format "13 Oct 2026" | ✅ | 0.4 |
| App version shown | ✅ | 0.4 |
| My progress: tap words collected → Practice list | ✅ | 0.4 |
| Introduce と and です earlier | ✅ | 0.4 |
| Key jobs (teacher, doctor, lawyer…) | ✅ | 0.4 |
| Four characters (man, woman, boy, girl) say the words, matching voices, speaking animation, auto-play | ✅ | 0.4 |
| Note hesitation or wrong answers and re-teach later | ✅ | 0.4 |
| さようなら rarely used | ✅ | 0.4 |
| Hiragana spread through sections, not whole sections | ✅ | 0.4 |
| Collected kanji asked as questions with a clue | ✅ | 0.4 |
| Chest / bonus pop-up with animation | ✅ | 0.4 |
| Fast natural speech listening, no slow option | ✅ | 0.4 |
| Start-up pop-up with app name and mascot | ✅ | 0.4 |
| Grammar: 15-second visual interactive rules | ✅ | 0.4 |
| "Explain why" after answering | ✅ | 0.4 |
| Simple kanji, radical + mnemonic method, micro-stories, compound words | ✅ | 0.4 |
| Repeat-the-sentence voice recognition; skip hides it for 1 hour | ✅ | 0.4 |
| Trace characters (stroke order and direction) | ✅ | 0.4 |
| Advanced: two characters talk, player says what it was about | ✅ | 0.4 |
| Phrases from the pasted travel list (greetings, travel, food, slang, honorifics) | ✅ | 0.4 |
| Change voices male/female and tone randomly | ✅ (per character) | 0.4 |
| Formal thank you + variations for friends and family | ✅ | 0.4 |

## Earlier
| Request | Status | Release |
|---|---|---|
| Learning game for Japanese from zero, look and feel from the mock-ups, dark mode | ✅ | 0.1 |
| Updates automatically from GitHub, no server | ✅ | 0.1 / 0.3 |
| Never use the name of the app that inspired it in the repo | ✅ | — |
| Fun facts and phrases shown now and then | ✅ | 0.1 |
| Start with useful words for tourists | ✅ | 0.2 |
| Reliable updates on the phone | ✅ | 0.3 |

## Ideas from the feature breakdown (see ROADMAP.md)
| Idea | Status |
|---|---|
| Adaptive difficulty (aim for ~80% success) | ⏳ |
| Forgetting-curve model instead of boxes | ⏳ |
| Leagues, quests, friends | ⏳ (needs shared data between devices) |
| Furigana / romaji display settings | ⏳ |
