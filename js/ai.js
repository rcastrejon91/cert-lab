/* AI client. Two modes:
   - "proxy" (DEFAULT): calls the built-in Cloudflare Worker from js/config.js. No key in the
     browser; the Worker owns the system prompt, model, limits and the API key secret.
   - "custom" (Advanced / developer): any OpenAI-compatible /chat/completions endpoint with
     your own key, stored only in localStorage ("certlab:ai"). */
(function () {
  var KEY = "certlab:ai";
  var PRESETS = {
    xai:        { label: "xAI Grok",   baseUrl: "https://api.x.ai/v1",          model: "grok-4.3",      keyUrl: "https://console.x.ai/" },
    openai:     { label: "OpenAI",     baseUrl: "https://api.openai.com/v1",    model: "gpt-5.4-mini",  keyUrl: "https://platform.openai.com/api-keys" },
    openrouter: { label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "x-ai/grok-4.3", keyUrl: "https://openrouter.ai/keys" },
    custom:     { label: "Custom", baseUrl: "", model: "", keyUrl: "" }
  };
  function load() {
    var d = { mode: "proxy", provider: "xai", baseUrl: PRESETS.xai.baseUrl, model: PRESETS.xai.model, apiKey: "", temperature: 0.4 };
    try { Object.assign(d, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
    if (d.mode !== "custom") d.mode = "proxy";
    return d;
  }
  function proxyUrl() { var c = window.CERTLAB_CONFIG || {}; return (c.proxyUrl || "").replace(/\/+$/, ""); }

  async function post(url, headers, body, opts) {
    var stream = typeof opts.onToken === "function";
    if (stream) body.stream = true;
    var res = await fetch(url, { method: "POST", headers: headers, body: JSON.stringify(body), signal: opts.signal });
    if (!res.ok) {
      var txt = ""; try { txt = await res.text(); } catch (e) {}
      var msg = txt; try { var j = JSON.parse(txt); msg = (j.error && (j.error.message || j.error)) || j.message || txt; } catch (e) {}
      var err = new Error((res.status === 429 ? "⏳ " : "HTTP " + res.status + ": ") + String(msg || "").slice(0, 300)); err.status = res.status; throw err;
    }
    if (!stream || !res.body || !res.body.getReader) {
      var data = await res.json();
      var out = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      if (stream && out) opts.onToken(out, out);
      return out;
    }
    var reader = res.body.getReader(), dec = new TextDecoder(), buf = "", full = "";
    while (true) {
      var r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, { stream: true });
      var lines = buf.split("\n"); buf = lines.pop();
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line.startsWith("data:")) continue;
        var payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          var j2 = JSON.parse(payload);
          var delta = j2.choices && j2.choices[0] && j2.choices[0].delta && j2.choices[0].delta.content;
          if (delta) { full += delta; opts.onToken(delta, full); }
        } catch (e) { /* keep-alive / partial */ }
      }
    }
    return full;
  }

  var AI = {
    PRESETS: PRESETS,
    config: load(),
    proxyUrl: proxyUrl,
    save: function (cfg) { this.config = Object.assign({}, this.config, cfg); localStorage.setItem(KEY, JSON.stringify(this.config)); document.dispatchEvent(new CustomEvent("ai:config")); },
    forgetKey: function () { this.save({ apiKey: "" }); },
    proxyConfigured: function () { var u = proxyUrl(); return !!u && !/YOUR-/i.test(u); },
    isCustom: function () { return this.config.mode === "custom"; },
    isReady: function () {
      if (!this.isCustom()) return this.proxyConfigured();
      var c = this.config; return !!(c.baseUrl && c.model && (c.apiKey || c.provider === "custom"));
    },
    customHeaders: function () {
      var h = { "Content-Type": "application/json" };
      if (this.config.apiKey) h["Authorization"] = "Bearer " + this.config.apiKey;
      if (this.config.provider === "openrouter") { h["HTTP-Referer"] = location.origin; h["X-Title"] = "Ricardo's Cert Lab"; }
      return h;
    },
    /* High-level call used by the tutor and inline AI buttons.
       history: [{role:'user'|'assistant', content}], ctx: {cert, question} */
    ask: function (history, ctx, opts) {
      opts = opts || {};
      if (!this.isReady()) return Promise.reject(new Error("AI is not available yet."));
      var tutor = window.Tutors ? Tutors.currentId() : "lyra";
      var lang = window.i18n ? window.i18n.lang : "en";
      if (!this.isCustom()) {
        // The Worker builds the (scoped) system prompt; we only pass known, size-limited context.
        return post(proxyUrl() + "/chat/completions", { "Content-Type": "application/json" }, {
          messages: history.slice(-12),
          certlab: { tutor: tutor, lang: lang, cert: (ctx && ctx.cert) || "", question: (ctx && ctx.question) || "" }
        }, opts);
      }
      var msgs = [{ role: "system", content: this.systemPrompt(ctx) }].concat(history.slice(-12));
      return post(this.config.baseUrl.replace(/\/+$/, "") + "/chat/completions", this.customHeaders(), { model: this.config.model, messages: msgs, temperature: Number(this.config.temperature) || 0.4 }, opts);
    },
    listModels: async function () {
      var res = await fetch(this.config.baseUrl.replace(/\/+$/, "") + "/models", { headers: this.customHeaders() });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      return (data.data || data.models || []).map(function (m) { return m.id || m.name; }).filter(Boolean).sort();
    },
    test: function () { return this.ask([{ role: "user", content: "Reply with exactly: OK" }], null, {}); },

    /* System prompt for custom (developer) mode. The Worker has its own equivalent. */
    systemPrompt: function (ctx) {
      var lang = window.i18n ? window.i18n.aiLanguage() : "English";
      var t = window.Tutors ? Tutors.current() : null;
      var parts = [
        t ? t.personality : "",
        "You are a certification study tutor inside \"Ricardo's Cert Lab\", a space-themed study site covering FEMA ICS-100/200, tech incident management (PagerDuty-style), ITIL 4 Foundation and AWS Cloud Practitioner.",
        "The learner is Ricardo, a lead clinical robotics technician in Chicago moving into incident management and IT operations. When useful, relate concepts to hospital/clinical robotics operations.",
        "Always answer in " + lang + ". Keep answers concise and skimmable (short paragraphs, bullets, bold key terms).",
        "Only help with studying these certifications, related IT/ops/cloud/incident-management topics, and career prep for them; politely steer anything else back to studying.",
        "Never reproduce or claim to know real exam questions or brain dumps; offer original practice instead. If unsure about current exam details, say so and point to the official site.",
        "When quizzing, ask ONE original multiple-choice question (A–D) at a time and wait for the answer before explaining."
      ];
      if (ctx && ctx.cert) parts.push("Current section: " + ctx.cert + ".");
      if (ctx && ctx.question) parts.push("Practice question on screen:\n" + ctx.question);
      return parts.filter(Boolean).join("\n");
    }
  };
  window.AI = AI;
})();
