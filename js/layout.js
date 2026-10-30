async function loadLayoutComponent(containerId, path) {
    const container = document.getElementById(containerId);

    if (!container) {
        throw new Error(`Layout container #${containerId} was not found.`);
    }

    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Could not load ${path}: ${response.status} ${response.statusText}`);
    }

    container.innerHTML = await response.text();
    if (window.I18N) window.I18N.apply(container);
}

for (const [containerId, path] of [
    ["site-header", "components/header/header.html"],
    ["site-footer", "components/footer/footer.html"]
]) {
    loadLayoutComponent(containerId, path).catch((error) => {
        console.error("Failed to load shared page layout.", error);
    });
}
