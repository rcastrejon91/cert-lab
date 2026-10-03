/* AI tutor drawer (with animated personalities) + settings modal. */
(function () {
  "use strict";
  var CL = window.CertLab, t = CL.t, esc = CL.esc, md = CL.md;
  var drawer = document.getElementById("tutor"), fab = document.getElementById("tutorFab");
  var modal = document.getElementById("modal"), backdrop = document.getElementById("modalBackdrop");
  var history = [], busy = false, controller = null, stopListen = null;
  function el(id) { return document.getElementById(id); }
  function val(id) { return el(id).value; }

  /* ---------------- FAB shows the selected tutor ---------------- */
  function renderFab() {
    var tu = Tutors.current();
    fab.style.setProperty("--tc", tu.color);
    fab.innerHTML = '<span class="fab-av">' + Tutors.avatar(tu.id, "", true).replace('class="av-wrap', 'data-live class="av-wrap') + '</span><span class="tutor-fab-label">' + esc(t("tutor.ask", { name: tu.name })) + "</span>";
    fab.setAttribute("aria-label", t("tutor.ask", { name: tu.name }));
  }

  /* ---------------- settings modal ---------------- */
  function openSettings() {
    var c = Object.assign({}, AI.config);
    var showAdv = c.mode === "custom";
    function render() {
      var P = AI.PRESETS, proxyOk = AI.proxyConfigured();
      modal.innerHTML = '<div class="row"><h2 style="margin:0;flex:1">⚙️ ' + esc(t("settings.title")) + '</h2><button class="icon-btn" data-close aria-label="' + esc(t("settings.close")) + '">✕</button></div>' +
        '<div class="card" style="margin:14px 0;padding:14px"><div class="row"><strong style="flex:1">🛰️ ' + esc(t("settings.builtin")) + "</strong>" + (proxyOk ? '<span class="chip ok">' + esc(t("settings.builtinOn")) + "</span>" : '<span class="chip bad">' + esc(t("settings.builtinOff")) + "</span>") + '</div><p class="small muted" style="margin:.5em 0 0">' + esc(t(proxyOk ? "settings.builtinHint" : "settings.builtinOffHint")) + "</p></div>" +
        '<div class="field"><label>' + esc(t("settings.tutor")) + '</label><div class="tutor-picker">' + pickerHtml() + "</div></div>" +
        '<label class="check" style="margin:6px 0 12px"><input type="checkbox" id="sAdv" ' + (showAdv ? "checked" : "") + "> " + esc(t("settings.advanced")) + "</label>" +
        '<div id="sAdvBox" ' + (showAdv ? "" : "hidden") + '><p class="small muted" style="margin-top:0">' + esc(t("settings.advancedHint")) + "</p>" +
        '<div class="field"><label>' + esc(t("settings.provider")) + '</label><div class="presets">' + Object.keys(P).map(function (k) { return '<button type="button" class="btn sm ' + (c.provider === k ? "active" : "") + '" data-preset="' + k + '">' + esc(P[k].label) + "</button>"; }).join("") + "</div>" +
        (P[c.provider] && P[c.provider].keyUrl ? '<span class="hint">🔑 <a href="' + P[c.provider].keyUrl + '" target="_blank" rel="noopener">' + esc(P[c.provider].keyUrl) + "</a></span>" : "") + "</div>" +
        '<div class="field"><label for="sBase">' + esc(t("settings.baseUrl")) + '</label><input class="input" id="sBase" value="' + esc(c.baseUrl) + '" placeholder="https://…/v1" autocomplete="off" spellcheck="false"></div>' +
        '<div class="field"><label for="sModel">' + esc(t("settings.model")) + '</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="sModel" list="sModels" value="' + esc(c.model) + '" autocomplete="off" spellcheck="false" style="flex:1"><button type="button" class="btn sm" id="sFetch">' + esc(t("settings.fetchModels")) + '</button></div><datalist id="sModels"></datalist></div>' +
        '<div class="field"><label for="sKey">' + esc(t("settings.key")) + '</label><div class="row" style="flex-wrap:nowrap"><input class="input" id="sKey" type="password" value="' + esc(c.apiKey) + '" placeholder="sk-… / xai-…" autocomplete="off" spellcheck="false" style="flex:1"><button type="button" class="btn sm" id="sShow" aria-label="Show key">👁</button></div><span class="hint">🔒 ' + esc(t("settings.keyHint")) + "</span></div>" +
        '<div class="field"><label for="sTemp">' + esc(t("settings.temp")) + ': <span id="sTempV">' + c.temperature + '</span></label><input id="sTemp" type="range" min="0" max="1" step="0.1" value="' + c.temperature + '"></div>' +
        '<button type="button" class="btn danger sm" id="sForget">' + esc(t("settings.forget")) + "</button></div>" +
        '<div id="sStatus" class="small muted" style="min-height:1.4em;margin-top:10px"></div>' +
        '<div class="row" style="margin-top:8px"><div class="spacer"></div><button type="button" class="btn" id="sTest">' + esc(t("settings.test")) + '</button><button type="button" class="btn primary" id="sSave">' + esc(t("settings.save")) + "</button></div>";
      function read() {
        c.mode = el("sAdv").checked ? "custom" : "proxy";
        c.baseUrl = val("sBase").trim(); c.model = val("sModel").trim(); c.apiKey = val("sKey").trim(); c.temperature = +val("sTemp");
      }
      bindPicker(modal, function () { read(); render(); });
      el("sAdv").onchange = function () { showAdv = el("sAdv").checked; el("sAdvBox").hidden = !showAdv; };
      modal.querySelectorAll("[data-preset]").forEach(function (b) { b.onclick = function () { read(); var k = b.getAttribute("data-preset"); c.provider = k; if (k !== "custom") { c.baseUrl = P[k].baseUrl; c.model = P[k].model; } render(); }; });
      modal.querySelector("[data-close]").onclick = closeModal;
      el("sShow").onclick = function () { var i = el("sKey"); i.type = i.type === "password" ? "text" : "password"; };
      el("sTemp").oninput = function () { el("sTempV").textContent = val("sTemp"); };
      el("sSave").onclick = function () { read(); AI.save(c); CL.toast(t("settings.saved")); closeModal(); renderDrawer(); };
      el("sForget").onclick = function () { el("sKey").value = ""; read(); AI.save(c); CL.toast(t("settings.saved")); };
      function withTemp(fn) { read(); var prev = AI.config; AI.config = Object.assign({}, prev, c); var st = el("sStatus"); st.textContent = "…"; return fn(st).finally(function () { AI.config = prev; }); }
      el("sTest").onclick = function () {
        withTemp(function (st) {
          if (!AI.isReady()) { st.innerHTML = '<span style="color:var(--bad)">⚠️ ' + esc(t(AI.isCustom() ? "ai.needKey" : "settings.builtinOff")) + "</span>"; return Promise.resolve(); }
          return AI.test().then(function (r) { st.innerHTML = '<span style="color:var(--ok)">' + esc(t("settings.ok")) + "</span> " + esc(String(r).slice(0, 60)); })
            .catch(function (e) { st.innerHTML = '<span style="color:var(--bad)">⚠️ ' + esc(e.message) + "</span>"; });
        });
      };
      el("sFetch").onclick = function () {
        withTemp(function (st) {
          return AI.listModels().then(function (ids) { el("sModels").innerHTML = ids.map(function (id) { return '<option value="' + esc(id) + '">'; }).join(""); st.textContent = ids.length + " models ✓"; })
            .catch(function (e) { st.innerHTML = '<span style="color:var(--bad)">⚠️ ' + esc(e.message) + "</span>"; });
        });
      };
    }
    render();
    modal.hidden = false; backdrop.hidden = false;
  }
  function closeModal() { modal.hidden = true; backdrop.hidden = true; modal.innerHTML = ""; }
  backdrop.onclick = closeModal;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!modal.hidden) closeModal(); else if (drawer.classList.contains("open")) closeTutor(); } });
  document.getElementById("settingsBtn").onclick = openSettings;
  CL.openSettings = openSettings;

  /* ---------------- tutor picker ---------------- */
  function pickerHtml() {
    var cur = Tutors.currentId(), lang = i18n.lang;
    return Tutors.list().map(function (x) {
      return '<button type="button" class="tutor-opt ' + (x.id === cur ? "active" : "") + '" data-tutor="' + x.id + '" style="--tc:' + x.color + '" aria-pressed="' + (x.id === cur) + '" title="' + esc(x.role[lang] || x.role.en) + '">' + Tutors.avatar(x.id, "sm") + "<span>" + esc(x.name) + "</span></button>";
    }).join("");
  }
  function bindPicker(root, after) {
    root.querySelectorAll("[data-tutor]").forEach(function (b) { b.onclick = function () { Tutors.set(b.getAttribute("data-tutor")); if (after) after(); }; });
  }

  /* ---------------- tutor drawer ---------------- */
  function ctxLabel() { var c = CL.context; return c.certTitle ? c.certTitle + (c.question ? " · " + c.question.id : "") : t("tutor.general"); }
  function greeting() { var tu = Tutors.current(); return tu.greeting[i18n.lang] || tu.greeting.en; }
  function renderDrawer() {
    var ready = AI.isReady(), tu = Tutors.current();
    drawer.style.setProperty("--tc", tu.color);
    drawer.innerHTML = '<div class="tutor-head"><div class="head-av">' + Tutors.avatar(tu.id).replace('class="av-wrap', 'data-live class="av-wrap') + '</div><div style="flex:1;min-width:0"><h3>' + esc(tu.name) + ' <span class="tutor-role">' + esc(tu.role[i18n.lang] || tu.role.en) + '</span></h3><div class="tutor-ctx" id="tCtx">' + esc(t("tutor.context", { c: ctxLabel() })) + '</div></div><button class="icon-btn" id="tSettings" aria-label="Settings">⚙️</button><button class="icon-btn" id="tClear" aria-label="' + esc(t("tutor.clear")) + '" title="' + esc(t("tutor.clear")) + '">🧹</button><button class="icon-btn" id="tClose" aria-label="Close">✕</button></div>' +
      '<div class="tutor-picker compact" id="tPicker" role="group" aria-label="' + esc(t("settings.tutor")) + '">' + pickerHtml() + "</div>" +
      (ready ? '<div class="tutor-quick" id="tQuick"></div><div class="tutor-log" id="tLog" aria-live="polite"></div>' +
        '<form class="tutor-form" id="tForm"><button type="button" class="icon-btn mic" id="tMic" aria-label="' + esc(t("tutor.mic")) + '" title="' + esc(t("tutor.mic")) + '">🎙️</button><textarea class="input" id="tInput" rows="1" placeholder="' + esc(t("tutor.placeholder")) + '"></textarea><button class="btn primary" id="tSend" type="submit">' + esc(t("tutor.send")) + "</button></form>"
        : '<div class="setup"><div class="setup-av">' + Tutors.avatar(tu.id) + '</div><h3>' + esc(t("tutor.offTitle")) + '</h3><p class="muted">' + esc(t("tutor.offBody")) + '</p><button class="btn" id="tOpenSettings">⚙️ ' + esc(t("tutor.openSettings")) + '</button><div class="coming" style="margin-top:18px;text-align:left"><span>🎬</span><div><strong>' + esc(t("visual.title")) + "</strong> — " + esc(t("visual.soon")) + "</div></div></div>");
    el("tClose").onclick = closeTutor;
    el("tSettings").onclick = openSettings;
    el("tClear").onclick = function () { if (controller) controller.abort(); history = []; renderDrawer(); };
    bindPicker(drawer);
    if (!ready) { el("tOpenSettings").onclick = openSettings; return; }
    renderQuick();
    var log = el("tLog");
    addMsg("assistant", greeting(), true);
    history.forEach(function (m) { addMsg(m.role, m.content); });
    var input = el("tInput");
    input.oninput = function () { input.style.height = "auto"; input.style.height = Math.min(140, input.scrollHeight) + "px"; };
    input.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); } };
    el("tForm").onsubmit = function (e) { e.preventDefault(); send(input.value); };
    el("tMic").onclick = toggleMic;
    log.scrollTop = log.scrollHeight;
  }
  function renderQuick() {
    var q = el("tQuick"); if (!q) return;
    var c = CL.context, items = [];
    if (c.question) items.push(["tutor.q.explainCurrent", "Explain the practice question I'm looking at: what concept it tests, why the correct answer is right, and why the others are wrong."]);
    items.push(["tutor.q.quiz", "Quiz me with one original multiple-choice question" + (c.certTitle ? " on " + c.certTitle : "") + ". Wait for my answer before revealing it."]);
    items.push(["tutor.q.example", "Explain a key concept" + (c.certTitle ? " from " + c.certTitle : "") + (c.question ? " (the one in my current question)" : "") + " with a real-world scenario, e.g. a hospital robot outage handled step by step."]);
    items.push(["tutor.q.summary", "Give me the 5 most important ideas to remember" + (c.certTitle ? " for " + c.certTitle : " across my certification roadmap") + ", as a short bullet list."]);
    q.innerHTML = items.map(function (x, i) { return '<button type="button" class="btn sm ai" data-q="' + i + '">' + esc(t(x[0])) + "</button>"; }).join("");
    q.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { var it = items[+b.getAttribute("data-q")]; send(it[1], t(it[0])); }; });
  }
  function addMsg(role, content, ephemeral) {
    var log = el("tLog"); if (!log) return null;
    var d = document.createElement("div"); d.className = "msg " + role;
    if (role === "assistant") d.style.setProperty("--tc", Tutors.current().color);
    d.innerHTML = role === "user" ? esc(content) : md(content);
    if (role === "assistant" && !ephemeral) appendTools(d, content);
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function appendTools(d, content) {
    var tools = document.createElement("div"); tools.className = "msg-tools";
    tools.innerHTML = '<button type="button" data-say>🔊 ' + esc(t("tutor.listen")) + '</button><button type="button" data-copy>📋 ' + esc(t("tutor.copy")) + "</button>";
    tools.querySelector("[data-say]").onclick = function () { CL.speakOrStop(content); };
    tools.querySelector("[data-copy]").onclick = function () { navigator.clipboard && navigator.clipboard.writeText(content).then(function () { CL.toast(t("tutor.copied")); }); };
    d.appendChild(tools);
  }
  function send(text, display) {
    text = (text || "").trim(); if (!text || busy) return;
    var input = el("tInput"); if (input) { input.value = ""; input.style.height = "auto"; }
    addMsg("user", display || text);
    history.push({ role: "user", content: text });
    var c = CL.context;
    var bubble = addMsg("assistant", "", true); bubble.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    busy = true; el("tSend").disabled = true; controller = new AbortController();
    Tutors.setState("thinking", true);
    AI.ask(history, { cert: c.certTitle, question: c.question ? CL.questionText(c.question) : "" }, { signal: controller.signal, onToken: function (d, full) { bubble.innerHTML = md(full); var log = el("tLog"); if (log) log.scrollTop = log.scrollHeight; } })
      .then(function (full) { history.push({ role: "assistant", content: full }); bubble.innerHTML = md(full); appendTools(bubble, full); })
      .catch(function (e) { if (e.name === "AbortError") return; bubble.className = "msg error"; bubble.innerHTML = "⚠️ " + esc(e.message); history.pop(); })
      .finally(function () { busy = false; controller = null; Tutors.setState("thinking", false); var s = el("tSend"); if (s) s.disabled = false; });
  }
  function toggleMic() {
    var mic = el("tMic");
    if (!Voice.sttSupported) { CL.toast(t("tutor.micUnsupported")); return; }
    if (stopListen) { stopListen(); return; }
    var input = el("tInput"), base = input.value ? input.value + " " : "";
    mic.classList.add("listening");
    stopListen = Voice.listen({
      onResult: function (txt, final) { input.value = base + txt; if (final) send(input.value); },
      onError: function (err) { CL.toast("🎙️ " + err); },
      onEnd: function () { stopListen = null; var m = el("tMic"); if (m) m.classList.remove("listening"); }
    });
  }
  function openTutor() { renderDrawer(); drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add("open"); }); fab.setAttribute("aria-expanded", "true"); fab.style.display = "none"; var i = el("tInput"); if (i && matchMedia("(min-width: 700px)").matches) setTimeout(function () { i.focus(); }, 300); }
  function closeTutor() { drawer.classList.remove("open"); fab.setAttribute("aria-expanded", "false"); fab.style.display = ""; Voice.stop(); setTimeout(function () { if (!drawer.classList.contains("open")) drawer.hidden = true; }, 320); }
  fab.onclick = openTutor;
  CL.openTutor = openTutor;
  document.addEventListener("certlab:context", function () { var c = el("tCtx"); if (c) c.textContent = t("tutor.context", { c: ctxLabel() }); renderQuick(); });
  document.addEventListener("certlab:lang", function () { renderFab(); if (drawer.classList.contains("open")) renderDrawer(); });
  document.addEventListener("ai:config", function () { if (drawer.classList.contains("open")) renderDrawer(); });
  document.addEventListener("tutor:change", function () { renderFab(); if (drawer.classList.contains("open")) renderDrawer(); });
  renderFab();
})();
