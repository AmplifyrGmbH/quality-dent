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

  /* "KI-Berater fragen" -> öffnet das eingebettete Chat-Widget (#ac-panel),
     dessen eigener Trigger-Button (#ac-btn) per CSS ausgeblendet ist. */
  var optChat = document.getElementById('fchatOptChat');
  var greetingShown = false;

  function showGreeting(messages) {
    if (greetingShown || !messages) return;
    greetingShown = true;
    var bubble = document.createElement('div');
    bubble.innerHTML = '<strong>Grüezi! 👋 Willkommen bei Quality Dent.</strong><br><br>' +
      'Fragen Sie mich zu unseren Leistungen, dem digitalen Workflow oder einem Termin — ich helfe gerne weiter.';
    bubble.style.cssText = 'background:#f1f5f9;border-radius:14px 14px 14px 4px;padding:12px 14px;font-size:.875rem;line-height:1.55;color:#1e293b;margin-bottom:4px;';
    messages.prepend(bubble);
  }

  if (optChat) optChat.addEventListener('click', function () {
    closeAll();
    var panel = document.getElementById('ac-panel');
    var embedBtn = document.getElementById('ac-btn');
    if (panel && panel.classList.contains('ac-hidden')) {
      panel.classList.remove('ac-hidden');
      showGreeting(document.getElementById('ac-messages'));
    } else if (embedBtn) {
      embedBtn.click();
    }
  });
})();
