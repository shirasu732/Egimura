// ヒロインの基本データ
// deadline: この時期の始めに好感度が need 未満だと、そのヒロインのルートから外れる
//   month は月、slot はその月の何ターン目か(1〜6。3と6は休日)
//   ※時期と必要値は仮。決まったらここを書き換える
export const HEROINES = {
    aizawa: {
        name: "相沢",
        fullName: "相沢 縁",
        sprite: null,   // 立ち絵が用意できたら CHARACTERS に登録してキーを書く
        deadline: {
            month: 12, slot: 1, need: 50,
            dropLines: [
                { text: "最近、相沢さんの周りには友人たちの姿が増えた。" },
                { text: "仕事を分け合う相手を、彼女は自分で見つけたらしい。" },
                { text: "……そこに、俺の居場所はなかった。" }
            ]
        }
    },
    umefuji: {
        name: "梅藤",
        fullName: "梅藤 瑠花",
        sprite: null,
        deadline: {
            month: 1, slot: 1, need: 50,
            dropLines: [
                { text: "隣の家の窓に、今日も明かりが灯っている。" },
                { text: "梅藤さんとは、挨拶以上の言葉を交わさないまま季節が過ぎた。" },
                { text: "きっとこの先も、それは変わらないのだろう。" }
            ]
        }
    },
    tsukishiro: {
        name: "月城",
        fullName: "月城 小鳥",
        sprite: null,
        // 修学旅行の時期(仮:10月第2週)。足りなければ主人公は修学旅行へ行き、ルートから外れる
        deadline: {
            month: 10, slot: 2, need: 50,
            dropLines: [
                { bg: "residential", text: "修学旅行の朝。大きな鞄を肩に、駅へ向かう。" },
                { text: "その日が月城の大会だったと知ったのは、旅行から帰ってきた後だった。" },
                { speaker: "月城", text: "……別に、先輩に来てほしかったわけじゃないですから" },
                { text: "そう言った彼女は、それきり目を合わせてくれなくなった。" }
            ],
            passLines: [
                { bg: "residential", text: "修学旅行の朝。俺は駅とは逆の方向へ歩いていた。" },
                { text: "今日は、月城の大会の日だ。" }
            ]
        }
    }
};

export const HEROINE_IDS = Object.keys(HEROINES);
