// Crisp Pixel Art Avatar Engine for Retro Casino
// Generates layered retro pixel avatars with meme costumes and accessories

const AVATAR_PALETTES = {
    skin: {
        fair: '#ffd1b3',
        medium: '#d89b72',
        tan: '#b57448',
        dark: '#693c1f'
    },
    skinShadow: {
        fair: '#e8b291',
        medium: '#ba7b53',
        tan: '#8c522e',
        dark: '#452410'
    },
    hair: {
        black: '#1a1a1a',
        brown: '#4d2b12',
        blonde: '#e6c86e',
        red: '#a93b1d',
        grey: '#8a929a',
        neon: '#00ffcc'
    }
};

class AvatarRenderer {
    static getPresets() {
        return [
            { id: 'guy_fair', gender: 'male', skin: 'fair', hair: 'black', hairStyle: 'short', name: 'Парень (Светлый)' },
            { id: 'guy_tan', gender: 'male', skin: 'tan', hair: 'brown', hairStyle: 'fade', name: 'Парень (Смуглый)' },
            { id: 'guy_dark', gender: 'male', skin: 'dark', hair: 'black', hairStyle: 'buzz', name: 'Парень (Темный)' },
            { id: 'girl_fair', gender: 'female', skin: 'fair', hair: 'blonde', hairStyle: 'long', name: 'Девушка (Светлая)' },
            { id: 'girl_tan', gender: 'female', skin: 'medium', hair: 'brown', hairStyle: 'ponytail', name: 'Девушка (Русая)' },
            { id: 'girl_dark', gender: 'female', skin: 'dark', hair: 'black', hairStyle: 'curls', name: 'Девушка (Темная)' }
        ];
    }

    /**
     * Renders a pixel art avatar as an SVG string.
     * @param {Object} config - { gender, skin, hair, hairStyle, costume, hat, glasses, accessory }
     * @param {number} size - pixel size (e.g. 64, 120, 180)
     */
    static renderSVG(config = {}, size = 96) {
        const skinKey = config.skin || 'fair';
        const skinColor = AVATAR_PALETTES.skin[skinKey] || AVATAR_PALETTES.skin.fair;
        const skinShadow = AVATAR_PALETTES.skinShadow[skinKey] || AVATAR_PALETTES.skinShadow.fair;
        const hairColor = AVATAR_PALETTES.hair[config.hair || 'black'] || AVATAR_PALETTES.hair.black;
        const gender = config.gender || 'male';
        const hairStyle = config.hairStyle || 'short';
        const costume = config.costume || 'default_tshirt';
        const hat = config.hat || null;
        const glasses = config.glasses || null;
        const accessory = config.accessory || null;

        // Grid is 24x24 pixel art
        let rects = [];

        function p(x, y, w, h, fill) {
            rects.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" />`);
        }

        // --- 1. BODY / CLOTHING ---
        if (costume === 'zubenko') {
            // Зубенко Михаил Петрович: полосатый пиджак вора в законе + белая рубашка + золотые четки
            p(6, 15, 12, 9, '#2a2f35'); // пиджак темный
            p(7, 15, 1, 9, '#555f6d'); // полоска
            p(9, 15, 1, 9, '#555f6d'); // полоска
            p(14, 15, 1, 9, '#555f6d'); // полоска
            p(16, 15, 1, 9, '#555f6d'); // полоска
            p(10, 15, 4, 6, '#ffffff'); // белая рубашка
            p(11, 16, 2, 4, '#b30000'); // темно-красный галстук
            p(11, 19, 2, 3, '#ffd700'); // золотая печатка/четки в руках
            // руки
            p(4, 16, 2, 6, '#2a2f35');
            p(18, 16, 2, 6, '#2a2f35');
            p(4, 22, 2, 2, skinColor);
            p(18, 22, 2, 2, skinColor);
        } else if (costume === 'ivanzolo') {
            // Иван Золо: фирменное ярко-красное поло с белым воротником
            p(6, 15, 12, 9, '#d91424'); // красное поло
            p(10, 14, 4, 3, '#ffffff'); // белый воротник
            p(11, 16, 2, 2, '#9e0d19'); // пуговицы
            p(4, 16, 2, 6, '#d91424');
            p(18, 16, 2, 6, '#d91424');
            p(4, 22, 2, 2, skinColor);
            p(18, 22, 2, 2, skinColor);
        } else if (costume === 'brigada') {
            // Саша Белый: черный кожаный длинный плащ 90-х
            p(5, 15, 14, 9, '#18181b');
            p(10, 15, 4, 5, '#3b4252'); // темный свитер под плащом
            p(9, 15, 2, 8, '#27272a'); // лацкан
            p(13, 15, 2, 8, '#27272a');
            p(4, 16, 2, 7, '#18181b');
            p(18, 16, 2, 7, '#18181b');
            p(4, 23, 2, 1, skinColor);
            p(18, 23, 2, 1, skinColor);
        } else if (costume === 'sheikh') {
            // Арабский Шейх: белоснежный канджар / тхауб
            p(6, 15, 12, 9, '#f8fafc');
            p(10, 15, 4, 8, '#e2e8f0');
            p(11, 15, 2, 8, '#ffd700'); // золотая вышивка
            p(4, 16, 2, 7, '#f8fafc');
            p(18, 16, 2, 7, '#f8fafc');
            p(4, 22, 2, 2, '#ffd700'); // золотые часы
            p(18, 22, 2, 2, skinColor);
        } else if (costume === 'cyberpunk') {
            // Киберпанк: неоновая куртка с подсветкой
            p(6, 15, 12, 9, '#090d16');
            p(6, 15, 1, 9, '#00f3ff'); // неоновый кант
            p(17, 15, 1, 9, '#00f3ff');
            p(10, 15, 4, 7, '#ff007f'); // неоновый топ
            p(4, 16, 2, 6, '#1a1f2c');
            p(18, 16, 2, 6, '#1a1f2c');
            p(4, 22, 2, 2, skinColor);
            p(18, 22, 2, 2, skinColor);
        } else if (costume === 'psp_gamer') {
            // Ретро геймер: фиолетовый худи + PSP в руках
            p(6, 15, 12, 9, '#582d82');
            p(10, 15, 4, 4, '#7a42b0'); // капюшон/карман
            p(4, 16, 3, 5, '#582d82');
            p(17, 16, 3, 5, '#582d82');
            // PSP в руках:
            p(8, 20, 8, 3, '#111111'); // черная PSP
            p(10, 20, 4, 3, '#00e5ff'); // экранчик светящийся
            p(7, 21, 2, 2, skinColor); // руки держат
            p(15, 21, 2, 2, skinColor);
        } else {
            // Default Casual Shirt / Top
            const shirtColor = gender === 'female' ? '#9333ea' : '#1e3a8a';
            p(6, 15, 12, 9, shirtColor);
            p(10, 14, 4, 3, skinColor); // шея
            p(4, 16, 2, 6, shirtColor);
            p(18, 16, 2, 6, shirtColor);
            p(4, 22, 2, 2, skinColor);
            p(18, 22, 2, 2, skinColor);
        }

        // --- 2. HEAD & FACE BASE ---
        p(8, 7, 8, 8, skinColor); // лицо
        p(8, 13, 8, 2, skinShadow); // тень подбородка
        // Уши
        p(7, 9, 1, 3, skinColor);
        p(16, 9, 1, 3, skinColor);

        // Глаза
        p(9, 10, 2, 2, '#ffffff');
        p(10, 10, 1, 2, '#1e293b'); // зрачок
        p(13, 10, 2, 2, '#ffffff');
        p(14, 10, 1, 2, '#1e293b'); // зрачок

        // Рот / Улыбка
        p(11, 13, 2, 1, '#b91c1c');

        // Румяна для девушек
        if (gender === 'female') {
            p(8, 11, 2, 1, '#f472b6');
            p(14, 11, 2, 1, '#f472b6');
        }

        // --- 3. HAIR & BASE HEADWEAR ---
        if (costume === 'ivanzolo') {
            // Фирменная челка и стрижка Ивана Золо + проводные наушники с микрофоном!
            p(7, 5, 10, 3, '#26170d');
            p(8, 8, 8, 2, '#26170d'); // прямая челка
            p(6, 8, 2, 4, '#1c1917'); // виски
            p(16, 8, 2, 4, '#1c1917');
            // Проводные наушники-гарнитура:
            p(6, 9, 2, 3, '#ffffff'); // наушник слева
            p(16, 9, 2, 3, '#ffffff'); // наушник справа
            p(7, 5, 10, 1, '#e2e8f0'); // оголовье наушников
            p(14, 12, 3, 1, '#000000'); // микрофон гарнитуры у рта
        } else if (costume === 'sheikh') {
            // Белая куфия с черным агалем
            p(6, 4, 12, 3, '#ffffff');
            p(6, 6, 12, 1, '#111111'); // черный двойной жгут (агаль)
            p(6, 7, 2, 8, '#ffffff');  // ниспадающая ткань слева
            p(16, 7, 2, 8, '#ffffff'); // ниспадающая ткань справа
        } else {
            // Стандартные прически
            if (hairStyle === 'short') {
                p(8, 5, 8, 3, hairColor);
                p(7, 6, 2, 3, hairColor);
                p(8, 7, 8, 1, hairColor);
            } else if (hairStyle === 'fade') {
                p(8, 4, 8, 3, hairColor);
                p(8, 7, 8, 1, hairColor);
                p(7, 7, 1, 2, hairColor);
                p(16, 7, 1, 2, hairColor);
            } else if (hairStyle === 'long') {
                p(7, 5, 10, 3, hairColor);
                p(6, 7, 2, 9, hairColor);
                p(16, 7, 2, 9, hairColor);
                p(8, 7, 8, 1, hairColor);
            } else if (hairStyle === 'ponytail') {
                p(7, 5, 10, 3, hairColor);
                p(6, 7, 2, 6, hairColor);
                p(16, 7, 2, 6, hairColor);
                p(17, 3, 3, 5, hairColor); // хвостик
            } else if (hairStyle === 'buzz') {
                p(8, 6, 8, 2, hairColor);
            } else {
                p(7, 5, 10, 3, hairColor);
                p(8, 7, 8, 1, hairColor);
            }
        }

        // --- 4. HATS & COSTUME HEADWEAR ---
        if (costume === 'zubenko' || hat === 'zubenko_cap') {
            // Зубенко Михаил Петрович: кепка-восьмиклинка (хулиганка)
            p(6, 4, 12, 3, '#374151');
            p(5, 6, 14, 2, '#4b5563');
            p(6, 7, 12, 1, '#1f2937'); // козырек
            p(11, 3, 2, 1, '#111827'); // пуговица на кепке
        } else if (hat === 'crown') {
            // Золотая корона казино с рубинами
            p(7, 2, 10, 4, '#eab308');
            p(7, 2, 2, 3, '#facc15');
            p(11, 1, 2, 4, '#facc15');
            p(15, 2, 2, 3, '#facc15');
            p(9, 3, 1, 1, '#dc2626'); // рубин
            p(11, 2, 2, 1, '#2563eb'); // сапфир
            p(14, 3, 1, 1, '#dc2626');
        } else if (hat === 'top_hat') {
            // Джентльменский цилиндр
            p(9, 1, 6, 5, '#18181b');
            p(9, 5, 6, 1, '#dc2626'); // красная лента
            p(6, 6, 12, 1, '#27272a'); // поля
        } else if (hat === 'gangster_fedora') {
            // Гангстерская шляпа
            p(7, 3, 10, 3, '#1f2937');
            p(7, 5, 10, 1, '#ffffff'); // белая лента
            p(5, 6, 14, 1, '#111827'); // поля шляпы
        }

        // --- 5. GLASSES & VISORS ---
        if (costume === 'cyberpunk' || glasses === 'cyber_visor') {
            // Неоновый кибер-визор
            p(8, 9, 8, 3, '#00f3ff');
            p(9, 10, 6, 1, '#ffffff');
            p(7, 9, 1, 1, '#00bcd4');
            p(16, 9, 1, 1, '#00bcd4');
        } else if (glasses === 'deal_with_it') {
            // Очки "Deal With It"
            p(8, 9, 8, 3, '#000000');
            p(9, 9, 1, 1, '#ffffff');
            p(13, 9, 1, 1, '#ffffff');
        } else if (glasses === 'aviator') {
            // Золотые авиаторы
            p(8, 9, 3, 3, '#334155');
            p(13, 9, 3, 3, '#334155');
            p(11, 9, 2, 1, '#eab308'); // дужка
            p(7, 9, 1, 1, '#eab308');
            p(16, 9, 1, 1, '#eab308');
        }

        // --- 6. ACCESSORIES ---
        if (accessory === 'cigar') {
            // Гаванская сигара с дымком
            p(13, 13, 4, 1, '#78350f');
            p(17, 13, 1, 1, '#ef4444'); // уголек
            p(18, 12, 1, 1, '#cbd5e1'); // дым
            p(19, 11, 1, 1, '#94a3b8');
        } else if (accessory === 'gold_chain') {
            // Массивная золотая цепь
            p(9, 15, 6, 1, '#facc15');
            p(10, 16, 4, 1, '#eab308');
            p(11, 17, 2, 2, '#ca8a04'); // медальон / доллар
        }

        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" style="shape-rendering: crispEdges; image-rendering: pixelated; display: block;">
            <rect width="24" height="24" fill="transparent" />
            ${rects.join('\n')}
        </svg>
        `.trim();
    }
}

window.AvatarRenderer = AvatarRenderer;
