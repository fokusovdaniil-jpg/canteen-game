// Modern Lit Energy Table & Room Lobby (КПД Style)

class RoomsManager {
    constructor() {
        this.currentRoom = null;
        this.currentGameInstance = null;
        this.botChatTimer = null;
    }

    renderLobby(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rooms = StorageManager.getRooms();
        const user = StorageManager.getUser() || { chips: 0 };

        container.innerHTML = `
        <div class="lobby-wrapper">
            <div class="lobby-header-panel">
                <div class="lobby-title-box">
                    <span class="lit-badge-fire">⚡ MULTIPLAYER LOBBY</span>
                    <h2 class="lit-title">ИГРОВЫЕ СТОЛЫ LIT CASINO</h2>
                    <p class="lit-subtitle">Выбирайте открытый стол или создавайте свою комнату для игры с другими каперами!</p>
                </div>
                <div class="lobby-header-actions">
                    <button class="btn-lit btn-lit-secondary" id="btnQuickPlay">⚡ БЫСТРАЯ ИГРА</button>
                    <button class="btn-lit btn-lit-fire btn-glow" id="btnOpenCreateRoom">➕ СОЗДАТЬ СТОЛ</button>
                </div>
            </div>

            <!-- Filter tabs -->
            <div class="lobby-filter-row">
                <button class="filter-tab active" data-filter="all">ВСЕ СТОЛЫ (${rooms.length})</button>
                <button class="filter-tab" data-filter="blackjack">♠️ БЛЭКДЖЕК</button>
                <button class="filter-tab" data-filter="roulette">🎲 РУЛЕТКА</button>
            </div>

            <!-- Rooms Grid -->
            <div class="rooms-grid" id="roomsListContainer">
                ${this.renderRoomsCards(rooms)}
            </div>
        </div>
        `;

        this.bindLobbyEvents(container);
    }

    renderRoomsCards(rooms) {
        if (!rooms || rooms.length === 0) {
            return `<div class="empty-rooms">Нет открытых столов. Создайте свой!</div>`;
        }

        return rooms.map(room => {
            const isFull = room.playersCount >= room.maxPlayers;
            const isBlackjack = room.game === 'blackjack';

            const playersAvatars = (room.players || []).map(p => {
                const cfg = p.avatar || {};
                return `
                <div class="mini-seated-player" title="${p.nickname || 'Игрок'} (${p.chips || 0} 🪙)">
                    ${AvatarRenderer.renderSVG(cfg, 36)}
                    <span class="mini-player-nick">${p.nickname ? p.nickname.slice(0, 8) : 'Игрок'}</span>
                </div>`;
            }).join('');

            return `
            <div class="room-card ${isFull ? 'room-card-full' : ''}" data-game="${room.game}">
                <div class="room-card-top">
                    <span class="room-game-badge ${isBlackjack ? 'badge-bj' : 'badge-roulette'}">
                        ${isBlackjack ? '♠️ БЛЭКДЖЕК' : '🎲 РУЛЕТКА'}
                    </span>
                    <span class="room-status-badge ${room.status === 'playing' ? 'status-play' : 'status-wait'}">
                        ${room.status === 'playing' ? '🟢 В ИГРЕ' : '🟡 НАБОР'}
                    </span>
                </div>

                <div class="room-card-title">${room.name}</div>

                <div class="room-meta-row">
                    <span class="meta-item"><span class="meta-icon">🪙</span> Мин: <b>${room.minBet}</b></span>
                    <span class="meta-item"><span class="meta-icon">👥</span> Места: <b>${room.playersCount}/${room.maxPlayers}</b></span>
                </div>

                <div class="room-seated-players">
                    <div class="seated-label">Игроки за столом:</div>
                    <div class="seated-avatars-row">
                        ${playersAvatars}
                    </div>
                </div>

                <div class="room-card-footer">
                    <button class="btn-lit btn-lit-primary btn-join-room" data-room-id="${room.id}">
                        ${isFull ? '👀 ЗРИТЕЛЬ' : '🚪 СЕСТЬ ЗА СТОЛ'}
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    bindLobbyEvents(container) {
        container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const f = tab.getAttribute('data-filter');
                const cards = container.querySelectorAll('.room-card');
                cards.forEach(card => {
                    if (f === 'all' || card.getAttribute('data-game') === f) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                window.soundCtrl?.playClick();
            };
        });

        container.querySelectorAll('.btn-join-room').forEach(btn => {
            btn.onclick = () => {
                const roomId = btn.getAttribute('data-room-id');
                this.joinRoom(roomId);
            };
        });

        const btnCreate = container.querySelector('#btnOpenCreateRoom');
        if (btnCreate) {
            btnCreate.onclick = () => {
                window.soundCtrl?.playClick();
                this.showCreateRoomModal();
            };
        }

        const btnQuick = container.querySelector('#btnQuickPlay');
        if (btnQuick) {
            btnQuick.onclick = () => {
                const rooms = StorageManager.getRooms();
                if (rooms.length > 0) {
                    const rnd = rooms[Math.floor(Math.random() * rooms.length)];
                    this.joinRoom(rnd.id);
                } else {
                    this.joinRoom('room_1');
                }
            };
        }
    }

    showCreateRoomModal() {
        const modal = document.getElementById('modalCreateRoom');
        if (!modal) return;
        modal.classList.add('modal-active');
    }

    joinRoom(roomId) {
        const rooms = StorageManager.getRooms();
        const room = rooms.find(r => r.id === roomId) || rooms[0];
        if (!room) return;

        this.currentRoom = room;
        window.soundCtrl?.playClick();

        if (window.app) {
            window.app.showRoomScreen(room);
        }
    }

    renderActiveRoom(containerId, room) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const isBJ = room.game === 'blackjack';
        const user = StorageManager.getUser() || { nickname: 'Вы', chips: 0, equipped: {} };

        container.innerHTML = `
        <div class="active-room-view">
            <!-- Room Navigation Bar -->
            <div class="active-room-bar">
                <button class="btn-lit btn-lit-secondary btn-sm" id="btnLeaveRoom">◀ ЛОББИ</button>
                <div class="room-bar-info">
                    <span class="room-title-highlight">${room.name}</span>
                    <span class="room-game-pill">${isBJ ? '♠️ Блэкджек' : '🎲 Рулетка'} | Мин: ${room.minBet} 🪙</span>
                </div>
                <button class="btn-lit btn-lit-fire btn-sm" id="btnToggleChat">💬 ЧАТ</button>
            </div>

            <!-- Seated Other Players Banner -->
            <div class="room-players-strip">
                <div class="strip-player-card is-self">
                    <div class="mini-avatar">
                        ${AvatarRenderer.renderSVG(user.equipped ? { ...user.equipped, gender: user.gender, skin: user.skin, hair: user.hair } : {}, 38)}
                    </div>
                    <div class="strip-player-info">
                        <div class="strip-nick">${user.nickname} (Вы)</div>
                        <div class="strip-chips">${user.chips.toLocaleString('ru-RU')} 🪙</div>
                    </div>
                </div>

                ${(room.players || []).filter(p => p.nickname !== user.nickname).map(p => `
                    <div class="strip-player-card">
                        <div class="mini-avatar">
                            ${AvatarRenderer.renderSVG(p.avatar || {}, 38)}
                        </div>
                        <div class="strip-player-info">
                            <div class="strip-nick">${p.nickname}</div>
                            <div class="strip-chips">${(p.chips || 1000).toLocaleString('ru-RU')} 🪙</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- In-Game Area -->
            <div class="room-game-wrapper" id="roomGameCanvasArea"></div>

            <!-- Chat Drawer -->
            <div class="room-chat-drawer" id="roomChatDrawer">
                <div class="chat-header">
                    <span>⚡ ЧАТ СТОЛА: ${room.name}</span>
                    <button class="chat-close" id="btnCloseChat">✖</button>
                </div>
                <div class="chat-messages-box" id="roomChatMsgs">
                    <div class="chat-msg system-msg">Добро пожаловать за стол Lit Casino! Удачи в раунде!</div>
                    <div class="chat-msg bot-msg"><b>Зубенко_М_П:</b> Шумим братец, на все фишки заходим!</div>
                </div>
                <div class="chat-quick-reactions">
                    <button class="quick-react-btn" data-text="Шумим, братец! 😎">Шумим!</button>
                    <button class="quick-react-btn" data-text="⚡ Lit Energy вайб!">Lit Вайб!</button>
                    <button class="quick-react-btn" data-text="🍀 На фарт!">На фарт!</button>
                    <button class="quick-react-btn" data-text="🔥 Удваиваю ставку!">Ва-банк!</button>
                </div>
                <div class="chat-input-row">
                    <input type="text" id="chatInputText" placeholder="Сообщение за столом..." maxlength="60" />
                    <button class="btn-lit btn-lit-primary btn-sm" id="btnSendChat">ОТПР.</button>
                </div>
            </div>
        </div>
        `;

        if (isBJ) {
            this.currentGameInstance = new BlackjackGame('roomGameCanvasArea', { minBet: room.minBet });
        } else {
            this.currentGameInstance = new RouletteGame('roomGameCanvasArea', { minBet: room.minBet });
        }

        this.bindRoomEvents(container);
        this.startBotChatSimulator();
    }

    bindRoomEvents(container) {
        const btnLeave = container.querySelector('#btnLeaveRoom');
        if (btnLeave) {
            btnLeave.onclick = () => {
                if (this.currentGameInstance && this.currentGameInstance.destroy) {
                    this.currentGameInstance.destroy();
                }
                this.stopBotChat();
                window.soundCtrl?.playClick();
                if (window.app) window.app.showScreen('lobby');
            };
        }

        const btnToggleChat = container.querySelector('#btnToggleChat');
        const chatDrawer = container.querySelector('#roomChatDrawer');
        const btnCloseChat = container.querySelector('#btnCloseChat');

        if (btnToggleChat && chatDrawer) {
            btnToggleChat.onclick = () => {
                chatDrawer.classList.toggle('drawer-open');
                window.soundCtrl?.playClick();
            };
        }

        if (btnCloseChat && chatDrawer) {
            btnCloseChat.onclick = () => {
                chatDrawer.classList.remove('drawer-open');
            };
        }

        const input = container.querySelector('#chatInputText');
        const btnSend = container.querySelector('#btnSendChat');
        const sendAction = () => {
            const text = input.value.trim();
            if (!text) return;
            const user = StorageManager.getUser() || { nickname: 'Вы' };
            this.appendChatMessage(user.nickname, text, 'self-msg');
            input.value = '';
            window.soundCtrl?.playClick();
        };

        if (btnSend) btnSend.onclick = sendAction;
        if (input) {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') sendAction();
            };
        }

        container.querySelectorAll('.quick-react-btn').forEach(b => {
            b.onclick = () => {
                const text = b.getAttribute('data-text');
                const user = StorageManager.getUser() || { nickname: 'Вы' };
                this.appendChatMessage(user.nickname, text, 'self-msg');
                window.soundCtrl?.playClick();
            };
        });
    }

    appendChatMessage(sender, text, type = 'normal') {
        const box = document.getElementById('roomChatMsgs');
        if (!box) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${type}`;
        msgDiv.innerHTML = `<b>${sender}:</b> ${text}`;
        box.appendChild(msgDiv);
        box.scrollTop = box.scrollHeight;
    }

    startBotChatSimulator() {
        this.stopBotChat();
        const memeQuotes = [
            { sender: 'Зубенко_М_П', text: 'Фарту масти, господа! Дилер, мешай колоду!' },
            { sender: 'Ivan_Zolo_2004', text: 'Ставим на красное под банку Lit Energy!' },
            { sender: 'Mikhail_Litvin', text: 'Сегодня заряжены на максимальный занос 🔥' },
            { sender: 'Саша_Белый', text: 'Мы с первого класса вместе. Ставка принята.' },
            { sender: 'Sheikh_Hamdan', text: 'Doubling the table bet in style 💎' },
            { sender: 'Lit_Queen', text: 'Корона забирает этот раунд 👑' }
        ];

        this.botChatTimer = setInterval(() => {
            if (!document.getElementById('roomChatMsgs')) {
                this.stopBotChat();
                return;
            }
            const quote = memeQuotes[Math.floor(Math.random() * memeQuotes.length)];
            this.appendChatMessage(quote.sender, quote.text, 'bot-msg');
        }, 12000);
    }

    stopBotChat() {
        if (this.botChatTimer) {
            clearInterval(this.botChatTimer);
            this.botChatTimer = null;
        }
    }
}

window.RoomsManager = RoomsManager;
