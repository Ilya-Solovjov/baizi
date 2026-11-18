// Culture questions on topics covered in Units 1–4.
window.BAIZI = window.BAIZI || {};

BAIZI.CULTURE = [
  { u: 1, q: "In the name 陈大东, which part is the family name?", opts: ["陈", "大东", "东"], a: 0, why: "Chinese names put the family name first. 陈 is the surname and 大东 is the given name." },
  { u: 1, q: "How do you address a teacher whose surname is Liu?", opts: ["刘老师", "老师刘", "刘先生老师"], a: 0, why: "Titles come after the surname: 刘老师, 陈先生, 王小姐." },
  { u: 1, q: "Which is the polite way to ask a stranger's surname?", opts: ["您贵姓？", "你叫什么？", "你是谁？"], a: 0, why: "您贵姓 (\"your honorable surname?\") is the respectful form for first meetings." },
  { u: 1, q: "Why is the number 4 often avoided in China?", opts: ["It sounds like the word for death (死 sǐ)", "It is an odd number", "It is the emperor's number"], a: 0, why: "四 (sì) sounds close to 死 (sǐ), so some buildings even skip a 4th floor." },
  { u: 1, q: "Why is the number 8 considered lucky?", opts: ["It sounds like 发 (fā), to prosper", "It looks like a dragon", "It is the number of the zodiac"], a: 0, why: "八 (bā) sounds like 发 (fā), as in getting rich." },
  { u: 1, q: "How many animals are in the Chinese zodiac?", opts: ["12", "10", "8"], a: 0, why: "Twelve animals rotate yearly, from the Rat to the Pig." },
  { u: 1, q: "What does 美 in 美国 (United States) mean?", opts: ["Beautiful", "Big", "New"], a: 0, why: "美国 is literally \"beautiful country.\" Country names often mix sound and meaning." },
  { u: 2, q: "What's the difference between 语 and 文?", opts: ["语 is spoken language; 文 is written language and culture", "They mean exactly the same", "语 is formal; 文 is slang"], a: 0, why: "汉语 is spoken Chinese; 中文 can mean the written language and the culture around it." },
  { u: 2, q: "Which word is the formal way to say \"father\"?", opts: ["父亲", "爸爸", "哥哥"], a: 0, why: "爸爸 is everyday speech; 父亲 is formal or written." },
  { u: 2, q: "Where do giant pandas live in the wild?", opts: ["Mountains of southwest China, mostly Sichuan", "Northern Mongolia", "Southern Vietnam"], a: 0, why: "Wild giant pandas live in the bamboo forests of Sichuan, Shaanxi and Gansu." },
  { u: 2, q: "Where is Cantonese (广东话) mainly spoken?", opts: ["Guangdong and Hong Kong", "Beijing", "Shanghai"], a: 0, why: "Cantonese is spoken in Guangdong, Hong Kong and Macau, and by many overseas communities." },
  { u: 2, q: "Which group ranked first among the traditional four occupations 士农工商?", opts: ["士, scholars", "商, merchants", "工, artisans"], a: 0, why: "The traditional order was scholars, farmers, artisans, then merchants." },
  { u: 3, q: "Why does Chinese New Year fall on a different date each year?", opts: ["It follows the lunar calendar", "It moves with the zodiac animal", "It is set by each city"], a: 0, why: "The traditional calendar is based on the moon, so the date shifts between late January and February." },
  { u: 3, q: "How do you write \"Sunday\"?", opts: ["星期天", "星期七", "星期零"], a: 0, why: "Sunday is 星期天 or 星期日. There's no 星期七." },
  { u: 3, q: "What's the right order for a Chinese date?", opts: ["Year, month, day", "Day, month, year", "Month, day, year"], a: 0, why: "Dates go from biggest unit to smallest: 2026年11月16号." },
  { u: 3, q: "What is a traditional birthday food in China?", opts: ["Long noodles, for a long life", "Dumplings shaped like the zodiac", "Moon cakes"], a: 0, why: "Longevity noodles (长寿面) are eaten uncut; their length stands for long life." },
  { u: 3, q: "Which gift should you avoid giving?", opts: ["A clock", "Fruit", "Tea"], a: 0, why: "送钟 (give a clock) sounds like 送终, attending someone's deathbed." },
  { u: 4, q: "Which regional cuisine is famous for spicy, numbing flavors?", opts: ["Sichuan", "Cantonese", "Shanghai"], a: 0, why: "Sichuan food uses chili peppers and Sichuan peppercorns (麻辣)." },
  { u: 4, q: "What should you avoid doing with chopsticks?", opts: ["Sticking them upright in a bowl of rice", "Resting them on the table", "Using them to share food"], a: 0, why: "Upright chopsticks look like incense at a funeral." },
  { u: 4, q: "At a restaurant with friends, what often happens with the bill?", opts: ["People compete to pay (请客)", "It's always split evenly", "The youngest person pays"], a: 0, why: "Offering to treat (请客) is a sign of friendship, and people often take turns." },
  { u: 4, q: "What does tapping two fingers on the table mean when someone pours you tea?", opts: ["Thank you", "Stop pouring", "I want coffee"], a: 0, why: "The finger tap is a silent thank-you, common in southern China." },
  { u: 4, q: "You say 欢迎光临 when…", opts: ["Staff welcome you into a store or restaurant", "You leave a restaurant", "You pay the bill"], a: 0, why: "Staff greet customers with 欢迎光临, \"welcome, thank you for coming.\"" },
];

// Tone change rules, with examples from the lessons.
BAIZI.SANDHI = [
  { rule: "Two third tones in a row", how: "The first one becomes a second tone.", ex: [["你好", "nǐ hǎo", "ní hǎo"], ["很好", "hěn hǎo", "hén hǎo"]] },
  { rule: "不 (bù) before a fourth tone", how: "不 changes from bù to bú. The book writes the change in pinyin.", ex: [["不是", "bù shì", "bú shì"], ["不错", "bù cuò", "bú cuò"]] },
  { rule: "一 (yī) changes with the next syllable", how: "Counting alone it's yī. Before a 4th or neutral tone it's yí; before 1st, 2nd or 3rd it's yì.", ex: [["一个", "yī ge", "yí ge"], ["一点儿", "yī diǎnr", "yìdiǎnr"], ["一下", "yī xià", "yíxià"]] },
  { rule: "Neutral tone in the middle", how: "In A不A and similar patterns, the middle syllable is often said lightly.", ex: [["是不是", "shì bù shì", "shì bu shì"], ["对不起", "duì bù qǐ", "duìbuqǐ"]] },
];
