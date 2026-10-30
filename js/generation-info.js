window.generationLog = { rolls: [], modifiers: [], context: "" };

const MODIFIER_LABELS = {
    sizeMod: "Size",
    conditionMod: "Condition",
    dispotionMod: "Disposition",
    dispositionMod: "Disposition",
    popDenMod: "Population Density",
    populationDensityMod: "Population Density",
    popWeaMod: "Population Wealth",
    populationWealthMod: "Population Wealth",
    hardLikeMod: "Hardship Likelihood",
    crimeMod: "Crime",
    visitorTrafficMod: "Visitor Traffic",
    qualityMod: "Shop Quality",
    urbanEncounterMod: "Urban Encounters",
    fortificationMod: "Fortification",
    lawEnforcementMod: "Law Enforcement",
    marketSquareMod: "Market Square",
    placesWorshipMod: "Places of Worship",
    farmsAndResourcesMod: "Farms and Resources",
    populationOverflowMod: "Population Overflow",
    nightActivityMod: "Night Activity",
    commercialLocationsMod: "Commercial Locations",
    districtCountMod: "Number of Districts",
    districtConditionMod: "District Condition",
    militaryForceMod: "Military Force",
    residenceMod: "Residence",
    otherLocationsTypeAux: "Other Locations Type",
    residentsMod: "Residents",
    roomsMod: "Number of Rooms",
    furnishingsMod: "Furnishings",
    moatMod: "Moat"
};

function setGenContext(fieldId) {
    generationLog.context = fieldId;
}

function rollDie(sides, modifier = 0, modifierName = "") {
    const value = Math.floor(Math.random() * sides) + 1;
    const total = value + modifier;

    generationLog.rolls.push({
        field: generationLog.context,
        sides,
        value,
        modifier,
        modifierName,
        total
    });

    return total;
}

function logMod(name, amount) {
    generationLog.modifiers.push({ name, amount, field: generationLog.context });
    return amount;
}

function formatSigned(number) {
    return number > 0 ? `+${number}` : String(number);
}

function modifierLabel(name) {
    return t(MODIFIER_LABELS[name] || name);
}

function fieldLabel(fieldId) {
    const heading = document.getElementById(fieldId)?.previousElementSibling;
    return heading?.tagName === "H3"
        ? t(heading.dataset.i18nKey || heading.innerText.trim())
        : t(fieldId);
}

function summarizeModifiers() {
    const groups = new Map();

    for (const entry of generationLog.modifiers) {
        if (!groups.has(entry.name)) {
            groups.set(entry.name, { label: modifierLabel(entry.name), total: 0, sources: [] });
        }

        const group = groups.get(entry.name);
        group.total += entry.amount;
        group.sources.push(`${fieldLabel(entry.field)} (${formatSigned(entry.amount)})`);
    }

    return [...groups.values()];
}

function describeRoll(entry) {
    const dice = `d${entry.sides}`;
    const modifier = entry.modifier
        ? `${formatSigned(entry.modifier)}${entry.modifierName ? ` (${modifierLabel(entry.modifierName)})` : ""}`
        : "-";

    return { field: fieldLabel(entry.field), dice, value: entry.value, modifier, total: entry.total };
}

function createCell(tag, text) {
    const cell = document.createElement(tag);
    cell.textContent = text;
    return cell;
}

function createTable(headers, rows) {
    const wrapper = document.createElement("div");
    const table = document.createElement("table");
    const head = table.createTHead().insertRow();
    const body = table.createTBody();

    wrapper.className = "table-responsive";
    table.className = "table table-sm table-striped align-middle text-center mb-0";
    headers.forEach(header => head.appendChild(createCell("th", t(header))));
    rows.forEach(values => {
        const row = body.insertRow();
        values.forEach(value => row.appendChild(createCell("td", value)));
    });
    wrapper.appendChild(table);

    return wrapper;
}

function createInfoSection(title, content) {
    const section = document.createElement("section");
    const heading = document.createElement("h3");

    heading.textContent = title;
    section.appendChild(heading);
    section.appendChild(content);

    return section;
}

function createEmptyNote(text) {
    const note = document.createElement("p");
    note.textContent = text;
    return note;
}

function renderGenerationInfo() {
    const container = document.getElementById("generation-info");

    if (!container) {
        return;
    }

    const title = document.createElement("h2");
    const modifiers = summarizeModifiers();
    const rolls = generationLog.rolls.map(describeRoll);

    title.className = "h4 fw-semibold text-center border-bottom pb-2 mb-4 mt-0";
    title.textContent = t("Information");
    container.replaceChildren(title);

    container.appendChild(createInfoSection(
        t("Applied modifiers"),
        modifiers.length
            ? createTable(
                ["Modifier", "Total", "Source"],
                modifiers.map(item => [item.label, formatSigned(item.total), item.sources.join(", ")])
            )
            : createEmptyNote(t("No modifiers were generated in this roll."))
    ));

    container.appendChild(createInfoSection(
        t("Dice rolls"),
        rolls.length
            ? createTable(
                ["Field", "Die", "Die result", "Modifier", "Total"],
                rolls.map(item => [item.field, item.dice, item.value, item.modifier, item.total])
            )
            : createEmptyNote(t("No rolls were recorded."))
    ));
}

function formatGenerationInfoText() {
    const lines = [t("Information"), "", t("Applied modifiers")];
    const modifiers = summarizeModifiers();

    if (modifiers.length) {
        modifiers.forEach(item => lines.push(`${item.label}: ${formatSigned(item.total)} - ${item.sources.join(", ")}`));
    } else {
        lines.push(t("No modifiers were generated in this roll."));
    }

    lines.push("", t("Dice rolls"));
    generationLog.rolls.map(describeRoll).forEach(item => {
        const modifier = item.modifier === "-" ? "" : ` ${item.modifier}`;
        lines.push(`${item.field}: ${item.dice} = ${item.value}${modifier} -> ${item.total}`);
    });

    return lines;
}

document.addEventListener("DOMContentLoaded", renderGenerationInfo);
document.addEventListener("i18n:change", renderGenerationInfo);
