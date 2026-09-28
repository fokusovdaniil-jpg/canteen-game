// Admin Panel Controller for LIT CASINO

class AdminPanel {
    constructor() {
        this.isAdmin = localStorage.getItem('lit_casino_admin_auth') === 'true';
        this.luckMode = localStorage.getItem('lit_casino_luck_mode') || 'fair'; // 'god', 'fair', 'drain'
    }

    checkAuth(pin) {
        if (pin === '7777' || pin === 'admin' || pin === 'litenergy') {
            this.isAdmin = true;
            localStorage.setItem('lit_casino_admin_auth', 'true');
            return true;
        }
        return false;
    }

    logout() {
        this.isAdmin = false;
        localStorage.removeItem('lit_casino_admin_auth');
    }

    getLuckMode() {
        return this.luckMode;
    }

    setLuckMode(mode) {
        this.luckMode = mode;
        localStorage.setItem('lit_casino_luck_mode', mode);
    }

    giveChips(amount) {
        const user = StorageManager.getUser();
        if (!user) return false;
        user.chips += amount;
        StorageManager.saveUser(user);
        if (window.app) window.app.updateHeaderUser();
        return user.chips;
    }

    setChips(amount) {
        const user = StorageManager.getUser();
        if (!user) return false;
        user.chips = Math.max(0, amount);
        StorageManager.saveUser(user);
        if (window.app) window.app.updateHeaderUser();
        return user.chips;
    }

    unlockAllItems() {
        const user = StorageManager.getUser();
        if (!user) return false;
        const allItems = StorageManager.getShopItems().map(i => i.id);
        user.inventory = Array.from(new Set([...user.inventory, ...allItems]));
        StorageManager.saveUser(user);
        return true;
    }

    renderAdminModal() {
        let modal = document.getElementById('modalAdmin');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modalAdmin';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const user = StorageManager.getUser() || { chips: 0, nickname: 'Игрок' };

        if (!this.isAdmin) {
            // Login Prompt
            modal.innerHTML = `
            <div class="modal-box admin-modal-box">
                <div class="modal-header">
                    <div class="lit-badge-fire">⚡ LIT ADMIN ACCESS</div>
                    <h2 class="lit-title">ВХОД В ПАНЕЛЬ УПРАВЛЕНИЯ</h2>
                    <p class="lit-subtitle">Введите секретный PIN-код администратора (по умолчанию: <b>7777</b>)</p>
                </div>

                <div class="form-group">
                    <input type="password" class="input-lit" id="adminPinInput" placeholder="Введите PIN..." maxlength="10" />
                </div>

                <div class="action-buttons-row">
                    <button class="btn-lit btn-lit-secondary" id="btnAdminClose">ОТМЕНА</button>
                    <button class="btn-lit btn-lit-fire" id="btnAdminLogin">ВОЙТИ</button>
                </div>
            </div>
            `;
            modal.classList.add('modal-active');

            const btnClose = modal.querySelector('#btnAdminClose');
            if (btnClose) btnClose.onclick = () => modal.classList.remove('modal-active');

            const btnLogin = modal.querySelector('#btnAdminLogin');
            const pinInput = modal.querySelector('#adminPinInput');

            const tryLogin = () => {
                const pin = pinInput.value.trim();
                if (this.checkAuth(pin)) {
                    window.soundCtrl?.playWin();
                    if (window.app) window.app.showNotification('🔥 Доступ администратора открыт!');
                    this.renderAdminModal();
                } else {
                    window.soundCtrl?.playLose();
                    if (window.app) window.app.showNotification('Неверный PIN-код!', 'error');
                }
            };

            if (btnLogin) btnLogin.onclick = tryLogin;
            if (pinInput) {
                pinInput.onkeypress = (e) => {
                    if (e.key === 'Enter') tryLogin();
                };
            }
            return;
        }

        // Full Admin Dashboard
        modal.innerHTML = `
        <div class="modal-box admin-modal-box full-admin">
            <div class="modal-header admin-head">
                <div class="admin-head-left">
                    <span class="lit-badge-fire">⚡ LIT ENERGY DEVELOPER PANEL</span>
                    <h2 class="lit-title">УПРАВЛЕНИЕ КАЗИНО</h2>
                </div>
                <button class="chat-close" id="btnAdminCloseX">✖</button>
            </div>

            <!-- 1. Quick Chips Injection -->
            <div class="admin-section">
                <div class="section-title">🪙 ВЫДАЧА ФИШЕК (ТЕКУЩИЙ БАЛАНС: <b>${user.chips.toLocaleString('ru-RU')}</b>)</div>
                <div class="admin-btn-grid">
                    <button class="btn-lit btn-lit-cyan btn-sm" data-add="1000">+1 000 🪙</button>
                    <button class="btn-lit btn-lit-cyan btn-sm" data-add="10000">+10 000 🪙</button>
                    <button class="btn-lit btn-lit-fire btn-sm" data-add="100000">+100 000 🪙</button>
                    <button class="btn-lit btn-lit-gold btn-sm" data-add="1000000">+1 000 000 🪙</button>
                </div>
                <div class="admin-custom-chips-row">
                    <input type="number" class="input-lit" id="adminCustomChips" placeholder="Установить точный баланс..." />
                    <button class="btn-lit btn-lit-primary btn-sm" id="btnSetExactChips">ПРИМЕНИТЬ</button>
                    <button class="btn-lit btn-lit-danger btn-sm" id="btnResetChips">ОБНУЛИТЬ</button>
                </div>
            </div>

            <!-- 2. Luck & House Edge Manipulation -->
            <div class="admin-section">
                <div class="section-title">🎲 МОДИФИКАТОР УДАЧИ КАЗИНО</div>
                <div class="admin-btn-grid">
                    <button class="btn-lit ${this.luckMode === 'god' ? 'btn-lit-fire active-mode' : 'btn-lit-secondary'} btn-sm" id="btnLuckGod">
                        ⚡ РЕЖИМ БОГА (100% ПОБЕД)
                    </button>
                    <button class="btn-lit ${this.luckMode === 'fair' ? 'btn-lit-cyan active-mode' : 'btn-lit-secondary'} btn-sm" id="btnLuckFair">
                        ⚖ ЧЕСТНАЯ ИГРА (СТАНДАРТ)
                    </button>
                    <button class="btn-lit ${this.luckMode === 'drain' ? 'btn-lit-danger active-mode' : 'btn-lit-secondary'} btn-sm" id="btnLuckDrain">
                        😈 СЛИВНОЙ РЕЖИМ
                    </button>
                </div>
                <div class="admin-subtext">Текущий режим: <b>${this.luckMode.toUpperCase()}</b></div>
            </div>

            <!-- 3. Skins & Inventory Unlocker -->
            <div class="admin-section">
                <div class="section-title">🛍 ИНВЕНТАРЬ И МЕМНЫЕ ОБРАЗЫ</div>
                <button class="btn-lit btn-lit-gold" style="width: 100%;" id="btnUnlockAllSkins">
                    👑 ОТКРЫТЬ ВСЕ СКИНЫ И МЕМЫ СРАЗУ
                </button>
            </div>

            <!-- 4. Broadcast Announcement -->
            <div class="admin-section">
                <div class="section-title">📢 ГЛОБАЛЬНОЕ ОПОВЕЩЕНИЕ В ЧАТ СТОЛОВ</div>
                <div class="admin-custom-chips-row">
                    <input type="text" class="input-lit" id="adminBroadcastText" placeholder="Текст объявления от администрации..." />
                    <button class="btn-lit btn-lit-fire btn-sm" id="btnSendBroadcast">ОТПРАВИТЬ</button>
                </div>
            </div>

            <!-- 5. Reset & Exit -->
            <div class="admin-footer-row">
                <button class="btn-lit btn-lit-secondary btn-sm" id="btnAdminLogout">ВЫЙТИ ИЗ АДМИНКИ</button>
                <button class="btn-lit btn-lit-primary btn-sm" id="btnAdminCloseDone">ЗАКРЫТЬ ПАНЕЛЬ</button>
            </div>
        </div>
        `;

        modal.classList.add('modal-active');
        this.bindAdminDashboardEvents(modal);
    }

    bindAdminDashboardEvents(modal) {
        const closeAction = () => modal.classList.remove('modal-active');
        const btnX = modal.querySelector('#btnAdminCloseX');
        const btnDone = modal.querySelector('#btnAdminCloseDone');
        if (btnX) btnX.onclick = closeAction;
        if (btnDone) btnDone.onclick = closeAction;

        // Quick add chips
        modal.querySelectorAll('[data-add]').forEach(btn => {
            btn.onclick = () => {
                const add = parseInt(btn.getAttribute('data-add'), 10);
                this.giveChips(add);
                window.soundCtrl?.playWin();
                if (window.app) window.app.showNotification(`+${add.toLocaleString('ru-RU')} 🪙 успешно начислено!`);
                this.renderAdminModal();
            };
        });

        // Set exact chips
        const btnExact = modal.querySelector('#btnSetExactChips');
        const exactInput = modal.querySelector('#adminCustomChips');
        if (btnExact && exactInput) {
            btnExact.onclick = () => {
                const val = parseInt(exactInput.value, 10);
                if (!isNaN(val)) {
                    this.setChips(val);
                    window.soundCtrl?.playWin();
                    if (window.app) window.app.showNotification(`Баланс установлен на ${val.toLocaleString('ru-RU')} 🪙`);
                    this.renderAdminModal();
                }
            };
        }

        // Reset chips
        const btnReset = modal.querySelector('#btnResetChips');
        if (btnReset) {
            btnReset.onclick = () => {
                this.setChips(0);
                window.soundCtrl?.playLose();
                if (window.app) window.app.showNotification('Баланс обнулен!');
                this.renderAdminModal();
            };
        }

        // Luck Modes
        const btnGod = modal.querySelector('#btnLuckGod');
        const btnFair = modal.querySelector('#btnLuckFair');
        const btnDrain = modal.querySelector('#btnLuckDrain');

        if (btnGod) {
            btnGod.onclick = () => {
                this.setLuckMode('god');
                window.soundCtrl?.playWin();
                if (window.app) window.app.showNotification('🔥 РЕЖИМ БОГА АКТИВИРОВАН! 100% ПОБЕД!');
                this.renderAdminModal();
            };
        }

        if (btnFair) {
            btnFair.onclick = () => {
                this.setLuckMode('fair');
                window.soundCtrl?.playClick();
                if (window.app) window.app.showNotification('⚖ Честная игра установлена.');
                this.renderAdminModal();
            };
        }

        if (btnDrain) {
            btnDrain.onclick = () => {
                this.setLuckMode('drain');
                window.soundCtrl?.playLose();
                if (window.app) window.app.showNotification('😈 Сливной режим активирован.');
                this.renderAdminModal();
            };
        }

        // Unlock all skins
        const btnUnlock = modal.querySelector('#btnUnlockAllSkins');
        if (btnUnlock) {
            btnUnlock.onclick = () => {
                this.unlockAllItems();
                window.soundCtrl?.playWin();
                if (window.app) window.app.showNotification('👑 ВСЕ СКИНЫ И МЕМЫ УСПЕШНО РАЗБЛОКИРОВАНЫ!');
                this.renderAdminModal();
            };
        }

        // Broadcast announcement
        const btnBroadcast = modal.querySelector('#btnSendBroadcast');
        const broadcastInput = modal.querySelector('#adminBroadcastText');
        if (btnBroadcast && broadcastInput) {
            btnBroadcast.onclick = () => {
                const text = broadcastInput.value.trim();
                if (text) {
                    if (window.app && window.app.roomsManager) {
                        window.app.roomsManager.appendChatMessage('⚡ АДМИНИСТРАЦИЯ', text, 'system-msg');
                    }
                    window.soundCtrl?.playWin();
                    if (window.app) window.app.showNotification('📢 Объявление отправлено в чат!');
                    broadcastInput.value = '';
                }
            };
        }

        // Logout
        const btnLogout = modal.querySelector('#btnAdminLogout');
        if (btnLogout) {
            btnLogout.onclick = () => {
                this.logout();
                window.soundCtrl?.playClick();
                if (window.app) window.app.showNotification('Вы вышли из админ-панели.');
                closeAction();
            };
        }
    }
}

window.adminPanel = new AdminPanel();
