(function () {
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 44;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const NAVY = [0.12, 0.24, 0.53];
    const INK = [0.14, 0.13, 0.11];
    const MUTED = [0.43, 0.40, 0.36];
    const LIGHT = [0.94, 0.91, 0.86];
    const GOLD = [0.67, 0.43, 0.18];
    const PAPER = [0.99, 0.98, 0.95];
    const EDGE = [0.80, 0.78, 0.73];
    const SECTION_FILL = [0.92, 0.94, 0.97];
    const CP1252 = new Map([
        [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
        [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
        [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
        [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
        [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
        [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
        [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]
    ]);

    function getPdfBytes(text) {
        return Array.from(text, character => {
            const code = character.codePointAt(0);
            const byte = CP1252.get(code) ?? (code <= 0xff && (code < 0x80 || code >= 0xa0) ? code : 0x3f);
            return byte.toString(16).padStart(2, "0");
        }).join("").toUpperCase();
    }

    function color(values) {
        return values.map(value => value.toFixed(3)).join(" ");
    }

    function wrapText(text, maxCharacters) {
        const words = String(text).replace(/\s+/g, " ").trim().split(" ");
        const lines = [];
        let line = "";

        words.forEach(word => {
            while (word.length > maxCharacters) {
                if (line) {
                    lines.push(line);
                    line = "";
                }
                lines.push(word.slice(0, maxCharacters));
                word = word.slice(maxCharacters);
            }

            if (!word) return;
            if (!line) {
                line = word;
            } else if (line.length + word.length + 1 <= maxCharacters) {
                line += ` ${word}`;
            } else {
                lines.push(line);
                line = word;
            }
        });

        if (line) lines.push(line);
        return lines.length ? lines : [""];
    }

    function collectEntries() {
        const content = document.querySelector(".generation-content");
        if (!content) throw new Error("The generated content could not be found.");

        const entries = [];
        for (const heading of content.querySelectorAll("h2, h3")) {
            if (heading.tagName === "H2") {
                entries.push({ type: "section", text: heading.innerText.trim() });
            } else {
                const result = heading.nextElementSibling;
                if (result?.tagName === "P") {
                    entries.push({
                        type: "field",
                        label: heading.innerText.trim(),
                        text: result.innerText.trim()
                    });
                }
            }
        }

        if (document.body.classList.contains("extras-page")) {
            const settlementType = document.getElementById("extras-settlement-type");
            if (settlementType) {
                entries.push({ type: "section", text: t("Extras") });
                entries.push({
                    type: "field",
                    label: t("Settlement type"),
                    text: settlementType.options[settlementType.selectedIndex]?.textContent.trim() || settlementType.value
                });
            }
        }

        if (typeof window.formatGenerationInfoText === "function") {
            const lines = window.formatGenerationInfoText();
            if (lines.length) {
                entries.push({ type: "section", text: lines[0] });
                lines.slice(2).forEach(line => {
                    if (!line.trim()) return;
                    if (line === t("Applied modifiers") || line === t("Dice rolls")) {
                        entries.push({ type: "subheading", text: line });
                    } else {
                        entries.push({ type: "text", text: line });
                    }
                });
            }
        }

        if (typeof window.formatExtrasText === "function") {
            const lines = window.formatExtrasText().filter(line => line.trim());
            if (lines.length) {
                entries.push({ type: "section", text: lines[0] });
                lines.slice(1).forEach(line => {
                    if (line.endsWith(":")) {
                        entries.push({ type: "subheading", text: line.slice(0, -1) });
                    } else {
                        entries.push({ type: "text", text: line });
                    }
                });
            }
        }

        return entries;
    }

    function createPdf(title, entries, dateText) {
        const pages = [];
        let commands;
        let y;
        let sectionNumber = 0;

        function addText(text, x, top, size, font, fill) {
            const baseline = PAGE_HEIGHT - top - size;
            commands.push(
                `BT /${font} ${size} Tf ${color(fill)} rg 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm <${getPdfBytes(text)}> Tj ET`
            );
        }

        function addBox(x, top, width, height, fill = PAPER, stroke = EDGE) {
            const bottom = PAGE_HEIGHT - top - height;
            commands.push(
                `q ${color(fill)} rg ${color(stroke)} RG 0.7 w ${x.toFixed(2)} ${bottom.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B Q`
            );
        }

        function addRule(top, stroke = LIGHT) {
            const position = PAGE_HEIGHT - top;
            commands.push(`q ${color(stroke)} RG 0.7 w ${MARGIN} ${position.toFixed(2)} m ${(PAGE_WIDTH - MARGIN).toFixed(2)} ${position.toFixed(2)} l S Q`);
        }

        function newPage() {
            commands = [];
            pages.push(commands);
            commands.push(`q ${color(NAVY)} rg 0 ${(PAGE_HEIGHT - 8).toFixed(2)} ${PAGE_WIDTH} 8 re f Q`);
            addText("SPECTACULAR SETTLEMENTS  /  FIELD RECORD", MARGIN, 22, 8, "F2", GOLD);
            addText(title, MARGIN, 41, 20, "F2", INK);
            addText(dateText, MARGIN, 70, 9, "F1", MUTED);
            addRule(91, EDGE);
            y = 104;
        }

        function ensureSpace(height) {
            if (y + height > PAGE_HEIGHT - 58) newPage();
        }

        function drawSection(text) {
            ensureSpace(34);
            addBox(MARGIN, y, CONTENT_WIDTH, 27, SECTION_FILL, SECTION_FILL);
            commands.push(`q ${color(GOLD)} rg ${MARGIN} ${(PAGE_HEIGHT - y - 27).toFixed(2)} 4 27 re f Q`);
            sectionNumber += 1;
            addText(String(sectionNumber).padStart(2, "0"), MARGIN + 12, y + 8, 8, "F2", GOLD);
            addText(text, MARGIN + 39, y + 6, 11, "F2", NAVY);
            y += 35;
        }

        function measureField(entry, width) {
            const labelLimit = Math.max(18, Math.floor((width - 20) / 4.2));
            const valueLimit = Math.max(18, Math.floor((width - 20) / 4.8));
            const labelLines = wrapText(entry.label, labelLimit);
            const valueLines = wrapText(entry.text || "—", valueLimit);
            return {
                labelLines,
                valueLines,
                height: Math.max(48, 17 + labelLines.length * 9 + valueLines.length * 11 + 9)
            };
        }

        function drawField(entry, x, width, height, layout) {
            addBox(x, y, width, height);
            commands.push(`q ${color(GOLD)} rg ${x.toFixed(2)} ${(PAGE_HEIGHT - y - height).toFixed(2)} 3 ${height.toFixed(2)} re f Q`);
            let textY = y + 7;
            layout.labelLines.forEach(line => {
                addText(line, x + 10, textY, 7.5, "F2", MUTED);
                textY += 9;
            });
            textY += 2;
            layout.valueLines.forEach(line => {
                addText(line, x + 10, textY, 9, "F1", INK);
                textY += 11;
            });
        }

        function drawFieldRow(fields) {
            const gap = fields.length === 2 ? 12 : 0;
            const width = (CONTENT_WIDTH - gap) / fields.length;
            const layouts = fields.map(field => measureField(field, width));
            const height = Math.max(...layouts.map(layout => layout.height));
            const maxHeight = PAGE_HEIGHT - 58 - 104 - 8;

            if (height > maxHeight) {
                fields.forEach(field => drawNote(`${field.label}: ${field.text}`));
                return;
            }

            ensureSpace(height + 8);
            fields.forEach((field, index) => {
                drawField(field, MARGIN + index * (width + gap), width, height, layouts[index]);
            });
            y += height + 8;
        }

        function drawNote(text, heading = "") {
            const lines = wrapText(text, 95);
            let lineIndex = 0;

            while (lineIndex < lines.length) {
                ensureSpace(44);
                const availableHeight = PAGE_HEIGHT - 58 - y - 16;
                const linesPerBox = Math.max(1, Math.floor((availableHeight - 22) / 11));
                const chunk = lines.slice(lineIndex, lineIndex + linesPerBox);
                const headingHeight = heading && lineIndex === 0 ? 13 : 0;
                const height = Math.max(34, 14 + headingHeight + chunk.length * 11);

                ensureSpace(height);
                addBox(MARGIN, y, CONTENT_WIDTH, height);
                let textY = y + 7;
                if (heading && lineIndex === 0) {
                    addText(heading, MARGIN + 10, textY, 7.5, "F2", GOLD);
                    textY += 13;
                }
                chunk.forEach(line => {
                    addText(line, MARGIN + 10, textY, 8.5, "F1", INK);
                    textY += 11;
                });
                y += height + 6;
                lineIndex += chunk.length;
            }
        }

        newPage();
        let index = 0;
        while (index < entries.length) {
            const entry = entries[index];
            if (entry.type === "section") {
                drawSection(entry.text);
                index += 1;
                continue;
            }

            if (entry.type === "field") {
                const fields = [entry];
                if (entries[index + 1]?.type === "field") fields.push(entries[index + 1]);
                drawFieldRow(fields);
                index += fields.length;
                continue;
            }

            if (entry.type === "subheading") {
                ensureSpace(22);
                addText(entry.text, MARGIN, y + 2, 8, "F2", NAVY);
                addRule(y + 15, EDGE);
                y += 22;
                index += 1;
                continue;
            }

            drawNote(entry.text);
            index += 1;
        }

        pages.forEach((page, index) => {
            commands = page;
            const footerY = PAGE_HEIGHT - 40;
            const position = PAGE_HEIGHT - footerY;
            page.push(`q ${color(EDGE)} RG 0.7 w ${MARGIN} ${position.toFixed(2)} m ${(PAGE_WIDTH - MARGIN).toFixed(2)} ${position.toFixed(2)} l S Q`);
            addText(`Spectacular Settlements Generator  |  ${index + 1} / ${pages.length}`, MARGIN, PAGE_HEIGHT - 31, 8, "F1", MUTED);
        });

        const objects = [
            "<< /Type /Catalog /Pages 2 0 R >>",
            `<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
        ];

        pages.forEach((page, index) => {
            const pageObject = 5 + index * 2;
            const streamObject = pageObject + 1;
            const stream = page.join("\n");
            objects.push(
                `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamObject} 0 R >>`
            );
            objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
        });

        let pdf = "%PDF-1.4\n";
        const offsets = [0];
        objects.forEach((object, index) => {
            offsets.push(pdf.length);
            pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
        });

        const xrefOffset = pdf.length;
        pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach(offset => {
            pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
        return pdf;
    }

    window.exportGenerationPdf = function () {
        const pageType = window.getGenerationPageType();
        const title = t("{0} Generation").replace("{0}", t(pageType));
        const date = new Date();
        const dateText = date.toLocaleDateString(document.documentElement.lang || undefined);
        const entries = collectEntries();
        if (!entries.length) {
            entries.push({ type: "text", text: t("No generated results are available yet.") });
        }

        const pdf = createPdf(title, entries, dateText);
        const timestamp = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
            "-",
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0"),
            String(date.getSeconds()).padStart(2, "0")
        ].join("");
        const downloadUrl = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
        const downloadLink = document.createElement("a");

        downloadLink.href = downloadUrl;
        downloadLink.download = `${pageType.toLowerCase().replace(" ", "-")}-generation-${timestamp}.pdf`;
        downloadLink.hidden = true;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    };
})();
