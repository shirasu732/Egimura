// 親友(主人公のクラスメイト)
// 名前・立ち絵が決まったら name と sprite を書き換える
export const FRIEND = {
    name: "親友",
    sprite: null,

    greeting: [
        [{ speaker: "親友", text: "お、{name}。また女の子の話か? 仕方ねえな、教えてやるよ" }],
        [{ speaker: "親友", text: "情報料はジュース1本な。……冗談だって" }]
    ],

    // 好感度の段階ごとのセリフ(0〜19, 20〜39, 40〜59, 60〜79, 80〜100)
    stages: [
        "{heroine}? お前、名前も覚えられてないんじゃね?",
        "{heroine}とは、顔は知ってる、くらいだな",
        "{heroine}とは普通に仲良いんじゃねーの",
        "{heroine}、お前の話をたまにしてるらしいぞ",
        "{heroine}? もう言っちまえよ"
    ],

    // ルートから外れたヒロイン
    lost: "{heroine}のことは……まあ、諦めろ",

    // 今週の居場所を教えたあと
    hint: "それと、今週あいつらがどこにいそうか、だいたい教えといたぞ",

    // 締め切りが近いのに好感度が足りないとき
    warn: "そういや、そろそろ{event}だろ。{heroine}とはどうなんだよ。このままだとまずいんじゃね?",
    warnEvents: { tsukishiro: "修学旅行", aizawa: "年末", umefuji: "年明け" },

    alreadyAsked: [{ speaker: "親友", text: "今週はもう教えただろ。欲張んなって" }]
};
