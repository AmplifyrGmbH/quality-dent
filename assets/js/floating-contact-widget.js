(function () {
  'use strict';

  var btn = document.getElementById('fchatBtn');
  var wrap = document.getElementById('fchat');
  if (!btn || !wrap) return;

  function closeAll() {
    wrap.classList.remove('open-opts');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    if (wrap.classList.contains('open-opts')) { closeAll(); }
    else { wrap.classList.add('open-opts'); btn.setAttribute('aria-expanded', 'true'); }
  });

  var optsClose = document.getElementById('fchatOptsClose');
  if (optsClose) optsClose.addEventListener('click', closeAll);

  /* "KI-Berater fragen" -> öffnet den eigenen FAQ-Chat (assets/js/chat.js).
     Kein externer Dienst mehr nötig (der chat-api.amplifyr-digital.ch-Slug
     war serverseitig nie angelegt und zeigte nur "Verbindungsfehler"). */
  var optChat = document.getElementById('fchatOptChat');
  if (optChat) optChat.addEventListener('click', function () {
    closeAll();
    if (window.qdOpenChat) window.qdOpenChat();
  });
})();
