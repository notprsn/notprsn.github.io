const onReady = window.Site?.onReady ?? ((callback) => callback());

onReady(initWorkLedgerAccordion);

function initWorkLedgerAccordion() {
    const items = Array.from(document.querySelectorAll("[data-ledger-item]"))
        .map((row) => ({
            row,
            toggle: row.querySelector(".paper-ledger__toggle"),
        }))
        .filter((item) => item.toggle);

    if (!items.length) {
        return;
    }

    const mobileQuery = window.matchMedia("(max-width: 940px)");

    items.forEach(({ row, toggle }) => {
        toggle.addEventListener("click", () => {
            if (!mobileQuery.matches) {
                return;
            }

            const isOpen = row.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    });

    function syncLedgerState() {
        if (!mobileQuery.matches) {
            items.forEach(({ row, toggle }) => {
                row.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        }
    }

    syncLedgerState();
    mobileQuery.addEventListener("change", syncLedgerState);
}
