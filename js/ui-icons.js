(function () {
    const scriptUrl = document.currentScript.src;
    const iconRoot = new URL("../assets/icons/lucide/", scriptUrl);
    const iconNames = new Map([
        ["🏰", "castle"],
        ["🌲", "tree-pine"],
        ["🕳", "door-open"],
        ["🎲", "dice-5"],
        ["⬇", "download"],
        ["👑", "crown"],
        ["🏙", "building-2"],
        ["🛒", "shopping-cart"],
        ["🛡", "shield"],
        ["🏯", "castle"],
        ["✦", "sparkles"],
        ["⚔", "swords"],
        ["🎯", "target"],
        ["🗣", "message-circle"],
        ["🍺", "beer"],
        ["🌾", "wheat"],
        ["👃", "scan-face"],
        ["🎣", "fish"],
        ["🧑", "user-round"],
        ["←", "arrow-left"],
        ["→", "arrow-right"],
        ["×", "x"]
    ]);
    const iconTokens = [...iconNames.keys()].flatMap(icon => [icon, `${icon}\uFE0F`]);
    const tokenPattern = new RegExp(
        iconTokens
            .sort((left, right) => right.length - left.length)
            .map(icon => icon.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("|"),
        "gu"
    );
    const ignoredText = "script, style, textarea, input, code, pre, svg";

    function replaceIconsInText(textNode) {
        const parent = textNode.parentElement;
        if (!parent || parent.closest(ignoredText)) return;

        const text = textNode.nodeValue;
        const matches = [...text.matchAll(tokenPattern)];
        if (!matches.length) return;

        const fragment = document.createDocumentFragment();
        let offset = 0;

        matches.forEach(match => {
            const [token] = match;
            const index = match.index;
            if (index > offset) {
                fragment.appendChild(document.createTextNode(text.slice(offset, index)));
            }

            const icon = document.createElement("img");
            icon.className = "ui-icon";
            icon.src = new URL(`${iconNames.get(token.replace(/\uFE0F/g, ""))}.svg`, iconRoot).href;
            icon.alt = "";
            icon.setAttribute("aria-hidden", "true");
            icon.draggable = false;
            fragment.appendChild(icon);
            offset = index + token.length;
        });

        if (offset < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(offset)));
        }
        textNode.replaceWith(fragment);
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            replaceIconsInText(node);
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches(ignoredText)) return;

        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let textNode;
        while ((textNode = walker.nextNode())) {
            textNodes.push(textNode);
        }
        textNodes.forEach(replaceIconsInText);
    }

    function initialize() {
        processNode(document.body);

        const observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === "characterData") {
                    replaceIconsInText(record.target);
                    return;
                }
                record.addedNodes.forEach(processNode);
            });
        });
        observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
}());
