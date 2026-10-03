/* Web Speech API helpers: speech-to-text (where supported, mainly Chrome/Edge/Safari)
   and text-to-speech. Both degrade gracefully. */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var synth = window.speechSynthesis;
  var current = null;

  function clean(text) {
    return String(text || "").replace(/<[^>]+>/g, " ").replace(/[*_#`>|]/g, " ").replace(/\s+/g, " ").trim();
  }
  function pickVoice(lang, prefer) {
    if (!synth) return null;
    var voices = synth.getVoices() || [];
    var base = lang.split("-")[0];
    var sameLang = voices.filter(function (v) { return v.lang && v.lang.replace("_", "-").indexOf(base) === 0; });
    // Prefer a tutor-specific voice name (e.g. a deeper voice for Atlas) when the browser has it.
    for (var i = 0; prefer && i < prefer.length; i++) {
      var hit = sameLang.find(function (v) { return v.name.indexOf(prefer[i]) !== -1; });
      if (hit) return hit;
    }
    return sameLang.find(function (v) { return v.lang === lang; }) || sameLang[0] || null;
  }

  window.Voice = {
    sttSupported: !!SR,
    ttsSupported: !!(synth && window.SpeechSynthesisUtterance),
    speaking: function () { return !!(synth && synth.speaking); },
    speak: function (text, opts) {
      opts = opts || {};
      if (!this.ttsSupported) return false;
      synth.cancel();
      var lang = opts.lang || (window.i18n ? window.i18n.speechLang() : "en-US");
      // Chrome cuts off very long utterances; speak in sentence-sized chunks.
      var chunks = clean(text).match(/[^.!?]+[.!?]*\s*/g) || [];
      var merged = [], buf = "";
      chunks.forEach(function (c) { if ((buf + c).length > 220) { if (buf) merged.push(buf); buf = c; } else buf += c; });
      if (buf) merged.push(buf);
      var voice = pickVoice(lang, opts.prefer);
      merged.forEach(function (part, i) {
        var u = new SpeechSynthesisUtterance(part);
        u.lang = lang; if (voice) u.voice = voice; u.rate = opts.rate || 1; u.pitch = opts.pitch || 1;
        if (i === 0 && opts.onstart) u.onstart = opts.onstart;
        if (i === merged.length - 1 && opts.onend) { u.onend = opts.onend; u.onerror = opts.onend; }
        synth.speak(u);
      });
      return true;
    },
    stop: function () { if (synth) synth.cancel(); },
    /* listen({onResult(text, isFinal), onEnd, onError}) -> stop function or null */
    listen: function (cb) {
      if (!SR) return null;
      if (current) { try { current.stop(); } catch (e) {} }
      var rec = new SR();
      rec.lang = window.i18n ? window.i18n.speechLang() : "en-US";
      rec.interimResults = true; rec.continuous = false;
      rec.onresult = function (e) {
        var text = ""; var final = false;
        for (var i = e.resultIndex; i < e.results.length; i++) { text += e.results[i][0].transcript; if (e.results[i].isFinal) final = true; }
        cb.onResult && cb.onResult(text, final);
      };
      rec.onerror = function (e) { cb.onError && cb.onError(e.error || "error"); };
      rec.onend = function () { current = null; cb.onEnd && cb.onEnd(); };
      rec.start(); current = rec;
      return function () { try { rec.stop(); } catch (e) {} };
    }
  };
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
})();
