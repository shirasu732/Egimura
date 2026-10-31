// ゲームバランスの数値(すべて仮。遊びながら調整する)
export const BALANCE = {
    maxAffection: 100,
    visit: 2,            // ヒロインのいる場所へ行ったとき
    // 会話の選択肢・イベントで上がる値は data/events.js にそれぞれ書く

    // ぼっちエンド判定:この時期の始めに、ルートの残っている誰もが need 未満ならぼっちエンド
    bocchiCheck: { month: 2, slot: 1, need: 40 },

    // 1年の終わりに、この値以上で一番好感度の高いヒロインのエンディングになる
    endingNeed: 70,

    // 親友の締め切り警告:締め切りの何ターン前から言うか(6ターン = 1か月)
    warnTurns: 6,

    // 天気の出やすさ
    weather: [
        { key: "sunny", name: "晴れ", weight: 6 },
        { key: "cloudy", name: "くもり", weight: 3 },
        { key: "rain", name: "雨", weight: 2 }
    ]
};
