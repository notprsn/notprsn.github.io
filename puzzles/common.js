const normalizeAnswer = (value) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

document.addEventListener("DOMContentLoaded", () => {
    const bodyLevel = document.body.dataset.level;
    if (bodyLevel) {
        localStorage.setItem("notprsn.puzzle.level", bodyLevel);
    }

    const form = document.querySelector("[data-answer-form]");
    if (form) {
        const input = form.querySelector("input");
        const feedback = form.querySelector(".answer-feedback");
        const expected = normalizeAnswer(document.body.dataset.answer || "");
        const next = document.body.dataset.next;

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!input || !feedback) {
                return;
            }

            if (normalizeAnswer(input.value) === expected) {
                feedback.classList.remove("is-wrong");
                feedback.textContent = "Correct.";
                if (next) {
                    window.location.href = next;
                }
                return;
            }

            feedback.classList.add("is-wrong");
            feedback.textContent = "No. Look again.";
            input.select();
        });
    }

    const hoverHotspot = document.querySelector("[data-hover-hotspot]");
    const hoverReveal = document.querySelector("[data-hover-reveal]");
    const hoverStatus = document.querySelector("[data-hover-status]");

    if (hoverHotspot && hoverReveal) {
        hoverHotspot.addEventListener("mouseenter", () => {
            hoverReveal.classList.add("is-visible");
            if (hoverStatus) {
                hoverStatus.textContent = "Better. Not a click.";
            }
        });

        hoverHotspot.addEventListener("mouseleave", () => {
            if (hoverStatus) {
                hoverStatus.textContent = "Some answers need movement, not pressure.";
            }
        });
    }

    const obstruction = document.querySelector("[data-obstruction]");
    if (obstruction) {
        const stage = obstruction.parentElement;
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const stopDragging = () => {
            dragging = false;
            obstruction.classList.remove("is-dragging");
        };

        const onPointerMove = (event) => {
            if (!dragging || !stage) {
                return;
            }

            const stageRect = stage.getBoundingClientRect();
            const obstructionRect = obstruction.getBoundingClientRect();
            const maxLeft = stageRect.width - obstructionRect.width;
            const maxTop = stageRect.height - obstructionRect.height;

            const left = Math.min(
                Math.max(event.clientX - stageRect.left - offsetX, 0),
                maxLeft
            );
            const top = Math.min(
                Math.max(event.clientY - stageRect.top - offsetY, 0),
                maxTop
            );

            obstruction.style.left = `${left}px`;
            obstruction.style.top = `${top}px`;
            obstruction.style.transform = "none";
        };

        obstruction.addEventListener("pointerdown", (event) => {
            const rect = obstruction.getBoundingClientRect();
            dragging = true;
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            obstruction.classList.add("is-dragging");
            obstruction.setPointerCapture(event.pointerId);
        });

        obstruction.addEventListener("pointermove", onPointerMove);
        obstruction.addEventListener("pointerup", stopDragging);
        obstruction.addEventListener("pointercancel", stopDragging);
        window.addEventListener("pointerup", stopDragging);
    }

    console.info("Try what the page suggests. Then try what it doesn't.");
});
