// Storage & State Manager for LIT CASINO (Lit Energy Style)

const STORAGE_KEYS = {
    USER: 'lit_casino_user',
    ROOMS: 'lit_casino_rooms',
    LEADERBOARD: 'lit_casino_leaderboard',
    LAST_BONUS: 'lit_casino_last_bonus'
};

const DEFAULT_SHOP_ITEMS = [
    {
        id: 'zubenko',
        name: 'Зубенко Михаил Петрович',
        category: 'costume',
        price: 500,
        badge: 'MEME VIP',
        desc: '«Вор в законе, шумим братец!» Стильный костюм в тонкую полоску, шелковый галстук и золотые четки.'
    },
    {
        id: 'ivanzolo',
        name: 'Иван Золо 2004',
        category: 'costume',
        price: 450,
        badge: 'TIKTOK',
        desc: 'Фирменное ярко-красное поло Lit Edition, проводные наушники с микрофоном и стримерский вайб.'
    },
    {
        id: 'brigada',
        name: 'Саша Белый (Бригада)',
        category: 'costume',
        price: 400,
        badge: 'BRIGADA',
        desc: 'Брутальный кожаный плащ из 90-х, строгий силуэт и авторитет главного босса.'
    },
    {
        id: 'sheikh',
        name: 'Дубайский Шейх',
        category: 'costume',
        price: 777,
        badge: 'EXCLUSIVE',
        desc: 'Белоснежная куфия, золотой агаль, часы Rolex и атмосфера неограниченной роскоши.'
    },
    {
        id: 'lit_energy',
        name: 'Lit Energy Edition',
        category: 'costume',
        price: 350,
        badge: 'FLAME',
        desc: 'Оригинальный черный худи с огненной неоновой молнией Lit Energy и светящимся кантом.'
    },
    {
        id: 'cyberpunk',
        name: 'Кибер Неон 2077',
        category: 'costume',
        price: 600,
        badge: 'NEO',
        desc: 'Неоновый голографический визор с подсветкой и кибернетическая куртка.'
    },
    {
        id: 'crown',
        name: 'Золотая Корона Казино',
        category: 'hat',
        price: 800,
        badge: 'ROYAL',
        desc: 'Корона из белого и желтого золота с крупными рубинами для короля азарта.'
    },
    {
        id: 'top_hat',
        name: 'Цилиндр Аристократа',
        category: 'hat',
        price: 150,
        badge: 'CLASSIC',
        desc: 'Элегантный черный цилиндр с алой шелковой лентой.'
    },
    {
        id: 'gangster_fedora',
        name: 'Гангстерская Федора',
        category: 'hat',
        price: 220,
        badge: 'MAFIA',
        desc: 'Классическая фетровая шляпа итальянской мафии.'
    },
    {
        id: 'deal_with_it',
        name: 'Очки «Deal With It»',
        category: 'glasses',
        price: 200,
        badge: 'SWAG',
        desc: 'Культовые темные очки для уверенных побед за столом.'
    },
    {
        id: 'aviator',
        name: 'Золотые Авиаторы',
        category: 'glasses',
        price: 180,
        badge: 'LUXURY',
        desc: 'Премиальные очки капли в оправе из полированного золота.'
    },
    {
        id: 'gold_chain',
        name: 'Золотая Цепь Dollar $',
        category: 'accessory',
        price: 250,
        badge: 'ICE',
        desc: 'Тяжелая массивная золотая цепь с сияющим медальоном доллара.'
    },
    {
        id: 'cigar',
        name: 'Кубинская Сигара',
        category: 'accessory',
        price: 120,
        badge: 'BOSS',
        desc: 'Элитная сигара с настоящим клубящимся дымком.'
    },
    {
        id: 'gold_chips',
        name: 'VIP Золотые Фишки',
        category: 'chipSkin',
        price: 300,
        badge: 'SKIN',
        desc: 'Эксклюзивный золотой блеск с гравировкой Lit Energy для всех фишек на столе.'
    }
];

const INITIAL_BOTS = [
    {
        id: 'bot_zubenko',
        nickname: 'Зубенко_М_П',
        chips: 18500,
        wins: 164,
        avatar: { gender: 'male', skin: 'medium', hair: 'black', costume: 'zubenko' }
    },
    {
        id: 'bot_ivanzolo',
        nickname: 'Ivan_Zolo_2004',
        chips: 12300,
        wins: 108,
        avatar: { gender: 'male', skin: 'fair', hair: 'brown', costume: 'ivanzolo' }
    },
    {
        id: 'bot_sheikh',
        nickname: 'Sheikh_Hamdan',
        chips: 9800,
        wins: 89,
        avatar: { gender: 'male', skin: 'medium', hair: 'black', costume: 'sheikh' }
    },
    {
        id: 'bot_litvin',
        nickname: 'Mikhail_Litvin',
        chips: 8400,
        wins: 82,
        avatar: { gender: 'male', skin: 'fair', hair: 'brown', costume: 'lit_energy' }
    },
    {
        id: 'bot_brigada',
        nickname: 'Саша_Белый',
        chips: 6200,
        wins: 65,
        avatar: { gender: 'male', skin: 'fair', hair: 'black', costume: 'brigada' }
    },
    {
        id: 'bot_queen',
        nickname: 'Lit_Queen',
        chips: 4100,
        wins: 48,
        avatar: { gender: 'female', skin: 'fair', hair: 'blonde', hat: 'crown' }
    }
];

const INITIAL_ROOMS = [
    {
        id: 'room_1',
        name: 'VIP Клуб Зубенко',
        game: 'blackjack',
        minBet: 50,
        maxPlayers: 4,
        playersCount: 3,
        status: 'playing',
        players: [
            { nickname: 'Зубенко_М_П', chips: 18500, avatar: { costume: 'zubenko' } },
            { nickname: 'Mikhail_Litvin', chips: 8400, avatar: { costume: 'lit_energy' } },
            { nickname: 'Vegas_Ace', chips: 3200, avatar: { glasses: 'deal_with_it' } }
        ]
    },
    {
        id: 'room_2',
        name: 'Lit Energy Стрим Ивана Золо',
        game: 'roulette',
        minBet: 25,
        maxPlayers: 6,
        playersCount: 4,
        status: 'betting',
        players: [
            { nickname: 'Ivan_Zolo_2004', chips: 12300, avatar: { costume: 'ivanzolo' } },
            { nickname: 'TikTok_Star', chips: 1200, avatar: { hairStyle: 'undercut' } },
            { nickname: 'Meme_Lord', chips: 2100, avatar: { accessory: 'gold_chain' } },
            { nickname: 'Cyber_Boy', chips: 950, avatar: { costume: 'cyberpunk' } }
        ]
    },
    {
        id: 'room_3',
        name: 'Золотое 21 Дубая',
        game: 'blackjack',
        minBet: 100,
        maxPlayers: 4,
        playersCount: 2,
        status: 'betting',
        players: [
            { nickname: 'Sheikh_Hamdan', chips: 9800, avatar: { costume: 'sheikh' } },
            { nickname: 'Саша_Белый', chips: 6200, avatar: { costume: 'brigada' } }
        ]
    },
    {
        id: 'room_4',
        name: 'Рулетка Энергии КПД',
        game: 'roulette',
        minBet: 25,
        maxPlayers: 5,
        playersCount: 2,
        status: 'betting',
        players: [
            { nickname: 'Lit_Queen', chips: 4100, avatar: { hat: 'crown' } },
            { nickname: 'Energy_Fan', chips: 1500, avatar: { costume: 'lit_energy' } }
        ]
    }
];

class StorageManager {
    static getUser() {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    static saveUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        this.broadcastSync('user_updated', user);
    }

    static createUser(profile) {
        const newUser = {
            id: 'user_' + Date.now(),
            nickname: profile.nickname || 'Капер',
            chips: 300, // 300 стартовых фишек
            gender: profile.gender || 'male',
            skin: profile.skin || 'fair',
            hair: profile.hair || 'black',
            hairStyle: profile.hairStyle || 'fade',
            equipped: {
                costume: 'default',
                hat: null,
                glasses: null,
                accessory: null,
                chipSkin: 'classic'
            },
            inventory: ['default_outfit'],
            stats: {
                gamesPlayed: 0,
                wins: 0,
                biggestWin: 0,
                blackjackWins: 0,
                rouletteWins: 0
            },
            registeredAt: Date.now()
        };
        this.saveUser(newUser);
        return newUser;
    }

    static updateChips(delta) {
        const user = this.getUser();
        if (!user) return 0;
        user.chips = Math.max(0, user.chips + delta);
        if (delta > 0 && delta > (user.stats.biggestWin || 0)) {
            user.stats.biggestWin = delta;
        }
        this.saveUser(user);
        return user.chips;
    }

    static getShopItems() {
        return DEFAULT_SHOP_ITEMS;
    }

    static buyItem(itemId) {
        const user = this.getUser();
        if (!user) return { success: false, message: 'Профиль не найден' };

        const item = DEFAULT_SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return { success: false, message: 'Товар не найден' };

        if (user.inventory.includes(itemId)) {
            return { success: false, message: 'Предмет уже куплен' };
        }

        if (user.chips < item.price) {
            return { success: false, message: `Недостаточно фишек! Нужно: ${item.price}, у вас: ${user.chips}` };
        }

        user.chips -= item.price;
        user.inventory.push(itemId);
        this.equipItemOnUser(user, item);
        this.saveUser(user);

        return { success: true, item, newBalance: user.chips };
    }

    static equipItem(itemId) {
        const user = this.getUser();
        if (!user) return false;
        const item = DEFAULT_SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return false;
        this.equipItemOnUser(user, item);
        this.saveUser(user);
        return true;
    }

    static unequipSlot(slot) {
        const user = this.getUser();
        if (!user) return false;
        if (slot === 'costume') user.equipped.costume = 'default';
        else if (slot === 'chipSkin') user.equipped.chipSkin = 'classic';
        else user.equipped[slot] = null;
        this.saveUser(user);
        return true;
    }

    static equipItemOnUser(user, item) {
        if (!user.equipped) user.equipped = {};
        if (item.category === 'costume') {
            user.equipped.costume = item.id;
        } else if (item.category === 'hat') {
            user.equipped.hat = item.id;
        } else if (item.category === 'glasses') {
            user.equipped.glasses = item.id;
        } else if (item.category === 'accessory') {
            user.equipped.accessory = item.id;
        } else if (item.category === 'chipSkin') {
            user.equipped.chipSkin = item.id;
        }
    }

    static claimDailyBonus() {
        const user = this.getUser();
        if (!user) return { success: false, message: 'Пользователь не найден' };

        const lastBonus = localStorage.getItem(STORAGE_KEYS.LAST_BONUS);
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (lastBonus && (now - parseInt(lastBonus, 10)) < cooldown) {
            const timeLeft = cooldown - (now - parseInt(lastBonus, 10));
            const hours = Math.ceil(timeLeft / (1000 * 60 * 60));
            return { success: false, message: `Бонус уже получен! До следующего: ${hours} ч.` };
        }

        const bonus = 100;
        user.chips += bonus;
        localStorage.setItem(STORAGE_KEYS.LAST_BONUS, now.toString());
        this.saveUser(user);
        return { success: true, bonus, balance: user.chips };
    }

    static claimBailout() {
        const user = this.getUser();
        if (!user) return { success: false, message: 'Ошибка' };
        if (user.chips >= 10) {
            return { success: false, message: 'Подгон доступен только при балансе меньше 10 фишек!' };
        }

        const grant = 50;
        user.chips += grant;
        this.saveUser(user);
        return { success: true, grant, balance: user.chips, message: 'Казино выдало вам 50 фишек от заведения!' };
    }

    static getRooms() {
        const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
        if (!raw) {
            localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
            return INITIAL_ROOMS;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return INITIAL_ROOMS;
        }
    }

    static saveRooms(rooms) {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
        this.broadcastSync('rooms_updated', rooms);
    }

    static createRoom(roomData) {
        const rooms = this.getRooms();
        const user = this.getUser();
        const newRoom = {
            id: 'room_' + Date.now(),
            name: roomData.name || 'Стол ' + (rooms.length + 1),
            game: roomData.game || 'blackjack',
            minBet: parseInt(roomData.minBet, 10) || 25,
            maxPlayers: parseInt(roomData.maxPlayers, 10) || 4,
            playersCount: 1,
            status: 'betting',
            hostId: user ? user.id : 'host',
            players: [
                {
                    id: user ? user.id : 'player',
                    nickname: user ? user.nickname : 'Вы',
                    chips: user ? user.chips : 300,
                    avatar: user ? {
                        gender: user.gender,
                        skin: user.skin,
                        hair: user.hair,
                        hairStyle: user.hairStyle,
                        costume: user.equipped.costume,
                        hat: user.equipped.hat,
                        glasses: user.equipped.glasses,
                        accessory: user.equipped.accessory
                    } : {}
                }
            ]
        };
        rooms.unshift(newRoom);
        this.saveRooms(rooms);
        return newRoom;
    }

    static getLeaderboard() {
        const user = this.getUser();
        let list = [...INITIAL_BOTS];
        if (user) {
            list.push({
                id: user.id,
                nickname: user.nickname,
                chips: user.chips,
                wins: user.stats.wins || 0,
                isCurrentPlayer: true,
                avatar: {
                    gender: user.gender,
                    skin: user.skin,
                    hair: user.hair,
                    hairStyle: user.hairStyle,
                    costume: user.equipped?.costume,
                    hat: user.equipped?.hat,
                    glasses: user.equipped?.glasses,
                    accessory: user.equipped?.accessory
                }
            });
        }

        list.sort((a, b) => b.chips - a.chips);
        return list;
    }

    static broadcastSync(action, payload) {
        try {
            if ('BroadcastChannel' in window) {
                if (!this.bc) this.bc = new BroadcastChannel('lit_casino_sync');
                this.bc.postMessage({ action, payload, time: Date.now() });
            }
        } catch (e) {}
    }
}

window.StorageManager = StorageManager;
