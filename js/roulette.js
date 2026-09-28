// Modern Lit Energy European Roulette Engine with Vector Canvas & Admin God Mode

const ROULETTE_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

class RouletteGame {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.minBet = options.minBet || 25;
        this.selectedChip = 25;
        this.bets = {};
        this.lastBets = {};
        this.isSpinning = false;
        this.wheelAngle = 0;
        this.ballAngle = 0;
        this.history = [32, 15, 0, 7, 26];
        this.dealerMessage = 'Делайте ваши ставки на поле!';
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
            this.setDealerMsg('Недостаточно фишек для этой ставки!');
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
        this.setDealerMsg('Ставки повторены!');
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
        const outerR = cx - 10;
        const innerR = outerR * 0.65;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Premium Outer Metallic Gold & Carbon Ring
        const ringGrad = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        ringGrad.addColorStop(0, '#f59e0b');
        ringGrad.addColorStop(0.5, '#78350f');
        ringGrad.addColorStop(1, '#ffaa00');

        ctx.beginPath();
        ctx.arc(cx, cy, outerR + 8, 0, Math.PI * 2);
        ctx.fillStyle = '#090a0f';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = ringGrad;
        ctx.stroke();

        // 2. Wheel Pockets
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

            ctx.fillStyle = color === 'green' ? '#059669' : (color === 'red' ? '#e11d48' : '#0f172a');
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.stroke();

            // Pocket text
            ctx.save();
            const textAngle = startA + anglePerPocket / 2;
            ctx.rotate(textAngle);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px "Inter", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(num.toString(), outerR - 4, 3.5);
            ctx.restore();
        }

        // Inner Turret
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // Cross Handles
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.5;
        for (let a = 0; a < 4; a++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a * Math.PI / 2) * (innerR * 0.8), Math.sin(a * Math.PI / 2) * (innerR * 0.8));
            ctx.stroke();
        }

        // Lit Energy Center Flame Cone
        ctx.beginPath();
        ctx.arc(0, 0, innerR * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#ff5500';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        ctx.restore();

        // 3. Polished Ivory Ball with Electric Glow
        if (ballAngle !== null) {
            const ballDist = outerR * 0.82;
            const bx = cx + Math.cos(ballAngle) * ballDist;
            const by = cy + Math.sin(ballAngle) * ballDist;

            ctx.save();
            ctx.beginPath();
            ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#e2e8f0';
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

        StorageManager.updateChips(-totalBet);
        this.lastBets = { ...this.bets };
        if (window.app) window.app.updateHeaderUser();

        this.isSpinning = true;
        this.setDealerMsg('Колесо запущено! Ставки сделаны!');
        const spinBtn = this.container.querySelector('#btnRouletteSpin');
        if (spinBtn) spinBtn.disabled = true;

        // Determine Winning Number
        const luckMode = window.adminPanel ? window.adminPanel.getLuckMode() : 'fair';
        let winningNumber = null;

        if (luckMode === 'god') {
            // Pick a number that guarantees a win based on user bets
            const activeSpots = Object.keys(this.bets);
            if (activeSpots.includes('red')) {
                winningNumber = RED_NUMBERS[Math.floor(Math.random() * RED_NUMBERS.length)];
            } else if (activeSpots.includes('black')) {
                const blackNums = ROULETTE_NUMBERS.filter(n => n !== 0 && !RED_NUMBERS.includes(n));
                winningNumber = blackNums[Math.floor(Math.random() * blackNums.length)];
            } else {
                const directNums = activeSpots.filter(s => !isNaN(parseInt(s, 10)));
                if (directNums.length > 0) {
                    winningNumber = parseInt(directNums[0], 10);
                } else {
                    winningNumber = 7;
                }
            }
        } else {
            const winningIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
            winningNumber = ROULETTE_NUMBERS[winningIndex];
        }

        let speed = 0.28;
        let ballSpeed = -0.38;
        let lastTickTime = 0;

        const startTime = Date.now();
        const duration = 4200;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const easeOut = 1 - Math.pow(progress, 2.5);
                this.wheelAngle += speed * easeOut;
                this.ballAngle += ballSpeed * easeOut;

                if (Date.now() - lastTickTime > Math.max(70, 70 + progress * 240)) {
                    window.soundCtrl?.playWheelTick();
                    lastTickTime = Date.now();
                }

                this.drawWheel(this.wheelAngle, this.ballAngle);
                this.animFrame = requestAnimationFrame(animate);
            } else {
                window.soundCtrl?.playBallDrop();
                this.isSpinning = false;
                if (spinBtn) spinBtn.disabled = false;

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
                this.setDealerMsg(`⚡ ВЫПАЛО [${winNum} ${winColor.toUpperCase()}]! ВЫИГРЫШ: +${totalWon} 🪙!`);
            } else {
                window.soundCtrl?.playLose();
                this.setDealerMsg(`Выпало [${winNum} ${winColor.toUpperCase()}]. Ставки проиграли. Попробуйте еще!`);
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

        const potEl = this.container.querySelector('#rouletteCurrentPot');
        if (potEl) potEl.textContent = `${this.getTotalBet()} 🪙`;
    }

    render() {
        const user = StorageManager.getUser() || { chips: 0, equipped: {} };
        const chipValues = [25, 50, 100, 250, 500];

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
            const colSpot = `col${r}`;
            numbersRowsHTML += `
                <div class="grid-cell cell-col-bet side-bet" data-spot="${colSpot}">
                    <span class="num-text">2:1</span>
                </div>
            `;
            numbersRowsHTML += `</div>`;
        }

        this.container.innerHTML = `
        <div class="table-felt lit-felt-roulette">
            <!-- Top Dealer Bar -->
            <div class="roulette-top-bar">
                <div class="dealer-avatar-box">
                    <div class="dealer-badge">ДИЛЕР РУЛЕТКИ</div>
                    <div class="dealer-avatar">
                        ${AvatarRenderer.renderSVG({ gender: 'female', skin: 'fair', hair: 'blonde', costume: 'lit_energy' }, 54)}
                    </div>
                </div>
                <div class="dealer-bubble-container">
                    <div class="dealer-bubble pop">${this.dealerMessage}</div>
                </div>
            </div>

            <!-- Canvas Wheel & History -->
            <div class="roulette-visual-stage">
                <div class="canvas-wheel-box">
                    <canvas id="rouletteWheelCanvas" width="240" height="240"></canvas>
                </div>
                <div class="roulette-history-tray">
                    <div class="tray-title">ИСТОРИЯ ЧИСЕЛ:</div>
                    <div class="history-pills-row" id="rouletteHistory">
                        ${this.history.map(n => `<span class="history-pill pill-${this.getNumberColor(n)}">${n}</span>`).join('')}
                    </div>
                    <div class="roulette-pot-info">
                        Банк на столе: <span class="pot-num" id="rouletteCurrentPot">0 🪙</span>
                    </div>
                </div>
            </div>

            <!-- Modern Lit Energy Betting Grid -->
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

                    <!-- Dozens -->
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

            <!-- Chips Selector & Actions -->
            <div class="table-controls">
                <div class="chips-selector">
                    ${chipValues.map(val => `
                        <button class="lit-chip chip-${val} ${this.selectedChip === val ? 'chip-active' : ''} ${user.equipped?.chipSkin === 'gold_chips' ? 'vip-gold-chip' : ''}" data-val="${val}">
                            <span class="chip-val">${val}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="action-buttons-row">
                    <button class="btn-lit btn-lit-danger" id="btnRouletteClear">СБРОС</button>
                    <button class="btn-lit btn-lit-secondary" id="btnRouletteRepeat">ПОВТОР</button>
                    <button class="btn-lit btn-lit-fire btn-glow" id="btnRouletteSpin">🎲 КРУТИТЬ</button>
                </div>
            </div>
        </div>
        `;

        this.bindEvents();
        this.initCanvas();
        this.drawWheel(0, 0);
    }

    bindEvents() {
        this.container.querySelectorAll('.lit-chip').forEach(btn => {
            btn.onclick = () => {
                this.selectedChip = parseInt(btn.getAttribute('data-val'), 10);
                this.container.querySelectorAll('.lit-chip').forEach(b => b.classList.remove('chip-active'));
                btn.classList.add('chip-active');
                window.soundCtrl?.playClick();
            };
        });

        this.container.querySelectorAll('.grid-cell').forEach(cell => {
            cell.onclick = () => {
                const spot = cell.getAttribute('data-spot');
                if (spot) this.placeBet(spot);
            };
        });

        const btnClear = this.container.querySelector('#btnRouletteClear');
        if (btnClear) btnClear.onclick = () => this.clearBets();

        const btnRepeat = this.container.querySelector('#btnRouletteRepeat');
        if (btnRepeat) btnRepeat.onclick = () => this.repeatBets();

        const btnSpin = this.container.querySelector('#btnRouletteSpin');
        if (btnSpin) btnSpin.onclick = () => this.spin();
    }
}

window.RouletteGame = RouletteGame;
