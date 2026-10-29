// ============================================================
//  バックログ(読んだセリフの履歴)
// ============================================================
import { openOverlay, closeOverlay } from "./Overlay.js";

const $ = (id) => document.getElementById(id);

export class Backlog {
    constructor() {
        this.entries = [];
        this.layer = $("log-layer");
        this.list = $("log-list");
        this.layer.addEventListener("contextmenu", (ev) => { ev.preventDefault(); closeOverlay(this.layer); });
    }

    add(speaker, text) { this.entries.push({ speaker, text }); }
    reset(entries = []) { this.entries = entries; }

    get last() { return this.entries[this.entries.length - 1]; }

    open() {
        const items = this.entries.map(({ speaker, text }) => {
            const li = document.createElement("li");
            if (speaker) li.append(span("log-name", speaker));
            li.append(span("log-text", text));
            return li;
        });
        if (!items.length) items.push(Object.assign(document.createElement("li"), { textContent: "まだ履歴はありません" }));
        this.list.replaceChildren(...items);
        openOverlay(this.layer);
        this.list.scrollTop = this.list.scrollHeight;
    }
}

function span(className, text) {
    return Object.assign(document.createElement("span"), { className, textContent: text });
}
