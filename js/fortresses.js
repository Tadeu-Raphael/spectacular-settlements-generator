// Fortress generator based on "Spectacular Settlements" (Chapter Seven: Fortresses).
// One script serves the keep, castle and stronghold pages: each level builds on the previous one.
// Tables are [maxRoll, name, description, modifiers]; a roll <= 0 counts as the first entry
// and a roll above the maximum counts as the last one.

const LEVEL = { keep: 1, castle: 2, stronghold: 3 }[document.body.dataset.fortress] || 1;
const mods = {};
const container = document.getElementById("fortress-content");
const state = {
    environment: 0,
    expense: 0,
    woodWalls: false,
    garrisonBunks: false,
    ruined: false,
    keep: {},
    castle: {}
};

function modValue(name) {
    return mods[name] || 0;
}

function addMods(effects) {
    for (const name in effects) {
        mods[name] = modValue(name) + logMod(name, effects[name]);
    }
}

function lookup(table, roll) {
    return table.find(entry => roll <= entry[0]) || table[table.length - 1];
}

function seq(items) {
    return items.map((item, index) => [index + 1, ...item]);
}

function show(id, html) {
    document.getElementById(id).innerHTML = html;
}

function describe(entry) {
    return `<b>${entry[1]}.</b> ${entry[2]}`;
}

function effectNote(effects) {
    const parts = Object.entries(effects || {}).map(([name, amount]) => `${formatSigned(amount)} ${modifierLabel(name)}`);
    return parts.length ? ` (${parts.join(", ")})` : "";
}

function format(entry) {
    return describe(entry) + effectNote(entry[3]);
}

// Rolls on a table and applies the modifiers it grants; the caller decides how to display it.
function pick(sides, table, modName = "") {
    const roll = rollDie(sides, modName ? modValue(modName) : 0, modName);
    const entry = lookup(table, roll);

    if (entry[3]) {
        addMods(entry[3]);
    }

    return { entry, roll };
}

function rollTable(id, sides, table, modName = "") {
    setGenContext(id);
    const result = pick(sides, table, modName);
    show(id, format(result.entry));

    return result;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Translations may give both forms as "singular|plural"; otherwise an "s" is appended.
function plural(count, word) {
    const forms = __(word).split("|");
    return `${count} ${count === 1 ? forms[0] : (forms[1] || forms[0] + "s")}`;
}

function feet(value) {
    return `${value}${__(" ft.")}`;
}

function addSection(title) {
    const heading = document.createElement("h2");

    heading.className = `h4 fw-semibold text-center border-bottom pb-2 mb-4 ${container.children.length ? "mt-5" : "mt-0"}`;
    heading.textContent = title;
    container.appendChild(heading);
}

function addField(id, title) {
    const heading = document.createElement("h3");
    const paragraph = document.createElement("p");

    heading.textContent = title;
    paragraph.id = id;
    container.append(heading, paragraph);
}

// General tables
const AGE = [
    [1, __("New"), __("The fortress was completed within the past 20 years."), { conditionMod: 4, residentsMod: -5 }],
    [3, __("Recent"), __("The fortress was completed between 20 and 100 years ago."), { conditionMod: 2, residentsMod: -5 }],
    [8, __("Old"), __("The fortress was completed between 100 and 200 years ago.")],
    [17, __("Very Old"), __("The fortress was completed between 200 and 500 years ago."), { conditionMod: -2 }],
    [20, __("Ancient"), __("The fortress was completed more than 500 years ago."), { conditionMod: -4 }]
];

const LOCATION = [
    [3, __("Remote"), __("The fortress is a significant distance away from the nearest settlement.")],
    [7, __("Outskirts"), __("The fortress is on the fringes of the settlement's occupied land, perhaps in farming country.")],
    [14, __("Edge of Settlement"), __("The fortress is on the outer border of the settlement proper, perhaps connected to its border wall.")],
    [19, __("Central"), __("The fortress is in the middle of an established settlement.")],
    [20, __("Prominent"), __("The fortress is in a central location and highly visible, as if showcased. The settlement was probably built around it.")]
];

const ENVIRONMENT = seq([
    [__("Coastal"), __("The fortress is near a large body of water, such as a lake or ocean.")],
    [__("Forest"), __("The fortress is nestled among the trees.")],
    [__("Mountains"), __("The fortress is found on stony passes or soaring peaks.")],
    [__("Plains"), __("The fortress is in the wide open fields.")],
    [__("River"), __("The fortress is near a steadily flowing stream or other watercourse.")],
    [__("Swamp"), __("The fortress is in, or near, a vast area of stagnant water.")],
    [__("Underground"), __("The fortress is within a large network of caves.")],
    [__("Valley"), __("The fortress is within, or on the edge of, an area of recessed elevation.")],
    [__("Tundra"), __("The fortress is in a very cold environment.")],
    [__("Desert"), __("The fortress is in a dry and arid environment, likely covered with vast sand dunes.")]
]);

const CONDITION = [
    [2, __("Ruin or Bare Bones"), __("Most of the structure is exposed to the elements and a rebuild is the only option. If under construction, it is a long way from completion."), { roomsMod: -2, furnishingsMod: -5 }],
    [6, __("Poor or Incomplete"), __("The fortress is in disrepair, with loose stones or timbers, gaps, holes and rot. If under construction, it is up to a few years from being finished."), { roomsMod: -1, furnishingsMod: -2 }],
    [14, __("Average"), __("The fortress is usable, sound and habitable, though minor issues may be present. Further work should take no more than a year.")],
    [19, __("Strong"), __("The fortress is well-maintained and presents no obvious vulnerabilities. If under construction, it will be complete within the month."), { roomsMod: 1 }],
    [20, __("Impeccable"), __("The fortress could not be in better shape, presenting an imposing and immaculate image. Any remaining work could be completed within a week."), { roomsMod: 2 }]
];

const EXPENSE = [
    [2, __("Paltry"), __("The fortress was built on a shoestring budget, possibly cutting corners by necessity."), { furnishingsMod: -5 }],
    [8, __("Modest"), __("The fortress was constructed with a small budget, enough to build something simple but functional."), { furnishingsMod: -2 }],
    [15, __("Moderate"), __("The fortress was built with a medium budget, perhaps allowing for a small comfort or two.")],
    [19, __("Significant"), __("The fortress was built with a large budget, allowing for high-quality materials and some luxury."), { furnishingsMod: 2 }],
    [20, __("Extravagant"), __("Little or no expense was spared. Materials are top-quality and the fortress feels grand and splendid."), { furnishingsMod: 5 }]
];

const MATERIAL = [
    [4, __("Brick"), __("Man-made blocks of mud, clay or sand, mixed with a binding material and baked hard.")],
    [8, __("Timber"), __("Hewn logs and planks, milled to fit together tightly.")],
    [18, __("Stone"), __("Rough-cut or smoothed and shaped, typically built on a timber frame and mortared together.")],
    [19, __("Salvage"), __("Found materials, such as repurposed stone from ruins or timbers from wrecked ships.")],
    [20, __("Unique Materials"), __("The fortress is built from an unusual, rare material.")]
];

const UNIQUE_MATERIAL = seq([
    [__("Bone"), __("Plentiful dead or a natural graveyard make bone an abundant resource.")],
    [__("Coral"), __("Coral replaces stone, especially in tropical or underwater settings.")],
    [__("Crystal"), __("Deep mining or alien planes yield crystal in enough abundance to build with.")],
    [__("Living Plant"), __("The fortress is built among, or inside, living plants such as great trees, shaped by natural or magical means.")],
    [__("Ice"), __("Huge blocks of ice are cut and shaped. Less tough than stone, but repairs are far simpler.")],
    [__("Magic"), __("Magic generated the materials, assembled the fortress or keeps it held together.")]
]);

const REASON = seq([
    [__("Anticipation"), __("Aggression from somewhere was expected.")],
    [__("Mortal Command"), __("It was the dying wish of someone important to the builder.")],
    [__("Immortal Command"), __("A god, or powerful otherworldly being, commanded it be built.")],
    [__("Vanity"), __("The fortress was commissioned as a demonstration of power, wealth or self-importance.")],
    [__("Protection"), __("It was built to keep a particular thing, or place, safe or hidden.")],
    [__("Panic"), __("The construction was motivated by fear of what would happen otherwise.")],
    [__("Prophecy"), __("It was foretold that a fortress would be needed on this site.")],
    [__("Decree"), __("A ruler, or governing group, ordered that it be built.")],
    [__("Life's Work"), __("It was built as a labor of love by a dedicated craftsperson and their team.")],
    [__("Conversion"), __("The building was formerly used for another purpose, but constant additions made it what it is today.")]
]);

const DESIGN = seq([
    [__("Power"), __("Strength and fortitude.")],
    [__("Glory"), __("Prestige and triumph.")],
    [__("Refuge"), __("Welcome and safety.")],
    [__("Fear"), __("Dread and insignificance.")],
    [__("Grace"), __("Beauty and elegance.")],
    [__("Wealth"), __("Luxury and opulence.")],
    [__("Piety"), __("Righteousness and ascendence.")],
    [__("Practicality"), __("Utility and function.")]
]);

const RESOURCE_ORIGIN = [
    [7, __("Locally Made/Harvested [Preserved Surroundings]"), __("Materials came from the site and nearby areas, sustainably, without depleting any harvesting location.")],
    [10, __("Locally Made/Harvested [Stripped Surroundings]"), __("Materials came from the site and nearby areas, entirely depleting the harvesting locations.")],
    [12, __("Partially Local, Partially Imported"), __("Materials that could not be obtained locally were purchased and brought in.")],
    [14, __("Imported"), __("Materials were purchased and brought in from an outside source in their entirety.")],
    [15, __("Partially Salvaged"), __("Some new materials were obtained locally, but a significant portion was salvaged from ruins.")],
    [16, __("Entirely Salvaged"), __("Materials were all salvaged from various demolished structures.")],
    [17, __("Partially Stolen"), __("Materials were gathered illicitly over time, perhaps by hijacking cargo or commandeering a quarry.")],
    [18, __("Completely Stolen"), __("Materials were looted from one or more rightful owners, openly or covertly.")],
    [19, __("Partial Magic"), __("Standard materials were partially augmented by magic, or mundane materials were acquired by magic.")],
    [20, __("Completely Magic"), __("Magic was used to acquire an entire slew of mundane materials, or to create fantastical ones.")]
];

const LOCAL_IMPACT = seq([
    [__("Hostile"), __("The fortress was built in direct opposition to the wishes of those in the area, and relations immediately turned sour.")],
    [__("Disruptive"), __("The fortress disturbed the area in which it was built, intentionally or not.")],
    [__("Irritating"), __("The fortress' construction, or presence, caused some annoyance or small issue locally.")],
    [__("Innocuous"), __("The fortress had little impact on its surroundings, causing no trouble and no great benefit.")],
    [__("Beneficial"), __("The fortress proved a boon to the local area, perhaps a compromise to a pre-existing issue.")],
    [__("Advantageous"), __("The fortress immediately benefited the local area in a big way, perhaps resolving a serious issue.")]
]);

const IMPACT_CHANGE = [
    [2, __("Negative"), __("Things have gotten worse.")],
    [4, __("Stable"), __("Things have stayed roughly the same.")],
    [6, __("Positive"), __("Things have gotten better.")]
];

const ALTERNATE_ENTRY = [
    [10, __("None"), __("There are no alternate entries into the fortress.")],
    [11, __("Back Door, Blocked"), __("A small rear-access door was built into the exterior wall. It has been blocked from the inside.")],
    [12, __("Back Door, Exposed"), __("A small rear-access door in the exterior wall, possibly in regular use and guarded, with no attempt to conceal it.")],
    [13, __("Back Door, Hidden"), __("A small rear-access door in the exterior wall, used infrequently, intentionally obscured and possibly guarded.")],
    [14, __("Secret Door in Exterior Wall"), __("A hidden door allows covert comings and goings. It is probably monitored, but discreetly.")],
    [15, __("Secret Door in Exterior Wall, Forgotten"), __("A hidden door was built for covert comings and goings, but those who knew about it are no longer around.")],
    [16, __("Drain, with Grating"), __("A drain pipe emerges somewhere in the landscape outside, its opening covered by metal grating.")],
    [17, __("Drain, Blocked"), __("A drain pipe emerges outside the fortress; its final yards are filled with large stones that let water, but not intruders, pass.")],
    [18, __("Drain, Blocked, with Grating"), __("A drain pipe filled with large stones in its final yards, and its mouth is also covered with metal grating.")],
    [19, __("Old, Forgotten Tunnel"), __("A tunnel was dug out of the fortress long ago and fell into disrepair. Perhaps no one knows about it. It might collapse.")],
    [20, __("Maintained Tunnel"), __("A well-maintained tunnel leads out of the fortress, showing signs of recent (but not heavy) use.")]
];

const RESIDENT_RELATIONS = seq([
    [__("Irritated"), __("A ranking resident (or the owner) is fed up with the antics of a member of the staff.")],
    [__("Outside Ties"), __("An important individual in the fortress is in a relationship with someone living outside it.")],
    [__("Struggle"), __("Two staff members are at odds with one another.")],
    [__("Clandestine"), __("Someone in the fortress is engaged in secret dealings with an external entity.")],
    [__("Expecting"), __("The ranking, or most important, resident is expecting a child soon. If unwed, consider what this means.")],
    [__("New Blood"), __("Someone new has been brought on, and there is more to them than it initially seemed.")],
    [__("Family Squabbling"), __("There has been arguing among the resident family of late, regarding a recurring issue.")],
    [__("Secret Love"), __("A staff member has been receiving secret notes, messages or gestures of a romantic nature.")],
    [__("Diplomatic Tensions"), __("Relations between the ranking resident and their liege (or someone close to them) have been strained.")],
    [__("Diplomatic Harmony"), __("Relations between the ranking resident and their liege (or someone close to them) have been going exceedingly well.")],
    [__("Problem Guard"), __("A member of the guard is at odds with the resident(s).")],
    [__("Favored Guard"), __("A member of the guard is being shown preferential treatment by the resident(s).")]
]);

const RESIDENTS = [
    [8, __("Original"), __("The original residents, their descendants or successors are in residence.")],
    [14, __("New (Peaceful)"), __("Non-original residents obtained the fortress peacefully: purchase, inheritance, gift, stewardship, or by finding it abandoned.")],
    [20, __("New (Forceful)"), __("Non-original residents obtained the fortress by conquest or illegitimate means, or after some kind of conflict.")]
];

const RESIDENT_ATTITUDE = seq([
    [__("Angry"), __("The residents hate being here and actively think about leaving, but have stayed for some reason.")],
    [__("Irritated"), __("The residents are perturbed by this place. Something about it, or their situation, grates on them daily.")],
    [__("Ambivalent"), __("The residents could take or leave this place and do not devote much thought to it.")],
    [__("Content"), __("The residents like the fortress well enough. Things aren't so bad.")],
    [__("Happy"), __("The residents like the fortress, or are pleased with their situation. Spirits are up.")],
    [__("Enthused"), __("The residents are thrilled to be here. Convincing them to leave would be extremely difficult.")]
]);

// Fifth item: whether the keep gets Guard Bunks as a starting room
const GARRISON_SIZE = [
    [4, __("Minimum"), __("The garrison is the smallest necessary to do the job, so it is likely overworked. It requires few commanding officers.")],
    [12, __("Modest"), __("The garrison is large enough to defend the fortress and allow for reasonable guard shifts.")],
    [19, __("Large"), __("The garrison is substantial and keeps the fortress well-defended at all times. Guards stay well-rested."), null, true],
    [20, __("Maximum"), __("The garrison is the largest the fortress can sustain."), null, true]
];

const HOBBIES = [
    __("Hunting"), __("Cooking"), __("Strategy Games"), __("Gambling (cards or dice)"), __("Art (any discipline)"), __("History (domestic or foreign)"),
    __("Knitting/Sewing"), __("Carving"), __("Botany/Study of Nature"), __("Outdoor Games - Throwing or Shooting"), __("Outdoor Games - Martial"),
    __("Outdoor Games - Ball-Based"), __("Feasting"), __("Music (listening or playing)"), __("Craft (decorative items)"), __("Hawking"),
    __("Martial Training"), __("Brewing"), __("Reading/Storytelling"), __("Poetry")
];

const CURRENT_ISSUE = [
    [6, __("Peaceful"), __("Everything seems alright at the moment.")],
    [7, __("Entryway Malfunction"), __("A door, gate, portcullis or drawbridge is experiencing an issue.")],
    [8, __("Hurt on the Job"), __("A guard or staff member was recently injured while performing their duties.")],
    [9, __("Poachers"), __("Evidence of poaching was discovered on the lands surrounding the fortress.")],
    [10, __("Family Illness"), __("A member of the ranking resident's immediate family has gotten sick (or a close friend or associate, if they are not in residence).")],
    [11, __("Worker Illness"), __("A member of the household staff or guard has gotten sick.")],
    [12, __("Spoiled Food"), __("Some (or all) of the fresh food items have gone bad.")],
    [13, __("Stolen Goods"), __("Some of the food and/or supplies have been swiped.")],
    [14, __("Structural Damage [Weather]"), __("An area of the fortress has been damaged by the elements.")],
    [15, __("Structural Damage [Neglect]"), __("An area of the fortress has been overlooked for too long, and has now collapsed.")],
    [16, __("Structural Damage [Someone's Mistake]"), __("An area of the fortress has been compromised and someone is at fault.")],
    [17, __("Infestation"), __("Pests have encroached on the fortress and become a nuisance.")],
    [18, __("Magical Anomaly"), __("An area of magical disturbance is causing problems. Residents may not know what caused it.")],
    [19, __("Creature"), __("A strange beast or monster has been roaming inside, or near to, the fortress' boundary.")],
    [20, __("Unwanted Attention"), __("Unfriendly outsiders have recently become interested in the fortress (or those inside it).")]
];

const ISSUE_SEVERITY = seq([
    [__("Trivial"), __("The issue does not pose much, if any, real concern.")],
    [__("Manageable"), __("The issue requires attention, but is no cause for great alarm.")],
    [__("Tough"), __("The issue is causing notable hardship or inconvenience.")],
    [__("Serious"), __("The issue is a cause of real concern and requires attention soon, lest it worsen.")],
    [__("Critical"), __("The issue is pressing and dangerous, posing a very real threat to all involved.")],
    [__("Dire"), __("The issue needs addressing immediately. Failure will likely result in irreversible consequences, or loss of life.")]
]);

const GARRISON_EQUIPMENT = [
    [2, __("Poor"), __("Guards are equipped with substandard kit and lack a dedicated training area.")],
    [8, __("Standard"), __("Guards have standard kit and a dedicated training area with basic practice equipment.")],
    [13, __("Decent"), __("Guards have standard kit, a training area and equipment, and demonstrate refined practice techniques such as specific drills.")],
    [18, __("Good"), __("Guards have above-standard kit, a training area and equipment, and utilize highly refined practice techniques.")],
    [20, __("Exemplary"), __("Guards have the best kit available and a training area with the best equipment and practices.")]
];

const SECRETS = seq([
    [__("Ancient Resting Place"), __("A body was buried here before the fortress was built.")],
    [__("Hidden Gravesite"), __("A body was buried here after the fortress was built.")],
    [__("Ancient Treasure"), __("A treasure was buried here before the fortress was built.")],
    [__("Secret Hoard"), __("A treasure was buried here after the fortress was built.")],
    [__("Unknown Power"), __("Someone in the fortress has an item they believe is mundane. It is actually special and/or important.")],
    [__("Prized Tome"), __("A book of great value is within the fortress.")],
    [__("Secret Rites"), __("An ancient ritual was performed here before the fortress was built.")],
    [__("Tryst"), __("Two people within the fortress got married in secret, and have been keeping it quiet ever since.")],
    [__("Enchantment"), __("An unnoticed spell, or spell-like effect, lingers over a portion of the fortress.")],
    [__("Moonlighting"), __("Someone within the fortress is secretly doing a job, or activity, in their off-hours.")],
    [__("Back Door"), __("Someone has been sneaking out of the fortress in a way that would not be approved of.")],
    [__("Interloper"), __("Someone living within the fortress does not actually belong, but has remained unnoticed.")]
]);

const HISTORY = seq([
    [__("Previous Residents"), __("Someone of note lived here before the fortress was built.")],
    [__("Notable Family Tree"), __("A resident within the fortress has (or had) very interesting lineage.")],
    [__("Accursed"), __("The site was cursed, either during construction or since. The curse effects may vary greatly.")],
    [__("In Their Footsteps"), __("A very powerful being once walked where the fortress now stands.")],
    [__("Convergence"), __("A pivotal meeting happened here.")],
    [__("Dig Site"), __("An intriguing discovery was made here.")],
    [__("Protests"), __("Prior to construction, there were strong objections to building the fortress.")],
    [__("Ensured Silence"), __("The architect of this fortress was imprisoned (before or after it was built).")],
    [__("Traditional Home"), __("A family of creatures, or beings, has lived within the fortress since it was built. They may be mascots, or serve some deeper purpose.")],
    [__("Hallowed Ground"), __("A central area of the site featured markings someone viewed as being of great importance, so the fortress was built around and preserved.")]
]);

const ODDITIES = seq([
    [__("Haunted"), __("A local spirit occupies the fortress, perhaps an ex-resident or someone linked to the grounds.")],
    [__("Mystery Door"), __("A door is, and always has been, stuck shut. Plans of the fortress show no room there.")],
    [__("Breeze"), __("Even in closed rooms with no external doors, there is always a tiny breeze that makes cloaks swirl lightly.")],
    [__("Phantom Sounds"), __("In specific areas, indistinct snippets of conversation and activity can be heard from nearby rooms, but nothing is ever there.")],
    [__("Rumbles"), __("On rare occasions, soft reverberations can be felt from deep underground beneath the fortress.")],
    [__("Moody Room"), __("A particular chamber puts those inside it into a particular mood, regardless of how they felt before entering.")],
    [__("Dead End"), __("A hallway leads to a dead end with no discernible purpose.")],
    [__("Strange Visitors"), __("On occasion, the fortress is visited by unusual beings or creatures. No one knows where they come from.")],
    [__("Creaky Step"), __("A single solid stone step on a certain stairwell creaks regardless of maintenance.")],
    [__("Watchful Beast"), __("A small local creature sits on windowsills and in doorways, staring unblinking at anyone in the room, and vanishes when approached.")],
    [__("Missing Things"), __("Small, miscellaneous items seem to go missing without notice.")],
    [__("Inexplicable Furnishings"), __("One substantial item has been there since the fortress was built and no one knows where it came from. People feel uneasy near it, but can never get rid of it.")]
]);

const SPECIAL_FEATURE = seq([
    [__("Resident - Great Person"), __("A person of significance, or renown, lives here.")],
    [__("Resident - Creature or Monster"), __("A beast, monster or uncivilised entity resides here, by choice or as a captive.")],
    [__("Magical Properties"), __("The structure and/or its surroundings have magical properties.")],
    [__("Unknown Origin"), __("No one knows where this structure came from, or how it was built.")],
    [__("Intriguing Purpose"), __("The structure was built to do something unusual.")],
    [__("Catastrophic Event"), __("The structure was the site of a terrible or tragic incident.")],
    [__("Miraculous Event"), __("The structure was the site of something miraculous or amazing.")],
    [__("Bizarre Location"), __("The structure is built in an atypical kind of location.")]
]);

// Feature specifics, in the same order as the special feature table (null when there is no sub-table)
const FEATURE_SPECIFICS = [
    [8, seq([
        [__("Hero"), __("Known for good deeds, performed selflessly for the benefit of others.")],
        [__("Villain"), __("Known for committing dreadful atrocities.")],
        [__("Thinker"), __("Known for wisdom and enlightenment (philosopher, naturalist, scientist, etc).")],
        [__("Artist"), __("Known for creating works of exceptional beauty.")],
        [__("Writer"), __("Known for exquisite written prowess, riveting tales or accounts of pivotal events.")],
        [__("Warrior"), __("Known for martial prowess, or valor, in battle.")],
        [__("Arcanist"), __("Known for magical ability or expertise.")],
        [__("Priest"), __("Known for having a special connection to the divine.")]
    ])],
    [10, seq([
        [__("Beast"), __("A noteworthy, but non-sentient, beast.")],
        [__("Beast (Sentient)"), __("An animal that can think and speak.")],
        [__("Elemental"), __("A being of a single, pure elemental energy.")],
        [__("Fey"), __("A resident of the fey realm.")],
        [__("Savage Humanoid"), __("A gnoll, orc or other brutal marauder.")],
        [__("Goblinoid"), __("A goblin, hobgoblin or bugbear.")],
        [__("Giant"), __("An ogre, giant or troll.")],
        [__("Kobold"), __("A bipedal reptile with distant draconic ancestry.")],
        [__("Monstrosity"), __("A terrifying, unnatural creature.")],
        [__("Undead"), __("A zombie, vampire, spirit or other creature linked with undeath.")]
    ])],
    [10, seq([
        [__("Flying"), __("The fortress can be, or is always, airborne, sustained by a ritual, enchanted object or individual.")],
        [__("Dreamer"), __("The fortress is mentally tethered to a mortal mind. While they dream, the fortress appears nearby.")],
        [__("Spells of Binding"), __("Magic augmented the building process, strengthening the overall structure exponentially.")],
        [__("Speech"), __("The fortress is sentient and communicates telepathically with those it chooses.")],
        [__("Exuding Presence"), __("The fortress exudes an unseen aura that influences the emotional state of visitors, friend or foe.")],
        [__("Desecrated Ground"), __("The bodies of the fallen tend to rise and turn against their living comrades.")],
        [__("Deceptive"), __("The fortress appears differently to onlookers outside its walls than to those inside.")],
        [__("Nexus"), __("Magic here is more potent, but the veil between worlds is thin and otherworldly entities may be drawn in.")],
        [__("Teleportation"), __("The fortress can magically change location instantly.")],
        [__("Phasing"), __("The fortress can shift from one plane of existence to another, but remains in the same physical location.")]
    ])],
    [4, seq([
        [__("Extraplanar"), __("The fortress popped into existence instantaneously.")],
        [__("Unseen Hands"), __("The fortress was built without anyone seeing a builder. It seemed to grow, unobserved, each day.")],
        [__("Stranger"), __("Someone integral to the inception of the fortress was unknown to anyone else involved.")],
        [__("No Records"), __("The builders are no longer around, and no records give clues as to who they were.")]
    ])],
    [6, seq([
        [__("Protection"), __("The fortress was built to keep something safe. It is no secret that it resides here.")],
        [__("Hiding"), __("The fortress was built to keep something from being found.")],
        [__("Hint"), __("The fortress was built to act as a clue to some greater mystery.")],
        [__("Instruction"), __("The fortress was built with a lesson in mind, to teach those who look upon it.")],
        [__("Imprisonment"), __("The fortress was built to keep something out of others' hands, or from being unleashed on the world.")],
        [__("Connection"), __("The fortress was built to accommodate a magical or extraplanar portal.")]
    ])],
    [6, seq([
        [__("Natural Disaster"), __("A major storm, earthquake or other calamity struck this place.")],
        [__("Battle"), __("This was the site of a brutal, devastating conflict.")],
        [__("Genocide"), __("An attempt was made to wipe a people, or creature, from existence here.")],
        [__("Betrayal"), __("A significant trust was broken here.")],
        [__("Curse"), __("The fortress, or the area in general, was placed under a vindictive spell.")],
        [__("Summoning"), __("A terrible creature, or otherworldly being, was summoned from within the fortress, and may remain nearby.")]
    ])],
    [8, seq([
        [__("Found Anew"), __("Something (or someone) of incredible significance was rediscovered here.")],
        [__("Salvation"), __("Someone in dire peril was saved here.")],
        [__("Odds Defied"), __("Victory was snatched from the jaws of defeat here, when all hope seemed lost.")],
        [__("Divine Intervention"), __("A god made their will known directly here.")],
        [__("Sacrifice"), __("Someone gave up something very dear to them here, in service to a higher cause.")],
        [__("Prophecy Fulfilled"), __("Events previously foretold saw their culmination here.")],
        [__("Death Refused"), __("Someone who should have died managed to retain their grasp on life here.")],
        [__("Quest Accomplished"), __("A great mission was concluded here.")]
    ])],
    [8, seq([
        [__("Abyss or Chasm"), __("The fortress is built on a platform suspended directly over a deep hole or crevasse.")],
        [__("Sky"), __("The fortress floats or hovers in mid-air, on a cloud or a platform suspended by magic or technology.")],
        [__("Active Volcano"), __("The fortress is built on, or inside, an active volcano.")],
        [__("Beneath the Surface"), __("The fortress is under an environment where one might not expect it, such as underwater, sand or mud.")],
        [__("Mobile"), __("The fortress is built to move: on wheels, organic legs, a massive beast, a platform or a magical landmass.")],
        [__("Nested Environment"), __("The fortress is built within a separate environment that exists within the primary one, with discernible borders.")],
        [__("Beast Colony"), __("The fortress is built in the midst of a colony of uncivilized creatures or animals.")],
        [__("Unnatural Object"), __("The fortress is built upon, or around, a strange, foreign item fallen from the heavens or another plane.")]
    ])]
];

// Keep tables
const WALL_THICKNESS = [
    [1, __("1 ft."), __("Single line, 0 squares.")],
    [3, __("2.5 ft."), __("Half a square.")],
    [7, __("5 ft."), __("1 square.")],
    [9, __("10 ft."), __("2 squares.")],
    [10, __("15 ft."), __("3 squares.")]
];
const WALL_FEET = [1, 2.5, 5, 10, 15];

const SHAPE = [
    [3, __("Box"), __("A square or rectangular keep maximizes internal space and is easier to construct and furnish.")],
    [6, __("Round"), __("A circular keep deflects weather and weak or glancing blows, but its interior can be limited.")]
];

// Fifth item: side of a box keep, in squares; sixth: diameter of a round keep
const KEEP_SIZE = [
    [6, __("Small"), __("Base size modifier 1."), null, 5, 7],
    [14, __("Medium"), __("Base size modifier 2."), null, 7, 9],
    [19, __("Large"), __("Base size modifier 3."), null, 9, 11],
    [20, __("Very Large"), __("Base size modifier 4."), null, 11, 13]
];

const FLOORS = [
    [2, __("One"), __("One above-ground floor, no cellar.")],
    [6, __("Two"), __("One above-ground floor and a cellar.")],
    [13, __("Three"), __("Two above-ground floors and a cellar.")],
    [17, __("Four"), __("Three above-ground floors and a cellar.")],
    [19, __("Five"), __("Four above-ground floors and a cellar.")],
    [20, __("Six"), __("Five above-ground floors and a cellar.")]
];

const RAISED_ENTRANCE = [
    [8, __("Ground level"), __("The entrance is on ground level.")],
    [20, __("Raised"), __("Stairs lead to an upper-floor entry, wrapping around the structure if necessary.")]
];

const ENTRY_DEFENSES = [
    [1, __("Simple heavy door"), __("A simple heavy door guards the entry.")],
    [10, __("Reinforced heavy door"), __("A reinforced heavy door guards the entry.")],
    [14, __("Portcullis"), __("A heavy grate of metal can be raised and lowered across the entry.")],
    [18, __("Drawbridge"), __("A bridge can be raised and lowered. At a raised entrance a gap is left between the stairs and the entry; at ground level a pit is dug in front of it.")],
    [20, __("Portcullis and drawbridge"), __("Both a portcullis and a drawbridge defend the entry.")]
];

const FURNISHINGS = [
    [2, __("Poor"), __("The contents are very simplistic, of inferior quality, or in disrepair.")],
    [6, __("Basic"), __("Most contents are very basic, of poor quality or in poor condition, though some may be decent.")],
    [14, __("Decent"), __("The contents are of serviceable quality, or in good condition.")],
    [19, __("Good"), __("Most contents are of decent quality or in good condition, and some may be excellent.")],
    [20, __("Fine"), __("The contents are all of superlative quality, or in excellent condition.")]
];

const ROOMS = [
    [3, __("Bedroom"), __("Area designated for resting, containing a bed or beds.")],
    [5, __("Dining and Receiving"), __("General area with tables, as well as benches and/or chairs.")],
    [7, __("Kitchen"), __("Area for cooking and food preparation.")],
    [8, __("Chapel"), __("Area designated for worship, meditation or spiritual instruction.")],
    [9, __("Guard Bunks"), __("Quarters for guards and their equipment.")],
    [10, __("Cell"), __("Holding area for prisoner(s).")],
    [11, __("Closet"), __("Storage for clothing.")],
    [12, __("Equipment Storage"), __("Storage for household and defensive equipment.")],
    [13, __("General Storage"), __("Storage for non-food, non-equipment supplies.")],
    [14, __("Guest Quarters"), __("Area set aside for guest occupation.")],
    [15, __("Larder"), __("Food storage, typically placed in the cellar where it stays cool.")],
    [16, __("Library"), __("Area for records, books and/or study.")],
    [17, __("Privy"), __("Indoor alternative to a separate outhouse.")],
    [18, __("Solar"), __("Living/recreational room for the main resident(s).")],
    [19, __("Stables"), __("Houses mounts for residents and visitors, attached to the outer wall of the keep.")],
    [20, __("Servant Quarters"), __("Area for a servant (or servants) to sleep and store their possessions.")]
];

// Castle tables
const ADVANTAGES = {
    [__("None")]: __("There were no natural advantages that could be exploited."),
    [__("Hill")]: __("The fortress is built on a naturally occurring hill."),
    [__("Carved")]: __("The fortress has been at least partially carved into its surrounding environment."),
    [__("Cliff")]: __("The castle has been built at the top of a tall cliff."),
    [__("Surrounded by natural water")]: __("Water in the environment partially, or completely, surrounds the site."),
    [__("Congested approach(es)")]: __("Natural obstacles are spaced close together, making quick and direct movement difficult."),
    [__("Narrow approach(es)")]: __("The castle takes advantage of formations such as tight canyons and ravines."),
    [__("Treacherous approach(es)")]: __("The ground may be difficult, painful or even deadly to pass through, such as a murky bog, burning sands or loose rocks.")
};
const ENVIRONMENT_ADVANTAGES = [
    [__("None"), __("Hill"), __("Cliff"), __("Surrounded by natural water")],
    [__("None"), __("Hill"), __("Cliff"), __("Congested approach(es)")],
    [__("Narrow approach(es)"), __("Treacherous approach(es)"), __("Cliff"), __("Carved")],
    [__("None"), __("None"), __("Hill"), __("Narrow approach(es)")],
    [__("Congested approach(es)"), __("Narrow approach(es)"), __("Treacherous approach(es)"), __("Surrounded by natural water")],
    [__("None"), __("None"), __("Treacherous approach(es)"), __("Congested approach(es)")],
    [__("None"), __("Narrow approach(es)"), __("Congested approach(es)"), __("Carved")],
    [__("None"), __("None"), __("Narrow approach(es)"), __("Cliff")],
    [__("Treacherous approach(es)"), __("Narrow approach(es)"), __("Cliff"), __("Carved")],
    [__("Narrow approach(es)"), __("Treacherous approach(es)"), __("Hill"), __("Cliff")]
];

const STYLE = [
    [3, __("Motte-and-Bailey"), __("The keep is built on an earthen mound or hill, surrounded by a high fence or wall extending down the hill to form a large circular yard (the bailey) with the other buildings.")],
    [6, __("Shell Keep"), __("The keep is surrounded by a circular wall, with lightweight buildings built against the inside of the wall.")],
    [16, __("Fortified Keep"), __("The keep is positioned within (or connected to) a surrounding wall. Towers are typically placed along the wall.")],
    [20, __("Concentric"), __("Like a fortified keep, but with a second wall surrounding everything. Outbuildings of lesser strategic value may sit in the additional space.")]
];

const CASTLE_SIZE = [
    [6, __("Small"), __("Base size modifier 1.")],
    [14, __("Medium"), __("Base size modifier 2.")],
    [19, __("Large"), __("Base size modifier 3.")],
    [20, __("Very Large"), __("Base size modifier 4.")]
];

const TOWER_SHAPE = [[3, __("Box")], [6, __("Round (Cylinder)")]];
// Fifth item: height over the wall in feet; sixth: box side; seventh: round diameter
const TOWER_SIZE = [
    [4, __("Small"), "", null, 0, 5, 7],
    [12, __("Medium"), "", null, 10, 5, 7],
    [18, __("Large"), "", null, 20, 7, 9],
    [20, __("Very Large"), "", null, 30, 7, 9]
];
const TOWER_ROOF = [[2, __("Uncovered")], [4, __("Flat Roof")], [7, __("Shallow Slope Roof")], [8, __("Steep Slope Roof")]];

// Fifth item: [stone, wood] in feet
const CURTAIN_THICKNESS = [
    [6, __("10 ft. / 5 ft."), __("Stone / Wood."), null, [10, 5]],
    [14, __("15 ft. / 10 ft."), __("Stone / Wood."), null, [15, 10]],
    [19, __("20 ft. / 15 ft."), __("Stone / Wood."), null, [20, 15]],
    [20, __("25 ft. / 20 ft."), __("Stone / Wood."), null, [25, 20]]
];
const CURTAIN_HEIGHT = [
    [6, __("10 ft. / 10 ft."), __("Stone / Wood."), null, [10, 10]],
    [14, __("20 ft. / 15 ft."), __("Stone / Wood."), null, [20, 15]],
    [19, __("30 ft. / 20 ft."), __("Stone / Wood."), null, [30, 20]],
    [20, __("40 ft. / 25 ft."), __("Stone / Wood."), null, [40, 25]]
];

const BARBICAN = [
    [5, __("None"), __("The castle has no barbican.")],
    [11, __("Walled Approach"), __("The gatehouse leads to a walled approach.")],
    [17, __("Walled Approach with Drawbridge"), __("The gatehouse leads to a walled approach, ending in a drawbridge."), { moatMod: 2 }],
    [20, __("Double Drawbridge"), __("The gatehouse, preceded by a drawbridge, leads to a walled approach ending in an additional drawbridge."), { moatMod: 2 }]
];

const WALL_DEFENSES = seq([
    [__("Batters"), __("The bottom of the wall slopes outward and is much thicker, hindering siege towers, undermining and ladders, and removing the blindspot beneath defenders.")],
    [__("Bossing"), __("Stones protrude from the wall's surface, reducing impacts like catapult shots. Rounded protrusions avoid making the wall easier to climb.")],
    [__("Hoardings"), __("Temporary wooden shelters protrude from the top of the walls, letting defenders fire directly down on attackers. They need fireproofing but can be stored in peacetime.")],
    [__("Machicolations"), __("Permanent hoarding-like structures that let defenders fire directly down on attackers. Hoardings, if present, provide overhead cover.")],
    [__("Brattice"), __("A single projecting space placed over a vulnerable area such as a passage, allowing attacks directly below and flanking fire along the wall.")],
    [__("Magical Defenses"), __("The castle is protected by something magical. Roll on the magical defenses table.")]
]);

const MAGICAL_DEFENSES = seq([
    [__("Blocking Wards"), __("Wards prevent creatures or objects from passing a certain point. They can fail if damaged too much in a short span of time.")],
    [__("Aggressive Wards"), __("Wards unleash offensive attacks, such as bolts of fire or force, on unfortunate victims.")],
    [__("Unliving Sentinels"), __("The castle is guarded by spirits, shades, wraiths or other undead.")],
    [__("Alarm Wards"), __("Zones of magic create a warning sound if someone outside a predefined group enters.")],
    [__("Relocation Wards"), __("Wards teleport anyone in the area somewhere else, benign but far away, or harmful.")],
    [__("Unnatural Elemental Presence"), __("An element that does not naturally occur locally is present, such as a lava moat in a non-volcanic region.")]
]);

const MOAT = [
    [2, __("None"), __("The castle has no moat.")],
    [5, __("Dry Moat"), __("A deep pit encircles the fortification, purposefully or because of drought.")],
    [7, __("Dry Moat [Trapped]"), __("The moat is dry, but filled with extra defensive measures such as spikes or vicious animals.")],
    [9, __("Filled Moat"), __("A standard moat, filled with water.")],
    [10, __("Filled Moat [Trapped]"), __("The moat is filled with water and trapped, perhaps by a current or vicious aquatic animals.")]
];
const MOAT_WIDTH = [[10, __("15 ft.")], [14, __("20 ft.")], [17, __("25 ft.")], [19, __("30 ft.")], [20, __("35 ft.")]];
const MOAT_DEPTH = [[10, __("20 ft.")], [14, __("25 ft.")], [17, __("30 ft.")], [19, __("35 ft.")], [20, __("40 ft.")]];

const GATEHOUSE = [
    [6, __("Standard Gatehouse"), __("The same height as the wall and slightly thicker. Entry is covered by heavy doors.")],
    [16, __("Strong Gatehouse"), __("One and a half times the height and thickness of its wall. Entry is covered by heavy doors and a portcullis.")],
    [20, __("Grand Gatehouse"), __("Twice the height and thickness of its wall. Entry is covered by heavy doors and a portcullis.")]
];
const GATEHOUSE_FEATURES = [
    __("Second portcullis (Strong or Grand only)"), __("Murder holes"), __("Spouts"), __("Other traps")
];

const BARRACKS = [
    [1, __("Simple Room(s)"), __("Members of the garrison sleep wherever there is space in the castle.")],
    [5, __("Multiple, Separate Structures"), __("Multiple smaller buildings arranged near one another house the garrison, separated by rank or practicality.")],
    [12, __("Single, Separate Structure"), __("A single large building in the bailey houses the garrison, with separate quarters or common areas.")],
    [16, __("Built-On [Keep]"), __("The barracks are attached to the keep and house the garrison.")],
    [20, __("Built-In [Walls]"), __("The barracks are attached to (or in, if thick enough) the fortress walls.")]
];

const OUTBUILDING_SIZE = [
    [6, __("Small"), __("6x6 / 36 squares")],
    [14, __("Medium"), __("8x8 / 64 squares")],
    [19, __("Large"), __("10x10 / 100 squares")],
    [20, __("Very Large"), __("12x12 / 144 squares")]
];
const OUTBUILDING_PURPOSES = [
    __("Servant's Quarters"), __("Kitchens"), __("Bake House"), __("Chapel/Priest's Home"), __("Stables"), __("Storage"), __("Forge")
];

// Stronghold tables. The fourth item holds the effects applied to the upgrade summary.
const STYLE_AMPLIFICATION = [
    [1, __("Additional Curtain Wall"), __("The entire fortification is surrounded by an additional wall, with thickness and height equal to (or less than) your other curtain walls."), { note: __("An additional curtain wall surrounds the fortification.") }],
    [2, __("Low Hulk"), __("The fortress favors reinforcement over height, creating a low-slung, brutish construction. Keep: -1 floor (min. 1 above-ground floor and a cellar), +2 floor area, +5 ft. exterior wall thickness. Castle: -10 ft. wall and tower height (min. 10 ft.), +5 ft. wall thickness, Batters added."),
        { keepFloors: -1, keepArea: 2, keepWall: 5, wallHeight: -10, wallThickness: 5, defenses: [__("Batters")] }],
    [3, __("Great Drums"), __("Keep, towers and curtain walls are built with curving surfaces to deflect weaponry and weather. Box-shaped keeps and towers become round, exterior wall and curtain wall thickness +5 ft."),
        { roundKeep: true, roundTowers: true, keepWall: 5, wallThickness: 5 }],
    [4, __("Tiered"), __("A heavy wall surrounds the perimeter at ground level and the fortress rises in stepped elevation to a high peak. Keep: +1 floor. Castle: outermost wall thickness +5 ft., wall and tower height +5 ft."),
        { keepFloors: 1, wallThickness: 5, wallHeight: 5 }],
    [5, __("Massive Curtain Walls"), __("The curtain walls and keep exterior walls are huge. Curtain wall thickness +10 ft., wall and tower height +10 ft."),
        { wallThickness: 10, wallHeight: 10 }],
    [6, __("Bristling Defenses"), __("There are more defenses than there otherwise might be. Roll 1 additional time on the curtain wall defenses table."), { extraDefense: 1 }],
    [7, __("Fortified Entries"), __("Special focus has been placed on the entrances. Keep: reinforced heavy door with portcullis and drawbridge. Castle: maximum barbican (drawbridge, gatehouse, walled approach, drawbridge) and Grand gatehouses."),
        { fortifiedEntries: true }],
    [8, __("Great Moat"), __("The perimeter is surrounded by a massive moat of any type (dry, dry [trapped], filled or filled [trapped]), 35 ft. across and 40 ft. deep."), { greatMoat: true }],
    [9, __("Mighty Keep"), __("The keep is especially robust. +2 floor area, +5 ft. exterior wall thickness, +1 floor."),
        { keepArea: 2, keepWall: 5, keepFloors: 1 }],
    [10, __("Watchful"), __("Vigilance is of paramount importance. +2 towers, +2 floor area for all towers, +10 ft. tower height."),
        { towers: 2, towerArea: 2, towerHeight: 10 }],
    [11, __("Under Cover"), __("The wall-walks are covered with permanent fortifications. Curtain wall thickness +5 ft., Machicolations added."),
        { wallThickness: 5, defenses: [__("Machicolations")] }],
    [12, __("Magical Forms"), __("Magical runes, symbols or patterns were worked into the construction. Roll once on the magical defenses table."), { magic: 1 }]
];

const ADDITIONAL_THICKNESS = [[6, 5], [14, 10], [19, 15], [20, 20]];
const ADDITIONAL_HEIGHT = [[6, 20], [14, 25], [19, 30], [20, 35]];

const BRUTAL_DEFENSES = [
    [8, __("Stalwart Defenders"), __("A portion of the defenders are extremely well-trained in warfare and siegecraft, and particularly loyal.")],
    [9, __("Shards"), __("Fragments of metal, glass and broken pottery are built into the walls, making any climbing an eviscerating nightmare.")],
    [10, __("Scythe"), __("A massive blade sheers across the face of the wall, shaving any enemies or equipment from its surface.")],
    [11, __("Quake"), __("A subterranean device of magic or technology sends shivering impacts through the area around the outer wall.")],
    [12, __("Rolling Pin"), __("Massive timbers or stone cylinders on axles roll down the wall and across the ground, crushing all in their path. Chains raise them back.")],
    [13, __("Oiled Surface"), __("The wall is oiled, making it slick and very difficult to climb. It can also be set ablaze.")],
    [14, __("Gas Spouts"), __("Pipes in the wall expel noxious fumes from deep in the earth that cascade over the ranks of the enemy.")],
    [15, __("Wall of Darts"), __("The walls are set with dart traps that can be triggered when the walls are being swarmed.")],
    [16, __("Vertigo"), __("Forced perspective makes walls appear much higher than they are, triggering dizziness and disorientation in attackers.")],
    [17, __("Mighty Adhesive"), __("The defenses are covered in a gelatinous adhesive that reduces impacts and holds onto projectiles and attackers, turning them into obstacles.")],
    [18, __("Tar Fields"), __("The open areas leading to the stronghold are saturated with tar, and can be lit on fire.")],
    [19, __("Melded Guardians"), __("Creatures, such as animated constructs or encouraged beasts, dwell within the defenses or the surrounding area and emerge when attackers reach them.")],
    [20, __("Thunder Horn"), __("A massive horn bolsters the resolve of defenders and batters attackers with gale-force winds when sounded.")]
];

// Reference figures: schematic SVGs redrawn from the book's diagrams (not exported to TXT).
let figureId = 0;

function figure(svg, caption) {
    return `<div class="fortress-figure text-center my-3">${svg}<div class="small text-secondary mt-1">${caption}</div></div>`;
}

function gridLines(x, y, w, h, cell) {
    let lines = "";
    for (let i = 0; i <= Math.round(w / cell); i++) {
        lines += `<line x1="${x + i * cell}" y1="${y}" x2="${x + i * cell}" y2="${y + h}"/>`;
    }
    for (let i = 0; i <= Math.round(h / cell); i++) {
        lines += `<line x1="${x}" y1="${y + i * cell}" x2="${x + w}" y2="${y + i * cell}"/>`;
    }
    return `<g stroke="#9aa5b1" stroke-width="0.6">${lines}</g>`;
}

function keepSvg(round, squares, wallFeet) {
    const cell = squares > 11 ? 10 : 13;
    const wall = Math.max(1.5, (wallFeet / 5) * cell);
    const size = squares * cell;
    const total = size + wall * 2 + 4;
    const origin = 2 + wall;
    const id = `keepclip${figureId++}`;
    const label = `<text x="${total / 2}" y="${total / 2 + 3}" text-anchor="middle" font-size="9" fill="#475569">${squares}${round ? __(" (diameter)") : `x${squares}`}</text>`;

    if (round) {
        const center = total / 2;
        return `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" role="img" aria-label="Keep floor plan">
            <defs><clipPath id="${id}"><circle cx="${center}" cy="${center}" r="${size / 2}"/></clipPath></defs>
            <circle cx="${center}" cy="${center}" r="${size / 2 + wall}" fill="#111"/>
            <circle cx="${center}" cy="${center}" r="${size / 2}" fill="#fff"/>
            <g clip-path="url(#${id})">${gridLines(origin, origin, size, size, cell)}</g>${label}</svg>`;
    }

    return `<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" role="img" aria-label="Keep floor plan">
        <rect x="2" y="2" width="${size + wall * 2}" height="${size + wall * 2}" fill="#111"/>
        <rect x="${origin}" y="${origin}" width="${size}" height="${size}" fill="#fff"/>
        ${gridLines(origin, origin, size, size, cell)}${label}</svg>`;
}

function gridShape(cells, cell) {
    const rects = cells.map(([cx, cy]) => `<rect x="${2 + cx * cell}" y="${2 + cy * cell}" width="${cell}" height="${cell}"/>`).join("");
    return `<g fill="#fff" stroke="#111" stroke-width="1.2">${rects}</g>`;
}

function mapSizeFigure() {
    const cell = 12;
    const full = (w, h, skip = []) => {
        const cells = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!skip.some(([sx, sy]) => sx === x && sy === y)) {
                    cells.push([x, y]);
                }
            }
        }
        return cells;
    };
    const draw = (cells, w, h, caption) => `<div class="d-inline-block mx-2 align-top"><svg width="${w * cell + 4}" height="${h * cell + 4}">${gridShape(cells, cell)}</svg><div class="small text-secondary">${caption}</div></div>`;

    return `<div class="fortress-figure text-center my-3">${draw(full(5, 5), 5, 5, __("25 squares"))}${draw(full(6, 4), 6, 4, __("24 squares"))}${draw(full(5, 5, [[4, 0]]), 5, 5, __("24 squares"))}<div class="small text-secondary mt-1">${__("Reference: map size can be altered (e.g. a 5x5 keep as a 6x4 rectangle, or with a notch) while keeping a similar area.")}</div></div>`;
}

function wallReferenceFigure(wallFeet) {
    const cell = 14;
    const widths = [[1, 1.5, __("1 ft. (single line)")], [2.5, cell / 2, __("2.5 ft. (half square)")], [5, cell, __("5 ft. (full square)")]];
    const items = widths.map(([feetValue, width, caption]) => {
        const marked = feetValue === wallFeet;
        return `<div class="d-inline-block mx-2 align-top"><svg width="${cell * 3 + 12}" height="${cell * 3 + 8}">
            ${gridLines(8, 4, cell * 3, cell * 3, cell)}
            <rect x="${8 - width}" y="4" width="${width}" height="${cell * 3}" fill="${marked ? "#dc2626" : "#111"}"/></svg>
            <div class="small ${marked ? "fw-bold text-danger" : "text-secondary"}">${caption}</div></div>`;
    }).join("");

    return `<div class="fortress-figure text-center my-3">${items}<div class="small text-secondary mt-1">${__("Reference: walls of 5 ft. or less are mapped as a line, half a square or a full square; thicker walls take 2-3 squares. The wall sits outside the room's dimensions.")}</div></div>`;
}

function styleSvg(name) {
    const stroke = __('stroke="#111" stroke-width="2" fill="#fff"');
    const keepBox = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" ${stroke}/><rect x="${x + 4}" y="${y + 4}" width="${s - 8}" height="${s - 8}" ${stroke}/><text x="${x + s / 2}" y="${y + s / 2 + 5}" text-anchor="middle" font-size="14" font-weight="bold">${__("K")}</text>`;
    const tower = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" ${stroke}/>`;
    const round = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" ${stroke}/><circle cx="${x}" cy="${y}" r="${r - 4}" fill="none" stroke="#111" stroke-width="1"/>`;
    const building = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e5e7eb" stroke="#111" stroke-width="1.2"/>`;
    let body;

    if (name === __("Motte-and-Bailey")) {
        body = `<path d="M10 140 L10 100 Q50 100 70 70 L90 60 Q120 90 150 105 Q185 112 210 112 L210 140 Z" fill="#e5e7eb" stroke="#111" stroke-width="2"/>
            <rect x="52" y="44" width="40" height="22" ${stroke}/><text x="72" y="60" text-anchor="middle" font-size="14" font-weight="bold">${__("K")}</text>
            ${building(150, 98, 18, 10)}${building(172, 98, 22, 10)}${building(160, 88, 16, 10)}`;
    } else if (name === __("Shell Keep")) {
        body = `<circle cx="110" cy="80" r="62" fill="#fff" stroke="#111" stroke-width="10"/>
            ${keepBox(86, 56, 48)}${building(60, 50, 12, 18)}${building(148, 46, 12, 18)}${building(66, 96, 14, 14)}${building(144, 100, 14, 14)}${building(100, 122, 22, 8)}`;
    } else if (name === __("Fortified Keep")) {
        body = `<polyline points="40,30 190,30 190,130 60,130" fill="none" stroke="#111" stroke-width="6"/>
            <line x1="40" y1="30" x2="40" y2="100" stroke="#111" stroke-width="6"/>
            ${tower(28, 18, 24)}${tower(178, 18, 24)}${tower(178, 118, 24)}${tower(40, 108, 24)}
            ${keepBox(100, 40, 70)}${building(70, 50, 22, 18)}`;
    } else {
        body = `<rect x="22" y="14" width="176" height="140" fill="none" stroke="#111" stroke-width="5"/>
            <rect x="52" y="40" width="116" height="90" fill="none" stroke="#111" stroke-width="3"/>
            ${round(22, 14, 12)}${round(198, 14, 12)}${round(22, 154, 12)}${round(198, 154, 12)}
            ${tower(44, 32, 16)}${tower(160, 32, 16)}${tower(44, 122, 16)}${tower(160, 122, 16)}
            ${keepBox(80, 52, 44)}${building(132, 56, 24, 12)}${building(86, 104, 40, 14)}${building(86, 142, 48, 8)}`;
    }

    return `<svg width="220" height="170" viewBox="0 0 220 170" role="img" aria-label="${name} layout">${body}</svg>`;
}

function levelRolls() {
    addSection(__("General"));
    addField("age", __("Age"));
    addField("location", __("Location in Relation to Settlement"));
    addField("environment", __("Environment"));
    addField("condition", __("Condition"));
    addField("expense", __("Expense"));
    addField("material", __("Primary Building Material"));
    addField("reason", __("Reason for Construction"));
    addField("design", __("Design Theme"));
    addField("resourceOrigin", __("Resource Origin"));
    addField("localImpact", __("Local Impact"));
    addField("alternateEntries", __("Alternate Entries"));
    addField("residentRelations", __("Resident Relations"));
    addField("residents", __("Residents"));
    addField("residentAttitude", __("Resident Attitude"));
    addField("garrisonSize", __("Garrison Size"));
    addField("garrisonEquipment", __("Garrison Equipment"));
    addField("residentHobbies", __("Resident Hobbies"));
    addField("currentIssue", __("Current Issue"));
    addField("secrets", __("Secrets"));
    addField("history", __("History"));
    addField("oddities", __("Oddities"));
    addField("specialFeature", __("Special Feature"));

    generalValues();

    if (LEVEL >= 1) {
        addSection(__("Keep"));
        addField("wallThickness", __("Exterior Wall Thickness"));
        addField("shape", __("Shape"));
        addField("size", __("Size"));
        addField("floors", __("Number of Floors"));
        addField("raisedEntrance", __("Raised Entrance"));
        addField("entryDefenses", __("Entry Defenses"));
        addField("furnishings", __("Furnishings"));
        addField("rooms", __("Rooms"));
        keepValues();
    }

    if (LEVEL >= 2) {
        addSection(__("Castle"));
        addField("geographicAdvantage", __("Geographic Advantages"));
        addField("style", __("Style"));
        addField("castleSize", __("Size"));
        addField("towers", __("Curtain Wall Towers"));
        addField("wallThickness2", __("Curtain Wall Thickness"));
        addField("wallHeight", __("Curtain Wall Height"));
        addField("barbican", __("Barbican"));
        addField("wallDefenses", __("Curtain Wall Defenses"));
        addField("moat", __("Moat"));
        addField("gatehouses", __("Gatehouses"));
        addField("barracks", __("Barracks Location"));
        addField("outbuildings", __("Bailey Outbuildings"));
        castleValues();
    }

    if (LEVEL >= 3) {
        addSection(__("Stronghold"));
        addField("extraTowers", __("Additional Curtain Wall Towers"));
        addField("styleAmplification", __("Style Amplification"));
        addField("extraThickness", __("Additional Curtain Wall Thickness"));
        addField("extraHeight", __("Additional Curtain Wall Height"));
        addField("brutalDefenses", __("Brutal Defenses"));
        addField("upgradeSummary", __("Upgraded Fortress"));
        strongholdValues();
    }
}

function rollIssue() {
    const { entry } = pick(20, CURRENT_ISSUE);
    if (entry[1] === __("Peaceful")) {
        return entry[1] + ". " + entry[2];
    }
    return `<b>${entry[1]}.</b> ${entry[2]}${__(" Severity: ")}${describe(pick(6, ISSUE_SEVERITY).entry)}`;
}

function generalValues() {
    rollTable("age", 20, AGE);
    rollTable("location", 20, LOCATION);
    state.environment = rollTable("environment", 10, ENVIRONMENT).entry[0] - 1;

    const condition = rollTable("condition", 20, CONDITION, "conditionMod");
    state.ruined = condition.entry[1] === __("Ruin or Bare Bones");

    state.expense = EXPENSE.indexOf(rollTable("expense", 20, EXPENSE).entry);

    setGenContext("material");
    const material = pick(20, MATERIAL).entry;
    let text = describe(material);
    if (material[1] === __("Unique Materials")) {
        text += `<br><b>${__("Unique material:")}</b> ${describe(pick(6, UNIQUE_MATERIAL).entry)}`;
    }
    state.woodWalls = material[1] === __("Timber");
    show("material", text);

    rollTable("reason", 10, REASON);
    rollTable("design", 8, DESIGN);
    rollTable("resourceOrigin", 20, RESOURCE_ORIGIN);

    setGenContext("localImpact");
    show("localImpact", `${describe(pick(6, LOCAL_IMPACT).entry)}<br><b>${__("Change over time (optional):")}</b> ${describe(pick(6, IMPACT_CHANGE).entry)}`);

    rollTable("alternateEntries", 20, ALTERNATE_ENTRY);
    rollTable("residentRelations", 12, RESIDENT_RELATIONS);
    rollTable("residents", 20, RESIDENTS, "residentsMod");
    rollTable("residentAttitude", 6, RESIDENT_ATTITUDE);

    const garrison = rollTable("garrisonSize", 20, GARRISON_SIZE);
    state.garrisonBunks = Boolean(garrison.entry[4]);
    rollTable("garrisonEquipment", 20, GARRISON_EQUIPMENT);

    setGenContext("residentHobbies");
    show("residentHobbies", `<b>${HOBBIES[rollDie(20) - 1]}.</b>${__(" Roll again for each major individual or group if desired.")}`);

    setGenContext("currentIssue");
    const issues = [];
    if (state.ruined) {
        issues.push(`<b>${__("Structural Damage [")}${rollDie(6) <= 3 ? __("Weather") : __("Neglect")}].</b>${__(" The ruined condition guarantees damage. Severity: ")}${describe(pick(6, ISSUE_SEVERITY).entry)}`);
    }
    issues.push(rollIssue());
    show("currentIssue", issues.join("<br>"));

    rollTable("secrets", 12, SECRETS);
    rollTable("history", 10, HISTORY);
    rollTable("oddities", 12, ODDITIES);

    setGenContext("specialFeature");
    const feature = pick(8, SPECIAL_FEATURE);
    const [sides, table] = FEATURE_SPECIFICS[feature.entry[0] - 1];
    show("specialFeature", `${describe(feature.entry)}<br><b>${__("Specifics:")}</b> ${describe(pick(sides, table).entry)}`);
}

function keepValues() {
    const keep = state.keep;

    const wall = rollTable("wallThickness", 10, WALL_THICKNESS);
    keep.wall = WALL_FEET[WALL_THICKNESS.indexOf(wall.entry)];
    document.getElementById("wallThickness").innerHTML += wallReferenceFigure(keep.wall);

    keep.round = rollTable("shape", 6, SHAPE).entry[1] === __("Round");

    const size = rollTable("size", 20, KEEP_SIZE).entry;
    const bsm = KEEP_SIZE.indexOf(size) + 1;
    keep.area = keep.round ? size[5] : size[4];
    show("size", `${describe(size)}${__(" Floor space: ")}${keep.round ? `${size[5]}${__(" squares across")}` : `${size[4]}x${size[4]}${__(" squares")}`}${__(" (1 square = 5 ft.).")}${figure(keepSvg(keep.round, keep.area, keep.wall), __("Reference: keep floor plan to scale, walls in black (1 square = 5 ft.)."))}${mapSizeFigure()}`);

    const floors = rollTable("floors", 20, FLOORS).entry;
    const totalFloors = FLOORS.indexOf(floors) + 1;
    keep.above = Math.max(1, totalFloors - 1);
    keep.cellar = totalFloors > 1;

    if (keep.above < 2) {
        show("raisedEntrance", __("<b>Skipped.</b> Only one above-ground floor."));
    } else {
        rollTable("raisedEntrance", 20, RAISED_ENTRANCE);
    }

    keep.entry = rollTable("entryDefenses", 20, ENTRY_DEFENSES).entry[1];
    rollTable("furnishings", 20, FURNISHINGS, "furnishingsMod");

    setGenContext("rooms");
    const starting = [__("Bedroom"), __("Kitchen"), __("Dining and Receiving")];
    if (state.garrisonBunks) {
        starting.push(__("Guard Bunks"));
    }

    const count = Math.max(1, bsm * totalFloors + modValue("roomsMod"));
    const rooms = [...starting];
    for (let i = starting.length; i < count; i++) {
        rooms.push(lookup(ROOMS, rollDie(20))[1]);
    }

    const tally = {};
    rooms.forEach(room => { tally[room] = (tally[room] || 0) + 1; });
    const list = Object.entries(tally).map(([room, amount]) => (amount > 1 ? `${room}${__(" x")}${amount}` : room));

    show("rooms", `<b>${plural(count, __("room"))}</b>${__(" (base size modifier ")}${bsm}${__(" x ")}${totalFloors}${__(" floors")}${modValue("roomsMod") ? `, ${formatSigned(modValue("roomsMod"))}${__(" condition")}` : ""}${__("). Starting rooms")}${state.garrisonBunks ? __(" (with Guard Bunks from the garrison)") : ""}${__(" count toward the total.")}<br>${list.join(", ")}.<br>${__("A privy is a free room in every keep.")}`);
}

function towerLine(tower, index, round) {
    const area = round ? `${tower.size[6]}${__(" squares across")}` : `${tower.size[5]}x${tower.size[5]}${__(" squares")}`;
    return `<b>${__("Tower ")}${index + 1}.</b> ${round ? __("Round (Cylinder)") : __("Box")}, ${tower.size[1]}${__(" (wall +")}${tower.size[4]}${__(" ft., ")}${area}), ${tower.roof}`;
}

function rollTower() {
    return { size: lookup(TOWER_SIZE, rollDie(20)), roof: lookup(TOWER_ROOF, rollDie(8))[1], round: rollDie(6) > 3 };
}

function castleValues() {
    const castle = state.castle;
    const wood = state.woodWalls ? 1 : 0;

    const advantages = ENVIRONMENT_ADVANTAGES[state.environment];
    setGenContext("geographicAdvantage");
    const advantage = advantages[rollDie(4) - 1];
    show("geographicAdvantage", `<b>${advantage}.</b> ${ADVANTAGES[advantage]}`);

    const style = rollTable("style", 20, STYLE).entry[1];
    castle.concentric = style === __("Concentric");
    document.getElementById("style").innerHTML += figure(styleSvg(style), `${__("Reference: ")}${style}${__(" layout (K = keep).")}`);

    const size = rollTable("castleSize", 20, CASTLE_SIZE).entry;
    castle.bsm = CASTLE_SIZE.indexOf(size) + 1;

    setGenContext("towers");
    const count = castle.bsm + rollDie(4);
    castle.towers = Array.from({ length: count }, rollTower);

    const thickness = rollTable("wallThickness2", 20, CURTAIN_THICKNESS).entry;
    const height = rollTable("wallHeight", 20, CURTAIN_HEIGHT).entry;
    castle.thickness = thickness[4][wood];
    castle.height = height[4][wood];
    show("wallThickness2", `<b>${feet(castle.thickness)}</b> (${state.woodWalls ? __("wood walls") : __("stone walls")}${__("; table: ")}${thickness[1]}).${castle.concentric ? __(" Concentric: the inner wall should be at least as high as the outer wall.") : ""}`);
    show("wallHeight", `<b>${feet(castle.height)}</b> (${state.woodWalls ? __("wood walls") : __("stone walls")}${__("; table: ")}${height[1]}).`);

    show("towers", `<b>${plural(count, __("tower"))}</b>${__(" (base size modifier ")}${castle.bsm}${__(" + 1d4). Tower height is the wall height plus the listed bonus.")}<br>${castle.towers.map((tower, i) => towerLine(tower, i, tower.round)).join("<br>")}`);

    castle.barbican = rollTable("barbican", 20, BARBICAN).entry[1];

    castle.defenses = [];
    castle.magic = [];
    rollDefenses(state.expense);
    show("wallDefenses", defensesText(state.expense));

    setGenContext("moat");
    const moat = pick(10, MOAT, "moatMod").entry;
    castle.moat = moat[1];
    let moatText = format(moat);
    if (moat[1] !== __("None")) {
        moatText += `${__(" Width: ")}${lookup(MOAT_WIDTH, rollDie(20))[1]}${__(". Depth: ")}${lookup(MOAT_DEPTH, rollDie(20))[1]}.`;
    }
    show("moat", moatText);

    setGenContext("gatehouses");
    const gates = 1 + (castle.barbican !== __("None") ? 1 : 0) + (castle.concentric ? 1 : 0);
    const lines = [];
    for (let i = 0; i < gates; i++) {
        const label = i === 0 ? __("Main wall") : (i === 1 && castle.barbican !== __("None") ? __("Barbican") : __("Outer wall"));
        lines.push(`<b>${label}:</b> ${describe(lookup(GATEHOUSE, rollDie(20)))}`);
    }
    show("gatehouses", `${lines.join("<br>")}<br><b>${__("Optional features:")}</b> ${GATEHOUSE_FEATURES.join("; ")}.`);

    rollTable("barracks", 20, BARRACKS);

    setGenContext("outbuildings");
    const outbuildings = Array.from({ length: castle.bsm + 1 }, () => lookup(OUTBUILDING_SIZE, rollDie(20)));
    show("outbuildings", `<b>${plural(outbuildings.length, __("outbuilding"))}</b>${__(" (base size modifier ")}${castle.bsm} + 1).<br>${outbuildings.map((item, i) => `<b>${__("Outbuilding ")}${i + 1}.</b> ${item[1]} - ${item[2]}`).join("<br>")}<br><b>${__("Possible purposes:")}</b> ${OUTBUILDING_PURPOSES.join(", ")}${__(". Servant's Quarters are required here if the keep has none.")}`);
}

// Rolls curtain wall defenses; every Magical Defenses result adds a magical defense roll.
function rollDefenses(rolls) {
    const castle = state.castle;

    for (let i = 0; i < rolls; i++) {
        const defense = lookup(WALL_DEFENSES, rollDie(6));
        if (defense[1] === __("Magical Defenses")) {
            castle.magic.push(lookup(MAGICAL_DEFENSES, rollDie(6)));
        } else if (!castle.defenses.includes(defense[1])) {
            castle.defenses.push(defense[1]);
        }
    }
}

function defensesText(rolls) {
    const castle = state.castle;
    const lines = [`<b>${plural(rolls, __("roll"))}</b>${__(" (set by expense). All walls have crenelations or basic cover.")}`];

    if (castle.defenses.length === 0 && castle.magic.length === 0) {
        lines.push(__("No additional defenses."));
    }
    castle.defenses.forEach(name => lines.push(describe(WALL_DEFENSES.find(entry => entry[1] === name))));
    castle.magic.forEach(entry => lines.push(`<b>${__("Magical Defenses - ")}${entry[1]}.</b> ${entry[2]}`));

    return lines.join("<br>");
}

function strongholdValues() {
    const castle = state.castle;
    const keep = state.keep;

    setGenContext("extraTowers");
    const extraTowers = rollDie(8);
    for (let i = 0; i < extraTowers; i++) {
        castle.towers.push(rollTower());
    }
    show("extraTowers", `<b>+${plural(extraTowers, __("tower"))}</b>${__(" (1d8) added to the castle's curtain wall towers.")}`);

    setGenContext("styleAmplification");
    const amplification = lookup(STYLE_AMPLIFICATION, rollDie(12));
    show("styleAmplification", describe(amplification));
    const effects = amplification[3] || {};

    const thickness = lookup(ADDITIONAL_THICKNESS, rollDie(20))[1];
    show("extraThickness", `<b>+${feet(thickness)}</b> (${thickness / 5}${__(" squares) to the castle's curtain wall thickness.")}`);
    setGenContext("extraHeight");
    const heightRoll = lookup(ADDITIONAL_HEIGHT, rollDie(20))[1];
    show("extraHeight", `<b>+${feet(heightRoll)}</b> (${heightRoll / 5}${__(" squares) to the castle's curtain wall height.")}`);

    setGenContext("brutalDefenses");
    show("brutalDefenses", describe(lookup(BRUTAL_DEFENSES, rollDie(20))));

    setGenContext("styleAmplification");
    for (let i = 0; i < (effects.extraDefense || 0); i++) {
        rollDefenses(1);
    }
    for (let i = 0; i < (effects.magic || 0); i++) {
        castle.magic.push(lookup(MAGICAL_DEFENSES, rollDie(6)));
    }
    (effects.defenses || []).forEach(name => {
        if (!castle.defenses.includes(name)) {
            castle.defenses.push(name);
        }
    });

    const above = clamp(keep.above + (effects.keepFloors || 0), 1, 99);
    const floorsText = `${above} ${above === 1 ? __("above-ground floor") : __("above-ground floors")}${keep.cellar || effects.keepFloors < 0 ? __(" and a cellar") : ""}`;
    const keepRound = keep.round || effects.roundKeep;
    const keepSide = (keepRound
        ? (keep.round ? keep.area : KEEP_SIZE.find(entry => entry[4] === keep.area)[5])
        : keep.area) + (effects.keepArea || 0);
    const keepArea = keepRound ? `${keepSide}${__(" squares across")}` : `${keepSide}x${keepSide}${__(" squares")}`;
    const wallStep = effects.wallThickness || 0;
    const wallThickness = castle.thickness + thickness + wallStep;
    const wallHeight = Math.max(10, castle.height + heightRoll + (effects.wallHeight || 0));
    const towerBonus = castle.towers.length ? effects.towerHeight || 0 : 0;
    const towerCount = castle.towers.length + (effects.towers || 0);
    const entry = effects.fortifiedEntries ? __("Reinforced heavy door with a portcullis and drawbridge") : keep.entry;
    const moat = effects.greatMoat
        ? `${pickRandom(MOAT.slice(1))[1]}${__(", 35 ft. wide and 40 ft. deep")}`
        : castle.moat;
    const barbican = effects.fortifiedEntries ? __("Drawbridge, gatehouse, walled approach and a second drawbridge (Grand gatehouses)") : castle.barbican;

    for (let i = 0; i < (effects.towers || 0); i++) {
        castle.towers.push(rollTower());
    }

    const lines = [
        __("<b>Keep</b>"),
        `${__("Floors: ")}${floorsText}`,
        `${__("Shape and floor area: ")}${keepRound ? __("Round") : __("Box")}, ${keepArea}`,
        `${__("Exterior wall thickness: ")}${feet(keep.wall + (effects.keepWall || 0))}`,
        `${__("Entry: ")}${entry}`,
        __("<b>Castle</b>"),
        `${__("Curtain wall thickness: ")}${feet(wallThickness)}${__(" (castle ")}${feet(castle.thickness)}${__(" + stronghold ")}${feet(thickness)}${wallStep ? `${__(" + amplification ")}${feet(wallStep)}` : ""})`,
        `${__("Curtain wall height: ")}${feet(wallHeight)}${__(" (castle ")}${feet(castle.height)}${__(" + stronghold ")}${feet(heightRoll)}${effects.wallHeight ? ` ${formatSigned(effects.wallHeight)}${__(" ft. amplification")}` : ""})`,
        `${__("Towers: ")}${towerCount}${__(" in total")}${effects.roundTowers ? __(", all round") : ""}${effects.towerArea ? `${__(", floor area +")}${effects.towerArea}${__(" squares")}` : ""}${towerBonus ? `, +${towerBonus}${__(" ft. height")}` : ""}`,
        `${__("Barbican: ")}${barbican}`,
        `${__("Moat: ")}${moat}`,
        `${__("Curtain wall defenses: ")}${[...castle.defenses, ...castle.magic.map(item => `${__("Magical Defenses (")}${item[1]})`)].join(", ") || __("None")}`
    ];

    if (effects.note) {
        lines.push(effects.note);
    }

    show("upgradeSummary", lines.join("<br>") + figure(keepSvg(keepRound, keepSide, keep.wall + (effects.keepWall || 0)), __("Reference: upgraded keep floor plan to scale (1 square = 5 ft.).")));
}

levelRolls();
