document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    initMatrixRain();
    initLoveLetters();
});

function setCurrentYear() {
    const targets = document.querySelectorAll("[data-current-year]");
    const year = new Date().getFullYear().toString();
    targets.forEach((target) => {
        target.textContent = year;
    });
}

function initMatrixRain() {
    const canvas = document.querySelector("[data-matrix-canvas]");
    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]=+";
    let width = 0;
    let height = 0;
    let fontSize = 18;
    let columns = 0;
    let drops = [];
    let lastFrame = 0;
    const targetInterval = 1000 / 18;

    function resize() {
        const dpr = Math.max(window.devicePixelRatio || 1, 1);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        fontSize = width < 640 ? 14 : 18;
        columns = Math.ceil(width / fontSize);
        drops = Array.from({ length: columns }, () => Math.random() * -80);
        context.font = `${fontSize}px IBM Plex Mono, monospace`;
        context.textBaseline = "top";
        context.fillStyle = "#05070a";
        context.fillRect(0, 0, width, height);
    }

    function drawFrame() {
        context.fillStyle = "rgba(5, 7, 10, 0.14)";
        context.fillRect(0, 0, width, height);

        for (let column = 0; column < columns; column += 1) {
            const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
            const x = column * fontSize;
            const y = drops[column] * fontSize;
            const isBright = Math.random() > 0.962;
            context.fillStyle = isBright ? "rgba(233, 255, 238, 0.92)" : "rgba(120, 255, 146, 0.72)";
            context.fillText(glyph, x, y);

            const beyondBottom = y > height + fontSize * 4;
            if (beyondBottom && Math.random() > 0.975) {
                drops[column] = Math.random() * -40;
            } else {
                drops[column] += 1 + Math.random() * 0.35;
            }
        }
    }

    function tick(timestamp) {
        if (timestamp - lastFrame >= targetInterval) {
            drawFrame();
            lastFrame = timestamp;
        }
        window.requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
        for (let index = 0; index < 10; index += 1) {
            drawFrame();
        }
        return;
    }

    window.requestAnimationFrame(tick);
}

function initLoveLetters() {
    const form = document.querySelector("[data-love-letters-form]");
    if (!form) {
        return;
    }

    const passwordInput = form.querySelector('input[name="password"]');
    const status = document.querySelector("[data-love-letters-status]");
    const output = document.querySelector("[data-love-letters-output]");
    const archiveTitle = document.querySelector("[data-archive-title]");
    const archiveIntro = document.querySelector("[data-archive-intro]");
    const lettersList = document.querySelector("[data-letters-list]");
    const submitButton = form.querySelector('button[type="submit"]');
    let bundlePromise;

    const setStatus = (message, state = "info") => {
        if (!status) {
            return;
        }
        status.textContent = message;
        status.dataset.state = state;
    };

    const getBundle = async () => {
        if (!bundlePromise) {
            bundlePromise = fetch("/data/love-letters.enc.json", { cache: "no-store" }).then(async (response) => {
                if (!response.ok) {
                    throw new Error("Could not load ciphertext bundle.");
                }
                return response.json();
            });
        }
        return bundlePromise;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!passwordInput || !lettersList || !archiveTitle || !archiveIntro || !output) {
            return;
        }

        const passphrase = passwordInput.value.trim();
        if (!passphrase) {
            setStatus("Enter the passphrase first.", "error");
            return;
        }

        submitButton.disabled = true;
        setStatus("Deriving key and decrypting...", "pending");

        try {
            const bundle = await getBundle();
            if (!bundle.configured) {
                setStatus(bundle.message || "The archive has not been initialized yet.", "info");
                output.hidden = true;
                return;
            }

            const plaintext = await decryptArchive(bundle, passphrase);
            const archive = JSON.parse(plaintext);
            renderArchive(archive, { archiveTitle, archiveIntro, lettersList });
            output.hidden = false;
            form.reset();
            setStatus("Archive unlocked.", "success");
        } catch (error) {
            console.error(error);
            output.hidden = true;
            setStatus("Incorrect passphrase or unreadable archive.", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
}

async function decryptArchive(bundle, passphrase) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Web Crypto is not available.");
    }

    const subtle = window.crypto.subtle;
    const encoder = new TextEncoder();
    const passwordKey = await subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: decodeBase64(bundle.kdf.salt),
            iterations: bundle.kdf.iterations,
            hash: bundle.kdf.hash,
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
    );

    const decrypted = await subtle.decrypt(
        {
            name: "AES-GCM",
            iv: decodeBase64(bundle.cipher.iv),
            tagLength: bundle.cipher.tagLength,
        },
        key,
        decodeBase64(bundle.ciphertext)
    );

    return new TextDecoder().decode(decrypted);
}

function renderArchive(archive, targets) {
    const { archiveTitle, archiveIntro, lettersList } = targets;
    const title = typeof archive.archiveTitle === "string" ? archive.archiveTitle : "Love Letters";
    const intro = typeof archive.intro === "string"
        ? archive.intro
        : "Unlocked locally in your browser.";
    const letters = Array.isArray(archive.letters) ? archive.letters : [];

    archiveTitle.textContent = title;
    archiveIntro.textContent = intro;
    lettersList.replaceChildren();

    letters.forEach((letter) => {
        const shell = document.createElement("article");
        shell.className = "letter-shell";

        const heading = document.createElement("h2");
        heading.textContent = typeof letter.title === "string" ? letter.title : "Untitled";
        shell.appendChild(heading);

        const metaBits = [];
        if (typeof letter.date === "string" && letter.date) {
            metaBits.push(letter.date);
        }
        if (typeof letter.location === "string" && letter.location) {
            metaBits.push(letter.location);
        }
        if (metaBits.length) {
            const meta = document.createElement("p");
            meta.className = "letter-meta";
            meta.textContent = metaBits.join(" / ");
            shell.appendChild(meta);
        }

        const body = document.createElement("div");
        body.className = "letter-body";
        const paragraphs = normalizeParagraphs(letter.body);
        paragraphs.forEach((paragraphText) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = paragraphText;
            body.appendChild(paragraph);
        });
        shell.appendChild(body);

        if (typeof letter.signoff === "string" && letter.signoff) {
            const signoff = document.createElement("p");
            signoff.className = "letter-meta";
            signoff.textContent = letter.signoff;
            shell.appendChild(signoff);
        }

        lettersList.appendChild(shell);
    });
}

function normalizeParagraphs(value) {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(/\n\s*\n/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function decodeBase64(value) {
    const binary = window.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}
