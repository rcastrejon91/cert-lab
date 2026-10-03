/* Ricardo's Cert Lab — core app (router, views, progress). No build step. */
(function () {
  "use strict";
  var t = function (k, v) { return window.i18n.t(k, v); };
  var STORE_KEY = "certlab:v1";
  var $main = document.getElementById("main");
  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  /* ---------------- utilities ---------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function fmtTime(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
  function toast(msg) { var el = document.getElementById("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove("show"); }, 2400); }
  function textOf(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent || ""; }
  /* Tiny, safe markdown renderer for AI output (escapes HTML first). */
  function md(src) {
    var lines = esc(src).split(/\n/), out = [], list = null;
    function inline(s) {
      return s.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    }
    function closeList() { if (list) { out.push("</" + list + ">"); list = null; } }
    lines.forEach(function (l) {
      var m;
      if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; } out.push("<li>" + inline(m[1]) + "</li>"); }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; } out.push("<li>" + inline(m[1]) + "</li>"); }
      else if ((m = l.match(/^#{1,4}\s+(.*)/))) { closeList(); out.push("<p><strong>" + inline(m[1]) + "</strong></p>"); }
      else if (!l.trim()) { closeList(); }
      else { closeList(); out.push("<p>" + inline(l) + "</p>"); }
    });
    closeList();
    return out.join("");
  }
  function orbit(pct, color, cls, label) {
    var r = 26, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
    return '<div class="orbit ' + (cls || "") + '" style="--c:' + color + '" role="img" aria-label="' + Math.round(pct * 100) + '%">' +
      '<svg viewBox="0 0 64 64"><circle class="track" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="5"/>' +
      '<circle class="val" cx="32" cy="32" r="' + r + '" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + off.toFixed(2) + '"/></svg>' +
      '<span class="label">' + (label != null ? label : Math.round(pct * 100) + "%") + "</span></div>";
  }

  /* ---------------- persistent state ---------------- */
  var state;
  function loadState() { try { state = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { state = {}; } state.certs = state.certs || {}; }
  function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { toast("Could not save progress (storage full or blocked)."); } }
  function cs(id) { var c = state.certs[id] = state.certs[id] || {}; c.q = c.q || {}; c.exams = c.exams || []; c.cards = c.cards || {}; return c; }
  function recordAnswer(certId, qid, correct) { var s = cs(certId).q; var r = s[qid] = s[qid] || { n: 0, ok: 0 }; r.n++; if (correct) r.ok++; r.c = !!correct; r.t = Date.now(); saveState(); }
  function mastery(cert) { var s = cs(cert.id).q, m = 0; cert.questions.forEach(function (q) { if (s[q.id] && s[q.id].c) m++; }); return { m: m, n: cert.questions.length, pct: cert.questions.length ? m / cert.questions.length : 0 }; }
  function bestExam(certId) { var e = cs(certId).exams; return e.reduce(function (b, x) { return !b || x.c / x.n > b.c / b.n ? x : b; }, null); }

  /* ---------------- data loading ---------------- */
  var M = window.CERTLAB_MANIFEST;
  var CERTS = {}, ORDER = [];
  window.CERTLAB_DATA = window.CERTLAB_DATA || [];
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("Failed to load " + src)); }; document.head.appendChild(s); });
  }
  function loadData() {
    return Promise.all(M.certs.map(function (id) { return loadScript("data/certs/" + id + ".js"); })).then(function () {
      window.CERTLAB_DATA.forEach(function (c) { CERTS[c.id] = c; });
      ORDER = M.certs.filter(function (id) { return CERTS[id]; });
    });
  }
  function mockCfg(cert) {
    var mk = cert.mock, n = Math.min(mk.count, cert.questions.length);
    var minutes = mk.count === n ? mk.minutes : Math.max(5, Math.round(mk.minutes * n / mk.count));
    var pct = mk.passPct || (mk.passCount / mk.count);
    var pass = mk.count === n && mk.passCount ? mk.passCount : Math.ceil(n * pct);
    return { n: n, minutes: minutes, pass: pass, pct: Math.round(pct * 100) };
  }

  /* ---------------- context for the AI tutor ---------------- */
  var CertLab = window.CertLab = window.CertLab || {};
  CertLab.esc = esc; CertLab.md = md; CertLab.toast = toast; CertLab.t = t;
  CertLab.context = { certId: null, certTitle: null, question: null };
  CertLab.hooks = {
    /* Placeholder for v2: return {type:'image'|'video', url} for a concept. Not implemented in v1. */
    visualExplainer: null
  };
  CertLab.questionText = function (q) {
    if (!q) return "";
    return q.q + "\n" + q.options.map(function (o, i) { return LETTERS[i] + ") " + o; }).join("\n") + "\nCorrect answer: " + LETTERS[q.answer] + ") " + q.options[q.answer] + "\nSite explanation: " + q.explanation;
  };
  function setContext(cert, q) {
    CertLab.context = { certId: cert ? cert.id : null, certTitle: cert ? cert.title : null, question: q || null };
    document.dispatchEvent(new CustomEvent("certlab:context"));
  }
  /* Runs an AI request and streams the answer into an element. */
  CertLab.aiInto = function (el, userPrompt, ctx) {
    if (!window.AI || !AI.isReady()) { toast(t("ai.needKey")); CertLab.openTutor && CertLab.openTutor(); return; }
    var tu = Tutors.current();
    el.innerHTML = '<div class="ai-head">' + Tutors.avatar(tu.id, "sm thinking") + "<strong>" + esc(tu.name) + '</strong></div><div class="ai-body"><span class="typing"><span></span><span></span><span></span></span></div>';
    var body = el.querySelector(".ai-body"), av = el.querySelector(".av-wrap");
    Tutors.setState("thinking", true);
    AI.ask([{ role: "user", content: userPrompt }], { cert: ctx && ctx.certTitle, question: ctx && ctx.question ? CertLab.questionText(ctx.question) : "" }, {
      onToken: function (d, full) { body.innerHTML = md(full); }
    }).then(function (full) {
      body.innerHTML = md(full) + '<div class="msg-tools"><button type="button" data-say>🔊 ' + esc(t("tutor.listen")) + "</button></div>";
      var b = body.querySelector("[data-say]"); if (b) b.onclick = function () { speakOrStop(full, av); };
    }).catch(function (e) { body.innerHTML = '<span style="color:var(--bad)">⚠️ ' + esc(e.message) + "</span>"; })
      .finally(function () { av.classList.remove("thinking"); Tutors.setState("thinking", false); });
  };
  /* Reads text aloud in the current tutor's voice; animates the given avatar + live avatars while speaking. */
  function speakOrStop(text, avatarEl) {
    if (!Voice.ttsSupported) { toast(t("tts.unsupported")); return; }
    if (Voice.speaking()) { Voice.stop(); return; }
    var tu = Tutors.current();
    function on(v) { Tutors.setState("speaking", v); if (avatarEl) avatarEl.classList.toggle("speaking", v); }
    Voice.speak(text, { pitch: tu.voice.pitch, rate: tu.voice.rate, prefer: tu.voice.prefer, onstart: function () { on(true); }, onend: function () { on(false); } });
  }
  CertLab.speakOrStop = speakOrStop;

  /* ---------------- router ---------------- */
  var exam = null; // active exam attempt
  var lastHash = location.hash;
  function route() {
    var h = location.hash || "#/";
    if (exam && !exam.done && h !== lastHash) {
      if (!confirm(t("exam.confirmLeave"))) { history.replaceState(null, "", lastHash); return; }
      stopExam();
    }
    lastHash = h;
    Voice.stop();
    var parts = h.replace(/^#\/?/, "").split("/").filter(Boolean);
    document.querySelectorAll("[data-nav]").forEach(function (a) { a.classList.toggle("active", (parts[0] || "home") === a.getAttribute("data-nav")); });
    setContext(null, null);
    var view;
    if (!parts.length) view = viewHome();
    else if (parts[0] === "roadmap") view = viewRoadmap();
    else if (parts[0] === "progress") view = viewProgress();
    else if (parts[0] === "c" && CERTS[parts[1]]) view = viewCert(CERTS[parts[1]], parts[2] || "notes");
    else view = '<div class="card empty"><h2>404 — lost in space 🛰️</h2><p><a href="#/">Return to base</a></p></div>';
    if (typeof view === "string") { $main.innerHTML = '<div class="view">' + view + "</div>"; }
    if (route.after) { var f = route.after; route.after = null; f(); }
    window.scrollTo(0, 0);
  }
  function after(fn) { route.after = fn; }

  /* ---------------- views ---------------- */
  function viewHome() {
    var totalQ = 0, totalM = 0, exams = 0, passed = 0;
    ORDER.forEach(function (id) { var c = CERTS[id], m = mastery(c); totalQ += m.n; totalM += m.m; var e = cs(id).exams; exams += e.length; if (e.some(function (x) { return x.p; })) passed++; });
    var ai = window.AI && AI.isReady();
    var cards = ORDER.map(function (id) {
      var c = CERTS[id], m = mastery(c), be = bestExam(id), mc = mockCfg(c);
      return '<article class="card hover mission" style="--c:' + c.color + '">' +
        '<div class="mission-head"><div class="planet" aria-hidden="true">' + c.icon + '</div><div><h3>' + esc(c.title) + '</h3><div class="sub">' + esc(c.issuer) + "</div></div></div>" +
        "<p class=\"muted small\" style=\"margin:0\">" + esc(c.tagline) + "</p>" +
        '<div class="chips"><span class="chip">' + esc(t("home.qcount", { n: c.questions.length })) + '</span><span class="chip">⏱ ' + mc.n + "Q / " + mc.minutes + "m</span>" +
        (be ? '<span class="chip ' + (be.p ? "ok" : "bad") + '">' + (be.p ? "🚀 " : "") + Math.round(be.c / be.n * 100) + "% best</span>" : "") + "</div>" +
        '<div class="links"><span class="muted small">' + esc(t("home.official")) + ":</span>" + c.links.map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a>"; }).join("") + "</div>" +
        '<div class="mission-foot">' + orbit(m.pct, c.color) + '<div class="spacer"></div><a class="btn primary" href="#/c/' + id + '">' + esc(t("home.open")) + " 🚀</a></div></article>";
    }).join("");
    return '<section class="card hero"><div class="hero-planet" aria-hidden="true"></div>' +
      '<div class="muted small" style="letter-spacing:.2em;text-transform:uppercase">' + esc(t("home.kicker")) + "</div>" +
      "<h1>" + t("home.title") + '</h1><p class="lead">' + esc(t("home.lead")) + "</p>" +
      '<div class="row"><a class="btn primary" href="#/roadmap">🧭 ' + esc(t("home.start")) + '</a><button class="btn ai" type="button" id="heroTutor">' + esc(t("tutor.ask", { name: Tutors.current().name })) + "</button></div>" +
      '<div class="stats"><div class="stat"><b>' + totalQ + "</b><span>" + esc(t("home.stat.questions")) + '</span></div><div class="stat"><b>' + totalM + "</b><span>" + esc(t("home.stat.mastered")) + '</span></div><div class="stat"><b>' + exams + "</b><span>" + esc(t("home.stat.exams")) + '</span></div><div class="stat"><b>' + passed + "/" + ORDER.length + "</b><span>" + esc(t("home.stat.passed")) + "</span></div></div></section>" +
      '<div class="row" style="margin-bottom:12px"><h2 style="margin:0">' + esc(t("home.missions")) + "</h2></div>" +
      '<section class="grid grid-2">' + cards + "</section>" +
      '<section class="card" style="margin-top:18px"><div class="row"><div style="width:54px;height:54px">' + Tutors.avatar(Tutors.currentId()) + '</div><div style="flex:1;min-width:200px"><h3 style="margin:0">' + esc(t("home.aiCard.title")) + " " + (ai ? '<span class="chip ok">ON</span>' : '<span class="chip">OFF</span>') + '</h3><div class="muted small">' + esc(t(ai ? "home.aiCard.on" : "home.aiCard.off")) + '</div><div class="tutor-strip">' + Tutors.list().map(function (x) { return '<button type="button" class="tutor-mini" data-pick-tutor="' + x.id + '" title="' + esc(x.name + " — " + (x.role[i18n.lang] || x.role.en)) + '">' + Tutors.avatar(x.id, "sm") + "<span>" + esc(x.name) + "</span></button>"; }).join("") + '</div></div><button class="btn" type="button" data-open-settings>⚙️ ' + esc(t("settings.title")) + "</button></div></section>";
  }

  function viewRoadmap() {
    var steps = M.roadmap.map(function (s, i) {
      var c = s.certId && CERTS[s.certId];
      return '<div class="rm-step" data-n="' + (i + 1) + '"><div class="card hover" style="--c:' + (c ? c.color : "var(--accent)") + '">' +
        '<div class="row"><span style="font-size:1.5rem">' + s.icon + '</span><h3 style="margin:0;flex:1">' + esc(s.title) + '</h3><span class="chip">' + esc(s.time) + "</span></div>" +
        '<p class="muted" style="margin:.6em 0">' + esc(s.why) + "</p>" +
        '<div class="row">' + (c ? '<a class="btn primary sm" href="#/c/' + c.id + '">' + esc(t("home.open")) + " 🚀</a>" : "") +
        s.links.map(function (l) { return '<a class="btn sm ghost" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a>"; }).join("") + "</div></div></div>";
    }).join("");
    return '<h1>🧭 ' + esc(t("roadmap.title")) + '</h1><p class="muted">' + esc(t("roadmap.lead")) + '</p><div class="roadmap">' + steps + "</div>";
  }

  function viewProgress() {
    var rows = ORDER.map(function (id) {
      var c = CERTS[id], m = mastery(c), ex = cs(id).exams.slice(-5).reverse(), kn = Object.keys(cs(id).cards).length;
      return '<div class="card" style="--c:' + c.color + '"><div class="row"><div class="planet" style="width:40px;height:40px;font-size:1.1rem">' + c.icon + '</div><h3 style="margin:0;flex:1">' + esc(c.title) + "</h3>" + orbit(m.pct, c.color) + "</div>" +
        '<p class="small muted" style="margin:.6em 0 .3em">' + esc(t("cert.mastery")) + ": " + m.m + "/" + m.n + " · " + esc(t("cards.known", { k: kn, n: c.flashcards.length })) + '</p><div class="bar"><i style="width:' + (m.pct * 100).toFixed(1) + '%"></i></div>' +
        (ex.length ? '<h4 style="margin:14px 0 6px">' + esc(t("exam.history")) + '</h4><table class="hist"><tr><th>' + esc(t("exam.date")) + "</th><th>" + esc(t("exam.result")) + "</th><th>" + esc(t("exam.time")) + "</th></tr>" + ex.map(function (e) { return "<tr><td>" + new Date(e.d).toLocaleDateString() + "</td><td>" + (e.p ? "🚀 " : "🛠 ") + e.c + "/" + e.n + "</td><td>" + fmtTime(e.s) + "</td></tr>"; }).join("") + "</table>" : "") +
        '<div class="row" style="margin-top:12px"><button class="btn sm danger" data-reset="' + id + '">' + esc(t("progress.reset")) + "</button></div></div>";
    }).join("");
    after(function () {
      $main.querySelectorAll("[data-reset]").forEach(function (b) { b.onclick = function () { if (confirm(t("progress.confirm"))) { delete state.certs[b.getAttribute("data-reset")]; saveState(); route(); } }; });
      document.getElementById("resetAll").onclick = function () { if (confirm(t("progress.confirm"))) { state.certs = {}; saveState(); route(); } };
      document.getElementById("exportBtn").onclick = function () {
        var blob = new Blob([JSON.stringify({ certs: state.certs }, null, 2)], { type: "application/json" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "certlab-progress.json"; a.click();
      };
      document.getElementById("importFile").onchange = function (e) {
        var f = e.target.files[0]; if (!f) return;
        f.text().then(function (txt) { var d = JSON.parse(txt); if (d && d.certs) { state.certs = d.certs; saveState(); toast(t("progress.imported")); route(); } }).catch(function () { toast("Invalid file"); });
      };
    });
    return '<h1>📓 ' + esc(t("progress.title")) + '</h1><div class="grid grid-2">' + rows + '</div><div class="row" style="margin-top:18px"><button class="btn" id="exportBtn">⬇️ ' + esc(t("progress.export")) + '</button><label class="btn">⬆️ ' + esc(t("progress.import")) + '<input type="file" id="importFile" accept="application/json" hidden></label><div class="spacer"></div><button class="btn danger" id="resetAll">' + esc(t("progress.resetAll")) + "</button></div>";
  }

  function viewCert(cert, tab) {
    var m = mastery(cert), mc = mockCfg(cert);
    var tabs = [["notes", "📘", "tab.notes"], ["practice", "🎯", "tab.practice"], ["exam", "⏱", "tab.exam"], ["cards", "🃏", "tab.cards"]];
    var head = '<div class="crumbs"><a href="#/">' + esc(t("nav.home")) + "</a> / " + esc(cert.title) + "</div>" +
      '<section class="card cert-hero" style="--c:' + cert.color + '"><div class="planet" aria-hidden="true">' + cert.icon + '</div><div style="flex:1;min-width:220px"><h1>' + esc(cert.title) + '</h1><div class="muted">' + esc(cert.issuer) + " · " + esc(cert.tagline) + '</div><div class="chips" style="margin-top:8px">' + cert.links.map(function (l) { return '<a class="chip" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a>"; }).join("") + "</div></div>" + orbit(m.pct, cert.color, "big") + "</section>" +
      '<nav class="tabs" style="--c:' + cert.color + '">' + tabs.map(function (x) { return '<a class="tab ' + (tab === x[0] ? "active" : "") + '" href="#/c/' + cert.id + "/" + x[0] + '">' + x[1] + " " + esc(t(x[2])) + "</a>"; }).join("") + "</nav>";
    var body = "";
    setContext(cert, null);
    if (tab === "practice") body = '<div id="practice"></div>', after(function () { practice(cert); });
    else if (tab === "exam") body = '<div id="exam"></div>', after(function () { examIntro(cert); });
    else if (tab === "cards") body = '<div id="cards"></div>', after(function () { flashcards(cert); });
    else body = notesView(cert, mc);
    return '<div style="--c:' + cert.color + '">' + head + body + "</div>";
  }

  function notesView(cert, mc) {
    after(function () {
      $main.querySelectorAll("[data-listen]").forEach(function (b) {
        b.onclick = function (e) { e.preventDefault(); var n = b.closest(".note"); speakOrStop(n.querySelector("h3").textContent + ". " + n.querySelector(".note-body").textContent); };
      });
      var ex = document.getElementById("expandAll");
      if (ex) ex.onclick = function () { var all = $main.querySelectorAll("details.note"); var open = Array.prototype.some.call(all, function (d) { return !d.open; }); all.forEach(function (d) { d.open = open; }); };
    });
    var fmt = '<div class="card note"><h3>🛰️ ' + esc(t("cert.examFormat")) + '</h3><table><tr><th>' + esc(t("cert.realExam")) + "</th><td>" + cert.examInfo + "</td></tr><tr><th>" + esc(t("cert.mockExam")) + "</th><td>" + esc(t("exam.intro", { n: mc.n, m: mc.minutes, p: mc.pass, pct: mc.pct })) + "</td></tr></table></div>";
    var notes = cert.notes.map(function (n, i) {
      return '<details class="card note" ' + (i < 2 ? "open" : "") + ' id="n-' + i + '"><summary><h3><span>' + (n.icon || "📌") + "</span> " + esc(n.title) + '</h3></summary><div class="note-body">' + n.html + '</div><div class="row" style="margin-top:10px"><button class="btn sm" data-listen>🔊 ' + esc(t("notes.listen")) + "</button></div></details>";
    }).join("");
    var visual = '<div class="coming"><span style="font-size:1.4rem">🎬</span><div><strong>' + esc(t("visual.title")) + "</strong> — " + esc(t("visual.soon")) + "</div></div>";
    return '<div class="row" style="margin-bottom:12px"><h2 style="margin:0;flex:1">📘 ' + esc(t("tab.notes")) + '</h2><button class="btn sm" id="expandAll">↕ ' + esc(t("notes.expandAll")) + "</button></div>" + fmt + notes + visual;
  }

  /* ---------------- practice mode ---------------- */
  function practice(cert) {
    var root = document.getElementById("practice");
    var topics = Array.from(new Set(cert.questions.map(function (q) { return q.topic; })));
    var opts = { topic: "", missed: false, shuffle: true };
    var list = [], idx = 0, session = { c: 0, n: 0 }, answered = {};
    function build() {
      var s = cs(cert.id).q;
      list = cert.questions.filter(function (q) { return (!opts.topic || q.topic === opts.topic) && (!opts.missed || !(s[q.id] && s[q.id].c)); });
      if (opts.shuffle) list = shuffle(list);
      idx = 0; answered = {}; session = { c: 0, n: 0 };
      render();
    }
    function render() {
      var filters = '<div class="filters"><select class="input" id="pTopic" aria-label="' + esc(t("practice.topic")) + '"><option value="">' + esc(t("practice.all")) + "</option>" + topics.map(function (x) { return '<option ' + (opts.topic === x ? "selected" : "") + ">" + esc(x) + "</option>"; }).join("") + '</select><label class="check"><input type="checkbox" id="pMissed" ' + (opts.missed ? "checked" : "") + "> " + esc(t("practice.missed")) + '</label><label class="check"><input type="checkbox" id="pShuf" ' + (opts.shuffle ? "checked" : "") + "> " + esc(t("practice.shuffle")) + '</label><div class="spacer"></div><span class="chip">' + esc(t("practice.session", { c: session.c, n: session.n })) + "</span></div>";
      if (!list.length) { root.innerHTML = filters + '<div class="card empty">' + esc(t("practice.none")) + "</div>"; bindFilters(); setContext(cert, null); return; }
      var q = list[idx];
      setContext(cert, q);
      // Options are always shuffled so the answer letter can't be memorized.
      var order = q._order && answered[q.id] != null ? q._order : shuffle(q.options.map(function (_, i) { return i; }));
      q._order = order;
      var a = answered[q.id];
      var html = filters + '<article class="card qcard"><div class="qmeta"><span>' + esc(t("practice.q", { i: idx + 1, n: list.length })) + '</span><span class="chip">' + esc(q.topic) + '</span></div><div class="qtext">' + esc(q.q) + '</div><div class="options">' +
        order.map(function (oi, k) {
          var cls = "";
          if (a != null) { if (oi === q.answer) cls = "correct"; else if (oi === a) cls = "wrong"; }
          return '<button class="opt ' + cls + '" data-oi="' + oi + '" ' + (a != null ? "disabled" : "") + '><span class="key">' + LETTERS[k] + "</span><span>" + esc(q.options[oi]) + "</span></button>";
        }).join("") + "</div>";
      if (a != null) {
        var ok = a === q.answer;
        html += '<div class="feedback ' + (ok ? "ok" : "bad") + '"><h4>' + (ok ? "✅ " + esc(t("practice.correct")) : "❌ " + esc(t("practice.wrong"))) + "</h4>" + (ok ? "" : '<p class="small"><strong>' + esc(t("practice.answerWas", { a: q.options[q.answer] })) + "</strong></p>") + "<p style=\"margin:0\">" + esc(q.explanation) + "</p></div>";
      }
      html += '<div class="qactions"><button class="btn sm" id="pSay">🔊 ' + esc(t("notes.listen")) + '</button><button class="btn sm ai" id="pTrans">' + esc(t("ai.translate")) + "</button>" +
        (a != null ? '<button class="btn sm ai" id="pExplain">' + esc(t("ai.explain")) + '</button><button class="btn sm ai" id="pExample">' + esc(t("ai.example")) + "</button>" : "") +
        '<div class="spacer"></div>' + (idx > 0 ? '<button class="btn sm ghost" id="pPrev">← ' + esc(t("practice.prev")) + "</button>" : "") +
        (idx < list.length - 1 ? '<button class="btn sm primary" id="pNext">' + esc(t("practice.next")) + " →</button>" : '<button class="btn sm primary" id="pRestart">↻ ' + esc(t("practice.restart")) + "</button>") + "</div>" +
        '<div class="ai-out" id="pAi"></div>' +
        (a != null ? '<div class="coming" style="margin-top:12px"><span>🎬</span><div><strong>' + esc(t("visual.title")) + "</strong> — " + esc(t("visual.soon")) + "</div></div>" : "") + "</article>";
      root.innerHTML = html;
      bindFilters();
      root.querySelectorAll(".opt").forEach(function (b) {
        b.onclick = function () {
          if (answered[q.id] != null) return;
          var oi = +b.getAttribute("data-oi"); answered[q.id] = oi;
          var ok = oi === q.answer; session.n++; if (ok) session.c++;
          recordAnswer(cert.id, q.id, ok); render();
        };
      });
      var ai = document.getElementById("pAi");
      document.getElementById("pSay").onclick = function () { speakOrStop(q.q + ". " + order.map(function (oi, k) { return LETTERS[k] + ". " + q.options[oi]; }).join(". ") + (a != null ? ". " + q.explanation : "")); };
      document.getElementById("pTrans").onclick = function () { CertLab.aiInto(ai, "Translate this practice question and its four options (and the explanation if shown) into " + i18n.aiLanguage() + ". Keep the A–D letters in this display order: " + order.map(function (oi, k) { return LETTERS[k] + ") " + q.options[oi]; }).join(" | ") + ". Question: " + q.q + (a != null ? " Explanation: " + q.explanation : "") + ". Do not reveal the correct answer unless the explanation is included.", { certTitle: cert.title }); };
      var ex = document.getElementById("pExplain"); if (ex) ex.onclick = function () { CertLab.aiInto(ai, "Explain in more depth why the correct answer is right and why each other option is wrong. Then give a one-line memory hook.", { certTitle: cert.title, question: q }); };
      var eg = document.getElementById("pExample"); if (eg) eg.onclick = function () { CertLab.aiInto(ai, "Explain the concept behind this question with a vivid real-world scenario, ideally from hospital clinical robotics or IT operations (for example, a surgical or delivery robot outage mapped step by step to the relevant framework). Keep it under 200 words.", { certTitle: cert.title, question: q }); };
      var p = document.getElementById("pPrev"); if (p) p.onclick = function () { idx--; render(); };
      var n = document.getElementById("pNext"); if (n) n.onclick = function () { idx++; render(); };
      var r = document.getElementById("pRestart"); if (r) r.onclick = build;
    }
    function bindFilters() {
      document.getElementById("pTopic").onchange = function (e) { opts.topic = e.target.value; build(); };
      document.getElementById("pMissed").onchange = function (e) { opts.missed = e.target.checked; build(); };
      document.getElementById("pShuf").onchange = function (e) { opts.shuffle = e.target.checked; build(); };
    }
    build();
  }

  /* ---------------- mock exam ---------------- */
  function stopExam() { if (exam && exam.timer) clearInterval(exam.timer); exam = null; }
  function examIntro(cert) {
    var root = document.getElementById("exam"), mc = mockCfg(cert), hist = cs(cert.id).exams.slice(-5).reverse();
    root.innerHTML = '<div class="card result" style="text-align:left"><div class="row"><span class="rocket" style="transform:rotate(-45deg)">🚀</span><div style="flex:1;min-width:220px"><h2 style="margin:0">' + esc(t("tab.exam")) + '</h2><p class="muted" style="margin:0">' + esc(t("exam.intro", { n: mc.n, m: mc.minutes, p: mc.pass, pct: mc.pct })) + '</p></div><button class="btn primary" id="eStart">' + esc(t("exam.start")) + '</button></div><p class="small muted" style="margin:12px 0 0">' + cert.examInfo + "</p></div>" +
      (hist.length ? '<div class="card" style="margin-top:16px"><h3>' + esc(t("exam.history")) + '</h3><table class="hist"><tr><th>' + esc(t("exam.date")) + "</th><th>" + esc(t("exam.result")) + "</th><th>" + esc(t("exam.time")) + "</th></tr>" + hist.map(function (e) { return "<tr><td>" + new Date(e.d).toLocaleString() + "</td><td>" + (e.p ? '<span class="chip ok">🚀 ' : '<span class="chip bad">') + e.c + "/" + e.n + "</span></td><td>" + fmtTime(e.s) + "</td></tr>"; }).join("") + "</table></div>" : "");
    document.getElementById("eStart").onclick = function () { startExam(cert); };
  }
  function startExam(cert) {
    var mc = mockCfg(cert);
    var qs = shuffle(cert.questions).slice(0, mc.n), orders = {};
    qs.forEach(function (q) { orders[q.id] = shuffle(q.options.map(function (_, i) { return i; })); });
    exam = { cert: cert, qs: qs, orders: orders, answers: {}, flags: {}, idx: 0, start: Date.now(), dur: mc.minutes * 60, pass: mc.pass, done: false };
    exam.timer = setInterval(tick, 1000);
    renderExam();
  }
  function remaining() { return exam.dur - (Date.now() - exam.start) / 1000; }
  function tick() {
    if (!exam || exam.done) return;
    var el = document.getElementById("eTimer"); var r = remaining();
    if (el) { el.textContent = fmtTime(r); el.classList.toggle("low", r < 120); }
    if (r <= 0) { toast(t("exam.timeUp")); finishExam(); }
  }
  function renderExam() {
    var root = document.getElementById("exam"); if (!root || !exam) return;
    var q = exam.qs[exam.idx], cert = exam.cert, a = exam.answers[q.id];
    setContext(cert, null); // don't leak answers to the tutor during an exam
    var nAns = Object.keys(exam.answers).length;
    root.innerHTML = '<div class="card exam-bar"><span class="timer" id="eTimer">' + fmtTime(remaining()) + '</span><div style="flex:1"><div class="bar"><i style="width:' + (nAns / exam.qs.length * 100) + '%"></i></div><div class="small muted">' + nAns + "/" + exam.qs.length + '</div></div><button class="btn sm primary" id="eSubmit">' + esc(t("exam.submit")) + "</button></div>" +
      '<article class="card qcard"><div class="qmeta"><span>' + esc(t("practice.q", { i: exam.idx + 1, n: exam.qs.length })) + '</span><button class="btn sm ghost" id="eFlag">🚩 ' + esc(t(exam.flags[q.id] ? "exam.unflag" : "exam.flag")) + '</button></div><div class="qtext">' + esc(q.q) + '</div><div class="options">' +
      exam.orders[q.id].map(function (i, k) { return '<button class="opt ' + (a === i ? "selected" : "") + '" data-i="' + i + '"><span class="key">' + LETTERS[k] + "</span><span>" + esc(q.options[i]) + "</span></button>"; }).join("") +
      '</div><div class="qactions"><button class="btn sm" id="ePrev" ' + (exam.idx === 0 ? "disabled" : "") + ">← " + esc(t("practice.prev")) + '</button><div class="spacer"></div><button class="btn sm primary" id="eNext" ' + (exam.idx === exam.qs.length - 1 ? "disabled" : "") + ">" + esc(t("practice.next")) + " →</button></div>" +
      '<div class="palette">' + exam.qs.map(function (x, i) { return '<button class="pal ' + (exam.answers[x.id] != null ? "answered " : "") + (exam.flags[x.id] ? "flag " : "") + (i === exam.idx ? "current" : "") + '" data-go="' + i + '">' + (i + 1) + "</button>"; }).join("") + "</div></article>";
    root.querySelectorAll(".opt").forEach(function (b) { b.onclick = function () { exam.answers[q.id] = +b.getAttribute("data-i"); renderExam(); }; });
    root.querySelectorAll("[data-go]").forEach(function (b) { b.onclick = function () { exam.idx = +b.getAttribute("data-go"); renderExam(); }; });
    document.getElementById("ePrev").onclick = function () { exam.idx--; renderExam(); };
    document.getElementById("eNext").onclick = function () { exam.idx++; renderExam(); };
    document.getElementById("eFlag").onclick = function () { exam.flags[q.id] = !exam.flags[q.id]; renderExam(); };
    document.getElementById("eSubmit").onclick = function () { var u = exam.qs.length - nAns; if (!u || confirm(t("exam.confirmSubmit", { u: u }))) finishExam(); };
  }
  function finishExam() {
    if (!exam || exam.done) return;
    exam.done = true; clearInterval(exam.timer);
    var c = 0, cert = exam.cert;
    exam.qs.forEach(function (q) { var ok = exam.answers[q.id] === q.answer; if (ok) c++; if (exam.answers[q.id] != null) recordAnswer(cert.id, q.id, ok); });
    var secs = Math.min(exam.dur, (Date.now() - exam.start) / 1000), n = exam.qs.length, pass = c >= exam.pass;
    cs(cert.id).exams.push({ d: Date.now(), c: c, n: n, p: pass, s: Math.round(secs) }); saveState();
    var root = document.getElementById("exam"), done = exam;
    root.innerHTML = '<div class="card result ' + (pass ? "pass" : "fail") + '"><div class="rocket">' + (pass ? "🚀" : "🛠️") + "</div>" + orbit(c / n, pass ? "var(--ok)" : "var(--warn)", "big", c + "/" + n) +
      '<div class="badge">' + esc(t(pass ? "exam.pass" : "exam.fail")) + '</div><p class="muted">' + esc(t("exam.score", { c: c, n: n, pct: Math.round(c / n * 100), p: done.pass })) + " · ⏱ " + fmtTime(secs) + '</p><div class="row" style="justify-content:center"><button class="btn" id="eReview">' + esc(t("exam.review")) + '</button><button class="btn primary" id="eAgain">' + esc(t("exam.again")) + '</button></div></div><div id="eReviewList"></div>';
    document.getElementById("eAgain").onclick = function () { startExam(cert); };
    document.getElementById("eReview").onclick = function () {
      document.getElementById("eReviewList").innerHTML = done.qs.map(function (q, i) {
        var a = done.answers[q.id], ok = a === q.answer;
        return '<div class="card" style="margin-top:12px"><div class="qmeta"><span>#' + (i + 1) + " · " + esc(q.topic) + "</span>" + (ok ? '<span class="chip ok">✓</span>' : '<span class="chip bad">✗</span>') + '</div><div class="qtext" style="font-size:1rem">' + esc(q.q) + '</div><p class="small">' + (ok ? "" : "<strong>" + esc(t("exam.yourAnswer")) + ":</strong> " + esc(a != null ? q.options[a] : t("exam.unanswered")) + "<br>") + "<strong>✅ " + esc(q.options[q.answer]) + '</strong></p><p class="small muted" style="margin:0">' + esc(q.explanation) + "</p></div>";
      }).join("");
    };
  }

  /* ---------------- flashcards ---------------- */
  function flashcards(cert) {
    var root = document.getElementById("cards"), known = cs(cert.id).cards;
    var deck = cert.flashcards.map(function (c, i) { return i; }), idx = 0, onlyUnknown = false;
    function filtered() { return onlyUnknown ? deck.filter(function (i) { return !known[i]; }) : deck; }
    function render() {
      var d = filtered(); if (idx >= d.length) idx = 0;
      var k = Object.keys(known).length;
      var top = '<div class="filters"><span class="chip">' + esc(t("cards.known", { k: k, n: cert.flashcards.length })) + '</span><div class="bar" style="flex:1;min-width:120px"><i style="width:' + (k / cert.flashcards.length * 100) + '%"></i></div><label class="check"><input type="checkbox" id="fUnk" ' + (onlyUnknown ? "checked" : "") + "> " + esc(t("cards.onlyUnknown")) + '</label><button class="btn sm" id="fShuf">🔀 ' + esc(t("cards.shuffle")) + "</button></div>";
      if (!d.length) { root.innerHTML = top + '<div class="card empty">🎉</div>'; bind(); return; }
      var c = cert.flashcards[d[idx]];
      root.innerHTML = top + '<div class="flash-wrap"><div class="flash" id="flash" tabindex="0" role="button" aria-label="' + esc(t("cards.flip")) + '"><div class="flash-face front card"><div class="muted small">' + (idx + 1) + " / " + d.length + (known[d[idx]] ? " · ✅" : "") + '</div><div class="ft">' + esc(c.front) + '</div><div class="hint">' + esc(t("cards.flip")) + ' ↻</div></div><div class="flash-face back card"><div class="fb">' + esc(c.back) + "</div></div></div></div>" +
        '<div class="flash-nav"><button class="btn" id="fPrev" aria-label="Previous">←</button><button class="btn" id="fAgain">🔁 ' + esc(t("cards.again")) + '</button><button class="btn primary" id="fKnow">✅ ' + esc(t("cards.know")) + '</button><button class="btn" id="fSay" aria-label="' + esc(t("notes.listen")) + '">🔊</button><button class="btn" id="fNext" aria-label="Next">→</button></div>';
      bind();
      var fl = document.getElementById("flash");
      fl.onclick = function () { fl.classList.toggle("flipped"); };
      fl.onkeydown = function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); fl.classList.toggle("flipped"); } };
      document.getElementById("fPrev").onclick = function () { idx = (idx - 1 + d.length) % d.length; render(); };
      document.getElementById("fNext").onclick = function () { idx = (idx + 1) % d.length; render(); };
      document.getElementById("fKnow").onclick = function () { known[d[idx]] = 1; saveState(); if (!onlyUnknown) idx = (idx + 1) % d.length; render(); };
      document.getElementById("fAgain").onclick = function () { delete known[d[idx]]; saveState(); idx = (idx + 1) % d.length; render(); };
      document.getElementById("fSay").onclick = function () { speakOrStop(c.front + ". " + c.back); };
    }
    function bind() {
      document.getElementById("fUnk").onchange = function (e) { onlyUnknown = e.target.checked; idx = 0; render(); };
      document.getElementById("fShuf").onclick = function () { deck = shuffle(deck); idx = 0; render(); };
    }
    document.onkeydown = function (e) {
      if (!document.getElementById("flash") || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") document.getElementById("fNext").click();
      if (e.key === "ArrowLeft") document.getElementById("fPrev").click();
    };
    render();
  }

  /* ---------------- starfield (lightweight canvas) ---------------- */
  function starfield() {
    var cv = document.getElementById("starfield"); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), stars = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(220, Math.round(w * h / 6000));
      stars = []; for (var i = 0; i < count; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .2, s: Math.random() * .25 + .03, p: Math.random() * 6.28, hue: [220, 260, 190][i % 3] });
      draw(0);
    }
    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduce) { s.y += s.s; if (s.y > h) { s.y = 0; s.x = Math.random() * w; } }
        var a = reduce ? .8 : .5 + .5 * Math.sin(time / 900 + s.p);
        ctx.fillStyle = "hsla(" + s.hue + ",90%,85%," + a.toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
    }
    var running = true;
    function loop(time) { if (!running) return; draw(time); requestAnimationFrame(loop); }
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () { running = !document.hidden && !reduce; if (running) requestAnimationFrame(loop); });
    resize();
    if (!reduce) requestAnimationFrame(loop);
  }

  /* ---------------- theme + language ---------------- */
  function setTheme(th) { document.documentElement.setAttribute("data-theme", th); state.theme = th; saveState(); }
  function setLang(l) { i18n.lang = l; state.lang = l; saveState(); document.documentElement.setAttribute("lang", l); i18n.apply(document); document.dispatchEvent(new CustomEvent("certlab:lang")); if (!(exam && !exam.done)) route(); }
  CertLab.rerender = function () { if (!(exam && !exam.done)) route(); };

  /* ---------------- boot ---------------- */
  loadState();
  i18n.lang = state.lang && window.CERTLAB_I18N[state.lang] ? state.lang : "en";
  var sel = document.getElementById("langSelect");
  sel.innerHTML = i18n.languages().map(function (l) { return '<option value="' + l.code + '"' + (l.code === i18n.lang ? " selected" : "") + ">" + l.name + "</option>"; }).join("");
  sel.onchange = function () { setLang(sel.value); };
  i18n.apply(document);
  document.getElementById("themeToggle").onclick = function () { setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); };
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-open-settings]"); if (b) { e.preventDefault(); CertLab.openSettings && CertLab.openSettings(); }
    if (e.target.closest("#heroTutor")) { CertLab.openTutor && CertLab.openTutor(); }
    var pk = e.target.closest("[data-pick-tutor]"); if (pk) { Tutors.set(pk.getAttribute("data-pick-tutor")); CertLab.openTutor && CertLab.openTutor(); }
  });
  document.addEventListener("ai:config", function () { if ((location.hash || "#/") === "#/" ) route(); });
  document.addEventListener("tutor:change", function () { if ((location.hash || "#/") === "#/" && !(exam && !exam.done)) route(); });
  starfield();
  loadData().then(function () {
    CertLab.certs = CERTS; CertLab.order = ORDER; CertLab.ready = true;
    window.addEventListener("hashchange", route);
    route();
  }).catch(function (e) { $main.innerHTML = '<div class="card empty">⚠️ ' + esc(e.message) + "</div>"; console.error(e); });
})();
