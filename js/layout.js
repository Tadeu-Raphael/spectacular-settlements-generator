const layoutScriptUrl = document.currentScript.src;
const appRoot = new URL("../", layoutScriptUrl);

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

function configureGcityHomeLink() {
    const isGcityModule = /\/generators\/spectacular-settlements\/$/i.test(appRoot.pathname);
    if (!isGcityModule) return;
    const homeUrl = new URL("../../index.html", appRoot).href;

    document.querySelectorAll("[data-gcity-home]").forEach(link => {
        link.href = homeUrl;
        link.hidden = false;
    });
}

async function loadTheme() {
    document.documentElement.dataset.paper = "cream";

    await new Promise((resolve, reject) => {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = new URL("../css/paper-ui.css", layoutScriptUrl).href;
        stylesheet.onload = resolve;
        stylesheet.onerror = () => reject(new Error(`Could not load stylesheet ${stylesheet.href}.`));
        document.head.appendChild(stylesheet);
    });
}

function preserveFileLanguageOnLinks() {
    if (location.protocol !== "file:" || !window.I18N) return;

    document.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || link.hasAttribute("target")) return;

        const destination = new URL(href, document.baseURI);
        if (destination.protocol !== "file:" || !destination.pathname.startsWith(appRoot.pathname)) return;
        destination.searchParams.set("lang", window.I18N.get());
        link.href = destination.href;
    });
}

async function loadLayoutComponent(containerId, componentPath, componentName) {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(`Layout container #${containerId} was not found.`);
    }

    await loadScript(componentPath);
    const component = window[componentName];
    if (!component || typeof component.render !== "function") {
        throw new Error(`Layout component ${componentName} could not be initialized.`);
    }
    const scripts = component.render(container);

    for (const script of scripts) {
        await loadScript(script);
    }

    if (window.I18N) window.I18N.apply(container);
}

function groupGenerationFields() {
    if (document.documentElement.dataset.paper !== "cream") return;

    document.querySelectorAll(".generation-content .col").forEach(column => {
        let element = column.firstElementChild;

        while (element) {
            const result = element.matches("h3") ? element.nextElementSibling : null;
            if (result && result.matches("p")) {
                const field = document.createElement("div");
                field.className = "generated-field";
                element.before(field);
                field.append(element, result);
                element = field.nextElementSibling;
                continue;
            }

            element = element.nextElementSibling;
        }

        if (column.querySelector(".generated-field")) {
            column.classList.add("generation-fields");
        }
    });
}

async function loadPageLayout() {
    await loadTheme();
    await loadLayoutComponent("site-header", "components/header/header.js", "SPECTACULAR_HEADER_COMPONENT");
    await loadLayoutComponent("site-footer", "components/footer/footer.js", "SPECTACULAR_FOOTER_COMPONENT");
    configureGcityHomeLink();

    if (window.I18N) window.I18N.apply(document);

    const pageScripts = (document.body.dataset.pageScripts || "").split(/\s+/).filter(Boolean);
    for (const script of pageScripts) {
        await loadScript(script);
    }

    if (window.I18N) window.I18N.apply(document);
    groupGenerationFields();

    if (typeof window.refreshGenerationRerollButtons === "function") {
        window.refreshGenerationRerollButtons();
    }
    if (typeof window.renderGenerationInfo === "function") {
        window.renderGenerationInfo();
    }
    await loadScript(new URL("ui-icons.js", layoutScriptUrl).href);
    preserveFileLanguageOnLinks();
}

loadPageLayout().catch(error => {
    console.error("Failed to load shared page layout or page scripts.", error);
});
