# Design system — "Tactile Neopop"

Encouraging, playful and tactile: chunky pressable blocks, bright colours with a clear meaning, and
mistakes that feel like a gentle reset rather than a failure. All tokens live in `app/css/app.css` as
CSS variables, defined once for light and once for dark.

## Colour roles
| Role | Light | Edge (3D shelf) | Used for |
|---|---|---|---|
| Green | `#58CC02` | `#46A302` | progress, primary actions, correct answers |
| Blue | `#1CB0F6` | `#1899D6` | audio, selection, information |
| Gold | `#FFC800` | `#E5A500` | completed lessons, XP, rewards |
| Orange | `#FF9600` | `#E08500` | streak, "needs review" |
| Red | `#FF4B4B` | `#EA2B2B` | hearts, wrong answers |
| Purple | `#CE82FF` | `#A559E3` | fun facts and quick breaks |

Neutrals (light → dark): background `#F7F9FA` → `#131F24`, cards `#FFFFFF` → `#1B2A31`,
borders `#E5E5E5` → `#37464F`, text `#4B4B4B` → `#DCE6EC`. The bright colours stay the same in dark
mode so the app keeps its energy; soft tints (feedback backgrounds, pills) get darker versions.

## Type
- **Nunito Sans** 600 / 700 / 800 for everything Latin; labels and buttons are uppercase with
  0.04–0.05em letter spacing.
- **M PLUS Rounded 1c** for Japanese — rounded to match Nunito.

## Depth: the press
No blurry shadows. Interactive blocks have a solid bottom shelf (`box-shadow: 0 4px 0 <edge>`).
When pressed they move down 4px and the shelf disappears, like a physical button.

## Shapes
Buttons 16px radius, cards 24px, pills fully round. Path nodes are round (lessons) or rounded squares
(chests, trophies).

## Layout
Single centred column, max 600px, 16px side gutters, bottom navigation on all sizes.

## Mascot
Kuri, a shiba inu (`app/js/mascot.js`), drawn in SVG with moods: happy, cheer, sad.
