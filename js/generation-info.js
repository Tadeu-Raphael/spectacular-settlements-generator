window.generationLog = { rolls: [], modifiers: [], context: "" };

const rerollRecords = new Map();
const UNTRACKED_STATE = Symbol("untracked state");
const MISSING_STATE = Symbol("missing state");
let activeRerollRecord = null;
let generationRerollButtonsReady = document.readyState !== "loading";

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

function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function cloneStateValue(value) {
    if (Array.isArray(value)) {
        return value.map(cloneStateValue);
    }

    if (isPlainObject(value)) {
        const clone = Object.create(Object.getPrototypeOf(value));
        Object.keys(value).forEach(key => { clone[key] = cloneStateValue(value[key]); });
        return clone;
    }

    if (value === null || ["string", "number", "boolean", "undefined"].includes(typeof value)) {
        return value;
    }

    return UNTRACKED_STATE;
}

function snapshotGenerationState() {
    const snapshot = new Map();
    const ignored = new Set(["generationLog", "generatorModifiers"]);

    Object.keys(window).forEach(key => {
        if (ignored.has(key) || key.startsWith("__generationReroll") || key.startsWith("on")) {
            return;
        }

        const value = cloneStateValue(window[key]);
        if (value !== UNTRACKED_STATE) {
            snapshot.set(key, value);
        }
    });

    return snapshot;
}

function stateValuesEqual(left, right) {
    if (Object.is(left, right)) {
        return true;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
        return left.length === right.length && left.every((value, index) => stateValuesEqual(value, right[index]));
    }

    if (isPlainObject(left) && isPlainObject(right)) {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        return leftKeys.length === rightKeys.length &&
            leftKeys.every(key => Object.prototype.hasOwnProperty.call(right, key) && stateValuesEqual(left[key], right[key]));
    }

    return false;
}

function findStateSequence(array, sequence, start) {
    if (!sequence.length) {
        return start;
    }

    for (let index = start; index <= array.length - sequence.length; index++) {
        if (sequence.every((value, offset) => stateValuesEqual(array[index + offset], value))) {
            return index;
        }
    }

    for (let index = 0; index < start; index++) {
        if (sequence.every((value, offset) => stateValuesEqual(array[index + offset], value))) {
            return index;
        }
    }

    return -1;
}

function reverseStateMutation(before, after, current, modifierNames) {
    if (before === MISSING_STATE) {
        return stateValuesEqual(current, after) ? MISSING_STATE : current;
    }

    if (after === MISSING_STATE) {
        return current === MISSING_STATE ? cloneStateValue(before) : current;
    }

    if (stateValuesEqual(before, after)) {
        return current;
    }

    if (Array.isArray(before) && Array.isArray(after) && Array.isArray(current)) {
        let prefix = 0;
        while (prefix < before.length && prefix < after.length && stateValuesEqual(before[prefix], after[prefix])) {
            prefix++;
        }

        let suffix = 0;
        while (
            suffix < before.length - prefix &&
            suffix < after.length - prefix &&
            stateValuesEqual(before[before.length - 1 - suffix], after[after.length - 1 - suffix])
        ) {
            suffix++;
        }

        const removed = before.slice(prefix, before.length - suffix);
        const inserted = after.slice(prefix, after.length - suffix);
        const result = current.map(cloneStateValue);
        if (inserted.length) {
            const index = findStateSequence(result, inserted, prefix);
            if (index >= 0) {
                result.splice(index, inserted.length);
            }
        }
        if (removed.length) {
            result.splice(Math.min(prefix, result.length), 0, ...removed.map(cloneStateValue));
        }
        return result;
    }

    if (isPlainObject(before) && isPlainObject(after) && isPlainObject(current)) {
        const result = Object.create(Object.getPrototypeOf(current));
        Object.keys(current).forEach(key => { result[key] = cloneStateValue(current[key]); });
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

        keys.forEach(key => {
            if (modifierNames.has(key) || stateValuesEqual(before[key], after[key])) {
                return;
            }

            const previous = Object.prototype.hasOwnProperty.call(before, key) ? before[key] : MISSING_STATE;
            const generated = Object.prototype.hasOwnProperty.call(after, key) ? after[key] : MISSING_STATE;
            const existing = Object.prototype.hasOwnProperty.call(current, key) ? current[key] : MISSING_STATE;
            const restored = reverseStateMutation(previous, generated, existing, modifierNames);

            if (restored === MISSING_STATE) {
                delete result[key];
            } else {
                result[key] = restored;
            }
        });

        return result;
    }

    if (typeof before === "number" && typeof after === "number" && typeof current === "number") {
        return current - (after - before);
    }

    return stateValuesEqual(current, after) ? cloneStateValue(before) : current;
}

function replaceStateValue(current, next) {
    if (Array.isArray(current) && Array.isArray(next)) {
        current.splice(0, current.length, ...next.map(cloneStateValue));
        return current;
    }

    if (isPlainObject(current) && isPlainObject(next)) {
        Object.keys(current).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(next, key)) {
                delete current[key];
            }
        });
        Object.keys(next).forEach(key => {
            const oldValue = current[key];
            const newValue = next[key];
            if (
                (Array.isArray(oldValue) && Array.isArray(newValue)) ||
                (isPlainObject(oldValue) && isPlainObject(newValue))
            ) {
                current[key] = replaceStateValue(oldValue, newValue);
            } else {
                current[key] = cloneStateValue(newValue);
            }
        });
        return current;
    }

    return cloneStateValue(next);
}

function restoreGenerationState(before, after, modifierNames) {
    const keys = new Set([...before.keys(), ...after.keys()]);

    keys.forEach(key => {
        if (modifierNames.has(key)) {
            return;
        }

        const previous = before.has(key) ? before.get(key) : MISSING_STATE;
        const generated = after.has(key) ? after.get(key) : MISSING_STATE;
        const current = Object.prototype.hasOwnProperty.call(window, key) ? window[key] : MISSING_STATE;
        if (previous === MISSING_STATE && generated === MISSING_STATE) {
            return;
        }

        const restored = reverseStateMutation(previous, generated, current, modifierNames);
        if (restored === MISSING_STATE) {
            delete window[key];
        } else if (current !== MISSING_STATE && restored !== current &&
            ((Array.isArray(current) && Array.isArray(restored)) || (isPlainObject(current) && isPlainObject(restored)))) {
            window[key] = replaceStateValue(current, restored);
        } else {
            window[key] = restored;
        }
    });
}

function reverseGenerationModifiers(modifiers) {
    for (const { name, amount } of modifiers) {
        if (window.generatorModifiers) {
            window.generatorModifiers[name] = (window.generatorModifiers[name] || 0) - amount;
        } else if (typeof window[name] === "number") {
            window[name] -= amount;
        } else {
            throw new Error(`Cannot restore generation modifier "${name}".`);
        }
    }
}

function attachGenerationRerollButton(fieldId, record) {
    if (!generationRerollButtonsReady) {
        return;
    }

    const output = document.getElementById(fieldId);
    const heading = output?.previousElementSibling;
    if (heading?.tagName !== "H3" || heading.querySelector(".field-reroll")) {
        return;
    }

    const button = document.createElement("button");
    const label = t("Reroll this item");
    button.className = "field-reroll";
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = '<span aria-hidden="true">🎲</span>';
    button.addEventListener("click", () => record.run());
    heading.appendChild(button);
}

function registerGenerationReroll(fieldId, callback, options = {}) {
    const key = options.key || fieldId;
    let record = rerollRecords.get(key);

    if (!record) {
        record = {
            key,
            fieldId,
            outputIds: [],
            controlIds: [],
            modifierNames: new Set(),
            beforeReroll: null,
            afterCommit: null,
            initialized: false,
            run: null
        };
        rerollRecords.set(key, record);
    }

    record.callback = callback;
    record.beforeReroll = options.beforeReroll || record.beforeReroll;
    record.afterCommit = options.afterCommit || record.afterCommit;
    (options.outputIds || [fieldId]).forEach(id => {
        if (!record.outputIds.includes(id)) {
            record.outputIds.push(id);
        }
    });
    (options.controlIds || [fieldId]).forEach(id => {
        if (!record.controlIds.includes(id)) {
            record.controlIds.push(id);
        }
        attachGenerationRerollButton(id, record);
    });

    return record;
}

function executeGenerationReroll(record, callback) {
    if (activeRerollRecord) {
        return callback();
    }

    const wasInitialized = record.initialized;
    if (wasInitialized) {
        restoreGenerationState(record.stateBefore, record.stateAfter, record.modifierNames);
        reverseGenerationModifiers(record.modifiers);
        const oldRolls = new Set(record.rolls);
        const oldModifiers = new Set(record.modifiers);
        generationLog.rolls = generationLog.rolls.filter(entry => !oldRolls.has(entry));
        generationLog.modifiers = generationLog.modifiers.filter(entry => !oldModifiers.has(entry));
        record.outputIds.forEach(id => {
            const output = document.getElementById(id);
            if (output) {
                output.replaceChildren();
            }
        });
        if (record.beforeReroll) {
            record.beforeReroll();
        }
    }

    const stateBefore = snapshotGenerationState();
    const rollStart = generationLog.rolls.length;
    const modifierStart = generationLog.modifiers.length;
    activeRerollRecord = record;
    let result;

    try {
        result = callback();
    } finally {
        activeRerollRecord = null;
        record.stateBefore = stateBefore;
        record.stateAfter = snapshotGenerationState();
        record.rolls = generationLog.rolls.slice(rollStart);
        record.modifiers = generationLog.modifiers.slice(modifierStart);
        record.modifierNames = new Set(record.modifiers.map(entry => entry.name));
        record.initialized = true;
    }

    if (record.afterCommit) {
        record.afterCommit(result);
    }

    if (typeof window.emphasizeVillageRollLabels === "function") {
        window.emphasizeVillageRollLabels();
    }
    if (typeof window.annotateGenerationTerms === "function") {
        window.annotateGenerationTerms();
    }

    if (wasInitialized) {
        renderGenerationInfo();
    }

    return result;
}

function runGenerationField(fieldId, callback, options = {}) {
    const record = registerGenerationReroll(fieldId, callback, options);
    record.run = () => executeGenerationReroll(record, record.callback);
    return record.run();
}

function discardGenerationReroll(fieldId) {
    const record = rerollRecords.get(fieldId);
    if (record) {
        if (record.initialized) {
            restoreGenerationState(record.stateBefore, record.stateAfter, record.modifierNames);
            reverseGenerationModifiers(record.modifiers);
            const oldRolls = new Set(record.rolls);
            const oldModifiers = new Set(record.modifiers);
            generationLog.rolls = generationLog.rolls.filter(entry => !oldRolls.has(entry));
            generationLog.modifiers = generationLog.modifiers.filter(entry => !oldModifiers.has(entry));
        }
        rerollRecords.delete(fieldId);
    }
}

function refreshGenerationRerollButtons() {
    rerollRecords.forEach(record => {
        record.controlIds.forEach(id => attachGenerationRerollButton(id, record));
    });
}

function installGenerationRerolls(aliases = {}) {
    const records = new Map();
    const fields = document.querySelectorAll(".generation-content h3 + p[id]");

    fields.forEach(output => {
        const fieldId = output.id;
        const options = aliases[fieldId] || {};
        if (options.manual) {
            return;
        }

        const functionName = options.handler || `${fieldId}Value`;
        const key = options.key || functionName;
        let record = records.get(key);

        if (!record) {
            const original = window[functionName];
            if (typeof original !== "function") {
                return;
            }

            record = registerGenerationReroll(options.primaryField || fieldId, () => {}, {
                key,
                outputIds: [],
                controlIds: []
            });

            record.run = (...args) => executeGenerationReroll(record, () => {
                const actualArgs = options.getArgs ? options.getArgs() : args;
                const result = original.apply(window, actualArgs);
                if (options.afterRun) {
                    options.afterRun(result);
                }
                return result;
            });

            window[functionName] = function (...args) {
                if (activeRerollRecord) {
                    return original.apply(this, args);
                }
                return record.run(...args);
            };
            records.set(key, record);
        }

        record.beforeReroll = options.beforeReroll || record.beforeReroll;
        record.afterCommit = options.afterCommit || record.afterCommit;
        (options.outputIds || [fieldId]).forEach(id => {
            if (!record.outputIds.includes(id)) {
                record.outputIds.push(id);
            }
        });
        (options.controlIds || [fieldId]).forEach(id => {
            if (!record.controlIds.includes(id)) {
                record.controlIds.push(id);
            }
            attachGenerationRerollButton(id, record);
        });
    });
}

function formatSigned(number) {
    return number > 0 ? `+${number}` : String(number);
}

function modifierLabel(name) {
    return t(MODIFIER_LABELS[name] || name);
}

function fieldLabel(fieldId) {
    const heading = document.getElementById(fieldId)?.previousElementSibling;
    if (heading?.tagName !== "H3") {
        return t(fieldId);
    }

    const title = heading.cloneNode(true);
    title.querySelectorAll(".field-reroll").forEach(button => button.remove());
    return t(heading.dataset.i18nKey || title.textContent.trim());
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

function initializeGenerationInfo() {
    generationRerollButtonsReady = true;
    refreshGenerationRerollButtons();
    renderGenerationInfo();
}

if (generationRerollButtonsReady) {
    initializeGenerationInfo();
} else {
    document.addEventListener("DOMContentLoaded", initializeGenerationInfo, { once: true });
}

document.addEventListener("i18n:change", () => {
    refreshGenerationRerollButtons();
    renderGenerationInfo();
});
