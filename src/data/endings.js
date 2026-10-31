// エンディング(セリフは仮。あらすじの〈結〉に合わせて書き換える)
// title はエンディング後の画面に出る
export const ENDINGS = {
    aizawa: {
        title: "相沢 縁 エンド",
        lines: [
            { bg: "classroomAfter", text: "放課後の教室。仕事を終えた相沢さんが、こちらを振り返った。" },
            { speaker: "相沢", text: "あなたと一緒にいると、全部自分でやらなくてもいいんだって思えるようになりました" },
            { text: "俺は、ずっと言えなかった気持ちを口にした。" },
            { speaker: "相沢", text: "……はい。私も、です" }
        ]
    },
    umefuji: {
        title: "梅藤 瑠花 エンド",
        lines: [
            { bg: "residential", text: "家の前で、梅藤さんが待っていた。手には読み終えた本がある。" },
            { speaker: "梅藤", text: "本に書いてあった気持ちと、同じだったので……確かめたくて" },
            { text: "俺は、彼女に好きだと伝えた。" },
            { speaker: "梅藤", text: "……私も。あなたといる時間が、一番大切です" }
        ]
    },
    tsukishiro: {
        title: "月城 小鳥 エンド",
        lines: [
            { bg: "ground", text: "大会の帰り道。月城は自己ベストの記録証を握りしめていた。" },
            { speaker: "月城", text: "……実は、先輩がいてくれて、よかったです" },
            { text: "俺は、自分の気持ちを伝えた。" },
            { speaker: "月城", text: "……先輩。これからも、私のこと、ちゃんと見ててくださいね" }
        ]
    },
    bocchi: {
        title: "ぼっちエンド",
        lines: [
            { bg: "room", text: "気がつけば、季節はすっかり冬になっていた。" },
            { text: "結局、誰とも特別な関係にはなれなかった。" },
            { bg: "god", particles: "light", style: "center", fx: "lines",
              text: "女神「……やはり、お前には無理じゃったか。くくっ」" }
        ]
    }
};
