# DEFENDER!

A browser-based clone of the classic 1981 Williams Electronics arcade game, written in TypeScript with a custom 2D game engine and Vite as the build tool.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check without building |

## Controls

Press **Escape** at any time to open the pause menu (Resume, Replay, Controls, Music, Sound FX, Quit). The game canvas always fills the browser window — press **F11** for true fullscreen.

| Key | Action |
|---|---|
| Arrow Up / W | Move up |
| Arrow Down / S | Move down |
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Space | Fire |
| Ctrl / Tab | Smart bomb |
| Shift / E | Hyperspace (warp) |
| M | Toggle music |
| Escape | Pause menu |
| F11 | True fullscreen (browser) |

## Project structure

```
src/
  engine/               # Reusable game engine (no Defender-specific logic)
    core/
      main.ts           # Game loop, pause menu integration, fullscreen
      update.ts         # Fixed-timestep update driver
      render.ts         # Render pipeline
      pauseMenu.ts      # Pause overlay (Resume, Replay, Controls, Music, SFX, Fullscreen, Quit)
    entities/
      Entity.ts         # Base entity class
      IEntity.ts        # Entity interface
    input/
      keys.ts           # Keyboard state tracker
      mouse.ts          # Mouse event listener
    managers/
      entityManager.ts  # Entity lifecycle (add, update, render, remove)
      mapManager.ts     # Scrolling world map and minimap
      soundManager.ts   # Web Audio API wrapper with SFX/music toggles
      spatialManager.ts # Spatial grid for collision broadphase
    rendering/
      Sprite.ts         # Sprite sheet renderer
      Vector.ts         # 2D vector math
    utils/
      BufferLoader.ts   # Async audio buffer loader
      config.ts         # Canvas setup and timing constants
      imagesPreload.ts  # Image preloader
      util.ts           # Canvas helpers, math, AI utilities

  games/
    defender/           # Defender game built on top of the engine
      main.ts           # Entry point — wires engine to game, handles preloading
      sound.ts          # Sound singleton
      sprites.ts        # Sprite registry
      managers/
        entityManager.ts  # Defender-specific entity factory and collections
        gameManager.ts    # Score, lives, levels, game over
      entities/
        player/Ship.ts
        enemies/Baiter.ts, Lander.ts, Mothership.ts, Swarmer.ts
        projectiles/Bullet.ts, Laser.ts, AlienBullet.ts
        fx/Human.ts, Particle.ts
```

## Architecture notes

The engine and game are kept strictly separate. The engine's `IGame` interface is the only contract between them:

```ts
interface IGame {
    updateSimulation(du: number): void;
    renderSimulation(ctx: CanvasRenderingContext2D): void;
    gatherInputs?(): void;
    reset?(): void;
    getControls?(): string[];
    onMusicToggle?(enabled: boolean): void;
    onSfxToggle?(enabled: boolean): void;
}
```

Time is measured in *nominals* — one nominal equals one frame at 60 fps (16.666 ms). All velocities and durations in the game are expressed in nominals, making the physics frame-rate independent.
