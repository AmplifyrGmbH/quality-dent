(function () {
  'use strict';

  var bkState = { reason: null, date: null, time: null };
  var reasonGrid = document.getElementById('reasonGrid');
  if (!reasonGrid) return; // booking widget not on this page

  var reasonAdvanceTimer = null;
  reasonGrid.querySelectorAll('.chip-opt').forEach(function (el) {
    el.addEventListener('click', function () {
      reasonGrid.querySelectorAll('.chip-opt').forEach(function (x) { x.classList.remove('is-sel'); });
      el.classList.add('is-sel');
      bkState.reason = el.getAttribute('data-val');
      if (reasonAdvanceTimer) clearTimeout(reasonAdvanceTimer);
      reasonAdvanceTimer = window.setTimeout(function () { window.bkNext(1); }, 260);
    });
  });

  var bkDate = document.getElementById('bkDate');
  bkDate.setAttribute('min', new Date().toISOString().slice(0, 10));
  var slotGrid = document.getElementById('slotGrid');
  var bkHoursNote = document.getElementById('bkHoursNote');
  var slotAdvanceTimer = null;

  function slotsForDate(dStr) {
    var d = new Date(dStr + 'T00:00:00');
    var day = d.getDay();
    var ranges;
    if (day >= 1 && day <= 3) ranges = [[7, 0, 12, 0], [13, 0, 18, 0]];
    else if (day === 4) ranges = [[7, 30, 12, 0], [13, 0, 17, 30]];
    else if (day === 5) ranges = [[8, 0, 12, 0], [13, 0, 17, 0]];
    else return [];
    var out = [];
    ranges.forEach(function (r) {
      var h = r[0], m = r[1];
      while (h < r[2] || (h === r[2] && m < r[3])) {
        out.push((h < 10 ? '0' : '') + h + ':' + (m === 0 ? '00' : m));
        m += 30; if (m >= 60) { m = 0; h++; }
      }
    });
    return out;
  }

  bkDate.addEventListener('change', function () {
    var slots = slotsForDate(bkDate.value);
    slotGrid.innerHTML = '';
    bkState.time = null;
    if (!bkDate.value) { bkHoursNote.textContent = 'Wählen Sie ein Datum, um freie Zeitfenster zu sehen.'; return; }
    if (slots.length === 0) { bkHoursNote.textContent = 'An diesem Tag sind wir geschlossen (Sa/So) — bitte anderes Datum wählen.'; return; }
    bkHoursNote.textContent = 'Verfügbare Zeitfenster am ' + new Date(bkDate.value + 'T00:00:00').toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }) + ':';
    slots.forEach(function (t) {
      var b = document.createElement('div');
      b.className = 'slot';
      b.textContent = t;
      b.addEventListener('click', function () {
        slotGrid.querySelectorAll('.slot').forEach(function (x) { x.classList.remove('is-sel'); });
        b.classList.add('is-sel');
        bkState.time = t;
        if (slotAdvanceTimer) clearTimeout(slotAdvanceTimer);
        slotAdvanceTimer = window.setTimeout(function () { window.bkNext(2); }, 260);
      });
      slotGrid.appendChild(b);
    });
  });

  function showPanel(n) {
    document.querySelectorAll('.bk-panel').forEach(function (p) { p.classList.remove('is-active'); });
    var id = n === 'done' ? 'bkPanelDone' : ('bkPanel' + n);
    document.getElementById(id).classList.add('is-active');
    document.querySelectorAll('.bk-steps span').forEach(function (s) {
      s.classList.toggle('is-active', n !== 'done' && parseInt(s.getAttribute('data-s'), 10) <= n);
    });
  }
  function shake(el) {
    el.style.transition = 'transform .08s';
    el.style.transform = 'translateX(-4px)';
    setTimeout(function () { el.style.transform = 'translateX(4px)'; }, 80);
    setTimeout(function () { el.style.transform = 'translateX(0)'; }, 160);
  }

  window.bkNext = function (from) {
    if (from === 1) { if (!bkState.reason) { shake(reasonGrid); return; } }
    if (from === 2) {
      if (!bkDate.value || !bkState.time) { shake(slotGrid); return; }
      bkState.date = bkDate.value;
    }
    if (from === 3) {
      var name = document.getElementById('bkName').value.trim();
      var email = document.getElementById('bkEmail').value.trim();
      if (!name || !email) { shake(document.getElementById('bkPanel3')); return; }
      document.getElementById('sumReason').textContent = bkState.reason;
      var dObj = new Date(bkState.date + 'T00:00:00');
      document.getElementById('sumDate').textContent = dObj.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + bkState.time + ' Uhr';
      var praxis = document.getElementById('bkPraxis').value.trim();
      document.getElementById('sumName').textContent = name + (praxis ? ' · ' + praxis : '');
      var phone = document.getElementById('bkPhone').value.trim();
      document.getElementById('sumContact').textContent = email + (phone ? ' · ' + phone : '');
    }
    showPanel(from + 1);
  };
  window.bkBack = function (from) { showPanel(from - 1); };
  window.bkSubmit = function () {
    var ref = 'QD-2026-' + Math.floor(10000 + Math.random() * 89999);
    document.getElementById('refCode').textContent = ref;
    try { localStorage.setItem('qd_last_booking', JSON.stringify({ ref: ref, reason: bkState.reason, date: bkState.date, time: bkState.time, at: Date.now() })); } catch (e) {}
    showPanel('done');
  };
  window.bkReset = function () {
    bkState = { reason: null, date: null, time: null };
    reasonGrid.querySelectorAll('.chip-opt').forEach(function (x) { x.classList.remove('is-sel'); });
    bkDate.value = ''; slotGrid.innerHTML = ''; bkHoursNote.textContent = 'Wählen Sie ein Datum, um freie Zeitfenster zu sehen.';
    ['bkName', 'bkPraxis', 'bkEmail', 'bkPhone', 'bkMsg'].forEach(function (id) { document.getElementById(id).value = ''; });
    showPanel(1);
  };
})();
