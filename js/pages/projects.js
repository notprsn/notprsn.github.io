const onReady = window.Site?.onReady ?? ((callback) => callback());

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

        const isInteractiveTarget = (target) => {
            if (!(target instanceof Element)) {
                return false;
            }

            const interactiveParent = target.closest(
                "a, button, input, select, textarea, summary, [role='button'], [role='link']"
            );
            return Boolean(interactiveParent && interactiveParent !== card);
        };

        card.addEventListener("click", (event) => {
            if (isInteractiveTarget(event.target)) {
                return;
            }

            window.location.href = href;
        });

        card.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            window.location.href = href;
        });
    });
}
