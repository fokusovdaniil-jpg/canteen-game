// Modern Lit Energy Shop & Wardrobe Customization Engine with Realistic Assets

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
            <!-- Shop Banner & Live Fitting Room -->
            <div class="shop-fitting-room">
                <div class="fitting-avatar-display">
                    <div class="fitting-pedestal">
                        <div id="shopAvatarPreview" class="avatar-interactive-preview">
                            ${this.renderUserPreview(user, this.previewItem)}
                        </div>
                    </div>
                    <div class="fitting-character-name">
                        <span class="user-preview-nick">${user.nickname || 'Ваш персонаж'}</span>
                        <span class="user-preview-chips">Баланс: <b id="shopChipsLabel">${user.chips.toLocaleString('ru-RU')}</b> 🪙</span>
                    </div>
                </div>

                <div class="fitting-info-box">
                    <span class="lit-badge-fire">⚡ VIP WARDROBE & MEMES</span>
                    <h2 class="lit-title">ГАРДЕРОБ & МЕМ-МАРКЕТ</h2>
                    <p class="lit-subtitle">Приобретайте легендарные мемные образы, брендовые худи и золотые скины за фишки!</p>
                    <div class="fitting-tip">💡 Нажмите «Примерить» на любом предмете, чтобы увидеть персонажа в примерочной.</div>
                </div>
            </div>

            <!-- Shop Category Filter Tabs -->
            <div class="shop-nav-tabs">
                <button class="shop-tab active" data-cat="all">ВСЁ (${items.length})</button>
                <button class="shop-tab" data-cat="costume">🔥 КОСТЮМЫ & МЕМЫ</button>
                <button class="shop-tab" data-cat="hat">👑 ГОЛОВНЫЕ УБОРЫ</button>
                <button class="shop-tab" data-cat="glasses">🕶 ОЧКИ</button>
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

    renderUserPreview(user, tempItem = null) {
        const base = {
            gender: user.gender || 'male',
            skin: user.skin || 'fair',
            hair: user.hair || 'black',
            hairStyle: user.hairStyle || 'fade',
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

        return AvatarRenderer.renderSVG(base, 115);
    }

    renderItemsList(items, user) {
        return items.map(item => {
            const isOwned = user.inventory?.includes(item.id);
            const isEquipped = this.isItemEquipped(user, item);
            const canAfford = user.chips >= item.price;

            // Render miniature icon
            let iconHTML = '';
            if (REALISTIC_SKIN_IMAGES[item.id]) {
                iconHTML = `
                <div style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; position: relative; border: 2px solid #ff5500; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
                    <img src="${REALISTIC_SKIN_IMAGES[item.id]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block;" />
                </div>
                `;
            } else {
                const previewConfig = {
                    gender: 'male',
                    skin: 'fair',
                    hair: 'black',
                    hairStyle: 'fade'
                };
                if (item.category === 'costume') previewConfig.costume = item.id;
                if (item.category === 'hat') previewConfig.hat = item.id;
                if (item.category === 'glasses') previewConfig.glasses = item.id;
                if (item.category === 'accessory') previewConfig.accessory = item.id;
                iconHTML = AvatarRenderer.renderSVG(previewConfig, 72);
            }

            return `
            <div class="shop-item-card ${isEquipped ? 'item-equipped' : ''}" data-cat="${item.category}" data-id="${item.id}">
                <div class="item-card-header">
                    <span class="item-badge badge-${item.badge.toLowerCase().replace(/[^a-z0-9]/g, '')}">${item.badge}</span>
                    <span class="item-price-tag ${isOwned ? 'price-owned' : ''}">
                        ${isOwned ? 'КУПЛЕНО' : `${item.price.toLocaleString('ru-RU')} 🪙`}
                    </span>
                </div>

                <div class="item-avatar-icon">
                    ${iconHTML}
                </div>

                <div class="item-details">
                    <div class="item-title">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>

                <div class="item-card-actions">
                    <button class="btn-lit btn-lit-secondary btn-sm btn-preview-item" data-id="${item.id}">👀 ПРИМЕРИТЬ</button>
                    ${isOwned ? `
                        ${isEquipped ? `
                            <button class="btn-lit btn-lit-danger btn-sm btn-unequip-item" data-id="${item.id}" data-cat="${item.category}">СНЯТЬ</button>
                        ` : `
                            <button class="btn-lit btn-lit-primary btn-sm btn-equip-item" data-id="${item.id}">НАДЕТЬ</button>
                        `}
                    ` : `
                        <button class="btn-lit btn-lit-fire btn-sm btn-buy-item ${!canAfford ? 'btn-disabled' : ''}" data-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
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

        container.querySelectorAll('.btn-preview-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const item = StorageManager.getShopItems().find(i => i.id === id);
                if (item) {
                    this.previewItem = item;
                    const previewBox = container.querySelector('#shopAvatarPreview');
                    const user = StorageManager.getUser();
                    if (previewBox && user) {
                        previewBox.innerHTML = this.renderUserPreview(user, item);
                    }
                    window.soundCtrl?.playClick();
                }
            };
        });

        container.querySelectorAll('.btn-buy-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const res = StorageManager.buyItem(id);
                if (res.success) {
                    window.soundCtrl?.playBuy();
                    if (window.app) {
                        window.app.showNotification(`🎉 Вы приобрели: ${res.item.name}!`);
                        window.app.updateHeaderUser();
                    }
                    this.renderShop('screenShop');
                } else {
                    window.soundCtrl?.playLose();
                    if (window.app) window.app.showNotification(res.message, 'error');
                }
            };
        });

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
