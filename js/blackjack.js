// Modern Lit Energy Blackjack Engine with Virtual Dealer & Admin God Mode

class BlackjackGame {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.currentBet = 0;
        this.selectedChip = 25;
        this.gameState = 'betting';
        this.dealerMessage = 'Делайте ваши ставки на сукне!';
        this.minBet = options.minBet || 25;
        this.init();
    }

    init() {
        this.render();
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = [
            { rank: '2', value: 2 },
            { rank: '3', value: 3 },
            { rank: '4', value: 4 },
            { rank: '5', value: 5 },
            { rank: '6', value: 6 },
            { rank: '7', value: 7 },
            { rank: '8', value: 8 },
            { rank: '9', value: 9 },
            { rank: '10', value: 10 },
            { rank: 'J', value: 10 },
            { rank: 'Q', value: 10 },
            { rank: 'K', value: 10 },
            { rank: 'A', value: 11 }
        ];

        let deck = [];
        for (let d = 0; d < 4; d++) {
            for (let s of suits) {
                for (let v of values) {
                    deck.push({ suit: s, rank: v.rank, value: v.value });
                }
            }
        }

        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            score += card.value;
            if (card.rank === 'A') aces++;
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    isBlackjack(hand) {
        return hand.length === 2 && this.calculateScore(hand) === 21;
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

    addChip(val) {
        if (this.gameState !== 'betting') return;
        const user = StorageManager.getUser();
        if (!user) return;

        if (user.chips < (this.currentBet + val)) {
            this.setDealerMsg('Не хватает фишек для этой ставки!');
            return;
        }

        this.currentBet += val;
        window.soundCtrl?.playChip();
        this.renderTable();
    }

    clearBet() {
        if (this.gameState !== 'betting') return;
        this.currentBet = 0;
        window.soundCtrl?.playClick();
        this.setDealerMsg('Ставки очищены. Выберите фишки!');
        this.renderTable();
    }

    deal() {
        if (this.gameState !== 'betting') return;
        if (this.currentBet < this.minBet) {
            this.setDealerMsg(`Минимальная ставка за столом: ${this.minBet} 🪙!`);
            return;
        }

        const user = StorageManager.getUser();
        if (!user || user.chips < this.currentBet) {
            this.setDealerMsg('У вас недостаточно фишек!');
            return;
        }

        StorageManager.updateChips(-this.currentBet);
        if (window.app) window.app.updateHeaderUser();

        this.deck = this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.gameState = 'dealing';

        this.setDealerMsg('Раздача карт...');
        window.soundCtrl?.playCardDeal();

        const luckMode = window.adminPanel ? window.adminPanel.getLuckMode() : 'fair';

        // Check God Mode
        if (luckMode === 'god') {
            // Guarantee 21 for player
            this.playerHand = [
                { suit: '♠', rank: 'A', value: 11 },
                { suit: '♦', rank: 'K', value: 10 }
            ];
            this.dealerHand = [
                { suit: '♣', rank: '9', value: 9 },
                { suit: '♥', rank: '7', value: 7 }
            ];
            setTimeout(() => {
                this.gameState = 'player_turn';
                this.renderTable();
                this.checkInitialBlackjack();
            }, 500);
            return;
        }

        // Standard Deal
        this.playerHand.push(this.deck.pop());
        this.renderTable();

        setTimeout(() => {
            window.soundCtrl?.playCardDeal();
            this.dealerHand.push(this.deck.pop());
            this.renderTable();

            setTimeout(() => {
                window.soundCtrl?.playCardDeal();
                this.playerHand.push(this.deck.pop());
                this.renderTable();

                setTimeout(() => {
                    window.soundCtrl?.playCardDeal();
                    this.dealerHand.push(this.deck.pop());
                    this.gameState = 'player_turn';
                    this.renderTable();
                    this.checkInitialBlackjack();
                }, 250);
            }, 250);
        }, 250);
    }

    checkInitialBlackjack() {
        const playerBJ = this.isBlackjack(this.playerHand);
        const dealerBJ = this.isBlackjack(this.dealerHand);

        if (playerBJ && dealerBJ) {
            this.gameState = 'game_over';
            this.setDealerMsg('Ничья (Push)! У обоих 21.');
            StorageManager.updateChips(this.currentBet);
            window.soundCtrl?.playClick();
            this.finishRound();
        } else if (playerBJ) {
            this.gameState = 'game_over';
            const winAmount = Math.floor(this.currentBet * 2.5);
            this.setDealerMsg('⚡ БЛЭКДЖЕК! Натуральные 21! Выигрыш 3:2!');
            StorageManager.updateChips(winAmount);
            this.recordStats(true, true);
            window.soundCtrl?.playBlackjack();
            this.finishRound();
        } else {
            const playerScore = this.calculateScore(this.playerHand);
            this.setDealerMsg(`У вас ${playerScore}. Ваш ход: «Еще», «Хватит» или «Удвоить»?`);
        }
        this.renderTable();
    }

    hit() {
        if (this.gameState !== 'player_turn') return;
        window.soundCtrl?.playCardDeal();

        const luckMode = window.adminPanel ? window.adminPanel.getLuckMode() : 'fair';
        if (luckMode === 'god') {
            const currentScore = this.calculateScore(this.playerHand);
            const needed = 21 - currentScore;
            if (needed >= 2 && needed <= 10) {
                this.playerHand.push({ suit: '♠', rank: needed.toString(), value: needed });
            } else if (needed === 11 || needed === 1) {
                this.playerHand.push({ suit: '♥', rank: 'A', value: 11 });
            } else {
                this.playerHand.push(this.deck.pop());
            }
        } else {
            this.playerHand.push(this.deck.pop());
        }

        const score = this.calculateScore(this.playerHand);
        if (score > 21) {
            this.gameState = 'game_over';
            this.setDealerMsg(`Перебор (${score})! Казино забирает ставку.`);
            window.soundCtrl?.playLose();
            this.recordStats(false, false);
            this.finishRound();
        } else if (score === 21) {
            this.stand();
        } else {
            this.setDealerMsg(`У вас ${score}. Еще или Хватит?`);
        }
        this.renderTable();
    }

    doubleDown() {
        if (this.gameState !== 'player_turn' || this.playerHand.length !== 2) return;
        const user = StorageManager.getUser();
        if (!user || user.chips < this.currentBet) {
            this.setDealerMsg('Недостаточно фишек для удвоения ставки!');
            return;
        }

        StorageManager.updateChips(-this.currentBet);
        this.currentBet *= 2;
        if (window.app) window.app.updateHeaderUser();

        window.soundCtrl?.playChip();
        window.soundCtrl?.playCardDeal();
        this.playerHand.push(this.deck.pop());
        const score = this.calculateScore(this.playerHand);

        if (score > 21) {
            this.gameState = 'game_over';
            this.setDealerMsg(`Удвоение и перебор (${score})! Казино побеждает.`);
            window.soundCtrl?.playLose();
            this.recordStats(false, false);
            this.finishRound();
        } else {
            this.stand();
        }
        this.renderTable();
    }

    stand() {
        if (this.gameState !== 'player_turn') return;
        this.gameState = 'dealer_turn';
        this.setDealerMsg('Ход дилера...');
        this.renderTable();

        const luckMode = window.adminPanel ? window.adminPanel.getLuckMode() : 'fair';

        const dealerStep = () => {
            const dealerScore = this.calculateScore(this.dealerHand);
            if (luckMode === 'god' && dealerScore >= 17 && dealerScore <= 21) {
                // In god mode, force dealer to bust
                this.dealerHand.push({ suit: '♦', rank: '10', value: 10 });
                this.renderTable();
                this.resolveWinner();
                return;
            }

            if (dealerScore < 17) {
                setTimeout(() => {
                    window.soundCtrl?.playCardDeal();
                    this.dealerHand.push(this.deck.pop());
                    this.renderTable();
                    dealerStep();
                }, 500);
            } else {
                this.resolveWinner();
            }
        };

        setTimeout(dealerStep, 400);
    }

    resolveWinner() {
        this.gameState = 'game_over';
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (dealerScore > 21) {
            const winAmount = this.currentBet * 2;
            this.setDealerMsg(`У дилера перебор (${dealerScore})! ПОБЕДА! +${winAmount} 🪙`);
            StorageManager.updateChips(winAmount);
            this.recordStats(true, false);
            window.soundCtrl?.playWin();
        } else if (playerScore > dealerScore) {
            const winAmount = this.currentBet * 2;
            this.setDealerMsg(`У вас ${playerScore} против ${dealerScore}! ПОБЕДА! +${winAmount} 🪙`);
            StorageManager.updateChips(winAmount);
            this.recordStats(true, false);
            window.soundCtrl?.playWin();
        } else if (playerScore === dealerScore) {
            this.setDealerMsg(`Ничья (${playerScore} : ${dealerScore})! Ставка возвращена.`);
            StorageManager.updateChips(this.currentBet);
            window.soundCtrl?.playClick();
        } else {
            this.setDealerMsg(`У дилера ${dealerScore}, у вас ${playerScore}. Выигрыш дилера.`);
            window.soundCtrl?.playLose();
            this.recordStats(false, false);
        }

        this.finishRound();
        this.renderTable();
    }

    recordStats(isWin, isBJ) {
        const user = StorageManager.getUser();
        if (!user) return;
        user.stats.gamesPlayed = (user.stats.gamesPlayed || 0) + 1;
        if (isWin) {
            user.stats.wins = (user.stats.wins || 0) + 1;
            if (isBJ) user.stats.blackjackWins = (user.stats.blackjackWins || 0) + 1;
        }
        StorageManager.saveUser(user);
        if (window.app) window.app.updateHeaderUser();
    }

    finishRound() {
        if (window.app) window.app.updateHeaderUser();
    }

    newRound() {
        this.playerHand = [];
        this.dealerHand = [];
        this.gameState = 'betting';
        this.setDealerMsg('Новый раунд! Поставьте фишки и нажмите «Раздать».');
        this.renderTable();
    }

    renderCardHTML(card, hidden = false) {
        if (hidden) {
            return `
            <div class="lit-card card-back">
                <div class="card-inner-lit">⚡ LIT</div>
            </div>`;
        }

        const isRed = card.suit === '♥' || card.suit === '♦';
        return `
        <div class="lit-card ${isRed ? 'card-red' : 'card-black'} card-pop">
            <div class="card-corner top-left">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
            <div class="card-center">${card.suit}</div>
            <div class="card-corner bottom-right">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
        </div>`;
    }

    renderTable() {
        const dealerScore = this.gameState === 'player_turn' || this.gameState === 'dealing'
            ? (this.dealerHand[0] ? this.dealerHand[0].value : 0)
            : this.calculateScore(this.dealerHand);

        const playerScore = this.calculateScore(this.playerHand);
        const user = StorageManager.getUser() || { chips: 0, equipped: {} };

        let dealerCardsHTML = '';
        this.dealerHand.forEach((card, idx) => {
            const isHidden = idx === 1 && (this.gameState === 'player_turn' || this.gameState === 'dealing');
            dealerCardsHTML += this.renderCardHTML(card, isHidden);
        });

        let playerCardsHTML = '';
        this.playerHand.forEach(card => {
            playerCardsHTML += this.renderCardHTML(card, false);
        });

        const chipValues = [25, 50, 100, 250, 500];

        this.container.innerHTML = `
        <div class="table-felt lit-felt-bj">
            <!-- Dealer Banner -->
            <div class="dealer-section">
                <div class="dealer-avatar-box">
                    <div class="dealer-badge">КРУПЬЕ 21</div>
                    <div class="dealer-avatar">
                        ${AvatarRenderer.renderSVG({ gender: 'male', skin: 'fair', hair: 'black', costume: 'sheikh' }, 54)}
                    </div>
                </div>
                <div class="dealer-bubble-container">
                    <div class="dealer-bubble pop">${this.dealerMessage}</div>
                </div>
            </div>

            <!-- Dealer Cards Zone -->
            <div class="cards-zone dealer-zone">
                <div class="zone-label">
                    КАРТЫ ДИЛЕРА ${this.dealerHand.length > 0 ? `<span class="score-pill">${dealerScore}</span>` : ''}
                </div>
                <div class="cards-row" id="dealerCardsRow">
                    ${dealerCardsHTML || '<div class="empty-cards-placeholder">Ожидание ставок...</div>'}
                </div>
            </div>

            <!-- Felt Center Decor -->
            <div class="felt-decor-center">
                <div class="felt-logo-text">⚡ LIT CASINO 21 ⚡</div>
                <div class="felt-subtext">ДИЛЕР СТОИТ НА 17 • БЛЭКДЖЕК ПЛАТИТ 3:2</div>
                <div class="current-pot-badge">
                    Банк на столе: <span class="pot-num">${this.currentBet} 🪙</span>
                </div>
            </div>

            <!-- Player Cards Zone -->
            <div class="cards-zone player-zone">
                <div class="zone-label">
                    ВАШИ КАРТЫ ${this.playerHand.length > 0 ? `<span class="score-pill">${playerScore}</span>` : ''}
                </div>
                <div class="cards-row" id="playerCardsRow">
                    ${playerCardsHTML || '<div class="empty-cards-placeholder">Сделайте ставку для начала раздачи</div>'}
                </div>
            </div>

            <!-- Action Controls -->
            <div class="table-controls">
                ${this.gameState === 'betting' ? `
                    <div class="betting-tray">
                        <div class="chips-selector">
                            ${chipValues.map(val => `
                                <button class="lit-chip chip-${val} ${user.equipped?.chipSkin === 'gold_chips' ? 'vip-gold-chip' : ''}" data-val="${val}">
                                    <span class="chip-val">${val}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="action-buttons-row">
                            <button class="btn-lit btn-lit-danger" id="btnBjClear">СБРОС</button>
                            <button class="btn-lit btn-lit-secondary" id="btnBjMin">МИН (${this.minBet})</button>
                            <button class="btn-lit btn-lit-fire btn-glow" id="btnBjDeal" ${this.currentBet < this.minBet ? 'disabled' : ''}>РАЗДАТЬ</button>
                        </div>
                    </div>
                ` : ''}

                ${this.gameState === 'player_turn' ? `
                    <div class="game-actions-tray">
                        <button class="btn-lit btn-lit-cyan" id="btnBjHit">➕ ЕЩЕ</button>
                        <button class="btn-lit btn-lit-secondary" id="btnBjStand">✋ ХВАТИТ</button>
                        ${this.playerHand.length === 2 && user.chips >= this.currentBet ? `
                            <button class="btn-lit btn-lit-fire" id="btnBjDouble">⚡ УДВОИТЬ (${this.currentBet * 2})</button>
                        ` : ''}
                    </div>
                ` : ''}

                ${this.gameState === 'game_over' ? `
                    <div class="game-over-tray">
                        <button class="btn-lit btn-lit-fire btn-glow pulse-btn" id="btnBjNewRound">🔄 СЛЕДУЮЩИЙ РАУНД</button>
                    </div>
                ` : ''}
            </div>
        </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelectorAll('.lit-chip').forEach(btn => {
            btn.onclick = () => {
                const val = parseInt(btn.getAttribute('data-val'), 10);
                this.addChip(val);
            };
        });

        const btnClear = this.container.querySelector('#btnBjClear');
        if (btnClear) btnClear.onclick = () => this.clearBet();

        const btnMin = this.container.querySelector('#btnBjMin');
        if (btnMin) btnMin.onclick = () => {
            this.currentBet = this.minBet;
            window.soundCtrl?.playChip();
            this.renderTable();
        };

        const btnDeal = this.container.querySelector('#btnBjDeal');
        if (btnDeal) btnDeal.onclick = () => this.deal();

        const btnHit = this.container.querySelector('#btnBjHit');
        if (btnHit) btnHit.onclick = () => this.hit();

        const btnStand = this.container.querySelector('#btnBjStand');
        if (btnStand) btnStand.onclick = () => this.stand();

        const btnDouble = this.container.querySelector('#btnBjDouble');
        if (btnDouble) btnDouble.onclick = () => this.doubleDown();

        const btnNewRound = this.container.querySelector('#btnBjNewRound');
        if (btnNewRound) btnNewRound.onclick = () => this.newRound();
    }

    render() {
        this.renderTable();
    }
}

window.BlackjackGame = BlackjackGame;
