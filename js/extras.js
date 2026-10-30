(function () {
    const BOOK = window.EXTRAS_BOOK;
    const body = document.body;
    const extrasLog = [];
    window.extrasLog = extrasLog;

    let encounterUpdateHint = null;
    let pageType = body.classList.contains("villages-page") ? "village"
        : body.classList.contains("towns-page") ? "town"
        : body.classList.contains("cities-page") ? "city"
        : body.classList.contains("capitals-page") ? "capital"
        : body.classList.contains("fortresses-page") ? "fortress"
        : body.classList.contains("extras-page") ? "trading"
        : "trading";
    const isFortress = pageType === "fortress";

    const savedExtras = window.I18N.replay ? window.I18N.replay.extras : null;
    if (body.classList.contains("extras-page") && savedExtras && savedExtras.settlement) {
        pageType = savedExtras.settlement;
    }

    // Every generated extra gets its own seed so it can be rebuilt in another language.
    const actionLog = [];
    const actionRegistry = {};
    let actionCounter = 0;
    let pendingSeed = null;
    window.I18N.extrasState = () => ({ actions: actionLog, settlement: pageType });

    function perform(id, mod, run) {
        const seed = pendingSeed !== null ? pendingSeed : window.I18N.randomSeed();
        pendingSeed = null;
        actionLog.push({ id, mod, seed });
        return window.I18N.withSeed(seed, run);
    }

    function replayActions() {
        ((savedExtras && savedExtras.actions) || []).forEach(action => {
            const entry = actionRegistry[action.id];
            if (!entry) return;
            if (entry.input && action.mod !== null) entry.input.value = String(action.mod);
            pendingSeed = action.seed;
            entry.button.click();
        });
    }

    /* ---------- Appendix D data ---------- */

    const REPUTATION = [__("Hidden/Secret"), __("Abhorred"), __("Disreputable"), __("Of No Consequence"), __("Respectable"), __("Well-Regarded")];
    const NAME_FIRST = [__("Red"), __("Yellow"), __("Green"), __("Blue"), __("Violet"), __("Disreputable"), __("Mischievous"), __("Hungry"), __("Thirsty"), __("Tuckered"), __("Frantic"), __("Bloated"), __("Rank"), __("Fussy"), __("Exuberant"), __("Irate"), __("Jolly"), __("Laughing"), __("Crying"), __("Screaming")];
    const NAME_SECOND = [__("Vagabond"), __("Tyrant"), __("Giant"), __("Halfling"), __("Mare/Stallion"), __("Bear"), __("Pig/Boar"), __("Elk"), __("Moose"), __("Unicorn"), __("Mouse"), __("Cat"), __("Dog"), __("Hen/Rooster"), __("Sword"), __("Shield"), __("Spear"), __("Banner"), __("Cartwheel"), __("Dragon")];

    const FOOD = {
        humble: { label: __("Humble"), die: 8, items: [__("Acorn Paste"), __("Pottage"), __("Rye Bread"), __("Blood Pudding"), __("Pickled Fish"), __("Mashed Turnips"), __("Porridge"), { to: "standard", skip: 1 }] },
        standard: { label: __("Standard"), die: 8, items: [{ to: "humble", skip: 8 }, __("Roast Lamb"), __("Brown Bread"), __("Roast Goose"), __("Suckling Pig"), __("Meat Pie"), __("Roast Beef"), { to: "rich", skip: 1 }] },
        rich: { label: __("Rich"), die: 10, items: [{ to: "standard", skip: 1 }, __("Stewed Pheasant"), __("White Bread"), __("Chicken in Spiced Breadcrumbs"), __("Roast Venison"), __("Roast Larks"), __("Fruit in Syrup"), __("Lamprey Pie"), __("Roast Pike"), { to: "extravagant", skip: 8 }] },
        extravagant: { label: __("Extravagant"), die: 8, items: [{ to: "rich", skip: 10 }, __("Live songbirds in a pie crust"), __("Roast peacock in its feathers"), __("Roast sturgeon in syrup"), __("Capon in pastry armor with gold leaf on a suckling pig"), __("Whole boar cooked many ways"), __("Castle-shaped pie with a whole roast deer"), __("Roast ox breathing fire")] }
    };
    const DRINKS_SOFT = [__("Water"), __("Citrus Water"), __("Flower Water"), __("Spiced Water"), __("Clarea"), __("Sekanjabin"), __("Tea"), __("Apple Juice"), __("Small Beer"), __("Cow Milk"), __("Goat Milk"), __("Grenadine")];
    const DRINKS_ALC = [__("Ale"), __("Beer"), __("Mead"), __("Cider"), __("White Wine"), __("Red Wine"), __("Whiskey"), __("Rum"), __("Vodka"), __("Gin"), __("Schnapps"), __("Hippocras")];

    const CROPS = [__("Wheat"), __("Barley"), __("Oats"), __("Corn"), __("Rye"), __("Potatoes"), __("Rice"), __("Sugarcane"), __("Peas"), __("Beans"), __("Carrots"), __("Cabbages"), __("Onions"), __("Garlic"), __("Turnips"), __("Herbs"), __("Apples"), __("Lemons"), __("Grapes"), __("Berries")];
    const MINERALS = [__("Iron"), __("Tin"), __("Lead"), __("Clay"), __("Lime"), __("Coal"), __("Salt"), __("Copper"), __("Silver"), __("Gold")];
    const BURDEN = [__("Destrier"), __("Palfrey"), __("Courser"), __("Draught Horse"), __("Donkey"), __("Llama"), __("Camel"), __("Ox"), __("Yak"), __("Elephant")];
    const MEAT = [__("Cow"), __("Sheep"), __("Chicken"), __("Turkey"), __("Pig"), __("Rabbit"), __("Duck"), __("Goose")];
    const WOOL = [__("Sheep"), __("Goat"), __("Yak"), __("Llama"), __("Rabbit"), __("Muskox")];
    const GAME = [__("Large and Swift"), __("Large and Tough"), __("Small and Swift"), __("Small and Tough"), __("Fowl"), __("Large Predator"), __("Small Predator"), __("Fish")];
    const ARTS = [__("Painting"), __("Sketching"), __("Etching"), __("Carving"), __("Whittling"), __("Tapestry"), __("Mosaic"), __("Stained Glass"), __("Tattooing"), __("Embroidery")];
    const WRITING = [__("History"), __("Local Records"), __("Myths and Legends"), __("Romance"), __("Natural History"), __("The Magical Arts")];
    const SMELLS = [__("Soil"), __("Sweat"), __("Garbage"), __("Waste"), __("Flowers"), __("Something baking"), __("Wood smoke"), __("Pipe smoke"), __("Alcohol"), __("Animal"), __("Wood"), __("Iron"), __("Leather"), __("Ammonia"), __("Decay"), __("Compost"), __("Blood"), __("Perfume"), __("Ozone"), __("Fear")];
    const TOUCH = [__("Rough"), __("Sharp"), __("Thorny"), __("Smooth"), __("Wet"), __("Dry"), __("Soft"), __("Spongey"), __("Hot"), __("Cold")];
    const DEBRIS = [__("Broken toy"), __("Sticks or leaves"), __("Pottery shards"), __("Torn cloth"), __("Lone shoe"), __("Feather"), __("Single coin"), __("Half-eaten food"), __("Waste"), __("Broken shingle")];
    const TIME_OF_DAY = [__("Dawn"), __("Morning"), __("Noon"), __("Afternoon"), __("Dusk"), __("Evening"), __("Midnight"), __("Very early morning")];

    const HOOK = {
        [__("Who")]: [__("Baby"), __("Little boy"), __("Little girl"), __("Young man"), __("Young woman"), __("Old man"), __("Old woman"), __("Mother"), __("Father"), __("Grandmother"), __("Grandfather"), __("Third party")],
        [__("Problem")]: [__("Lost something"), __("Can't reach something"), __("Can't find someone"), __("Owe someone something"), __("Unfairly in trouble"), __("Justly in trouble"), __("Trying to get away"), __("Trying to get in"), __("Need to convince someone"), __("Need to get rid of something"), __("Need advice"), __("Heartbroken")],
        [__("Appearance")]: [__("Filthy"), __("Shabby"), __("Homely"), __("Rugged"), __("Simple"), __("Refined"), __("Handsome"), __("Gorgeous"), __("Resplendent"), __("Otherworldly")],
        [__("Emotion")]: [__("Disgusted"), __("Happy"), __("Angry"), __("Aloof"), __("Irritable"), __("Distraught"), __("Confused"), __("Distracted"), __("Sad"), __("Scared"), __("Embarrassed"), __("Worried"), __("Surprised"), __("Impatient"), __("Tired"), __("Excited"), __("Curious"), __("Proud"), __("Uncomfortable"), __("Relaxed")],
        [__("Action")]: [__("Eating"), __("Walking"), __("Running"), __("Talking"), __("Yelling"), __("Whispering"), __("Grabbing"), __("Crying"), __("Fighting"), __("Laughing"), __("Screaming"), __("Bargaining"), __("Thinking"), __("Sleeping"), __("Drinking"), __("Cleaning"), __("Checking"), __("Looking"), __("Working"), __("Playing")],
        [__("Item of value")]: [__("Money"), __("Pet"), __("Document"), __("Reminder"), __("Item from deceased loved one"), __("Gift for loved one"), __("Key"), __("Item to be delivered"), __("Important ingredient"), __("Medicine"), __("Equipment"), __("Something magical")],
        [__("Clothing")]: [__("Shirt"), __("Trousers"), __("Vest"), __("Dress"), __("Coat/Jacket"), __("Boots"), __("Shoes"), __("Socks"), __("Gloves"), __("Scarf"), __("Cap"), __("Hat"), __("Belt"), __("Glasses"), __("Ring"), __("Pendant"), __("Bracelet"), __("Earring"), __("Skirt"), __("Toga")],
        [__("Pet")]: [__("Cat"), __("Dog"), __("Bird"), __("Fish"), __("Frog"), __("Rodent"), __("Lizard"), __("Bug"), __("Safe monster/mythical creature"), __("Unsafe monster/mythical creature")]
    };

    /* ---------- Location categories (Appendix A) ---------- */

    const CATEGORIES = {
        [__("Crafted Items")]: [__("Cooper"), __("Carpenter"), __("Smithy"), __("Tailor"), __("Thatcher"), __("Wainwright"), __("Weaver"), __("Apothecary"), __("Artist"), __("Cobbler"), __("Shipwright"), __("Luxury Furnishings")],
        [__("Intellectual")]: [__("Artist"), __("Doctor"), __("Club"), __("Archives/Library"), __("Academy/University"), __("Forum"), __("Schoolhouse"), __("Amphitheater"), __("Courthouse"), __("Chancery"), __("Scribes & Clerks")],
        [__("Industrial / Heavy Production")]: [__("Foundry/Smelting"), __("Mill"), __("Textile Production")],
        [__("Religion")]: [__("Archives/Library"), __("Forum"), __("Schoolhouse"), __("Altar"), __("Oratory"), __("Sanctuary"), __("Temple"), __("Great Temple"), __("Priestly Guidance"), __("Hands of the Gods")],
        [__("Health & Hygiene")]: [__("Barber"), __("Bathhouse"), __("Doctor"), __("Inn")],
        [__("Nature")]: [__("Apothecary"), __("Rare Botanicals"), __("Herbalist"), __("Outdoor Recreational Area")],
        [__("Social")]: [__("House of Leisure"), __("Inn"), __("Club"), __("Tavern"), __("Forum"), __("Gathering Hall"), __("Outdoor Recreational Area"), __("Dance Hall"), __("Amphitheater")],
        [__("Rest & Relaxation")]: [__("House of Leisure"), __("Tavern"), __("Inn"), __("Club"), __("Outdoor Recreational Area"), __("Dance Hall")],
        [__("Transport")]: [__("Wainwright"), __("Shipwright"), __("Stable"), __("Caravan & Mount")],
        [__("Food & Drink")]: [__("Baker"), __("Butcher"), __("General Store"), __("Mill"), __("Rare Libations and Fare"), __("Tavern")],
        [__("Materials & Components")]: [__("General Store"), __("Apothecary"), __("Rare Botanicals"), __("Rare Trade Goods"), __("Magic Shop"), __("Guides & Trackers")],
        [__("Government & Business")]: [__("Bank & Exchange"), __("Archives/Library"), __("Forum"), __("Amphitheater"), __("Town Hall"), __("Courthouse"), __("Treasury"), __("Chancery")],
        [__("Magic")]: [__("Apothecary"), __("Rare Botanicals"), __("Magic Shop"), __("Soothsayer"), __("Arcane Academics"), __("Magic Mercenaries"), __("Archives/Library"), __("Academy/University")]
    };

    const HIRED_HELP = {
        [__("Brutes & Brawlers")]: __("Martial melee fighters."),
        [__("Cloak & Dagger")]: __("Stealth and subterfuge."),
        [__("Bows & Slings")]: __("Martial ranged fighters."),
        [__("Scribes & Clerks")]: __("Educators."),
        [__("Guides & Trackers")]: __("Urban and wilderness experts."),
        [__("Caravan & Mount")]: __("Transportation and locomotion."),
        [__("Arcane Academics")]: __("Magical education or counsel."),
        [__("Magic Mercenaries")]: __("Martial arcane fighters."),
        [__("Priestly Guidance")]: __("Divine education or counsel."),
        [__("Hands of the Gods")]: __("Martial divine fighters.")
    };

    const VARIANTS = {
        [__("Barber")]: [__("Dirt-Knife"), __("Coiffeur")], [__("Bathhouse")]: [__("Tubs"), __("Private Baths")], [__("Doctor")]: [__("Sawbones"), __("Physician")],
        [__("House of Leisure")]: [__("Den of Leisure"), __("Hall of Leisure")], [__("Inn")]: [__("Tents or Hostel"), __("Lodge")], [__("Club")]: [__("Stage"), __("Theater")],
        [__("Soothsayer")]: [__("Fortune Teller"), __("Diviner")], [__("Stable")]: [__("Stalls"), __("Livery")], [__("Tavern")]: [__("Pub"), __("Taphouse")]
    };

    const GLOSSARY = Object.assign({}, BOOK.loc);
    GLOSSARY[__("Doctor/Apothecary")] = `${GLOSSARY[__("Doctor")]} / ${GLOSSARY[__("Apothecary")]}`;
    GLOSSARY[__("Millers")] = GLOSSARY[__("Mill")];
    GLOSSARY[__("Miller")] = GLOSSARY[__("Mill")];
    Object.entries(HIRED_HELP).forEach(([name, text]) => { GLOSSARY[name] = `${text}${__(" (Hired Help)")}`; });

    const ALIASES = {};
    Object.entries(VARIANTS).forEach(([base, names]) => names.forEach((alias, index) => {
        ALIASES[alias] = base;
        GLOSSARY[alias] = `${GLOSSARY[base]} (${index === 0 ? "poor" : "fine"}${__(" version of ")}${base})`;
    }));
    Object.assign(ALIASES, { [__("Taxidermist")]: __("Tanner/Taxidermist"), [__("Tanner")]: __("Tanner/Taxidermist"), [__("Smelting")]: __("Foundry/Smelting"), [__("Foundry")]: __("Foundry/Smelting"), [__("Library")]: __("Archives/Library"), [__("Academy")]: __("Academy/University"), [__("University")]: __("Academy/University") });

    /* ---------- Utilities ---------- */

    const roll = sides => Math.floor(Math.random() * sides) + 1;
    const pick = list => list[roll(list.length) - 1];
    const pickSlash = list => pick(list).split("/").length > 1 ? pick(pick(list).split("/")) : pick(list);
    const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const signed = n => (n >= 0 ? `+${n}` : String(n));

    function element(tag, className, html) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }

    function log(title, lines) {
        extrasLog.push({ title, lines });
    }

    function categoriesFor(name) {
        const base = ALIASES[name] || name;
        return Object.entries(CATEGORIES).filter(([, list]) => list.includes(base)).map(([category]) => category);
    }

    /* ---------- Modal ---------- */

    let modalNode;
    function openModal(title, contentNode) {
        if (!modalNode) {
            modalNode = element("div", "modal fade extra-modal");
            modalNode.tabIndex = -1;
            modalNode.innerHTML = `<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content">
                <div class="modal-header"><h5 class="modal-title"><span class="extra-badge">${t("✦ Extra")}</span> <span data-role="title"></span></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${t("Close")}"></button></div>
                <div class="modal-body" data-role="body"></div></div></div>`;
            document.body.appendChild(modalNode);
        }
        modalNode.querySelector("[data-role=title]").textContent = title;
        modalNode.querySelector("[data-role=body]").replaceChildren(contentNode);
        bootstrap.Modal.getOrCreateInstance(modalNode).show();
    }

    function locationModal(name) {
        const base = ALIASES[name] || name;
        const node = element("div");
        const description = GLOSSARY[name] || GLOSSARY[base] || BOOK.fort[name];
        node.appendChild(element("p", "", escapeHtml(description || t("No additional description."))));

        const variants = VARIANTS[base];
        if (variants) {
            node.appendChild(element("p", "", `<b>${t("Versions")}:</b> ${variants[0]} (${t("poor")}) / ${variants[1]} (${t("fine")})`));
        }
        const cats = categoriesFor(name);
        if (cats.length) {
            const row = element("div", "extra-chips mb-2");
            cats.forEach(c => row.appendChild(element("span", "extra-chip", c)));
            node.appendChild(row);
        }
        if (base === __("Tavern")) {
            const holder = element("div", "extra-result mt-3");
            const button = element("button", "btn btn-sm extra-button", t("🍺 Generate tavern (Tavern Builder)"));
            button.type = "button";
            button.addEventListener("click", () => {
                holder.replaceChildren(buildTavern(false));
            });
            node.append(button, holder);
        }
        if (base === __("Hired Help")) {
            const list = element("ul", "mb-0 mt-2");
            Object.entries(HIRED_HELP).forEach(([n, t]) => list.appendChild(element("li", "", `<b>${n}</b> - ${t}`)));
            node.appendChild(list);
        }
        openModal(name, node);
    }

    /* ---------- Term annotation in page text ---------- */

    function annotateTerms() {
        const content = document.querySelector(".generation-content");
        if (!content) return;

        const terms = isFortress
            ? Object.keys(BOOK.fort)
            : Object.keys(GLOSSARY).concat(Object.keys(ALIASES), [__("Miller")]).filter(n => n !== __("Doctor/Apothecary"));
        const unique = [...new Set(terms)].sort((a, b) => b.length - a.length);
        const pattern = new RegExp(`(?<![\\w/-])(${unique.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w-])`, isFortress ? "gi" : "g");
        const headingFilter = /location|shop|service|worship|interest|district|commercial|hired|temple|religio|building|place|locais|loja|servi|culto|interesse|distrito|comerc|contrata|templo|edif|lugar/i;

        const targets = [];
        content.querySelectorAll("p").forEach(p => {
            if (p.closest(".fortress-figure, svg")) return;
            const heading = p.previousElementSibling;
            if (isFortress || (heading?.tagName === __("H3") && headingFilter.test(heading.textContent)) || p.querySelector(".extra-term")) {
                targets.push(p);
            }
        });

        targets.forEach(p => {
            const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(node => {
                if (node.parentElement.closest(".extra-term") || !pattern.test(node.nodeValue)) { pattern.lastIndex = 0; return; }
                pattern.lastIndex = 0;
                const fragment = document.createDocumentFragment();
                let last = 0;
                node.nodeValue.replace(pattern, (match, _g, offset) => {
                    fragment.appendChild(document.createTextNode(node.nodeValue.slice(last, offset)));
                    const term = element("span", "extra-term");
                    term.textContent = match;
                    term.dataset.term = isFortress ? Object.keys(BOOK.fort).find(k => k.toLowerCase() === match.toLowerCase()) : match;
                    term.tabIndex = 0;
                    term.setAttribute("role", "button");
                    term.title = t("Extra: click to see the description");
                    fragment.appendChild(term);
                    last = offset + match.length;
                    return match;
                });
                fragment.appendChild(document.createTextNode(node.nodeValue.slice(last)));
                node.replaceWith(fragment);
            });
        });

        content.addEventListener("click", event => {
            const term = event.target.closest(".extra-term");
            if (term) locationModal(term.dataset.term);
        });
        content.addEventListener("keydown", event => {
            const term = event.target.closest?.(".extra-term");
            if (term && (event.key === __("Enter") || event.key === " ")) {
                event.preventDefault();
                locationModal(term.dataset.term);
            }
        });
    }

    /* ---------- Geradores ---------- */

    function encounterModifier() {
        const mods = window.generationLog?.modifiers || [];
        const sum = name => mods.filter(m => m.name === name).reduce((total, m) => total + m.amount, 0);
        const urban = mods.some(m => m.name === "urbanEncounterMod");
        return { value: urban ? sum("urbanEncounterMod") : sum("crimeMod"), source: urban ? __("Urban Encounters") : __("Crime") };
    }

    const THRESHOLD = { village: 17, trading: 17, town: 17, city: 15, capital: 15 };

    function pickByMax(list, value) {
        return list.find(item => value <= item.max);
    }

    function buildEncounter(force, mod) {
        const threshold = THRESHOLD[pageType];
        const die = roll(20);
        const total = die + mod;
        const box = element("div", "extra-result");
        const lines = [`${__("Encounter check: d20 = ")}${die} ${signed(mod)} = ${total}${__(" (needs ")}${threshold}+)`];
        box.appendChild(element("p", "mb-1", `<b>${__("Check:")}</b>${__(" d20 = ")}${die} ${signed(mod)} = <b>${total}</b>${__(" (needs ")}${threshold}+)`));

        if (total < threshold && !force) {
            box.appendChild(element("p", "mb-0", (__("No urban encounter this time."))));
            lines.push(__("No urban encounter."));
        } else {
            const index = roll(20);
            const enc = BOOK.enc[index - 1];
            box.appendChild(element("p", "mb-1", `<b>${__("Encounter (d20 = ")}${index}):</b> ${escapeHtml(enc.name)}`));
            box.appendChild(element("p", "mb-0", escapeHtml(enc.text)));
            lines.push(`${__("Encounter (d20 = ")}${index}): ${enc.name} - ${enc.text}`);
        }
        log(t("Urban encounter"), lines);
        return box;
    }

    function buildPersonnel() {
        const die = roll(20);
        const issue = BOOK.pers.find(p => { const [a, b] = p.range.split("-").map(Number); return die >= a && die <= (b || a); });
        const box = element("div", "extra-result");
        box.appendChild(element("p", "mb-0", `<b>${__("Personnel issue (d20 = ")}${die}):</b> ${escapeHtml(issue.name)}. ${escapeHtml(issue.text)}`));
        log(t("NPC personnel issue"), [`${__("d20 = ")}${die}: ${issue.name}. ${issue.text}`]);
        return box;
    }

    function rumorPool() {
        return BOOK.rum.filter(r => {
            switch (r.scope) {
                case "village": return pageType === "village";
                case "notvillage": return pageType !== "village";
                case "citycap": return pageType === "city" || pageType === "capital";
                case "capital": return pageType === "capital";
                default: return true;
            }
        });
    }

    function buildRumor() {
        const pool = rumorPool();
        const die = roll(100);
        let rumor = pickByMax(BOOK.rum, die);
        let rerolled = false;
        if (!pool.includes(rumor)) { rumor = pick(pool); rerolled = true; }
        const box = element("div", "extra-result");
        box.appendChild(element("p", "mb-0", `<b>${__("Rumor (d100 = ")}${die}${rerolled ? ", " + (__("rerolled: does not apply to this settlement type")) : ""}):</b> ${escapeHtml(rumor.text)}`));
        log(t("Rumor"), [`${__("d100 = ")}${die}${rerolled ? __(" (rerolled)") : ""}: ${rumor.text}`]);
        return box;
    }

    function rollFood(tier, excluded) {
        const def = FOOD[tier];
        let index;
        do { index = roll(def.die); } while (index === excluded);
        const entry = def.items[index - 1];
        return typeof entry === "string" ? { tier: def.label, name: entry } : rollFood(entry.to, entry.skip);
    }

    function buildTavern(logIt = true) {
        const reputationDie = roll(6);
        const reputation = REPUTATION[reputationDie - 1];
        const adjective = pick(NAME_FIRST);
        const noun = pickSlash(NAME_SECOND);
        const name = t("The {0} {1}").replace("{0}", adjective).replace("{1}", noun);
        const patronDie = roll(8);
        const patrons = patronDie <= 2 ? `${__("Few-to-None (")}${Math.max(roll(4) - 1, 0)}${__(" patrons)")}` : patronDie <= 6 ? (__("Usual Crowd (up to about half capacity)")) : (__("Crowded"));
        const staffDie = roll(8);
        const staff = staffDie <= 2 ? (__("Short-Staffed")) : staffDie <= 6 ? (__("Appropriate")) : (__("Overstaffed"));
        const food = [rollFood("standard"), rollFood("standard")];
        const drinks = [pick(DRINKS_SOFT), pick(DRINKS_ALC), pick(DRINKS_ALC)];

        const box = element("div", "extra-result");
        const rows = [
            [__("Name"), name],
            [__("Reputation"), `${reputation}${__(" (d6 = ")}${reputationDie})`],
            [__("Patrons"), `${patrons}${__(" (d8 = ")}${patronDie})`],
            [__("Staff"), `${staff}${__(" (d8 = ")}${staffDie})`],
            [__("Food"), food.map(f => `${f.name} <small class="text-muted">(${f.tier})</small>`).join(", ")],
            [__("Drinks"), drinks.join(", ")]
        ];
        box.innerHTML = `<dl class="extra-dl mb-0">${rows.map(([k, v]) => `<dt>${(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
        if (logIt) {
            log(t("Tavern (Tavern Builder)"), rows.map(([k, v]) => `${k}: ${v.replace(/<[^>]+>/g, "")}`));
        }
        return box;
    }

    function buildScene() {
        const lines = [
            [__("Time of day"), pick(TIME_OF_DAY)],
            [__("Smell"), pick(SMELLS)],
            [__("Touch"), pick(TOUCH)],
            [__("Street debris"), pick(DEBRIS)],
            [__("Local art"), pick(ARTS)],
            [__("Local writing"), pick(WRITING)]
        ];
        const box = element("div", "extra-result");
        box.innerHTML = `<dl class="extra-dl mb-0">${lines.map(([k, v]) => `<dt>${(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
        log(t("Scene details"), lines.map(([k, v]) => `${k}: ${v}`));
        return box;
    }

    function buildHook() {
        const lines = Object.entries(HOOK).map(([k, list]) => [k, pick(list)]);
        const box = element("div", "extra-result");
        box.innerHTML = `<dl class="extra-dl mb-0">${lines.map(([k, v]) => `<dt>${(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
        log(t("Adventure hook"), lines.map(([k, v]) => `${k}: ${v}`));
        return box;
    }

    function buildProduction() {
        const lines = [
            [__("Crop"), pick(CROPS)],
            [__("Mineral"), pick(MINERALS)],
            [__("Beast of burden"), pick(BURDEN)],
            [__("Farm animal (meat)"), pick(MEAT)],
            [__("Farm animal (wool)"), pick(WOOL)],
            [__("Game"), pick(GAME)]
        ];
        const box = element("div", "extra-result");
        box.innerHTML = `<dl class="extra-dl mb-0">${lines.map(([k, v]) => `<dt>${(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
        log(t("Local production"), lines.map(([k, v]) => `${k}: ${v}`));
        return box;
    }

    /* ---------- Extras card ---------- */

    function section(title, hint, buttons) {
        const wrap = element("section", "extra-section");
        wrap.appendChild(element("h3", "", `${t(title)} <small class="text-muted fw-normal">${t(hint)}</small>`));
        const actions = element("div", "d-flex justify-content-center flex-wrap gap-2 mb-2");
        const output = element("div", "extra-output");
        buttons.forEach(([label, builder, append]) => {
            const id = `action-${actionCounter++}`;
            const button = element("button", "btn btn-sm extra-button", t(label));
            button.type = "button";
            button.addEventListener("click", () => {
                const result = perform(id, null, builder);
                if (append) output.prepend(result); else output.replaceChildren(result);
            });
            actionRegistry[id] = { button };
            actions.appendChild(button);
        });
        wrap.append(actions, output);
        return wrap;
    }

    const SETTLEMENT_TYPES = [
        ["trading", __("Trading Post")], ["village", __("Village")], ["town", __("Town")], ["city", __("City")], ["capital", __("Capital")]
    ];

    function renderExtrasCard() {
        const info = document.getElementById("generation-info");
        const root = document.getElementById("extras-root");
        if (!info && !root) return;

        const card = element("section", "extras-card generation-info container card shadow-sm border-0 my-4 p-4 p-md-5");
        card.setAttribute("aria-label", t("Extras"));
        card.appendChild(element("h2", "h4 fw-semibold text-center border-bottom pb-2 mb-4 mt-0", `<span class="extra-badge">${__("✦ Extra")}</span> ${t("Extras")}`));
        card.appendChild(element("p", "text-center text-muted mb-0", t("Optional content from Appendices A-D. Terms marked with a purple ✦ are extras and open a description when clicked.")));

        if (!isFortress) {
            const encounter = element("section", "extra-section");
            encounter.appendChild(element("h3", "", t("Urban encounters")));
            const hint = element("p", "text-muted small mb-2");
            const controls = element("div", "extra-controls d-flex justify-content-center align-items-center flex-wrap gap-2 mb-2");
            const label = element("label", "form-label mb-0", t("Encounter modifier"));
            const input = element("input", "form-control form-control-sm w-auto");
            const initial = encounterModifier();
            label.htmlFor = "extra-encounter-mod";
            input.id = "extra-encounter-mod";
            input.type = "number";
            input.step = "1";
            input.value = String(initial.value);
            input.style.width = "5rem";
            const updateHint = () => {
                const village = pageType === "village" ? " " + t("Villages have no table of their own, so the Trading Post/Town rule is used (optional).") : "";
                hint.textContent = `${t("d20 + modifier must reach")} ${THRESHOLD[pageType]}+ ${t("for an encounter.")}${village}`;
            };
            updateHint();
            const getMod = () => Number.parseInt(input.value, 10) || 0;
            const output = element("div", "extra-output");
            const actions = element("div", "d-flex justify-content-center flex-wrap gap-2 mb-2");
            [[__("⚔ Generate encounter"), false], [__("🎯 Force encounter (no check)"), true]].forEach(([text, force]) => {
                const id = `action-${actionCounter++}`;
                const button = element("button", "btn btn-sm extra-button", t(text));
                button.type = "button";
                button.addEventListener("click", () => {
                    const mod = getMod();
                    output.prepend(perform(id, mod, () => buildEncounter(force, mod)));
                });
                actionRegistry[id] = { button, input };
                actions.appendChild(button);
            });
            controls.append(label, input);
            encounter.append(hint, controls, actions, output);
            card.appendChild(encounter);
            encounterUpdateHint = updateHint;

            card.appendChild(section(__("Rumors"), __("d100 table, filtered by settlement type."), [[__("🗣 Generate rumor"), buildRumor, true]]));
            card.appendChild(section(__("Tavern"), __("Tavern Builder (Appendix D)."), [[__("🍺 Generate tavern"), () => buildTavern(true), true]]));
            card.appendChild(section(__("Local production"), __("Crops, minerals and animals."), [[__("🌾 Generate production"), buildProduction, false]]));
            card.appendChild(section(__("Scene details"), __("Smells, textures, time of day and art."), [[__("👃 Generate details"), buildScene, false]]));
            card.appendChild(section(__("Adventure hook"), __("Hook/Situation Builder."), [[__("🎣 Generate hook"), buildHook, true]]));
            card.appendChild(section(__("Personnel issues"), __("For any NPC the party interacts with."), [[__("🧑 Generate issue"), buildPersonnel, true]]));
            if (root) {
                const places = element("section", "extra-section");
                places.appendChild(element("h3", "", `${t("Location glossary")} <small class="text-muted fw-normal">${t("Appendix A")}</small>`));
                const chips = element("div", "extra-chips justify-content-center");
                Object.keys(BOOK.loc).forEach(name => {
                    const chip = element("button", "extra-chip extra-chip-button", name);
                    chip.type = "button";
                    chip.addEventListener("click", () => locationModal(name));
                    chips.appendChild(chip);
                });
                places.appendChild(chips);
                card.appendChild(places);
            }
        } else {
            card.appendChild(section(__("Personnel issues"), __("Appendix B table for garrison and staff."), [[__("🧑 Generate issue"), buildPersonnel, true]]));
            card.appendChild(section(__("Adventure hook"), __("Hook/Situation Builder."), [[__("🎣 Generate hook"), buildHook, true]]));
            const glossary = element("section", "extra-section");
            glossary.appendChild(element("h3", "", `${t("Fortress glossary")} <small class="text-muted fw-normal">${t("Appendix A terms")}</small>`));
            const chips = element("div", "extra-chips justify-content-center");
            Object.keys(BOOK.fort).forEach(name => {
                const chip = element("button", "extra-chip extra-chip-button", name);
                chip.type = "button";
                chip.addEventListener("click", () => locationModal(name));
                chips.appendChild(chip);
            });
            glossary.appendChild(chips);
            card.appendChild(glossary);
        }

        if (root) {
            root.appendChild(card);
        } else {
            info.before(card);
        }
    }

    function renderTypeSelector() {
        const holder = document.getElementById("extras-settings");
        if (!holder) return;
        const select = element("select", "form-select w-auto d-inline-block");
        select.id = "extras-settlement-type";
        SETTLEMENT_TYPES.forEach(([value, text]) => select.appendChild(new Option(t(text), value)));
        select.value = pageType;
        select.addEventListener("change", () => {
            pageType = select.value;
            if (encounterUpdateHint) encounterUpdateHint();
        });
        const label = element("label", "form-label me-2", t("Settlement type"));
        label.htmlFor = select.id;
        holder.append(label, select);
    }

    window.formatExtrasText = function () {
        if (!extrasLog.length) return [];
        const lines = ["", t("Extras (generated on this page)")];
        extrasLog.forEach(entry => {
            lines.push("", `${entry.title}:`);
            entry.lines.forEach(line => lines.push(line));
        });
        return lines;
    };

    document.addEventListener("DOMContentLoaded", () => {
        annotateTerms();
        renderTypeSelector();
        renderExtrasCard();
        replayActions();
    });
})();
