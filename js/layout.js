const layoutScriptUrl = document.currentScript.src;
const appRoot = new URL("../", layoutScriptUrl);
const gcityRepositoryId = "Tadeu-Raphael/g-city";
const githubPagesHome = "https://tadeu-raphael.github.io/g-city/";

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

function isGcityGithubPages() {
    return location.protocol === "https:"
        && location.hostname.toLowerCase() === "tadeu-raphael.github.io"
        && /^\/g-city(?:\/|$)/i.test(location.pathname);
}

function isLocalDevelopment() {
    const hostname = location.hostname.toLowerCase();
    return location.protocol === "file:"
        || (["http:", "https:"].includes(location.protocol)
            && (["localhost", "127.0.0.1", "::1"].includes(hostname) || hostname.endsWith(".localhost")));
}

function verifyLocalGcityRepository() {
    return new Promise(resolve => {
        const marker = document.createElement("script");
        marker.src = new URL("../../../js/gcity-repository-marker.js", layoutScriptUrl).href;
        marker.onload = () => {
            const isGcityRepository = document.documentElement.dataset.gcityRepository === gcityRepositoryId;
            delete document.documentElement.dataset.gcityRepository;
            marker.remove();
            resolve(isGcityRepository);
        };
        marker.onerror = () => {
            marker.remove();
            resolve(false);
        };
        document.head.appendChild(marker);
    });
}

async function configureGcityHomeLink() {
    let homeUrl = null;
    const isGcityModule = /\/generators\/spectacular-settlements\/$/i.test(appRoot.pathname);

    if (isGcityGithubPages()) {
        homeUrl = githubPagesHome;
    } else if (isLocalDevelopment() && isGcityModule && await verifyLocalGcityRepository()) {
        homeUrl = new URL("../../index.html", appRoot).href;
    }

    document.querySelectorAll("[data-gcity-home]").forEach(link => {
        if (homeUrl) {
            link.href = homeUrl;
            link.hidden = false;
        }
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

async function loadPageLayout() {
    await loadLayoutComponent("site-header", "components/header/header.js", "SPECTACULAR_HEADER_COMPONENT");
    await loadLayoutComponent("site-footer", "components/footer/footer.js", "SPECTACULAR_FOOTER_COMPONENT");
    await configureGcityHomeLink();

    if (window.I18N) window.I18N.apply(document);

    const pageScripts = (document.body.dataset.pageScripts || "").split(/\s+/).filter(Boolean);
    for (const script of pageScripts) {
        await loadScript(script);
    }

    if (window.I18N) window.I18N.apply(document);

    if (typeof window.refreshGenerationRerollButtons === "function") {
        window.refreshGenerationRerollButtons();
    }
    if (typeof window.renderGenerationInfo === "function") {
        window.renderGenerationInfo();
    }
    preserveFileLanguageOnLinks();
}

loadPageLayout().catch(error => {
    console.error("Failed to load shared page layout or page scripts.", error);
});
