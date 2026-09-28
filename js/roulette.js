// Retro 2D Pixel & Canvas European Roulette Engine

const ROULETTE_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

class RouletteGame {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.minBet = options.minBet || 10;
        this.selectedChip = 10;
        this.bets = {}; // e.g. { 'red': 20, '17': 50, 'odd': 10 }
        this.lastBets = {};
        this.isSpinning = false;
        this.wheelAngle = 0;
        this.ballAngle = 0;
        this.history = [32, 15, 0, 7, 26];
        this.dealerMessage = 'Делайте ваши ставки на игровом поле!';
        this.canvas = null;
        this.ctx = null;
        this.animFrame = null;
        this.init();
    }

    init() {
        this.render();
        this.initCanvas();
        this.drawWheel(0, 0);
    }

    destroy() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
    }

    getNumberColor(num) {
        if (num === 0) return 'green';
        return RED_NUMBERS.includes(num) ? 'red' : 'black';
    }

    getTotalBet() {
        return Object.values(this.bets).reduce((a, b) => a + b, 0);
    }

    placeBet(spot) {
        if (this.isSpinning) return;
        const user = StorageManager.getUser();
        if (!user) return;

        const currentTotal = this.getTotalBet();
        if (user.chips < (currentTotal + this.selectedChip)) {
            this.setDealerMsg('Недостаточно фишек для ставки!');
            return;
        }

        this.bets[spot] = (this.bets[spot] || 0) + this.selectedChip;
        window.soundCtrl?.playChip();
        this.updateBetsDisplay();
        this.setDealerMsg(`Ставка на [${this.formatSpotName(spot)}]: ${this.bets[spot]} 🪙`);
    }

    clearBets() {
        if (this.isSpinning) return;
        this.bets = {};
        window.soundCtrl?.playClick();
        this.updateBetsDisplay();
        this.setDealerMsg('Все ставки убраны с поля.');
    }

    repeatBets() {
        if (this.isSpinning) return;
        if (!Object.keys(this.lastBets).length) {
            this.setDealerMsg('Нет предыдущих ставок для повтора.');
            return;
        }

        const user = StorageManager.getUser();
        const needed = Object.values(this.lastBets).reduce((a, b) => a + b, 0);
        if (!user || user.chips < needed) {
            this.setDealerMsg('Не хватает фишек для повтора ставки!');
            return;
        }

        this.bets = { ...this.lastBets };
        window.soundCtrl?.playChip();
        this.updateBetsDisplay();
        this.setDealerMsg('Предыдущие ставки повторены!');
    }

    formatSpotName(spot) {
        const map = {
            'red': 'Красное',
            'black': 'Черное',
            'even': 'Четное',
            'odd': 'Нечетное',
            'low': '1 - 18',
            'high': '19 - 36',
            '1st12': '1-я дюжина',
            '2nd12': '2-я дюжина',
            '3rd12': '3-я дюжина',
            'col1': '1-я колонка',
            'col2': '2-я колонка',
            'col3': '3-я колонка'
        };
        return map[spot] || `Число ${spot}`;
    }

    setDealerMsg(msg) {
        this.dealerMessage = msg;
        const msgEl = this.container.querySelector('.dealer-bubble');
        if (msgEl) {
            msgEl.textContent = msg;
            msgEl.classList.remove('pop');
            void msgEl.offsetWidth;
            msgEl.classList.add('pop');
        }
    }

    initCanvas() {
        this.canvas = this.container.querySelector('#rouletteWheelCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    drawWheel(wheelAngle, ballAngle) {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const outerR = cx - 8;
        const innerR = outerR * 0.62;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Outer rim / Brass casing (PSP Retro Arcade styling)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, outerR + 6, 0, Math.PI * 2);
        ctx.fillStyle = '#b45309';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.restore();

        // 2. Wheel Pockets (37 numbers)
        const totalPockets = ROULETTE_NUMBERS.length;
        const anglePerPocket = (Math.PI * 2) / totalPockets;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(wheelAngle);

        for (let i = 0; i < totalPockets; i++) {
            const num = ROULETTE_NUMBERS[i];
            const startA = i * anglePerPocket;
            const endA = startA + anglePerPocket;
            const color = this.getNumberColor(num);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, outerR, startA, endA);
            ctx.closePath();

            ctx.fillStyle = color === 'green' ? '#15803d' : (color === 'red' ? '#dc2626' : '#18181b');
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#e2e8f0';
            ctx.stroke();

            // Pocket text
            ctx.save();
            const textAngle = startA + anglePerPocket / 2;
            ctx.rotate(textAngle);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px "Press Start 2P", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(num.toString(), outerR - 4, 3);
            ctx.restore();
        }

        // Inner Turret / Spindle
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // Brass handles / cross
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        for (let a = 0; a < 4; a++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a * Math.PI / 2) * (innerR * 0.75), Math.sin(a * Math.PI / 2) * (innerR * 0.75));
            ctx.stroke();
        }

        // Center cone
        ctx.beginPath();
        ctx.arc(0, 0, innerR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#d97706';
        ctx.fill();

        ctx.restore();

        // 3. Ball
        if (ballAngle !== null) {
            const ballDist = outerR * 0.82;
            const bx = cx + Math.cos(ballAngle) * ballDist;
            const by = cy + Math.sin(ballAngle) * ballDist;

            ctx.save();
            ctx.beginPath();
            ctx.arc(bx, by, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#cbd5e1';
            ctx.stroke();
            ctx.restore();
        }
    }

    spin() {
        if (this.isSpinning) return;
        const totalBet = this.getTotalBet();
        if (totalBet < this.minBet) {
            this.setDealerMsg(`Минимальная ставка за столом: ${this.minBet} 🪙!`);
            return;
        }

        const user = StorageManager.getUser();
        if (!user || user.chips < totalBet) {
            this.setDealerMsg('Недостаточно фишек на балансе!');
            return;
        }

        // Deduct bets
        StorageManager.updateChips(-totalBet);
        this.lastBets = { ...this.bets };
        if (window.app) window.app.updateHeaderUser();

        this.isSpinning = true;
        this.setDealerMsg('Колесо запущено! Ставки сделаны, ставок больше нет!');
        const spinBtn = this.container.querySelector('#btnRouletteSpin');
        if (spinBtn) spinBtn.disabled = true;

        // Choose winning number
        const winningIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
        const winningNumber = ROULETTE_NUMBERS[winningIndex];

        let speed = 0.28;
        let ballSpeed = -0.38;
        let lastTickTime = 0;

        const startTime = Date.now();
        const duration = 4500; // 4.5 seconds realistic spin

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                // Deceleration curve
                const easeOut = 1 - Math.pow(progress, 2.5);
                this.wheelAngle += speed * easeOut;
                this.ballAngle += ballSpeed * easeOut;

                // Ticking sound
                if (Date.now() - lastTickTime > Math.max(70, 70 + progress * 250)) {
                    window.soundCtrl?.playWheelTick();
                    lastTickTime = Date.now();
                }

                this.drawWheel(this.wheelAngle, this.ballAngle);
                this.animFrame = requestAnimationFrame(animate);
            } else {
                // Finalize on winning pocket
                window.soundCtrl?.playBallDrop();
                this.isSpinning = false;
                if (spinBtn) spinBtn.disabled = false;

                // Add to history
                this.history.unshift(winningNumber);
                if (this.history.length > 8) this.history.pop();

                this.resolveOutcome(winningNumber);
            }
        };

        this.animFrame = requestAnimationFrame(animate);
    }

    resolveOutcome(winNum) {
        const winColor = this.getNumberColor(winNum);
        let totalWon = 0;

        // Calculate payouts
        for (let [spot, amount] of Object.entries(this.bets)) {
            let won = false;
            let multiplier = 0;

            if (spot === 'red' && winColor === 'red') {
                won = true;
                multiplier = 2;
            } else if (spot === 'black' && winColor === 'black') {
                won = true;
                multiplier = 2;
            } else if (spot === 'even' && winNum > 0 && winNum % 2 === 0) {
                won = true;
                multiplier = 2;
            } else if (spot === 'odd' && winNum % 2 === 1) {
                won = true;
                multiplier = 2;
            } else if (spot === 'low' && winNum >= 1 && winNum <= 18) {
                won = true;
                multiplier = 2;
            } else if (spot === 'high' && winNum >= 19 && winNum <= 36) {
                won = true;
                multiplier = 2;
            } else if (spot === '1st12' && winNum >= 1 && winNum <= 12) {
                won = true;
                multiplier = 3;
            } else if (spot === '2nd12' && winNum >= 13 && winNum <= 24) {
                won = true;
                multiplier = 3;
            } else if (spot === '3rd12' && winNum >= 25 && winNum <= 36) {
                won = true;
                multiplier = 3;
            } else if (spot === 'col1' && winNum > 0 && winNum % 3 === 1) {
                won = true;
                multiplier = 3;
            } else if (spot === 'col2' && winNum > 0 && winNum % 3 === 2) {
                won = true;
                multiplier = 3;
            } else if (spot === 'col3' && winNum > 0 && winNum % 3 === 0) {
                won = true;
                multiplier = 3;
            } else if (parseInt(spot, 10) === winNum) {
                // Straight up single number: 35 to 1 payout + returned bet (36x)
                won = true;
                multiplier = 36;
            }

            if (won) {
                totalWon += amount * multiplier;
            }
        }

        const user = StorageManager.getUser();
        if (user) {
            user.stats.gamesPlayed = (user.stats.gamesPlayed || 0) + 1;
            if (totalWon > 0) {
                user.stats.wins = (user.stats.wins || 0) + 1;
                user.stats.rouletteWins = (user.stats.rouletteWins || 0) + 1;
                StorageManager.updateChips(totalWon);
                window.soundCtrl?.playWin();
                this.setDealerMsg(`🎉 Выпало [${winNum} ${winColor.toUpperCase()}]! ВЫИГРЫШ: +${totalWon} 🪙!`);
            } else {
                window.soundCtrl?.playLose();
                this.setDealerMsg(`Выпало [${winNum} ${winColor.toUpperCase()}]. К сожалению, мимо. Попробуйте еще!`);
            }
            StorageManager.saveUser(user);
        }

        if (window.app) window.app.updateHeaderUser();
        this.renderHistory();
        this.updateBetsDisplay();
    }

    renderHistory() {
        const historyEl = this.container.querySelector('#rouletteHistory');
        if (!historyEl) return;
        historyEl.innerHTML = this.history.map(num => {
            const col = this.getNumberColor(num);
            return `<span class="history-pill pill-${col}">${num}</span>`;
        }).join('');
    }

    updateBetsDisplay() {
        // Update chip markers on grid
        this.container.querySelectorAll('.grid-cell, .side-bet').forEach(cell => {
            const spot = cell.getAttribute('data-spot');
            const betBadge = cell.querySelector('.cell-bet-badge');
            const val = this.bets[spot] || 0;
            if (val > 0) {
                if (betBadge) {
                    betBadge.textContent = val;
                } else {
                    const badge = document.createElement('span');
                    badge.className = 'cell-bet-badge';
                    badge.textContent = val;
                    cell.appendChild(badge);
                }
            } else if (betBadge) {
                betBadge.remove();
            }
        });

        // Update total pot label
        const potEl = this.container.querySelector('#rouletteCurrentPot');
        if (potEl) potEl.textContent = `${this.getTotalBet()} 🪙`;
    }

    render() {
        const user = StorageManager.getUser() || { chips: 0, equipped: {} };
        const chipValues = [10, 25, 50, 100, 250];

        // 3x12 roulette numbers layout
        // Rows: Row 3 (3,6,9...36), Row 2 (2,5,8...35), Row 1 (1,4,7...34)
        let numbersRowsHTML = '';
        for (let r = 3; r >= 1; r--) {
            numbersRowsHTML += `<div class="board-row">`;
            for (let c = 0; c < 12; c++) {
                const num = c * 3 + r;
                const col = this.getNumberColor(num);
                numbersRowsHTML += `
                    <div class="grid-cell cell-${col}" data-spot="${num}">
                        <span class="num-text">${num}</span>
                    </div>
                `;
            }
            // 2:1 column bet
            const colSpot = `col${r}`;
            numbersRowsHTML += `
                <div class="grid-cell cell-col-bet side-bet" data-spot="${colSpot}">
                    <span class="num-text">2:1</span>
                </div>
            `;
            numbersRowsHTML += `</div>`;
        }

        this.container.innerHTML = `
        <div class="table-felt roulette-felt">
            <!-- Dealer & Wheel Banner Section -->
            <div class="roulette-top-bar">
                <div class="dealer-avatar-box">
                    <div class="dealer-badge">ДИЛЕР РУЛЕТКИ</div>
                    <div class="dealer-avatar">
                        ${AvatarRenderer.renderSVG({ gender: 'female', skin: 'fair', hair: 'red', hairStyle: 'ponytail', hat: 'crown', costume: 'default' }, 54)}
                    </div>
                </div>
                <div class="dealer-bubble-container">
                    <div class="dealer-bubble pop">${this.dealerMessage}</div>
                </div>
            </div>

            <!-- Wheel & Recent Numbers -->
            <div class="roulette-visual-stage">
                <div class="canvas-wheel-box">
                    <canvas id="rouletteWheelCanvas" width="230" height="230"></canvas>
                </div>
                <div class="roulette-history-tray">
                    <div class="tray-title">ИСТОРИЯ ЧИСЕЛ:</div>
                    <div class="history-pills-row" id="rouletteHistory">
                        ${this.history.map(n => `<span class="history-pill pill-${this.getNumberColor(n)}">${n}</span>`).join('')}
                    </div>
                    <div class="roulette-pot-info">
                        Общая ставка: <span class="pot-num" id="rouletteCurrentPot">0 🪙</span>
                    </div>
                </div>
            </div>

            <!-- Retro Casino Betting Grid -->
            <div class="roulette-grid-wrapper">
                <div class="grid-zero-col">
                    <div class="grid-cell cell-green cell-zero" data-spot="0">
                        <span class="num-text">0</span>
                    </div>
                </div>

                <div class="grid-main-board">
                    <div class="grid-numbers-matrix">
                        ${numbersRowsHTML}
                    </div>

                    <!-- Dozens Bets -->
                    <div class="grid-dozens-row">
                        <div class="grid-cell cell-dozen side-bet" data-spot="1st12">1-я 12 (1-12)</div>
                        <div class="grid-cell cell-dozen side-bet" data-spot="2nd12">2-я 12 (13-24)</div>
                        <div class="grid-cell cell-dozen side-bet" data-spot="3rd12">3-я 12 (25-36)</div>
                    </div>

                    <!-- Outside Bets -->
                    <div class="grid-outside-row">
                        <div class="grid-cell cell-outside side-bet" data-spot="low">1 - 18</div>
                        <div class="grid-cell cell-outside side-bet" data-spot="even">ЧЁТ</div>
                        <div class="grid-cell cell-outside cell-red-box side-bet" data-spot="red">КРАСНОЕ</div>
                        <div class="grid-cell cell-outside cell-black-box side-bet" data-spot="black">ЧЁРНОЕ</div>
                        <div class="grid-cell cell-outside side-bet" data-spot="odd">НЕЧЁТ</div>
                        <div class="grid-cell cell-outside side-bet" data-spot="high">19 - 36</div>
                    </div>
                </div>
            </div>

            <!-- Chips Selector & Action Tray -->
            <div class="table-controls">
                <div class="chips-selector">
                    ${chipValues.map(val => `
                        <button class="casino-chip chip-${val} ${this.selectedChip === val ? 'chip-active' : ''} ${user.equipped?.chipSkin === 'gold_chips' ? 'vip-gold-chip' : ''}" data-val="${val}">
                            <span class="chip-val">${val}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="action-buttons-row">
                    <button class="btn-pixel btn-danger" id="btnRouletteClear">СБРОС</button>
                    <button class="btn-pixel btn-secondary" id="btnRouletteRepeat">ПОВТОР</button>
                    <button class="btn-pixel btn-success btn-glow" id="btnRouletteSpin">🎲 КРУТИТЬ</button>
                </div>
            </div>
        </div>
        `;

        this.bindEvents();
        this.initCanvas();
        this.drawWheel(0, 0);
    }

    bindEvents() {
        // Chip selector buttons
        this.container.querySelectorAll('.casino-chip').forEach(btn => {
            btn.onclick = () => {
                this.selectedChip = parseInt(btn.getAttribute('data-val'), 10);
                this.container.querySelectorAll('.casino-chip').forEach(b => b.classList.remove('chip-active'));
                btn.classList.add('chip-active');
                window.soundCtrl?.playClick();
            };
        });

        // Grid cells betting
        this.container.querySelectorAll('.grid-cell').forEach(cell => {
            cell.onclick = () => {
                const spot = cell.getAttribute('data-spot');
                if (spot) this.placeBet(spot);
            };
        });

        // Controls
        const btnClear = this.container.querySelector('#btnRouletteClear');
        if (btnClear) btnClear.onclick = () => this.clearBets();

        const btnRepeat = this.container.querySelector('#btnRouletteRepeat');
        if (btnRepeat) btnRepeat.onclick = () => this.repeatBets();

        const btnSpin = this.container.querySelector('#btnRouletteSpin');
        if (btnSpin) btnSpin.onclick = () => this.spin();
    }
}

window.RouletteGame = RouletteGame;
