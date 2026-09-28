// Shop and Wardrobe Customization Engine

class ShopManager {
    constructor() {
        this.selectedCategory = 'all';
        this.previewItem = null;
    }

    renderShop(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = StorageManager.getUser() || { chips: 0, inventory: [], equipped: {} };
        const items = StorageManager.getShopItems();

        container.innerHTML = `
        <div class="shop-wrapper">
            <!-- Shop Banner & Live Character Fitting Room -->
            <div class="shop-fitting-room">
                <div class="fitting-avatar-display">
                    <div class="fitting-pedestal">
                        <div id="shopAvatarPreview" class="avatar-interactive-preview">
                            ${this.renderUserPreviewSVG(user, this.previewItem)}
                        </div>
                    </div>
                    <div class="fitting-character-name">
                        <span class="user-preview-nick">${user.nickname || 'Ваш персонаж'}</span>
                        <span class="user-preview-chips">Баланс: <b id="shopChipsLabel">${user.chips}</b> 🪙</span>
                    </div>
                </div>

                <div class="fitting-info-box">
                    <h2 class="retro-title">ГАРДЕРОБ & МЕМ-МАРКЕТ</h2>
                    <p class="retro-subtitle">Покупайте легендарные мемные костюмы, аксессуары и золотые скины за выигранные фишки!</p>
                    <div class="fitting-tip">💡 Нажмите на любой предмет, чтобы примерить его в примерочной.</div>
                </div>
            </div>

            <!-- Shop Category Filter Tabs -->
            <div class="shop-nav-tabs">
                <button class="shop-tab active" data-cat="all">ВСЁ (${items.length})</button>
                <button class="shop-tab" data-cat="costume">🔥 КОСТЮМЫ & МЕМЫ</button>
                <button class="shop-tab" data-cat="hat">👑 ШЛЯПЫ & КОРОНЫ</button>
                <button class="shop-tab" data-cat="glasses">🕶 ОЧКИ & ВИЗОРЫ</button>
                <button class="shop-tab" data-cat="accessory">💎 АКСЕССУАРЫ</button>
                <button class="shop-tab" data-cat="chipSkin">🪙 ФИШКИ</button>
            </div>

            <!-- Items Catalog Grid -->
            <div class="shop-items-grid" id="shopItemsContainer">
                ${this.renderItemsList(items, user)}
            </div>
        </div>
        `;

        this.bindShopEvents(container);
    }

    renderUserPreviewSVG(user, tempItem = null) {
        const base = {
            gender: user.gender || 'male',
            skin: user.skin || 'fair',
            hair: user.hair || 'black',
            hairStyle: user.hairStyle || 'short',
            costume: user.equipped?.costume || 'default',
            hat: user.equipped?.hat || null,
            glasses: user.equipped?.glasses || null,
            accessory: user.equipped?.accessory || null
        };

        if (tempItem) {
            if (tempItem.category === 'costume') base.costume = tempItem.id;
            if (tempItem.category === 'hat') base.hat = tempItem.id;
            if (tempItem.category === 'glasses') base.glasses = tempItem.id;
            if (tempItem.category === 'accessory') base.accessory = tempItem.id;
        }

        return AvatarRenderer.renderSVG(base, 110);
    }

    renderItemsList(items, user) {
        return items.map(item => {
            const isOwned = user.inventory?.includes(item.id);
            const isEquipped = this.isItemEquipped(user, item);
            const canAfford = user.chips >= item.price;

            // Generate miniature item icon preview
            const previewConfig = {
                gender: 'male',
                skin: 'fair',
                hair: 'black',
                hairStyle: 'short'
            };
            if (item.category === 'costume') previewConfig.costume = item.id;
            if (item.category === 'hat') previewConfig.hat = item.id;
            if (item.category === 'glasses') previewConfig.glasses = item.id;
            if (item.category === 'accessory') previewConfig.accessory = item.id;

            return `
            <div class="shop-item-card ${isEquipped ? 'item-equipped' : ''}" data-cat="${item.category}" data-id="${item.id}">
                <div class="item-card-header">
                    <span class="item-badge badge-${item.badge.toLowerCase()}">${item.badge}</span>
                    <span class="item-price-tag ${isOwned ? 'price-owned' : ''}">
                        ${isOwned ? 'КУПЛЕНО' : `${item.price} 🪙`}
                    </span>
                </div>

                <div class="item-avatar-icon">
                    ${AvatarRenderer.renderSVG(previewConfig, 64)}
                </div>

                <div class="item-details">
                    <div class="item-title">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>

                <div class="item-card-actions">
                    <button class="btn-pixel btn-sm btn-secondary btn-preview-item" data-id="${item.id}">👀 ПРИМЕРИТЬ</button>
                    ${isOwned ? `
                        ${isEquipped ? `
                            <button class="btn-pixel btn-sm btn-warning btn-unequip-item" data-id="${item.id}" data-cat="${item.category}">СНЯТЬ</button>
                        ` : `
                            <button class="btn-pixel btn-sm btn-success btn-equip-item" data-id="${item.id}">НАДЕТЬ</button>
                        `}
                    ` : `
                        <button class="btn-pixel btn-sm btn-primary btn-buy-item ${!canAfford ? 'btn-disabled' : ''}" data-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
                            КУПИТЬ
                        </button>
                    `}
                </div>
            </div>
            `;
        }).join('');
    }

    isItemEquipped(user, item) {
        if (!user.equipped) return false;
        return (
            user.equipped.costume === item.id ||
            user.equipped.hat === item.id ||
            user.equipped.glasses === item.id ||
            user.equipped.accessory === item.id ||
            user.equipped.chipSkin === item.id
        );
    }

    bindShopEvents(container) {
        // Category Tabs
        container.querySelectorAll('.shop-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const cat = tab.getAttribute('data-cat');
                this.selectedCategory = cat;

                container.querySelectorAll('.shop-item-card').forEach(card => {
                    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                window.soundCtrl?.playClick();
            };
        });

        // Preview item
        container.querySelectorAll('.btn-preview-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const item = StorageManager.getShopItems().find(i => i.id === id);
                if (item) {
                    this.previewItem = item;
                    const previewBox = container.querySelector('#shopAvatarPreview');
                    const user = StorageManager.getUser();
                    if (previewBox && user) {
                        previewBox.innerHTML = this.renderUserPreviewSVG(user, item);
                    }
                    window.soundCtrl?.playClick();
                }
            };
        });

        // Buy item
        container.querySelectorAll('.btn-buy-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const res = StorageManager.buyItem(id);
                if (res.success) {
                    window.soundCtrl?.playBuy();
                    if (window.app) {
                        window.app.showNotification(`🎉 Поздравляем! Вы приобрели: ${res.item.name}!`);
                        window.app.updateHeaderUser();
                    }
                    this.renderShop('screenShop');
                } else {
                    window.soundCtrl?.playLose();
                    if (window.app) window.app.showNotification(res.message, 'error');
                }
            };
        });

        // Equip item
        container.querySelectorAll('.btn-equip-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                StorageManager.equipItem(id);
                window.soundCtrl?.playClick();
                if (window.app) {
                    window.app.updateHeaderUser();
                    window.app.showNotification('Предмет надет!');
                }
                this.renderShop('screenShop');
            };
        });

        // Unequip item
        container.querySelectorAll('.btn-unequip-item').forEach(btn => {
            btn.onclick = () => {
                const cat = btn.getAttribute('data-cat');
                StorageManager.unequipSlot(cat);
                window.soundCtrl?.playClick();
                if (window.app) {
                    window.app.updateHeaderUser();
                    window.app.showNotification('Предмет снят.');
                }
                this.renderShop('screenShop');
            };
        });
    }
}

window.ShopManager = ShopManager;
