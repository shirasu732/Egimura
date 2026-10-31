// ============================================================
//  条件つきイベントの選択(data/events.js)
// ============================================================
import { EVENTS } from "../data/events.js";
import { turnOf } from "./Calendar.js";
import { heroinesAt } from "./Schedule.js";

export class EventRunner {
    constructor(state, affection) {
        this.state = state;           // seen(見たイベント)を記録する
        this.affection = affection;
    }

    // 条件を満たす最初のイベント。place は移動フェーズで選んだ場所(それ以外は null)
    find(phase, place) {
        return EVENTS.find((ev) => this.matches(ev, phase, place)) || null;
    }

    matches(ev, phase, place) {
        const w = ev.when || {};
        const s = this.state;
        if (ev.once && s.seen.includes(ev.id)) return false;
        if (w.phase && w.phase !== phase) return false;
        if ((w.place || null) !== (place || null)) return false;
        if (w.weather && w.weather !== s.week.weather) return false;
        if (w.from && s.turn < turnOf(w.from[0], w.from[1])) return false;
        if (w.heroine) {
            if (this.affection.isLost(w.heroine)) return false;
            if (!heroinesAt(s.week, phase, place).includes(w.heroine)) return false;
        }
        if (w.affection && this.affection.get(w.affection[0]) < w.affection[1]) return false;
        return true;
    }

    markSeen(ev) {
        if (!this.state.seen.includes(ev.id)) this.state.seen.push(ev.id);
    }
}
