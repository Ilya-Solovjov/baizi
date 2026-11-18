  // ───────────── Sound + speech ─────────────
  let actx = null;
  function sfx(kind) {
    if (!META.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const N = { hit: [[180, 'square', .05]], big: [[120, 'square', .08], [90, 'square', .1]], block: [[330, 'triangle', .06]], good: [[660, 'sine', .08], [880, 'sine', .08]], bad: [[233, 'triangle', .1], [196, 'triangle', .12]], win: [[523, 'sine', .1], [659, 'sine', .1], [784, 'sine', .1], [1047, 'sine', .16]], card: [[520, 'sine', .04]], combo: [[784, 'sine', .06], [988, 'sine', .06], [1319, 'sine', .1]], boss: [[110, 'sawtooth', .3], [82, 'sawtooth', .4]] }[kind] || [];
      N.forEach(([f, type, d], i) => { const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.08; o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(['hit', 'big', 'boss'].includes(kind) ? 0.05 : 0.09, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.1); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.12); });
    } catch (e) { }
  }
  const tts = { ok: !!window.speechSynthesis, voice: null };
  const pickVoice = () => { try { const v = speechSynthesis.getVoices(); tts.voice = v.find(x => /zh[-_]CN/i.test(x.lang)) || v.find(x => /^(zh|cmn)/i.test(x.lang)) || null; } catch (e) { } };
  if (tts.ok) { pickVoice(); try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { } }
  function speak(t, force) { if (!tts.ok || (!META.voice && !force)) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(t).replace(/[＿［］]/g, '')); u.lang = 'zh-CN'; if (tts.voice) u.voice = tts.voice; u.rate = 0.8; speechSynthesis.speak(u); } catch (e) { } }

