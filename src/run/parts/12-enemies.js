  // ───────────── Enemies ─────────────
  // moves: [type, value, hits]. Types: atk, block, str, heal, ask (grammar), talk (conversation), curse (adds Noise), weaken (you deal less)
  const ENEMIES = {
    tangyuan: { zh: '汤圆', en: 'Tangyuan Slime', hp: [26, 30], art: 'tangyuan', moves: [['atk', 6], ['talk', 8], ['block', 6], ['atk', 7]] },
    chili: { zh: '辣椒怪', en: 'Chili Fiend', hp: [22, 26], art: 'chili', moves: [['atk', 4, 2], ['str', 2], ['ask', 8], ['atk', 7]] },
    chopstick: { zh: '筷子兵', en: 'Chopstick Sentry', hp: [32, 36], art: 'chopstick', moves: [['atk', 9], ['block', 7], ['talk', 9], ['atk', 5, 2]] },
    teapot: { zh: '茶壶精', en: 'Teapot Wraith', hp: [28, 32], art: 'teapot', moves: [['ask', 8], ['atk', 7], ['heal', 7], ['talk', 9]] },
    tanghulu: { zh: '糖葫芦', en: 'Haw Skewer', hp: [40, 44], art: 'tanghulu', act: 2, moves: [['atk', 3, 4], ['block', 9], ['ask', 11], ['atk', 12]] },
    tofu: { zh: '臭豆腐', en: 'Stinky Tofu', hp: [44, 48], art: 'tofu', act: 2, moves: [['weaken', 2], ['atk', 11], ['curse', 2], ['talk', 12]] },
    jianbing: { zh: '煎饼侠', en: 'Jianbing Knight', hp: [46, 50], art: 'jianbing', act: 2, moves: [['block', 14], ['atk', 13], ['talk', 11], ['atk', 7, 2]] },
    mooncake: { zh: '月饼魔', en: 'Mooncake Golem', hp: [54, 60], elite: true, art: 'mooncake', moves: [['block', 10], ['atk', 13], ['curse', 2], ['ask', 12], ['atk', 7, 2]] },
    lanternbeast: { zh: '灯笼兽', en: 'Lantern Beast', hp: [48, 52], elite: true, art: 'lantern', moves: [['atk', 8], ['talk', 12], ['str', 3], ['atk', 15]] },
    grandma: { zh: '熊猫奶奶', en: 'The Panda Matriarch', hp: [135, 135], boss: true, art: 'grandma', moves: [['talk', 12], ['atk', 10], ['heal', 10], ['ask', 12], ['curse', 2], ['atk', 6, 3]] },
    dragon: { zh: '时钟龙', en: 'The Clock Dragon', hp: [150, 150], boss: true, art: 'dragon', moves: [['atk', 8], ['ask', 12], ['curse', 2], ['atk', 15], ['talk', 13], ['str', 3]] },
    chef: { zh: '包包大厨', en: 'The Bun Chef', hp: [165, 165], boss: true, art: 'chef', moves: [['ask', 13], ['atk', 12], ['block', 14], ['atk', 6, 3], ['talk', 14], ['curse', 2], ['str', 3]] },
  };
  const NORMALS = { 1: ['tangyuan', 'chili', 'chopstick', 'teapot'], 2: ['tanghulu', 'tofu', 'jianbing', 'chopstick'] };
  const ELITES = ['mooncake', 'lanternbeast'];

