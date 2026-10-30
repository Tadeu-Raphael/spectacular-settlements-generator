function emphasizeVillageRollLabels() {
    const resultParagraphs = document.querySelectorAll(".villages-page .generation-content p");
    const resultSeparators = /(<br\s*\/?>|\s-\s)/i;

    for (const paragraph of resultParagraphs) {
        const parts = paragraph.innerHTML.split(resultSeparators);
        let isResultStart = true;

        for (let index = 0; index < parts.length; index += 1) {
            const part = parts[index];

            if (resultSeparators.test(part)) {
                isResultStart = true;
                continue;
            }

            if (!isResultStart) {
                continue;
            }

            if (/^\s*\d+\.\s*<(?:b|strong)\b/i.test(part)) {
                isResultStart = false;
                continue;
            }

            const numberedLabel = part.replace(
                /^(\s*)(\d+\.\s*)([^.<]+?)(\.)(?=\s|$|<)/i,
                "$1<strong>$2$3$4</strong>"
            );
            if (numberedLabel !== part) {
                parts[index] = numberedLabel;
            } else if (/^\s*\d+\.\s*/.test(part)) {
                parts[index] = part.replace(
                    /^(\s*)(\d+\.\s*)([^<]+)$/i,
                    "$1<strong>$2$3</strong>"
                );
            } else {
                parts[index] = part.replace(
                    /^(\s*)(?!<(?:b|strong)\b)([^.<]+?)(\.)(?=\s|$|<)/i,
                    "$1<strong>$2$3</strong>"
                );
                if (parts[index] === part) {
                    parts[index] = part.replace(
                        /^(\s*)(?!<(?:b|strong)\b)([^<]+)$/i,
                        "$1<strong>$2</strong>"
                    );
                }
            }
            isResultStart = false;
        }

        paragraph.innerHTML = parts.join("");
    }
}

emphasizeVillageRollLabels();
