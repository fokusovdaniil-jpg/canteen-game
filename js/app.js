// Main Application Controller for Retro Casino (PSP / Telegram Mini App)

class App {
    constructor() {
        this.currentScreen = 'lobby';
        this.roomsManager = new RoomsManager();
        this.shopManager = new ShopManager();
        this.init();
    }

    init() {
        // 1. Telegram WebApp Integration
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                window.Telegram.WebApp.headerColor = '#0f172a';
                window.Telegram.WebApp.backgroundColor = '#0b0f19';
            } catch (e) {
                console.warn('Telegram WebApp SDK init note:', e);
            }
        }

        // 2. Sound state check
        const soundBtn = document.getElementById('btnToggleSound');
        if (soundBtn && window.soundCtrl?.muted) {
            soundBtn.textContent = '🔇';
        }

        // 3. User Registration Check
        const user = StorageManager.getUser();
        if (!user) {
            this.showRegistrationModal();
        } else {
            this.updateHeaderUser();
            this.showScreen('lobby');
        }

        this.bindGlobalEvents();
        this.initCrossTabSync();
    }

    updateHeaderUser() {
        const user = StorageManager.getUser();
        if (!user) return;

        const chipsEl = document.getElementById('headerChipsAmount');
        if (chipsEl) chipsEl.textContent = user.chips.toLocaleString('ru-RU');

        const nickEl = document.getElementById('headerUserNick');
        if (nickEl) nickEl.textContent = user.nickname;

        const avatarEl = document.getElementById('headerUserAvatar');
        if (avatarEl) {
            const avatarConfig = {
                gender: user.gender,
                skin: user.skin,
                hair: user.hair,
                hairStyle: user.hairStyle,
                costume: user.equipped?.costume,
                hat: user.equipped?.hat,
                glasses: user.equipped?.glasses,
                accessory: user.equipped?.accessory
            };
            avatarEl.innerHTML = AvatarRenderer.renderSVG(avatarConfig, 36);
        }
    }

    showRegistrationModal() {
        const modal = document.getElementById('modalRegister');
        if (!modal) return;
        modal.classList.add('modal-active');

        // Setup live preview
        let regConfig = {
            gender: 'male',
            skin: 'fair',
            hair: 'black',
            hairStyle: 'short'
        };

        const previewContainer = document.getElementById('regAvatarPreview');
        const updatePreview = () => {
            if (previewContainer) {
                previewContainer.innerHTML = AvatarRenderer.renderSVG(regConfig, 96);
            }
        };
        updatePreview();

        // Preset selector clicks
        modal.querySelectorAll('.preset-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                regConfig.gender = btn.getAttribute('data-gender');
                regConfig.skin = btn.getAttribute('data-skin');
                regConfig.hair = btn.getAttribute('data-hair');
                regConfig.hairStyle = btn.getAttribute('data-style');
                updatePreview();
                window.soundCtrl?.playClick();
            };
        });

        // Submit registration
        const btnSave = document.getElementById('btnSubmitRegister');
        if (btnSave) {
            btnSave.onclick = () => {
                const nickInput = document.getElementById('regNickInput');
                let nick = nickInput?.value.trim();
                if (!nick) {
                    nick = 'Игрок_' + Math.floor(1000 + Math.random() * 9000);
                }

                const newUser = StorageManager.createUser({
                    nickname: nick,
                    gender: regConfig.gender,
                    skin: regConfig.skin,
                    hair: regConfig.hair,
                    hairStyle: regConfig.hairStyle
                });

                modal.classList.remove('modal-active');
                window.soundCtrl?.playWin();
                this.updateHeaderUser();
                this.showNotification(`🎉 Добро пожаловать, ${newUser.nickname}! Вам начислено 300 стартовых фишек!`);
                this.showScreen('lobby');
            };
        }
    }

    showScreen(screenName) {
        this.currentScreen = screenName;

        // Hide all screens
        document.querySelectorAll('.screen-container').forEach(el => {
            el.classList.remove('screen-active');
        });

        // Update nav buttons
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-screen') === screenName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Render target screen
        if (screenName === 'lobby') {
            const screen = document.getElementById('screenLobby');
            if (screen) {
                screen.classList.add('screen-active');
                this.roomsManager.renderLobby('screenLobby');
            }
        } else if (screenName === 'shop') {
            const screen = document.getElementById('screenShop');
            if (screen) {
                screen.classList.add('screen-active');
                this.shopManager.renderShop('screenShop');
            }
        } else if (screenName === 'leaderboard') {
            const screen = document.getElementById('screenLeaderboard');
            if (screen) {
                screen.classList.add('screen-active');
                this.renderLeaderboard('screenLeaderboard');
            }
        } else if (screenName === 'profile') {
            const screen = document.getElementById('screenProfile');
            if (screen) {
                screen.classList.add('screen-active');
                this.renderProfile('screenProfile');
            }
        } else if (screenName === 'quick_blackjack') {
            // Direct launch of solo/quick blackjack
            const room = {
                id: 'quick_bj',
                name: 'Одиночный Блэкджек',
                game: 'blackjack',
                minBet: 10,
                maxPlayers: 1,
                players: []
            };
            this.showRoomScreen(room);
        } else if (screenName === 'quick_roulette') {
            // Direct launch of solo/quick roulette
            const room = {
                id: 'quick_roulette',
                name: 'Европейская Рулетка',
                game: 'roulette',
                minBet: 10,
                maxPlayers: 1,
                players: []
            };
            this.showRoomScreen(room);
        }
    }

    showRoomScreen(room) {
        document.querySelectorAll('.screen-container').forEach(el => el.classList.remove('screen-active'));
        const screen = document.getElementById('screenRoom');
        if (screen) {
            screen.classList.add('screen-active');
            this.roomsManager.renderActiveRoom('screenRoom', room);
        }
    }

    renderLeaderboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const list = StorageManager.getLeaderboard();

        container.innerHTML = `
        <div class="leaderboard-wrapper">
            <div class="leaderboard-header">
                <h2 class="retro-title">ТАБЛИЦА ЛИДЕРОВ КАЗИНО</h2>
                <p class="retro-subtitle">Самые богатые игроки по количеству выигранных фишек</p>
            </div>

            <div class="leaderboard-list">
                ${list.map((player, index) => {
                    const rank = index + 1;
                    const rankMedal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : `#${rank}`));
                    const isSelf = player.isCurrentPlayer;

                    return `
                    <div class="leader-row ${isSelf ? 'leader-row-self' : ''}">
                        <div class="leader-rank">${rankMedal}</div>
                        <div class="leader-avatar">
                            ${AvatarRenderer.renderSVG(player.avatar || {}, 40)}
                        </div>
                        <div class="leader-meta">
                            <div class="leader-name">
                                ${player.nickname} ${isSelf ? '<span class="self-tag">(ВЫ)</span>' : ''}
                            </div>
                            <div class="leader-sub">Побед: ${player.wins || 0}</div>
                        </div>
                        <div class="leader-chips">
                            <span class="chips-val">${player.chips.toLocaleString('ru-RU')}</span>
                            <span class="chips-icon">🪙</span>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
        `;
    }

    renderProfile(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = StorageManager.getUser();
        if (!user) return;

        container.innerHTML = `
        <div class="profile-wrapper">
            <!-- Profile Identity Card -->
            <div class="profile-card">
                <div class="profile-avatar-big">
                    ${AvatarRenderer.renderSVG({
                        gender: user.gender,
                        skin: user.skin,
                        hair: user.hair,
                        hairStyle: user.hairStyle,
                        costume: user.equipped?.costume,
                        hat: user.equipped?.hat,
                        glasses: user.equipped?.glasses,
                        accessory: user.equipped?.accessory
                    }, 120)}
                </div>

                <div class="profile-info">
                    <h2 class="profile-nick">${user.nickname}</h2>
                    <div class="profile-chips-badge">
                        Баланс: <span class="badge-chips-val">${user.chips.toLocaleString('ru-RU')} 🪙</span>
                    </div>
                    <div class="profile-buttons-row">
                        <button class="btn-pixel btn-warning btn-sm" id="btnClaimDaily">🎁 ДНЕВНОЙ БОНУС (+100)</button>
                        ${user.chips < 10 ? `
                            <button class="btn-pixel btn-danger btn-sm pulse-btn" id="btnClaimBailout">🚨 ПОДГОН КАЗИНО (+50)</button>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Stats Block -->
            <div class="profile-stats-grid">
                <div class="stat-card">
                    <div class="stat-num">${user.stats?.gamesPlayed || 0}</div>
                    <div class="stat-label">Сыграно раундов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-num">${user.stats?.wins || 0}</div>
                    <div class="stat-label">Всего побед</div>
                </div>
                <div class="stat-card">
                    <div class="stat-num">${user.stats?.biggestWin || 0} 🪙</div>
                    <div class="stat-label">Рекордный выигрыш</div>
                </div>
                <div class="stat-card">
                    <div class="stat-num">${(user.inventory || []).length}</div>
                    <div class="stat-label">Вещей в инвентаре</div>
                </div>
            </div>

            <!-- Quick Action Links -->
            <div class="profile-quick-nav">
                <button class="btn-pixel btn-primary" id="btnProfileGoShop">🛍 ПЕРЕЙТИ В МАГАЗИН СКИНОВ</button>
            </div>
        </div>
        `;

        // Bind Profile events
        const btnDaily = container.querySelector('#btnClaimDaily');
        if (btnDaily) {
            btnDaily.onclick = () => {
                const res = StorageManager.claimDailyBonus();
                if (res.success) {
                    window.soundCtrl?.playWin();
                    this.updateHeaderUser();
                    this.showNotification(`🎉 Получено +${res.bonus} фишек! Новый баланс: ${res.balance} 🪙`);
                    this.renderProfile(containerId);
                } else {
                    window.soundCtrl?.playLose();
                    this.showNotification(res.message, 'warning');
                }
            };
        }

        const btnBailout = container.querySelector('#btnClaimBailout');
        if (btnBailout) {
            btnBailout.onclick = () => {
                const res = StorageManager.claimBailout();
                if (res.success) {
                    window.soundCtrl?.playWin();
                    this.updateHeaderUser();
                    this.showNotification(`🚨 ${res.message} Баланс: ${res.balance} 🪙`);
                    this.renderProfile(containerId);
                } else {
                    this.showNotification(res.message, 'warning');
                }
            };
        }

        const btnGoShop = container.querySelector('#btnProfileGoShop');
        if (btnGoShop) {
            btnGoShop.onclick = () => {
                this.showScreen('shop');
            };
        }
    }

    bindGlobalEvents() {
        // Navigation bar buttons
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = () => {
                const screen = item.getAttribute('data-screen');
                window.soundCtrl?.playClick();
                this.showScreen(screen);
            };
        });

        // Header Sound toggle
        const btnSound = document.getElementById('btnToggleSound');
        if (btnSound) {
            btnSound.onclick = () => {
                const isMuted = window.soundCtrl?.toggleMute();
                btnSound.textContent = isMuted ? '🔇' : '🔊';
            };
        }

        // Header Add Chips / Bonus
        const btnAddChips = document.getElementById('btnAddChips');
        if (btnAddChips) {
            btnAddChips.onclick = () => {
                const res = StorageManager.claimDailyBonus();
                if (res.success) {
                    window.soundCtrl?.playWin();
                    this.updateHeaderUser();
                    this.showNotification(`🎁 Ежедневный бонус: +${res.bonus} фишек!`);
                } else {
                    // Try bailout if balance is low
                    const bailout = StorageManager.claimBailout();
                    if (bailout.success) {
                        window.soundCtrl?.playWin();
                        this.updateHeaderUser();
                        this.showNotification(`🚨 Подгон от заведения: +50 фишек!`);
                    } else {
                        this.showNotification(res.message, 'warning');
                    }
                }
            };
        }

        // Header Profile Icon click
        const userBadge = document.getElementById('headerUserBadge');
        if (userBadge) {
            userBadge.onclick = () => {
                window.soundCtrl?.playClick();
                this.showScreen('profile');
            };
        }

        // Modal Create Room Cancel & Confirm
        const modalCreate = document.getElementById('modalCreateRoom');
        const btnCloseCreate = document.getElementById('btnCloseCreateRoom');
        const btnSubmitCreate = document.getElementById('btnSubmitCreateRoom');

        if (btnCloseCreate && modalCreate) {
            btnCloseCreate.onclick = () => {
                modalCreate.classList.remove('modal-active');
            };
        }

        if (btnSubmitCreate && modalCreate) {
            btnSubmitCreate.onclick = () => {
                const nameInput = document.getElementById('createRoomName');
                const gameSelect = document.getElementById('createRoomGame');
                const minBetSelect = document.getElementById('createRoomMinBet');
                const maxPlayersSelect = document.getElementById('createRoomMaxPlayers');

                const newRoom = StorageManager.createRoom({
                    name: nameInput?.value.trim() || 'Комната удачи',
                    game: gameSelect?.value || 'blackjack',
                    minBet: minBetSelect?.value || 25,
                    maxPlayers: maxPlayersSelect?.value || 4
                });

                modalCreate.classList.remove('modal-active');
                window.soundCtrl?.playWin();
                this.showNotification(`Стол «${newRoom.name}» успешно создан!`);
                this.roomsManager.joinRoom(newRoom.id);
            };
        }
    }

    initCrossTabSync() {
        if ('BroadcastChannel' in window) {
            try {
                const bc = new BroadcastChannel('retro_casino_sync');
                bc.onmessage = (event) => {
                    const { action } = event.data || {};
                    if (action === 'user_updated') {
                        this.updateHeaderUser();
                    } else if (action === 'rooms_updated' && this.currentScreen === 'lobby') {
                        this.roomsManager.renderLobby('screenLobby');
                    }
                };
            } catch (e) {}
        }
    }

    showNotification(msg, type = 'info') {
        let toast = document.getElementById('retroToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'retroToast';
            document.body.appendChild(toast);
        }
        toast.className = `retro-toast toast-${type} toast-show`;
        toast.textContent = msg;

        setTimeout(() => {
            toast.classList.remove('toast-show');
        }, 3200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
