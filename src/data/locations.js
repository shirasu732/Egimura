// 行き先の一覧(マップができたら x, y にマップ上の位置を足す)
// area: "school" 校内 / "town" 町内
export const LOCATIONS = {
    classroom:   { name: "教室",           area: "school", bg: "classroom" },
    library:     { name: "図書室",         area: "school", bg: "library" },
    lab:         { name: "理科準備室",     area: "school", bg: "lab" },
    ground:      { name: "グラウンド",     area: "school", bg: "ground" },
    rooftop:     { name: "屋上",           area: "school", bg: "rooftop" },
    cafeteria:   { name: "食堂",           area: "school", bg: "cafeteria" },
    residential: { name: "家の近所",       area: "town",   bg: "residential" },
    mall:        { name: "ショッピングモール", area: "town", bg: "mall" },
    seaside:     { name: "海沿いの道",     area: "town",   bg: "seaside" },
    school:      { name: "学校(部活)",     area: "town",   bg: "ground" }
};

// 雨の日は外にいる人が屋内へ移る
export const RAIN_MOVES = {
    ground: "classroom",
    rooftop: "library",
    seaside: "mall",
    school: "classroom"
};
