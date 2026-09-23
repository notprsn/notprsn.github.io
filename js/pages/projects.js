const onReady = window.Site?.onReady ?? ((callback) => callback());
const CARD_INTERACTIVE_SELECTOR = "a, button, input, select, textarea, summary, [role='button'], [role='link']";

onReady(initProjectCardLinks);

function initProjectCardLinks() {
    const cards = document.querySelectorAll("[data-project-card-link]");
    if (!cards.length) {
        return;
    }

    cards.forEach((card) => {
        const href = card.getAttribute("data-project-card-link");
        if (!href) {
            return;
        }

        card.addEventListener("click", (event) => {
            if (isInteractiveCardTarget(event.target, card)) {
                return;
            }

            openProjectCardLink(card, href);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            openProjectCardLink(card, href);
        });
    });
}

function openProjectCardLink(card, href) {
    if (card.hasAttribute("data-project-card-new-window")) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
    }

    window.location.href = href;
}

function isInteractiveCardTarget(target, card) {
    if (!(target instanceof Element)) {
        return false;
    }

    const interactiveParent = target.closest(CARD_INTERACTIVE_SELECTOR);
    return Boolean(interactiveParent && interactiveParent !== card);
}
