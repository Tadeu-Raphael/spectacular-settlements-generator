function exportGeneration() {
    const content = document.querySelector(".generation-content");
    const figures = content.querySelectorAll(".fortress-figure");
    figures.forEach(item => { item.style.display = "none"; });
    const lines = [];
    const pageType = document.body.classList.contains("extras-page")
        ? "Extras"
        : document.body.classList.contains("villages-page")
        ? "Village"
        : document.body.classList.contains("towns-page")
            ? "Town"
            : document.body.classList.contains("cities-page")
                ? "City"
                : document.body.classList.contains("capitals-page")
                    ? "Capital"
                    : document.body.classList.contains("fortresses-page")
                        ? { keep: "Keep", castle: "Castle", stronghold: "Stronghold" }[document.body.dataset.fortress]
                        : "Trading Post";

    for (const heading of content.querySelectorAll("h2")) {
        lines.push(heading.innerText.trim());

        let element = heading.nextElementSibling;
        while (element && element.tagName !== "H2") {
            if (element.tagName === "H3") {
                const result = element.nextElementSibling;
                if (result?.tagName === "P") {
                    lines.push("", `${element.innerText.trim()}:`, result.innerText.trim());
                }
            }
            element = element.nextElementSibling;
        }

        lines.push("");
    }

    figures.forEach(item => { item.style.display = ""; });

    if (typeof formatGenerationInfoText === "function") {
        lines.push(...formatGenerationInfoText());
    }

    if (typeof formatExtrasText === "function") {
        lines.push(...formatExtrasText());
    }

    const title = t("{0} Generation").replace("{0}", t(pageType));
    const file = new Blob(["\uFEFF", `${title}\r\n\r\n`, lines.join("\r\n")], {
        type: "text/plain;charset=utf-8"
    });
    const date = new Date();
    const timestamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
        "-",
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0")
    ].join("");
    const downloadUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = `${pageType.toLowerCase().replace(" ", "-")}-generation-${timestamp}.txt`;
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
