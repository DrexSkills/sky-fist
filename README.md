# Sky Fist: Lina's Rescue

A 2D pixel-art adventure fighting game that runs in the browser on desktop and mobile.

**Play it:** https://drexskills.github.io/sky-fist/

## Story
King Gorrak smashes Kai's village and kidnaps his wife, Lina. Kai climbs 7 floating islands, beats 7 champions, and saves her.

## Features
- Opening cutscene, short champion dialogues, and an ending scene
- 7 islands: Grass, Wind, Fire, Water, Earth, Shadow, Sky Castle
- 7 champion boss fights, including rival Ren and King Gorrak (3 phases)
- 3-hit combo, flying kick, double jump, dash, energy blast, and the Sky Fist super
- Mobile joystick and buttons, keyboard controls
- Settings: music, sound effects, vibration, screen shake, touch controls, difficulty
- Chiptune music, checkpoints, collectibles, ranks, auto-save

## Controls
| Action | Keyboard | Phone |
|---|---|---|
| Move | A / D or arrows | Joystick |
| Jump (twice to double jump) | Space / W / Up | JUMP |
| Punch combo | J or X | PUNCH |
| Energy blast / Sky Fist | K or C | BLAST |
| Dash | L or Shift | DASH |
| Pause | Esc or P | Pause button |

## Project layout
- `index.html` – the complete game in one file (ready to play)
- `src/` – source split into parts; run `cd src && python3 build.py` to rebuild `index.html`
