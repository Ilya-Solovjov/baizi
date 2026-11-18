  // ───────────── Pixel sprites ─────────────
  /* Every character in Night Market Run, drawn with PX. */
  (function () {
    const { S } = PX;
    const R = {
      cloak: ['#0d1715', '#182825', '#243c37', '#35554d', '#4d766b'],
      red: ['#2c0907', '#5a120e', '#8e1d15', '#c2321f', '#e5573a'],
      wood: ['#1f130b', '#3b2414', '#5c3a20', '#7d5430'],
      lamp: ['#6e1a10', '#b8301c', '#e2562f', '#f59152', '#ffd9a0', '#fff4dc'],
      gold: ['#241806', '#4d3812', '#7d602a', '#b8924c', '#e3c27c', '#f6e2a8'],
      chili: ['#250705', '#521109', '#8a1c12', '#c02e1c', '#e8502f', '#ff8a5a'],
      leaf: ['#0b1d0d', '#173a19', '#245a26', '#3b8236', '#6cb052'],
      cream: ['#5a4c3a', '#8c7a60', '#bba886', '#e0d1b2', '#f5ead2'],
      jade: ['#08170f', '#11301f', '#1d4a33', '#2d6a4b', '#46916a', '#79c08f'],
      ink: ['#120b08'],
      rice: ['#5e5348', '#968878', '#c9bcab', '#ebe2d4', '#fbf7ef'],
      bamboo: ['#2a1a0c', '#4f3417', '#7a5527', '#a87c3e', '#d1a861'],
      celadon: ['#0e1f1c', '#1c3a34', '#2e5a50', '#4a8072', '#76ab99', '#a8d0bf'],
      haw: ['#2a0406', '#5c0a10', '#931520', '#c92433', '#f04a4f', '#ff9a8a'],
      fried: ['#2a1606', '#55300f', '#835019', '#b07a2c', '#d6a64e', '#f0cf86'],
      crepe: ['#3e2a10', '#74521f', '#a87c33', '#d4a855', '#ecd08a', '#f8e8bc'],
      egg: ['#5a3c06', '#9a6a0c', '#d39c18', '#f2c53a', '#fde587'],
      steel: ['#1a1d22', '#353b44', '#5a6370', '#8a94a2', '#c4ccd6'],
      mooncake: ['#2a1606', '#5a3410', '#8c5520', '#bb7c34', '#dca253', '#f2c97e'],
      yolk: ['#7a3200', '#c25a06', '#f08c1c', '#ffbe4a', '#ffe7a0'],
      fur: ['#3a3f45', '#7a8088', '#b9bec4', '#e3e6e8', '#f8f9f9'],
      furdark: ['#06070a', '#121418', '#1f2228', '#2e323a'],
      silk: ['#2a0608', '#5c0c12', '#8e1620', '#bf2530', '#e04a4a'],
      bun: ['#5c4b3a', '#96826c', '#c8b59c', '#e8dcc6', '#faf3e6'],
    };
    const OUTC = '#1a0503';
    // two glowing eyes with optional angry brows: (x, y) is the left eye's left pixel, gap = pixels between eyes
    const eyes = (x, y, gap, opts = {}) => {
      const c = opts.color || ['#ffd27a', '#fff3c4', '#c9761e'], w = opts.w || 3, out = [];
      for (const ex of [x, x + w + gap]) { for (let i = 0; i < w; i++) out.push([ex + i, y, i === 1 ? c[1] : c[0]]); out.push([ex + 1, y + 1, c[2]]); }
      if (opts.brow) { const b = opts.brow; out.push([x - 1, y - 2, b], [x, y - 2, b], [x + 1, y - 1, b], [x + 2, y - 1, b], [x + w + gap + w, y - 2, b], [x + w + gap + w - 1, y - 2, b], [x + w + gap, y - 1, b], [x + w + gap + 1, y - 1, b]); }
      return out;
    };
    const row = (x0, x1, y, c) => { const o = []; for (let x = x0; x <= x1; x++) o.push([x, y, c]); return o; };
    const P = {};
    // ── Player: a hooded wanderer with a lantern on a pole. 48×48
    P.you = () => {
      const hood = S.or(S.ell(21, 13.5, 8.5, 9), S.poly([[17, 7], [18, 1.5], [24, 6]]), S.poly([[13, 16], [29, 16], [31, 30], [36, 44.5], [6, 44.5], [11, 30]]));
      const sash = S.and(hood, S.poly([[8, 23], [34, 21], [34, 25], [8, 27]]));
      const tail = S.poly([[26, 24], [30, 24], [32, 33], [29, 34]]);
      const face = S.ell(21, 15.5, 5.2, 6);
      const sleeve = S.ell(31, 28, 4, 3, -20);
      return PX.render({
        size: 48,
        layers: [
          { shape: S.line(32, 30, 41, 8, 1.6), ramp: R.wood },
          { shape: hood, ramp: R.cloak, center: [19, 22] },
          { shape: sash, ramp: R.red, center: [20, 22] },
          { shape: tail, ramp: R.red },
          { shape: sleeve, ramp: R.cloak },
          { shape: face, ramp: ['#040302'], mode: 'flat', noInner: true },
          { shape: S.rect(40, 9, 41, 11), ramp: ['#3b2a14'], mode: 'flat' },
          { shape: S.ell(41, 17, 4.2, 5.4), ramp: R.lamp, mode: 'glow', center: [41, 17], noInner: true },
          { shape: S.rect(37.5, 11, 44.5, 12), ramp: R.gold, level: 2, mode: 'flat' },
          { shape: S.rect(37.5, 22, 44.5, 23), ramp: R.gold, level: 2, mode: 'flat' },
          { shape: S.line(41, 24, 41, 28, 1), ramp: R.red, mode: 'flat', level: 3 },
        ],
        pre: [
          // cloak folds
          ...[[17, 30], [16, 33], [16, 36], [15, 39], [15, 42], [25, 30], [26, 34], [27, 38], [27, 42]].map(([x, y]) => [x, y, R.cloak[1]]),
          ...[[14, 9], [15, 8], [16, 7], [17, 5], [18, 3]].map(([x, y]) => [x, y, R.cloak[4]]),
          ...[8, 12, 17, 23, 28, 33].map(x => [x, 44, null]),
          // lantern ribs
          ...[13, 14, 15, 16, 17, 18, 19, 20].flatMap(y => [[39, y, '#9c2a18'], [43, y, '#9c2a18']]),
        ],
        details: [[19, 16, '#f6dfa8'], [23, 16, '#f6dfa8'], [19, 15, '#7a6a48'], [23, 15, '#7a6a48'], [32, 30, '#c9a483'], [33, 30, '#a7836a']],
        glows: [{ x: 41, y: 17, r: 13, color: 'rgba(232,100,58,A)', a: 0.32 }],
        shadow: { cx: 21, cy: 45, rx: 14 },
      });
    };
    // ── Chili Fiend: a curled chili with a leafy crown, claws and a jagged grin. 48×48
    P.chili = () => {
      const body = S.tube([[22, 13], [17, 22], [16, 31], [22, 39], [31, 42], [38, 39], [40, 34]], t => 10.5 - 8.5 * Math.pow(t, 1.15));
      const crown = S.or(S.ell(15, 10, 6, 2.6, -18), S.ell(29, 10, 6, 2.6, 18), S.ell(22, 8.5, 4.5, 3), S.ell(18, 12, 3, 2, 30), S.ell(26, 12, 3, 2, -30));
      const stem = S.tube([[22, 8], [24, 4], [28, 2], [31, 3]], t => 1.7 - 0.6 * t);
      const armL = S.tube([[13, 25], [8, 27], [6, 24]], t => 1.3);
      const armR = S.tube([[30, 26], [35, 24], [36, 21]], t => 1.3);
      return PX.render({
        size: 48,
        layers: [
          { shape: armL, ramp: R.chili, light: [-0.6, -0.8] },
          { shape: armR, ramp: R.chili },
          { shape: body, ramp: R.chili, center: [20, 24] },
          { shape: stem, ramp: R.leaf },
          { shape: crown, ramp: R.leaf, center: [21, 9] },
        ],
        pre: [
          // gloss streak
          [15, 20, '#ff9a6a'], [14, 22, '#ff9a6a'], [14, 24, '#ffb488'], [14, 26, '#ff9a6a'], [15, 28, '#e8502f'],
          // seeds/dimples
          [25, 33, R.chili[2]], [29, 37, R.chili[2]], [21, 35, R.chili[2]], [34, 39, R.chili[2]],
          // claws
          [5, 23, '#e8dcc4'], [6, 22, '#e8dcc4'], [37, 20, '#e8dcc4'], [36, 19, '#e8dcc4'],
        ],
        details: [
          // brows
          [16, 16, '#1a0503'], [17, 16, '#1a0503'], [18, 17, '#1a0503'], [19, 17, '#1a0503'], [27, 16, '#1a0503'], [26, 16, '#1a0503'], [25, 17, '#1a0503'], [24, 17, '#1a0503'],
          // eyes
          [17, 18, '#ffd27a'], [18, 18, '#fff3c4'], [19, 18, '#ffd27a'], [18, 19, '#c9761e'],
          [24, 18, '#ffd27a'], [25, 18, '#fff3c4'], [26, 18, '#ffd27a'], [25, 19, '#c9761e'],
          // mouth with teeth
          ...[17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map(x => [x, 23, '#1a0503']),
          ...[18, 19, 20, 21, 22, 23, 24, 25].map(x => [x, 24, '#1a0503']),
          [17, 22, '#1a0503'], [26, 22, '#1a0503'],
          [18, 23, '#efe2c8'], [20, 23, '#efe2c8'], [22, 23, '#efe2c8'], [24, 23, '#efe2c8'], [19, 24, '#d9cbb0'], [21, 24, '#d9cbb0'], [23, 24, '#d9cbb0'],
        ],
        glows: [{ x: 22, y: 18, r: 8, color: 'rgba(255,170,80,A)', a: 0.12 }],
        shadow: { cx: 28, cy: 46, rx: 13 },
      });
    };
    // ── Clock Dragon: a jade dragon coiled around a brass clock. 64×64
    P.dragon = () => {
      const cx = 30, cy = 35;
      const arc = []; for (let a = 215; a >= -25; a -= 12) arc.push([cx + 21 * Math.cos(a * Math.PI / 180), cy - 21 * Math.sin(a * Math.PI / 180)]);
      const rr = t => 1.6 + 2.8 * Math.pow(t, 0.7);
      const coil = S.tube(arc, rr);
      const head = S.or(S.ell(51, 17, 7, 5.8, -10), S.ell(58, 19.5, 5, 3.4, 10), S.ell(47, 21, 4, 4));
      const jaw = S.ell(56, 23.5, 4.5, 1.6, 12);
      const hornA = S.tube([[49, 14], [46, 8], [47, 4]], t => 1.3 - 0.5 * t);
      const hornB = S.tube([[53, 13], [53, 7], [56, 4]], t => 1.3 - 0.5 * t);
      const whisk = S.or(S.tube([[60, 22], [63, 27], [61, 31]], t => 0.6), S.tube([[59, 18], [63, 15], [63, 11]], t => 0.6));
      const spikes = []; arc.forEach(([x, y], i) => { if (i % 2 || i > arc.length - 3) return; const t = i / (arc.length - 1), nx = (x - cx) / 21, ny = (y - cy) / 21, r0 = rr(t); spikes.push(S.tube([[x + nx * (r0 - 1), y + ny * (r0 - 1)], [x + nx * (r0 + 2.8), y + ny * (r0 + 2.8)]], u => 1.4 - 1.1 * u)); });
      const tailFlame = S.or(S.ell(10, 49, 3, 2, 40), S.ell(7, 51, 2.4, 1.4, 20), S.ell(9, 53, 2, 1.2, -10));
      const claws = S.or(S.ell(15, 22, 2.6, 2, 30), S.ell(44, 40, 2.4, 2, -20));
      const ticks = []; for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; ticks.push([Math.round(cx + 11 * Math.sin(a) - 0.5), Math.round(cy - 11 * Math.cos(a) - 0.5), '#4a3a28']); }
      return PX.render({
        size: 64,
        layers: [
          { shape: S.or(...spikes), ramp: R.red, noInner: true },
          { shape: coil, ramp: R.jade, center: [cx - 4, cy - 6] },
          { shape: tailFlame, ramp: R.lamp, mode: 'glow', center: [8, 51] },
          { shape: S.circ(cx, cy, 16), ramp: R.gold, center: [cx, cy] },
          { shape: S.circ(cx, cy, 13), ramp: R.cream, center: [cx - 2, cy - 2], dither: 0.6 },
          { shape: claws, ramp: R.jade },
          { shape: S.line(cx, cy, cx, cy - 9, 1.4), ramp: ['#2a1a10'], mode: 'flat', noInner: true },
          { shape: S.line(cx, cy, cx + 7, cy + 4, 1.4), ramp: ['#2a1a10'], mode: 'flat', noInner: true },
          { shape: hornA, ramp: R.gold }, { shape: hornB, ramp: R.gold },
          { shape: head, ramp: R.jade, center: [53, 17] },
          { shape: jaw, ramp: R.jade, center: [55, 22] },
          { shape: whisk, ramp: R.gold, mode: 'flat', level: 3, noOutline: true, noInner: true },
        ],
        pre: [
          ...ticks,
          // coil scale bands
          ...arc.filter((_, i) => i % 2 === 0).map(([x, y]) => [Math.round(x - 0.5), Math.round(y - 0.5), R.jade[2]]),
          // belly highlight along the top of the coil
          ...arc.slice(4, 16).map(([x, y]) => [Math.round(x - 0.5), Math.round(y - 3.5), R.jade[5]]),
          [cx - 1, cy - 1, '#a3241a'], [cx, cy - 1, '#a3241a'], [cx - 1, cy, '#a3241a'], [cx, cy, '#d9412e'],
          // nostril, mouth line, teeth
          [60, 19, '#06100b'], ...[52, 53, 54, 55, 56, 57, 58, 59].map(x => [x, 22, '#06100b']), [54, 23, '#efe2c8'], [57, 23, '#efe2c8'],
        ],
        details: [
          // ember eye with brow
          [50, 15, '#06100b'], [51, 15, '#06100b'], [52, 16, '#06100b'], [53, 16, '#06100b'],
          [51, 17, '#ff5a36'], [52, 17, '#ffd27a'], [53, 17, '#ff5a36'], [52, 18, '#b8301c'],
        ],
        glows: [{ x: 52, y: 17, r: 6, color: 'rgba(255,90,54,A)', a: 0.3 }, { x: 8, y: 51, r: 7, color: 'rgba(232,100,58,A)', a: 0.3 }],
        shadow: { cx: 32, cy: 61, rx: 20 },
      });
    };
  
    // ── Tangyuan Slime: a glossy rice ball leaking black sesame. 48
    P.tangyuan = () => {
      const body = S.or(S.ell(24, 27, 15, 13), S.ell(24, 36, 17, 6.5), S.ell(13, 41, 2, 2.6), S.ell(35, 42, 1.6, 2.2));
      const drip = S.or(S.ell(13, 40, 2.4, 3.4), S.ell(35, 41, 2, 3));
      const crack = S.tube([[29, 15], [31, 19], [29, 22], [32, 26]], t => 1.4 - 0.6 * t);
      const ooze = S.tube([[32, 26], [34, 31], [33, 36], [35, 40]], t => 1.8 - 0.8 * t);
      return PX.render({ size: 48, layers: [
          { shape: body, ramp: R.rice, center: [21, 25] },
          { shape: S.or(crack, ooze), ramp: ['#08080a', '#16151a', '#26242c', '#3a3742'], noInner: true },
        ],
        pre: [[15, 21, '#ffffff'], [16, 20, '#ffffff'], [17, 20, '#fbf7ef'], [14, 23, '#fbf7ef'], [36, 41, '#3a3742']],
        details: [...eyes(16, 27, 5, { brow: OUTC, color: ['#ff6a3a', '#ffd27a', '#8a1c12'] }), ...row(20, 25, 32, OUTC), [21, 33, '#8a1c12'], [24, 33, '#8a1c12']],
        shadow: { cx: 24, cy: 45, rx: 16 } });
    };
    // ── Chopstick Sentry: a bamboo steamer soldier with chopstick spears. 48
    P.chopstick = () => {
      const basket = S.rect(11, 20, 37, 40), lid = S.or(S.ell(24, 17, 15, 5), S.rect(9, 16, 39, 19)), knob = S.ell(24, 10, 3, 2.5);
      const stickA = S.line(6, 44, 40, 2, 2.2), stickB = S.line(42, 44, 10, 3, 2.2);
      return PX.render({ size: 48, layers: [
          { shape: stickA, ramp: R.bamboo, light: [-0.3, -0.95] }, { shape: stickB, ramp: R.bamboo, light: [-0.3, -0.95] },
          { shape: basket, ramp: R.bamboo, center: [20, 28] }, { shape: lid, ramp: R.bamboo, center: [20, 14] }, { shape: knob, ramp: R.bamboo },
          { shape: S.or(S.line(39.5, 4, 41, 1.5, 2), S.line(10.5, 4.5, 9, 2, 2)), ramp: R.red, mode: 'flat', level: 3 },
        ],
        pre: [...row(11, 37, 26, R.bamboo[1]), ...row(11, 37, 33, R.bamboo[1]), ...row(12, 36, 27, R.bamboo[4]), ...row(12, 36, 34, R.bamboo[4]),
          ...[14, 19, 24, 29, 34].flatMap(x => [[x, 21, R.bamboo[1]], [x, 28, R.bamboo[1]], [x, 35, R.bamboo[1]]]), ...row(10, 38, 20, '#120a04')],
        details: [...row(14, 34, 21, '#060403'), ...row(14, 34, 22, '#060403'), ...eyes(17, 21, 7, { color: ['#ff5a36', '#ffd27a', '#7a1f14'] }).filter(p => p[1] === 21)],
        glows: [{ x: 24, y: 21, r: 8, color: 'rgba(255,90,54,A)', a: 0.18 }], shadow: { cx: 24, cy: 45, rx: 15 } });
    };
    // ── Teapot Wraith: a celadon teapot trailing ghostly steam. 48
    P.teapot = () => {
      const pot = S.ell(23, 30, 15, 11), lid = S.or(S.ell(23, 19, 9, 3), S.ell(23, 15, 2.5, 2)), spout = S.tube([[10, 31], [5, 26], [3, 20]], t => 2.6 - 1.1 * t);
      const handle = S.and(S.ring(39, 29, 4.5, 7), S.not(S.rect(30, 20, 36, 40)));
      const steam = S.tube([[3, 17], [6, 12], [3, 7], [7, 2]], t => 2.2 - 1.6 * t);
      return PX.render({ size: 48, layers: [
          { shape: handle, ramp: R.celadon }, { shape: spout, ramp: R.celadon }, { shape: pot, ramp: R.celadon, center: [20, 27] }, { shape: lid, ramp: R.celadon, center: [22, 16] },
          { shape: steam, ramp: ['#3a4a48', '#5d6f6c', '#8a9c98', '#c3d2ce'], noOutline: true, noInner: true, dither: 1.2 },
        ],
        pre: [...row(10, 36, 24, R.celadon[1]), ...row(9, 37, 36, R.celadon[2]), ...[13, 33].map(x => [x, 30, R.celadon[5]]), [14, 26, R.celadon[5]], [15, 25, R.celadon[5]], [16, 25, R.celadon[5]]],
        details: [...eyes(16, 29, 6, { brow: '#06100e', color: ['#9cf0d0', '#ffffff', '#2e7a62'] }), ...row(20, 25, 34, '#06100e'), [20, 33, '#06100e'], [25, 33, '#06100e']],
        glows: [{ x: 23, y: 30, r: 10, color: 'rgba(156,240,208,A)', a: 0.1 }], shadow: { cx: 24, cy: 44, rx: 15 } });
    };
    // ── Haw Skewer: four candied hawthorns on a stick. 48
    P.tanghulu = () => {
      const balls = [[24, 10, 6], [23, 21, 6.5], [25, 32, 7.5], [24, 42, 5]];
      return PX.render({ size: 48, layers: [
          { shape: S.line(24, 1, 24, 47, 2), ramp: R.bamboo, mode: 'flat', level: 3 },
          ...balls.map(([x, y, r]) => ({ shape: S.circ(x, y, r), ramp: R.haw, center: [x - 1, y - 1] })),
        ],
        pre: balls.flatMap(([x, y, r]) => [[x - Math.round(r * 0.5), y - Math.round(r * 0.5), '#ffffff'], [x - Math.round(r * 0.5) + 1, y - Math.round(r * 0.5), '#ffd0c4'], [x + 1, y + Math.round(r) - 1, '#f6e2a8']]).concat([[30, 26, '#f6e2a8'], [30, 27, '#f6e2a8'], [17, 15, '#f6e2a8']]),
        details: [...eyes(19, 32, 3, { brow: OUTC }), ...row(22, 27, 36, OUTC), [23, 37, '#efe2c8'], [26, 37, '#efe2c8']],
        shadow: { cx: 24, cy: 47, rx: 8 } });
    };
    // ── Stinky Tofu: a fried tofu block wreathed in green fumes. 48
    P.tofu = () => {
      const block = S.poly([[9, 20], [37, 18], [40, 41], [8, 43]]), top = S.poly([[9, 20], [37, 18], [33, 14], [12, 15]]);
      const pickle = S.or(S.ell(18, 15, 4, 1.5, -10), S.ell(26, 14, 4, 1.6, 15), S.ell(31, 16, 3, 1.2, -20));
      const fumeA = S.tube([[12, 12], [9, 7], [12, 3]], t => 1.6 - t), fumeB = S.tube([[34, 11], [38, 6], [35, 1]], t => 1.6 - t), fumeC = S.tube([[22, 10], [24, 6], [21, 2]], t => 1.3 - 0.8 * t);
      return PX.render({ size: 48, layers: [
          { shape: block, ramp: R.fried, center: [18, 26] }, { shape: top, ramp: R.fried, level: 4, mode: 'flat' }, { shape: pickle, ramp: R.leaf },
          { shape: S.or(fumeA, fumeB, fumeC), ramp: ['#1f3a10', '#3a6a1c', '#6aa034', '#a6d45a'], noOutline: true, noInner: true, dither: 1.3 },
        ],
        pre: [[13, 24, R.fried[2]], [20, 28, R.fried[2]], [30, 23, R.fried[2]], [34, 33, R.fried[2]], [14, 37, R.fried[2]], [27, 38, R.fried[2]], [24, 23, R.fried[5]], [11, 30, R.fried[5]], ...row(10, 37, 19, R.fried[2])],
        details: [...eyes(15, 27, 7, { brow: OUTC, color: ['#c6ff7a', '#f4ffd8', '#3a6a1c'] }), ...row(18, 28, 34, OUTC), [18, 33, OUTC], [28, 33, OUTC], [21, 35, '#6aa034'], [22, 36, '#6aa034']],
        glows: [{ x: 24, y: 8, r: 14, color: 'rgba(120,190,60,A)', a: 0.12 }], shadow: { cx: 24, cy: 45, rx: 16 } });
    };
    // ── Jianbing Knight: a folded crepe with a spatula sword and a griddle shield. 48
    P.jianbing = () => {
      const crepe = S.poly([[12, 12], [34, 10], [38, 42], [10, 43]]), fold = S.poly([[12, 12], [34, 10], [30, 22], [16, 23]]);
      const sword = S.or(S.line(39, 34, 45, 6, 1.8), S.rect(41, 3, 46, 9)), hilt = S.line(36, 33, 42, 35, 1.8);
      const shield = S.circ(9, 31, 8), rim = S.ring(9, 31, 6.5, 8);
      return PX.render({ size: 48, layers: [
          { shape: crepe, ramp: R.crepe, center: [20, 24] }, { shape: fold, ramp: R.egg, center: [20, 15] },
          { shape: sword, ramp: R.steel, light: [-0.8, -0.6] }, { shape: hilt, ramp: R.wood },
          { shape: shield, ramp: R.ink.concat(['#1d1a18', '#2c2825', '#3e3934']), center: [7, 29] }, { shape: rim, ramp: R.steel },
        ],
        pre: [[18, 15, '#3b8236'], [24, 13, '#3b8236'], [29, 17, '#3b8236'], [21, 19, '#3b8236'], [15, 29, R.crepe[1]], [26, 34, R.crepe[1]], [31, 28, R.crepe[1]], [20, 39, R.crepe[1]], [33, 38, R.crepe[1]], [7, 27, '#5a534c'], [6, 28, '#5a534c']],
        details: [...eyes(17, 26, 6, { brow: OUTC }), ...row(20, 26, 31, OUTC)],
        shadow: { cx: 24, cy: 45, rx: 17 } });
    };
    // ── Mooncake Golem (elite): a stone-hard mooncake split open on a glowing yolk. 56
    P.mooncake = () => {
      const scallop = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; scallop.push(S.circ(28 + Math.cos(a) * 19, 26 + Math.sin(a) * 19, 4.6)); }
      const cake = S.or(S.circ(28, 26, 19), ...scallop);
      const crack = S.poly([[30, 10], [26, 19], [31, 24], [25, 33], [29, 44], [34, 33], [30, 25], [35, 18]]);
      const armL = S.tube([[9, 30], [4, 38], [6, 46]], t => 3.8 - 0.8 * t), armR = S.tube([[47, 30], [52, 38], [50, 46]], t => 3.8 - 0.8 * t);
      const fistL = S.circ(6, 47, 4), fistR = S.circ(50, 47, 4);
      const legs = S.or(S.rect(17, 44, 23, 52), S.rect(33, 44, 39, 52));
      return PX.render({ size: 56, layers: [
          { shape: legs, ramp: R.mooncake }, { shape: S.or(armL, fistL), ramp: R.mooncake }, { shape: S.or(armR, fistR), ramp: R.mooncake },
          { shape: cake, ramp: R.mooncake, center: [25, 22] }, { shape: S.ring(28, 26, 13, 14.2), ramp: R.mooncake, mode: 'flat', level: 1, noInner: true },
          { shape: crack, ramp: R.yolk, mode: 'glow', center: [30, 26], noInner: true },
        ],
        pre: [[20, 20, R.mooncake[5]], [21, 19, R.mooncake[5]], [19, 22, R.mooncake[4]], ...[[18, 30], [22, 34], [37, 30], [38, 22], [20, 25]].map(([x, y]) => [x, y, R.mooncake[1]])],
        details: [...eyes(19, 23, 2, { brow: '#1a0d03', color: ['#ffbe4a', '#fff4c8', '#c25a06'] }).filter(p => p[0] < 26), ...eyes(35, 23, 2, { color: ['#ffbe4a', '#fff4c8', '#c25a06'] }).filter(p => p[0] < 39)],
        glows: [{ x: 30, y: 27, r: 16, color: 'rgba(240,140,28,A)', a: 0.3 }], shadow: { cx: 28, cy: 53, rx: 20 } });
    };
    // ── Lantern Beast (elite): a red paper lantern with horns and a burning maw. 56
    P.lanternbeast = () => {
      const body = S.ell(28, 28, 20, 17), capT = S.rect(19, 9, 37, 12), capB = S.rect(19, 44, 37, 47);
      const horns = S.or(S.tube([[18, 13], [12, 7], [13, 1]], t => 2 - 1.4 * t), S.tube([[38, 13], [44, 7], [43, 1]], t => 2 - 1.4 * t));
      const maw = S.poly([[14, 30], [42, 30], [38, 39], [18, 39]]);
      const tassel = S.or(S.rect(26, 48, 30, 50), S.poly([[25, 50], [31, 50], [33, 55], [23, 55]]));
      const teeth = []; for (let x = 16; x <= 40; x += 4) { teeth.push([x, 30, '#f2e6cc'], [x + 1, 30, '#f2e6cc'], [x + 1, 31, '#f2e6cc']); }
      for (let x = 19; x <= 37; x += 4) teeth.push([x, 38, '#f2e6cc'], [x, 37, '#f2e6cc']);
      return PX.render({ size: 56, layers: [
          { shape: horns, ramp: R.gold }, { shape: body, ramp: R.silk, center: [24, 23] }, { shape: S.or(capT, capB), ramp: R.gold },
          { shape: maw, ramp: R.lamp, mode: 'glow', center: [28, 36], noInner: true }, { shape: tassel, ramp: R.red },
        ],
        pre: [...[14, 21, 28, 35, 42].flatMap(x => { const o = []; for (let y = 13; y <= 43; y++) { const dx = x - 28, w = Math.round(dx * Math.sqrt(Math.max(0, 1 - ((y - 28) / 17) ** 2))); const px = 28 + w; if (y < 30 || y > 39) o.push([px, y, R.silk[1]]); } return o; }), ...teeth],
        details: eyes(19, 21, 11, { brow: '#1a0503', color: ['#ffe28a', '#ffffff', '#c25a06'] }),
        glows: [{ x: 28, y: 34, r: 20, color: 'rgba(232,100,58,A)', a: 0.35 }], shadow: { cx: 28, cy: 55, rx: 14 } });
    };
    // ── The Panda Matriarch (boss): a panda in a red shawl with round spectacles and a bamboo cane. 64
    P.grandma = () => {
      const head = S.ell(30, 20, 14, 12), ears = S.or(S.circ(18, 9, 5.5), S.circ(42, 9, 5.5));
      const body = S.ell(30, 44, 18, 16), shawl = S.and(S.ell(30, 44, 18.5, 16.5), S.poly([[8, 30], [52, 30], [46, 48], [30, 54], [14, 48]]));
      const patches = S.or(S.ell(23, 21, 5, 4, 25), S.ell(37, 21, 5, 4, -25));
      const bunHair = S.circ(30, 6, 4.5), pin = S.line(23, 4, 38, 8, 1.4);
      const cane = S.or(S.line(54, 22, 54, 62, 2.2), S.tube([[54, 22], [56, 18], [59, 19]], t => 1.2));
      const paw = S.circ(51, 40, 4);
      const glasses = S.or(S.ring(23, 21, 3.6, 5), S.ring(37, 21, 3.6, 5), S.line(28, 20, 32, 20, 1));
      return PX.render({ size: 64, layers: [
          { shape: cane, ramp: R.leaf, light: [-0.8, -0.6] }, { shape: ears, ramp: R.furdark }, { shape: body, ramp: R.furdark, center: [28, 40] },
          { shape: shawl, ramp: R.silk, center: [26, 38] }, { shape: paw, ramp: R.furdark }, { shape: head, ramp: R.fur, center: [27, 17] }, { shape: bunHair, ramp: R.fur },
          { shape: patches, ramp: R.furdark, noInner: true }, { shape: pin, ramp: R.gold, mode: 'flat', level: 3 }, { shape: glasses, ramp: R.gold, mode: 'flat', level: 4, noInner: true },
        ],
        pre: [...[[54, 30], [54, 41], [54, 52]].map(([x, y]) => [x, y, '#173a19']), ...[[24, 40], [30, 44], [36, 40], [27, 49], [33, 49]].map(([x, y]) => [x, y, '#e3c27c']), [30, 26, '#06070a'], [29, 26, '#06070a'], [31, 26, '#06070a'], [30, 27, '#06070a'], [28, 29, '#2e323a'], [29, 30, '#2e323a'], [31, 30, '#2e323a'], [32, 29, '#2e323a']],
        details: [[22, 21, '#ff5a36'], [23, 21, '#ffd27a'], [36, 21, '#ff5a36'], [37, 21, '#ffd27a'], [21, 19, '#3a3f45'], [38, 19, '#3a3f45']],
        glows: [{ x: 23, y: 21, r: 4, color: 'rgba(255,90,54,A)', a: 0.3 }, { x: 37, y: 21, r: 4, color: 'rgba(255,90,54,A)', a: 0.3 }], shadow: { cx: 31, cy: 61, rx: 20 } });
    };
    // ── The Bun Chef (boss): a huge steamed bun in a chef's hat, cleaver raised. 64
    P.chef = () => {
      const bun = S.or(S.ell(30, 42, 22, 16), S.ell(30, 33, 15, 10)), pleat = S.ell(30, 26, 5, 3);
      const hat = S.or(S.rect(20, 14, 40, 22), S.circ(22, 11, 5.5), S.circ(30, 8, 6.5), S.circ(38, 11, 5.5));
      const cleaver = S.or(S.poly([[48, 6], [61, 4], [62, 17], [50, 19]]), S.line(52, 19, 50, 32, 2.6));
      const arm = S.tube([[44, 38], [50, 33], [51, 28]], t => 3);
      const steam = S.or(S.tube([[10, 26], [7, 20], [10, 14]], t => 1.4 - 0.8 * t), S.tube([[14, 20], [13, 15], [16, 10]], t => 1.2 - 0.8 * t));
      const pleats = []; for (const [x0, y0] of [[30, 26], [30, 26]]) for (const a of [200, 230, 260, 290, 320, 350]) { const r = a * Math.PI / 180; pleats.push(S.line(x0 + Math.cos(r) * 4, y0 - Math.sin(r) * 2, x0 + Math.cos(r) * 13, y0 - Math.sin(r) * 5 + 6, 1)); }
      return PX.render({ size: 64, layers: [
          { shape: S.line(52, 19, 50, 32, 2.6), ramp: R.wood }, { shape: S.poly([[48, 6], [61, 4], [62, 17], [50, 19]]), ramp: R.steel, light: [-0.7, -0.7] },
          { shape: bun, ramp: R.bun, center: [26, 36] }, { shape: arm, ramp: R.bun }, { shape: pleat, ramp: R.bun, mode: 'flat', level: 2 },
          { shape: hat, ramp: R.rice, center: [28, 9] },
          { shape: steam, ramp: ['#4a4440', '#7a726a', '#b0a89c', '#ded6c8'], noOutline: true, noInner: true, dither: 1.2 },
        ],
        pre: [...row(20, 40, 20, R.rice[1]), ...row(21, 39, 21, R.rice[2]), [58, 7, '#ffffff'], [59, 8, '#e3e8ee'], ...row(14, 46, 50, R.bun[1]).filter((_, i) => i % 3), [17, 34, R.bun[4]], [18, 33, R.bun[4]], [19, 32, R.bun[4]],
          ...[[22, 29], [25, 30], [35, 30], [38, 29], [20, 31], [40, 31]].map(([x, y]) => [x, y, R.bun[1]])],
        details: [...eyes(21, 38, 9, { brow: '#2a1a0c', color: ['#ff5a36', '#ffd27a', '#7a1f14'], w: 4 }), ...row(24, 36, 45, '#2a1a0c'), [24, 44, '#2a1a0c'], [36, 44, '#2a1a0c'], [27, 46, '#2a1a0c'], [33, 46, '#2a1a0c']],
        shadow: { cx: 30, cy: 61, rx: 22 } });
    };
    window.SPRITES = P;
  })();
