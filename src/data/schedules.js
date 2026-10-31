// ヒロインが「どのフェーズに、どこにいやすいか」
// 毎週のはじめに、weight(重み)の比率で抽選して居場所が決まる
// フェーズのキーは engine/Calendar.js の PHASES を参照
export const SCHEDULES = {
    aizawa: {
        lunch:       [{ place: "classroom", weight: 6 }, { place: "lab", weight: 2 }, { place: "cafeteria", weight: 2 }],
        afterSchool: [{ place: "lab", weight: 6 }, { place: "classroom", weight: 4 }],
        holidayAM:   [{ place: "school", weight: 4 }, { place: "mall", weight: 4 }, { place: "residential", weight: 2 }],
        holidayPM:   [{ place: "mall", weight: 6 }, { place: "school", weight: 4 }]
    },
    umefuji: {
        lunch:       [{ place: "classroom", weight: 5 }, { place: "library", weight: 5 }],
        afterSchool: [{ place: "library", weight: 7 }, { place: "rooftop", weight: 3 }],
        holidayAM:   [{ place: "residential", weight: 7 }, { place: "mall", weight: 3 }],
        holidayPM:   [{ place: "residential", weight: 5 }, { place: "mall", weight: 5 }]
    },
    tsukishiro: {
        lunch:       [{ place: "ground", weight: 6 }, { place: "cafeteria", weight: 4 }],
        afterSchool: [{ place: "ground", weight: 10 }],
        holidayAM:   [{ place: "seaside", weight: 6 }, { place: "school", weight: 4 }],
        holidayPM:   [{ place: "school", weight: 5 }, { place: "seaside", weight: 5 }]
    }
};
