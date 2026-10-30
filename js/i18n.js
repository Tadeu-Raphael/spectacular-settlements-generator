(function () {
    const STORAGE_KEY = "spectacular-settlements-lang";
    const LEGACY_STORAGE_KEY = "gcity-lang";
    const SUPPORTED = ["en", "pt"];

    // English text is the key; only Portuguese needs entries.
    const PT = {
        // Layout
        "Main navigation": "Navegação principal",
        "Home": "Início",
        "Capitals": "Capitais",
        "Cities": "Cidades Grandes",
        "Towns": "Cidades",
        "Villages": "Vilas",
        "Fortresses": "Fortificações",
        "Keep": "Torre de Menagem",
        "Castle": "Castelo",
        "Stronghold": "Fortaleza",
        "🏯 Keep": "🏯 Torre de Menagem",
        "🏰 Castle": "🏰 Castelo",
        "🛡️ Stronghold": "🛡️ Fortaleza",
        "Trading Posts": "Postos de Comércio",
        "Extras": "Extras",
        "Spectacular Settlements Generator · Settlement generator for RPG adventures": "Spectacular Settlements Generator · Gerador de assentamentos para aventuras de RPG",
        "Made by": "Feito por",
        "Language": "Idioma",
        "Switch to English": "Mudar para inglês",
        "Switch to Portuguese": "Mudar para português",

        // Modifier labels
        "Size": "Tamanho",
        "Condition": "Condição",
        "Disposition": "Disposição",
        "Population Density": "Densidade populacional",
        "Population Wealth": "Riqueza da população",
        "Hardship Likelihood": "Probabilidade de adversidade",
        "Crime": "Crime",
        "Visitor Traffic": "Tráfego de visitantes",
        "Shop Quality": "Qualidade das lojas",
        "Urban Encounters": "Encontros urbanos",
        "Fortification": "Fortificação",
        "Law Enforcement": "Aplicação da lei",
        "Market Square": "Praça do mercado",
        "Places of Worship": "Locais de culto",
        "Farms and Resources": "Fazendas e recursos",
        "Population Overflow": "Excesso de população",
        "Night Activity": "Atividade noturna",
        "Number of Districts": "Número de distritos",
        "District Condition": "Condição dos distritos",
        "Military Force": "Força militar",
        "Residence": "Residência",
        "Other Locations Type": "Tipo de outros locais",
        "Residents": "Residentes",
        "Number of Rooms": "Número de cômodos",
        "Furnishings": "Mobiliário",
        "Moat": "Fosso",

        // Page titles
        "Spectacular Settlements Generator - RPG Settlement Generator": "Spectacular Settlements Generator - Gerador de Assentamentos de RPG",
        "Spectacular Settlements Generator - Town Generator": "Spectacular Settlements Generator - Gerador de Cidades",
        "Spectacular Settlements Generator - Village Generator": "Spectacular Settlements Generator - Gerador de Vilas",
        "Spectacular Settlements Generator - City Generator": "Spectacular Settlements Generator - Gerador de Cidades Grandes",
        "Spectacular Settlements Generator - Capital Generator": "Spectacular Settlements Generator - Gerador de Capitais",
        "Spectacular Settlements Generator - Trading Post Generator": "Spectacular Settlements Generator - Gerador de Postos de Comércio",
        "Spectacular Settlements Generator - Keep Generator": "Spectacular Settlements Generator - Gerador de Torres de Menagem",
        "Spectacular Settlements Generator - Castle Generator": "Spectacular Settlements Generator - Gerador de Castelos",
        "Spectacular Settlements Generator - Stronghold Generator": "Spectacular Settlements Generator - Gerador de Fortalezas",
        "Spectacular Settlements Generator - Extras Generator": "Spectacular Settlements Generator - Gerador de Extras",

        // Index
        "🏰 Spectacular Settlements Generator - RPG Settlement Generator": "🏰 Spectacular Settlements Generator - Gerador de Assentamentos de RPG",
        "Choose a settlement type to generate:": "Escolha um tipo de assentamento para gerar:",
        "Choose the fortress type to generate:": "Escolha o tipo de fortaleza para gerar:",
        "👑 Capitals": "👑 Capitais",
        "The largest settlements, with government, nobility, espionage, armies and many districts": "Os maiores assentamentos, com governo, nobreza, espionagem, exército e muitos distritos",
        "🏰 Cities": "🏰 Cidades Grandes",
        "Large metropolises split into districts, with politics, crime and intrigue": "Grandes metrópoles divididas em distritos, com política, crime e intrigas",
        "🏙️ Towns": "🏙️ Cidades",
        "Established towns with markets, defenses and full infrastructure": "Cidades estabelecidas com mercados, defesas e infraestrutura completa",
        "🌲 Villages": "🌲 Vilas",
        "Smaller, simpler communities focused on basic resources": "Comunidades menores, mais simples e focadas em recursos básicos",
        "🛒 Trading Posts": "🛒 Postos de Comércio",
        "Strategic commercial hubs, markets and trade routes": "Pontos comerciais estratégicos, mercados e rotas de negociação",
        "🛡️ Fortresses": "🛡️ Fortificações",
        "Keeps, castles and strongholds: cumulative defensive structures": "Torres de menagem, castelos e fortalezas: estruturas defensivas cumulativas",
        "Just the main tower of the fortress": "Apenas a torre principal da fortaleza",
        "A keep plus walls, towers, moat and the rest of the castle": "Torre de menagem mais muralhas, torres, fosso e demais elementos do castelo",
        "A reinforced keep and castle, with brutal defenses and stylistic additions": "Torre de menagem e castelo reforçados, com defesas brutais e ampliações de estilo",
        "✦ Extras": "✦ Extras",
        "Encounters, rumors, taverns, hooks and other extra details only": "Apenas encontros, rumores, tavernas, ganchos e outros detalhes extras",
        "← Back": "← Voltar",

        // Generation pages
        "Generation actions": "Ações da geração",
        "🎲 Roll again": "🎲 Gerar novamente",
        "⬇ Export TXT": "⬇ Exportar TXT",
        "← Main menu": "← Menu principal",
        "Generation information": "Informações da geração",

        // Information card
        "Information": "Informações",
        "Applied modifiers": "Modificadores aplicados",
        "Modifier": "Modificador",
        "Total": "Total",
        "Source": "Origem",
        "No modifiers were generated in this roll.": "Nenhum modificador foi gerado nesta rolagem.",
        "Dice rolls": "Rolagens de dados",
        "Field": "Campo",
        "Die": "Dado",
        "Die result": "Resultado do dado",
        "No rolls were recorded.": "Nenhuma rolagem foi registrada.",

        // Extras card
        "Optional content from Appendices A-D. Terms marked with a purple ✦ are extras and open a description when clicked.": "Conteúdo opcional dos Apêndices A-D. Termos marcados com um ✦ roxo são extras e abrem uma descrição ao clicar.",
        "Urban encounters": "Encontros urbanos",
        "Encounter modifier": "Modificador de encontro",
        "⚔ Generate encounter": "⚔ Gerar encontro",
        "🎯 Force encounter (no check)": "🎯 Forçar encontro (sem teste)",
        "Rumors": "Rumores",
        "d100 table, filtered by settlement type.": "Tabela d100, filtrada pelo tipo de assentamento.",
        "🗣 Generate rumor": "🗣 Gerar rumor",
        "Tavern": "Taverna",
        "Tavern Builder (Appendix D).": "Construtor de Taverna (Apêndice D).",
        "🍺 Generate tavern": "🍺 Gerar taverna",
        "🍺 Generate tavern (Tavern Builder)": "🍺 Gerar taverna (Construtor de Taverna)",
        "Local production": "Produção local",
        "Crops, minerals and animals.": "Cultivos, minerais e animais.",
        "🌾 Generate production": "🌾 Gerar produção",
        "Scene details": "Detalhes da cena",
        "Smells, textures, time of day and art.": "Cheiros, texturas, hora do dia e arte.",
        "👃 Generate details": "👃 Gerar detalhes",
        "Adventure hook": "Gancho de aventura",
        "Hook/Situation Builder.": "Construtor de Ganchos e Situações.",
        "🎣 Generate hook": "🎣 Gerar gancho",
        "Personnel issues": "Problemas de pessoal",
        "For any NPC the party interacts with.": "Para qualquer NPC com quem o grupo interaja.",
        "Appendix B table for garrison and staff.": "Tabela do Apêndice B para guarnição e funcionários.",
        "🧑 Generate issue": "🧑 Gerar problema",
        "Location glossary": "Glossário de locais",
        "Fortress glossary": "Glossário de fortaleza",
        "Appendix A": "Apêndice A",
        "Appendix A terms": "termos do Apêndice A",
        "Settlement type": "Tipo de assentamento",
        "Trading Post": "Posto de Comércio",
        "Village": "Vila",
        "Town": "Cidade",
        "City": "Cidade Grande",
        "Capital": "Capital",
        "Villages have no table of their own, so the Trading Post/Town rule is used (optional).": "Vilas não têm tabela própria, então é usada a regra de Posto de Comércio/Cidade (opcional).",
        "Extra: click to see the description": "Extra: clique para ver a descrição",
        "d20 + modifier must reach": "d20 + modificador deve atingir",
        "for an encounter.": "para um encontro.",
        "Close": "Fechar",
        "No additional description.": "Sem descrição adicional.",
        "Versions": "Versões",
        "poor": "simples",
        "fine": "refinada",
        "(poor) /": "(simples) /",
        "version of": "versão de",

        // Extras results
        "Check": "Teste",
        "needs": "necessário",
        "No urban encounter this time.": "Nenhum encontro urbano desta vez.",
        "Encounter": "Encontro",
        "Rumor": "Rumor",
        "rerolled: does not apply to this settlement type": "re-rolado: não se aplica a este tipo de assentamento",
        "Personnel issue": "Problema de pessoal",
        "Name": "Nome",
        "Reputation": "Reputação",
        "Patrons": "Clientela",
        "Staff": "Equipe",
        "Food": "Comida",
        "Drinks": "Bebidas",
        "patrons": "clientes",
        "Usual Crowd (up to about half capacity)": "Clientela habitual (até cerca de metade da capacidade)",
        "Few-to-None": "Poucos ou nenhum",
        "Crowded": "Lotada",
        "Short-Staffed": "Equipe reduzida",
        "Appropriate": "Adequada",
        "Overstaffed": "Equipe sobrando",
        "Time of day": "Hora do dia",
        "Smell": "Cheiro",
        "Touch": "Textura",
        "Street debris": "Detrito na rua",
        "Local art": "Arte local",
        "Local writing": "Escrita local",
        "Crop": "Cultivo",
        "Mineral": "Mineral",
        "Beast of burden": "Animal de carga",
        "Farm animal (meat)": "Animal de fazenda (carne)",
        "Farm animal (wool)": "Animal de fazenda (lã)",
        "Game": "Caça",
        "Urban encounter": "Encontro urbano",
        "NPC personnel issue": "Problema de pessoal de NPC",
        "Tavern (Tavern Builder)": "Taverna (Construtor de Taverna)",
        "Extras (generated on this page)": "Extras (gerados nesta página)",
        "Who": "Quem",
        "Problem": "Problema",
        "Appearance": "Aparência",
        "Emotion": "Emoção",
        "Action": "Ação",
        "Item of value": "Item de valor",
        "Clothing": "Vestimenta",
        "Pet": "Animal de estimação",
        "{0} Generation": "Geração de {0}",
        "The {0} {1}": "{1} {0}"
    };

    const DICTIONARIES = { en: {}, pt: PT };

    function detect() {
        let stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY); } catch (error) { /* storage unavailable */ }
        if (SUPPORTED.includes(stored)) return stored;
        const browser = (navigator.languages && navigator.languages[0]) || navigator.language || "";
        return browser.toLowerCase().startsWith("pt") ? "pt" : "en";
    }

    let current = detect();

    function lookup(key) {
        const own = PT[key];
        if (own !== undefined) return own;
        return window.I18N_DATA ? window.I18N_DATA[key] : undefined;
    }

    // Translates a piece of text; unknown text is returned unchanged. Surrounding whitespace is preserved.
    function t(text) {
        if (current === "en" || typeof text !== "string") return text;
        const direct = lookup(text);
        if (direct !== undefined) return direct;
        const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
        if (match[2] && (match[1] || match[3])) {
            const inner = lookup(match[2]);
            if (inner !== undefined) return match[1] + inner + match[3];
        }
        return text;
    }

    /* ---------- Seeded randomness: switching language replays the same roll ---------- */

    const REPLAY_KEY = "spectacular-settlements-replay";
    const page = location.pathname.split("/").pop() || "index.html";
    let replay = null;
    try {
        replay = JSON.parse(sessionStorage.getItem(REPLAY_KEY));
        sessionStorage.removeItem(REPLAY_KEY);
    } catch (error) { /* storage unavailable */ }
    if (!replay || replay.page !== page) replay = null;

    function mulberry32(seed) {
        let state = seed >>> 0;
        return function () {
            state = (state + 0x6D2B79F5) >>> 0;
            let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
            mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
            return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
        };
    }

    function randomSeed() {
        const values = new Uint32Array(1);
        crypto.getRandomValues(values);
        return values[0];
    }

    function withSeed(seed, callback) {
        const previous = Math.random;
        Math.random = mulberry32(seed);
        try {
            return callback();
        } finally {
            Math.random = previous;
        }
    }

    const pageSeed = replay ? replay.seed : randomSeed();
    Math.random = mulberry32(pageSeed);

    /* ---------- DOM translation ---------- */

    function translateHeadings(root) {
        root.querySelectorAll(".generation-content h2, .generation-content h3").forEach(node => {
            node.dataset.i18nKey = node.dataset.i18nKey || node.textContent.trim();
            node.textContent = t(node.dataset.i18nKey);
        });
    }

    function apply(root = document) {
        root.querySelectorAll("[data-i18n]").forEach(node => {
            node.dataset.i18nKey = node.dataset.i18nKey || node.textContent.trim();
            node.textContent = t(node.dataset.i18nKey);
        });
        root.querySelectorAll("[data-i18n-aria]").forEach(node => {
            node.dataset.i18nAriaKey = node.dataset.i18nAriaKey || node.getAttribute("aria-label");
            node.setAttribute("aria-label", t(node.dataset.i18nAriaKey));
        });
        root.querySelectorAll("[data-i18n-title]").forEach(node => {
            node.dataset.i18nTitleKey = node.dataset.i18nTitleKey || node.getAttribute("title");
            node.setAttribute("title", t(node.dataset.i18nTitleKey));
        });
        root.querySelectorAll("[data-lang-switch]").forEach(node => {
            node.setAttribute("aria-pressed", String(node.dataset.langSwitch === current));
        });
        translateHeadings(root);
        if (root === document) {
            window.I18N.titleKey = window.I18N.titleKey || document.title;
            document.title = t(window.I18N.titleKey);
            document.documentElement.lang = current;
        }
    }

    function set(lang) {
        if (!SUPPORTED.includes(lang) || lang === current) return;
        current = lang;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (error) { /* storage unavailable */ }

        // Generated pages are rebuilt from the same seed so every roll is shown in the new language.
        if (document.body.classList.contains("generation-page")) {
            try {
                sessionStorage.setItem(REPLAY_KEY, JSON.stringify({
                    page,
                    seed: pageSeed,
                    extras: window.I18N.extrasState ? window.I18N.extrasState() : null
                }));
            } catch (error) { /* storage unavailable */ }
            location.reload();
            return;
        }

        apply(document);
        document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang } }));
    }

    window.I18N = {
        t, apply, set, withSeed, randomSeed, replay,
        get: () => current,
        titleKey: null,
        extrasState: null
    };
    window.t = t;
    window.__ = t;

    document.addEventListener("click", event => {
        const button = event.target.closest("[data-lang-switch]");
        if (button) set(button.dataset.langSwitch);
    });
    document.addEventListener("DOMContentLoaded", () => apply(document));
})();
