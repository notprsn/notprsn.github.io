const onReady = window.Site?.onReady ?? ((callback) => callback());

onReady(initWorkLedgerAccordion);

function initWorkLedgerAccordion() {
    const rows = document.querySelectorAll("[data-ledger-item]");
    if (!rows.length) {
        return;
    }

    const mobileQuery = window.matchMedia("(max-width: 940px)");

    rows.forEach((row) => {
        const toggle = row.querySelector(".paper-ledger__toggle");
        if (!toggle) {
            return;
        }

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
            rows.forEach((row) => {
                row.classList.remove("is-open");
                const toggle = row.querySelector(".paper-ledger__toggle");
                if (toggle) {
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }
    }

    syncLedgerState();
    mobileQuery.addEventListener("change", syncLedgerState);
}
