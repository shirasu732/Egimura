// ============================================================
//  本編の進行:ターン(週)→ フェーズ(朝・昼休み・放課後…)を順に進める
//  セーブは「今のフェーズの始まり」の状態を保存し、ロードするとそこからやり直す
// ============================================================
import { TOTAL_TURNS, dayInfo } from "./Calendar.js";
import { Affection } from "./Affection.js";
import { EventRunner } from "./EventRunner.js";
import { rollWeek, heroinesAt, pickOne } from "./Schedule.js";
import { HEROINES } from "../data/heroines.js";
import { LOCATIONS } from "../data/locations.js";
import { BALANCE } from "../data/balance.js";
import { NARRATION, ENCOUNTERS } from "../data/daily.js";
import { FRIEND } from "../data/friend.js";
import { ENDINGS } from "../data/endings.js";

const clone = (o) => JSON.parse(JSON.stringify(o));

// 場面の切り替えだけの行(前の場面の立ち絵・エフェクトを消す)
const scene = (bg, extra = {}) => ({ bg, chara: null, particles: "none", overlay: "none", ...extra });

export class DayLoop {
    // onEnding(endingId) : エンディングを見終わったとき
    constructor({ story, dateBadge, debug, onEnding }) {
        this.story = story;
        this.dateBadge = dateBadge;
        this.debug = debug;
        this.onEnding = onEnding;
        this.state = null;
        this.checkpoint = null;   // 今のフェーズの始まりの状態(セーブ用)
        this.inEnding = false;    // エンディング中はセーブできない
    }

    // ---------- 開始・セーブ・ロード ----------
    newGame() {
        this.inEnding = false;
        this.setState({
            turn: 0, phaseIndex: 0,
            affection: Affection.initial(), lost: [], seen: [],
            week: null, knownFrom: -1, knownUntil: -1, friendTurn: -1
        });
        this.beginTurn();
    }

    setState(state) {
        this.state = state;
        this.affection = new Affection(state);
        this.events = new EventRunner(state, this.affection);
    }

    getSaveData() {
        const cp = this.checkpoint;
        const day = dayInfo(cp.turn);
        return {
            mode: "main",
            state: clone(cp),
            bg: day.phases[cp.phaseIndex].bg,
            text: `${day.label} ${day.phases[cp.phaseIndex].name}`
        };
    }

    load(state) {
        this.inEnding = false;
        this.setState(clone(state));
        if (this.state.turn >= TOTAL_TURNS) return this.beginTurn();
        this.startPhase();
    }

    // ---------- ターンとフェーズ ----------
    beginTurn() {
        const s = this.state;
        if (s.turn >= TOTAL_TURNS) return this.ending(this.affection.finalEnding());

        s.week = rollWeek();
        s.phaseIndex = 0;

        // 締め切りとぼっちエンドの判定
        const lines = [];
        for (const { id, passed } of this.affection.deadlinesAt(s.turn)) {
            const d = HEROINES[id].deadline;
            if (passed) {
                if (d.passLines) lines.push(...d.passLines);
            } else {
                this.affection.lose(id);
                lines.push(...d.dropLines);
            }
        }
        if (this.affection.isBocchiAt(s.turn)) return this.ending("bocchi");

        if (lines.length) {
            this.saveCheckpoint();
            this.story.run(lines, { onEnd: () => this.startPhase() });
        } else {
            this.startPhase();
        }
    }

    saveCheckpoint() {
        this.checkpoint = clone(this.state);
        this.debug.update(this.state);
    }

    startPhase() {
        const s = this.state;
        const day = dayInfo(s.turn);
        const phase = day.phases[s.phaseIndex];
        this.saveCheckpoint();
        this.dateBadge.show(day.label, phase.name, s.week.weather);
        this.story.textBox.resetStyle();

        const lines = phase.move ? [this.moveChoiceLine(phase, day)] : this.phaseLines(phase, day);
        if (!lines.length) return this.nextPhase();
        this.story.run(lines, {
            onEnd: () => this.nextPhase(),
            onChoose: (opt) => this.onChoose(opt, phase, day)
        });
    }

    nextPhase() {
        const s = this.state;
        s.phaseIndex++;
        if (s.phaseIndex >= dayInfo(s.turn).phases.length) {
            s.turn++;
            return this.beginTurn();
        }
        this.startPhase();
    }

    // 移動のないフェーズ:イベントがあれば流す。朝と就寝は毎回ひとこと
    phaseLines(phase, day) {
        const ev = this.events.find(phase.key, null);
        if (ev) return this.eventLines(ev);
        const fill = (lines) => lines.map((l) => ({ ...l, text: l.text.replace("{date}", day.label) }));
        if (phase.key === "wake") {
            const pool = (day.holiday ? NARRATION.holidayWake : NARRATION.wake)[this.state.week.weather];
            const sunny = this.state.week.weather === "sunny";
            return [scene(phase.bg, sunny ? { overlay: "sunlight", particles: "dust" } : {}), ...fill(pickOne(pool))];
        }
        if (phase.key === "home") return [scene(phase.bg), ...pickOne(NARRATION.home)];
        return [];
    }

    // ---------- 行き先の選択(マップができたら置き換える) ----------
    moveChoiceLine(phase, day) {
        const s = this.state;
        const known = s.turn >= s.knownFrom && s.turn <= s.knownUntil;
        const places = Object.keys(LOCATIONS).filter((key) => {
            const area = LOCATIONS[key].area;
            if (phase.move === "both") return key !== "school";
            if (phase.move === "town") return area === "town";
            return area === "school";
        });
        const options = places.map((place) => {
            const who = known ? heroinesAt(s.week, phase.key, place).map((id) => HEROINES[id].name) : [];
            const hint = who.length ? ` <small>(${who.join("・")}がいる)</small>` : "";
            return { text: LOCATIONS[place].name + hint, go: place };
        });
        if (phase.friend && s.friendTurn !== s.turn) options.push({ text: `${FRIEND.name}に話を聞く`, friend: true });
        return { ...scene(phase.bg), text: `${phase.name}。どこへ行こう?`, choice: options };
    }

    onChoose(opt, phase, day) {
        if (opt.affection) this.affection.addAll(opt.affection);
        if (opt.friend) return [...this.friendLines(), this.moveChoiceLine(phase, day)];
        if (opt.go) return this.visit(opt.go, phase);
        return opt.lines;
    }

    visit(place, phase) {
        const s = this.state;
        const ev = this.events.find(phase.key, place);
        if (ev) return this.eventLines(ev);

        const who = heroinesAt(s.week, phase.key, place);
        const lines = [scene(LOCATIONS[place].bg)];
        if (!who.length) return [...lines, ...pickOne(NARRATION.nobody)];
        for (const id of who) {
            this.affection.add(id, BALANCE.visit);
            const pool = ENCOUNTERS[id][place] || ENCOUNTERS[id].default;
            lines.push(...pickOne(pool));
        }
        return lines;
    }

    eventLines(ev) {
        this.events.markSeen(ev);
        this.affection.addAll(ev.affection);
        const { bg, ...reset } = scene(ev.lines[0].bg);
        return [ev.lines[0].bg ? { bg, ...reset } : reset, ...ev.lines];
    }

    // ---------- 親友 ----------
    friendLines() {
        const s = this.state;
        s.friendTurn = s.turn;
        // 今週(その週の週末まで)の居場所が、行き先に表示されるようになる
        s.knownFrom = s.turn;
        s.knownUntil = s.turn + 1 < TOTAL_TURNS && dayInfo(s.turn + 1).holiday ? s.turn + 1 : s.turn;
        const say = (text) => ({ speaker: FRIEND.name, text });
        const lines = [...pickOne(FRIEND.greeting)];
        for (const id of Object.keys(HEROINES)) {
            const name = HEROINES[id].name;
            const text = this.affection.isLost(id) ? FRIEND.lost : FRIEND.stages[this.affection.stage(id)];
            lines.push(say(text.replaceAll("{heroine}", name)));
        }
        for (const id of this.affection.warnings(s.turn)) {
            lines.push(say(FRIEND.warn.replace("{heroine}", HEROINES[id].name).replace("{event}", FRIEND.warnEvents[id] || "締め切り")));
        }
        lines.push(say(FRIEND.hint));
        return lines;
    }

    // ---------- エンディング ----------
    ending(id) {
        this.inEnding = true;
        this.dateBadge.hide();
        this.story.textBox.resetStyle();
        this.checkpoint = clone(this.state);
        const ed = ENDINGS[id];
        this.story.run([{ transition: "black", chara: null, particles: "none", overlay: "none" }, ...ed.lines], {
            onEnd: () => this.onEnding(id, ed.title)
        });
    }
}
