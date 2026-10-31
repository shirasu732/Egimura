// 条件つきイベント(サンプル。セリフは仮)
//
// when: 起きる条件(書いたものはすべて満たす必要がある)
//   phase     : フェーズのキー(engine/Calendar.js の PHASES)
//   place     : 行き先(移動フェーズのとき)
//   heroine   : そのヒロインがその場所にいること
//   affection : [ヒロイン, 最低値]
//   from      : [月, ターン] この時期以降
//   weather   : "sunny" / "cloudy" / "rain"
// once      : true なら1回だけ
// affection : 見終わったときに上がる好感度 { ヒロイン: 値 }
// lines     : セリフ(script.js と同じ書き方)
//   choice  : 選択肢。各選択肢の affection で好感度が変わり、lines がそのあとに続く
export const EVENTS = [
    {
        id: "aizawa_boxes",
        when: { phase: "afterSchool", place: "lab", heroine: "aizawa", affection: ["aizawa", 10] },
        once: true,
        affection: { aizawa: 10 },
        lines: [
            { bg: "lab", text: "理科準備室の前で、相沢さんが段ボールを3つも抱えてふらついていた。" },
            { speaker: "相沢", text: "あ、{name}くん。だ、大丈夫です。これくらい、いつものことなので……" },
            { choice: [
                { text: "黙って半分持つ", affection: { aizawa: 5 }, lines: [
                    { speaker: "相沢", text: "え……あ、ありがとうございます。……助かります" }
                ] },
                { text: "「いつも大変だね」と声をかける", affection: { aizawa: 0 }, lines: [
                    { speaker: "相沢", text: "ふふ、慣れてますから。それじゃ、また明日" }
                ] }
            ] }
        ]
    },
    {
        id: "umefuji_book",
        when: { phase: "afterSchool", place: "library", heroine: "umefuji", affection: ["umefuji", 15] },
        once: true,
        affection: { umefuji: 10 },
        lines: [
            { bg: "library", text: "梅藤さんの読んでいる本の表紙に、見覚えがあった。" },
            { text: "先週、自分も読み終えたばかりの本だ。" },
            { choice: [
                { text: "挨拶だけして、隣で自分の本を読む", affection: { umefuji: 5 }, lines: [
                    { text: "しばらくして、ページをめくる音が止まった。" },
                    { speaker: "梅藤", text: "……その本、最後まで読んだんですか?" }
                ] },
                { text: "「その本面白いよね!」と話しかける", affection: { umefuji: -2 }, lines: [
                    { speaker: "梅藤", text: "……" },
                    { text: "梅藤さんは本を閉じて、足早に出て行ってしまった。" }
                ] }
            ] }
        ]
    },
    {
        id: "tsukishiro_run",
        when: { phase: "holidayAM", place: "seaside", heroine: "tsukishiro", affection: ["tsukishiro", 10], weather: "sunny" },
        once: true,
        affection: { tsukishiro: 10 },
        lines: [
            { bg: "seaside", text: "海沿いの道で、月城が膝に手をついて息を整えていた。" },
            { speaker: "月城", text: "はぁ……はぁ……先輩? なんでいるんですか" },
            { choice: [
                { text: "「一緒に走ってもいい?」", affection: { tsukishiro: 5 }, lines: [
                    { speaker: "月城", text: "えー、先輩ついてこれます? ……ま、いいですけど。遅れたら置いてきますからね!" }
                ] },
                { text: "「休んだほうがいいんじゃない?」", affection: { tsukishiro: 0 }, lines: [
                    { speaker: "月城", text: "休んでたら追いつけないんで。じゃ!" },
                    { text: "月城はまた走り出していった。" }
                ] }
            ] }
        ]
    }
];
