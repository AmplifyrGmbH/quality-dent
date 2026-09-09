(function () {
  'use strict';

  /* Eigenständiger FAQ-Chat, unabhängig vom externen chat-api.amplifyr-digital.ch
     Widget (dessen "demo-quality-dent"-Slug serverseitig nicht angelegt ist und
     deshalb "Verbindungsfehler" zeigt). Beantwortet Fragen per Keyword-Matching
     gegen echte Quality-Dent-Fakten — dieselben Daten wie sonst auf der Seite,
     damit Chat-Antworten nie von den sichtbaren Inhalten abweichen. */

  var FAQ = [
    {
      q: 'Welche Leistungen bietet ihr an?',
      kw: ['leistung', 'service', 'angebot', 'anbiet'],
      a: 'Wir fertigen Zirkonoxid-Kronen & Brücken, vollkeramische Restaurationen (Inlays, Onlays, Veneers), Metallkeramik, Implantatprothetik, Teil-, Hybrid- und Totalprothesen, Modellguss-Prothesen, Schienen aller Art sowie Valplast. Details finden Sie im Bereich „Leistungen" oben auf der Seite.'
    },
    {
      q: 'Wie läuft euer digitaler Workflow ab?',
      kw: ['workflow', 'digital', 'cad', 'cam', 'ablauf', 'sirona', '3shape', 'exocad', 'stl'],
      a: 'Abformung (digital oder analog) → digitale Planung in Exocad/3Shape → Fräsen & Drucken mit Sirona inLab → Handfinish → Qualitätskontrolle → Lieferung an Ihre Praxis. Seit über 7 Jahren kombinieren wir CAD/CAM-Präzision mit manueller Feinarbeit.'
    },
    {
      q: 'Wann habt ihr geöffnet?',
      kw: ['öffnungszeit', 'geöffnet', 'offen', 'zeiten'],
      a: 'Montag bis Mittwoch 7:00–12:00 und 13:00–18:00 Uhr, Donnerstag 7:30–12:00 und 13:00–17:30 Uhr, Freitag 8:00–12:00 und 13:00–17:00 Uhr. Samstag und Sonntag geschlossen.'
    },
    {
      q: 'Wo befindet ihr euch?',
      kw: ['wo seid', 'standort', 'adresse', 'anfahrt', 'regensdorf'],
      a: 'Quality Dent AG, Ostring 6, 8105 Regensdorf — im Zürcher Unterland, gut erreichbar mit dem Auto.'
    },
    {
      q: 'Wie erreiche ich euch?',
      kw: ['kontakt', 'telefon', 'anrufen', 'e-mail', 'email', 'erreich'],
      a: 'Telefonisch unter 044 810 44 77 oder per E-Mail an info@quality-dent.ch. Für einen konkreten Termin nutzen Sie gerne den Terminassistenten weiter unten auf der Seite.'
    },
    {
      q: 'Was kostet eine Krone oder Prothese?',
      kw: ['kost', 'preis', 'tarif', 'günstig'],
      a: 'Die Kosten hängen stark vom individuellen Fall ab (Material, Umfang, Aufwand) und lassen sich pauschal nicht seriös nennen. Am schnellsten geht es über eine kurze Beratungsanfrage — Anliegen „Beratungstermin" im Terminassistenten wählen, wir melden uns mit einer Einschätzung.'
    },
    {
      q: 'Seit wann gibt es Quality Dent?',
      kw: ['seit wann', 'geschichte', 'gegründet', 'jahre'],
      a: '2016 als kleines Labor in Opfikon gestartet, im März 2020 als Quality Dent AG in Wallisellen gegründet, seit Januar 2025 mit neuem, voll digitalisiertem Labor in Regensdorf.'
    },
    {
      q: 'Kann ich online einen Termin buchen?',
      kw: ['termin', 'buchen', 'anfrage stellen'],
      a: 'Ja — im Bereich „Termin" weiter unten führt Sie der Terminassistent in drei Schritten durch Anliegen, Wunschtermin und Kontaktdaten. Wir bestätigen werktags innerhalb von 24 Stunden.'
    },
    {
      q: 'Arbeitet ihr mit Zahnarztpraxen zusammen?',
      kw: ['praxis', 'praxen', 'zahnarzt', 'partner'],
      a: 'Ja, wir sind ein Dentallabor und arbeiten primär mit Zahnarztpraxen im Grossraum Zürich zusammen — von der Fallabholung bis zur termingerechten Lieferung.'
    }
  ];

  var GREETING = 'Grüezi! 👋 Ich bin der Quality-Dent-Assistent und kenne mich mit unseren Leistungen, dem digitalen Workflow, Öffnungszeiten und Terminen aus. Was möchten Sie wissen?';
  var FALLBACK = 'Dazu habe ich leider keine passende Antwort parat. Rufen Sie uns gerne direkt an (044 810 44 77) oder schreiben Sie uns an info@quality-dent.ch — oder stellen Sie Ihre Frage etwas anders, vielleicht kann ich dann weiterhelfen.';

  /* Umlaute/ß auf Basisbuchstaben abbilden, BEVOR verglichen wird — sonst
     verfehlt z.B. eine Autokorrektur/Tastatur-Schreibweise ohne Umlaut
     ("oeffnungszeit" statt "öffnungszeit") jedes Keyword, das den Umlaut
     enthält. Siehe SKILL.md "Chatbot antwortet nicht auf naheliegende
     Fragen". */
  function stripDiacritics(s) {
    return s.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
  }

  function findAnswer(text) {
    var low = stripDiacritics(text.toLowerCase());
    for (var i = 0; i < FAQ.length; i++) {
      var kws = FAQ[i].kw;
      for (var j = 0; j < kws.length; j++) {
        if (low.indexOf(stripDiacritics(kws[j])) !== -1) return FAQ[i].a;
      }
    }
    return FALLBACK;
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.id = 'qdChatPanel';
    panel.className = 'qd-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Quality Dent Assistent');
    panel.innerHTML =
      '<div class="qd-chat-head">' +
        '<div class="qd-chat-head__av">🦷</div>' +
        '<div class="qd-chat-head__meta"><b>Quality Dent Assistent</b><span><span class="qd-chat-dot"></span>Online</span></div>' +
        '<button type="button" class="qd-chat-close" id="qdChatClose" aria-label="Chat schliessen">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="qd-chat-msgs" id="qdChatMsgs"></div>' +
      '<div class="qd-chat-quick" id="qdChatQuick"></div>' +
      '<form class="qd-chat-form" id="qdChatForm">' +
        '<input type="text" id="qdChatInput" placeholder="Ihre Frage …" autocomplete="off">' +
        '<button type="submit" class="qd-chat-send" aria-label="Senden">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</form>';
    document.body.appendChild(panel);
    return panel;
  }

  var panel = null, msgsEl = null, opened = false;

  function addMsg(text, who) {
    var m = document.createElement('div');
    m.className = 'qd-chat-msg qd-chat-msg--' + who;
    m.textContent = text;
    msgsEl.appendChild(m);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function botSay(text) {
    var typing = document.createElement('div');
    typing.className = 'qd-chat-msg qd-chat-msg--bot qd-chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    var delay = 450 + Math.min(text.length * 6, 700);
    window.setTimeout(function () {
      typing.remove();
      addMsg(text, 'bot');
    }, delay);
  }

  function ask(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    botSay(findAnswer(text));
  }

  window.qdOpenChat = function () {
    if (!panel) {
      panel = buildPanel();
      msgsEl = document.getElementById('qdChatMsgs');
      var quickEl = document.getElementById('qdChatQuick');
      FAQ.slice(0, 4).forEach(function (item) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'qd-chat-quick__btn';
        b.textContent = item.q;
        b.addEventListener('click', function () { ask(item.q); });
        quickEl.appendChild(b);
      });
      document.getElementById('qdChatClose').addEventListener('click', window.qdCloseChat);
      document.getElementById('qdChatForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var input = document.getElementById('qdChatInput');
        var val = input.value;
        input.value = '';
        ask(val);
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.qdCloseChat(); });
    }
    panel.classList.add('is-open');
    opened = true;
    if (msgsEl.children.length === 0) botSay(GREETING);
    window.setTimeout(function () { document.getElementById('qdChatInput').focus(); }, 300);
  };

  window.qdCloseChat = function () {
    if (panel) panel.classList.remove('is-open');
  };
})();
