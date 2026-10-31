// ============================================================
//  居場所と天気:毎週のはじめに抽選して state に保存する
//  (保存しておくことで、ロードし直しても結果が変わらない)
// ============================================================
import { SCHEDULES } from "../data/schedules.js";
import { RAIN_MOVES } from "../data/locations.js";
import { BALANCE } from "../data/balance.js";

export function pickWeighted(list) {
    const total = list.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const x of list) {
        r -= x.weight;
        if (r < 0) return x;
    }
    return list[list.length - 1];
}

export function pickOne(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// 今週の天気と、フェーズごとの居場所 { lunch: { aizawa: "classroom", ... }, ... } を作る
export function rollWeek() {
    const weather = pickWeighted(BALANCE.weather).key;
    const places = {};
    for (const [heroine, phases] of Object.entries(SCHEDULES)) {
        for (const [phase, candidates] of Object.entries(phases)) {
            let place = pickWeighted(candidates).place;
            if (weather === "rain" && RAIN_MOVES[place]) place = RAIN_MOVES[place];
            (places[phase] ||= {})[heroine] = place;
        }
    }
    return { weather, places };
}

// そのフェーズにその場所にいるヒロインの一覧
export function heroinesAt(week, phase, place) {
    const map = week.places[phase] || {};
    return Object.keys(map).filter((id) => map[id] === place);
}
