// Vocabulary for Modern Chinese 1A (2nd ed.), Units 1–4.
// Word lists follow the textbook's lesson vocabulary pages.
// Format per line: tier | hanzi | pinyin | part of speech | English
//   tier: L = lesson vocabulary, R = required vocabulary, O = optional vocabulary, N = names
window.BAIZI = window.BAIZI || {};

BAIZI.LESSONS = [
  { id: "1.1", unit: 1, title: "Meeting People", zh: "你好！" },
  { id: "1.2", unit: 1, title: "Age and Nationality", zh: "你多大？你是哪国人？" },
  { id: "2.1", unit: 2, title: "Family and Pets", zh: "家人和宠物" },
  { id: "2.2", unit: 2, title: "Jobs and Languages", zh: "工作和语言" },
  { id: "3.1", unit: 3, title: "Days of the Week and Time", zh: "星期几？几点？" },
  { id: "3.2", unit: 3, title: "Happy Birthday!", zh: "生日快乐！" },
  { id: "4.1", unit: 4, title: "Ordering Food", zh: "点菜" },
  { id: "4.2", unit: 4, title: "How Does It Taste?", zh: "味道怎么样？" },
];

BAIZI.UNITS = [
  { n: 1, zh: "我", en: "Me" },
  { n: 2, zh: "家", en: "Family" },
  { n: 3, zh: "时", en: "Time" },
  { n: 4, zh: "食", en: "Food" },
];

BAIZI.VOCAB_RAW = {
"1.1": `
L|你好|nǐ hǎo|ie|hello
L|你|nǐ|pr|you
L|好|hǎo|adj|good; well; fine
L|吗|ma|p|(question particle)
L|我|wǒ|pr|I; me
L|很|hěn|adv|very
L|呢|ne|p|(particle: "what about…?")
L|也|yě|adv|also
L|谢谢|xièxie|ie|thank you
L|老师|lǎoshī|n|teacher
L|同学们|tóngxuémen|n|classmates
L|同学|tóngxué|n|classmate
L|们|men|p|(plural suffix for people)
L|请问|qǐngwèn|ie|excuse me; may I ask
L|请|qǐng|v|to request; to treat; please
L|问|wèn|v|to ask
L|叫|jiào|v|to call; to be called
L|什么|shénme|qw|what
L|名字|míngzi|n|name
L|他|tā|pr|he; him
L|再见|zàijiàn|ie|goodbye
N|陈大东|Chén Dàdōng|name|Chen Dadong
N|孙玛丽|Sūn Mǎlì|name|Sun Mali
R|学|xué|v|to learn
R|学校|xuéxiào|n|school
R|姓|xìng|v|to be surnamed
R|您|nín|pr|you (polite)
R|她|tā|pr|she; her
R|它|tā|pr|it
R|先生|xiānsheng|n|Mr.; husband; gentleman
R|太太|tàitai|n|Mrs.; wife
R|小姐|xiǎojie|n|Miss; young lady
R|女士|nǚshì|n|Ms.; lady
R|刘|Liú|surname|Liu (surname)
`,
"1.2": `
L|多|duō|adj, qw|many; how (old, much)
L|大|dà|adj|big; old (in age)
L|十九|shíjiǔ|nu|nineteen
L|岁|suì|n, mw|years old; age
L|二十|èrshí|nu|twenty
L|是|shì|v|to be
L|哪|nǎ|qw|which
L|国|guó|n|country
L|人|rén|n|person
L|美国人|Měiguó rén|n|American (person)
L|美国|Měiguó|n|United States
L|不|bù|adv|not; no
L|加拿大人|Jiānádà rén|n|Canadian (person)
L|加拿大|Jiānádà|n|Canada
R|一|yī|nu|one
R|二|èr|nu|two
R|三|sān|nu|three
R|四|sì|nu|four
R|五|wǔ|nu|five
R|六|liù|nu|six
R|七|qī|nu|seven
R|八|bā|nu|eight
R|九|jiǔ|nu|nine
R|十|shí|nu|ten
O|国家|guójiā|n|country; nation
O|非洲|Fēizhōu|n|Africa
O|澳大利亚|Àodàlìyà|n|Australia
O|巴西|Bāxī|n|Brazil
O|英国|Yīngguó|n|Britain; U.K.
O|法国|Fǎguó|n|France
O|德国|Déguó|n|Germany
O|印度|Yìndù|n|India
O|日本|Rìběn|n|Japan
O|韩国|Hánguó|n|Korea
O|墨西哥|Mòxīgē|n|Mexico
O|俄罗斯|Éluósī|n|Russia
O|南非|Nánfēi|n|South Africa
O|西班牙|Xībānyá|n|Spain
O|越南|Yuènán|n|Vietnam
O|意大利|Yìdàlì|n|Italy
`,
"2.1": `
L|这|zhè|pr|this
L|爸爸|bàba|n|dad; father (informal)
L|妈妈|māma|n|mom; mother (informal)
L|和|hé|cj|and
L|哥哥|gēge|n|older brother
L|家|jiā|n|family; home
L|有|yǒu|v|to have; there is
L|几|jǐ|qw|how many (usually under ten)
L|个|ge|mw|(general measure word)
L|姐姐|jiějie|n|older sister
L|妹妹|mèimei|n|younger sister
L|的|de|p|(possessive particle: 's)
L|狗|gǒu|n|dog
L|宠物|chǒngwù|n|pet
L|没|méi|adv|not (used with 有)
L|可是|kěshì|cj|but
L|两|liǎng|nu|two (before a measure word)
L|只|zhī|mw|(measure word for most animals and birds)
L|猫|māo|n|cat
L|喜欢|xǐhuan|av|to like
N|李中平|Lǐ Zhōngpíng|name|Li Zhongping
N|王小美|Wáng Xiǎoměi|name|Wang Xiaomei
R|位|wèi|mw|(polite measure word for people)
R|条|tiáo|mw|(measure word for fish, roads, long thin things)
R|口|kǒu|n, mw|mouth; (measure word for family members)
R|家人|jiārén|n|family members
R|兄弟姐妹|xiōngdì jiěmèi|n|siblings
R|弟弟|dìdi|n|younger brother
R|父亲|fùqin|n|father (formal)
R|母亲|mǔqin|n|mother (formal)
R|女儿|nǚ'ér|n|daughter
R|儿子|érzi|n|son
R|孩子|háizi|n|child; children
O|鸟|niǎo|n|bird
O|鱼|yú|n|fish
`,
"2.2": `
L|男孩子|nánháizi|n|boy
L|男|nán|n|male
L|谁|shéi|qw|who
L|那|nà|pr|that
L|朋友|péngyou|n|friend
L|女孩子|nǚháizi|n|girl
L|女|nǚ|n|female
L|做|zuò|v|to do; to make
L|工作|gōngzuò|n, v|job; work; to work
L|学生|xuésheng|n|student
L|咖啡店|kāfēi diàn|n|coffee shop
L|咖啡|kāfēi|n|coffee
L|店|diàn|n|shop; store
L|服务员|fúwùyuán|n|waiter; server
L|会|huì|av|can; to know how to
L|说|shuō|v|to speak; to say
L|语言|yǔyán|n|language
L|英语|Yīngyǔ|n|English (spoken)
L|法语|Fǎyǔ|n|French (spoken)
L|还|hái|cj|also; in addition
L|一点儿|yìdiǎnr|n|a little; some
L|汉语|Hànyǔ|n|Chinese (spoken)
L|写|xiě|v|to write
L|只|zhǐ|adv|only; just
L|简单|jiǎndān|adj|simple
L|汉字|hànzì|n|Chinese characters
R|商人|shāngrén|n|businessperson
R|大学生|dàxuésheng|n|college student
R|大学|dàxué|n|college; university
R|教授|jiàoshòu|n|professor
R|律师|lǜshī|n|lawyer
O|中文|Zhōngwén|n|Chinese language
O|文|wén|n|written language; culture
O|英文|Yīngwén|n|English (written)
O|法文|Fǎwén|n|French (written)
O|西班牙语|Xībānyáyǔ|n|Spanish (spoken)
O|日语|Rìyǔ|n|Japanese (spoken)
O|普通话|Pǔtōnghuà|n|Mandarin
O|广东话|Guǎngdōnghuà|n|Cantonese
O|上海话|Shànghǎihuà|n|Shanghainese
O|台湾话|Táiwānhuà|n|Taiwanese
`,
"3.1": `
L|星期|xīngqī|n|week
L|足球|zúqiú|n|soccer
L|比赛|bǐsài|n|match; competition
L|去|qù|v|to go
L|看|kàn|v|to look at; to watch; to read
L|星期几|xīngqī jǐ|qph|what day of the week?
L|什么时候|shénme shíhou|qph|when?
L|时候|shíhou|n|time; moment
L|星期三|Xīngqīsān|n|Wednesday
L|晚上|wǎnshang|n|evening; night
L|晚|wǎn|adj|late
L|点钟|diǎnzhōng|n|o'clock
L|点|diǎn|n|o'clock (hour)
L|半|bàn|n|half
L|见|jiàn|v|to meet; to see
L|吧|ba|p|(particle for suggestions: "let's…")
L|现在|xiànzài|n|now
L|还没有|hái méiyǒu|adv|not yet
L|还|hái|adv|still
L|来|lái|v|to come
L|差不多|chàbuduō|adv, adj|almost; about
L|刻|kè|n|quarter of an hour
L|对不起|duìbuqǐ|ie|sorry
L|没关系|méi guānxi|ie|it's OK; it doesn't matter
L|开始|kāishǐ|v, n|to begin; beginning
L|走|zǒu|v|to go; to leave; to walk
N|黄祥安|Huáng Xiáng'ān|name|Huang Xiang'an
R|分|fēn|n|minute
R|秒|miǎo|n|second
R|早上|zǎoshang|n|early morning
R|早|zǎo|adj|early
R|上午|shàngwǔ|n|morning (before noon)
R|中午|zhōngwǔ|n|noon; midday
R|下午|xiàwǔ|n|afternoon
R|小时|xiǎoshí|n|hour
R|钟头|zhōngtóu|n|hour (colloquial)
R|时间|shíjiān|n|time
R|零|líng|nu|zero
O|星期一|Xīngqīyī|n|Monday
O|星期二|Xīngqī'èr|n|Tuesday
O|星期四|Xīngqīsì|n|Thursday
O|星期五|Xīngqīwǔ|n|Friday
O|星期六|Xīngqīliù|n|Saturday
O|星期天|Xīngqītiān|n|Sunday
O|不好意思|bù hǎoyìsi|ie|sorry; excuse me (minor things)
O|没问题|méi wèntí|ie|no problem
O|没事|méi shì|ie|it's nothing; no problem
O|不客气|bú kèqi|ie|you're welcome
O|篮球|lánqiú|n|basketball
O|橄榄球|gǎnlǎnqiú|n|American football; rugby
O|棒球|bàngqiú|n|baseball
`,
"3.2": `
L|生日|shēngrì|n|birthday
L|月|yuè|n|month
L|号|hào|n|day of the month; number
L|今天|jīntiān|n|today
L|今|jīn|n|today; now
L|天|tiān|n|day; sky
L|还是|háishi|cj|or (in questions)
L|明天|míngtiān|n|tomorrow
L|十月|Shíyuè|n|October
L|生日派对|shēngrì pàiduì|n|birthday party
L|派对|pàiduì|n|party
L|生日快乐|shēngrì kuàilè|ie|happy birthday
L|快乐|kuàilè|adj, n|happy; happiness
L|都|dōu|adv|both; all
L|了|le|p|(particle: change of state or completed action)
L|真|zhēn|adv|really; truly
L|高兴|gāoxìng|adj|glad; happy
L|大家|dàjiā|n|everyone
L|吃|chī|v|to eat
L|蛋糕|dàngāo|n|cake
L|送|sòng|v|to give (as a gift)
L|礼物|lǐwù|n|present; gift
L|祝|zhù|v|to wish
R|日|rì|n|day
R|年|nián|n|year
R|昨天|zuótiān|n|yesterday
R|一月|Yīyuè|n|January
R|二月|Èryuè|n|February
R|三月|Sānyuè|n|March
R|四月|Sìyuè|n|April
R|五月|Wǔyuè|n|May
R|六月|Liùyuè|n|June
R|七月|Qīyuè|n|July
R|八月|Bāyuè|n|August
R|九月|Jiǔyuè|n|September
R|十一月|Shíyīyuè|n|November
R|十二月|Shí'èryuè|n|December
`,
"4.1": `
L|欢迎光临|huānyíng guānglín|ie|welcome (to a store or restaurant)
L|欢迎|huānyíng|v|to welcome
L|几位|jǐ wèi|qph|how many (people)?
L|坐|zuò|v|to sit
L|想|xiǎng|av|would like to; to want to
L|喝|hē|v|to drink
L|给|gěi|v|to give
L|杯|bēi|n, mw|cup; (measure word for drinks)
L|茶|chá|n|tea
L|菜单|càidān|n|menu
L|新|xīn|adj|new
L|中国菜|Zhōngguó cài|n|Chinese food
L|中国|Zhōngguó|n|China
L|菜|cài|n|dish; food
L|饺子|jiǎozi|n|dumplings
L|那么|nàme|cj|then; in that case
L|点菜|diǎn cài|v|to order food
L|盘|pán|n, mw|plate; (measure word for plates of food)
L|烧鸡|shāojī|n|roast chicken
L|份|fèn|mw|(measure word for portions of food)
L|青菜|qīngcài|n|green vegetables
L|碗|wǎn|n, mw|bowl; (measure word for bowls)
L|酸辣汤|suānlàtāng|n|hot and sour soup
L|家|jiā|mw|(measure word for restaurants, companies)
L|饭馆|fànguǎn|n|restaurant
L|好吃|hǎochī|adj|tasty (food)
L|饿|è|adj|hungry
N|张安娜|Zhāng Ānnà|name|Zhang Anna
R|吃饭|chī fàn|vo|to eat (a meal)
R|饭|fàn|n|meal; cooked rice
R|做饭|zuò fàn|vo|to cook
R|渴|kě|adj|thirsty
R|水|shuǐ|n|water
O|麻婆豆腐|Mápó dòufu|n|mapo tofu
O|北京烤鸭|Běijīng kǎoyā|n|Peking duck
O|汽水|qìshuǐ|n|soda
O|果汁|guǒzhī|n|fruit juice
O|饮料|yǐnliào|n|beverage; drink
O|瓶|píng|n, mw|bottle; (measure word for bottles)
`,
"4.2": `
L|好喝|hǎohē|adj|tasty (drinks)
L|辣|là|adj|spicy
L|味道|wèidào|n|taste; flavor
L|不错|búcuò|adj|not bad; pretty good
L|错|cuò|adj|wrong
L|怎么样|zěnmeyàng|qw|how is it?; how about…?
L|太|tài|adv|too; extremely
L|咸|xián|adj|salty
L|要|yào|av|to want; will; should
L|叫|jiào|v|to order (food)
L|米饭|mǐfàn|n|cooked rice
L|为什么|wèishénme|qw|why
L|肉|ròu|n|meat
L|因为|yīnwèi|cj|because
L|吃素|chī sù|vo|to be vegetarian
L|用|yòng|v|to use
L|筷子|kuàizi|n|chopsticks
L|刀子|dāozi|n|knife
L|叉子|chāzi|n|fork
L|试|shì|v|to try
L|一下|yíxià|mw|(do something) briefly; a bit
L|教|jiāo|v|to teach
L|哦|ò|p|oh! (I see)
L|啊|a|p|(particle that softens a question)
L|吃饱|chībǎo|rv|to be full (from eating)
L|晚饭|wǎnfàn|n|dinner
L|请客|qǐngkè|vo|to treat (pay for others)
R|早饭|zǎofàn|n|breakfast
R|午饭|wǔfàn|n|lunch
R|甜|tián|adj|sweet
R|苦|kǔ|adj|bitter
R|酸|suān|adj|sour
O|买单|mǎidān|n, vo|the check; "check, please"
O|结帐|jiézhàng|vo|to pay the bill
O|白饭|báifàn|n|white rice
O|水果|shuǐguǒ|n|fruit
O|海鲜|hǎixiān|n|seafood
O|鸡肉|jīròu|n|chicken (meat)
O|猪肉|zhūròu|n|pork
O|牛肉|niúròu|n|beef
`,
};

// The characters each lesson asks you to handwrite (the stroke-order practice pages).
// Each entry: character | pinyin | meaning | word it appears in
BAIZI.WRITE_RAW = {
"1.1": `你|nǐ|you|你好
好|hǎo|good|你好
我|wǒ|I; me|我
很|hěn|very|很好
也|yě|also|也
老|lǎo|old|老师
师|shī|teacher|老师
同|tóng|same|同学
学|xué|to study|同学
们|men|(plural suffix)|同学们
叫|jiào|to be called|叫
名|míng|name|名字
字|zì|character; word|名字
他|tā|he|他
见|jiàn|to see|再见`,
"1.2": `多|duō|many; how|多大
大|dà|big; old|多大
一|yī|one|一
二|èr|two|二
三|sān|three|三
四|sì|four|四
五|wǔ|five|五
六|liù|six|六
七|qī|seven|七
八|bā|eight|八
九|jiǔ|nine|九
十|shí|ten|十
岁|suì|years old|十九岁
是|shì|to be|是
人|rén|person|美国人`,
"2.1": `这|zhè|this|这
爸|bà|dad|爸爸
妈|mā|mom|妈妈
和|hé|and|和
家|jiā|family; home|家
有|yǒu|to have|有
几|jǐ|how many|几
个|gè|(measure word)|一个人
的|de|('s)|我的
宠|chǒng|to pamper|宠物
物|wù|thing|宠物
没|méi|not|没有
可|kě|can|可是
两|liǎng|two|两个
只|zhī|(measure word for animals)|一只猫`,
"2.2": `孩|hái|child|孩子
子|zi|(noun suffix)|孩子
谁|shéi|who|谁
做|zuò|to do|做
作|zuò|to work|工作
言|yán|speech|语言
生|shēng|life; student|学生
员|yuán|member; staff|服务员
会|huì|can|会
中|zhōng|middle; China|中文
英|yīng|English|英语
文|wén|writing; language|中文
还|hái|also|还
点|diǎn|a little; o'clock|一点儿
那|nà|that|那`,
"3.1": `什|shén|(in 什么)|什么
么|me|(in 什么)|什么
星|xīng|star|星期
期|qī|period|星期
时|shí|time|时候
上|shàng|up; on|晚上
钟|zhōng|clock|点钟
半|bàn|half|半
在|zài|at; now|现在
来|lái|to come|来
去|qù|to go|去
对|duì|correct|对不起
起|qǐ|to rise|对不起
开|kāi|to open|开始
始|shǐ|to begin|开始`,
"3.2": `日|rì|day; sun|生日
月|yuè|month; moon|月
今|jīn|now; today|今天
天|tiān|day; sky|今天
明|míng|bright; next|明天
派|pài|(in 派对)|派对
昨|zuó|yesterday|昨天
快|kuài|happy; fast|快乐
乐|lè|happy|快乐
都|dōu|all; both|都
了|le|(particle)|了
吃|chī|to eat|吃
送|sòng|to give (gift)|送
礼|lǐ|gift; courtesy|礼物
祝|zhù|to wish|祝`,
"4.1": `国|guó|country|中国
杯|bēi|cup|杯
饿|è|hungry|饿
光|guāng|light|欢迎光临
位|wèi|(polite measure word)|几位
坐|zuò|to sit|坐
想|xiǎng|would like|想
喝|hē|to drink|喝
给|gěi|to give|给
新|xīn|new|新
份|fèn|portion|一份
青|qīng|green|青菜
菜|cài|dish|中国菜
饭|fàn|meal; rice|饭馆
馆|guǎn|building; hall|饭馆`,
"4.2": `请|qǐng|please; to treat|请客
晚|wǎn|evening|晚饭
不|bù|not|不
错|cuò|wrong|不错
咸|xián|salty|咸
味|wèi|taste|味道
道|dào|way|味道
怎|zěn|how|怎么样
太|tài|too|太
要|yào|to want|要
因|yīn|because|因为
为|wèi|for|因为
肉|ròu|meat|肉
素|sù|vegetarian|吃素
用|yòng|to use|用`,
};
