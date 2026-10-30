// Capital generator based on "Spectacular Settlements" (Chapter Six: Capitals).
// Tables are [maxRoll, name, description, modifiers]; a roll <= 0 counts as the first entry
// and a roll above the maximum counts as the last one.

const mods = {};
const state = {
    sizeIndex: 2,
    capacity: 50000,
    waterside: false,
    conditionLevel: 2,
    crimeLevel: 2,
    cloakAndDagger: false,
    organizedCrime: false,
    organizedCrimeForced: false,
    nobleCount: 0,
    forcedDistricts: [],
    districts: [],
    guilds: {}
};

const OUTSIDE_ROLLS = [5, 4, 3, 2, 1];
const ADDITIONAL_ROLLS = [1, 2, 3, 4, 5];
const CONDITION_LEVELS = [__("Squalid"), __("Dilapidated"), __("Decent"), __("Impressive"), __("Magnificent")];
const CONDITION_CRIME_MOD = [-2, -1, 0, -1, -2];
const CRIME_LEVELS = [__("Dangerous"), __("Frequent"), __("Common"), __("Uncommon"), __("Infrequent")];
const QUALITY_LEVELS = [__("Poor"), __("Good"), __("Fine")];

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

// Basic Information tables
const ORIGIN = [
    [1, __("First Settlement"), __("The capital is the first settlement of the region, and everything else grew around it.")],
    [2, __("Holy City"), __("The capital was founded around a sacred site or a religious calling.")],
    [3, __("Military Camp"), __("The capital began as a military camp that became permanent.")],
    [4, __("Invading Occupation"), __("An invading force took the place and settled, building the capital over what was there before.")],
    [5, __("Natural Progression - Trading Post"), __("A trading post prospered over time until it became a capital.")],
    [6, __("Resurrected Ruins"), __("The capital was raised again from the ruins of an older settlement.")],
    [7, __("Homegrown Inspiration"), __("The capital grew from the vision of a local figure or group.")],
    [8, __("Haven"), __("The capital was founded as a refuge for people seeking safety.")],
    [9, __("Advantageous Position"), __("The capital was founded because of an excellent location or access to valuable resources.")],
    [10, __("Prison"), __("The capital began as a prison or penal colony and grew around it.")],
    [11, __("Agriculture"), __("The capital grew around fertile lands and the farming that fed it.")],
    [12, __("Magical"), __("The capital was founded around, or by, some magical phenomenon or power.")]
];

const AGE = [
    [2, __("Recent"), __("The capital was founded recently."), { populationDensityMod: -2 }],
    [4, __("Established"), __("The capital has been settled for a good while."), { populationDensityMod: -1 }],
    [6, __("Mature"), __("The capital has settled into its ways.")],
    [8, __("Old"), __("The capital has stood for generations."), { populationDensityMod: 1 }],
    [10, __("Ancient"), __("The capital has existed for centuries."), { populationDensityMod: 2 }]
];

const SIZE = [
    [2, __("Very Small"), __("Capacity of about 20,000 people."), { districtCountMod: -4 }],
    [6, __("Small"), __("Capacity of about 35,000 people."), { districtCountMod: -1 }],
    [14, __("Medium"), __("Capacity of about 50,000 people.")],
    [18, __("Large"), __("Capacity of about 100,000 people."), { districtCountMod: 2 }],
    [20, __("Very Large"), __("Capacity of 150,000 or more people."), { districtCountMod: 6 }]
];
const CAPACITIES = [20000, 35000, 50000, 100000, 150000];

const POPULATION_CAPACITY = [
    [1, __("Half"), __("The capital holds half of its capacity."), 0.5],
    [3, __("Half-Again"), __("The capital holds one and a half times its capacity."), 1.5],
    [10, __("Double"), __("The capital holds twice its capacity."), 2],
    [14, __("Triple"), __("The capital holds three times its capacity."), 3],
    [17, __("Quintuple"), __("The capital holds five times its capacity."), 5],
    [19, __("Ten-Fold"), __("The capital holds ten times its capacity."), 10],
    [20, __("20-Fold"), __("The capital holds twenty times its capacity."), 20]
];

const OUTSIDE = [
    [20, __("None"), __("Nothing of note lies outside the capital.")],
    [30, __("Farming [Agriculture]"), __("Crop fields surround the capital.")],
    [40, __("Farming [Livestock]"), __("Livestock is raised around the capital.")],
    [50, __("Resource Harvesting"), __("The capital harvests a local resource.")],
    [55, __("Barrows"), __("Burial mounds lie outside the capital.")],
    [59, __("Caravan Community"), __("A community of caravans camps outside the capital.")],
    [64, __("Event Grounds"), __("Grounds for events and gatherings lie outside the capital.")],
    [68, __("Exploration"), __("An exploration site lies outside the capital."), null, [__("active"), __("abandoned or concluded")]],
    [73, __("Family Estate"), __("A family estate sits outside the capital.")],
    [78, __("Makeshift Settlement"), __("A makeshift settlement has sprung up outside the capital.")],
    [82, __("Medical Camp"), __("A medical camp operates outside the capital.")],
    [87, __("Prison"), __("A prison stands outside the capital.")],
    [91, __("Subterranean Warrens"), __("Warrens lie beneath the land outside the capital."), null, [__("known"), __("unknown")]],
    [95, __("Tended Nature"), __("Carefully tended nature surrounds the capital.")],
    [99, __("Training Grounds"), __("Training grounds lie outside the capital.")],
    [100, __("Unusable"), __("The land outside the capital cannot be used.")]
];

const STEWARDSHIP = [
    [1, __("Neglected"), __("The capital is poorly cared for."), { conditionMod: -7, populationWealthMod: -13, lawEnforcementMod: -9 }],
    [4, __("Minimal"), __("The capital receives minimal care."), { conditionMod: -4, populationWealthMod: -6, lawEnforcementMod: -5 }],
    [10, __("Passing"), __("The capital is cared for in a passable way."), { conditionMod: -1, populationWealthMod: -3, lawEnforcementMod: -2 }],
    [16, __("Adequate"), __("The capital is adequately cared for.")],
    [19, __("Managed"), __("The capital is well managed."), { conditionMod: 1, populationWealthMod: 3, lawEnforcementMod: 4 }],
    [20, __("Disciplined"), __("The capital is run with discipline."), { conditionMod: 5, populationWealthMod: 6, lawEnforcementMod: 8 }]
];

const GENERAL_CONDITION = [
    [1, __("Squalid"), __("The capital is in squalid shape."), { districtConditionMod: -2 }],
    [4, __("Dilapidated"), __("The capital is run down."), { districtConditionMod: -1 }],
    [12, __("Decent"), __("The capital is in decent shape.")],
    [19, __("Impressive"), __("The capital is in impressive shape."), { districtConditionMod: 1 }],
    [20, __("Magnificent"), __("The capital is magnificent."), { districtConditionMod: 2 }]
];

const ENVIRONMENT = [
    [1, __("Coastal"), __("The capital sits on the coast.")],
    [2, __("Forest"), __("The capital sits in or near a forest.")],
    [3, __("Mountains"), __("The capital sits in the mountains.")],
    [4, __("Plains"), __("The capital sits on open plains.")],
    [5, __("River"), __("The capital sits along a river.")],
    [6, __("Swamp"), __("The capital sits in a swamp.")],
    [7, __("Underground"), __("The capital lies underground.")],
    [8, __("Valley"), __("The capital sits in a valley.")],
    [9, __("Tundra"), __("The capital sits in the tundra.")],
    [10, __("Desert"), __("The capital sits in a desert.")]
];

const FORTIFICATION = [
    [1, __("Unfortified"), __("The capital has no defenses."), { dispositionMod: -5 }],
    [8, __("Lightly Fortified"), __("The capital has light defenses."), { dispositionMod: 1 }],
    [15, __("Fortified"), __("The capital is fortified."), { dispositionMod: 3 }],
    [19, __("Heavily Fortified"), __("The capital is heavily fortified."), { dispositionMod: 5 }],
    [20, __("Extremely Fortified"), __("The capital is extremely fortified."), { dispositionMod: 7 }]
];

const VENDOR_STALL = [
    [1, __("First Come, First Served - No Fee"), __("Vendors take a spot on a first come basis, free of charge.")],
    [2, __("First Come, First Served - Fee"), __("Vendors take a spot on a first come basis, for a fee.")],
    [3, __("Lease"), __("Vendors lease their stall spots.")],
    [4, __("Bid"), __("Vendors bid for their stall spots.")],
    [5, __("Sponsored Referral Only - No Fee"), __("Vendors need a sponsor to get a spot, free of charge.")],
    [6, __("Sponsored Referral Only - Fee"), __("Vendors need a sponsor to get a spot, for a fee.")]
];

const MERCHANT_OVERFLOW = [
    [1, __("Banned"), __("Merchants may not sell outside the market."), { lawEnforcementMod: 1 }],
    [2, __("Unpatrolled"), __("Merchants selling outside the market are left alone.")],
    [3, __("Monitored"), __("Merchants selling outside the market are watched.")],
    [4, __("Encouraged"), __("Merchants are encouraged to sell all around the capital.")]
];

const MARKET_SQUARE = [
    [2, __("Tight"), __("The market square is cramped.")],
    [4, __("Ample"), __("The market square has plenty of room.")],
    [6, __("Spacious"), __("The market square is large and open.")]
];

const UNDERGROUND = [
    [4, __("None"), __("There are no underground passages.")],
    [14, __("Sewers"), __("Sewers run beneath the capital.")],
    [17, __("Natural Caves"), __("Natural caves lie beneath the capital.")],
    [19, __("Tunnels"), __("Tunnels run beneath the capital.")],
    [20, __("Forgotten Crypts"), __("Forgotten crypts lie beneath the capital.")]
];

// Government & High Society tables
const LEADERSHIP = [
    [15, __("Elected Council"), __("A council elected by the people governs the capital.")],
    [30, __("Governor"), __("A governor rules the capital.")],
    [45, __("Hereditary"), __("A hereditary ruler governs the capital.")],
    [60, __("Merchant Monarch"), __("A wealthy merchant rules the capital. A Merchant District is forced."), null, "monarch"],
    [75, __("Military Officer"), __("A military officer runs the capital."), { lawEnforcementMod: 1 }],
    [90, __("Oligarchy"), __("A small group rules the capital."), null, "oligarchy"],
    [99, __("Underworld/Criminal Enterprise"), __("Criminals pull the strings in the capital. Organized crime is always rolled."), { crimeMod: -2 }, "underworld"],
    [100, __("Anarcho-Syndicalist Commune"), __("The capital is run as a commune.")]
];

const OLIGARCHY_GROUPS = [
    [__("Merchants (plutocracy)"), __("Merchant")],
    [__("Mages (magocracy)"), __("Arcane")],
    [__("Priests (theocracy)"), __("Temple")],
    [__("Other"), null]
];

const LEADERSHIP_UNITY = [
    [1, __("Rank Animosity"), __("The leaders openly despise one another.")],
    [3, __("Thinly-Veiled Discord"), __("The leaders barely hide their discord.")],
    [6, __("Strained"), __("The leaders work together with strain.")],
    [9, __("Uneasy"), __("The leaders are uneasy allies.")],
    [14, __("Calm"), __("The leaders get along calmly.")],
    [17, __("Close-Knit"), __("The leaders are close-knit.")],
    [19, __("Accord"), __("The leaders are in accord.")],
    [20, __("United"), __("The leaders are fully united.")]
];

const GOVERNING_PRIORITY = [
    [1, __("Humanitarian"), __("The leadership truly wants to do right by its people.")],
    [2, __("Control"), __("Absolute control is of utmost importance."), { militaryForceMod: 1, lawEnforcementMod: 3 }],
    [3, __("Isolationist"), __("The capital has no desire to get involved with other sovereign entities.")],
    [4, __("Expansionist"), __("The capital wishes to expand its reach, bringing more regions into itself."), { militaryForceMod: 1 }],
    [5, __("Cloak & Dagger"), __("The government favors secrecy and intrigue. Spy network size 1-16 counts as Modest."), null, "cloak"],
    [6, __("Economic"), __("The leadership is concerned with economic prosperity. A Market District is forced."), null, __("Market")],
    [7, __("Enlightenment"), __("The leadership prides itself on intelligence and wisdom. A Scholar District is forced."), null, __("Scholar")],
    [8, __("Industry & Innovation"), __("The leadership pursues modernization and new practical ideas. An Industrial District is forced."), null, __("Industrial")],
    [9, __("Release"), __("Those at the top do not actually want to be in power and want out.")],
    [10, __("Religious"), __("The leadership is dedicated to a deity (or deities). A Temple District is forced."), null, __("Temple")]
];

const PRIORITY_APPROACH = [
    [1, __("Peaceable - Strong"), __("The priority is pursued peacefully and forcefully.")],
    [4, __("Peaceable - Moderate"), __("The priority is pursued peacefully and moderately.")],
    [7, __("Aggressive - Moderate"), __("The priority is pursued aggressively and moderately.")],
    [8, __("Aggressive - Strong"), __("The priority is pursued aggressively and forcefully.")]
];

const PRIORITY_SUCCESS = [
    [1, __("Failing"), __("The leadership is failing at its priority.")],
    [4, __("Mediocre"), __("The leadership is mediocre at its priority.")],
    [14, __("Successful"), __("The leadership is successful at its priority.")],
    [19, __("Very Successful"), __("The leadership is very successful at its priority.")],
    [20, __("Incredibly Successful"), __("The leadership is incredibly successful at its priority.")]
];

const LIFESTYLE = [
    [2, __("Humble"), __("The leader requires only what is necessary to live."), { residenceMod: -6 }],
    [10, __("Respectable"), __("The leader's lifestyle is unassuming, but comfortable.")],
    [15, __("Distinguished"), __("The leader aspires to quality and high functionality.")],
    [17, __("Exquisite"), __("The leader quietly enjoys the luxuries of their position."), { residenceMod: 1 }],
    [19, __("Luxurious"), __("The leader takes unrestrained advantage of their comforts."), { residenceMod: 2 }],
    [20, __("Ostentatious"), __("The leader flaunts wealth and status openly."), { residenceMod: 3 }]
];

const INTENT = [
    [8, __("Genuine"), __("The leader's intentions are genuine.")],
    [13, __("Positive Deception"), __("The leader hides good intentions behind a deception.")],
    [18, __("Negative Deception"), __("The leader hides bad intentions behind a deception.")],
    [20, __("Unknown Alternative"), __("The leader's true intentions are unknown.")]
];

const RESIDENCE = [
    __("Modest House"), __("Large House"), __("Small Mansion"), __("Large Mansion"), __("Small Estate (Inside)"),
    __("Small Estate (Outside)"), __("Large Estate (Inside)"), __("Large Estate (Outside)"), __("Palace (Inside)"), __("Palace (Outside)")
];

const SPY_NETWORK = [
    [10, __("None"), __("The capital has no spy network.")],
    [16, __("Modest"), __("The capital has a modest spy network.")],
    [19, __("Adequate"), __("The capital has an adequate spy network.")],
    [20, __("Ample"), __("The capital has an ample spy network.")]
];

const CONNECTION_RELATION = [
    [1, __("Enemy - Hated")], [2, __("Enemy - Friendly")], [3, __("Ally - With Reservations")], [4, __("Ally - Trusted")]
];

const COUNTERINTELLIGENCE = [
    [10, __("None"), __("The capital has no counterintelligence.")],
    [16, __("Modest"), __("The capital has modest counterintelligence.")],
    [19, __("Adequate"), __("The capital has adequate counterintelligence.")],
    [20, __("Ample"), __("The capital has ample counterintelligence.")]
];

const WATCHFULNESS = [
    [10, __("Passing"), __("Counterintelligence only watches in passing.")],
    [15, __("Wary"), __("Counterintelligence is wary.")],
    [19, __("Vigilant"), __("Counterintelligence is vigilant.")],
    [20, __("Paranoid"), __("Counterintelligence is paranoid.")]
];

// Fourth item: goals; fifth: repercussions for the spy and for the capital
const INFILTRATION = [
    [10, __("General"), __("Gathering general intelligence: key places, figures, routines and infrastructure."),
        __("Individual - revelation of identity. National - diplomatic tension, divulging information about the discovered spy's efforts.")],
    [15, __("Deep"), __("Ingratiating with individual targets, monitoring relationships and actively guarded information."),
        __("Individual - revelation of identity, imprisonment/ransom or attempts to turn the operative. National - diplomatic tension, divulged information, difficult negotiations.")],
    [19, __("Immersed"), __("Establishing and building deeper connections with key figures."),
        __("Individual - mortal peril or attempts to turn the operative. National - ultimatums, deals highly in favor of the target.")],
    [20, __("Embroiled"), __("Deep cover in the heart of the target's operations, gaining the highest trust and positions of power."),
        __("Individual - mortal peril. National - war.")]
];

const VISITOR_ROLES = [
    __("Escaped Prisoner"), __("Ambassador"), __("Banker"), __("Ruler's Child"), __("Ruler's Spouse"), __("Ruler"), __("Explorer"), __("Assassin"),
    __("Famed Craftsperson"), __("Priest or Priestess"), __("Adventurer"), __("Scribe"), __("Bard/Storyteller"), __("Military Commander"),
    __("Soldier"), __("Messenger"), __("Spy"), __("Sentient Small Monster"), __("Sentient Large Monster"), __("Otherworldly Being")
];

const VISIT_REASONS = [
    __("Escape"), __("Diplomacy"), __("Looking for Fun"), __("An Important Meeting"), __("Grudge"), __("Tricked"), __("Visiting an Old Friend"),
    __("In Need of Help"), __("Lost"), __("Took Wrong Transportation"), __("Angry"), __("Interesting Place"), __("Seeking Advice"),
    __("Following Prophecy"), __("Had a Vision"), __("Lost a Bet"), __("Doing a Favor"), __("Collecting a Debt"),
    __("Looking for a Change"), __("On the Hunt")
];

const MILITARY_STATE = [[3, __("Disbanded")], [6, __("Standing")]];
const MILITARY_RECRUITMENT = [__("Mercenary"), __("Mandatory"), __("Volunteer"), __("Hand-Picked"), __("Criminals"), __("Conscripted")];
const MILITARY_SIZE = [[4, __("Insignificant")], [10, __("Modest")], [16, __("Strong")], [19, __("Grand")], [20, __("Vast")]];
const MILITARY_FACILITIES = [
    __("Temporary Shelters Outside"), __("Simple Structures Outside"), __("Moderate Structures Outside"),
    __("Simple Structures Inside"), __("Moderate Structures Inside"), __("Robust Structures Inside")
];
const MILITARY_SPECIALIZATION = [
    [9, __("None")], [10, __("Mounted")], [11, __("Engineering")], [12, __("Berserker")], [13, __("Covert")], [14, __("Theatrics")],
    [15, __("Magical")], [16, __("Biological")], [17, __("Calculation")], [18, __("Unconventional")], [19, __("Transport-Based")],
    [20, __("Defensive")]
];

const NOBILITY_TYPE = [
    [1, __("Egalitarian"), __("Nobility is not tied to rank; the capital is largely egalitarian.")],
    [2, __("Blood"), __("Nobility is tied to bloodlines.")],
    [3, __("Deeds"), __("Nobility is earned through deeds.")],
    [4, __("Wealth/Possessions"), __("Nobility is tied to wealth and possessions."), { populationWealthMod: 2 }]
];

const PRIMARY_NOBLES = [[1, 2], [3, 3], [6, 4], [10, 5], [14, 6], [17, 7], [19, 8], [20, 9]];

const NOBLE_LEADERSHIP = [
    [1, __("Rancorous"), __("The nobles are rancorous toward the leadership.")],
    [3, __("Opposed"), __("The nobles oppose the leadership.")],
    [6, __("Disliked"), __("The nobles dislike the leadership.")],
    [9, __("Tolerated"), __("The nobles tolerate the leadership.")],
    [14, __("Liked"), __("The nobles like the leadership.")],
    [17, __("Supported"), __("The nobles support the leadership.")],
    [19, __("Defended"), __("The nobles defend the leadership.")],
    [20, __("Loved"), __("The nobles love the leadership.")]
];

// Fourth item: whether the relationship root is positive
const NOBLE_PEOPLE = [
    [1, __("Awful"), __("Hatred is almost universally shared."), false],
    [3, __("Very Bad"), __("Tension is high, and bad feelings run deep."), false],
    [8, __("Bad"), __("Dislike is pervasive."), false],
    [13, __("Tepid"), __("Both classes feel ambivalent towards one another."), true],
    [17, __("Good"), __("Relations are generally friendly."), true],
    [19, __("Very Good"), __("The two classes greet each other warmly and deal with each other frequently."), true],
    [20, __("Incredible"), __("The two classes see each other as parts of a single whole."), true]
];

const NOBLE_ROOT = [
    [2, __("Hardship"), __("The nobility are sharing in the hardship, or actively easing the burden on the common folk."),
        __("The nobility are not enduring the same hardship as the common folk, and look after their own interests first.")],
    [4, __("Resources"), __("The nobles take an appropriate share of resources and give charitably when able."),
        __("The nobles do not distribute resources fairly, prioritizing plenty for themselves.")],
    [6, __("Manipulation"), __("An individual or group orchestrated the sentiment, looking out for the capital's interests."),
        __("An individual or group orchestrated the sentiment, looking out for their own interests.")],
    [8, __("Opinion of Leadership"), __("Both sides agree in their opinion of the leadership."),
        __("The two sides disagree in their opinion of the leadership.")],
    [10, __("Leadership Treatment"), __("The leadership treats the people and the nobility equally."),
        __("The leadership treats the people and the nobility differently.")]
];

// Community tables
const CULTURE = [
    [2, __("Non-Specific"), __("The capital has no particular cultural focus.")],
    [3, __("Art & Beauty"), __("The culture values art and beauty.")],
    [4, __("Music"), __("The culture values music.")],
    [5, __("Cuisine"), __("The culture values cuisine.")],
    [6, __("Self-Improvement"), __("The culture values self-improvement.")],
    [7, __("Enjoyment"), __("The culture values enjoyment.")],
    [8, __("Challenge"), __("The culture values challenge.")]
];

const CULTURE_PURSUIT = [
    [10, __("Moderate"), __("Culture is viewed as passingly important.")],
    [16, __("Keen Interest"), __("Interest is deep and far-reaching, but not overwhelming.")],
    [19, __("Obsession"), __("Interest is pervasive and dominates many aspects of daily life.")],
    [20, __("Rabid Fanaticism"), __("The pursuit of culture has become fanaticism.")]
];

const POPULATION_DENSITY = [
    [2, __("Skeleton"), __("The capital is nearly empty."), { nightActivityMod: -2 }],
    [6, __("Sparse"), __("The capital is thinly populated."), { nightActivityMod: -1 }],
    [14, __("Populous"), __("The capital is comfortably populated.")],
    [18, __("Dense"), __("The capital is densely populated."), { nightActivityMod: 1 }],
    [20, __("Crowded"), __("The capital is crowded."), { nightActivityMod: 2 }]
];

const DEMOGRAPHICS = [
    [1, __("Only One"), __("The population is 100% of one primary race.")],
    [4, __("Only Two"), __("The population is split 60%/40% between two races.")],
    [12, __("Normal"), __("The population is 50% primary, then 25%, 15% and 10% other races.")],
    [17, __("Wide"), __("20% of the population is the primary race, and others are well represented.")],
    [19, __("High and Low"), __("The population is split 80%/20%.")],
    [20, __("Ever-Changing"), __("The population shifts constantly.")]
];

const VISITOR_TRAFFIC = [
    [1, __("Mostly Locals"), __("Almost everyone seen in the capital is local."), { nightActivityMod: 0 }],
    [3, __("Groups"), __("Small groups of visitors come and go."), { nightActivityMod: 1 }],
    [10, __("Crowds"), __("Crowds of visitors are common."), { nightActivityMod: 2 }],
    [17, __("Droves"), __("Visitors arrive in droves."), { nightActivityMod: 3 }],
    [19, __("Masses"), __("Masses of visitors fill the capital."), { nightActivityMod: 4 }],
    [20, __("Multitudes"), __("Multitudes of visitors constantly arrive."), { nightActivityMod: 5 }]
];

const POPULATION_WEALTH = [
    [2, __("Destitute"), __("The population is destitute."), { crimeMod: -2 }],
    [6, __("Impoverished"), __("The population is poor."), { crimeMod: -1 }],
    [14, __("Average"), __("The population is of average means.")],
    [17, __("Prosperous"), __("The population is prosperous."), { crimeMod: -1 }],
    [19, __("Wealthy"), __("The population is wealthy."), { crimeMod: -2 }],
    [20, __("Affluent"), __("The population is affluent."), { crimeMod: -3 }]
];

const NIGHT_ACTIVITY = [
    [1, __("Dark"), __("The capital is dark and shut at night.")],
    [3, __("Quiet"), __("The capital is quiet at night.")],
    [9, __("Slow"), __("Some places stay open at night.")],
    [14, __("Active"), __("The capital is active at night.")],
    [18, __("Lively"), __("The capital is lively at night.")],
    [20, __("Raucous"), __("The capital is raucous all night.")]
];

const DISPOSITION = [
    [2, __("Hostile"), __("The citizens are hostile to outsiders.")],
    [6, __("Unfriendly"), __("The citizens are unfriendly to outsiders.")],
    [14, __("Neutral"), __("The citizens are neutral to outsiders.")],
    [18, __("Friendly"), __("The citizens are friendly to outsiders.")],
    [20, __("Open"), __("The citizens are open and welcoming.")]
];

const LAW_ENFORCEMENT = [
    [1, __("None"), __("There is no law enforcement."), { crimeMod: -5 }],
    [8, __("City Watch"), __("A single captain runs a watch that covers key points."), { crimeMod: -3 }],
    [13, __("Robust City Watch"), __("A captain and two sergeants run the watch."), { crimeMod: -1 }],
    [20, __("Extensive City Watch"), __("A captain and several sergeants thoroughly guard the capital.")]
];

const GENERAL_CRIME = [
    [2, __("Dangerous"), __("Crime is dangerous."), { urbanEncounterMod: 5 }],
    [6, __("Frequent"), __("Crime is frequent."), { urbanEncounterMod: 4 }],
    [14, __("Common"), __("Crime is common."), { urbanEncounterMod: 3 }],
    [18, __("Uncommon"), __("Crime is uncommon."), { urbanEncounterMod: 2 }],
    [20, __("Infrequent"), __("Crime is infrequent."), { urbanEncounterMod: 1 }]
];

const ORGANIZED_CRIME = [
    [2, __("Completely Secret"), __("Organized crime is completely secret.")],
    [6, __("Whispers"), __("There are only whispers of organized crime.")],
    [14, __("Talk"), __("People talk about organized crime.")],
    [18, __("Barely Hidden"), __("Organized crime is barely hidden.")],
    [20, __("Open"), __("Organized crime operates openly.")]
];

// District tables
const DISTRICT_COUNT = [[2, 2], [10, 3], [15, 4], [19, 5], [20, 6]];

const DISTRICT_TYPES = [
    __("Administration"), __("Arcane"), __("Botanical"), __("Craft"), __("Docks"), __("Industrial"),
    __("Market"), __("Merchant"), __("Scholar"), __("Slums"), __("Temple"), __("Upper Class")
];

// [maxRoll, steps from the general level]
const RELATIVE_STEPS = [[3, -2], [7, -1], [13, 0], [17, 1], [20, 2]];

const DISTRICT_ENTRY = [
    [3, __("Open"), 0],
    [6, __("Lightly Guarded"), 1],
    [9, __("Guarded"), 2],
    [11, __("Gated & Guarded"), 3],
    [12, __("Gated & Guarded with Toll"), 4]
];

const HOUSING = [[5, __("None")], [9, __("Limited")], [11, __("Moderate")], [12, __("Extensive")]];
const NOTABLE_COUNT = [[1, 0], [5, 1], [9, 2], [10, 3]];

// Location tokens: "HH" hired help (d10), "HH:<type>" fixed hired help, "HH6" priestly hired help (d6),
// "MS" magic shop (d6), "MS:<type>" fixed magic shop, "TEMPLE" temple (d6), "INDUSTRY" industrial location (d6).
const DISTRICTS = {
    [__("Administration")]: {
        included: [__("Courthouse"), __("Chancery"), __("Town Hall"), __("Treasury"), __("HH:Scribes & Clerks")],
        additional: [__("Baker"), __("Tailor"), __("Alchemist"), __("Cobbler"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Club"), __("Tavern"), __("HH"), __("Archives/Library"), __("Academy/University"), __("Schoolhouse"), __("Amphitheater")]
    },
    [__("Arcane")]: {
        included: [__("Archives/Library"), __("Academy/University"), __("MS"), __("MS"), __("HH:Arcane Academics or Magic Mercenaries")],
        additional: [__("General Store"), __("Tailor"), __("Weaver"), __("Alchemist"), __("Artist"), __("Rare Botanicals"), __("MS"), __("MS"), __("Barber"), __("Soothsayer"), __("House of Leisure"), __("Club"), __("Tavern"), __("HH:Arcane Academics"), __("HH:Magic Mercenaries"), __("Forum"), __("Schoolhouse"), __("Lodge")]
    },
    [__("Botanical")]: {
        included: [__("Outdoor Recreational Area"), __("Inn"), __("Stable")],
        additional: [__("Baker"), __("Tailor"), __("Weaver"), __("Alchemist"), __("Artist"), __("Cobbler"), __("Rare Botanicals"), __("Rare Libations & Fare"), __("MS"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Soothsayer"), __("Tavern"), __("HH:Guides & Trackers"), __("Outdoor Recreational Area"), __("Dance Hall"), __("Altar")]
    },
    [__("Craft")]: {
        included: [__("Smithy"), __("Carpenter"), __("General Store"), __("Tailor"), __("MS")],
        additional: [__("Cooper"), __("Carpenter"), __("Thatcher"), __("Wainwright"), __("Armorsmith"), __("Artist"), __("Bank & Exchange"), __("Cobbler"), __("Foundry/Smelting"), __("Miller"), __("Textile Production"), __("Shipwright"), __("MS"), __("Luxury Furnishings"), __("Rare Trade Goods"), __("Weaponsmith"), __("Tavern"), __("HH")]
    },
    [__("Docks")]: {
        included: [__("Shipwright"), __("Weaver"), __("House of Leisure"), __("Inn"), __("Tavern")],
        additional: [__("Cooper"), __("Carpenter"), __("Smithy"), __("Bank & Exchange"), __("Shipwright"), __("Rare Botanicals"), __("Rare Libations & Fare"), __("Rare Trade Goods"), __("MS"), __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Club"), __("Tavern"), __("HH"), __("Altar")]
    },
    [__("Industrial")]: {
        included: [__("Smithy"), __("INDUSTRY")],
        additional: [__("Cooper"), __("Carpenter"), __("General Store"), __("Smithy"), __("Tailor"), __("Thatcher"), __("Wainwright"), __("Weaver"), __("Foundry/Smelting"), __("Miller"), __("Textile Production"), __("Shipwright"), __("House of Leisure"), __("Club"), __("Tavern"), __("HH"), __("Gathering Hall"), __("Treasury")]
    },
    [__("Market")]: {
        included: [__("Baker"), __("Butcher"), __("General Store"), __("Smithy"), __("Tailor")],
        additional: [__("Wainwright"), __("Weaver"), __("Alchemist"), __("Artist"), __("Bank & Exchange"), __("Cobbler"), __("Rare Botanicals"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("Rare Trade Goods"), __("MS"), __("Barber"), __("Inn"), __("Club"), __("Soothsayer"), __("Stable"), __("Tavern"), __("HH")]
    },
    [__("Merchant")]: {
        included: [__("Bank & Exchange"), __("Tailor"), __("Artist"), __("Cobbler"), __("MS:Misc & Curiosities")],
        additional: [__("General Store"), __("Wainwright"), __("Alchemist"), __("Artist"), __("Bank & Exchange"), __("Cobbler"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("Rare Trade Goods"), __("MS"), __("MS"), __("Barber"), __("Bathhouse"), __("House of Leisure"), __("Inn"), __("Club"), __("Tavern"), __("HH")]
    },
    [__("Scholar")]: {
        included: [__("Archives/Library"), __("Academy/University"), __("Forum"), __("Schoolhouse"), __("HH:Scribes & Clerks")],
        additional: [__("General Store"), __("Tailor"), __("Thatcher"), __("Weaver"), __("Alchemist"), __("Bank & Exchange"), __("Rare Botanicals"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("Rare Trade Goods"), __("MS:Books"), __("Doctor/Apothecary"), __("HH:Scribes & Clerks"), __("Archives/Library"), __("Academy/University"), __("Forum"), __("Schoolhouse"), __("Gathering Hall")]
    },
    [__("Slums")]: {
        included: [__("Butcher"), __("House of Leisure"), __("Inn"), __("Tavern")],
        additional: [__("Baker"), __("Butcher"), __("General Store"), __("Smithy"), __("Thatcher"), __("Weaver"), __("Alchemist"), __("Foundry/Smelting"), __("Miller"), __("Textile Production"), __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Club"), __("Soothsayer"), __("Tavern")]
    },
    [__("Temple")]: {
        included: [__("TEMPLE"), __("Archives/Library"), __("HH:Scribes & Clerks"), __("HH:Priestly Guidance"), __("HH:Hands of the Divine")],
        additional: [__("Cooper"), __("Carpenter"), __("Tailor"), __("Alchemist"), __("Artist"), __("Bank & Exchange"), __("Rare Botanicals"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("MS"), __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("Inn"), __("Soothsayer"), __("HH6"), __("Schoolhouse"), __("Amphitheater")]
    },
    [__("Upper Class")]: {
        included: [__("Bank & Exchange"), __("Baker"), __("Tailor"), __("Luxury Furnishings"), __("Doctor/Apothecary")],
        additional: [__("Butcher"), __("Tailor"), __("Weaver"), __("Alchemist"), __("Artist"), __("Cobbler"), __("Rare Botanicals"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("MS"), __("Barber"), __("Bathhouse"), __("House of Leisure"), __("Inn"), __("Club"), __("Soothsayer"), __("Stable"), __("Tavern")]
    }
};

const NON_COMMERCIAL = new Set([
    __("Courthouse"), __("Chancery"), __("Town Hall"), __("Treasury"), __("Archives/Library"), __("Academy/University"), __("Schoolhouse"),
    __("Amphitheater"), __("Forum"), __("Lodge"), __("Outdoor Recreational Area"), __("Dance Hall"), __("Altar"), __("Gathering Hall")
]);

const HIRED_HELP = [
    __("Brutes & Brawlers"), __("Cloak & Dagger"), __("Bows & Slings"), __("Scribes & Clerks"), __("Guides & Trackers"),
    __("Caravan & Mount"), __("Arcane Academics"), __("Magic Mercenaries"), __("Priestly Guidance"), __("Hands of the Divine")
];
const HIRED_HELP_SIZE = [[6, __("Individual")], [10, __("Team")], [12, __("Guild")]];
const MAGIC_SHOPS = [__("Armor"), __("Books"), __("Clothing"), __("Jewelry"), __("Weapons"), __("Misc & Curiosities")];
const INDUSTRIAL = [__("Foundry/Smelting"), __("Foundry/Smelting"), __("Textile Production"), __("Textile Production"), __("Miller"), __("Miller")];
const FERVENCY = [[1, __("Unseen")], [5, __("Quiet")], [10, __("Subtle")], [16, __("Moderate")], [19, __("Fervent")], [20, __("Zealous")]];
const ALIGNMENT = [[1, __("Evil")], [5, __("Neutral")], [10, __("Good")]];

const POOR_FINE_NAMES = {
    [__("Barber")]: [__("Dirt Knife"), __("Coiffeur")],
    [__("Bathhouse")]: [__("Tubs"), __("Private Baths")],
    [__("Doctor/Apothecary")]: [__("Sawbones"), __("Physician")],
    [__("House of Leisure")]: [__("Den of Leisure"), __("Hall of Leisure")],
    [__("Inn")]: [__("Tents or Hostel"), __("Lodge")],
    [__("Club")]: [__("Stage"), __("Theater")],
    [__("Soothsayer")]: [__("Fortune Teller"), __("Diviner")],
    [__("Stable")]: [__("Stalls"), __("Livery")],
    [__("Tavern")]: [__("Pub"), __("Taphouse")]
};

const NOTABILITY = [
    __("Generous Spirit"), __("Top-Notch Marketing"), __("Excellent Offerings"), __("Vested Interests"), __("Unique Offering"),
    __("More-Than-Meets-the-Eye"), __("Meeting Place"), __("Entertaining Service"), __("Coercion"), __("Favoritism"),
    __("Superstition"), __("History"), __("Rumors"), __("Expansion"), __("Important Person"), __("Nearby Curiosity"),
    __("Local Loyalty"), __("Exciting"), __("Organization Affiliation"), __("Magic")
];

// Extra Intrigue tables. {LOW}, {HOUSING}, {BANK} and {TAVERN} are replaced with generated districts.
const RECENT_HISTORY = [
    [__("Public Display"), __("A known thief was found dead and on display in the market square. The murderer has not been found.")],
    [__("Silenced Protests"), __("Passionate protests against a leadership decision took place recently, but fell silent extremely quickly. Why?")],
    [__("Odd Fashion"), __("A particularly odd fashion trend has been adopted by the wealthiest citizens of the capital.")],
    [__("Deserting Soldiers"), __("A contingent of soldiers from a known enemy (or an unknown country, if there are none) deserted their commanders and came to the capital seeking citizenship. How have they been received?")],
    [__("Questioned Legitimacy"), __("Questions have been asked about the legitimacy and fitness of the leadership. The detractors are gaining momentum, though no one has proved the truth or determined whether there are ulterior motives.")],
    [__("Refugees"), __("Refugees have traveled a great distance to seek sanctuary in the capital. Are the nobility and common folk divided or united in their opinion?")],
    [__("Underground Competition"), __("Graffiti advertising some kind of underground competition has been appearing across the capital. It is a legal gray area, but the promise of glory is enticing even to upstanding citizens.")],
    [__("Noble Feud"), __("A feud between two of the capital's nobles or major figures came to blows very publicly, leaving each party dissatisfied and possibly looking for revenge.")],
    [__("Stripped of Title"), __("A well-known, well-liked nobleman was unexpectedly stripped of his rank and title. Were the leadership's grievances justified, or is there more going on?")],
    [__("Tainted Produce"), __("A shipment of fresh produce arrived at the market from a neighboring city. It seemed fine, but as more people fall ill it is clear the crates carried a terrible disease.")],
    [__("Block Fire"), __("A block of buildings caught fire in {LOW}, devastating multiple businesses and/or residences.")],
    [__("Mysterious Tunnel"), __("The owner of a bank & exchange (a shop, if none is present) in {BANK} discovered a tunnel entrance in their cellar that they swear wasn't there before. Where did it come from?")],
    [__("Bar Brawl"), __("The highest quality tavern in the capital ({TAVERN}) experienced a particularly nasty bar brawl, and everyone is talking about it. What happened? How did it end?")],
    [__("Private Security"), __("{HOUSING}, the district with the most housing, recently assembled its own private security force acting independently from the watch. Why did they deem it necessary? How have law enforcement and leadership responded?")],
    [__("Collapsed Building"), __("A public building in a key location has collapsed, and an investigation is underway to determine the cause.")],
    [__("Smashy Hour"), __("A local tavernkeep started 'Smashy Hour', a controlled and sanctioned weekly bar brawl, in partnership with a furniture maker who supplies old stock as makeshift weapons. Guards stay out as long as the chaos stays contained.")],
    [__("Chicken Plague"), __("Someone in the capital has been breeding chickens, and numbers are out of control. The streets are filled with poultry and no one knows who started it.")],
    [__("Missing Delegates"), __("Leadership delegates were invited to an important-sounding summit hosted by a foreign power. Months have passed and the delegates have not been heard from since.")],
    [__("Urban Farming"), __("Someone in the capital developed new urban farming practices, which have been slowly catching on.")],
    [__("Deity Appeared"), __("A deity has made a physical appearance in the city.")]
];

const NOTEWORTHY_OFFICIAL = [
    __("Adviser"), __("Ambassador"), __("Catchpole"), __("Champion"), __("Clerk"), __("Exchequer"), __("Guildmaster"), __("Herald"),
    __("High Priest/Druid"), __("High Mage"), __("Jailer"), __("Judge"), __("Liner"), __("Master of Intelligence"), __("Master of Revels"),
    __("Master of Stores"), __("Master of Trade"), __("Master of the Treasury"), __("Master of the Wild"), __("Roadwarden/Dockwarden")
];
const OFFICIAL_COMPETENCE = [[1, __("Corrupt")], [3, __("Incompetent")], [5, __("Committed")], [6, __("Overqualified")]];

const BENEATH_SURFACE = [
    __("Pack"), __("Monster"), __("Markings"), __("Fight Club"), __("Secret"), __("Outside Contact"),
    __("Tampering"), __("Unsafe"), __("Parties"), __("Black Market"), __("Races"), __("Haunted")
];
const AWARENESS = [
    __("Utterly Oblivious"), __("Single, Subtle Occurrence"), __("Disparate, Subtle Occurrences"), __("Many Subtle Occurrences"),
    __("Single Occurrence"), __("Disparate Occurrences"), __("Many Occurrences"), __("Single, Direct Occurrence"),
    __("Disparate, Direct Occurrences"), __("Many Direct Occurrences"), __("Willfully Ignorant"), __("Actively Aware")
];

// Basic Information
originValue();
ageValue();
sizeValue();
populationCapacityValue();
outsideCapitalValue();
environmentValue();
stewardshipValue();
generalConditionValue();
fortificationValue();
merchantOverflowValue();
undergroundPassagesValue();
marketSquareValue();
vendorStallAcquisitonValue();

// Government & High Society
leadershipValue();
leadershipUnityValue();
governingPriorityValue();
priorityApproachValue();
prioritySuccessValue();
leadersValue();
spyNetworkValue();
counterintelligenceValue();
notableVisitorsValue();
militaryValue();
nobilityValue();

// Community
cultureValue();
populationDensityValue();
demographicsValue();
visitorTrafficValue();
populationWealthValue();
nightActivityValue();
dispositionValue();
lawEnforcementValue();
generalCrimeValue();
organizedCrimeValue();

// Districts
districtsValue();
nobleResidencesValue();

// Extra Intrigue
recentHistoryValue();
noteworthyOfficialValue();
beneathSurfaceValue();

function originValue() {
    rollTable("origin", 12, ORIGIN);
}

function ageValue() {
    rollTable("age", 10, AGE);
}

function sizeValue() {
    const { entry } = rollTable("size", 20, SIZE);
    state.sizeIndex = SIZE.indexOf(entry);
    state.capacity = CAPACITIES[state.sizeIndex];
}

function populationCapacityValue() {
    setGenContext("populationCapacity");
    const entry = lookup(POPULATION_CAPACITY, rollDie(20));
    const total = Math.round(state.capacity * entry[3]).toLocaleString(__("en-US"));
    show("populationCapacity", `${describe(entry)}${__(" Population of about ")}${total}${__(" (base capacity ")}${state.capacity.toLocaleString(__("en-US"))}${__(" x ")}${entry[3]}).`);
}

function outsideCapitalValue() {
    setGenContext("outsideCapital");
    const results = [];

    for (let i = 0; i < OUTSIDE_ROLLS[state.sizeIndex]; i++) {
        const entry = lookup(OUTSIDE, rollDie(100));
        const detail = entry[4] ? `${__(" Status: ")}${entry[4][rollDie(6) <= 3 ? 0 : 1]}.` : "";
        results.push(describe(entry) + detail);
    }

    show("outsideCapital", results.join("<br>"));
}

function environmentValue() {
    const { entry } = rollTable("environment", 10, ENVIRONMENT);
    state.waterside = [__("Coastal"), __("River")].includes(entry[1]);
}

function stewardshipValue() {
    rollTable("stewardship", 20, STEWARDSHIP);
}

function generalConditionValue() {
    const { entry } = rollTable("generalCondition", 20, GENERAL_CONDITION, "conditionMod");
    state.conditionLevel = GENERAL_CONDITION.indexOf(entry);
}

function fortificationValue() {
    rollTable("fortification", 20, FORTIFICATION);
}

function merchantOverflowValue() {
    rollTable("merchantOverflow", 4, MERCHANT_OVERFLOW);
}

function undergroundPassagesValue() {
    rollTable("undergroundPassages", 20, UNDERGROUND);
}

function marketSquareValue() {
    rollTable("marketSquare", 6, MARKET_SQUARE);
}

function vendorStallAcquisitonValue() {
    rollTable("vendorStallAcquisiton", 6, VENDOR_STALL);
}

function leadershipValue() {
    setGenContext("leadership");
    const { entry } = pick(100, LEADERSHIP);
    let text = format(entry);

    if (entry[4] === "monarch") {
        state.forcedDistricts.push(__("Merchant"));
    } else if (entry[4] === "underworld") {
        state.organizedCrimeForced = true;
    } else if (entry[4] === "oligarchy") {
        const [group, district] = OLIGARCHY_GROUPS[rollDie(4) - 1];
        const forced = district || pickRandom(DISTRICT_TYPES.filter(type => type !== __("Docks") || state.waterside));
        state.forcedDistricts.push(forced);
        text += `${__(" Ruling group: ")}${group}${__(". Forced district: ")}${forced}.`;
    }

    show("leadership", text);
}

function leadershipUnityValue() {
    rollTable("leadershipUnity", 20, LEADERSHIP_UNITY);
}

function governingPriorityValue() {
    setGenContext("governingPriority");
    const { entry } = pick(10, GOVERNING_PRIORITY);

    if (entry[4] === "cloak") {
        state.cloakAndDagger = true;
    } else if (entry[4]) {
        state.forcedDistricts.push(entry[4]);
    }

    show("governingPriority", format(entry));
}

function priorityApproachValue() {
    rollTable("priorityApproach", 8, PRIORITY_APPROACH);
}

function prioritySuccessValue() {
    rollTable("prioritySuccess", 20, PRIORITY_SUCCESS);
}

function leadersValue() {
    setGenContext("leaders");
    const count = rollDie(6);
    const leaders = [];

    for (let i = 1; i <= count; i++) {
        const lifestyle = pick(20, LIFESTYLE).entry;
        const intent = lookup(INTENT, rollDie(20));
        const residenceMod = lifestyle[3] ? lifestyle[3].residenceMod : 0;
        const residence = RESIDENCE[clamp(rollDie(10, residenceMod, "residenceMod"), 1, 10) - 1];

        leaders.push(`<b>${__("Leader ")}${i}.</b>${__(" Lifestyle: ")}${lifestyle[1]}${effectNote(lifestyle[3])}${__(". Intent: ")}${intent[1]}${__(". Residence: ")}${residence}.`);
    }

    show("leaders", `${plural(count, __("leader"))}.<br>${leaders.join("<br>")}`);
}

function spyNetworkValue() {
    setGenContext("spyNetwork");
    let roll = rollDie(20);

    if (state.cloakAndDagger && roll <= 16) {
        roll = 11;
    }

    const network = lookup(SPY_NETWORK, roll);
    const lines = [describe(network)];

    if (network[1] !== __("None")) {
        const connections = rollDie(4);
        const relations = Array.from({ length: connections }, () => lookup(CONNECTION_RELATION, rollDie(4))[1]);
        const depth = lookup(INFILTRATION, rollDie(20));

        lines.push(`<b>${__("Connections.")}</b> ${plural(connections, __("connection"))}: ${relations.join("; ")}.`);
        lines.push(`<b>${__("Infiltration Depth: ")}${depth[1]}.</b>${__(" Goals: ")}${depth[2]}${__(" Repercussions: ")}${depth[3]}`);
    }

    show("spyNetwork", lines.join("<br>"));
}

function counterintelligenceValue() {
    setGenContext("counterintelligence");
    let entry = lookup(COUNTERINTELLIGENCE, rollDie(20));

    for (let attempt = 0; state.cloakAndDagger && entry[1] === __("None") && attempt < 50; attempt++) {
        entry = lookup(COUNTERINTELLIGENCE, rollDie(20));
    }

    const lines = [describe(entry)];

    if (entry[1] !== __("None")) {
        lines.push(`<b>${__("Watchfulness.")}</b> ${describe(lookup(WATCHFULNESS, rollDie(20)))}`);
    }

    show("counterintelligence", lines.join("<br>"));
}

function notableVisitorsValue() {
    setGenContext("notableVisitors");
    const count = rollDie(4);
    const visitors = [];

    for (let i = 1; i <= count; i++) {
        const role = VISITOR_ROLES[rollDie(20) - 1];
        const reason = VISIT_REASONS[rollDie(20) - 1];
        visitors.push(`<b>${role}.</b>${__(" Reason for visit: ")}${reason}.`);
    }

    show("notableVisitors", `${plural(count, __("notable visitor"))}.<br>${visitors.join("<br>")}`);
}

function militaryValue() {
    setGenContext("military");
    const roll = rollDie(6, modValue("militaryForceMod"), "militaryForceMod");

    if (roll <= 2) {
        show("military", __("<b>No.</b> The capital has no military force."));
        return;
    }

    const standing = lookup(MILITARY_STATE, rollDie(6))[1];
    const recruitment = MILITARY_RECRUITMENT[rollDie(6) - 1];
    const size = lookup(MILITARY_SIZE, rollDie(20))[1];
    const facilities = MILITARY_FACILITIES[rollDie(6) - 1];
    const specialization = lookup(MILITARY_SPECIALIZATION, rollDie(20))[1];
    const inside = facilities.endsWith(__("Inside")) ? __(" Facilities inside the capital may form their own district.") : "";

    show("military", [
        __("<b>Yes.</b> The capital has a military force."),
        `<b>${__("State:")}</b> ${standing}`,
        `<b>${__("Recruitment:")}</b> ${recruitment}`,
        `<b>${__("Size of force:")}</b> ${size}`,
        `<b>${__("Facilities:")}</b> ${facilities}.${inside}`,
        `<b>${__("Specialization:")}</b> ${specialization}`
    ].join("<br>"));
}

function nobilityValue() {
    setGenContext("nobility");
    const type = pick(4, NOBILITY_TYPE).entry;
    const primary = lookup(PRIMARY_NOBLES, rollDie(20))[1];
    const lesser = lookup(PRIMARY_NOBLES, rollDie(20))[1];
    const toLeadership = lookup(NOBLE_LEADERSHIP, rollDie(20));
    const toPeople = lookup(NOBLE_PEOPLE, rollDie(20));
    const root = lookup(NOBLE_ROOT, rollDie(10));
    const positive = toPeople[3];

    state.nobleCount = primary;

    if (root[1] === __("Resources")) {
        addMods({ populationWealthMod: positive ? 2 : -2 });
    }

    show("nobility", [
        `<b>${__("Type of nobility: ")}${type[1]}.</b> ${type[2]}${effectNote(type[3])}`,
        `<b>${__("Primary nobles:")}</b> ${primary}${__(" (optional lesser nobles: ")}${lesser})`,
        `<b>${__("Relationship to leadership: ")}${toLeadership[1]}.</b> ${toLeadership[2]}`,
        `<b>${__("Relationship with the people: ")}${toPeople[1]}.</b> ${toPeople[2]}`,
        `<b>${__("Root of relationship: ")}${root[1]} (${positive ? __("positive") : __("negative")}).</b> ${root[positive ? 2 : 3]}${root[1] === __("Resources") ? effectNote({ populationWealthMod: positive ? 2 : -2 }) : ""}`
    ].join("<br>"));
}

function cultureValue() {
    setGenContext("culture");
    const culture = lookup(CULTURE, rollDie(8));
    const lines = [describe(culture)];

    if (culture[1] !== __("Non-Specific")) {
        lines.push(`<b>${__("Pursuit of culture.")}</b> ${describe(lookup(CULTURE_PURSUIT, rollDie(20)))}`);
    }

    show("culture", lines.join("<br>"));
}

function populationDensityValue() {
    rollTable("populationDensity", 20, POPULATION_DENSITY, "populationDensityMod");
}

function demographicsValue() {
    rollTable("demographics", 20, DEMOGRAPHICS);
}

function visitorTrafficValue() {
    rollTable("visitorTraffic", 20, VISITOR_TRAFFIC);
}

function populationWealthValue() {
    rollTable("populationWealth", 20, POPULATION_WEALTH, "populationWealthMod");
}

function nightActivityValue() {
    rollTable("nightActivity", 20, NIGHT_ACTIVITY, "nightActivityMod");
}

function dispositionValue() {
    rollTable("disposition", 20, DISPOSITION, "dispositionMod");
}

function lawEnforcementValue() {
    rollTable("lawEnforcement", 20, LAW_ENFORCEMENT, "lawEnforcementMod");
}

function generalCrimeValue() {
    const { entry } = rollTable("generalCrime", 20, GENERAL_CRIME, "crimeMod");
    state.crimeLevel = GENERAL_CRIME.indexOf(entry);
    state.organizedCrime = state.organizedCrimeForced || state.crimeLevel <= 2;
}

function organizedCrimeValue() {
    if (!state.organizedCrime) {
        show("organizedCrime", __("<b>None.</b> Organized crime is not rolled at this crime level."));
        return;
    }
    rollTable("organizedCrime", 20, ORGANIZED_CRIME);
}

function qualityIndex(modifier, shift = 0) {
    const roll = rollDie(12, modifier, "qualityMod");
    const base = roll <= 4 ? 0 : roll <= 10 ? 1 : 2;
    return clamp(base + shift, 0, 2);
}

function guildNote(name) {
    const existing = state.guilds[name] || 0;
    const range = 5 - Math.min(existing, 3);
    const roll = rollDie(6);
    state.guilds[name] = existing + 1;
    return roll > 1 && roll >= range ? __(" - Guild member") : "";
}

// Turns a location token into a descriptive line; qualityMod and shift come from the district.
function buildLocation(token, qualityMod, shift) {
    let name = token;
    let extra = "";

    if (token === __("TEMPLE")) {
        const kind = rollDie(6) <= 4 ? __("Temple") : __("Great Temple");
        const fervency = lookup(FERVENCY, rollDie(20))[1];
        const alignment = lookup(ALIGNMENT, rollDie(10))[1];
        return { name: kind, text: `<b>${kind}</b> - ${fervency}${__(" following, ")}${alignment}` };
    }
    if (token === __("INDUSTRY")) {
        name = INDUSTRIAL[rollDie(6) - 1];
    } else if (token === __("MS") || token.startsWith(__("MS:"))) {
        name = __("Magic Shop - ") + (token === __("MS") ? MAGIC_SHOPS[rollDie(6) - 1] : token.slice(3));
    } else if (token === __("HH") || token === __("HH6") || token.startsWith(__("HH:"))) {
        let hiredType = token === __("HH") ? HIRED_HELP[rollDie(10) - 1]
            : token === __("HH6") ? (rollDie(6) <= 3 ? __("Priestly Guidance") : __("Hands of the Divine"))
                : token.slice(3);
        if (hiredType.includes(__(" or "))) {
            hiredType = pickRandom(hiredType.split(__(" or ")));
        }
        name = __("Hired Help - ") + hiredType;
        extra = ` - ${lookup(HIRED_HELP_SIZE, rollDie(12))[1]}`;
    } else if (NON_COMMERCIAL.has(token)) {
        return { name, text: `<b>${name}</b>` };
    }

    const quality = qualityIndex(qualityMod, shift);
    const names = POOR_FINE_NAMES[name];
    let label = name;

    if (names && quality !== 1) {
        label = names[quality === 0 ? 0 : 1];
    }

    return { name, quality, text: `<b>${label}</b>${extra} - ${QUALITY_LEVELS[quality]}${guildNote(name)}` };
}

function rollAdditionalToken(table) {
    let roll = rollDie(20);
    let shift = 0;

    for (let attempt = 0; attempt < 50; attempt++) {
        if (roll === 1 || roll === 20) {
            shift += roll === 1 ? -1 : 1;
        } else if (table[roll - 2] !== __("Shipwright") || state.waterside) {
            break;
        }
        roll = rollDie(20);
    }

    return { token: table[clamp(roll, 2, 19) - 2], shift: clamp(shift, -1, 1) };
}

function rollDistrictTypes() {
    setGenContext("numberOfDistricts");
    const countRoll = rollDie(20, modValue("districtCountMod"), "districtCountMod");
    let count = lookup(DISTRICT_COUNT, countRoll)[1];
    const types = [...state.forcedDistricts];
    count = Math.max(count, types.length);

    while (types.length < count) {
        const type = DISTRICT_TYPES[rollDie(12) - 1];
        const allowed = type !== __("Docks") || state.waterside;
        if (allowed) {
            types.push(type);
        }
    }

    show("numberOfDistricts", `<b>${count}${__(" districts.")}</b> ${state.forcedDistricts.length ? `${__("Forced districts: ")}${state.forcedDistricts.join(", ")}.` : __("No forced districts.")}${modValue("districtCountMod") ? effectNote({ districtCountMod: modValue("districtCountMod") }) : ""}`);
    return types;
}

function districtsValue() {
    const types = rollDistrictTypes();
    let anchor = document.getElementById("numberOfDistricts");

    types.forEach((type, index) => {
        const id = `district${index + 1}`;
        const heading = document.createElement("h3");
        const paragraph = document.createElement("p");

        heading.textContent = `${__("District ")}${index + 1}: ${type}`;
        paragraph.id = id;
        anchor.after(heading, paragraph);
        anchor = paragraph;
        show(id, buildDistrict(id, type, index + 1));
    });
}

function buildDistrict(id, type, number) {
    setGenContext(id);
    const slums = type === __("Slums");
    const upper = type === __("Upper Class");
    const data = DISTRICTS[type];

    const conditionRoll = rollDie(slums ? 4 : 20, modValue("districtConditionMod") + (upper ? 3 : 0), "districtConditionMod");
    const step = lookup(RELATIVE_STEPS, conditionRoll)[1];
    const level = clamp(state.conditionLevel + step, 0, 4);
    let entry = lookup(DISTRICT_ENTRY, rollDie(12));
    for (let attempt = 0; entry[2] === 4 && (slums || upper) && attempt < 50; attempt++) {
        entry = lookup(DISTRICT_ENTRY, rollDie(12));
    }
    const crimeRoll = rollDie(20, entry[2] + CONDITION_CRIME_MOD[level], "crimeMod");
    const crimeLevel = clamp(state.crimeLevel + lookup(RELATIVE_STEPS, crimeRoll)[1], 0, 4);

    let housing = lookup(HOUSING, rollDie(12))[1];
    for (let attempt = 0; housing === __("None") && (slums || upper) && attempt < 50; attempt++) {
        housing = lookup(HOUSING, rollDie(12))[1];
    }

    const notableCount = lookup(NOTABLE_COUNT, rollDie(10))[1];
    const qualityMod = step + (slums ? -1 : 0) + (upper ? 3 : 0);
    const locations = data.included.map(token => buildLocation(token, qualityMod, 0));

    for (let i = 0; i < ADDITIONAL_ROLLS[state.sizeIndex]; i++) {
        const { token, shift } = rollAdditionalToken(data.additional);
        locations.push(buildLocation(token, qualityMod, shift));
    }

    const notable = [...locations.keys()].slice(data.included.length, data.included.length + notableCount);
    for (const index of notable) {
        locations[index].text += ` - <i>${__("Notable: ")}${NOTABILITY[rollDie(20) - 1]}</i>`;
    }

    state.districts.push({
        number,
        type,
        level,
        housing: HOUSING.findIndex(item => item[1] === housing),
        locations
    });

    const summary = [
        `<b>${__("Condition:")}</b> ${CONDITION_LEVELS[level]}`,
        `<b>${__("Entry:")}</b> ${entry[1]}`,
        `<b>${__("Crime:")}</b> ${CRIME_LEVELS[crimeLevel]}`,
        `<b>${__("Housing:")}</b> ${housing}`,
        `<b>${__("Notable locations:")}</b> ${notableCount}`
    ].join(" | ");

    return `${summary}<br><br>${locations.map(location => location.text).join("<br>")}`;
}

function nobleResidencesValue() {
    setGenContext("nobleResidences");
    const lines = [];

    for (let i = 1; i <= state.nobleCount; i++) {
        let roll = rollDie(6);
        for (let attempt = 0; roll > state.districts.length && attempt < 50; attempt++) {
            roll = rollDie(6);
        }
        const district = state.districts[Math.min(roll, state.districts.length) - 1];
        lines.push(`<b>${__("Noble ")}${i}.</b>${__(" District ")}${district.number}: ${district.type}.`);
    }

    show("nobleResidences", lines.join("<br>"));
}

function districtLabel(district) {
    return district ? `${__("District ")}${district.number} (${district.type})` : __("a district of the capital");
}

function historyReferences() {
    const districts = state.districts;
    const lowest = districts.reduce((best, item) => item.level < best.level ? item : best, districts[0]);
    const housing = districts.reduce((best, item) => item.housing > best.housing ? item : best, districts[0]);
    const bank = districts.find(item => item.locations.some(location => location.name === __("Bank & Exchange")));
    let tavern = null;
    let tavernQuality = -1;

    for (const district of districts) {
        for (const location of district.locations) {
            if (location.name === __("Tavern") && location.quality > tavernQuality) {
                tavern = district;
                tavernQuality = location.quality;
            }
        }
    }

    return { LOW: districtLabel(lowest), HOUSING: districtLabel(housing), BANK: districtLabel(bank), TAVERN: districtLabel(tavern) };
}

function recentHistoryValue() {
    setGenContext("recentHistory");
    const [title, text] = RECENT_HISTORY[rollDie(20) - 1];
    const references = historyReferences();
    show("recentHistory", `<b>${title}.</b> ${text.replace(/\{(\w+)\}/g, (_, key) => references[key])}`);
}

function noteworthyOfficialValue() {
    setGenContext("noteworthyOfficial");
    const official = NOTEWORTHY_OFFICIAL[rollDie(20) - 1];
    const competence = lookup(OFFICIAL_COMPETENCE, rollDie(6))[1];
    show("noteworthyOfficial", `<b>${official}.</b>${__(" Competence: ")}${competence}.`);
}

function beneathSurfaceValue() {
    setGenContext("beneathSurface");
    const secret = BENEATH_SURFACE[rollDie(12) - 1];
    const awareness = AWARENESS[rollDie(12) - 1];
    show("beneathSurface", `<b>${secret}.</b>${__(" Awareness: ")}${awareness}.`);
}
