const { onReady, fetchVersionedResource, appendSiteVersion } = window.Site;

onReady(initChecklist);

async function initChecklist() {
    const root = document.querySelector("[data-words-checklist]");
    if (!root) return;
    const isReading = root.dataset.wordsChecklist === "reading";
    const list = root.querySelector("[data-checklist-items]");
    const progress = root.querySelector("progress");
    const summary = root.querySelector("[data-progress-summary]");
    const message = root.querySelector("[data-progress-message]");
    const signIn = root.querySelector("[data-owner-sign-in]");
    const signOut = root.querySelector("[data-owner-sign-out]");
    const nightCheckbox = root.querySelector("[data-night-complete]");
    const kinds = { story: "Short story", poem: "Poem", essay: "Essay" };
    let records = {};
    let owner = false;
    let connected = false;
    let saving = false;
    let nightNumber = 1;
    let service;

    try {
        const response = await fetchVersionedResource(root.dataset.source);
        if (!response.ok) throw new Error("Checklist unavailable");
        const data = await response.json();
        if (!isReading) data.tasks.sort((left, right) =>
            (left.startYear ?? Number.MAX_SAFE_INTEGER) - (right.startYear ?? Number.MAX_SAFE_INTEGER));
        const items = isReading ? data.nights : data.tasks;
        progress.max = items.length;

        function updateProgress() {
            if (!connected) return;
            const count = items.filter((item) => records[isReading ? item.night : item.id]?.complete === true).length;
            progress.value = count;
            summary.textContent = `${count} / ${items.length} complete`;
        }

        function updateOwner() {
            signIn.hidden = owner;
            signOut.hidden = !owner;
            if (nightCheckbox) nightCheckbox.disabled = !owner || !connected || saving;
        }

        async function save(id, value) {
            if (saving) { render(); return; }
            const previous = records[id];
            records = { ...records, [id]: { ...previous, ...value } };
            saving = true;
            render();
            updateOwner();
            message.textContent = "Saving…";
            try {
                await service.save(id, value);
                message.textContent = "Saved.";
            } catch (error) {
                if (previous) records[id] = previous;
                else delete records[id];
                message.textContent = "Could not save progress. Please try again.";
                console.error(error);
            } finally {
                saving = false;
                render();
                updateOwner();
            }
        }

        function render() {
            list.replaceChildren();
            if (isReading) {
                nightCheckbox.checked = records[nightNumber]?.complete === true;
                for (const item of data.nights[nightNumber - 1].readings) {
                    const row = document.createElement("li");
                    const copy = document.createElement("div");
                    addText(copy, "words-reading-kind", kinds[item.kind]);
                    addText(copy, "words-reading-title", item.title);
                    addText(copy, "words-reading-author", item.author);
                    if (item.readingNote) addText(copy, "words-reading-note", item.readingNote);
                    const actions = document.createElement("div");
                    actions.className = "words-reading-actions";
                    addLink(actions, item.url, item.verified ? "Read ↗" : "Source ↗", `${item.verified ? "Read" : "Original source for"} ${item.title} by ${item.author}`);
                    if (!item.verified) {
                        addLink(actions, `https://www.google.com/search?q=${encodeURIComponent(`"${item.title}" "${item.author}" read`)}`, "Find text ↗", `Find ${item.title} by ${item.author}`);
                        addText(actions, "", "Link unchecked");
                    }
                    row.append(copy, actions);
                    list.append(row);
                }
            } else {
                let group;
                for (const item of data.tasks) {
                    const period = item.startYear === null ? "Dates to add" : item.startYear === item.endYear ? String(item.startYear) : `${item.startYear}–${item.endYear}`;
                    if (period !== group) {
                        const heading = document.createElement("li");
                        heading.className = "words-period";
                        addText(heading, "words-reading-kind", period);
                        list.append(heading);
                        group = period;
                    }
                    const record = records[item.id] || {};
                    const row = document.createElement("li");
                    row.dataset.complete = String(record.complete === true);
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = `words-${item.id}`;
                    checkbox.checked = record.complete === true;
                    checkbox.disabled = !owner || !connected || saving || !validSubstackUrl(record.substackUrl);
                    const label = document.createElement("label");
                    label.htmlFor = checkbox.id;
                    addText(label, "words-reading-title", item.title);
                    const actions = document.createElement("div");
                    actions.className = "words-reading-actions";
                    if (validSubstackUrl(record.substackUrl)) addLink(actions, record.substackUrl, "Read ↗", `Read ${item.title} on Substack`);
                    addText(actions, "words-status", checkbox.checked ? "Published" : "Pending");
                    checkbox.addEventListener("change", () => save(item.id, { complete: checkbox.checked, substackUrl: record.substackUrl }));
                    row.append(checkbox, label, actions);
                    if (owner) row.append(buildSubstackEditor(item, record, save));
                    list.append(row);
                }
            }
            updateProgress();
        }

        if (isReading) {
            const input = root.querySelector("[data-night-number]");
            const previous = root.querySelector("[data-night-previous]");
            const next = root.querySelector("[data-night-next]");
            function showNight(value) {
                const candidate = Number(value);
                if (Number.isInteger(candidate) && candidate >= 1 && candidate <= items.length) nightNumber = candidate;
                input.value = nightNumber;
                previous.disabled = nightNumber === 1;
                next.disabled = nightNumber === items.length;
                render();
            }
            function navigate(value) {
                showNight(value);
                location.hash = `night-${nightNumber}`;
            }
            const readHash = () => showNight(location.hash.match(/^#night-(\d+)$/)?.[1] || 1);
            previous.addEventListener("click", () => navigate(nightNumber - 1));
            next.addEventListener("click", () => navigate(nightNumber + 1));
            input.addEventListener("change", () => navigate(input.value));
            window.addEventListener("hashchange", readHash);
            nightCheckbox.addEventListener("change", () => save(nightNumber, { complete: nightCheckbox.checked }));
            readHash();
        } else {
            render();
        }

        const { connectProgress } = await import(appendSiteVersion("./words-progress.js"));
        service = await connectProgress(isReading ? "reading" : "writing", {
            onChange(value) {
                records = value;
                connected = true;
                render();
                updateOwner();
            },
            onOwner(value) {
                owner = value;
                render();
                updateOwner();
            },
            onError(error) {
                connected = false;
                render();
                updateOwner();
                summary.textContent = "Progress unavailable right now.";
                message.textContent = "Please reload to try again.";
                console.error(error);
            },
        });
        signIn.disabled = false;
        signIn.addEventListener("click", async () => {
            signIn.disabled = true;
            message.textContent = "";
            try { await service.signIn(); }
            catch (error) { message.textContent = error.code === "auth/popup-closed-by-user" ? "" : "Could not sign in with the owner account."; }
            finally { signIn.disabled = false; }
        });
        signOut.addEventListener("click", async () => {
            try { await service.signOut(); message.textContent = ""; }
            catch { message.textContent = "Could not sign out. Please try again."; }
        });
    } catch (error) {
        summary.textContent = "Could not load progress. Please reload to try again.";
        console.error(error);
    }
}

function validSubstackUrl(value) {
    if (typeof value !== "string" || value.length > 2048) return false;
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password && !url.port
            && /^(?:[a-z0-9-]+\.)?substack\.com$/.test(url.hostname) && /^\/p\/.+/.test(url.pathname);
    } catch { return false; }
}

function buildSubstackEditor(item, record, save) {
    const details = document.createElement("details");
    details.className = "words-substack-editor";
    const heading = document.createElement("summary");
    heading.textContent = record.substackUrl ? "Edit Substack link" : "Add Substack link";
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "https://…substack.com/p/…";
    input.setAttribute("aria-label", `Substack link for ${item.title}`);
    input.value = record.substackUrl || "";
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Save";
    form.append(input, button);
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = input.value.trim();
        input.setCustomValidity(url && !validSubstackUrl(url) ? "Enter a Substack post URL." : "");
        if (input.reportValidity()) save(item.id, { complete: !!url, substackUrl: url });
    });
    input.addEventListener("input", () => input.setCustomValidity(""));
    details.append(heading, form);
    return details;
}

function addText(parent, className, text) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    parent.append(span);
    return span;
}

function addLink(parent, url, text, label) {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = text;
    link.setAttribute("aria-label", label);
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    parent.append(link);
}
