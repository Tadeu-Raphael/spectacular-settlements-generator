// Town generator based on "Spectacular Settlements" (Chapter Four: Towns).
// Tables are [maxRoll, name, description, modifiers]; a roll <= 0 counts as the first entry
// and a roll above the maximum counts as the last one.

const mods = {};
const state = {
    priority: 0,
    specialty: 0,
    sizeIndex: 2,
    environment: "",
    waterside: false,
    freeNonCommercial: [],
    freeShops: [],
    freeServices: [],
    innQuality: null,
    commercialBonus: 0
};

const SIZE_NAMES = [__("Very Small"), __("Small"), __("Medium"), __("Large"), __("Very Large")];
const NON_COMMERCIAL_COUNT = [1, 2, 3, 4, 5];
const COMMERCIAL_COUNT = [4, 6, 8, 10, 12];
const FARM_ROLLS = [1, 2, 2, 3, 3];

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

// Tables
const ORIGIN = [
    [1, __("Accidental"), __("The town was never meant to be anything more than a camp or minor settlement. Outsiders found the place, some stayed, some left and told others, and over time the place grew.")],
    [2, __("Decree"), __("Some authority decided a town was needed here, set aside funds and materials, and established it.")],
    [3, __("Exodus or Exile"), __("A group of settlers left (or were forced to leave) their home, found this place and decided to build.")],
    [4, __("Key Crossroads"), __("The town was established on a crossroads frequented by travelers from all over.")],
    [5, __("Military Camp"), __("A deployment lasted longer than anticipated, so the camp built more solid fortifications and became permanent. Either the original members still reside here, or others occupied it after they left.")],
    [6, __("Port"), __("The town established itself on the water where none had done so previously, sprouting piers and roads taken by merchants and travelers alike.")],
    [7, __("Rapid"), __("Fueled by ambition, strong will and access to excellent products or resources, a group of people created this town in an important location. It almost seemed to spring up overnight.")],
    [8, __("Steady"), __("Built piece by piece over time, this town was a labor of commitment and devotion, taking years or even decades.")]
];

const PRIORITY = [
    [1, __("Military"), __("The town prioritizes defenses and law enforcement."), { fortificationMod: 1, lawEnforcementMod: 1 }],
    [2, __("Government"), __("The town prioritizes structure, order and law. Reroll any leadership result from 91-100. Free location: Non-Commercial - Place of Government."), { lawEnforcementMod: 1 }],
    [3, __("Production"), __("The town prioritizes generation and movement of resources. Roll a d4 instead of a d8 on the specialty table.")],
    [4, __("Economic"), __("The town prioritizes its market, with a large area, wide streets, more shops and lodging. Consider the town 1 size category larger on the commercial locations table."), { marketSquareMod: 2 }],
    [5, __("Religious"), __("The town contains substantial temples in prominent locations. Free location: Non-Commercial - Place of Worship, with +5 to its size roll.")],
    [6, __("Magic"), __("The town is focused on some form of magical pursuit. Free location: Shop - Magic Shop.")]
];

const SPECIALTY = [
    [1, __("Craft"), __("The town is known for the quality of its craftspeople.")],
    [2, __("Farming/Resource Gathering"), __("The town is known for its farms or resources. +1 to the farms and resources roll, rerolling results of 1-8.")],
    [3, __("Industry"), __("The town is known for its industrial output. Free shop: Mill, Textile Production or Foundry/Smelting.")],
    [4, __("Unique Shipping Methods"), __("The town is known for unusual ways of moving goods.")],
    [5, __("Connections"), __("The town is known for the people and contacts it has.")],
    [6, __("Drink"), __("The town is known for its drinks.")],
    [7, __("Education"), __("The town is known for its learning. Free location: Non-Commercial - Place of Education.")],
    [8, __("Hospitality"), __("The town is known for its hospitality. The default inn quality is d6: 1-3 good, 4-6 fine.")]
];

const AGE = [
    [2, __("Recent"), __("The town was founded recently."), { populationDensityMod: -2 }],
    [4, __("Established"), __("The town has been settled for a good while."), { populationDensityMod: -1 }],
    [6, __("Mature"), __("The town has settled into its ways.")],
    [8, __("Old"), __("The town has stood for generations."), { populationDensityMod: 1 }],
    [10, __("Ancient"), __("The town has existed for centuries."), { populationDensityMod: 2 }]
];

const SIZE = [
    [2, __("Very Small"), __("About 1000 people."), { populationOverflowMod: 2 }],
    [6, __("Small"), __("About 2000 people."), { populationOverflowMod: 1 }],
    [14, __("Medium"), __("About 4000 people.")],
    [18, __("Large"), __("About 6000 people."), { populationOverflowMod: -1 }],
    [20, __("Very Large"), __("About 8000 people."), { populationOverflowMod: -2 }]
];

const CONDITION = [
    [1, __("Derelict"), __("The town is in ruinous shape."), { populationWealthMod: -6 }],
    [4, __("Lousy"), __("The town is in poor shape."), { populationWealthMod: -3 }],
    [12, __("Moderate"), __("The town is in ordinary shape.")],
    [19, __("Robust"), __("The town is in good shape."), { populationWealthMod: 3 }],
    [20, __("Superb"), __("The town is in excellent shape."), { populationWealthMod: 6 }]
];

const ENVIRONMENT = [
    [1, __("Coastal"), __("The town sits on the coast.")],
    [2, __("Forest"), __("The town sits in or near a forest.")],
    [3, __("Mountains"), __("The town sits in the mountains.")],
    [4, __("Plains"), __("The town sits on open plains.")],
    [5, __("River"), __("The town sits along a river.")],
    [6, __("Swamp"), __("The town sits in a swamp.")],
    [7, __("Underground"), __("The town lies underground.")],
    [8, __("Valley"), __("The town sits in a valley.")],
    [9, __("Tundra"), __("The town sits in the tundra.")],
    [10, __("Desert"), __("The town sits in a desert.")]
];

const PROSPERITY = [
    [1, __("Abysmal Failure"), __("The town has done terribly."), { visitorTrafficMod: -8, populationWealthMod: -13 }],
    [4, __("Failure"), __("The town has done poorly."), { visitorTrafficMod: -6, populationWealthMod: -6 }],
    [10, __("Mildly Successful"), __("The town has done modestly."), { visitorTrafficMod: -1, populationWealthMod: -3 }],
    [16, __("Successful"), __("The town has done well.")],
    [19, __("Very Successful"), __("The town has done very well."), { visitorTrafficMod: 2, populationWealthMod: 3 }],
    [20, __("Incredibly Successful"), __("The town has thrived beyond measure."), { visitorTrafficMod: 6, populationWealthMod: 6 }]
];

const MARKET_SQUARE = [
    [2, __("Tight"), __("The market square is cramped.")],
    [4, __("Ample"), __("The market square has plenty of room.")],
    [6, __("Spacious"), __("The market square is large and open.")]
];

const VENDOR_STALL = [
    [1, __("First Come, No Fee"), __("Vendors take a spot on a first come basis, free of charge.")],
    [2, __("First Come, Fee"), __("Vendors take a spot on a first come basis, for a fee.")],
    [3, __("Lease"), __("Vendors lease their stall spots.")],
    [4, __("Bid"), __("Vendors bid for their stall spots.")]
];

const MERCHANT_OVERFLOW = [
    [1, __("Banned"), __("Merchants may not sell outside the market square."), { lawEnforcementMod: 1 }],
    [2, __("Unpatrolled"), __("Merchants selling outside the market square are left alone.")],
    [3, __("Monitored"), __("Merchants selling outside the market square are watched.")],
    [4, __("Encouraged"), __("Merchants are encouraged to sell all around town.")]
];

const FORTIFICATION = [
    [1, __("Unfortified"), __("The town has no defenses."), { dispositionMod: -5 }],
    [8, __("Lightly Fortified"), __("The town has light defenses."), { dispositionMod: 1 }],
    [15, __("Fortified"), __("The town is fortified."), { dispositionMod: 3 }],
    [19, __("Heavily Fortified"), __("The town is heavily fortified."), { dispositionMod: 5 }],
    [20, __("Extremely Fortified"), __("The town is extremely fortified. Consider adding a fortress (Chapter 7)."), { dispositionMod: 7 }]
];

const POPULATION_DENSITY = [
    [2, __("Skeleton"), __("The town is nearly empty."), { populationOverflowMod: -2, nightActivityMod: -2 }],
    [6, __("Sparse"), __("The town is thinly populated."), { populationOverflowMod: -1, nightActivityMod: -1 }],
    [14, __("Populous"), __("The town is comfortably populated.")],
    [18, __("Dense"), __("The town is densely populated."), { populationOverflowMod: 1, nightActivityMod: 1 }],
    [20, __("Crowded"), __("The town is crowded."), { populationOverflowMod: 2, nightActivityMod: 2 }]
];

const POPULATION_OVERFLOW = [
    [1, __("Less than 10%"), __("Fewer than 10% of the population lives outside the walls.")],
    [4, "10%", __("10% of the population lives outside the town proper.")],
    [12, "20%", __("20% of the population lives outside the town proper.")],
    [17, "30%", __("30% of the population lives outside the town proper.")],
    [19, "40%", __("40% of the population lives outside the town proper.")],
    [20, "50%", __("50% of the population lives outside the town proper.")]
];

const FARMS = [
    [4, __("None"), __("No farms or resources here.")],
    [11, __("Farming [Agriculture]"), __("Crop fields surround the town.")],
    [16, __("Farming [Livestock]"), __("Livestock is raised around the town.")],
    [20, __("Resource Harvesting"), __("The town harvests a local resource.")]
];

const VISITOR_TRAFFIC = [
    [3, __("Mostly Locals"), __("Almost everyone seen in town is local."), { nightActivityMod: 0 }],
    [9, __("Groups"), __("Small groups of visitors come and go."), { nightActivityMod: 1 }],
    [14, __("Crowds"), __("Crowds of visitors are common."), { nightActivityMod: 2 }],
    [17, __("Droves"), __("Visitors arrive in droves."), { nightActivityMod: 3 }],
    [19, __("Masses"), __("Masses of visitors fill the town."), { nightActivityMod: 4 }],
    [20, __("Multitudes"), __("Multitudes of visitors constantly arrive."), { nightActivityMod: 5 }]
];

const NIGHT_ACTIVITY = [
    [2, __("Dark"), __("The town is dark and shut at night.")],
    [6, __("Quiet"), __("The town is quiet at night.")],
    [14, __("Slow"), __("Some places stay open at night.")],
    [18, __("Active"), __("The town is active at night.")],
    [20, __("Lively"), __("The town is lively all night.")]
];

const DEMOGRAPHICS = [
    [4, __("Only One"), __("The population is 100% of one primary race.")],
    [8, __("Only Two"), __("The population is split 60%/40% between two races.")],
    [14, __("Normal Distribution"), __("The population is 50% primary, then 25%, 15% and 10% other races.")],
    [17, __("Wide Distribution"), __("20% of the population is the primary race, and others are reasonably well represented.")],
    [19, __("High and Low"), __("The population is split 80%/20%.")],
    [20, __("Ever-Changing"), __("The population shifts constantly.")]
];

const DISPOSITION = [
    [2, __("Hostile"), __("The townsfolk are hostile to outsiders.")],
    [6, __("Unfriendly"), __("The townsfolk are unfriendly to outsiders.")],
    [14, __("Neutral"), __("The townsfolk are neutral to outsiders.")],
    [18, __("Friendly"), __("The townsfolk are friendly to outsiders.")],
    [20, __("Open"), __("The townsfolk are open and welcoming.")]
];

const LEADERSHIP = [
    [15, __("Town Council"), __("A council governs the town. Free location: Non-Commercial - Town Hall."), {}, "townHall"],
    [30, __("Mayor"), __("A mayor governs the town.")],
    [45, __("Hereditary"), __("A hereditary ruler governs the town.")],
    [60, __("Merchant Monarch"), __("A wealthy merchant rules the town. +2 to the commercial locations number."), {}, "monarch"],
    [75, __("Military Rule"), __("The military runs the town."), { lawEnforcementMod: 1 }],
    [90, __("Oligarchy"), __("A small group rules the town."), {}, "oligarchy"],
    [99, __("Underworld/Criminal Enterprise"), __("Criminals pull the strings in the town."), { crimeMod: -1 }],
    [100, __("Anarcho-Syndicalist Commune"), __("The town is run as a commune.")]
];

const OLIGARCHY_GROUPS = [__("Merchants (plutocracy)"), __("Mages (magocracy)"), __("Priests (theocracy)"), __("Other")];

const LAW_ENFORCEMENT = [
    [1, __("None"), __("There is no law enforcement."), { crimeMod: -8 }],
    [4, __("Sheriff"), __("A sheriff keeps the peace."), { crimeMod: -4 }],
    [9, __("Small Town Watch"), __("A small watch keeps the peace."), { crimeMod: -2 }],
    [16, __("Town Watch"), __("A town watch keeps the peace.")],
    [19, __("Strong Town Watch"), __("A strong watch keeps the peace."), { crimeMod: 4 }],
    [20, __("Extensive Town Watch"), __("An extensive watch keeps the peace."), { crimeMod: 8 }]
];

const POPULATION_WEALTH = [
    [2, __("Destitute"), __("The population is destitute."), { crimeMod: -4, qualityMod: -2 }],
    [6, __("Impoverished"), __("The population is poor."), { crimeMod: -2, qualityMod: -1 }],
    [14, __("Average"), __("The population is of average means.")],
    [17, __("Prosperous"), __("The population is prosperous."), { crimeMod: -1, qualityMod: 1 }],
    [19, __("Wealthy"), __("The population is wealthy."), { crimeMod: -2, qualityMod: 2 }],
    [20, __("Affluent"), __("The population is affluent."), { crimeMod: -3, qualityMod: 3 }]
];

const CRIME = [
    [2, __("Regular"), __("Crime is a regular occurrence."), { urbanEncounterMod: 4 }],
    [6, __("Common"), __("Crime is common."), { urbanEncounterMod: 3 }],
    [14, __("Average"), __("Crime is average."), { urbanEncounterMod: 2 }],
    [18, __("Uncommon"), __("Crime is uncommon."), { urbanEncounterMod: 1 }],
    [20, __("Rare"), __("Crime is rare."), { urbanEncounterMod: 0 }]
];

const NON_COMMERCIAL_TYPES = [__("Education"), __("Gathering"), __("Government"), __("Worship")];
const EDUCATION = [__("Academy/University"), __("Archives/Library"), __("Forum"), __("Schoolhouse")];
const GATHERING = [__("Amphitheater"), __("Dance Hall"), __("Gathering Hall"), __("Outdoor Recreational Area")];
const GOVERNMENT = [__("Chancery"), __("Courthouse"), __("Town Hall"), __("Treasury")];
const NON_COMMERCIAL_SUBTYPES = { [__("Education")]: EDUCATION, [__("Gathering")]: GATHERING, [__("Government")]: GOVERNMENT };

const WORSHIP_SIZE = [
    [1, __("Secret")], [5, __("Altar")], [10, __("Oratory")], [16, __("Sanctuary")], [19, __("Temple")], [20, __("Great Temple")]
];
const WORSHIP_FERVENCY = [
    [1, __("Unseen")], [5, __("Quiet")], [10, __("Subtle")], [16, __("Moderate")], [19, __("Fervent")], [20, __("Zealous")]
];
const WORSHIP_ALIGNMENT = [[1, __("Evil")], [5, __("Neutral")], [10, __("Good")]];

const MAGIC_SHOPS = [__("Armor"), __("Books"), __("Clothing"), __("Jewelry"), __("Weapons"), __("Misc & Curiosities")];

// Third item: B = Basic, S = Specialty, E = Exotic
const SHOPS = [
    [4, __("Baker"), __("B")], [8, __("Butcher"), __("B")], [12, __("Cooper"), __("B")], [16, __("Carpenter"), __("B")],
    [24, __("General Store"), __("B")], [28, __("Herbalist"), __("B")], [36, __("Smithy"), __("B")], [40, __("Tailor"), __("B")],
    [44, __("Tanner/Taxidermist"), __("B")], [48, __("Thatcher"), __("B")], [52, __("Wainwright"), __("B")], [56, __("Weaver"), __("B")],
    [59, __("Alchemist"), __("S")], [62, __("Artist"), __("S")], [65, __("Bank & Exchange"), __("S")], [68, __("Cobbler"), __("S")],
    [71, __("Foundry/Smelting"), __("S")], [74, __("Mill"), __("S")], [77, __("Textile Production"), __("S")], [80, __("Shipwright"), __("S")],
    [82, __("Rare Botanicals"), __("E")], [84, __("Luxury Furnishings"), __("E")], [86, __("Rare Libations & Fare"), __("E")],
    [88, __("Rare Trade Goods"), __("E")], [90, __("Magic Shop - Armor"), __("E")], [92, __("Magic Shop - Books"), __("E")],
    [94, __("Magic Shop - Clothing"), __("E")], [96, __("Magic Shop - Jewelry"), __("E")], [98, __("Magic Shop - Weapons"), __("E")],
    [100, __("Magic Shop - Misc & Curiosities"), __("E")]
];
const SHOP_CLASS = { B: __("Basic"), S: __("Specialty"), E: __("Exotic") };

const SERVICES = [
    [8, __("Barber")], [16, __("Bathhouse")], [24, __("Doctor/Apothecary")], [32, __("House of Leisure")], [44, __("Inn")],
    [52, __("Club")], [60, __("Soothsayer")], [68, __("Stable")], [80, __("Tavern")],
    [82, __("Hired Help - Brutes and Brawlers")], [84, __("Hired Help - Cloak and Dagger")],
    [86, __("Hired Help - Bows and Slings")], [88, __("Hired Help - Scribes and Clerks")],
    [90, __("Hired Help - Guides and Trackers")], [92, __("Hired Help - Caravan and Mount")],
    [94, __("Hired Help - Arcane Academics")], [96, __("Hired Help - Magic Mercenaries")],
    [98, __("Hired Help - Priestly Guidance")], [100, __("Hired Help - Hands of the Divine")]
];

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

const HIRED_HELP_SIZE = [[6, __("Individual")], [10, __("Team")], [12, __("Guild")]];

const RECENT_HISTORY = [
    __("Defended: the town recently defended itself against a threat."),
    __("Pickpockets: a wave of pickpockets has been troubling the town."),
    __("No Adventurers: adventurers are unwelcome or unusually absent."),
    __("Asleep: the town is oddly sleepy, as if something has drained its energy."),
    __("Spiders: spiders have been appearing everywhere."),
    __("Tunnel: a mysterious tunnel was recently discovered."),
    __("Obstruction: something is blocking a main road or gate."),
    __("Event Night: a special night event is planned in town.")
];

const NOTEWORTHY_OFFICIAL = [
    __("Catchpole"), __("Clerk"), __("Exchequer"), __("Jailer"), __("Judge"), __("Liner"), __("Master of Revels"), __("Master of Stores")
];

const OFFICIAL_COMPETENCE = [
    [1, __("Corrupt")], [3, __("Incompetent")], [5, __("Committed")], [6, __("Overqualified")]
];

const MARKET_DAY = [
    __("A monkey merchant is selling trinkets."),
    __("Heavy rain turns the market to mud."),
    __("Produce is selling at half price."),
    __("Cattle have gotten loose in the market."),
    __("A stall catches fire."),
    __("A puppet show parodies local figures."),
    __("Bandits are posing as merchants."),
    __("A child is caught stealing an apple."),
    __("A wedding reception spills into the market."),
    __("A tavern special draws a long line."),
    __("An injured guard faints."),
    __("An infested wagon arrives.")
];

// Basic Information
originValue();
priorityValue();
specialtyValue();
ageValue();
sizeValue();
conditionValue();
environmentValue();
prosperityValue();
marketSquareValue();
vendorStallAcquisitonValue();
merchantOverflowValue();
fortificationValue();

// Community
populationDensityValue();
populationOverflowValue();
farmsAndResourcesValue();
visitorTrafficValue();
nightActivityValue();
demographicsValue();
dispositionValue();
leadershipValue();
lawEnforcementValue();
populationWealthValue();
crimeValue();

// Points of Interest
nonCommercialLocationsValue();
commercialLocationsValue();
shopsValue();
servicesValue();

// Extra Intrigue
recentHistoryValue();
noteworthyOfficialValue();
marketDayValue();

function originValue() {
    const { entry, roll } = rollTable("origin", 8, ORIGIN);

    if (roll === 6) {
        const water = rollDie(6) <= 3 ? __("Coastal") : __("River");
        state.environment = water;
        state.waterside = true;
        show("origin", describe(entry) + `${__(" (Environment: ")}${water})`);
    }
}

function priorityValue() {
    const { roll } = rollTable("priority", 6, PRIORITY);
    state.priority = roll;

    if (roll === 2) {
        state.freeNonCommercial.push({ type: __("Government"), name: __("Place of Government") });
    } else if (roll === 5) {
        state.freeNonCommercial.push({ type: __("Worship"), name: __("Place of Worship"), sizeBonus: 5 });
    } else if (roll === 6) {
        setGenContext("priority");
        state.freeShops.push(__("Magic Shop - ") + MAGIC_SHOPS[rollDie(6) - 1]);
    }
}

function specialtyValue() {
    const sides = state.priority === 3 ? 4 : 8;
    const { roll } = rollTable("specialty", sides, SPECIALTY);
    state.specialty = roll;

    if (roll === 3) {
        state.freeShops.push([__("Mill"), __("Mill"), __("Textile Production"), __("Textile Production"), __("Foundry/Smelting"), __("Foundry/Smelting")][rollDie(6) - 1]);
    } else if (roll === 7) {
        state.freeNonCommercial.push({ type: __("Education"), name: __("Place of Education") });
    } else if (roll === 8) {
        state.innQuality = rollDie(6) <= 3 ? __("Good") : __("Fine");
    }
}

function ageValue() {
    rollTable("age", 10, AGE);
}

function sizeValue() {
    const { entry } = rollTable("size", 20, SIZE);
    state.sizeIndex = SIZE.indexOf(entry);
}

function conditionValue() {
    rollTable("condition", 20, CONDITION);
}

function environmentValue() {
    if (state.environment) {
        show("environment", `<b>${state.environment}.</b>${__(" Set by the Port origin; this roll is skipped.")}`);
        return;
    }

    const { entry } = rollTable("environment", 10, ENVIRONMENT);
    state.environment = entry[1];
    state.waterside = [__("Coastal"), __("River")].includes(entry[1]);
}

function prosperityValue() {
    rollTable("prosperity", 20, PROSPERITY);
}

function marketSquareValue() {
    rollTable("marketSquare", 6, MARKET_SQUARE, "marketSquareMod");
}

function vendorStallAcquisitonValue() {
    rollTable("vendorStallAcquisiton", 4, VENDOR_STALL);
}

function merchantOverflowValue() {
    rollTable("merchantOverflow", 4, MERCHANT_OVERFLOW);
}

function fortificationValue() {
    rollTable("fortification", 20, FORTIFICATION, "fortificationMod");
}

function populationDensityValue() {
    rollTable("populationDensity", 20, POPULATION_DENSITY, "populationDensityMod");
}

function populationOverflowValue() {
    rollTable("populationOverflow", 20, POPULATION_OVERFLOW, "populationOverflowMod");
}

function farmsAndResourcesValue() {
    setGenContext("farmsAndResources");
    const farming = state.specialty === 2;
    const results = [];

    for (let i = 0; i < FARM_ROLLS[state.sizeIndex]; i++) {
        let roll = rollDie(20, farming ? 1 : 0, farming ? "farmsAndResourcesMod" : "");
        if (farming && roll <= 8) {
            roll = rollDie(20, 1, "farmsAndResourcesMod");
        }
        results.push(describe(lookup(FARMS, roll)));
    }

    if (farming) {
        logMod("farmsAndResourcesMod", 1);
    }
    show("farmsAndResources", results.join("<br>"));
}

function visitorTrafficValue() {
    rollTable("visitorTraffic", 20, VISITOR_TRAFFIC, "visitorTrafficMod");
}

function nightActivityValue() {
    rollTable("nightActivity", 20, NIGHT_ACTIVITY, "nightActivityMod");
}

function demographicsValue() {
    rollTable("demographics", 20, DEMOGRAPHICS);
}

function dispositionValue() {
    rollTable("disposition", 20, DISPOSITION, "dispositionMod");
}

function leadershipValue() {
    setGenContext("leadership");
    let roll = rollDie(100);
    while (state.priority === 2 && roll > 90) {
        roll = rollDie(100);
    }

    const entry = lookup(LEADERSHIP, roll);
    let text = describe(entry);
    addMods(entry[3] || {});

    if (entry[4] === "townHall") {
        state.freeNonCommercial.push({ type: __("Government"), name: __("Town Hall"), fixed: true });
    } else if (entry[4] === "monarch") {
        state.commercialBonus = 2;
        logMod("commercialLocationsMod", 2);
    } else if (entry[4] === "oligarchy") {
        const group = OLIGARCHY_GROUPS[rollDie(4) - 1];
        const type = NON_COMMERCIAL_TYPES[rollDie(4) - 1];
        state.freeNonCommercial.push({ type, name: `${__("Place of ")}${type}` });
        text += `${__(" Ruling group: ")}${group}${__(". Free location: Non-Commercial - ")}${type}.`;
    }

    show("leadership", text + effectNote(entry[3]));
}

function lawEnforcementValue() {
    rollTable("lawEnforcement", 20, LAW_ENFORCEMENT, "lawEnforcementMod");
}

function populationWealthValue() {
    rollTable("populationWealth", 20, POPULATION_WEALTH, "populationWealthMod");
}

function crimeValue() {
    rollTable("crime", 20, CRIME, "crimeMod");
}

function describeNonCommercial(location) {
    if (location.type === __("Worship")) {
        setGenContext("nonCommercialLocations");
        const size = lookup(WORSHIP_SIZE, rollDie(20, location.sizeBonus || 0, location.sizeBonus ? "placesWorshipMod" : ""))[1];
        const fervency = lookup(WORSHIP_FERVENCY, rollDie(20))[1];
        const alignment = lookup(WORSHIP_ALIGNMENT, rollDie(10))[1];
        return `<b>${__("Place of Worship")}</b> - ${size}, ${fervency}${__(" following, ")}${alignment}`;
    }

    return `<b>${location.name}</b>`;
}

function nonCommercialLocationsValue() {
    setGenContext("nonCommercialLocations");
    const locations = [...state.freeNonCommercial];
    const total = NON_COMMERCIAL_COUNT[state.sizeIndex] + locations.length;
    const used = new Set();

    for (const location of locations) {
        if (NON_COMMERCIAL_SUBTYPES[location.type] && !location.fixed) {
            location.name = rollSubtype(location.type, used);
        } else if (NON_COMMERCIAL_SUBTYPES[location.type]) {
            used.add(location.name);
        }
    }

    while (locations.length < total) {
        const type = NON_COMMERCIAL_TYPES[rollDie(4) - 1];
        const location = { type, name: `${__("Place of ")}${type}` };

        if (NON_COMMERCIAL_SUBTYPES[type]) {
            location.name = rollSubtype(type, used);
        }
        locations.push(location);
    }

    show("nonCommercialLocations", locations.map(describeNonCommercial).join("<br>"));
}

// Duplicates are treated as another location: reroll until an unused subtype shows up.
function rollSubtype(type, used) {
    const options = NON_COMMERCIAL_SUBTYPES[type];
    let name = options[rollDie(4) - 1];

    for (let i = 0; i < 20 && used.has(name); i++) {
        name = options[rollDie(4) - 1];
    }
    used.add(name);

    return name;
}

function commercialLocationsValue() {
    const index = Math.min(state.sizeIndex + (state.priority === 4 ? 1 : 0), SIZE_NAMES.length - 1);
    const total = COMMERCIAL_COUNT[index] + state.commercialBonus;
    state.commercialTotal = total;
    show("commercialLocations", `<b>${total}${__(" commercial locations")}</b> (${SIZE_NAMES[index]}${__(" town")}${state.commercialBonus ? __(", +2 Merchant Monarch") : ""}${__("). General Store, Smithy, Inn and Tavern are free and not counted.")}`);
}

function qualityOf(forcedQuality) {
    if (forcedQuality) {
        return forcedQuality;
    }

    const roll = rollDie(12, modValue("qualityMod"), "qualityMod");
    return roll <= 4 ? __("Poor") : roll <= 10 ? __("Good") : __("Fine");
}

function describeShop(name, classification) {
    const kind = classification ? ` (${SHOP_CLASS[classification]})` : "";
    return `<b>${name}</b>${kind} - ${qualityOf()}`;
}

function describeService(name, forcedQuality) {
    const quality = qualityOf(forcedQuality);
    const names = POOR_FINE_NAMES[name];
    let label = name;
    let extra = "";

    if (names && quality !== __("Good")) {
        label = names[quality === __("Poor") ? 0 : 1];
    }
    if (name.startsWith(__("Hired Help"))) {
        extra = ` - ${lookup(HIRED_HELP_SIZE, rollDie(12))[1]}`;
    }

    return `<b>${label}</b>${extra} - ${quality}`;
}

function shopsValue() {
    setGenContext("shops");
    const lines = [describeShop(__("General Store"), __("B")), describeShop(__("Smithy"), __("B"))];

    state.freeShops.forEach(name => {
        const entry = SHOPS.find(shop => shop[1] === name);
        lines.push(describeShop(name, entry ? entry[2] : __("E")));
    });

    state.shopCount = 0;
    state.serviceCount = 0;
    const rolls = [];

    for (let i = 0; i < state.commercialTotal; i++) {
        setGenContext("commercialLocations");
        rolls.push(rollDie(6) <= 3 ? "shop" : "service");
    }

    setGenContext("shops");
    rolls.filter(kind => kind === "shop").forEach(() => {
        let entry = lookup(SHOPS, rollDie(100));
        while (entry[1] === __("Shipwright") && !state.waterside) {
            entry = lookup(SHOPS, rollDie(100));
        }

        let name = entry[1];
        if (name === __("Smithy")) {
            const smith = rollDie(10);
            name = smith <= 6 ? __("Smithy") : smith <= 8 ? __("Smithy - Armorer") : __("Smithy - Weaponsmith");
        }
        lines.push(describeShop(name, entry[2]));
    });

    state.serviceCount = rolls.filter(kind => kind === "service").length;
    show("shops", lines.join("<br>"));
}

function servicesValue() {
    setGenContext("services");
    const lines = [describeService(__("Inn"), state.innQuality), describeService(__("Tavern"))];

    for (let i = 0; i < state.serviceCount; i++) {
        lines.push(describeService(lookup(SERVICES, rollDie(100))[1]));
    }

    show("services", lines.join("<br>"));
}

function recentHistoryValue() {
    setGenContext("recentHistory");
    const text = RECENT_HISTORY[rollDie(8) - 1];
    const [title, description] = text.split(": ");
    show("recentHistory", `<b>${title}.</b> ${description}`);
}

function noteworthyOfficialValue() {
    setGenContext("noteworthyOfficial");
    const official = NOTEWORTHY_OFFICIAL[rollDie(8) - 1];
    const competence = lookup(OFFICIAL_COMPETENCE, rollDie(6))[1];
    show("noteworthyOfficial", `<b>${official}.</b>${__(" Competence: ")}${competence}.`);
}

function marketDayValue() {
    setGenContext("marketDay");
    const text = MARKET_DAY[rollDie(12) - 1];
    show("marketDay", text);
}
