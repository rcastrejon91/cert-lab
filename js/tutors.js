/* AI tutor personalities: pure SVG avatars (animated with CSS), greetings,
   personality prompts and TTS voice settings. The Worker keeps a matching
   copy of the personality prompts (worker/ai-proxy.js) — keep them in sync. */
(function () {
  var uid = 0;
  function eyes(fill, y, dx, rx, ry) {
    return '<g class="av-eyes"><ellipse cx="' + (50 - dx) + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"/><ellipse cx="' + (50 + dx) + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"/>' +
      '<circle cx="' + (50 - dx + 1.2) + '" cy="' + (y - 1.6) + '" r="1.1" fill="#fff"/><circle cx="' + (50 + dx + 1.2) + '" cy="' + (y - 1.6) + '" r="1.1" fill="#fff"/></g>';
  }
  var AVATARS = {
    lyra: function (id) {
      return '<defs><radialGradient id="' + id + '" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#cbbcff"/><stop offset="1" stop-color="#7c6cf0"/></radialGradient></defs>' +
        '<g class="av-halo"><circle cx="50" cy="52" r="46" fill="none" stroke="#c4b5fd" stroke-opacity=".35" stroke-dasharray="2 6" stroke-width="2"/></g>' +
        '<g class="av-body"><path d="M50 8 L60.5 37 L92 38.5 L67 58 L76 89 L50 71 L24 89 L33 58 L8 38.5 L39.5 37 Z" fill="url(#' + id + ')" stroke="#f1edff" stroke-width="2.5" stroke-linejoin="round"/>' +
        eyes("#2a1f66", 51, 8, 3.4, 4.4) +
        '<circle cx="37" cy="59" r="3.2" fill="#ff9ad5" opacity=".55"/><circle cx="63" cy="59" r="3.2" fill="#ff9ad5" opacity=".55"/>' +
        '<path class="av-mouth" d="M44.5 60 Q50 65.5 55.5 60" stroke="#2a1f66" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>' +
        '<g class="av-sparkles" fill="#fff"><path d="M86 14 l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><path d="M14 74 l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"/></g>';
    },
    nova: function (id) {
      var rays = "", n = 12;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2, a1 = a - 0.16, a2 = a + 0.16;
        rays += "M" + (50 + 30 * Math.cos(a1)).toFixed(1) + " " + (52 + 30 * Math.sin(a1)).toFixed(1) + " L" + (50 + 46 * Math.cos(a)).toFixed(1) + " " + (52 + 46 * Math.sin(a)).toFixed(1) + " L" + (50 + 30 * Math.cos(a2)).toFixed(1) + " " + (52 + 30 * Math.sin(a2)).toFixed(1) + "Z ";
      }
      return '<defs><radialGradient id="' + id + '" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#ffb347"/><stop offset="1" stop-color="#ff4f9a"/></radialGradient></defs>' +
        '<g class="av-rays"><path d="' + rays + '" fill="#ffc35a"/></g>' +
        '<g class="av-body"><circle cx="50" cy="52" r="32" fill="url(#' + id + ')" stroke="#fff1d6" stroke-width="2.5"/>' +
        '<path d="M37 40 q5 -5 10 -1 M53 39 q5 -4 10 1" stroke="#5a1835" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        eyes("#5a1835", 48, 8.5, 3.6, 4.4) +
        '<path class="av-mouth" d="M39 58 Q50 72 61 58 Z" fill="#5a1835"/><path d="M44 63 Q50 67 56 63" stroke="#ff7aa8" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>';
    },
    atlas: function (id) {
      return '<defs><radialGradient id="' + id + '" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#dbeafe"/><stop offset=".5" stop-color="#60a5fa"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient></defs>' +
        '<g class="av-ring-back"><ellipse cx="50" cy="56" rx="47" ry="11" fill="none" stroke="#93c5fd" stroke-width="3.5" stroke-opacity=".6" transform="rotate(-14 50 56)"/></g>' +
        '<g class="av-body"><circle cx="50" cy="50" r="31" fill="url(#' + id + ')" stroke="#e0ecff" stroke-width="2.5"/>' +
        '<rect x="30" y="41" width="40" height="15" rx="7.5" fill="#0b1b45" opacity=".85"/>' +
        '<path d="M34 37 L46 40 M66 37 L54 40" stroke="#0b1b45" stroke-width="3.2" stroke-linecap="round"/>' +
        '<g class="av-eyes"><rect x="37" y="46" width="8" height="4.5" rx="2" fill="#7dd3fc"/><rect x="55" y="46" width="8" height="4.5" rx="2" fill="#7dd3fc"/></g>' +
        '<path class="av-mouth" d="M42 66 L58 66" stroke="#0b1b45" stroke-width="3" stroke-linecap="round"/></g>' +
        '<path class="av-ring-front" d="M4.4 67.4 A47 11 -14 0 0 95.6 44.6" fill="none" stroke="#bfdbfe" stroke-width="3.5"/>';
    },
    echo: function (id) {
      return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#10b981"/></linearGradient></defs>' +
        '<g class="av-body"><line x1="50" y1="20" x2="50" y2="9" stroke="#d1fae5" stroke-width="3"/><circle class="av-bulb" cx="50" cy="8" r="4.5" fill="#fef08a"/>' +
        '<rect x="13" y="42" width="8" height="18" rx="4" fill="#34d399"/><rect x="79" y="42" width="8" height="18" rx="4" fill="#34d399"/>' +
        '<rect x="19" y="20" width="62" height="58" rx="18" fill="url(#' + id + ')" stroke="#ecfdf5" stroke-width="2.5"/>' +
        '<rect x="27" y="31" width="46" height="34" rx="11" fill="#064e3b"/>' +
        eyes("#6ee7b7", 45, 9, 4.2, 5) +
        '<path class="av-mouth" d="M41 55 Q50 61 59 55" stroke="#6ee7b7" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<circle cx="31" cy="72" r="2" fill="#064e3b"/><circle cx="38" cy="72" r="2" fill="#064e3b"/></g>';
    }
  };
  var T = {
    lyra: {
      id: "lyra", name: "Lyra", color: "#a78bfa",
      role: { en: "Calm, encouraging star-guide", es: "Guía estelar, calmada y alentadora" },
      greeting: { en: "Hi Ricardo, I'm **Lyra** ✨ Let's chart this one star at a time. Ask me anything, or tap **Quiz me** when you're ready.", es: "Hola Ricardo, soy **Lyra** ✨ Vamos a trazar esto estrella por estrella. Pregúntame lo que quieras o toca **Ponme a prueba** cuando estés listo." },
      voice: { pitch: 1.05, rate: 0.95, prefer: ["Samantha", "Google US English", "Zira", "Jenny", "Aria", "Paulina", "Mónica", "Google español"] }
    },
    nova: {
      id: "nova", name: "Nova", color: "#ff8a4c",
      role: { en: "High-energy hype coach", es: "Coach con mucha energía" },
      greeting: { en: "LET'S GO, Ricardo! 🚀 I'm **Nova** — every question is a rep and every rep is a win. Hit me with a topic!", es: "¡VAMOS, Ricardo! 🚀 Soy **Nova**: cada pregunta es una repetición y cada repetición es una victoria. ¡Dame un tema!" },
      voice: { pitch: 1.35, rate: 1.12, prefer: ["Google US English", "Samantha", "Aria", "Paulina", "Google español"] }
    },
    atlas: {
      id: "atlas", name: "Atlas", color: "#60a5fa",
      role: { en: "No-nonsense exam drill sergeant", es: "Sargento instructor de examen, directo" },
      greeting: { en: "**Atlas** here. We drill what gets tested. Pick a topic or say **Quiz me**. Answer fast, learn the traps.", es: "Aquí **Atlas**. Entrenamos lo que entra en el examen. Elige un tema o di **Ponme a prueba**. Responde rápido y aprende las trampas." },
      voice: { pitch: 0.7, rate: 1.0, prefer: ["Daniel", "Google UK English Male", "Alex", "David", "Guy", "Jorge", "Diego", "Juan"] }
    },
    echo: {
      id: "echo", name: "Echo", color: "#34d399",
      role: { en: "Playful robot who explains with examples", es: "Robot juguetón que explica con ejemplos" },
      greeting: { en: "Beep boop! I'm **Echo** 🤖 I turn concepts into real-world examples — like a delivery robot stuck in elevator B. What should we decode?", es: "¡Bip bup! Soy **Echo** 🤖 Convierto conceptos en ejemplos reales, como un robot de entregas atascado en el elevador B. ¿Qué desciframos?" },
      voice: { pitch: 1.6, rate: 1.05, prefer: ["Fred", "Google US English", "Zarvox", "Alex", "Google español"] }
    }
  };
  /* Personality prompts — mirrored in worker/ai-proxy.js (the Worker only accepts these 4 ids). */
  var PERSONALITY = {
    lyra: "You are Lyra, a calm, warm star-guide tutor. Speak gently and encouragingly, celebrate progress, break ideas into small steps, and use occasional star/constellation imagery.",
    nova: "You are Nova, a high-energy hype coach tutor. Be upbeat and punchy with short sentences, frame learning as reps, streaks and wins, and use at most two emojis per reply — while staying fully accurate.",
    atlas: "You are Atlas, a no-nonsense exam drill sergeant tutor. Be direct and terse. Focus on what is tested, common traps and distractors, and rapid-fire drills. Firm but never insulting.",
    echo: "You are Echo, a playful robot tutor who explains everything through concrete examples and analogies, especially hospital robotics and IT operations scenarios. Use light robot humor (like 'beep boop') sparingly."
  };
  Object.keys(T).forEach(function (k) { T[k].personality = PERSONALITY[k]; });

  var KEY = "certlab:tutor";
  window.Tutors = {
    list: function () { return ["lyra", "nova", "atlas", "echo"].map(function (k) { return T[k]; }); },
    get: function (id) { return T[id] || T.lyra; },
    currentId: function () {
      var v = null; try { v = localStorage.getItem(KEY); } catch (e) {}
      return T[v] ? v : ((window.CERTLAB_CONFIG && T[window.CERTLAB_CONFIG.defaultTutor]) ? window.CERTLAB_CONFIG.defaultTutor : "lyra");
    },
    current: function () { return this.get(this.currentId()); },
    set: function (id) { if (!T[id]) return; try { localStorage.setItem(KEY, id); } catch (e) {} document.dispatchEvent(new CustomEvent("tutor:change", { detail: id })); },
    /* Returns an animated SVG avatar wrapped in a span; add class "thinking"/"speaking" to animate states. */
    avatar: function (id, cls) {
      var t = this.get(id), gid = "avg-" + t.id + "-" + (++uid);
      return '<span class="av-wrap av-' + t.id + " " + (cls || "") + '" style="--tc:' + t.color + '" aria-hidden="true"><svg class="av" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + AVATARS[t.id](gid) + "</svg></span>";
    },
    setState: function (state, on) {
      document.querySelectorAll(".av-wrap.av-" + this.currentId() + "[data-live]").forEach(function (el) { el.classList.toggle(state, !!on); });
    }
  };
})();
