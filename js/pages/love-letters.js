const onReady = window.Site?.onReady ?? ((callback) => callback());
const fetchVersionedResource =
    window.Site?.fetchVersionedResource ??
    ((resourcePath, options = {}) => fetch(resourcePath, options));
const MEOW_PATHS = [
    "/love-letters/audio/meow-1.mp3",
    "/love-letters/audio/meow-2.mp3",
    "/love-letters/audio/meow-3.mp3",
    "/love-letters/audio/meow-4.mp3",
    "/love-letters/audio/meow-5.mp3",
    "/love-letters/audio/meow-6.mp3",
    "/love-letters/audio/meow-7.mp3",
    "/love-letters/audio/meow-8.mp3",
    "/love-letters/audio/meow-9.mp3",
    "/love-letters/audio/meow-10.mp3",
];
const ARM_WIDTH_RATIO = 260 / 660;
const PRINT_TO_ARM_RATIO = 0.52;
const ARM_ASSETS = [
    {
        src: "/love-letters/paws/arm-blue-1.png",
        pawAnchorRatio: 0.1042,
    },
    {
        src: "/love-letters/paws/arm-blue-2.png",
        pawAnchorRatio: 0.0997,
    },
    {
        src: "/love-letters/paws/arm-brown-1.png",
        pawAnchorRatio: 0.1052,
    },
    {
        src: "/love-letters/paws/arm-brown-2.png",
        pawAnchorRatio: 0.0985,
    },
    {
        src: "/love-letters/paws/arm-calico-1.png",
        pawAnchorRatio: 0.1057,
    },
    {
        src: "/love-letters/paws/arm-calico-2.png",
        pawAnchorRatio: 0.0981,
    },
    {
        src: "/love-letters/paws/arm-gray-1.png",
        pawAnchorRatio: 0.1026,
    },
    {
        src: "/love-letters/paws/arm-gray-2.png",
        pawAnchorRatio: 0.1011,
    },
    {
        src: "/love-letters/paws/arm-orange-1.png",
        pawAnchorRatio: 0.1048,
    },
    {
        src: "/love-letters/paws/arm-orange-2.png",
        pawAnchorRatio: 0.0994,
    },
    {
        src: "/love-letters/paws/arm-white-1.png",
        pawAnchorRatio: 0.105,
    },
    {
        src: "/love-letters/paws/arm-white-2.png",
        pawAnchorRatio: 0.1008,
    },
];
const PRINT_PATHS = [
    "/love-letters/paws/print-1.png",
    "/love-letters/paws/print-2.png",
    "/love-letters/paws/print-3.png",
    "/love-letters/paws/print-4.png",
    "/love-letters/paws/print-5.png",
    "/love-letters/paws/print-6.png",
];
const START_ARM_ASSET = ARM_ASSETS.find((asset) => asset.src.endsWith("arm-orange-2.png")) ?? ARM_ASSETS[0];
const START_PRINT_PATH = "/love-letters/paws/print-2.png";
const STATUS_COPY = {
    empty: "Enter the answer first.",
    locked: "Locked and Encrypted",
    pending: "Checking...",
};
const CAT_LIMITS = {
    firstPrintMax: 92,
    firstPrintMin: 52,
    firstPrintScale: 1.08,
    maxPrints: 120,
    maxReaches: 12,
    meowCooldownMs: 260,
};

onReady(initLoveLetters);
onReady(initCatPaws);

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
    const modal = document.querySelector("[data-love-modal]");
    const modalMessage = document.querySelector("[data-love-modal-message]");
    const modalClose = document.querySelector("[data-love-modal-close]");
    const submitButton = form.querySelector("[data-love-submit]");
    let bundlePromise;

    const setStatus = (message, state = "info") => {
        if (!status) {
            return;
        }

        status.textContent = message;
        status.dataset.state = state;
        status.hidden = !message;
    };

    const updateSubmitVisibility = () => {
        if (!passwordInput || !submitButton) {
            return;
        }

        submitButton.hidden = !passwordInput.value.trim();
    };

    const showModal = (message) => {
        if (!modal || !modalMessage) {
            return;
        }

        modalMessage.textContent = message;
        if (typeof modal.showModal === "function") {
            modal.showModal();
            return;
        }

        modal.setAttribute("open", "");
    };

    const closeModal = () => {
        if (!modal) {
            return;
        }

        if (typeof modal.close === "function") {
            modal.close();
            return;
        }

        modal.removeAttribute("open");
    };

    modalClose?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    passwordInput?.addEventListener("input", updateSubmitVisibility);
    updateSubmitVisibility();

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
            setStatus(STATUS_COPY.empty, "error");
            return;
        }

        submitButton.disabled = true;
        setStatus(STATUS_COPY.pending, "pending");

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
            updateSubmitVisibility();
            setStatus("", "success");
            showModal("oh, you made it. i thought someone was indifferent");
        } catch (error) {
            console.error(error);
            output.hidden = true;
            setStatus(STATUS_COPY.locked, "error");
            showModal("nice try, kiddo. i guess you'ren't her");
        } finally {
            submitButton.disabled = false;
            updateSubmitVisibility();
        }
    });
}

function initCatPaws() {
    const layer = document.querySelector("[data-cat-paw-layer]");
    if (!layer) {
        return;
    }

    const startButton = document.querySelector("[data-cat-paw-start]");
    const heroRow = startButton?.closest(".love-hero-row");
    const interactiveSelector = [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "label",
        "dialog",
        "[role='button']",
    ].join(",");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const meowCache = MEOW_PATHS.map((source) => {
        const audio = new Audio(source);
        audio.preload = "auto";
        return audio;
    });
    ARM_ASSETS.forEach((asset) => {
        const arm = new Image();
        arm.src = asset.src;
    });
    PRINT_PATHS.forEach((path) => {
        const print = new Image();
        print.src = path;
    });
    let lastMeowAt = 0;
    let lastMeowIndex = -1;
    let pawModeEnabled = !startButton;
    let printPositionFrame = 0;

    const schedulePrintPositionUpdate = () => {
        if (printPositionFrame) {
            return;
        }

        printPositionFrame = window.requestAnimationFrame(() => {
            printPositionFrame = 0;
            updateCatPrintPositions(layer);
        });
    };

    startButton?.addEventListener("click", () => {
        if (pawModeEnabled) {
            return;
        }

        const rect = startButton.getBoundingClientRect();
        const viewportX = rect.left + rect.width / 2;
        const viewportY = rect.top + rect.height / 2;
        pawModeEnabled = true;
        startButton.disabled = true;
        startButton.setAttribute("aria-hidden", "true");
        heroRow?.classList.add("is-paw-started");
        reachForPoint(layer, viewportX, viewportY, reduceMotion.matches, {
            armAsset: START_ARM_ASSET,
            printPath: START_PRINT_PATH,
            printSize: Math.min(
                CAT_LIMITS.firstPrintMax,
                Math.max(CAT_LIMITS.firstPrintMin, rect.width * CAT_LIMITS.firstPrintScale)
            ),
        });
        playMeow();
        lastMeowAt = window.performance.now();
    });

    document.addEventListener("pointerdown", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!pawModeEnabled || event.button !== 0 || !target || target.closest(interactiveSelector)) {
            return;
        }

        reachForPoint(layer, event.clientX, event.clientY, reduceMotion.matches);
        const now = window.performance.now();
        if (now - lastMeowAt > CAT_LIMITS.meowCooldownMs) {
            playMeow();
            lastMeowAt = now;
        }
    });
    window.addEventListener("scroll", schedulePrintPositionUpdate, { passive: true });
    window.addEventListener("resize", schedulePrintPositionUpdate);

    function playMeow() {
        if (!meowCache.length) {
            return;
        }

        let index = Math.floor(Math.random() * meowCache.length);
        if (meowCache.length > 1 && index === lastMeowIndex) {
            index = (index + 1) % meowCache.length;
        }

        lastMeowIndex = index;
        const meow = meowCache[index].cloneNode(true);
        meow.volume = 0.5;
        meow.play().catch(() => {});
    }
}

function reachForPoint(layer, viewportX, viewportY, reduceMotion, options = {}) {
    const armAsset = options.armAsset ?? randomItem(ARM_ASSETS);
    const printPath = options.printPath ?? randomItem(PRINT_PATHS);
    const origin = pickReachOrigin();
    const dx = viewportX - origin.x;
    const dy = viewportY - origin.y;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (reduceMotion) {
        dropCatPrint(layer, viewportX, viewportY, angle, printPath, options.printSize ?? fallbackPrintSize());
        return;
    }

    const tapOffset = Math.min(
        130,
        Math.max(28, distance * armAsset.pawAnchorRatio / (1 - armAsset.pawAnchorRatio))
    );
    const reachLength = distance + tapOffset;
    const reachWidth = Math.min(260, Math.max(92, reachLength * ARM_WIDTH_RATIO));
    const printSize = options.printSize ?? Math.min(136, Math.max(48, reachWidth * PRINT_TO_ARM_RATIO));
    const reach = document.createElement("span");
    const arm = document.createElement("span");
    const image = document.createElement("img");
    const tap = document.createElement("span");

    reach.className = "cat-reach";
    reach.style.setProperty("--reach-x", `${origin.x}px`);
    reach.style.setProperty("--reach-y", `${origin.y}px`);
    reach.style.setProperty("--reach-length", `${reachLength}px`);
    reach.style.setProperty("--reach-width", `${reachWidth}px`);
    reach.style.setProperty("--reach-distance", `${distance}px`);
    reach.style.setProperty("--reach-angle", `${angle + 90}deg`);

    arm.className = "cat-reach__arm";
    image.className = "cat-reach__image";
    image.src = armAsset.src;
    image.alt = "";
    image.draggable = false;
    tap.className = "cat-reach__tap";

    arm.appendChild(image);
    reach.append(arm, tap);
    layer.appendChild(reach);
    const reaches = layer.querySelectorAll(".cat-reach");
    if (reaches.length > CAT_LIMITS.maxReaches) {
        reaches[0].remove();
    }

    window.setTimeout(() => {
        if (reach.isConnected) {
            dropCatPrint(layer, viewportX, viewportY, angle, printPath, printSize);
        }
    }, 640);

    reach.addEventListener("animationend", (event) => {
        if (event.animationName === "cat-arm-reach") {
            reach.remove();
        }
    });
}

function pickReachOrigin() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const edgePadding = 54;
    const edges = [
        { x: -edgePadding, y: Math.random() * height },
        { x: width + edgePadding, y: Math.random() * height },
        { x: Math.random() * width, y: -edgePadding },
        { x: Math.random() * width, y: height + edgePadding },
    ];

    return randomItem(edges);
}

function fallbackPrintSize() {
    return Math.min(136, Math.max(58, Math.min(window.innerWidth, window.innerHeight) * 0.16));
}

function dropCatPrint(layer, viewportX, viewportY, angle, printPath, printSize) {
    const print = document.createElement("img");
    print.className = "cat-print";
    print.src = printPath;
    print.alt = "";
    print.draggable = false;
    print.dataset.printDocumentX = `${viewportX + window.scrollX}`;
    print.dataset.printDocumentY = `${viewportY + window.scrollY}`;
    print.style.setProperty("--print-angle", `${angle + 90 + (-7 + Math.random() * 14)}deg`);
    print.style.setProperty("--print-size", `${printSize}px`);
    positionCatPrint(print);
    layer.appendChild(print);

    const prints = layer.querySelectorAll(".cat-print");
    if (prints.length > CAT_LIMITS.maxPrints) {
        prints[0].remove();
    }
}

function updateCatPrintPositions(layer) {
    layer.querySelectorAll(".cat-print").forEach(positionCatPrint);
}

function positionCatPrint(print) {
    const documentX = Number(print.dataset.printDocumentX);
    const documentY = Number(print.dataset.printDocumentY);
    if (!Number.isFinite(documentX) || !Number.isFinite(documentY)) {
        return;
    }

    print.style.setProperty("--print-x", `${documentX - window.scrollX}px`);
    print.style.setProperty("--print-y", `${documentY - window.scrollY}px`);
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
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
    const intro = typeof archive.intro === "string" ? archive.intro : "";
    const letters = Array.isArray(archive.letters) ? archive.letters : [];

    archiveTitle.textContent = title;
    archiveIntro.textContent = intro;
    archiveIntro.hidden = !intro.trim();
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
