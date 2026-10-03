/* UI strings. Add a language by adding another top-level key with the same
   keys (missing keys fall back to English). Study content (notes/questions)
   stays in its authored language; the AI tutor can translate on demand. */
window.CERTLAB_I18N = {
  en: {
    _name: "English", _speech: "en-US", _aiName: "English",
    skip: "Skip to content",
    "nav.home": "Home", "nav.roadmap": "Roadmap", "nav.progress": "Progress",
    "footer.original": "All practice questions are original and written from public syllabus concepts — they are not real exam questions. Always confirm exam details on the official sites.",
    "footer.storage": "Progress and AI settings are saved only in this browser (localStorage). <a href=\"#/progress\">Manage progress</a>",
    "home.kicker": "Mission control",
    "home.title": "Ricardo's <span class=\"grad\">Cert Lab</span>",
    "home.lead": "From clinical robotics to incident command. Study notes, original practice questions, timed mock exams and flashcards — one planet per certification.",
    "home.start": "Start with the roadmap", "home.missions": "Missions",
    "home.stat.questions": "practice questions", "home.stat.mastered": "mastered", "home.stat.exams": "mock exams", "home.stat.passed": "missions complete",
    "home.official": "Official links", "home.open": "Launch", "home.qcount": "{n} questions",
    "home.aiCard.title": "AI tutors", "home.aiCard.on": "Built in — pick a tutor and ask away. No key needed.", "home.aiCard.off": "The built-in AI tutor isn't deployed yet — everything else works without it. Pick your tutor now:",
    "tab.notes": "Notes", "tab.practice": "Practice", "tab.exam": "Mock exam", "tab.cards": "Flashcards",
    "cert.mastery": "Mastery", "cert.examFormat": "Exam format", "cert.realExam": "Real exam", "cert.mockExam": "This site's mock",
    "notes.listen": "Listen", "notes.stop": "Stop", "notes.expandAll": "Expand all",
    "practice.topic": "Topic", "practice.all": "All topics", "practice.missed": "Missed / unanswered only", "practice.shuffle": "Shuffle",
    "practice.q": "Question {i} of {n}", "practice.correct": "Correct!", "practice.wrong": "Not quite", "practice.answerWas": "Answer: {a}",
    "practice.next": "Next question", "practice.prev": "Previous", "practice.session": "Session: {c}/{n} correct",
    "practice.none": "Nothing here — every question in this filter is mastered. 🎉", "practice.restart": "Restart",
    "ai.explain": "Explain more", "ai.example": "Explain with an example", "ai.translate": "AI translate", "ai.quiz": "Quiz me",
    "ai.needKey": "The AI tutor isn't available yet.",
    "exam.intro": "{n} questions · {m} minutes · pass = {p} correct ({pct}%)",
    "exam.start": "Start mock exam", "exam.submit": "Submit exam", "exam.flag": "Flag", "exam.unflag": "Unflag",
    "exam.confirmSubmit": "Submit now? {u} question(s) unanswered.", "exam.confirmLeave": "Leave the exam? Your progress in this attempt will be lost.",
    "exam.timeUp": "Time's up — exam submitted.", "exam.pass": "MISSION COMPLETE", "exam.fail": "MISSION ABORTED — REFUEL & RETRY",
    "exam.score": "{c} / {n} correct ({pct}%) · needed {p}", "exam.review": "Review answers", "exam.again": "New attempt", "exam.history": "Previous attempts",
    "exam.date": "Date", "exam.result": "Result", "exam.time": "Time", "exam.yourAnswer": "Your answer", "exam.unanswered": "Unanswered",
    "cards.flip": "Tap to flip", "cards.know": "Got it", "cards.again": "Review again", "cards.shuffle": "Shuffle", "cards.known": "{k} of {n} known", "cards.onlyUnknown": "Unknown only",
    "progress.title": "Flight log", "progress.reset": "Reset this section", "progress.resetAll": "Reset ALL progress", "progress.confirm": "Erase progress? This cannot be undone.",
    "progress.export": "Export progress", "progress.import": "Import progress", "progress.imported": "Progress imported",
    "roadmap.title": "Flight plan", "roadmap.lead": "Suggested order for moving from clinical robotics into incident management and IT operations.",
    "settings.title": "AI tutor settings", "settings.provider": "Provider preset", "settings.baseUrl": "Base URL (OpenAI-compatible)", "settings.model": "Model",
    "settings.key": "API key", "settings.keyHint": "Stored only in this browser's localStorage and sent only to the base URL above. Never committed anywhere. Use a key with a spending limit.",
    "settings.fetchModels": "Fetch models", "settings.test": "Test connection", "settings.save": "Save", "settings.forget": "Forget key", "settings.close": "Close",
    "settings.saved": "Settings saved", "settings.ok": "Connected ✓", "settings.temp": "Creativity (temperature)", "settings.proxyHint": "Using your own proxy (e.g. the optional Cloudflare Worker)? Choose Custom and enter its URL; the key can then be blank.",
    "tutor.fab": "Ask the AI tutor", "tutor.title": "AI tutor", "tutor.placeholder": "Ask anything about this cert…", "tutor.send": "Send",
    "tutor.setupTitle": "Connect your AI tutor", "tutor.setupBody": "Paste your own API key (xAI Grok, OpenAI, OpenRouter or any OpenAI-compatible endpoint). It stays in this browser. The rest of the site works fully without it.",
    "tutor.openSettings": "Open settings", "tutor.clear": "Clear chat", "tutor.context": "Context: {c}", "tutor.general": "General study help",
    "tutor.q.explainCurrent": "Explain this question", "tutor.q.quiz": "Quiz me", "tutor.q.example": "Real-world example", "tutor.q.summary": "Summarize key ideas",
    "tutor.listen": "Read aloud", "tutor.copy": "Copy", "tutor.copied": "Copied", "tutor.mic": "Voice input", "tutor.micUnsupported": "Voice input isn't supported in this browser.",
    "tts.unsupported": "Read-aloud isn't supported in this browser.",
    "visual.title": "Visual explainer", "visual.soon": "coming soon — diagrams and short videos generated for each concept.",
    "tutor.ask": "Ask {name}", "tutor.offTitle": "AI tutor is warming up its engines", "tutor.offBody": "The built-in AI isn't deployed yet. Everything else on the site works fully. (Developers: set proxyUrl in js/config.js, or use Advanced settings with your own key.)",
    "settings.builtin": "Built-in AI", "settings.builtinOn": "Connected", "settings.builtinOff": "Not deployed yet", "settings.builtinHint": "No key needed — the site's AI proxy handles it. Daily usage limits apply.", "settings.builtinOffHint": "The AI proxy URL in js/config.js is still a placeholder. See DEPLOY.md.",
    "settings.tutor": "Tutor personality", "settings.advanced": "Advanced (developer): use my own API key", "settings.advancedHint": "Bypasses the built-in proxy and calls an OpenAI-compatible endpoint directly from this browser.",
    "lang.label": "Language"
  },
  es: {
    _name: "Español", _speech: "es-US", _aiName: "Spanish (Latin American)",
    skip: "Saltar al contenido",
    "nav.home": "Inicio", "nav.roadmap": "Ruta", "nav.progress": "Progreso",
    "footer.original": "Todas las preguntas de práctica son originales y se basan en conceptos públicos del temario; no son preguntas reales de examen. Confirma siempre los detalles en los sitios oficiales.",
    "footer.storage": "El progreso y la configuración de IA se guardan solo en este navegador (localStorage). <a href=\"#/progress\">Administrar progreso</a>",
    "home.kicker": "Control de misión",
    "home.title": "El <span class=\"grad\">Cert Lab</span> de Ricardo",
    "home.lead": "De la robótica clínica al mando de incidentes. Notas de estudio, preguntas originales, exámenes simulados cronometrados y tarjetas — un planeta por certificación.",
    "home.start": "Empieza por la ruta", "home.missions": "Misiones",
    "home.stat.questions": "preguntas de práctica", "home.stat.mastered": "dominadas", "home.stat.exams": "exámenes simulados", "home.stat.passed": "misiones cumplidas",
    "home.official": "Enlaces oficiales", "home.open": "Despegar", "home.qcount": "{n} preguntas",
    "home.aiCard.title": "Tutores con IA", "home.aiCard.on": "Integrado: elige un tutor y pregunta. No necesitas clave.", "home.aiCard.off": "El tutor IA integrado aún no está desplegado; todo lo demás funciona sin él. Elige tu tutor:",
    "tab.notes": "Notas", "tab.practice": "Práctica", "tab.exam": "Simulacro", "tab.cards": "Tarjetas",
    "cert.mastery": "Dominio", "cert.examFormat": "Formato del examen", "cert.realExam": "Examen real", "cert.mockExam": "Simulacro de este sitio",
    "notes.listen": "Escuchar", "notes.stop": "Detener", "notes.expandAll": "Expandir todo",
    "practice.topic": "Tema", "practice.all": "Todos los temas", "practice.missed": "Solo falladas / sin responder", "practice.shuffle": "Mezclar",
    "practice.q": "Pregunta {i} de {n}", "practice.correct": "¡Correcto!", "practice.wrong": "Casi", "practice.answerWas": "Respuesta: {a}",
    "practice.next": "Siguiente pregunta", "practice.prev": "Anterior", "practice.session": "Sesión: {c}/{n} correctas",
    "practice.none": "Nada por aquí: dominaste todas las preguntas de este filtro. 🎉", "practice.restart": "Reiniciar",
    "ai.explain": "Explicar más", "ai.example": "Explicar con un ejemplo", "ai.translate": "Traducir con IA", "ai.quiz": "Ponme a prueba",
    "ai.needKey": "El tutor IA aún no está disponible.",
    "exam.intro": "{n} preguntas · {m} minutos · aprobar = {p} correctas ({pct}%)",
    "exam.start": "Iniciar simulacro", "exam.submit": "Entregar examen", "exam.flag": "Marcar", "exam.unflag": "Desmarcar",
    "exam.confirmSubmit": "¿Entregar ahora? {u} pregunta(s) sin responder.", "exam.confirmLeave": "¿Salir del examen? Se perderá este intento.",
    "exam.timeUp": "Se acabó el tiempo: examen entregado.", "exam.pass": "MISIÓN CUMPLIDA", "exam.fail": "MISIÓN ABORTADA — RECARGA E INTENTA DE NUEVO",
    "exam.score": "{c} / {n} correctas ({pct}%) · se necesitaban {p}", "exam.review": "Revisar respuestas", "exam.again": "Nuevo intento", "exam.history": "Intentos anteriores",
    "exam.date": "Fecha", "exam.result": "Resultado", "exam.time": "Tiempo", "exam.yourAnswer": "Tu respuesta", "exam.unanswered": "Sin responder",
    "cards.flip": "Toca para voltear", "cards.know": "La sé", "cards.again": "Repasar", "cards.shuffle": "Mezclar", "cards.known": "{k} de {n} aprendidas", "cards.onlyUnknown": "Solo no aprendidas",
    "progress.title": "Bitácora de vuelo", "progress.reset": "Reiniciar esta sección", "progress.resetAll": "Reiniciar TODO el progreso", "progress.confirm": "¿Borrar el progreso? No se puede deshacer.",
    "progress.export": "Exportar progreso", "progress.import": "Importar progreso", "progress.imported": "Progreso importado",
    "roadmap.title": "Plan de vuelo", "roadmap.lead": "Orden sugerido para pasar de la robótica clínica a la gestión de incidentes y operaciones de TI.",
    "settings.title": "Ajustes del tutor IA", "settings.provider": "Proveedor", "settings.baseUrl": "URL base (compatible con OpenAI)", "settings.model": "Modelo",
    "settings.key": "Clave API", "settings.keyHint": "Se guarda solo en el localStorage de este navegador y solo se envía a la URL base. Nunca se sube a ningún repositorio. Usa una clave con límite de gasto.",
    "settings.fetchModels": "Ver modelos", "settings.test": "Probar conexión", "settings.save": "Guardar", "settings.forget": "Olvidar clave", "settings.close": "Cerrar",
    "settings.saved": "Ajustes guardados", "settings.ok": "Conectado ✓", "settings.temp": "Creatividad (temperatura)", "settings.proxyHint": "¿Usas tu propio proxy (p. ej. el Cloudflare Worker opcional)? Elige Personalizado e ingresa su URL; la clave puede quedar vacía.",
    "tutor.fab": "Pregunta al tutor IA", "tutor.title": "Tutor IA", "tutor.placeholder": "Pregunta lo que quieras sobre esta certificación…", "tutor.send": "Enviar",
    "tutor.setupTitle": "Conecta tu tutor IA", "tutor.setupBody": "Pega tu propia clave API (xAI Grok, OpenAI, OpenRouter o cualquier endpoint compatible con OpenAI). Se queda en este navegador. El resto del sitio funciona sin ella.",
    "tutor.openSettings": "Abrir ajustes", "tutor.clear": "Borrar chat", "tutor.context": "Contexto: {c}", "tutor.general": "Ayuda general de estudio",
    "tutor.q.explainCurrent": "Explica esta pregunta", "tutor.q.quiz": "Ponme a prueba", "tutor.q.example": "Ejemplo real", "tutor.q.summary": "Resume las ideas clave",
    "tutor.listen": "Leer en voz alta", "tutor.copy": "Copiar", "tutor.copied": "Copiado", "tutor.mic": "Entrada de voz", "tutor.micUnsupported": "Este navegador no admite entrada de voz.",
    "tts.unsupported": "Este navegador no admite lectura en voz alta.",
    "visual.title": "Explicación visual", "visual.soon": "próximamente: diagramas y videos cortos para cada concepto.",
    "tutor.ask": "Pregunta a {name}", "tutor.offTitle": "El tutor IA está calentando motores", "tutor.offBody": "La IA integrada aún no está desplegada. Todo lo demás del sitio funciona por completo. (Desarrolladores: configuren proxyUrl en js/config.js o usen Ajustes avanzados con su propia clave).",
    "settings.builtin": "IA integrada", "settings.builtinOn": "Conectada", "settings.builtinOff": "Aún no desplegada", "settings.builtinHint": "No necesitas clave: el proxy de IA del sitio se encarga. Hay límites de uso diario.", "settings.builtinOffHint": "La URL del proxy en js/config.js sigue siendo un marcador. Ver DEPLOY.md.",
    "settings.tutor": "Personalidad del tutor", "settings.advanced": "Avanzado (desarrollador): usar mi propia clave API", "settings.advancedHint": "Omite el proxy integrado y llama directamente a un endpoint compatible con OpenAI desde este navegador.",
    "lang.label": "Idioma"
  }
};
(function () {
  var I = window.CERTLAB_I18N;
  window.i18n = {
    lang: "en",
    t: function (key, vars) {
      var s = (I[this.lang] && I[this.lang][key]) || I.en[key] || key;
      if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
      return s;
    },
    languages: function () { return Object.keys(I).map(function (k) { return { code: k, name: I[k]._name }; }); },
    speechLang: function () { return (I[this.lang] && I[this.lang]._speech) || "en-US"; },
    aiLanguage: function () { return (I[this.lang] && I[this.lang]._aiName) || "English"; },
    apply: function (root) {
      (root || document).querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = window.i18n.t(el.getAttribute("data-i18n")); });
      (root || document).querySelectorAll("[data-i18n-html]").forEach(function (el) { el.innerHTML = window.i18n.t(el.getAttribute("data-i18n-html")); });
    }
  };
})();
