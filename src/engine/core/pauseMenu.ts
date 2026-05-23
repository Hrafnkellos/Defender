import { eatKey } from '../input/keys';
import { main }   from './main';

const KEY_UP    = 38;
const KEY_DOWN  = 40;
const KEY_ENTER = 13;
const KEY_SPACE = 32;
const KEY_ESC   = 27;
const KEY_STEP  = 'O'.charCodeAt(0);

type MenuAction = 'resume' | 'replay' | 'controls' | 'music' | 'sfx' | 'fullscreen' | 'quit';

interface MenuItem { label(): string; action: MenuAction; }

const ITEMS: MenuItem[] = [
    { label: () => 'Resume',                                         action: 'resume'     },
    { label: () => 'Replay',                                         action: 'replay'     },
    { label: () => 'Controls',                                       action: 'controls'   },
    { label: () => `Music:    ${main.musicEnabled ? 'ON ' : 'OFF'}`, action: 'music'      },
    { label: () => `Sound FX: ${main.sfxEnabled   ? 'ON ' : 'OFF'}`, action: 'sfx'        },
    { label: () => 'Fullscreen',                                     action: 'fullscreen' },
    { label: () => 'Quit',                                           action: 'quit'       },
];

export const pauseMenu = {
    selectedIndex:   0,
    showingControls: false,

    // Returns true if a step-frame was requested (O key)
    handleInput(): boolean {
        if (this.showingControls) {
            if (eatKey(KEY_ENTER) || eatKey(KEY_SPACE)) {
                this.showingControls = false;
            }
            // Escape goes back only when not in fullscreen (browser owns Escape in fullscreen)
            if (!document.fullscreenElement && eatKey(KEY_ESC)) {
                this.showingControls = false;
            }
            return false;
        }

        // Escape resumes only when not in fullscreen — in fullscreen the browser uses
        // Escape to exit fullscreen, so we let that happen and keep the menu open.
        if (!document.fullscreenElement && eatKey(KEY_ESC)) { main.paused = false; return false; }
        if (document.fullscreenElement) eatKey(KEY_ESC); // consume so it doesn't leak

        if (eatKey(KEY_UP))   this.selectedIndex = (this.selectedIndex - 1 + ITEMS.length) % ITEMS.length;
        if (eatKey(KEY_DOWN)) this.selectedIndex = (this.selectedIndex + 1) % ITEMS.length;

        if (eatKey(KEY_ENTER) || eatKey(KEY_SPACE)) {
            this._activate(ITEMS[this.selectedIndex].action);
        }

        return eatKey(KEY_STEP);
    },

    _activate(action: MenuAction): void {
        switch (action) {
            case 'resume':
                main.paused = false;
                break;
            case 'replay':
                main.paused = false;
                main._game?.reset?.();
                break;
            case 'controls':
                this.showingControls = true;
                break;
            case 'music':
                main.musicEnabled = !main.musicEnabled;
                main._game?.onMusicToggle?.(main.musicEnabled);
                break;
            case 'sfx':
                main.sfxEnabled = !main.sfxEnabled;
                main._game?.onSfxToggle?.(main.sfxEnabled);
                break;
            case 'fullscreen':
                main.toggleFullscreen();
                break;
            case 'quit':
                main.gameOver();
                break;
        }
    },

    render(ctx: CanvasRenderingContext2D): void {
        const cx = ctx.canvas.width  / 2;
        const cy = ctx.canvas.height / 2;

        ctx.save();

        if (this.showingControls) {
            this._renderControls(ctx, cx, cy);
            ctx.restore();
            return;
        }

        // dim the game behind the menu
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const boxW = 300, boxH = 60 + ITEMS.length * 36 + 20;
        const boxX = cx - boxW / 2, boxY = cy - boxH / 2;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = '26px Georgia';
        ctx.fillStyle    = '#ffffff';
        ctx.fillText('PAUSED', cx, boxY + 30);

        // separator line
        ctx.strokeStyle = '#444';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 20, boxY + 50);
        ctx.lineTo(boxX + boxW - 20, boxY + 50);
        ctx.stroke();

        ctx.font = '17px Georgia';
        const startY = boxY + 68;

        ITEMS.forEach((item, i) => {
            const y = startY + i * 36;
            if (i === this.selectedIndex) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(boxX + 8, y - 14, boxW - 16, 28);
                ctx.fillStyle = '#000000';
            } else {
                ctx.fillStyle = '#cccccc';
            }
            ctx.fillText(item.label(), cx, y);
        });

        ctx.restore();
    },

    _renderControls(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
        const controls = main._game?.getControls?.() ?? [
            'Arrow Up / W     Move Up',
            'Arrow Down / S   Move Down',
            'Arrow Left / A   Move Left',
            'Arrow Right / D  Move Right',
            'Space            Fire',
        ];

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const lineH  = 26;
        const boxW   = 380;
        const boxH   = 60 + controls.length * lineH + 50;
        const boxX   = cx - boxW / 2;
        const boxY   = cy - boxH / 2;

        ctx.fillStyle   = '#0a0a0a';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.font         = '22px Georgia';
        ctx.fillStyle    = '#ffffff';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CONTROLS', cx, boxY + 28);

        ctx.strokeStyle = '#444';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(boxX + 20, boxY + 48);
        ctx.lineTo(boxX + boxW - 20, boxY + 48);
        ctx.stroke();

        ctx.font      = '15px "Courier New", monospace';
        ctx.fillStyle = '#cccccc';
        ctx.textAlign = 'left';
        controls.forEach((line, i) => {
            ctx.fillText(line, boxX + 24, boxY + 62 + i * lineH);
        });

        ctx.font      = '13px Georgia';
        ctx.fillStyle = '#777777';
        ctx.textAlign = 'center';
        const backHint = document.fullscreenElement ? 'ENTER to go back' : 'ESCAPE or ENTER to go back';
        ctx.fillText(backHint, cx, boxY + boxH - 18);
    },
};
