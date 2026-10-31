// ============================================================
//  時間の進行:1か月 = 6ターン(平日・平日・休日・平日・平日・休日)、4月〜3月で72ターン
// ============================================================
export const TURNS_PER_MONTH = 6;
export const MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
export const TOTAL_TURNS = MONTHS.length * TURNS_PER_MONTH;

// 各ターンが第何週か、休日か
const SLOTS = [
    { week: 1, holiday: false },
    { week: 2, holiday: false },
    { week: 2, holiday: true },
    { week: 3, holiday: false },
    { week: 4, holiday: false },
    { week: 4, holiday: true }
];

// 1日の流れ。move があるフェーズは行き先を選べる(後でマップ画面に置き換える)
//   move: "school" 校内だけ / "town" 町内だけ / "both" 両方
//   friend: true なら親友に話を聞ける
export const PHASES = {
    weekday: [
        { key: "wake",        name: "朝",         bg: "room" },
        { key: "commute",     name: "登校",       bg: "residential" },
        { key: "homeroom",    name: "朝のHR",     bg: "classroom" },
        { key: "amClass",     name: "午前の授業", bg: "classroom" },
        { key: "lunch",       name: "昼休み",     bg: "classroom", move: "school", friend: true },
        { key: "pmClass",     name: "午後の授業", bg: "classroom" },
        { key: "afterSchool", name: "放課後",     bg: "classroomAfter", move: "both", friend: true },
        { key: "night",       name: "夜",         bg: "room" },
        { key: "home",        name: "就寝",       bg: "room" }
    ],
    holiday: [
        { key: "wake",         name: "朝",   bg: "room" },
        { key: "holidayAM",    name: "午前", bg: "residential", move: "town" },
        { key: "holidayLunch", name: "昼食", bg: "residential" },
        { key: "holidayPM",    name: "午後", bg: "residential", move: "town" },
        { key: "night",        name: "夜",   bg: "room" },
        { key: "home",         name: "就寝", bg: "room" }
    ]
};

// 「何月の何ターン目」をターン番号(0〜71)にする
export function turnOf(month, slot) {
    return MONTHS.indexOf(month) * TURNS_PER_MONTH + (slot - 1);
}

export function dayInfo(turn) {
    const month = MONTHS[Math.floor(turn / TURNS_PER_MONTH)];
    const slot = SLOTS[turn % TURNS_PER_MONTH];
    const label = `${month}月第${slot.week}週${slot.holiday ? " 週末" : ""}`;
    return { month, week: slot.week, holiday: slot.holiday, label, phases: PHASES[slot.holiday ? "holiday" : "weekday"] };
}
