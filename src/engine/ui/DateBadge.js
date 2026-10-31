// ============================================================
//  画面左上の日付表示(「5月第2週 / 放課後 / 晴れ」)
// ============================================================
import { BALANCE } from "../../data/balance.js";

const $ = (id) => document.getElementById(id);

export class DateBadge {
    constructor() {
        this.el = $("date-badge");
    }

    show(dateLabel, phaseName, weatherKey) {
        const weather = BALANCE.weather.find((w) => w.key === weatherKey)?.name || "";
        this.el.innerHTML = `<span class="date">${dateLabel}</span><span class="phase">${phaseName}</span><span class="weather">${weather}</span>`;
        this.el.hidden = false;
    }

    hide() {
        this.el.hidden = true;
    }
}
