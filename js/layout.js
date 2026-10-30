function loadScript(path) {
    const source = new URL(path, document.baseURI).href;

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = source;
        script.async = false;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Could not load script ${source}.`));
        document.head.appendChild(script);
    });
}

async function loadLayoutComponent(containerId, path) {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(`Layout container #${containerId} was not found.`);
    }

    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Could not load ${path}: ${response.status} ${response.statusText}`);
    }

    const template = document.createElement("template");
    template.innerHTML = await response.text();
    const scripts = Array.from(template.content.querySelectorAll("script[data-component-script]")).map(script => {
        const source = script.getAttribute("src");
        if (!source) {
            throw new Error(`A component script in ${path} is missing its src attribute.`);
        }
        script.remove();
        return source;
    });

    container.replaceChildren(template.content);

    for (const script of scripts) {
        await loadScript(script);
    }

    if (window.I18N) window.I18N.apply(container);
}

async function loadPageLayout() {
    await loadLayoutComponent("site-header", "components/header/header.html");
    await loadLayoutComponent("site-footer", "components/footer/footer.html");

    if (window.I18N) window.I18N.apply(document);

    const pageScripts = (document.body.dataset.pageScripts || "").split(/\s+/).filter(Boolean);
    for (const script of pageScripts) {
        await loadScript(script);
    }

    if (window.I18N) window.I18N.apply(document);

    if (typeof window.refreshGenerationRerollButtons === "function") {
        window.refreshGenerationRerollButtons();
    }
}

loadPageLayout().catch(error => {
    console.error("Failed to load shared page layout or page scripts.", error);
});
