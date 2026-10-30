// City generator based on "Spectacular Settlements" (Chapter Five: Cities).
// Tables are [maxRoll, name, description, modifiers]; a roll <= 0 counts as the first entry
// and a roll above the maximum counts as the last one.

const mods = {};
const state = {
    priority: 0,
    sizeIndex: 2,
    capacity: 24000,
    environment: "",
    waterside: false,
    conditionLevel: 2,
    crimeLevel: 2,
    forcedDistricts: [],
    guilds: {}
};

const SIZE_NAMES = [__("Very Small"), __("Small"), __("Medium"), __("Large"), __("Very Large")];
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

// Rolls on a table, applies and shows the modifiers it grants, and returns the entry and roll.
function rollTable(id, sides, table, modName = "") {
    setGenContext(id);
    const roll = rollDie(sides, modName ? modValue(modName) : 0, modName);
    const entry = lookup(table, roll);

    if (entry[3]) {
        addMods(entry[3]);
    }
    show(id, describe(entry) + effectNote(entry[3]));

    return { entry, roll };
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Tables
const ORIGIN = [
    [1, __("Invading Occupation"), __("An invading force took the place and settled, building the city over what was there before.")],
    [2, __("Tribal Home"), __("The city grew from the permanent home of a tribe or clan of people.")],
    [3, __("Natural Progression - Trading Post"), __("A trading post prospered over time until it became a city.")],
    [4, __("Repurposed History"), __("The city was built on or around the remains of something older, such as ruins or a former stronghold.")],
    [5, __("Natural Progression - Village"), __("A village grew steadily until it became a city.")],
    [6, __("Haven"), __("The city was founded as a refuge for people seeking safety.")],
    [7, __("Advantageous Position"), __("The city was founded because of an excellent location or access to valuable resources.")],
    [8, __("Prison"), __("The city began as a prison or penal colony and grew around it.")],
    [9, __("Agriculture"), __("The city grew around fertile lands and the farming that fed it.")],
    [10, __("Magical"), __("The city was founded around, or by, some magical phenomenon or power.")]
];

const PRIORITY = [
    [1, __("Control"), __("The city prioritizes order and authority."), { lawEnforcementMod: 3 }],
    [2, __("Trade"), __("The city prioritizes commerce."), { populationWealthMod: 1 }],
    [3, __("Enlightenment"), __("The city prioritizes learning. A Scholar District is forced.")],
    [4, __("Entertainment"), __("The city prioritizes leisure. Each district gets one entertainment venue among its additional locations.")],
    [5, __("Production"), __("The city prioritizes output. The first Outside the City roll rerolls results of 1-4.")],
    [6, __("Faith"), __("The city prioritizes religion. A Temple District is forced.")]
];

const AGE = [
    [2, __("Recent"), __("The city was founded recently."), { populationDensityMod: -2 }],
    [4, __("Established"), __("The city has been settled for a good while."), { populationDensityMod: -1 }],
    [6, __("Mature"), __("The city has settled into its ways.")],
    [8, __("Old"), __("The city has stood for generations."), { populationDensityMod: 1 }],
    [10, __("Ancient"), __("The city has existed for centuries."), { populationDensityMod: 2 }]
];

const SIZE = [
    [2, __("Very Small"), __("Capacity of about 8,000 people."), { districtCountMod: -4 }],
    [6, __("Small"), __("Capacity of about 16,000 people."), { districtCountMod: -1 }],
    [14, __("Medium"), __("Capacity of about 24,000 people.")],
    [18, __("Large"), __("Capacity of about 32,000 people."), { districtCountMod: 2 }],
    [20, __("Very Large"), __("Capacity of 40,000 or more people."), { districtCountMod: 6 }]
];
const CAPACITIES = [8000, 16000, 24000, 32000, 40000];

const POPULATION_CAPACITY = [
    [1, __("Half"), __("The city holds half of its capacity."), 0.5],
    [3, __("Half-Again"), __("The city holds one and a half times its capacity."), 1.5],
    [10, __("Double"), __("The city holds twice its capacity."), 2],
    [14, __("Triple"), __("The city holds three times its capacity."), 3],
    [17, __("Quintuple"), __("The city holds five times its capacity."), 5],
    [19, __("Ten-Fold"), __("The city holds ten times its capacity."), 10],
    [20, __("20-Fold"), __("The city holds twenty times its capacity."), 20]
];

const OUTSIDE = [
    [4, __("None"), __("Nothing of note lies outside the city.")],
    [6, __("Farming [Agriculture]"), __("Crop fields surround the city.")],
    [8, __("Farming [Livestock]"), __("Livestock is raised around the city.")],
    [10, __("Resource Harvesting"), __("The city harvests a local resource.")],
    [12, __("Barrows"), __("Burial mounds lie outside the city.")],
    [13, __("Caravan Community"), __("A community of caravans camps outside the city.")],
    [14, __("Event Grounds"), __("Grounds for events and gatherings lie outside the city.")],
    [15, __("Family Estate"), __("A family estate sits outside the city.")],
    [16, __("Hermit's Cottage"), __("A hermit lives in a cottage outside the city.")],
    [18, __("Makeshift Settlement"), __("A makeshift settlement has sprung up outside the city.")],
    [19, __("Medical Camp"), __("A medical camp operates outside the city.")],
    [20, __("Prison"), __("A prison stands outside the city.")]
];

const STEWARDSHIP = [
    [1, __("Neglected"), __("The city is poorly cared for."), { conditionMod: -7, populationWealthMod: -13, lawEnforcementMod: -9 }],
    [4, __("Minimal"), __("The city receives minimal care."), { conditionMod: -4, populationWealthMod: -6, lawEnforcementMod: -5 }],
    [10, __("Passing"), __("The city is cared for in a passable way."), { conditionMod: -1, populationWealthMod: -3, lawEnforcementMod: -2 }],
    [16, __("Adequate"), __("The city is adequately cared for.")],
    [19, __("Managed"), __("The city is well managed."), { conditionMod: 1, populationWealthMod: 3, lawEnforcementMod: 4 }],
    [20, __("Disciplined"), __("The city is run with discipline."), { conditionMod: 5, populationWealthMod: 6, lawEnforcementMod: 8 }]
];

const GENERAL_CONDITION = [
    [1, __("Squalid"), __("The city is in squalid shape."), { districtConditionMod: -2 }],
    [4, __("Dilapidated"), __("The city is run down."), { districtConditionMod: -1 }],
    [12, __("Decent"), __("The city is in decent shape.")],
    [19, __("Impressive"), __("The city is in impressive shape."), { districtConditionMod: 1 }],
    [20, __("Magnificent"), __("The city is magnificent."), { districtConditionMod: 2 }]
];

const ENVIRONMENT = [
    [1, __("Coastal"), __("The city sits on the coast.")],
    [2, __("Forest"), __("The city sits in or near a forest.")],
    [3, __("Mountains"), __("The city sits in the mountains.")],
    [4, __("Plains"), __("The city sits on open plains.")],
    [5, __("River"), __("The city sits along a river.")],
    [6, __("Swamp"), __("The city sits in a swamp.")],
    [7, __("Underground"), __("The city lies underground.")],
    [8, __("Valley"), __("The city sits in a valley.")],
    [9, __("Tundra"), __("The city sits in the tundra.")],
    [10, __("Desert"), __("The city sits in a desert.")]
];

const FORTIFICATION = [
    [1, __("Unfortified"), __("The city has no defenses."), { dispositionMod: -5 }],
    [8, __("Lightly Fortified"), __("The city has light defenses."), { dispositionMod: 1 }],
    [15, __("Fortified"), __("The city is fortified."), { dispositionMod: 3 }],
    [19, __("Heavily Fortified"), __("The city is heavily fortified."), { dispositionMod: 5 }],
    [20, __("Extremely Fortified"), __("The city is extremely fortified."), { dispositionMod: 7 }]
];

const VENDOR_STALL = [
    [1, __("First Come, First Served - No Fee"), __("Vendors take a spot on a first come basis, free of charge.")],
    [2, __("First Come, First Served - Fee"), __("Vendors take a spot on a first come basis, for a fee.")],
    [3, __("Lease"), __("Vendors lease their stall spots.")],
    [4, __("Bid"), __("Vendors bid for their stall spots.")]
];

const MERCHANT_OVERFLOW = [
    [1, __("Banned"), __("Merchants may not sell outside the market."), { lawEnforcementMod: 1 }],
    [2, __("Unpatrolled"), __("Merchants selling outside the market are left alone.")],
    [3, __("Monitored"), __("Merchants selling outside the market are watched.")],
    [4, __("Encouraged"), __("Merchants are encouraged to sell all around the city.")]
];

const MARKET_SQUARE = [
    [2, __("Tight"), __("The market square is cramped.")],
    [4, __("Ample"), __("The market square has plenty of room.")],
    [6, __("Spacious"), __("The market square is large and open.")]
];

const UNDERGROUND = [
    [8, __("None"), __("There are no underground passages.")],
    [14, __("Sewers"), __("Sewers run beneath the city.")],
    [17, __("Natural Caves"), __("Natural caves lie beneath the city.")],
    [19, __("Tunnels"), __("Tunnels run beneath the city.")],
    [20, __("Forgotten Crypts"), __("Forgotten crypts lie beneath the city.")]
];

const POPULATION_DENSITY = [
    [2, __("Skeleton"), __("The city is nearly empty."), { nightActivityMod: -2 }],
    [6, __("Sparse"), __("The city is thinly populated."), { nightActivityMod: -1 }],
    [14, __("Populous"), __("The city is comfortably populated.")],
    [18, __("Dense"), __("The city is densely populated."), { nightActivityMod: 1 }],
    [20, __("Crowded"), __("The city is crowded."), { nightActivityMod: 2 }]
];

const DEMOGRAPHICS = [
    [2, __("Only One"), __("The population is 100% of one primary race.")],
    [6, __("Only Two"), __("The population is split 60%/40% between two races.")],
    [14, __("Normal"), __("The population is 50% primary, then 25%, 15% and 10% other races.")],
    [17, __("Wide"), __("20% of the population is the primary race, and others are well represented.")],
    [19, __("High and Low"), __("The population is split 80%/20%.")],
    [20, __("Ever-Changing"), __("The population shifts constantly.")]
];

const POPULATION_WEALTH = [
    [2, __("Destitute"), __("The population is destitute."), { crimeMod: -2 }],
    [6, __("Impoverished"), __("The population is poor."), { crimeMod: -1 }],
    [14, __("Average"), __("The population is of average means.")],
    [17, __("Prosperous"), __("The population is prosperous."), { crimeMod: -1 }],
    [19, __("Wealthy"), __("The population is wealthy."), { crimeMod: -2 }],
    [20, __("Affluent"), __("The population is affluent."), { crimeMod: -3 }]
];

const VISITOR_TRAFFIC = [
    [2, __("Mostly Locals"), __("Almost everyone seen in the city is local."), { nightActivityMod: 0 }],
    [6, __("Groups"), __("Small groups of visitors come and go."), { nightActivityMod: 1 }],
    [12, __("Crowds"), __("Crowds of visitors are common."), { nightActivityMod: 2 }],
    [17, __("Droves"), __("Visitors arrive in droves."), { nightActivityMod: 3 }],
    [19, __("Masses"), __("Masses of visitors fill the city."), { nightActivityMod: 4 }],
    [20, __("Multitudes"), __("Multitudes of visitors constantly arrive."), { nightActivityMod: 5 }]
];

const DISPOSITION = [
    [2, __("Hostile"), __("The citizens are hostile to outsiders.")],
    [6, __("Unfriendly"), __("The citizens are unfriendly to outsiders.")],
    [14, __("Neutral"), __("The citizens are neutral to outsiders.")],
    [18, __("Friendly"), __("The citizens are friendly to outsiders.")],
    [20, __("Open"), __("The citizens are open and welcoming.")]
];

const NIGHT_ACTIVITY = [
    [1, __("Dark"), __("The city is dark and shut at night.")],
    [3, __("Quiet"), __("The city is quiet at night.")],
    [12, __("Slow"), __("Some places stay open at night.")],
    [17, __("Active"), __("The city is active at night.")],
    [19, __("Lively"), __("The city is lively at night.")],
    [20, __("Raucous"), __("The city is raucous all night.")]
];

const LEADERSHIP = [
    [15, __("Elected Council"), __("A council elected by the people governs the city.")],
    [30, __("Mayor"), __("A mayor governs the city.")],
    [45, __("Hereditary"), __("A hereditary ruler governs the city.")],
    [60, __("Merchant Monarch"), __("A wealthy merchant rules the city. A Market District is forced."), {}, "monarch"],
    [75, __("Military Officer"), __("A military officer runs the city."), { lawEnforcementMod: 1 }],
    [90, __("Oligarchy"), __("A small group rules the city."), {}, "oligarchy"],
    [99, __("Underworld/Criminal Enterprise"), __("Criminals pull the strings in the city. Organized crime is always rolled."), { crimeMod: -2 }, "underworld"],
    [100, __("Anarcho-Syndicalist Commune"), __("The city is run as a commune.")]
];

const OLIGARCHY_GROUPS = [
    [__("Merchants (plutocracy)"), __("Merchant")],
    [__("Mages (magocracy)"), __("Arcane")],
    [__("Priests (theocracy)"), __("Temple")],
    [__("Other"), null]
];

const LAW_ENFORCEMENT = [
    [1, __("None"), __("There is no law enforcement."), { crimeMod: -5 }],
    [4, __("Skeleton City Watch"), __("A skeleton watch keeps the peace."), { crimeMod: -3 }],
    [11, __("City Watch"), __("A city watch keeps the peace."), { crimeMod: -1 }],
    [17, __("Robust City Watch"), __("A robust watch keeps the peace.")],
    [20, __("Extensive City Watch"), __("An extensive watch keeps the peace."), { crimeMod: 2 }]
];

// Fifth item: urban encounter modifier; sixth: whether organized crime is rolled
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

const DISTRICT_COUNT = [[2, 2], [10, 3], [15, 4], [19, 5], [20, 6]];

const DISTRICT_TYPES = [
    __("Administration"), __("Arcane"), __("Botanical"), __("Craft"), __("Docks"), __("Industrial"),
    __("Market"), __("Merchant"), __("Scholar"), __("Slums"), __("Temple"), __("Upper Class")
];

// [maxRoll, steps from the general level]
const RELATIVE_STEPS = [[3, -2], [7, -1], [13, 0], [17, 1], [20, 2]];

const DISTRICT_ENTRY = [
    [4, __("Open"), 0],
    [7, __("Lightly Guarded"), 1],
    [10, __("Guarded"), 2],
    [12, __("Gated & Guarded"), 3]
];

const HOUSING = [[5, __("None")], [9, __("Limited")], [11, __("Moderate")], [12, __("Extensive")]];
const NOTABLE_COUNT = [[1, 0], [5, 1], [9, 2], [10, 3]];

// Location tokens: "HH" hired help (d10), "HH:<type>" fixed hired help, "HH6" priestly hired help (d6),
// "MS" magic shop (d6), "MS:<type>" fixed magic shop, "TEMPLE" temple (d6).
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
        additional: [__("General Store"), __("Tailor"), __("Thatcher"), __("Weaver"), __("Alchemist"), __("Bank & Exchange"), __("Rare Botanicals"), __("Luxury Furnishings"), __("Rare Libations & Fare"), __("Rare Trade Goods"), __("MS:Books"), __("Doctor/Apothecary"), __("HH:Scholars & Clerics"), __("Archives/Library"), __("Academy/University"), __("Forum"), __("Schoolhouse"), __("Gathering Hall")]
    },
    [__("Slums")]: {
        included: [__("Butcher"), __("House of Leisure"), __("Inn"), __("Tavern")],
        additional: [__("Baker"), __("Butcher"), __("General Store"), __("Smithy"), __("Thatcher"), __("Weaver"), __("Alchemist"), __("Foundry/Smelting"), __("Miller"), __("Textile Production"), __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Club"), __("Soothsayer"), __("Tavern")]
    },
    [__("Temple")]: {
        included: [__("TEMPLE"), __("Archives/Library"), __("HH:Scribes"), __("HH:Priestly Guidance"), __("HH:Hands of the Divine")],
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
const SERVICES = new Set([
    __("Barber"), __("Bathhouse"), __("Doctor/Apothecary"), __("House of Leisure"), __("Inn"), __("Club"), __("Soothsayer"), __("Stable"), __("Tavern")
]);
const ENTERTAINMENT = [__("Club"), __("Tavern"), __("House of Leisure"), __("Amphitheater"), __("Dance Hall")];

const HIRED_HELP = [
    __("Brutes & Brawlers"), __("Cloak & Dagger"), __("Bows & Slings"), __("Scribes & Clerks"), __("Guides & Trackers"),
    __("Caravan & Mount"), __("Arcane Academics"), __("Magic Mercenaries"), __("Priestly Guidance"), __("Hands of the Divine")
];
const HIRED_HELP_SIZE = [[6, __("Individual")], [10, __("Team")], [12, __("Guild")]];
const MAGIC_SHOPS = [__("Armor"), __("Books"), __("Clothing"), __("Jewelry"), __("Weapons"), __("Misc & Curiosities")];
const INDUSTRIAL = [__("Foundry/Smelting"), __("Foundry/Smelting"), __("Textile Production"), __("Textile Production"), __("Miller"), __("Miller")];

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

const RECENT_HISTORY = [
    __("City-Sponsored Construction: a city-sponsored construction project collapsed."),
    __("Market Hooligans: a hooligan gang has been causing trouble at the market."),
    __("Tavern Fire: an adventurers' bar brawl burned down a tavern."),
    __("Inventor's Contraption: an inventor's contraption has caused a stir."),
    __("Heavy Weather: heavy storms or blizzards battered the city."),
    __("New Craze: a visitor started a new craze or fashion."),
    __("Foreign Representative: a neighboring kingdom's representative is arriving."),
    __("Mysterious Illness: a mysterious illness is spreading."),
    __("Broken Gate: the main gate is broken."),
    __("Calls for Change: there are calls for new leadership."),
    __("Inedible Cuisine: the local cuisine has been rendered inedible."),
    __("Mysterious Contest: a mysterious contest is under way."),
    __("Fantastic Resource: an important resource has a fantastic yield."),
    __("Inflation: adventurers are causing inflation."),
    __("Sudden Fame: someone gained incredible fame."),
    __("Illegal Goods: illegal substances or goods are circulating."),
    __("Taxes Raised: taxes were raised."),
    __("Taxes Abolished: taxes were abolished."),
    __("Neighbor Attacked: a neighboring kingdom was attacked."),
    __("Deity Appeared: a deity appeared.")
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
priorityValue();
ageValue();
sizeValue();
populationCapacityValue();
outsideCityValue();
stewardshipValue();
generalConditionValue();
environmentValue();
fortificationValue();
vendorStallAcquisitonValue();
merchantOverflowValue();
marketSquareValue();
undergroundPassagesValue();

// Community
populationDensityValue();
demographicsValue();
populationWealthValue();
visitorTrafficValue();
dispositionValue();
nightActivityValue();
leadershipValue();
lawEnforcementValue();
generalCrimeValue();
organizedCrimeValue();

// Districts
districtsValue();

// Extra Intrigue
recentHistoryValue();
noteworthyOfficialValue();
beneathSurfaceValue();

function originValue() {
    rollTable("origin", 10, ORIGIN);
}

function priorityValue() {
    const { roll } = rollTable("priority", 6, PRIORITY);
    state.priority = roll;

    if (roll === 3) {
        state.forcedDistricts.push(__("Scholar"));
    } else if (roll === 6) {
        state.forcedDistricts.push(__("Temple"));
    }
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

function outsideCityValue() {
    setGenContext("outsideCity");
    const results = [];

    for (let i = 0; i < OUTSIDE_ROLLS[state.sizeIndex]; i++) {
        let roll = rollDie(20);
        for (let attempt = 0; i === 0 && state.priority === 5 && roll <= 4 && attempt < 50; attempt++) {
            roll = rollDie(20);
        }
        results.push(describe(lookup(OUTSIDE, roll)));
    }

    show("outsideCity", results.join("<br>"));
}

function stewardshipValue() {
    rollTable("stewardship", 20, STEWARDSHIP);
}

function generalConditionValue() {
    const { entry } = rollTable("generalCondition", 20, GENERAL_CONDITION, "conditionMod");
    state.conditionLevel = GENERAL_CONDITION.indexOf(entry);
}

function environmentValue() {
    const { entry } = rollTable("environment", 10, ENVIRONMENT);
    state.environment = entry[1];
    state.waterside = [__("Coastal"), __("River")].includes(entry[1]);
}

function fortificationValue() {
    rollTable("fortification", 20, FORTIFICATION);
}

function vendorStallAcquisitonValue() {
    rollTable("vendorStallAcquisiton", 4, VENDOR_STALL);
}

function merchantOverflowValue() {
    rollTable("merchantOverflow", 4, MERCHANT_OVERFLOW);
}

function marketSquareValue() {
    rollTable("marketSquare", 6, MARKET_SQUARE);
}

function undergroundPassagesValue() {
    rollTable("undergroundPassages", 20, UNDERGROUND);
}

function populationDensityValue() {
    rollTable("populationDensity", 20, POPULATION_DENSITY, "populationDensityMod");
}

function demographicsValue() {
    rollTable("demographics", 20, DEMOGRAPHICS);
}

function populationWealthValue() {
    rollTable("populationWealth", 20, POPULATION_WEALTH, "populationWealthMod");
}

function visitorTrafficValue() {
    rollTable("visitorTraffic", 20, VISITOR_TRAFFIC);
}

function dispositionValue() {
    rollTable("disposition", 20, DISPOSITION, "dispositionMod");
}

function nightActivityValue() {
    rollTable("nightActivity", 20, NIGHT_ACTIVITY, "nightActivityMod");
}

function leadershipValue() {
    setGenContext("leadership");
    const entry = lookup(LEADERSHIP, rollDie(100));
    let text = describe(entry);
    addMods(entry[3] || {});

    if (entry[4] === "monarch") {
        state.forcedDistricts.push(__("Market"));
    } else if (entry[4] === "underworld") {
        state.organizedCrimeForced = true;
    } else if (entry[4] === "oligarchy") {
        const [group, district] = OLIGARCHY_GROUPS[rollDie(4) - 1];
        const forced = district || pickRandom(DISTRICT_TYPES.filter(type => type !== __("Docks") || state.waterside));
        state.forcedDistricts.push(forced);
        text += `${__(" Ruling group: ")}${group}${__(". Forced district: ")}${forced}.`;
    }

    show("leadership", text + effectNote(entry[3]));
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
    let hiredType = "";
    let commercial = true;
    let extra = "";

    if (token === __("TEMPLE")) {
        const kind = rollDie(6) <= 4 ? __("Temple") : __("Great Temple");
        const fervency = lookup([[1, __("Unseen")], [5, __("Quiet")], [10, __("Subtle")], [16, __("Moderate")], [19, __("Fervent")], [20, __("Zealous")]], rollDie(20))[1];
        const alignment = lookup([[1, __("Evil")], [5, __("Neutral")], [10, __("Good")]], rollDie(10))[1];
        return { name: kind, text: `<b>${kind}</b> - ${fervency}${__(" following, ")}${alignment}` };
    }
    if (token === __("INDUSTRY")) {
        name = INDUSTRIAL[rollDie(6) - 1];
    } else if (token === __("MS") || token.startsWith(__("MS:"))) {
        name = __("Magic Shop - ") + (token === __("MS") ? MAGIC_SHOPS[rollDie(6) - 1] : token.slice(3));
    } else if (token === __("HH") || token === __("HH6") || token.startsWith(__("HH:"))) {
        hiredType = token === __("HH") ? HIRED_HELP[rollDie(10) - 1]
            : token === __("HH6") ? (rollDie(6) <= 3 ? __("Priestly Guidance") : __("Hands of the Divine"))
                : token.slice(3);
        if (hiredType.includes(__(" or "))) {
            hiredType = pickRandom(hiredType.split(__(" or ")));
        }
        name = __("Hired Help - ") + hiredType;
        extra = ` - ${lookup(HIRED_HELP_SIZE, rollDie(12))[1]}`;
    } else if (NON_COMMERCIAL.has(token)) {
        commercial = false;
    }

    if (!commercial) {
        return { name, text: `<b>${name}</b>` };
    }

    const quality = QUALITY_LEVELS[qualityIndex(qualityMod, shift)];
    const names = POOR_FINE_NAMES[name];
    let label = name;

    if (names && quality !== __("Good")) {
        label = names[quality === __("Poor") ? 0 : 1];
    }

    return { name, text: `<b>${label}</b>${extra} - ${quality}${guildNote(name)}`, commercial: true };
}

function rollAdditionalToken(table) {
    let roll = rollDie(20);
    let shift = 0;

    for (let attempt = 0; (roll === 1 || roll === 20) && attempt < 50; attempt++) {
        shift += roll === 1 ? -1 : 1;
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
        if (allowed && !types.includes(type)) {
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
        show(id, buildDistrict(id, type));
    });
}

function buildDistrict(id, type) {
    setGenContext(id);
    const slums = type === __("Slums");
    const upper = type === __("Upper Class");
    const data = DISTRICTS[type];

    const conditionRoll = rollDie(slums ? 4 : 20, modValue("districtConditionMod") + (upper ? 3 : 0), "districtConditionMod");
    const step = lookup(RELATIVE_STEPS, conditionRoll)[1];
    const level = clamp(state.conditionLevel + step, 0, 4);
    const entry = lookup(DISTRICT_ENTRY, rollDie(12));
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

    if (state.priority === 4) {
        const venue = pickRandom(data.additional.filter(token => ENTERTAINMENT.includes(token)).concat([__("Club"), __("Tavern")]));
        const location = buildLocation(venue, qualityMod, 0);
        location.text += __(" (Entertainment priority)");
        locations.push(location);
    }

    const notable = [...locations.keys()].sort(() => Math.random() - 0.5).slice(0, Math.min(notableCount, locations.length));
    for (const index of notable) {
        locations[index].text += ` - <i>${__("Notable: ")}${NOTABILITY[rollDie(20) - 1]}</i>`;
    }

    const summary = [
        `<b>${__("Condition:")}</b> ${CONDITION_LEVELS[level]}`,
        `<b>${__("Entry:")}</b> ${entry[1]}`,
        `<b>${__("Crime:")}</b> ${CRIME_LEVELS[crimeLevel]}`,
        `<b>${__("Housing:")}</b> ${housing}`,
        `<b>${__("Notable locations:")}</b> ${notableCount}`
    ].join(" | ");

    return `${summary}<br><br>${locations.map(location => location.text).join("<br>")}`;
}

function recentHistoryValue() {
    setGenContext("recentHistory");
    const [title, description] = RECENT_HISTORY[rollDie(20) - 1].split(": ");
    show("recentHistory", `<b>${title}.</b> ${description.charAt(0).toUpperCase()}${description.slice(1)}`);
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
