# 3D Maze
A first-person maze game built **without any game engine or library** - only HTML, CSS 3D transforms and vanilla JavaScript.
Made during the 3D Game BIP course at Liepāja University (Latvia), 2026.

![gameplay](https://i.imgur.com/x7oyscA.gif)

**▶ Play it here:** [https://ichhito.github.io/3dgame-liepaja-erasmus-2026/](https://majestic-quokka-175c33.netlify.app/)

## Gameplay

Collect all the keys to unlock the exit door before time runs out. Coins give extra points.
Three levels with increasing difficulty.

| Key | Action |
| --- | --- |
| WASD / Arrows | Move |
| Mouse | Look around |
| Z (hold) | Run |
| R | Return to start |
| Esc | Pause |

## Technical highlights

- **First-person camera with CSS 3D transforms:** the world is moved and rotated around the player instead of moving a camera.
- **AABB collision detection** with per-axis resolution, so the player slides along walls instead of getting stuck.
- **Data-driven levels:** each level is defined as a list of wall boxes, exit position, item counts and time limit.
- **Random item placement** using rejection sampling (items avoid walls, the spawn point, the exit and each other).
- **Game state flow:** main menu → playing ⇄ paused → win / lose, with pointer lock handling.

## Run locally

Clone the repository and open 'index.html' in a browser

## Credits
- Liepāja University and my teacher for helping me developing this game
