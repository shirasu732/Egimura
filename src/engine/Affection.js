// ============================================================
//  好感度:ヒロインごとの 0〜100。ルートから外れたヒロインは上がらない
// ============================================================
import { HEROINE_IDS, HEROINES } from "../data/heroines.js";
import { BALANCE } from "../data/balance.js";
import { turnOf } from "./Calendar.js";

export class Affection {
    // state は DayLoop と共有(セーブにそのまま入る)
    constructor(state) {
        this.state = state;
    }

    static initial() {
        return Object.fromEntries(HEROINE_IDS.map((id) => [id, 0]));
    }

    get(id) { return this.state.affection[id] ?? 0; }
    isLost(id) { return this.state.lost.includes(id); }
    activeIds() { return HEROINE_IDS.filter((id) => !this.isLost(id)); }

    add(id, amount) {
        if (!amount || this.isLost(id) || !(id in this.state.affection)) return;
        const v = this.get(id) + amount;
        this.state.affection[id] = Math.max(0, Math.min(BALANCE.maxAffection, v));
    }

    // { aizawa: 5, ... } をまとめて加算
    addAll(map) {
        Object.entries(map || {}).forEach(([id, v]) => this.add(id, v));
    }

    // 親友が教える5段階(0〜4)
    stage(id) {
        return Math.min(4, Math.floor(this.get(id) / 20));
    }

    // このターンに締め切りを迎えるヒロイン → [{ id, passed }]
    deadlinesAt(turn) {
        return this.activeIds()
            .filter((id) => {
                const d = HEROINES[id].deadline;
                return d && turnOf(d.month, d.slot) === turn;
            })
            .map((id) => ({ id, passed: this.get(id) >= HEROINES[id].deadline.need }));
    }

    lose(id) {
        if (!this.isLost(id)) this.state.lost.push(id);
    }

    // 締め切りが近いのに足りないヒロイン(親友の警告用)
    warnings(turn) {
        return this.activeIds().filter((id) => {
            const d = HEROINES[id].deadline;
            if (!d) return false;
            const left = turnOf(d.month, d.slot) - turn;
            return left > 0 && left <= BALANCE.warnTurns && this.get(id) < d.need;
        });
    }

    // ぼっちエンド判定のターンなら true(誰も基準に届いていない)
    isBocchiAt(turn) {
        const c = BALANCE.bocchiCheck;
        if (turnOf(c.month, c.slot) !== turn) return false;
        return this.activeIds().every((id) => this.get(id) < c.need);
    }

    // 1年の終わりのエンディング:基準以上で一番高いヒロイン、いなければぼっち
    // ※複数人が基準を超えたときの扱い(二股エンドなど)は未定。今は一番高い人
    finalEnding() {
        const ok = this.activeIds()
            .filter((id) => this.get(id) >= BALANCE.endingNeed)
            .sort((a, b) => this.get(b) - this.get(a));
        return ok[0] || "bocchi";
    }
}
