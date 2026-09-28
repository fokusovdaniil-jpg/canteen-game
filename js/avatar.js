// ========================================================
// REALISTIC HIGH-DEFINITION AVATAR ENGINE
// Supports photorealistic portraits for iconic meme skins
// & smooth high-end vector artwork for custom characters
// ========================================================

const REALISTIC_SKIN_IMAGES = {
    zubenko: 'assets/zubenko.jpg',
    ivanzolo: 'assets/ivanzolo.jpg',
    brigada: 'assets/brigada.jpg',
    sheikh: 'assets/sheikh.jpg',
    lit_energy: 'assets/lit_energy.jpg'
};

const HD_PALETTES = {
    skin: {
        fair: '#fcd3be',
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
     * Renders either a photorealistic portrait (for special skins)
     * or a high-end vector avatar.
     */
    static renderSVG(config = {}, size = 96) {
        const costume = config.costume || 'default';

        // Check if there is a realistic high-definition photo asset for this costume!
        if (REALISTIC_SKIN_IMAGES[costume]) {
            const imgPath = REALISTIC_SKIN_IMAGES[costume];
            return `
            <div class="avatar-photo-wrapper" style="width: ${size}px; height: ${size}px; border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6); border: 2px solid #ff5500;">
                <img src="${imgPath}" alt="${costume}" style="width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block;" />
                <div class="avatar-photo-overlay" style="position: absolute; inset: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); pointer-events: none; border-radius: 50%;"></div>
            </div>
            `;
        }

        // Otherwise, render high-end modern vector illustrated character
        const skinKey = config.skin || 'fair';
        const skin = HD_PALETTES.skin[skinKey] || HD_PALETTES.skin.fair;
        const skinShadow = HD_PALETTES.skinShadow[skinKey] || HD_PALETTES.skinShadow.fair;
        const hair = HD_PALETTES.hair[config.hair || 'black'] || HD_PALETTES.hair.black;
        const gender = config.gender || 'male';
        const hairStyle = config.hairStyle || (gender === 'female' ? 'wavy' : 'fade');
        const hat = config.hat || null;
        const glasses = config.glasses || null;
        const accessory = config.accessory || null;

        let costumeSVG = '';
        let headwearSVG = '';
        let glassesSVG = '';
        let accessorySVG = '';
        let hairSVG = '';

        // Default Luxury Casino Attire (Sleek Black Tuxedo / Velvet Dress)
        if (gender === 'female') {
            costumeSVG = `
                <path d="M20,90 Q50,74 80,90 L85,100 L15,100 Z" fill="#9333ea" />
                <path d="M38,76 Q50,88 62,76 Z" fill="${skin}" />
                <circle cx="50" cy="80" r="2.5" fill="#facc15" />
            `;
        } else {
            costumeSVG = `
                <path d="M18,90 Q50,72 82,90 L86,100 L14,100 Z" fill="#0f172a" />
                <path d="M42,75 L50,88 L58,75 Z" fill="#ffffff" />
                <polygon points="46,78 54,78 52,82 48,82" fill="#ff5500" />
                <path d="M34,74 L46,92 L30,100 Z" fill="#1e293b" />
                <path d="M66,74 L54,92 L70,100 Z" fill="#1e293b" />
            `;
        }

        // Hair styling
        if (hairStyle === 'fade') {
            hairSVG = `<path d="M28,40 Q50,18 72,40 Q74,48 70,52 Q50,38 30,52 Q26,48 28,40 Z" fill="${hair}" />`;
        } else if (hairStyle === 'undercut') {
            hairSVG = `<path d="M28,38 Q50,16 74,36 Q70,44 68,48 Q50,34 32,48 Z" fill="${hair}" />`;
        } else if (hairStyle === 'wavy') {
            hairSVG = `<path d="M26,42 Q50,16 74,42 Q82,60 78,82 Q72,70 70,54 Q50,36 30,54 Q28,70 22,82 Q18,60 26,42 Z" fill="${hair}" />`;
        } else if (hairStyle === 'ponytail') {
            hairSVG = `
                <path d="M28,40 Q50,18 72,40 Q74,52 68,52 Q50,38 32,52 Z" fill="${hair}" />
                <path d="M68,36 Q84,32 86,52 Q82,62 76,64 Q78,50 70,44 Z" fill="${hair}" />
                <circle cx="70" cy="38" r="3" fill="#ff5500" />
            `;
        } else {
            hairSVG = `<path d="M30,42 Q50,20 70,42 Q72,48 68,50 Q50,38 32,50 Z" fill="${hair}" />`;
        }

        // Hats
        if (hat === 'crown') {
            headwearSVG = `
                <path d="M28,32 L34,16 L42,26 L50,12 L58,26 L66,16 L72,32 Z" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1.5" />
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

        // Glasses
        if (glasses === 'deal_with_it') {
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

        // Accessories
        if (accessory === 'cigar') {
            accessorySVG = `
                <rect x="58" y="65" width="16" height="4" rx="1" fill="#78350f" transform="rotate(-10 58 65)" />
                <circle cx="73" cy="62" r="2" fill="#ff4400" />
                <path d="M75,60 Q82,54 78,48 Q84,42 80,36" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
            `;
        } else if (accessory === 'gold_chain') {
            accessorySVG = `
                <path d="M34,80 Q50,102 66,80" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" />
                <circle cx="50" cy="98" r="6" fill="url(#goldGrad)" stroke="#b45309" stroke-width="1" />
                <text x="50" y="101" font-family="'Outfit', sans-serif" font-weight="900" font-size="7" fill="#1e293b" text-anchor="middle">$</text>
            `;
        }

        return `
        <div style="width: ${size}px; height: ${size}px; border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6); border: 2px solid #ff5500;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" style="display: block;">
                <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#fde047" />
                        <stop offset="50%" stop-color="#eab308" />
                        <stop offset="100%" stop-color="#a16207" />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="#090d16" />
                ${costumeSVG}
                <path d="M42,66 L58,66 L58,78 L42,78 Z" fill="${skinShadow}" />
                <path d="M30,42 Q50,28 70,42 Q74,66 50,76 Q26,66 30,42 Z" fill="${skin}" />
                <path d="M38,68 Q50,76 62,68 Q50,72 38,68 Z" fill="${skinShadow}" />
                <ellipse cx="28" cy="50" rx="3.5" ry="6" fill="${skin}" />
                <ellipse cx="72" cy="50" rx="3.5" ry="6" fill="${skin}" />
                <ellipse cx="40" cy="48" rx="3" ry="2.2" fill="#ffffff" />
                <circle cx="41" cy="48" r="1.4" fill="#1e293b" />
                <path d="M36,44 Q41,42 45,44" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round" />
                <ellipse cx="60" cy="48" rx="3" ry="2.2" fill="#ffffff" />
                <circle cx="59" cy="48" r="1.4" fill="#1e293b" />
                <path d="M55,44 Q59,42 64,44" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round" />
                <path d="M50,50 L48,56 L52,56" fill="none" stroke="${skinShadow}" stroke-width="1.2" stroke-linecap="round" />
                <path d="M44,63 Q50,68 56,63" fill="none" stroke="#991b1b" stroke-width="1.6" stroke-linecap="round" />
                ${hairSVG}
                ${glassesSVG}
                ${headwearSVG}
                ${accessorySVG}
            </svg>
        </div>
        `.trim();
    }
}

window.AvatarRenderer = AvatarRenderer;
