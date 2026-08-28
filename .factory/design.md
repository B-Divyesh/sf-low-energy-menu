# Low-Energy Menu — visual thesis

## Direction: generative geometry as a household rhythm map

The week is drawn as a living composition of seven unequal tiles: quiet days leave more breathing room, busy days compress into sharper shapes, and leftover paths repeat as small linked circles. Geometry is explanatory rather than decorative—it makes capacity, repetition, and carry-over visible at a glance. The result should feel like notes arranged on a kitchen wall, not a generic productivity dashboard or delivery marketplace.

## Palette

The light treatment is the primary, explicitly painted like uncoated recipe paper. The dark treatment recalls a blue-black kitchen at the end of the day.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--paper` | `#F7F2E8` | `#111B22` | Page ground |
| `--paper-strong` | `#FFFDF8` | `#19262E` | Raised working surface |
| `--ink` | `#172B35` | `#F6F0E4` | Primary text |
| `--ink-muted` | `#52636A` | `#B7C5C8` | Secondary text |
| `--tomato` | `#C84630` | `#FF826D` | Primary action / high effort |
| `--tomato-ink` | `#FFFFFF` | `#20100D` | Accent contrast |
| `--corn` | `#E3A627` | `#F2C34F` | Caution / medium effort |
| `--leaf` | `#28735E` | `#63C6A5` | Ready / low effort / success |
| `--line` | `#C9C3B7` | `#40515A` | Structure and focus boundaries |
| `--danger` | `#A82E35` | `#FF8A90` | Destructive and invalid states |

All body pairings are checked for at least 4.5:1 contrast. State always includes a word or icon, never color alone.

## Type and spacing

- Display: `Georgia, "Times New Roman", serif`, chosen for the human, recipe-card character. It is system-hosted and incurs no font request.
- Interface/body: `Inter`-like native stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`) for quick scanning. Numbers use tabular figures.
- Scale: 14 px annotations, 16 px body, 20 px controls/subheads, 28 px section titles, 44–56 px single page title.
- Spacing follows a 4/8 px rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Controls are at least 44 px high.
- The desktop planner is a seven-column band. At phone width, it becomes a deliberate vertical day itinerary; secondary help moves below the plan and no horizontal week grid is forced.

## Shape, interaction, and depth

- Cards are reserved for independent day and recipe objects. Working regions group by proximity.
- Corners alternate between 4 px and 18 px to echo clipped recipe cards and round plates.
- Low/medium/high effort is represented by one/two/three filled geometric pips plus text.
- A planned meal arrives from its recipe rail with a 180 ms translate-and-fade. Warnings unfold beneath the affected day in 220 ms. Dialogs grow from the triggering card. Pressed controls move 1 px down.
- Focus is a 3 px corn outer ring with ink separation. Destructive actions require confirmation or provide undo.
- Reduced motion removes transforms and uses instant/opacity state changes. Nothing loops.

## Original asset plan and prompt sheet

One original hero/empty-state illustration depicts a top-down abstract week table: seven irregular paper placemats, simple ceramic plate geometry, small linked leftover bowls, and energy markers. It clarifies the product’s mental model without implying recipe generation.

Art direction prompt:

> Use case: stylized-concept. Asset type: responsive product hero and first-run empty state. Primary request: a top-down generative geometric illustration of a household's seven-day dinner rhythm. Scene: seven irregular paper placemats arranged like a loose weekly orbit around simple ceramic plate circles, with two small linked bowls suggesting leftovers and tiny one/two/three-dot energy markers. Style: tactile cut-paper editorial collage with subtle screenprint grain, crisp purposeful geometry, no photoreal food. Composition: wide landscape, visual weight centered and to the right, calm negative space, no interface screenshot. Lighting: soft kitchen-window light with shallow paper shadows. Palette: warm recipe paper, blue-black ink, tomato red, corn yellow, leaf green. Materials: uncoated paper, matte ceramic, graphite ticks. Constraints: no people, no hands, no brands, no letters, no numbers, no text, no watermark, no logos, no gradient background, no uncanny objects.

Generation provenance: generated 2026-08-28 using the Param Factory Azure image generation deployment via `/opt/fleet/lib/gen-image.sh`. Original project asset; reviewed for text artifacts, brands, unintended symbols, and seams. Source PNG and prompt sidecar live in `assets/src/`; optimized WebP ships in `public/assets/`. Generated imagery is disclosed in the footer.

## Motion and loading policy

The app shell renders before IndexedDB data loads and shows a labelled skeleton state. UI motion lasts 150–220 ms and only communicates placement or feedback. Under `prefers-reduced-motion: reduce`, durations become 1 ms and transform animations are disabled. The hero is eager/high-priority only in the first-run state; all other imagery is lazy. Offline state is a persistent, calm status chip rather than an alarm.
