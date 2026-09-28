// Modern High-Definition Vector Avatar Engine (Lit Energy Premium Style - No Pixels!)

const HD_AVATAR_PALETTES = {
    skin: {
        fair: '#ffd8c2',
        medium: '#d89b72',
        tan: '#b57448',
        dark: '#5c3317'
    },
    skinShadow: {
        fair: '#e8b291',
        medium: '#ba7b53',
        tan: '#8c522e',
        dark: '#3d200e'
    },
    hair: {
        black: '#171717',
        brown: '#45220d',
        blonde: '#f5d36c',
        red: '#c0392b',
        neon: '#00f0ff',
        fire: '#ff5500'
    }
};

class AvatarRenderer {
    static getPresets() {
        return [
            { id: 'guy_fair', gender: 'male', skin: 'fair', hair: 'black', hairStyle: 'fade', name: 'Парень (Светлый)' },
            { id: 'guy_tan', gender: 'male', skin: 'tan', hair: 'brown', hairStyle: 'undercut', name: 'Парень (Смуглый)' },
            { id: 'guy_dark', gender: 'male', skin: 'dark', hair: 'black', hairStyle: 'buzz', name: 'Парень (Тёмный)' },
            { id: 'girl_fair', gender: 'female', skin: 'fair', hair: 'blonde', hairStyle: 'wavy', name: 'Девушка (Светлая)' },
            { id: 'girl_tan', gender: 'female', skin: 'medium', hair: 'brown', hairStyle: 'ponytail', name: 'Девушка (Русая)' },
            { id: 'girl_dark', gender: 'female', skin: 'dark', hair: 'black', hairStyle: 'curls', name: 'Девушка (Тёмная)' }
        ];
    }

    /**
     * Renders a premium vector SVG avatar (Lit Energy Style).
     */
    static renderSVG(config = {}, size = 96) {
        const skinKey = config.skin || 'fair';
        const skin = HD_AVATAR_PALETTES.skin[skinKey] || HD_AVATAR_PALETTES.skin.fair;
        const skinShadow = HD_AVATAR_PALETTES.skinShadow[skinKey] || HD_AVATAR_PALETTES.skinShadow.fair;
        const hair = HD_AVATAR_PALETTES.hair[config.hair || 'black'] || HD_AVATAR_PALETTES.hair.black;
        const gender = config.gender || 'male';
        const hairStyle = config.hairStyle || (gender === 'female' ? 'wavy' : 'fade');
        const costume = config.costume || 'default';
        const hat = config.hat || null;
        const glasses = config.glasses || null;
        const accessory = config.accessory || null;

        let costumeSVG = '';
        let headwearSVG = '';
        let glassesSVG = '';
        let accessorySVG = '';
        let hairSVG = '';

        // --- 1. CLOTHING / COSTUME (VECTOR HD) ---
        if (costume === 'zubenko') {
            // Зубенко Михаил Петрович: элегантный темно-графитовый пиджак в тонкую полоску, красный шелковый галстук, золотые четки
            costumeSVG = `
                <!-- Zubenko Striped Suit -->
                <path d="M18,90 Q50,72 82,90 L85,100 L15,100 Z" fill="#1e2229" />
                <path d="M28,90 L32,100 M40,84 L42,100 M58,84 L60,100 M70,90 L72,100" stroke="#3b4252" stroke-width="1.5" />
                <!-- Shirt & Red Silk Tie -->
                <path d="M42,75 L50,88 L58,75 Z" fill="#ffffff" />
                <path d="M48,77 L52,77 L54,98 L50,100 L46,98 Z" fill="#b91c1c" />
                <!-- Gold Chain / Rosary -->
                <path d="M38,82 Q50,96 62,82" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="50" cy="94" r="3" fill="#ffaa00" />
            `;
        } else if (costume === 'ivanzolo') {
            // Иван Золо: фирменное красное поло Lit Edition с белым кантом
            costumeSVG = `
                <path d="M20,90 Q50,74 80,90 L84,100 L16,100 Z" fill="#e11d48" />
                <path d="M38,76 L50,86 L62,76 L56,74 L50,78 L44,74 Z" fill="#ffffff" />
                <!-- Polo Placket & Buttons -->
                <rect x="48" y="82" width="4" height="18" fill="#be123c" rx="1" />
                <circle cx="50" cy="86" r="1.2" fill="#ffffff" />
                <circle cx="50" cy="92" r="1.2" fill="#ffffff" />
            `;
        } else if (costume === 'brigada') {
            // Саша Белый: стильный кожаный плащ 90-х
            costumeSVG = `
                <path d="M16,88 Q50,70 84,88 L88,100 L12,100 Z" fill="#090a0f" />
                <!-- Lapels -->
                <path d="M34,74 L46,92 L30,100 Z" fill="#1a1d26" />
                <path d="M66,74 L54,92 L70,100 Z" fill="#1a1d26" />
                <path d="M44,76 L50,86 L56,76 Z" fill="#2d3748" />
            `;
        } else if (costume === 'sheikh') {
            // Арабский Шейх: белоснежный канджар с золотой вышивкой
            costumeSVG = `
                <path d="M18,90 Q50,74 82,90 L85,100 L15,100 Z" fill="#f8fafc" />
                <path d="M46,76 L54,76 L54,100 L46,100 Z" fill="url(#goldGrad)" />
                <circle cx="50" cy="84" r="1.5" fill="#ffffff" />
                <circle cx="50" cy="92" r="1.5" fill="#ffffff" />
            `;
        } else if (costume === 'lit_energy' || costume === 'cyberpunk') {
            // Lit Energy Special Edition Hoodie: неоновый огонь и черный карбон
            costumeSVG = `
                <path d="M18,90 Q50,72 82,90 L86,100 L14,100 Z" fill="#0f172a" />
                <!-- Glowing Energy Lightning / Flame -->
                <path d="M50,76 L44,88 L52,88 L46,98 L58,86 L50,86 Z" fill="url(#litFlameGrad)" filter="url(#glow)" />
                <path d="M30,80 Q50,92 70,80" fill="none" stroke="#ff5500" stroke-width="2" />
            `;
        } else {
            // Default Premium Casual Polo / Top
            const shirtColor = gender === 'female' ? '#7c3aed' : '#0284c7';
            costumeSVG = `
                <path d="M20,90 Q50,74 80,90 L84,100 L16,100 Z" fill="${shirtColor}" />
                <path d="M40,75 L50,85 L60,75 Z" fill="#ffffff" opacity="0.9" />
            `;
        }

        // --- 2. HAIR (VECTOR SMOOTH) ---
        if (costume === 'ivanzolo') {
            // Иван Золо: фирменная прическа с прямой челкой + стильные наушники с микрофоном
            hairSVG = `
                <path d="M28,42 Q50,18 72,42 Q74,48 72,54 L28,54 Q26,48 28,42 Z" fill="#2d1d13" />
                <path d="M30,42 L70,42 L70,49 L30,49 Z" fill="#2d1d13" />
                <!-- Ivan Zolo Streamer Headset -->
                <path d="M24,46 Q50,18 76,46" fill="none" stroke="#e2e8f0" stroke-width="3.5" stroke-linecap="round" />
                <!-- Ear cushions -->
                <rect x="20" y="44" width="7" height="15" rx="3.5" fill="#ff5500" />
                <rect x="73" y="44" width="7" height="15" rx="3.5" fill="#ff5500" />
                <!-- Boom Mic -->
                <path d="M24,56 Q35,66 46,62" fill="none" stroke="#111827" stroke-width="2" />
                <circle cx="47" cy="62" r="2.5" fill="#ff0044" />
            `;
        } else if (costume === 'sheikh') {
            // Шейх: куфия и агаль
            hairSVG = `
                <path d="M24,32 Q50,20 76,32 Q82,50 82,78 L72,82 L72,46 L28,46 L28,82 L18,78 Q18,50 24,32 Z" fill="#ffffff" />
                <!-- Black Agal Cords -->
                <ellipse cx="50" cy="34" rx="26" ry="6" fill="none" stroke="#111827" stroke-width="4.5" />
                <ellipse cx="50" cy="36" rx="25" ry="5.5" fill="none" stroke="#d97706" stroke-width="1.5" />
            `;
        } else if (hairStyle === 'fade') {
            hairSVG = `
                <path d="M28,40 Q50,18 72,40 Q74,48 70,52 Q50,38 30,52 Q26,48 28,40 Z" fill="${hair}" />
            `;
        } else if (hairStyle === 'undercut') {
            hairSVG = `
                <path d="M28,38 Q50,16 74,36 Q70,44 68,48 Q50,34 32,48 Z" fill="${hair}" />
            `;
        } else if (hairStyle === 'wavy') {
            hairSVG = `
                <path d="M26,42 Q50,16 74,42 Q82,60 78,82 Q72,70 70,54 Q50,36 30,54 Q28,70 22,82 Q18,60 26,42 Z" fill="${hair}" />
            `;
        } else if (hairStyle === 'ponytail') {
            hairSVG = `
                <path d="M28,40 Q50,18 72,40 Q74,52 68,52 Q50,38 32,52 Z" fill="${hair}" />
                <path d="M68,36 Q84,32 86,52 Q82,62 76,64 Q78,50 70,44 Z" fill="${hair}" />
                <circle cx="70" cy="38" r="3" fill="#ff5500" />
            `;
        } else {
            hairSVG = `
                <path d="M30,42 Q50,20 70,42 Q72,48 68,50 Q50,38 32,50 Z" fill="${hair}" />
            `;
        }

        // --- 3. HATS & HEADWEAR ---
        if (costume === 'zubenko' || hat === 'zubenko_cap') {
            // Кепка восьмиклинка (хулиганка) Зубенко
            headwearSVG = `
                <path d="M22,38 Q50,16 78,38 Q84,46 76,46 Q50,38 24,46 Q16,46 22,38 Z" fill="#2d3748" />
                <ellipse cx="50" cy="30" rx="30" ry="10" fill="#374151" />
                <path d="M22,42 Q50,34 78,42 Q68,46 50,45 Q32,46 22,42 Z" fill="#1a202c" />
                <circle cx="50" cy="22" r="2.5" fill="#111827" />
            `;
        } else if (hat === 'crown') {
            // Золотая Корона Казино
            headwearSVG = `
                <path d="M28,32 L34,16 L42,26 L50,12 L58,26 L66,16 L72,32 Z" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1.5" />
                <!-- Rubies -->
                <circle cx="50" cy="22" r="2.5" fill="#ef4444" />
                <circle cx="38" cy="27" r="2" fill="#3b82f6" />
                <circle cx="62" cy="27" r="2" fill="#3b82f6" />
            `;
        } else if (hat === 'top_hat') {
            headwearSVG = `
                <path d="M18,38 L82,38 L78,42 L22,42 Z" fill="#090a0f" />
                <rect x="30" y="10" width="40" height="28" rx="2" fill="#1e293b" />
                <rect x="30" y="32" width="40" height="6" fill="#dc2626" />
            `;
        } else if (hat === 'gangster_fedora') {
            headwearSVG = `
                <path d="M16,40 Q50,28 84,40 L78,44 Q50,36 22,44 Z" fill="#1e293b" />
                <path d="M30,40 Q50,18 70,40 Z" fill="#334155" />
                <path d="M32,36 Q50,32 68,36" stroke="#ffffff" stroke-width="2" />
            `;
        }

        // --- 4. GLASSES ---
        if (costume === 'cyberpunk' || glasses === 'cyber_visor') {
            glassesSVG = `
                <path d="M26,48 L74,48 L70,57 L30,57 Z" fill="#00f0ff" opacity="0.9" filter="url(#glow)" />
                <path d="M28,50 L72,50" stroke="#ffffff" stroke-width="1.5" />
            `;
        } else if (glasses === 'deal_with_it') {
            glassesSVG = `
                <rect x="27" y="47" width="19" height="11" fill="#000000" rx="1" />
                <rect x="54" y="47" width="19" height="11" fill="#000000" rx="1" />
                <rect x="46" y="49" width="8" height="3" fill="#000000" />
                <rect x="29" y="48" width="4" height="2" fill="#ffffff" />
                <rect x="56" y="48" width="4" height="2" fill="#ffffff" />
            `;
        } else if (glasses === 'aviator') {
            glassesSVG = `
                <ellipse cx="37" cy="52" rx="10" ry="7" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="1.5" />
                <ellipse cx="63" cy="52" rx="10" ry="7" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="1.5" />
                <path d="M47,50 L53,50" stroke="url(#goldGrad)" stroke-width="1.5" />
            `;
        }

        // --- 5. ACCESSORIES ---
        if (accessory === 'cigar') {
            accessorySVG = `
                <rect x="58" y="65" width="16" height="4" rx="1" fill="#78350f" transform="rotate(-10 58 65)" />
                <circle cx="73" cy="62" r="2" fill="#ff4400" filter="url(#glow)" />
                <!-- Smoke puff -->
                <path d="M75,60 Q82,54 78,48 Q84,42 80,36" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
            `;
        } else if (accessory === 'gold_chain') {
            accessorySVG = `
                <path d="M34,80 Q50,102 66,80" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
                <!-- Dollar Medallion -->
                <circle cx="50" cy="98" r="6" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1" />
                <text x="50" y="101" font-family="'Inter', sans-serif" font-weight="900" font-size="7" fill="#1e293b" text-anchor="middle">$</text>
            `;
        }

        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="display: block;">
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fde047" />
                    <stop offset="50%" stop-color="#eab308" />
                    <stop offset="100%" stop-color="#a16207" />
                </linearGradient>
                <linearGradient id="litFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#ff3300" />
                    <stop offset="50%" stop-color="#ff7700" />
                    <stop offset="100%" stop-color="#ffcc00" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <!-- Base Character Silhouette / Glow Aura -->
            <ellipse cx="50" cy="85" rx="34" ry="14" fill="#000000" opacity="0.4" />

            <!-- Clothing / Costume -->
            ${costumeSVG}

            <!-- Neck -->
            <path d="M42,66 L58,66 L58,78 L42,78 Z" fill="${skinShadow}" />

            <!-- Face Shape (Smooth Curved Modern Vector) -->
            <path d="M30,42 Q50,28 70,42 Q74,66 50,76 Q26,66 30,42 Z" fill="${skin}" />
            <path d="M38,68 Q50,76 62,68 Q50,72 38,68 Z" fill="${skinShadow}" />

            <!-- Ears -->
            <ellipse cx="28" cy="50" rx="3.5" ry="6" fill="${skin}" />
            <ellipse cx="72" cy="50" rx="3.5" ry="6" fill="${skin}" />

            <!-- Eyes & Eyebrows -->
            <ellipse cx="40" cy="48" rx="3" ry="2.2" fill="#ffffff" />
            <circle cx="41" cy="48" r="1.4" fill="#1e293b" />
            <path d="M36,44 Q41,42 45,44" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round" />

            <ellipse cx="60" cy="48" rx="3" ry="2.2" fill="#ffffff" />
            <circle cx="59" cy="48" r="1.4" fill="#1e293b" />
            <path d="M55,44 Q59,42 64,44" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round" />

            <!-- Nose & Mouth -->
            <path d="M50,50 L48,56 L52,56" fill="none" stroke="${skinShadow}" stroke-width="1.2" stroke-linecap="round" />
            <path d="M44,63 Q50,68 56,63" fill="none" stroke="#991b1b" stroke-width="1.6" stroke-linecap="round" />

            ${gender === 'female' ? `
                <!-- Cute blush -->
                <circle cx="36" cy="56" r="3" fill="#f43f5e" opacity="0.3" />
                <circle cx="64" cy="56" r="3" fill="#f43f5e" opacity="0.3" />
            ` : ''}

            <!-- Hair (rendered over face) -->
            ${hairSVG}

            <!-- Glasses (rendered over eyes/hair) -->
            ${glassesSVG}

            <!-- Hat (rendered over hair) -->
            ${headwearSVG}

            <!-- Accessories -->
            ${accessorySVG}
        </svg>
        `.trim();
    }
}

window.AvatarRenderer = AvatarRenderer;
