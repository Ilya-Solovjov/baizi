// Language partner practice quests (one per practice sheet).
// lines  — what you'll hear and say: who = ask (questions to ask/answer), say (things you say), kit (keep-it-going words)
// build  — sentences to assemble from word tiles
// mine   — your own answers: parts are text or {s: slot} (choices) / {s: slot, text: true} (type it yourself)
// roles  — role plays: p = what your partner says (null = you start), cue = what to do, a = model answer ("@id" = your own answer)
// flow   — quick questions on keeping the conversation going
window.BAIZI = window.BAIZI || {};
(function () {
  const NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const cn = n => n <= 10 ? NUM[n] : n < 20 ? '十' + NUM[n - 10] : NUM[Math.floor(n / 10)] + '十' + (n % 10 ? NUM[n % 10] : '');
  const months = Array.from({ length: 12 }, (_, i) => [cn(i + 1) + '月', ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i]]);
  const days = Array.from({ length: 31 }, (_, i) => [cn(i + 1) + '号', 'the ' + (i + 1) + (i % 10 === 0 && i !== 10 ? 'st' : i % 10 === 1 && i !== 11 ? 'nd' : i % 10 === 2 && i !== 12 ? 'rd' : 'th')]);
  const ages = [18, 19, 20, 21, 22, 23, 25].map(n => [cn(n), String(n)]);

  const KIT = [
    { zh: '对。', en: 'Right. / Yeah.', who: 'kit' },
    { zh: '是吗？', en: 'Is that so?', who: 'kit' },
    { zh: '真的吗？', en: 'Really?', who: 'kit' },
    { zh: '那……', en: 'So… / Then… (to switch topics)', who: 'kit' },
    { zh: '……怎么说？', en: 'How do you say…?', who: 'kit' },
  ];
  const RUBRIC = [
    ['Task completion', 'I can do every task on the sheet without reading notes.'],
    ['Language application', 'I use this unit’s words and patterns, not English word order.'],
    ['Cultural relevance', 'I have one cultural point ready to bring up.'],
    ['Communication flow', 'I react (对, 是吗？, 真的吗？) and switch topics with 那.'],
    ['Corrections', 'When my partner corrects me, I repeat the sentence the right way.'],
  ];

  BAIZI.PARTNER = [
  { id: 'p1', n: 1, title: 'Meeting your partner', zh: '认识你', due: '2026-10-11', units: '1.1–1.2',
    lines: [
      { zh: '你好！', en: 'Hello!', who: 'say' },
      { zh: '你叫什么名字？', en: 'What’s your name?', who: 'ask' },
      { zh: '很高兴认识你。', en: 'Nice to meet you.', who: 'say' },
      { zh: '你今天怎么样？', en: 'How are you doing today?', who: 'ask' },
      { zh: '你多大？', en: 'How old are you?', who: 'ask' },
      { zh: '你是哪国人？', en: 'What country are you from?', who: 'ask' },
      { zh: '你是哪里人？', en: 'Where’s your hometown?', who: 'ask' },
      { zh: '谢谢！再见！', en: 'Thanks! Goodbye!', who: 'say' },
    ].concat(KIT),
    build: [
      { w: ['你', '叫', '什么', '名字'], en: 'What’s your name?' },
      { w: ['很', '高兴', '认识', '你'], en: 'Nice to meet you.' },
      { w: ['你', '是', '哪国人'], en: 'What country are you from?' },
      { w: ['你', '今天', '怎么样'], en: 'How are you today?' },
    ],
    mine: [
      { id: 'name', q: '你叫什么名字？', en: 'Your name', parts: ['我叫', { s: 'name', text: true, ph: 'your name' }, '。'] },
      { id: 'mood', q: '你今天怎么样？', en: 'How you are', parts: [{ s: 'mood' }, '，谢谢。你呢？'], slots: { mood: [['我很好', 'I’m good'], ['我很高兴', 'I’m happy'], ['我有一点儿饿', 'I’m a little hungry']] } },
      { id: 'age', q: '你多大？', en: 'Your age', parts: ['我', { s: 'age' }, '岁。'], slots: { age: ages } },
      { id: 'nat', q: '你是哪国人？', en: 'Your nationality', parts: ['我是', { s: 'nat' }, '人。'], slots: { nat: [['美国', 'American'], ['加拿大', 'Canadian'], ['中国', 'Chinese'], ['墨西哥', 'Mexican'], ['英国', 'British'], ['韩国', 'Korean'], ['日本', 'Japanese'], ['印度', 'Indian'], ['越南', 'Vietnamese']] } },
    ],
    roles: [{ name: 'First meeting', turns: [
      { p: '你好！', cue: 'Greet your partner.', a: '你好！' },
      { p: '你叫什么名字？', cue: 'Give your name.', a: '@name' },
      { p: '很高兴认识你。', cue: 'Say you’re glad to meet them too.', a: '我也很高兴认识你。' },
      { p: '你今天怎么样？', cue: 'Say how you are, then ask back.', a: '@mood' },
      { p: '你多大？', cue: 'Give your age.', a: '@age' },
      { p: '你是哪国人？', cue: 'Give your nationality.', a: '@nat' },
      { p: '我是中国人。', cue: 'React, then ask where their hometown is.', a: '是吗？你是哪里人？' },
    ] }],
    flow: [
      { q: 'Your partner says 我是中国人。 What keeps the conversation going?', opts: ['真的吗？你是哪里人？', '谢谢。', '再见！'], a: 0, why: 'React, then ask a follow-up question.' },
      { q: 'You don’t know the word for “engineer.” What do you say?', opts: ['“engineer” 怎么说？', '你叫什么名字？', '对。'], a: 0, why: 'Ask 怎么说 instead of switching to English.' },
      { q: 'Your partner corrects your tone on 你好. What do you do?', opts: ['Say it again the corrected way', 'Explain in English', 'Skip to the next question'], a: 0, why: 'You’re graded on practicing the correct form after a correction.' },
    ] },

  { id: 'p2', n: 2, title: 'Family, pets, languages and jobs', zh: '家人和工作', due: '2026-10-25', units: '2.1–2.2',
    lines: [
      { zh: '你今天怎么样？', en: 'How are you doing today?', who: 'ask' },
      { zh: '你家有几口人？', en: 'How many people are in your family?', who: 'ask' },
      { zh: '你有兄弟姐妹吗？', en: 'Do you have siblings?', who: 'ask' },
      { zh: '你有宠物吗？', en: 'Do you have pets?', who: 'ask' },
      { zh: '几岁？', en: 'How old (are they)?', who: 'ask' },
      { zh: '叫什么名字？', en: 'What’s (their) name?', who: 'ask' },
      { zh: '你会说什么语言？', en: 'What languages can you speak?', who: 'ask' },
      { zh: '你做什么工作？', en: 'What do you do for work?', who: 'ask' },
    ].concat(KIT),
    build: [
      { w: ['你', '有', '兄弟姐妹', '吗'], en: 'Do you have siblings?' },
      { w: ['你', '会', '说', '什么', '语言'], en: 'What languages can you speak?' },
      { w: ['我', '家', '有', '四', '口', '人'], en: 'There are four people in my family.' },
      { w: ['我', '有', '一只', '狗'], en: 'I have a dog.' },
      { w: ['你', '做', '什么', '工作'], en: 'What do you do for work?' },
    ],
    mine: [
      { id: 'family', q: '你家有几口人？', en: 'Family size', parts: ['我家有', { s: 'n' }, '口人。'], slots: { n: [['三', 'three'], ['四', 'four'], ['五', 'five'], ['六', 'six'], ['两', 'two'], ['七', 'seven']] } },
      { id: 'sib', q: '你有兄弟姐妹吗？', en: 'Your siblings', parts: [{ s: 'sib' }, '。'], slots: { sib: [['我有一个哥哥', 'I have an older brother'], ['我有一个姐姐', 'I have an older sister'], ['我有一个弟弟', 'I have a younger brother'], ['我有一个妹妹', 'I have a younger sister'], ['我有两个姐姐', 'I have two older sisters'], ['我没有兄弟姐妹', 'I don’t have siblings']] } },
      { id: 'pet', q: '你有宠物吗？', en: 'Your pets', parts: [{ s: 'pet' }, '。'], slots: { pet: [['我有一只狗', 'I have a dog'], ['我有一只猫', 'I have a cat'], ['我有两只猫', 'I have two cats'], ['我有三条鱼', 'I have three fish'], ['我没有宠物', 'I don’t have pets']] } },
      { id: 'lang', q: '你会说什么语言？', en: 'Languages', parts: [{ s: 'lang' }, '。'], slots: { lang: [['我会说英语，还会说一点儿汉语', 'English, and a little Chinese'], ['我会说英语和西班牙语，还会说一点儿汉语', 'English and Spanish, and a little Chinese'], ['我会说英语和法语', 'English and French'], ['我会说英语和日语', 'English and Japanese']] } },
      { id: 'job', q: '你做什么工作？', en: 'Your job', parts: [{ s: 'job' }, '。'], slots: { job: [['我是大学生', 'I’m a college student'], ['我是学生，也在咖啡店工作', 'I’m a student and also work at a coffee shop'], ['我是学生，也是服务员', 'I’m a student and also a server']] } },
      { id: 'friend', q: '你的好朋友呢？', en: 'Your best friend', parts: ['我的好朋友叫', { s: 'fname', text: true, ph: 'friend’s name' }, '。', { s: 'who' }, '是', { s: 'fnat' }, '人，会说', { s: 'flang' }, '。'],
        slots: { who: [['她', 'she'], ['他', 'he']], fnat: [['美国', 'American'], ['中国', 'Chinese'], ['加拿大', 'Canadian'], ['墨西哥', 'Mexican'], ['韩国', 'Korean'], ['印度', 'Indian']], flang: [['英语', 'English'], ['英语和汉语', 'English and Chinese'], ['英语和西班牙语', 'English and Spanish'], ['法语', 'French']] } },
    ],
    roles: [{ name: 'Family, pets and work', turns: [
      { p: '你今天怎么样？', cue: 'Say how you are, then ask back.', a: '我很好，谢谢。你呢？' },
      { p: '你家有几口人？', cue: 'Say how many people are in your family.', a: '@family' },
      { p: '你有兄弟姐妹吗？', cue: 'Talk about your siblings.', a: '@sib' },
      { p: '你有宠物吗？', cue: 'Talk about your pets.', a: '@pet' },
      { p: '你会说什么语言？', cue: 'Say what languages you speak.', a: '@lang' },
      { p: '你做什么工作？', cue: 'Say what you do.', a: '@job' },
      { p: '那，你的好朋友呢？', cue: 'Introduce your best friend.', a: '@friend' },
    ] }],
    flow: [
      { q: 'You’re done talking about pets and want to switch to jobs. Which word helps?', opts: ['那……', '吗', '也'], a: 0, why: '那 (“so, then”) moves to a related topic.' },
      { q: 'Your partner says 我有三只猫！ What’s a good reaction?', opts: ['真的吗？叫什么名字？', '我叫……', '再见。'], a: 0, why: 'React with surprise and ask a follow-up.' },
      { q: 'How do you ask how old your partner’s younger sister is?', opts: ['你妹妹几岁？', '你妹妹几个？', '你妹妹是几？'], a: 0, why: '几岁 asks a child’s age.' },
    ] },

  { id: 'p3', n: 3, title: 'Time, dates and birthdays', zh: '时间和生日', due: '2026-11-08', units: '3.1–3.2',
    lines: [
      { zh: '你几点起床？', en: 'What time do you get up?', who: 'ask' },
      { zh: '你几点喝咖啡？', en: 'What time do you drink coffee?', who: 'ask' },
      { zh: '你几点吃午饭？', en: 'What time do you eat lunch?', who: 'ask' },
      { zh: '你几点睡觉？', en: 'What time do you go to sleep?', who: 'ask' },
      { zh: '你周末喜欢做什么？', en: 'What do you like to do on weekends?', who: 'ask' },
      { zh: '你喜欢看足球比赛吗？', en: 'Do you like watching soccer games?', who: 'ask' },
      { zh: '你今年多大？', en: 'How old are you this year?', who: 'ask' },
      { zh: '你的生日是几月几号？', en: 'When is your birthday?', who: 'ask' },
      { zh: '你怎么过生日？', en: 'How do you celebrate your birthday?', who: 'ask' },
      { zh: '谁送了你礼物？', en: 'Who gave you a gift?', who: 'ask' },
      { zh: '你最喜欢的生日礼物是什么？', en: 'What’s your favorite birthday gift?', who: 'ask' },
      { zh: '生日快乐！', en: 'Happy birthday!', who: 'say' },
    ].concat(KIT),
    build: [
      { w: ['你', '几点', '起床'], en: 'What time do you get up?' },
      { w: ['你的', '生日', '是', '几月', '几号'], en: 'When is your birthday?' },
      { w: ['谁', '送了', '你', '礼物'], en: 'Who gave you a gift?' },
      { w: ['我们', '去', '看', '足球比赛', '吧'], en: 'Let’s go watch a soccer game.' },
    ],
    mine: [
      { id: 'up', q: '你几点起床？', en: 'Wake-up time', parts: ['我', { s: 't' }, '起床。'], slots: { t: [['早上六点', '6 a.m.'], ['早上七点', '7 a.m.'], ['早上七点半', '7:30 a.m.'], ['早上八点', '8 a.m.'], ['早上九点', '9 a.m.'], ['上午十点', '10 a.m.']] } },
      { id: 'lunch', q: '你几点吃午饭？', en: 'Lunch time', parts: ['我', { s: 't' }, '吃午饭。'], slots: { t: [['中午十二点', '12 noon'], ['中午十二点半', '12:30'], ['下午一点', '1 p.m.'], ['下午两点', '2 p.m.']] } },
      { id: 'sleep', q: '你几点睡觉？', en: 'Bedtime', parts: ['我', { s: 't' }, '睡觉。'], slots: { t: [['晚上十点', '10 p.m.'], ['晚上十一点', '11 p.m.'], ['晚上十二点', '12 midnight'], ['差不多十二点', 'around 12']] } },
      { id: 'weekend', q: '你周末喜欢做什么？', en: 'Weekends', parts: ['我周末喜欢', { s: 'act' }, '。'], slots: { act: [['看足球比赛', 'watch soccer games'], ['和朋友吃饭', 'eat with friends'], ['去咖啡店', 'go to a coffee shop'], ['在家做饭', 'cook at home'], ['看篮球比赛', 'watch basketball games']] } },
      { id: 'age', q: '你今年多大？', en: 'Age this year', parts: ['我今年', { s: 'age' }, '岁了。'], slots: { age: ages } },
      { id: 'bday', q: '你的生日是几月几号？', en: 'Birthday', parts: ['我的生日是', { s: 'm' }, { s: 'd' }, '。'], slots: { m: months, d: days } },
      { id: 'party', q: '上个生日，你有没有生日派对？', en: 'Last birthday party', parts: ['上个生日，我', { s: 'p' }, '生日派对。'], slots: { p: [['有', 'had a'], ['没有', 'didn’t have a']] } },
      { id: 'gift', q: '你最喜欢的生日礼物是什么？', en: 'Favorite gift', parts: ['我最喜欢的生日礼物是', { s: 'g' }, '。'], slots: { g: [['我妈妈送的蛋糕', 'the cake my mom gave me'], ['我朋友送的礼物', 'the gift from my friend'], ['一只猫', 'a cat'], ['一只狗', 'a dog']] } },
    ],
    roles: [{ name: 'Days and birthdays', turns: [
      { p: '你几点起床？', cue: 'Say when you get up.', a: '@up' },
      { p: '你几点睡觉？', cue: 'Say when you go to bed.', a: '@sleep' },
      { p: '你周末喜欢做什么？', cue: 'Say what you like to do on weekends.', a: '@weekend' },
      { p: '你的生日是几月几号？', cue: 'Give your birthday.', a: '@bday' },
      { p: '你今年多大？', cue: 'Give your age this year.', a: '@age' },
      { p: '上个生日，你有没有生日派对？', cue: 'Say whether you had a party.', a: '@party' },
      { p: '你最喜欢的生日礼物是什么？', cue: 'Name your favorite gift.', a: '@gift' },
      { p: '十八岁生日的时候，我姐姐送了我一只猫！', cue: 'React with surprise and ask the cat’s name.', a: '真的吗？猫叫什么名字？' },
    ] }],
    flow: [
      { q: 'Your partner says 今天是我的生日！ What do you say?', opts: ['生日快乐！', '对不起。', '没关系。'], a: 0, why: '生日快乐 = happy birthday.' },
      { q: 'How do you say 7:30 in the morning?', opts: ['早上七点半', '七点半早上', '晚上七点半'], a: 0, why: 'Time words go big to small: part of day, then the hour.' },
      { q: 'Which question asks for a date?', opts: ['几月几号？', '几点？', '星期几？'], a: 0, why: '几月几号 = which month, which day.' },
    ] },

  { id: 'p4', n: 4, title: 'Ordering food', zh: '点菜', due: '2026-11-22', units: '4.1–4.2',
    lines: [
      { zh: '你喜欢吃哪国菜？', en: 'What country’s food do you like?', who: 'ask' },
      { zh: '你喜欢吃辣的菜吗？', en: 'Do you like spicy food?', who: 'ask' },
      { zh: '你喜不喜欢吃四川菜？', en: 'Do you like Sichuan food?', who: 'ask' },
      { zh: '你会用筷子吗？', en: 'Can you use chopsticks?', who: 'ask' },
      { zh: '这个周末你去饭馆吃饭了吗？', en: 'Did you eat at a restaurant this weekend?', who: 'ask' },
      { zh: '你点了什么菜？', en: 'What dishes did you order?', who: 'ask' },
      { zh: '欢迎光临，请问几位？', en: 'Welcome! How many people?', who: 'say' },
      { zh: '这是我们的菜单。', en: 'Here’s our menu.', who: 'say' },
      { zh: '你们什么菜最好吃？', en: 'Which of your dishes is best?', who: 'say' },
      { zh: '还有吗？', en: 'Anything else?', who: 'say' },
      { zh: '没有了。', en: 'That’s all.', who: 'say' },
      { zh: '请稍等。', en: 'One moment, please.', who: 'say' },
      { zh: '酸、甜、苦、辣、咸', en: 'sour, sweet, bitter, spicy, salty', who: 'say' },
    ].concat(KIT),
    build: [
      { w: ['请', '给', '我', '一杯', '茶'], en: 'Please give me a cup of tea.' },
      { w: ['你们', '什么', '菜', '最', '好吃'], en: 'Which of your dishes is best?' },
      { w: ['我', '想', '要', '一碗', '酸辣汤'], en: 'I’d like a bowl of hot and sour soup.' },
      { w: ['你', '会', '用', '筷子', '吗'], en: 'Can you use chopsticks?' },
      { w: ['这个', '菜', '太', '辣', '了'], en: 'This dish is too spicy.' },
    ],
    mine: [
      { id: 'cuisine', q: '你喜欢吃哪国菜？', en: 'Favorite cuisine', parts: ['我喜欢吃', { s: 'c' }, '。'], slots: { c: [['中国菜', 'Chinese food'], ['美国菜', 'American food'], ['日本菜', 'Japanese food'], ['墨西哥菜', 'Mexican food'], ['四川菜', 'Sichuan food']] } },
      { id: 'spicy', q: '你喜欢吃辣的菜吗？', en: 'Spicy food', parts: [{ s: 'sp' }, '。'], slots: { sp: [['我很喜欢吃辣的', 'I love spicy food'], ['我不喜欢吃辣的，太辣了', 'I don’t like spicy food, it’s too hot'], ['我喜欢吃一点儿辣的', 'I like it a little spicy']] } },
      { id: 'sichuan', q: '你喜不喜欢吃四川菜？', en: 'Sichuan food', parts: [{ s: 'x' }, '。'], slots: { x: [['我很喜欢吃四川菜，因为我喜欢吃辣的', 'I love it, because I like spicy food'], ['我不喜欢吃四川菜，因为太辣了', 'I don’t, because it’s too spicy'], ['我还没吃四川菜，可是我想试一下', 'I haven’t had it yet, but I want to try it']] } },
      { id: 'chop', q: '你会用筷子吗？', en: 'Chopsticks', parts: [{ s: 'u' }, '。'], slots: { u: [['我会用筷子', 'I can use chopsticks'], ['我会用筷子，也会用刀叉', 'I can use chopsticks and a knife and fork'], ['我不会用筷子，我用刀叉', 'I can’t; I use a knife and fork']] } },
      { id: 'went', q: '这个周末你去饭馆吃饭了吗？', en: 'This weekend', parts: ['这个周末我去饭馆吃饭了，我点了', { s: 'd' }, '。'], slots: { d: [['饺子', 'dumplings'], ['烧鸡', 'roast chicken'], ['酸辣汤', 'hot and sour soup'], ['麻婆豆腐', 'mapo tofu'], ['北京烤鸭', 'Peking duck'], ['青菜', 'green vegetables']] } },
      { id: 'taste', q: '味道怎么样？', en: 'How it tasted', parts: [{ s: 't' }, '！'], slots: { t: [['太好吃了', 'So delicious'], ['味道不错', 'Pretty good'], ['有一点儿咸，可是很好吃', 'A little salty, but really good'], ['太辣了', 'Way too spicy']] } },
      { id: 'drink', q: '您想喝什么？', en: 'Your drink', parts: ['给我一杯', { s: 'dr' }, '。'], slots: { dr: [['茶', 'tea'], ['水', 'water'], ['咖啡', 'coffee'], ['汽水', 'soda'], ['果汁', 'juice']] } },
      { id: 'order', q: '请问您想点什么菜？', en: 'Your order', parts: ['请给我一份', { s: 'a' }, '，一盘', { s: 'b' }, '，和一碗', { s: 'c' }, '。'],
        slots: { a: [['烧鸡', 'roast chicken'], ['北京烤鸭', 'Peking duck'], ['饺子', 'dumplings']], b: [['青菜', 'green vegetables'], ['饺子', 'dumplings'], ['麻婆豆腐', 'mapo tofu']], c: [['酸辣汤', 'hot and sour soup'], ['米饭', 'rice']] } },
    ],
    roles: [
      { name: 'Talking about food', turns: [
        { p: '你今天怎么样？', cue: 'Say how you are, then ask back.', a: '我很好，谢谢。你呢？' },
        { p: '你喜欢吃哪国菜？', cue: 'Say what food you like.', a: '@cuisine' },
        { p: '你喜欢吃辣的菜吗？', cue: 'Say whether you like spicy food.', a: '@spicy' },
        { p: '你喜不喜欢吃四川菜？', cue: 'Talk about Sichuan food, with a reason.', a: '@sichuan' },
        { p: '你会用筷子吗？', cue: 'Say whether you can use chopsticks.', a: '@chop' },
        { p: '这个周末你去饭馆吃饭了吗？', cue: 'Say what you ordered.', a: '@went' },
        { p: '我不吃肉。', cue: 'React and ask why.', a: '是吗？为什么？' },
      ] },
      { name: 'You’re the customer', turns: [
        { p: '欢迎光临，请问几位？', cue: 'Say there are two of you.', a: '两位。' },
        { p: '好的，这边请。您想喝什么？', cue: 'Order a drink.', a: '@drink' },
        { p: '这是我们的菜单，请问您想点什么菜？', cue: 'Ask which dishes are the best.', a: '你们什么菜最好吃？' },
        { p: '我们的烧鸡、饺子和酸辣汤都很好吃。你喜欢吃辣的吗？', cue: 'Say whether you like spicy food.', a: '@spicy' },
        { p: '好的，您想点什么？', cue: 'Order three dishes with measure words.', a: '@order' },
        { p: '还有吗？', cue: 'Say that’s all.', a: '没有了，谢谢。' },
        { p: '菜来了！味道怎么样？', cue: 'Say how it tastes.', a: '@taste' },
      ] },
      { name: 'You’re the waiter', turns: [
        { p: null, cue: 'Customers walk in. Welcome them and ask how many.', a: '欢迎光临，请问几位？' },
        { p: '两位。', cue: 'Show them to a table and ask what they’d like to drink.', a: '好的，这边请。您想喝什么？' },
        { p: '给我一杯茶。', cue: 'Hand over the menu and ask what they’d like to order.', a: '这是我们的菜单，请问您想点什么菜？' },
        { p: '你们什么菜最好吃？', cue: 'Recommend three dishes and ask if they like spicy food.', a: '我们的烧鸡、饺子和酸辣汤都很好吃。你喜欢吃辣的吗？' },
        { p: '喜欢！请给我一份烧鸡和一碗酸辣汤。', cue: 'Repeat the order and ask if there’s anything else.', a: '好，一份烧鸡和一碗酸辣汤，还有吗？' },
        { p: '没有了。', cue: 'Ask them to wait a moment.', a: '好的，请稍等。' },
      ] },
    ],
    flow: [
      { q: 'Which measure word goes with 酸辣汤 (soup)?', opts: ['一碗', '一杯', '一只'], a: 0, why: '碗 = bowl.' },
      { q: 'Your partner says 我不吃肉。 What’s a good follow-up?', opts: ['为什么？', '几位？', '太好吃了！'], a: 0, why: 'Ask why with 为什么, then they can answer with 因为.' },
      { q: 'Which cultural point fits a food conversation?', opts: ['Don’t stand chopsticks upright in rice', 'Tip 20% in China', 'Eat noodles with a knife'], a: 0, why: 'Upright chopsticks look like funeral incense. Bringing up culture counts in the grade.' },
    ] },
  ];
  BAIZI.PARTNER_RUBRIC = RUBRIC;
})();
