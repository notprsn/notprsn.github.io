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
            window.requestAnimationFrame(() => {
                output.scrollIntoView({ behavior: "smooth", block: "start" });
                output.querySelector("[data-letter-reader]")?.focus({ preventScroll: true });
            });
            form.reset();
            updateSubmitVisibility();
            setStatus("", "success");
            showModal("oh, you made it. i thought someone was indifferent");
            trackSuccessfulUnlock();
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

function trackSuccessfulUnlock() {
    void loadAnalyticsModule()
        .then((analytics) => analytics.trackLoveLettersUnlock())
        .catch((error) => {
            console.debug("[site analytics] Love-letter unlock analytics did not start.", error);
        });
}

function loadAnalyticsModule() {
    const modulePath = window.Site?.appendSiteVersion?.("../firebase-analytics.js") ?? "../firebase-analytics.js";
    return import(modulePath);
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

    if (!letters.length) {
        const empty = document.createElement("p");
        empty.className = "letter-library__empty";
        empty.textContent = "No letters here yet.";
        lettersList.appendChild(empty);
        return;
    }

    const library = document.createElement("div");
    library.className = "letter-library";

    const reader = document.createElement("section");
    reader.className = "letter-reader";
    reader.tabIndex = 0;
    reader.dataset.letterReader = "";
    reader.setAttribute("aria-label", "Letter reader");

    const previous = document.createElement("button");
    previous.className = "letter-reader__nav letter-reader__nav--previous";
    previous.type = "button";
    previous.setAttribute("aria-label", "Previous letter");
    previous.innerHTML = "<span aria-hidden=\"true\">&#8592;</span>";

    const stage = document.createElement("figure");
    stage.className = "letter-reader__stage";

    const image = document.createElement("img");
    image.className = "letter-reader__image";
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    stage.appendChild(image);

    const textFallback = document.createElement("div");
    textFallback.className = "letter-reader__text-fallback";
    stage.appendChild(textFallback);

    const next = document.createElement("button");
    next.className = "letter-reader__nav letter-reader__nav--next";
    next.type = "button";
    next.setAttribute("aria-label", "Next letter");
    next.innerHTML = "<span aria-hidden=\"true\">&#8594;</span>";

    const caption = document.createElement("figcaption");
    caption.className = "letter-reader__caption";
    stage.appendChild(caption);
    reader.append(previous, stage, next);
    library.appendChild(reader);

    const wheel = document.createElement("nav");
    wheel.className = "letter-wheel";
    wheel.setAttribute("aria-label", "Choose a letter");
    const wheelTrack = document.createElement("div");
    wheelTrack.className = "letter-wheel__track";
    wheel.appendChild(wheelTrack);
    library.appendChild(wheel);

    const thumbnails = letters.map((letter, index) => {
        const button = document.createElement("button");
        button.className = "letter-thumb";
        button.type = "button";
        button.setAttribute("aria-label", `Open ${getLetterTitle(letter, index)}`);
        button.setAttribute("aria-pressed", "false");
        button.dataset.letterIndex = String(index);

        const thumbnailImage = document.createElement("img");
        thumbnailImage.alt = "";
        thumbnailImage.loading = index < 4 ? "eager" : "lazy";
        thumbnailImage.decoding = "async";
        setLetterImage(thumbnailImage, letter);

        const number = document.createElement("span");
        number.textContent = String(index + 1).padStart(2, "0");
        button.append(thumbnailImage, number);
        button.addEventListener("click", () => updateReader(index, true));
        wheelTrack.appendChild(button);
        return button;
    });

    let activeIndex = 0;
    const updateReader = (nextIndex, shouldScrollThumb = false) => {
        activeIndex = (nextIndex + letters.length) % letters.length;
        const letter = letters[activeIndex];
        const title = getLetterTitle(letter, activeIndex);
        const source = getLetterImageSource(letter);
        reader.setAttribute("aria-label", `${title} reader`);
        image.alt = title;
        image.hidden = !source;
        if (source) {
            image.src = source;
        } else {
            image.removeAttribute("src");
        }

        textFallback.replaceChildren();
        if (!source) {
            const body = document.createElement("div");
            normalizeParagraphs(letter.body).forEach((paragraphText) => {
                const paragraph = document.createElement("p");
                paragraph.textContent = paragraphText;
                body.appendChild(paragraph);
            });
            textFallback.appendChild(body);
        }
        textFallback.hidden = Boolean(source);

        const metaBits = [];
        if (typeof letter.date === "string" && letter.date) {
            metaBits.push(letter.date);
        }
        if (typeof letter.location === "string" && letter.location) {
            metaBits.push(letter.location);
        }
        caption.replaceChildren();
        const captionTitle = document.createElement("strong");
        captionTitle.textContent = title;
        const captionCount = document.createElement("span");
        captionCount.textContent = `${activeIndex + 1} / ${letters.length}`;
        caption.append(captionTitle, captionCount);
        if (metaBits.length) {
            const captionMeta = document.createElement("small");
            captionMeta.textContent = metaBits.join(" / ");
            caption.appendChild(captionMeta);
        }

        previous.disabled = letters.length < 2;
        next.disabled = letters.length < 2;
        thumbnails.forEach((thumbnail, index) => {
            const isActive = index === activeIndex;
            thumbnail.setAttribute("aria-pressed", String(isActive));
            thumbnail.tabIndex = isActive ? 0 : -1;
        });
        if (shouldScrollThumb) {
            thumbnails[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    };

    previous.addEventListener("click", () => updateReader(activeIndex - 1, true));
    next.addEventListener("click", () => updateReader(activeIndex + 1, true));
    reader.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            updateReader(activeIndex - 1, true);
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            updateReader(activeIndex + 1, true);
        }
    });

    updateReader(0);
    lettersList.appendChild(library);
}

function getLetterTitle(letter, index) {
    return typeof letter.title === "string" && letter.title.trim()
        ? letter.title
        : `Letter ${String(index + 1).padStart(2, "0")}`;
}

function getLetterImageSource(letter) {
    if (typeof letter.image === "string" && letter.image.startsWith("data:image/")) {
        return letter.image;
    }

    if (typeof letter.imageData === "string" && letter.imageData.startsWith("data:image/")) {
        return letter.imageData;
    }

    return "";
}

function setLetterImage(image, letter) {
    const source = getLetterImageSource(letter);
    if (source) {
        image.src = source;
        return;
    }

    image.hidden = true;
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
