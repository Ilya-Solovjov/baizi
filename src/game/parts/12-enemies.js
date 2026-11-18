  // ───────────── Enemies ─────────────
  // moves: [type, value, hits]. Types: atk, block, str, heal, ask (grammar), talk (conversation), curse (adds Noise),
  // weaken (you deal less), tongue (your next cards must be typed from memory), calm (sheds half its Fluster)
  const ENEMIES = {
    tangyuan: { zh: '汤圆', en: 'Tangyuan Slime', hp: [30, 34], art: 'tangyuan', moves: [['atk', 7], ['talk', 8], ['block', 6], ['atk', 8]] },
    chili: { zh: '辣椒怪', en: 'Chili Fiend', hp: [26, 30], art: 'chili', moves: [['atk', 5, 2], ['str', 2], ['ask', 9], ['atk', 8]] },
    chopstick: { zh: '筷子兵', en: 'Chopstick Sentry', hp: [36, 40], art: 'chopstick', moves: [['atk', 10], ['block', 8], ['talk', 10], ['atk', 6, 2]] },
    teapot: { zh: '茶壶精', en: 'Teapot Wraith', hp: [32, 36], art: 'teapot', moves: [['ask', 9], ['atk', 8], ['tongue', 1], ['heal', 8], ['talk', 10]] },
    tanghulu: { zh: '糖葫芦', en: 'Haw Skewer', hp: [46, 50], art: 'tanghulu', act: 2, moves: [['atk', 4, 4], ['block', 10], ['ask', 12], ['atk', 13]] },
    tofu: { zh: '臭豆腐', en: 'Stinky Tofu', hp: [50, 54], art: 'tofu', act: 2, moves: [['weaken', 2], ['atk', 12], ['curse', 2], ['tongue', 2], ['talk', 13]] },
    jianbing: { zh: '煎饼侠', en: 'Jianbing Knight', hp: [52, 56], art: 'jianbing', act: 2, moves: [['block', 15], ['atk', 14], ['talk', 12], ['calm', 0], ['atk', 8, 2]] },
    mooncake: { zh: '月饼魔', en: 'Mooncake Golem', hp: [66, 72], elite: true, art: 'mooncake', moves: [['block', 12], ['atk', 15], ['curse', 2], ['calm', 0], ['ask', 13], ['atk', 8, 2]] },
    lanternbeast: { zh: '灯笼兽', en: 'Lantern Beast', hp: [58, 62], elite: true, art: 'lantern', moves: [['atk', 10], ['tongue', 2], ['talk', 13], ['str', 3], ['atk', 17]] },
    grandma: { zh: '熊猫奶奶', en: 'The Panda Matriarch', hp: [150, 150], boss: true, art: 'grandma', moves: [['talk', 13], ['atk', 11], ['calm', 0], ['ask', 13], ['tongue', 2], ['curse', 2], ['atk', 7, 3], ['heal', 12]] },
    dragon: { zh: '时钟龙', en: 'The Clock Dragon', hp: [165, 165], boss: true, art: 'dragon', moves: [['atk', 9], ['ask', 13], ['tongue', 2], ['atk', 16], ['talk', 14], ['str', 3], ['calm', 0]] },
    chef: { zh: '包包大厨', en: 'The Bun Chef', hp: [180, 180], boss: true, art: 'chef', moves: [['ask', 14], ['atk', 13], ['block', 15], ['atk', 7, 3], ['tongue', 2], ['talk', 15], ['curse', 2], ['str', 3]] },
  };
  const NORMALS = { 1: ['tangyuan', 'chili', 'chopstick', 'teapot'], 2: ['tanghulu', 'tofu', 'jianbing', 'chopstick'] };
  const ELITES = ['mooncake', 'lanternbeast'];

