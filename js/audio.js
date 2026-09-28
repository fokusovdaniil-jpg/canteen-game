// Retro 8-bit & 16-bit Web Audio Sound Synthesizer
class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('retro_sound_muted') === 'true';
    }

    initCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('retro_sound_muted', this.muted);
        return this.muted;
    }

    playTone(freq, type = 'square', duration = 0.1, gainVal = 0.15) {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio error', e);
        }
    }

    playClick() {
        if (this.muted) return;
        this.playTone(800, 'triangle', 0.05, 0.1);
    }

    playChip() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playCardDeal() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            // White noise burst for card swoosh
            const bufferSize = this.ctx.sampleRate * 0.08;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 2;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
        } catch (e) {}
    }

    playWheelTick() {
        if (this.muted) return;
        this.playTone(450, 'triangle', 0.03, 0.08);
    }

    playBallDrop() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(950, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        } catch (e) {}
    }

    playWin() {
        if (this.muted) return;
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'square', 0.15, 0.12);
            }, idx * 90);
        });
    }

    playBlackjack() {
        if (this.muted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', 0.2, 0.18);
            }, idx * 80);
        });
    }

    playLose() {
        if (this.muted) return;
        const notes = [300, 260, 220, 180];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'sawtooth', 0.14, 0.08);
            }, idx * 100);
        });
    }

    playBuy() {
        if (this.muted) return;
        const notes = [600, 900, 1200];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playTone(freq, 'square', 0.1, 0.12);
            }, idx * 70);
        });
    }
}

window.soundCtrl = new SoundController();
