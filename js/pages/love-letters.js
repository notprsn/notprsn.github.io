const onReady = window.Site?.onReady ?? ((callback) => callback());
const fetchVersionedResource =
    window.Site?.fetchVersionedResource ??
    ((resourcePath, options = {}) => fetch(resourcePath, options));

onReady(initLoveLetters);

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
            bundlePromise = fetchVersionedResource("/data/love-letters.enc.json").then(async (response) => {
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
        if (!passwordInput || !lettersList || !archiveTitle || !archiveIntro || !output || !submitButton) {
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
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
