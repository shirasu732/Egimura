// ============================================================
//  開発用:URL の末尾に ?debug を付けると、好感度などを画面右上に表示する
//  例:http://localhost:8000/?debug
// ============================================================
import { HEROINES } from "../../data/heroines.js";

export class DebugPanel {
    constructor() {
        this.enabled = new URLSearchParams(location.search).has("debug");
        if (!this.enabled) return;
        this.el = document.createElement("pre");
        this.el.id = "debug-panel";
        document.getElementById("game-container").append(this.el);
    }

    update(state) {
        if (!this.enabled || !state) return;
        const rows = Object.keys(HEROINES).map((id) => {
            const lost = state.lost.includes(id) ? " (ルート外)" : "";
            return `${HEROINES[id].name.padEnd(4, "　")} ${String(state.affection[id]).padStart(3)}${lost}`;
        });
        const places = Object.entries(state.week.places)
            .map(([phase, m]) => `${phase}: ${Object.entries(m).map(([h, p]) => `${HEROINES[h].name}=${p}`).join(" ")}`);
        this.el.textContent = [`turn ${state.turn} phase ${state.phaseIndex}`, ...rows, "", ...places].join("\n");
    }
}
