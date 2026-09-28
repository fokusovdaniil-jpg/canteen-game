// ========================================================
// REALISTIC HIGH-DEFINITION CASINO ACOUSTICS ENGINE
// Authentic acoustic physical modeling: Clay chips, Card slides,
// Roulette wheel friction & ball bounces, Luxury orchestral chimes.
// ========================================================

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('lit_sound_muted') === 'true';
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
        localStorage.setItem('lit_sound_muted', this.muted);
        return this.muted;
    }

    // Soft modern haptic tactile click (like iOS / Telegram)
    playClick() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    }

    // Authentic Clay/Ceramic Poker Chip Clink (multiple micro-transients)
    playChip() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;

        const playSingleChipContact = (timeOffset, pitchMod = 1) => {
            const t = this.ctx.currentTime + timeOffset;

            // 1. Sharp Ceramic Transient (high resonance)
            const oscHigh = this.ctx.createOscillator();
            const gainHigh = this.ctx.createGain();
            oscHigh.type = 'sine';
            oscHigh.frequency.setValueAtTime((3200 + Math.random() * 400) * pitchMod, t);
            oscHigh.frequency.exponentialRampToValueAtTime(1800 * pitchMod, t + 0.035);

            gainHigh.gain.setValueAtTime(0.22, t);
            gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
            oscHigh.connect(gainHigh);
            gainHigh.connect(this.ctx.destination);
            oscHigh.start(t);
            oscHigh.stop(t + 0.035);

            // 2. Heavy Clay Body Resonance (low thud)
            const oscBody = this.ctx.createOscillator();
            const gainBody = this.ctx.createGain();
            oscBody.type = 'triangle';
            oscBody.frequency.setValueAtTime(650 * pitchMod, t);
            oscBody.frequency.exponentialRampToValueAtTime(220, t + 0.05);

            gainBody.gain.setValueAtTime(0.18, t);
            gainBody.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            oscBody.connect(gainBody);
            gainBody.connect(this.ctx.destination);
            oscBody.start(t);
            oscBody.stop(t + 0.05);
        };

        // Two chips colliding
        playSingleChipContact(0, 1.0);
        playSingleChipContact(0.022, 1.08);
    }

    // Realistic Playing Card Slide & Snap across green baize/felt
    playCardDeal() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter for cloth/paper friction
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
            filter.Q.value = 2.5;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();

            // Card crisp snap transient
            const snap = this.ctx.createOscillator();
            const snapGain = this.ctx.createGain();
            snap.type = 'triangle';
            snap.frequency.setValueAtTime(450, this.ctx.currentTime + 0.015);
            snap.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.04);
            snapGain.gain.setValueAtTime(0.15, this.ctx.currentTime + 0.015);
            snapGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
            snap.connect(snapGain);
            snapGain.connect(this.ctx.destination);
            snap.start(this.ctx.currentTime + 0.015);
            snap.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    }

    // Realistic Roulette Wheel Ball Rolling / Track Click
    playWheelTick() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            // High ivory ball clicking against bronze frets
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const f = 1900 + Math.random() * 300;
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.02);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.02);
        } catch (e) {}
    }

    // Realistic Ball Landing / Dropping into wooden pocket
    playBallDrop() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const t = this.ctx.currentTime;
            [0, 0.06, 0.11, 0.15].forEach((offset, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                const baseF = 1400 - idx * 180;
                osc.frequency.setValueAtTime(baseF, t + offset);
                osc.frequency.exponentialRampToValueAtTime(400, t + offset + 0.04);

                const vol = 0.22 / (idx + 1);
                gain.gain.setValueAtTime(vol, t + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + offset);
                osc.stop(t + offset + 0.04);
            });
        } catch (e) {}
    }

    // Luxury Casino Harmonious Win Chime (Warm celesta/crystal harp chord)
    playWin() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        // Major 9th chord in warm luxury sine harmonics: C5, E5, G5, B5, D6
        const chordNotes = [523.25, 659.25, 783.99, 987.77, 1174.66];
        chordNotes.forEach((freq, idx) => {
            const startT = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startT);

            gain.gain.setValueAtTime(0.14, startT);
            gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.8);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startT);
            osc.stop(startT + 0.85);
        });
    }

    // Grand VIP Blackjack / Jackpot Fanfare
    playBlackjack() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        // Golden fanfare progression: F5, A5, C6, F6 (luxurious warm tones)
        const notes = [698.46, 880.00, 1046.50, 1396.91];
        notes.forEach((freq, idx) => {
            const startT = this.ctx.currentTime + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startT);

            gain.gain.setValueAtTime(0.18, startT);
            gain.gain.exponentialRampToValueAtTime(0.0001, startT + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startT);
            osc.stop(startT + 1.25);
        });
    }

    // Soft Casino Lose Thud (subtle, non-annoying realistic felt tap)
    playLose() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
    }

    // Cashier Register / Luxury Chips Purchase
    playBuy() {
        if (this.muted) return;
        this.initCtx();
        if (!this.ctx) return;
        const notes = [880, 1174.66, 1760];
        notes.forEach((freq, idx) => {
            const startT = this.ctx.currentTime + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startT);
            gain.gain.setValueAtTime(0.12, startT);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startT);
            osc.stop(startT + 0.45);
        });
    }
}

window.soundCtrl = new SoundController();
