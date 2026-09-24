/*
 * Klick-Mockup „Bedarfserhebung“
 * Eine Instanz läuft entweder als Desktop (?device=desktop) oder Mobile (?device=mobile).
 * Alle Eingaben leben nur im Speicher dieser Seite – nichts wird gespeichert.
 */
(() => {
  'use strict';

  const MOBILE = new URLSearchParams(location.search).get('device') === 'mobile';
  document.documentElement.classList.add(MOBILE ? 'm' : 'd');
  const DESIGN_DOC = 'design/Fortbildung%20UX.dc.html';

  // ---------- Stammdaten ----------
  const LEVELS = ['Einsteigende', 'Fortgeschrittene', 'Experten'];
  const SHORT = { Einsteigende: 'Einsteig.', Fortgeschrittene: 'Fortgeschr.', Experten: 'Experten' };
  const LEVEL_HELP = {
    Einsteigende: 'Wenig Vorerfahrung, Sie möchten einsteigen.',
    Fortgeschrittene: 'Grundlagen vorhanden, Sie möchten vertiefen.',
    Experten: 'Viel Erfahrung, Sie möchten sich spezialisieren.',
  };
  const TARGET_HELP = {
    Einsteigende: 'Für Kolleginnen und Kollegen ohne Vorerfahrung.',
    Fortgeschrittene: 'Für Kolleginnen und Kollegen mit Grundlagen.',
    Experten: 'Für Kolleginnen und Kollegen mit viel Erfahrung.',
  };
  const SUBJECTS = ['Deutsch', 'DaZ', 'Englisch', 'Informatik', 'Mathematik', 'Natur und Technik', 'Sport'];
  const GRADES = ['5., 6.', '7., 8.', '7., 8., 9.', '9., 10.', '11., 12.', '5.–10.'];
  const GRADE_FILTER = ['5', '6', '7', '8', '9', '10', '11', '12'].map((g) => [g, g + '.']);

  const EXAMPLES = [
    {
      subject: 'Natur und Technik',
      situation: 'Im Fach Natur und Technik unterrichte ich unter begrenzten materiellen Bedingungen.',
      bedarf: 'Daraus ergibt sich mein Bedarf zu einfach umsetzbaren Experimenten,',
      ziel: 'um naturwissenschaftliche Inhalte praktisch erfahrbar zu machen.',
    },
    {
      subject: 'Informatik',
      situation: 'Im Informatikunterricht habe ich begrenztes Vorwissen im Umgang mit digitaler Technik.',
      bedarf: 'Ich brauche einen Überblick über kostenlose digitale Angebote,',
      ziel: 'um den Unterricht sicherer planen und bewerten zu können.',
    },
    {
      subject: 'DaZ',
      label: 'Deutsch als Zweitsprache',
      situation: 'In meiner Klasse sind mehrere neu zugewanderte Schülerinnen und Schüler.',
      bedarf: 'Ich brauche Strategien zur Sprachförderung,',
      ziel: 'um diese Schülerinnen und Schüler im Fachunterricht fair zu fördern und zu bewerten.',
    },
  ];
  const OFFER_EXAMPLES = [
    {
      title: 'Tolle Sachen mit KI',
      text: 'Wir probieren gemeinsam drei KI-Werkzeuge für die Unterrichtsvorbereitung aus. Die Teilnehmenden erstellen ein eigenes Arbeitsblatt und reflektieren Chancen und Grenzen. Dauer: 90 Minuten.',
    },
    {
      title: 'Einfache Experimente mit Alltagsmaterial',
      text: 'Fünf erprobte Versuche für Natur und Technik, die mit Material aus dem Supermarkt funktionieren. Alle Versuche werden selbst durchgeführt. Dauer: 2 Stunden.',
    },
    {
      title: 'Sprachsensibler Fachunterricht',
      text: 'Praxisnahe Methoden, um Fachtexte für neu zugewanderte Lernende zugänglich zu machen – mit Beispielen aus Mathematik und Biologie. Dauer: 60 Minuten.',
    },
  ];

  const blankNeed = () => ({ mode: 'einfach', text: '', bedarf: '', ziel: '', niveau: '', fach: '', jgst: '', thema: '', einreichung: 'anonym' });
  const blankOffer = () => ({ reagiert: 'nein', bedarfId: '', title: '', desc: '', zielgruppe: '', fach: '', jgst: '', thema: '' });
  const blankFilter = () => ({ q: '', niveau: 'Alle', fach: '', jgst: '', thema: 'Alle', liked: false, sort: 'votes' });

  // ---------- Zustand (nur im Speicher) ----------
  const S = {
    screen: 'home',
    modal: null,
    flash: null,
    need: blankNeed(),
    editId: null,
    needErr: false,
    textErr: false,
    sideOpen: { melden: true, entdecken: true, angebot: true },
    wishes: [
      {
        id: 1, mode: 'einfach', selected: false,
        text: 'Im Informatikunterricht habe ich begrenztes eigenes Vorwissen im Umgang mit digitaler Technik und bin unsicher hinsichtlich geeigneter Unterrichtsmöglichkeiten und kostenloser digitaler Angebote.',
        bedarf: '', ziel: '', niveau: 'Einsteigende', fach: 'Informatik', jgst: '5., 6.', thema: 'digital', einreichung: 'anonym',
      },
    ],
    needs: [
      { id: 1, niveau: 'Experten', thema: 'digital', fach: 'Natur und Technik', grades: [5, 6], likes: 12, liked: true,
        text: 'Im Fach Natur und Technik unterrichte ich unter begrenzten materiellen Bedingungen und möchte den Unterricht dennoch experimentell und handlungsorientiert gestalten. Daraus ergibt sich mein Fortbildungsbedarf zu einfach umsetzbaren Experimenten mit Alltagsmaterialien, um naturwissenschaftliche Inhalte trotz begrenzter Ausstattung praktisch erfahrbar zu machen.' },
      { id: 2, niveau: 'Einsteigende', thema: 'digital', fach: 'Informatik', grades: [5, 6], likes: 7, liked: false,
        text: 'Im Informatikunterricht habe ich begrenztes eigenes Vorwissen im Umgang mit digitaler Technik und bin unsicher hinsichtlich geeigneter Unterrichtsmöglichkeiten und kostenloser digitaler Angebote. Ich brauche einen Überblick, um den Unterricht sicherer planen zu können.' },
      { id: 3, niveau: 'Einsteigende', thema: 'nicht digital', fach: 'Deutsch, DaZ', grades: [5, 6], likes: 3, liked: false,
        text: 'Förderung und Leistungsbewertung neu zugewanderter Schüler. Praxisnahe Strategien zur Sprachförderung im Fachunterricht.' },
      { id: 4, niveau: 'Fortgeschrittene', thema: 'digital', fach: 'Mathematik', grades: [7, 8, 9], likes: 5, liked: false,
        text: 'Ich setze bereits dynamische Geometriesoftware ein und möchte lernen, wie ich damit offene, differenzierende Aufgaben gestalte, um leistungsstarke und leistungsschwächere Lernende gleichzeitig zu fördern.' },
      { id: 5, niveau: 'Fortgeschrittene', thema: 'nicht digital', fach: 'Sport', grades: [7, 8], likes: 2, liked: false,
        text: 'Im Sportunterricht erlebe ich große Leistungsunterschiede. Ich möchte Methoden zur Binnendifferenzierung kennenlernen, um alle Schülerinnen und Schüler angemessen zu fordern.' },
    ],
    f: blankFilter(),
    expanded: {},
    offer: blankOffer(),
    offerErr: false,
    offers: [
      { id: 1, title: 'Einfache Experimente mit Alltagsmaterial', zielgruppe: 'Einsteigende', thema: 'nicht digital', fach: 'Natur und Technik', jgst: '5., 6.', reagiert: 'ja', bedarfId: '1', desc: '' },
    ],
    offerTab: 'alle',
    lastSubmitted: 0,
    nextId: 100,
  };

  // ---------- Hilfsfunktionen ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cut = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + ' …' : s);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const getPath = (p) => p.split('.').reduce((o, k) => o[k], S);
  const setPath = (p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], S)[last] = v; };
  const needById = (id) => S.needs.find((n) => String(n.id) === String(id));

  const ICON = {
    home: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    right: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    left: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    pen: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    search: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M11 8.5c-.8-1-2.6-1-3 .4-.4 1.6 3 3.6 3 3.6s3.4-2 3-3.6c-.4-1.4-2.2-1.4-3-.4Z" fill="currentColor" stroke-width="1"/></svg>',
    gift: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z"/><path d="M6 9.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3V9.5"/><path d="M21 7.5V13"/></svg>',
  };

  // ---------- Bausteine ----------
  function bars(level, small, on) {
    const w = small ? 3 : 5;
    const hs = small ? [5, 7, 10] : [8, 12, 16];
    return `<span class="bars">${hs.map((h, i) => {
      const bg = i < level ? (on ? '#fff' : '#003d82') : (on ? 'rgba(255,255,255,.35)' : '#c9d1dc');
      return `<i style="width:${w}px;height:${h}px;background:${bg}"></i>`;
    }).join('')}</span>`;
  }
  const lvlIndex = (l) => LEVELS.indexOf(l) + 1;
  const chipLevel = (l) => (l ? `<span class="chip lvl">${bars(lvlIndex(l), true)}${esc(l)}</span>` : '');
  const chipTheme = (t) => (t ? `<span class="chip ${t === 'digital' ? 'dig' : ''}">${esc(t)}</span>` : '');
  const chip = (t, cls = '') => `<span class="chip ${cls}">${esc(t)}</span>`;

  function levelSeg(path, value, { withAll = false, short = false } = {}) {
    const opts = withAll ? ['Alle', ...LEVELS] : LEVELS;
    return `<div class="seg lv">${opts.map((o) => {
      const on = value === o;
      const inner = o === 'Alle' ? 'Alle' : `${bars(lvlIndex(o), false, on)}${short ? SHORT[o] : o}`;
      return `<button type="button" class="${on ? 'on' : ''}" aria-pressed="${on}" data-action="set" data-path="${path}" data-val="${o}">${inner}</button>`;
    }).join('')}</div>`;
  }
  function seg(path, value, opts) {
    return `<div class="seg">${opts.map((o) => {
      const [v, l] = Array.isArray(o) ? o : [o, o];
      const on = value === v;
      return `<button type="button" class="${on ? 'on' : ''}" aria-pressed="${on}" data-action="set" data-path="${path}" data-val="${esc(v)}">${esc(l)}</button>`;
    }).join('')}</div>`;
  }
  function sel(path, value, opts, placeholder, cls = '') {
    return `<select class="select ${cls} ${value ? '' : 'empty'}" data-bind="${path}">${placeholder != null ? `<option value="">${esc(placeholder)}</option>` : ''}${opts.map((o) => {
      const [v, l] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(l)}</option>`;
    }).join('')}</select>`;
  }
  const input = (path, ph) => `<input class="input" data-bind="${path}" placeholder="${esc(ph)}" value="${esc(getPath(path))}">`;
  const ta = (path, ph, h) => `<textarea class="textarea" data-bind="${path}" placeholder="${esc(ph)}" style="min-height:${h}px">${esc(getPath(path))}</textarea>`;
  function fld(label, control, { err = '', help = '', cls = '' } = {}) {
    return `<div class="field ${cls} ${err ? 'err' : ''}"><label>${label}</label>${control}${err ? `<span class="errtext">${esc(err)}</span>` : help ? `<span class="help">${help}</span>` : ''}</div>`;
  }
  const homeBtn = () => `<button class="homebtn" data-action="go" data-arg="home" title="Zur Startseite" aria-label="Zur Startseite">${ICON.home}</button>`;
  const topbar = (withHome = true) => `<div class="topbar">${withHome ? homeBtn() : ''}Bedarfserhebung: TITEL</div>`;
  const flash = () => (S.flash ? `<div class="flash" role="status">✓ ${esc(S.flash)}</div>` : '');
  const likeBtn = (n) => `<button class="like ${n.liked ? 'on' : ''}" data-action="like" data-arg="${n.id}" aria-pressed="${n.liked}">${n.liked ? '♥' : '♡'} Gefällt mir · ${n.likes}</button>`;
  const modeToggle = () => `<div class="mode" role="group" aria-label="Eingabemodus">${[['einfach', 'Einfach'], ['detailliert', 'Detailliert']].map(([v, l]) =>
    `<button type="button" class="${S.need.mode === v ? 'on' : ''}" data-action="needMode" data-arg="${v}">${l}</button>`).join('')}</div>`;
  const gradesText = (g) => g.map((x) => x + '.').join(', ');

  // ---------- Validierung ----------
  const missingNeed = (n) => ['niveau', 'fach', 'thema'].filter((k) => !n[k]);
  const needHasText = (n) => (n.mode === 'einfach' ? n.text.trim() : n.text.trim() && n.bedarf.trim() && n.ziel.trim());
  const missingOfferClass = (o) => ['zielgruppe', 'fach', 'thema'].filter((k) => !o[k]);
  const offerTextOk = (o) => o.title.trim() && o.desc.trim() && (o.reagiert === 'nein' || o.bedarfId);
  const wishText = (w) => (w.mode === 'detailliert' ? [w.text, w.bedarf, w.ziel].filter(Boolean).join(' ') : w.text);

  function textFields(h) {
    const n = S.need;
    const e = (v, msg) => (S.textErr && !v.trim() ? msg : '');
    if (n.mode === 'einfach') {
      return fld(MOBILE ? 'Ihr Fortbildungsbedarf' : 'Ihr Fortbildungsbedarf*', ta('need.text', 'Beschreiben Sie in eigenen Worten, wobei Sie Unterstützung brauchen.', h.simple), {
        err: e(n.text, 'Bitte beschreiben Sie Ihren Bedarf.'),
        help: 'Tipp: Situation, Bedarf und Ziel nennen. Mit „Detailliert“ geht das Schritt für Schritt.',
      });
    }
    return [
      fld(MOBILE ? '1. Konkrete Situation*' : '1. Konkrete Situation aus Ihrem Berufsalltag*', ta('need.text', 'Wo stoßen Sie im Unterricht an Grenzen?', h.d1), { cls: 'c1', err: e(n.text, 'Bitte die Situation beschreiben.'), help: MOBILE ? '' : 'Wo stoßen Sie im Unterricht an Grenzen?' }),
      fld(MOBILE ? '2. Fortbildungsbedarf*' : '2. Sich daraus ergebender Fortbildungsbedarf*', ta('need.bedarf', MOBILE ? 'Was möchten Sie lernen?' : '„… daraus ergibt sich mein Bedarf zu …“', h.d2), { cls: 'c2', err: e(n.bedarf, 'Bitte den Bedarf ergänzen.'), help: MOBILE ? '' : 'Was möchten Sie lernen?' }),
      fld(MOBILE ? '3. Ziel („um-zu“)*' : '3. Ziel(e) des Fortbildungsbedarfs („um-zu“)*', ta('need.ziel', MOBILE ? 'Was soll danach besser gelingen?' : '„… um … zu …“', h.d2), { cls: 'c3', err: e(n.ziel, 'Bitte das Ziel ergänzen.'), help: MOBILE ? '' : 'Was soll danach besser gelingen?' }),
    ].join('');
  }

  function needClassFields() {
    const n = S.need;
    const show = S.needErr;
    const selCls = MOBILE ? 'fill' : '';
    return [
      fld(MOBILE ? 'Aktuelle Erfahrung*' : 'Niveau*', levelSeg('need.niveau', n.niveau), { err: show && !n.niveau ? 'Bitte ein Niveau wählen.' : '', help: LEVEL_HELP[n.niveau] || 'Wie viel Erfahrung haben Sie bereits?' }),
      fld('Fächer*', sel('need.fach', n.fach, SUBJECTS, 'Fächer wählen', selCls), { err: show && !n.fach ? 'Bitte ein Fach wählen.' : '' }),
      fld('Jahrgangsstufe(n)', sel('need.jgst', n.jgst, GRADES, 'Wählen', selCls)),
      fld('Themenbereich*', seg('need.thema', n.thema, ['digital', 'nicht digital']), { err: show && !n.thema ? 'Bitte einen Themenbereich wählen.' : '' }),
    ].join('');
  }
  const einreichungField = (opts) => fld(MOBILE ? 'Einreichung' : 'Einreichung*', seg('need.einreichung', S.need.einreichung, opts), {
    help: S.need.einreichung === 'anonym' ? 'Ihr Name ist für andere nicht sichtbar.' : 'Ihr Name wird bei diesem Bedarf angezeigt.',
  });

  function offerTextFields(short) {
    const o = S.offer;
    const show = S.offerErr;
    return [
      fld(short ? 'Reagiert auf einen Bedarf?' : 'Reagiert Ihr Angebot auf einen gemeldeten Bedarf?', seg('offer.reagiert', o.reagiert, short ? [['nein', 'Initiativ'], ['ja', 'Bedarf wählen']] : [['nein', 'Nein, initiativ'], ['ja', 'Ja, Bedarf auswählen']])),
      o.reagiert === 'ja'
        ? fld('Bedarf*', sel('offer.bedarfId', o.bedarfId, S.needs.map((n) => [String(n.id), `${n.fach} · ♥ ${n.likes} – ${cut(n.text, short ? 38 : 80)}`]), 'Bedarf auswählen', short ? 'fill' : ''), { err: show && !o.bedarfId ? 'Bitte einen Bedarf wählen.' : '', help: 'Fächer und Themenbereich werden aus dem Bedarf übernommen.' })
        : '',
      fld('Titel*', input('offer.title', 'z. B. Tolle Sachen mit KI'), { err: show && !o.title.trim() ? 'Bitte einen Titel eingeben.' : '' }),
      fld(short ? 'Beschreibung*' : 'Beschreibung Ihres Angebots*', ta('offer.desc', short ? 'Worum geht es, was lernen die Teilnehmenden?' : 'Worum geht es, was lernen die Teilnehmenden, wie lange dauert es?', short ? 150 : 170), { err: show && !o.desc.trim() ? 'Bitte Ihr Angebot beschreiben.' : '' }),
    ].join('');
  }
  function offerClassFields() {
    const o = S.offer;
    const show = S.offerErr;
    const selCls = MOBILE ? 'fill' : '';
    return [
      fld('Zielgruppe*', levelSeg('offer.zielgruppe', o.zielgruppe), { err: show && !o.zielgruppe ? 'Bitte eine Zielgruppe wählen.' : '', help: TARGET_HELP[o.zielgruppe] || 'Für wen ist Ihr Angebot gedacht?' }),
      fld('Fächer*', sel('offer.fach', o.fach, SUBJECTS, 'Fächer wählen', selCls), { err: show && !o.fach ? 'Bitte ein Fach wählen.' : '' }),
      fld('Jahrgangsstufe(n)', sel('offer.jgst', o.jgst, GRADES, 'Wählen', selCls)),
      fld('Themenbereich*', seg('offer.thema', o.thema, ['digital', 'nicht digital']), { err: show && !o.thema ? 'Bitte einen Themenbereich wählen.' : '' }),
    ].join('');
  }

  // ---------- Bedarfe entdecken: Filter ----------
  function filteredNeeds() {
    const f = S.f;
    const q = f.q.trim().toLowerCase();
    const list = S.needs.filter((n) =>
      (f.niveau === 'Alle' || n.niveau === f.niveau) &&
      (!f.fach || n.fach.split(', ').includes(f.fach)) &&
      (!f.jgst || n.grades.includes(Number(f.jgst))) &&
      (f.thema === 'Alle' || n.thema === f.thema) &&
      (!f.liked || n.liked) &&
      (!q || (n.text + ' ' + n.fach).toLowerCase().includes(q)));
    return list.sort(f.sort === 'votes' ? (a, b) => b.likes - a.likes : (a, b) => b.id - a.id);
  }
  const activeFilters = () => [S.f.niveau !== 'Alle', S.f.fach, S.f.jgst, S.f.thema !== 'Alle', S.f.liked].filter(Boolean).length;
  const sortSelect = () => `<select class="sortsel" data-bind="f.sort" aria-label="Sortieren"><option value="votes"${S.f.sort === 'votes' ? ' selected' : ''}>Meiste Stimmen ▾</option><option value="new"${S.f.sort === 'new' ? ' selected' : ''}>Neueste zuerst ▾</option></select>`;

  function needRegion() {
    const list = filteredNeeds();
    const empty = `<div class="empty">Keine Bedarfe gefunden.<br><button class="link" data-action="fReset">Filter zurücksetzen</button></div>`;
    if (MOBILE) {
      const extra = [S.f.fach, S.f.niveau !== 'Alle' ? S.f.niveau : ''].filter(Boolean).join(' · ');
      return `<div class="between small muted"><span>${plural(list.length, 'Bedarf', 'Bedarfe')}${extra ? ' · ' + esc(extra) : ''}</span>${sortSelect()}</div>
        ${list.length ? list.map((n) => {
          const open = S.expanded[n.id];
          const long = n.text.length > 110;
          return `<div class="ncard"><div class="chips">${chipLevel(n.niveau)}${chipTheme(n.thema)}</div>
            <span class="need-text">${esc(open || !long ? n.text : cut(n.text, 110))} ${long ? `<button class="link" data-action="more" data-arg="${n.id}">${open ? 'weniger' : 'mehr'}</button>` : ''}</span>
            <span class="small muted">${esc(n.fach)} · ${gradesText(n.grades)} Jgst.</span>${likeBtn(n)}</div>`;
        }).join('') : empty}`;
    }
    return `<div class="between" style="font-size:14px;color:var(--muted)"><span>${plural(list.length, 'Bedarf', 'Bedarfe')}</span><span>Sortieren: ${sortSelect()}</span></div>
      <div class="needlist">${list.length ? list.map((n) => {
        const open = S.expanded[n.id];
        const long = n.text.length > 230;
        return `<div class="need-row"><div class="need-body"><div class="chips">${chipLevel(n.niveau)}${chipTheme(n.thema)}</div>
          <span class="need-text">${esc(open || !long ? n.text : cut(n.text, 230))}</span>
          <div class="need-meta"><span>${esc(n.fach)}</span><span>${gradesText(n.grades)} Jgst.</span>${long ? `<button class="link" data-action="more" data-arg="${n.id}">${open ? 'Weniger anzeigen' : 'Mehr anzeigen'}</button>` : ''}</div></div>${likeBtn(n)}</div>`;
      }).join('') : empty}</div>
      <div class="pager"><span>Pro Seite <strong>10 ▾</strong></span><span>${list.length ? `1–${list.length} von ${list.length}` : '0 von 0'}</span></div>`;
  }

  function filterFields(short) {
    const f = S.f;
    return [
      fld('Niveau', levelSeg('f.niveau', f.niveau, { withAll: true, short: true })),
      fld('Fächer', sel('f.fach', f.fach, SUBJECTS, 'Alle Fächer', short ? '' : '')),
      fld('Jahrgangsstufe(n)', sel('f.jgst', f.jgst, GRADE_FILTER, 'Alle')),
      fld('Themenbereich', seg('f.thema', f.thema, ['Alle', 'digital', 'nicht digital'])),
      `<label class="check"><input type="checkbox" data-bind="f.liked"${f.liked ? ' checked' : ''}>Nur Bedarfe, die mir gefallen</label>`,
    ].join('');
  }

  // ========== DESKTOP ==========
  const dMeta = () => `<div class="meta"><span>Ansprechpartner: <strong>Toby Bryson</strong></span><span>Abgabe: <strong>06.11.2026</strong></span></div>`;
  function stepper(steps, active) {
    return `<div class="stepper">${steps.map((s, i) => {
      const cls = i < active ? 'done' : i === active ? 'active' : '';
      return `${i ? `<span class="step-line ${i <= active ? 'on' : ''}"></span>` : ''}<button class="step ${cls}" data-action="go" data-arg="${s.go}"><span class="dot">${i < active ? '✓' : i + 1}</span>${s.label}${s.count && i > active ? ` <span class="count">${s.count}</span>` : ''}</button>`;
    }).join('')}</div>`;
  }
  const subbar = (right = '') => `<div class="subbar">${dMeta()}${right}</div>`;
  const needSteps = (a) => stepper([{ label: 'Bedarf erfassen', go: 'melden' }, { label: 'Meine Wünsche einreichen', go: 'wuensche', count: S.wishes.length }], a);
  const offerSteps = (a) => stepper([{ label: 'Angebot beschreiben', go: 'angebot' }, { label: 'Meine Angebote', go: 'angebote', count: S.offers.length }], a);

  function side(key, label, inner, badge, alert) {
    if (!S.sideOpen[key]) {
      return `<aside class="side mini" data-action="toggleSide" data-arg="${key}" title="Ausklappen"><button class="side-toggle" aria-label="${label} ausklappen">${ICON.left}</button><span class="vlabel">${label}</span>${badge ? `<span class="badge-o">${badge}</span>` : ''}</aside>`;
    }
    return `<aside class="side ${alert ? 'alert' : ''}"><button class="side-toggle" data-action="toggleSide" data-arg="${key}" title="Einklappen" aria-label="${label} einklappen">${ICON.right}</button>${inner}</aside>`;
  }

  const D = {
    home() {
      const drafts = S.wishes.length;
      return `${topbar()}<div class="subbar"><div class="meta"><span>Angemeldet als: <strong>Login Name</strong></span></div><div class="meta"><span>Ansprechpartner: <strong>Toby Bryson</strong></span><span>Abgabe: <strong>06.11.2026</strong></span></div></div>
      <div class="dhome">
        <div class="intro"><h1>Was möchten Sie tun?</h1><span class="lead">Bis zum 06.11.2026 können Sie eigene Fortbildungswünsche melden, die Bedarfe Ihres Kollegiums bewerten und selbst ein SCHILF-Angebot abgeben.</span></div>
        <div class="dcards">
          <div class="dcard" role="button" tabindex="0" data-action="startNeed">
            <span class="ico">${ICON.pen}</span><span class="t">Bedarf melden</span><span class="s">Eigene Fortbildungswünsche erfassen – einfach als Freitext oder detailliert nach Situation, Bedarf und Ziel.</span>
            <div>${drafts ? `<button class="hbadge" data-action="go" data-arg="wuensche">${plural(drafts, 'Entwurf', 'Entwürfe')} ansehen ›</button>` : '<span class="hbadge">Keine Entwürfe</span>'}</div>
            <span class="cta">Bedarf erfassen <span>›</span></span></div>
          <div class="dcard" role="button" tabindex="0" data-action="go" data-arg="entdecken">
            <span class="ico">${ICON.search}</span><span class="t">Bedarfe entdecken</span><span class="s">Bedarfe des Kollegiums ansehen und mit „Gefällt mir“ zeigen, welche Ihnen wichtig sind.</span>
            <div><span class="hbadge">${plural(S.needs.length, 'Bedarf', 'Bedarfe')} · ${plural(S.needs.filter((n) => n.liked).length, 'Stimme', 'Stimmen')} abgegeben</span></div>
            <span class="cta">Bedarfe ansehen <span>›</span></span></div>
          <div class="dcard" role="button" tabindex="0" data-action="startOffer">
            <span class="ico">${ICON.gift}</span><span class="t">Angebote abgeben</span><span class="s">Eigenes SCHILF-Angebot einreichen – initiativ oder als Antwort auf einen gemeldeten Bedarf.</span>
            <div>${S.offers.length ? `<button class="hbadge" data-action="go" data-arg="angebote">${plural(S.offers.length, 'Angebot', 'Angebote')} ansehen ›</button>` : '<span class="hbadge">Noch kein Angebot</span>'}</div>
            <span class="cta">Angebot abgeben <span>›</span></span></div>
        </div>
        <div class="howto">
          <div><span class="num">1</span><span><strong>Bedarf melden:</strong> Wünsche sammeln sich zuerst als Entwurf in Ihrer Liste und werden gemeinsam eingereicht.</span></div>
          <div><span class="num">2</span><span><strong>Bedarfe bewerten:</strong> Mit „Gefällt mir“ helfen Sie, die wichtigsten Themen zu finden.</span></div>
          <div><span class="num">3</span><span><strong>Angebot abgeben:</strong> Teilen Sie Ihr Wissen als schulinterne Fortbildung.</span></div>
        </div>
      </div>`;
    },

    melden() {
      const n = S.need;
      const miss = missingNeed(n);
      const open = S.sideOpen.melden;
      const alert = S.needErr && miss.length > 0;
      const addLabel = S.editId ? '✓ ÄNDERUNGEN ÜBERNEHMEN' : '+ ZUR LISTE HINZUFÜGEN';
      const left = `<div class="main ${alert ? 'dim' : ''}" ${alert ? 'data-action="undim"' : ''}>
        <h1>${S.editId ? 'Bedarf bearbeiten' : 'Was brauchen Sie?'}</h1>
        <div class="between"><span class="lead">Beschreiben Sie Ihren Fortbildungsbedarf möglichst konkret.</span>${modeToggle()}</div>
        ${textFields({ simple: 260, d1: 96, d2: 80 })}
        <div class="between"><span class="warn">Keine personenbezogenen Daten eingeben.</span><button class="btn-chip" data-action="modal" data-arg="examples">Beispiele ansehen</button></div>
        ${open ? '' : `<div class="foot-row">${miss.length ? `<button class="pending" data-action="toggleSide" data-arg="melden"><span class="badge-o">${miss.length}</span>Noch Angaben in der Einordnung offen</button>` : ''}<button class="btn-green" data-action="addNeed">${addLabel}</button></div>`}
      </div>`;
      const panel = `<div class="between"><span class="eyebrow">EINORDNUNG</span></div>
        ${alert ? '<div class="warnbox"><strong>Fast fertig:</strong> Bitte ergänzen Sie noch die Angaben, bevor der Bedarf hinzugefügt wird.</div>' : ''}
        ${needClassFields()}
        ${einreichungField(['anonym', 'namentlich'])}
        <div class="side-foot"><button class="btn-green" data-action="addNeed">${addLabel}</button><span class="req">* Pflichtfelder</span></div>`;
      return `${topbar()}${subbar(needSteps(0))}<div class="split ${open ? '' : 'collapsed'}">${left}${side('melden', 'EINORDNUNG', panel, miss.length, alert)}</div>`;
    },

    wuensche() {
      const total = S.wishes.length;
      const selN = S.wishes.filter((w) => w.selected).length;
      const allState = !total || !selN ? '' : selN === total ? 'on' : 'part';
      return `${topbar()}${subbar(needSteps(1))}<div class="page">
        ${flash()}
        <div class="between end"><div><h1 style="margin-bottom:6px">Meine Fortbildungswünsche</h1><span style="font-size:14px;color:var(--muted)">Wählen Sie aus, welche Bedarfe Sie einreichen möchten. Nicht ausgewählte bleiben als Entwurf gespeichert.</span></div><button class="btn-dashed" data-action="startNeed">+ Weiteren Bedarf erfassen</button></div>
        <div class="table">
          <div class="tr th cols-w"><button class="cb ${allState}" data-action="selectAll" aria-label="Alle auswählen">${allState === 'on' ? '✓' : allState === 'part' ? '–' : ''}</button><span>Bedarf</span><span>Fächer</span><span>Jahrgangsstufe(n)</span><span style="text-align:right">Aktionen</span></div>
          ${total ? S.wishes.map((w) => `<div class="tr cols-w ${w.selected ? 'sel' : ''}">
            <button class="cb ${w.selected ? 'on' : ''}" data-action="toggleWish" data-arg="${w.id}" aria-label="Auswählen">${w.selected ? '✓' : ''}</button>
            <div style="display:flex;flex-direction:column;gap:8px"><div class="chips">${chipLevel(w.niveau)}${chipTheme(w.thema)}${w.mode === 'detailliert' ? chip('detailliert', 'det') : ''}${w.einreichung === 'anonym' ? chip('anonym') : chip('namentlich')}</div><span style="line-height:1.5">${esc(cut(wishText(w), 95))}</span></div>
            <span>${esc(w.fach)}</span><span>${w.jgst ? esc(w.jgst) + ' Jgst.' : '–'}</span>
            <span class="acts"><button class="link" data-action="editWish" data-arg="${w.id}">Bearbeiten</button><button class="link red" data-action="deleteWish" data-arg="${w.id}">Löschen</button></span></div>`).join('')
            : '<div class="empty">Keine Bedarfe im Entwurfsstadium vorhanden.</div>'}
        </div>
        <div class="between" style="padding-top:8px"><button class="btn-outline" data-action="go" data-arg="melden">← Zurück zur Eingabe</button>
          <div class="row"><span style="font-size:14px;color:var(--muted)"><strong style="color:var(--ink)">${selN} von ${total} ausgewählt</strong> · Nach dem Einreichen keine Änderungen möglich.</span><button class="btn-green" data-action="submitWishes"${selN ? '' : ' disabled'}>✉ ${selN} ${selN === 1 ? 'BEDARF' : 'BEDARFE'} EINREICHEN</button></div></div>
      </div>`;
    },

    entdecken() {
      const open = S.sideOpen.entdecken;
      const left = `<div class="main"><h1>Bedarfe entdecken</h1>
        <div class="info"><strong>Was gibt’s hier zu tun?</strong> Sehen Sie sich die Bedarfe Ihres Kollegiums an. Mit „Gefällt mir“ zeigen Sie, welche Ihnen wichtig sind.</div>
        <div id="needRegion" style="display:flex;flex-direction:column;gap:18px">${needRegion()}</div></div>`;
      const panel = `<div class="between"><span class="eyebrow">FILTER</span><button class="link" data-action="fReset" style="font-size:13px">Zurücksetzen</button></div>
        ${fld('Suche', `<input class="input white" data-bind="f.q" data-live placeholder="Stichwort …" value="${esc(S.f.q)}">`)}
        ${filterFields()}`;
      const votes = S.needs.filter((n) => n.liked).length;
      return `${topbar()}${subbar(`<span style="color:var(--muted);font-weight:600">Stimmen abgegeben: <strong style="color:var(--ink)">${votes}</strong></span>`)}
        <div class="split ${open ? '' : 'collapsed'}">${left}${side('entdecken', 'FILTER', panel, activeFilters())}</div>`;
    },

    angebot() {
      const o = S.offer;
      const open = S.sideOpen.angebot;
      const miss = missingOfferClass(o);
      const alert = S.offerErr && miss.length > 0;
      const left = `<div class="main"><h1>Angebot abgeben</h1>
        <div class="info"><strong>SCHILF-Angebot:</strong> Möchten Sie Ihr Wissen mit dem Kollegium teilen? Beschreiben Sie Ihr Angebot und ordnen Sie es rechts ein.</div>
        ${offerTextFields(false)}
        <div class="between"><span class="warn">Keine personenbezogenen Daten eingeben.</span><button class="btn-chip" data-action="modal" data-arg="offerExamples">Beispiele ansehen</button></div>
        ${open ? '' : `<div class="foot-row">${miss.length ? `<button class="pending" data-action="toggleSide" data-arg="angebot"><span class="badge-o">${miss.length}</span>Noch Angaben in der Einordnung offen</button>` : ''}<button class="btn-green" data-action="submitOffer">➤ ANGEBOT EINREICHEN</button></div>`}
      </div>`;
      const panel = `<span class="eyebrow">EINORDNUNG</span>
        ${alert ? '<div class="warnbox"><strong>Fast fertig:</strong> Bitte ergänzen Sie noch die Einordnung, bevor Sie das Angebot einreichen.</div>' : ''}
        ${offerClassFields()}
        <div class="side-foot"><button class="btn-green" data-action="submitOffer">➤ ANGEBOT EINREICHEN</button><span class="req">* Pflichtfelder</span></div>`;
      return `${topbar()}${subbar(offerSteps(0))}<div class="split ${open ? '' : 'collapsed'}">${left}${side('angebot', 'EINORDNUNG', panel, miss.length, alert)}</div>`;
    },

    angebote() {
      const list = offersForTab();
      return `${topbar()}${subbar(offerSteps(1))}<div class="page">
        ${flash()}
        <div class="between end"><h1>Meine SCHILF-Angebote</h1><button class="btn-dashed" data-action="startOffer">+ Weiteres Angebot abgeben</button></div>
        ${offerTabs()}
        <div class="table"><div class="tr th cols-o"><span>Angebot</span><span>Fächer</span><span>Jahrgangsstufe(n)</span><span>Art</span></div>
          ${list.length ? list.map((o) => {
            const n = o.reagiert === 'ja' ? needById(o.bedarfId) : null;
            return `<div class="tr cols-o"><div style="display:flex;flex-direction:column;gap:8px"><div class="chips">${chipLevel(o.zielgruppe)}${chipTheme(o.thema)}</div><strong style="font-weight:600">${esc(o.title)}</strong>${n ? `<span class="small muted">Reagiert auf: „${esc(cut(n.text, 48))}“ · ♥ ${n.likes}</span>` : ''}</div>
              <span>${esc(o.fach)}</span><span>${esc(o.jgst || '–')}</span><span class="small" style="color:#424242">${o.reagiert === 'ja' ? 'Auf Bedarf' : 'Initiativ'}</span></div>`;
          }).join('') : '<div class="empty">Keine Angebote in dieser Ansicht.</div>'}
        </div>
        <div><button class="btn-outline" data-action="go" data-arg="home">← Zur Startseite</button></div>
      </div>`;
    },
  };

  function offersForTab() {
    return S.offers.filter((o) => S.offerTab === 'alle' || (S.offerTab === 'bedarf' ? o.reagiert === 'ja' : o.reagiert === 'nein'));
  }
  function offerTabs() {
    const c = (t) => S.offers.filter((o) => (t === 'bedarf' ? o.reagiert === 'ja' : o.reagiert === 'nein')).length;
    const tabs = [['alle', `Alle (${S.offers.length})`], ['bedarf', `${MOBILE ? 'Auf Bedarf' : 'Auf Bedarf reagiert'} (${c('bedarf')})`], ['initiativ', `Initiativ (${c('initiativ')})`]];
    return `<div class="tabs" role="tablist">${tabs.map(([v, l]) => `<button role="tab" class="${S.offerTab === v ? 'on' : ''}" data-action="set" data-path="offerTab" data-val="${v}">${l}</button>`).join('')}</div>`;
  }

  // ========== MOBILE ==========
  function mSteps(n, total, label, all) {
    return `<div class="mstep"><div class="top"><strong>${all ? label : `Schritt ${n} von ${total} · ${label}`}</strong><span>Abgabe 06.11.</span></div><div class="prog">${Array.from({ length: total }, (_, i) => `<span class="${i < n ? 'on' : ''}"></span>`).join('')}</div></div>`;
  }
  const mScreen = (head, body, foot = '') => `${head}<div class="mbody">${body}</div>${foot}`;
  const mFoot = (back, next) => `<div class="mfoot">${back}${next}</div>`;
  const btn = (cls, label, action, arg) => `<button class="${cls}" data-action="${action}"${arg != null ? ` data-arg="${arg}"` : ''}>${label}</button>`;
  const hcard = (title, sub, action, arg, badge) => `<div class="hcard" role="button" tabindex="0" data-action="${action}"${arg ? ` data-arg="${arg}"` : ''}><div><div class="t">${title}</div><div class="s">${sub}</div>${badge || ''}</div><span class="arrow">›</span></div>`;

  const M = {
    home() {
      const drafts = S.wishes.length;
      return mScreen(topbar(false), `
        <div class="small muted" style="font-size:14px">Login Name</div>
        <h1 style="margin-bottom:4px">Was möchten Sie tun?</h1>
        ${hcard('Bedarf melden', 'Eigene Fortbildungswünsche erfassen', 'startNeed', null, drafts ? `<button class="hbadge" data-action="go" data-arg="m4">${plural(drafts, 'Entwurf', 'Entwürfe')}</button>` : '')}
        ${hcard('Bedarfe entdecken', 'Bedarfe des Kollegiums ansehen und bewerten', 'go', 'entdecken')}
        ${hcard('Angebote abgeben', 'Eigenes SCHILF-Angebot einreichen', 'startOffer', null, S.offers.length ? `<button class="hbadge" data-action="go" data-arg="aliste">${plural(S.offers.length, 'Angebot', 'Angebote')}</button>` : '')}`);
    },
    m1() {
      const n = S.need;
      return mScreen(topbar() + mSteps(1, 4, 'Beschreiben'), `
        <h1>${S.editId ? 'Bedarf bearbeiten' : 'Was brauchen Sie?'}</h1>
        ${modeToggle()}
        ${textFields({ simple: 200, d1: 78, d2: 64 })}
        <div>${btn('btn-chip', 'Beispiele', 'modal', 'examples')}</div>
        <span class="warn" style="text-align:center">Keine personenbezogenen Daten eingeben.</span>`,
      mFoot(btn('btn-outline', 'Abbrechen', 'cancelNeed'), btn('btn-primary', 'Weiter: Einordnen →', 'm1Next')));
    },
    m2() {
      return mScreen(topbar() + mSteps(2, 4, 'Einordnen'), `
        <h1>Wo ordnen Sie Ihren Bedarf ein?</h1>
        ${S.needErr && missingNeed(S.need).length ? '<div class="warnbox"><strong>Fast fertig:</strong> Bitte ergänzen Sie die markierten Angaben.</div>' : ''}
        ${needClassFields()}`,
      mFoot(btn('btn-outline', '← Zurück', 'go', 'm1'), btn('btn-primary', 'Weiter: Prüfen →', 'm2Next')));
    },
    m3() {
      const n = S.need;
      const desc = n.mode === 'detailliert'
        ? `<p><span class="k1">Situation:</span> ${esc(n.text)}</p><p><span class="k2">Bedarf:</span> ${esc(n.bedarf)}</p><p><span class="k3">Ziel:</span> ${esc(n.ziel)}</p>`
        : `<p>${esc(n.text)}</p>`;
      return mScreen(topbar() + mSteps(3, 4, 'Prüfen'), `
        <h1>Alles richtig?</h1>
        <div class="summary">
          <div><div class="head">BESCHREIBUNG<button class="link" style="font-size:12px" data-action="go" data-arg="m1">Ändern</button></div>${desc}</div>
          <div><div class="head">EINORDNUNG<button class="link" style="font-size:12px" data-action="go" data-arg="m2">Ändern</button></div>
            <div class="chips">${chipLevel(n.niveau)}${chipTheme(n.thema)}${chip(n.einreichung)}</div>
            <span style="font-size:14px">${esc(n.fach)}${n.jgst ? ' · ' + esc(n.jgst) + ' Jgst.' : ''}</span></div>
        </div>
        <span class="small muted" style="line-height:1.45">Der Bedarf kommt zuerst in Ihre Liste. Sie können weitere Bedarfe hinzufügen und dann alle gemeinsam einreichen.</span>
        ${einreichungField(['namentlich', 'anonym'])}`,
      mFoot(btn('btn-outline', '← Zurück', 'go', 'm2'), btn('btn-green', S.editId ? '✓ Änderungen übernehmen' : '+ Zur Liste hinzufügen', 'm3Add')));
    },
    m4() {
      const total = S.wishes.length;
      const selN = S.wishes.filter((w) => w.selected).length;
      const all = total && selN === total;
      return mScreen(topbar() + mSteps(4, 4, 'Einreichen'), `
        ${flash()}
        <div class="mlist-head"><h1>Meine Fortbildungs&shy;wünsche <span class="count" style="border-radius:12px;padding:1px 8px;vertical-align:middle">${total}</span></h1>${total ? `<button class="link" data-action="selectAll">${all ? 'Keine auswählen' : 'Alle auswählen'}</button>` : ''}</div>
        <span class="small muted" style="margin-top:-4px">Wählen Sie aus, welche Bedarfe Sie einreichen möchten. Nicht ausgewählte bleiben als Entwurf gespeichert.</span>
        ${total ? S.wishes.map((w) => `<div class="wcard ${w.selected ? 'on' : ''}" data-action="toggleWish" data-arg="${w.id}">
          <span class="cb ${w.selected ? 'on' : ''}">${w.selected ? '✓' : ''}</span>
          <div style="display:flex;flex-direction:column;gap:8px"><div class="chips">${chipLevel(w.niveau)}${chipTheme(w.thema)}${w.mode === 'detailliert' ? chip('detailliert', 'det') : ''}</div>
            <span style="font-size:14px;line-height:1.45">${esc(cut(wishText(w), 60))}</span>
            <div class="acts"><button class="link" data-action="editWish" data-arg="${w.id}">Bearbeiten</button><button class="link red" data-action="deleteWish" data-arg="${w.id}">Löschen</button></div></div></div>`).join('')
          : '<div class="empty">Keine Bedarfe im Entwurfsstadium vorhanden.</div>'}
        ${btn('btn-dashed', '+ Weiteren Bedarf erfassen', 'startNeed')}`,
      `<div class="mfoot col"><div class="between small"><strong>${selN} von ${total} ausgewählt</strong><span class="muted">Keine Änderungen nach Einreichen</span></div><button class="btn-green caps" data-action="submitWishes"${selN ? '' : ' disabled'}>✉ ${selN} ${selN === 1 ? 'BEDARF' : 'BEDARFE'} EINREICHEN</button></div>`);
    },
    entdecken() {
      const n = activeFilters();
      return `${topbar()}<div class="msearch"><input class="input" data-bind="f.q" data-live placeholder="Suchen …" value="${esc(S.f.q)}" aria-label="Suchen"><button class="btn-filter" data-action="modal" data-arg="filter">Filter${n ? ` <span class="n">${n}</span>` : ''}</button></div>
        <div class="mbody" style="gap:12px;padding-top:16px"><h1>Bedarfe entdecken</h1><div id="needRegion" style="display:flex;flex-direction:column;gap:12px">${needRegion()}</div></div>`;
    },
    a1() {
      return mScreen(topbar() + mSteps(1, 3, 'Beschreiben'), `
        <h1>Angebot abgeben</h1>
        ${offerTextFields(true)}
        <div class="between" style="gap:10px"><span class="warn">Keine personenbezogenen Daten.</span>${btn('btn-chip', 'Beispiele', 'modal', 'offerExamples')}</div>`,
      mFoot(btn('btn-outline', 'Abbrechen', 'go', 'home'), btn('btn-primary', 'Weiter: Einordnen →', 'a1Next')));
    },
    a2() {
      return mScreen(topbar() + mSteps(2, 3, 'Einordnen'), `
        <h1>Für wen ist Ihr Angebot?</h1>
        ${S.offerErr && missingOfferClass(S.offer).length ? '<div class="warnbox"><strong>Fast fertig:</strong> Bitte ergänzen Sie die markierten Angaben.</div>' : ''}
        ${offerClassFields()}`,
      mFoot(btn('btn-outline', '← Zurück', 'go', 'a1'), btn('btn-primary', 'Weiter: Prüfen →', 'a2Next')));
    },
    a3() {
      const o = S.offer;
      const n = o.reagiert === 'ja' ? needById(o.bedarfId) : null;
      return mScreen(topbar() + mSteps(3, 3, 'Prüfen'), `
        <h1>Alles richtig?</h1>
        <div class="summary">
          <div><div class="head">ANGEBOT<button class="link" style="font-size:12px" data-action="go" data-arg="a1">Ändern</button></div>
            <p><strong>${esc(o.title)}</strong></p><p>${esc(o.desc)}</p>
            <p class="small muted">${n ? `Reagiert auf: „${esc(cut(n.text, 50))}“ · ♥ ${n.likes}` : 'Initiativ-Angebot'}</p></div>
          <div><div class="head">EINORDNUNG<button class="link" style="font-size:12px" data-action="go" data-arg="a2">Ändern</button></div>
            <div class="chips">${chipLevel(o.zielgruppe)}${chipTheme(o.thema)}</div>
            <span style="font-size:14px">${esc(o.fach)}${o.jgst ? ' · ' + esc(o.jgst) + ' Jgst.' : ''}</span></div>
        </div>
        <span class="small muted" style="line-height:1.45">Nach dem Einreichen ist Ihr Angebot für das Kollegium sichtbar. Toby Bryson meldet sich zur Terminabstimmung.</span>`,
      mFoot(btn('btn-outline', '← Zurück', 'go', 'a2'), btn('btn-green', '➤ Angebot einreichen', 'a3Submit')));
    },
    aliste() {
      const list = offersForTab();
      return mScreen(topbar() + mSteps(3, 3, 'Meine Angebote', true), `
        ${flash()}
        <div style="display:flex;align-items:baseline;gap:8px"><h1 style="font-size:21px">Meine SCHILF-Angebote</h1><span class="count" style="border-radius:12px;padding:1px 8px">${S.offers.length}</span></div>
        ${offerTabs()}
        ${list.length ? list.map((o) => {
          const n = o.reagiert === 'ja' ? needById(o.bedarfId) : null;
          return `<div class="ncard"><div class="chips">${chipLevel(o.zielgruppe)}${chipTheme(o.thema)}</div><strong style="font-weight:700">${esc(o.title)}</strong>
            <span class="small muted">${esc(o.fach)}${o.jgst ? ' · ' + esc(o.jgst) + ' Jgst.' : ''} · ${o.reagiert === 'ja' ? 'Auf Bedarf' : 'Initiativ'}</span>
            ${n ? `<span class="small muted">Reagiert auf: „${esc(cut(n.text, 40))}“ · ♥ ${n.likes}</span>` : ''}</div>`;
        }).join('') : '<div class="empty">Keine Angebote in dieser Ansicht.</div>'}
        ${btn('btn-dashed', '+ Weiteres Angebot abgeben', 'startOffer')}`,
      mFoot('', btn('btn-primary', 'Zur Startseite', 'go', 'home')));
    },
  };

  // ---------- Overlays ----------
  function modalHTML() {
    const m = S.modal;
    if (!m) return '';
    const close = `<button class="xbtn" data-action="closeModal" aria-label="Schließen">×</button>`;
    const wrap = (cls, head, body, foot) => `<div class="overlay" data-action="closeModal"></div><div class="dialog ${cls}" role="dialog" aria-modal="true">${head}<div class="dlg-body">${body}</div>${foot ? `<div class="dlg-foot">${foot}</div>` : ''}</div>`;

    if (m === 'examples') {
      return wrap(MOBILE ? 'float' : '',
        `<div class="dlg-head"><div><div class="t">Beispiele</div><div class="s">${MOBILE ? '3 Beispiele · zum Scrollen wischen' : 'So kann eine konkrete Bedarfsbeschreibung aussehen'}</div></div>${close}</div>`,
        EXAMPLES.map((e, i) => `<div class="excard"><div class="h">BEISPIEL ${i + 1} · ${esc((e.label || e.subject).toUpperCase())}</div>
          <p><span class="k1">Situation:</span> ${esc(e.situation)}</p><p><span class="k2">Bedarf:</span> ${esc(e.bedarf)}</p><p><span class="k3">Ziel:</span> ${esc(e.ziel)}</p>
          <button class="btn-chip" data-action="useExample" data-arg="${i}">Beispiel übernehmen</button></div>`).join(''),
        btn('btn-outline', 'Schließen', 'closeModal'));
    }
    if (m === 'offerExamples') {
      return wrap(MOBILE ? 'float' : '',
        `<div class="dlg-head"><div><div class="t">Beispiele</div><div class="s">${MOBILE ? '3 Beispiele · zum Scrollen wischen' : 'So kann ein SCHILF-Angebot beschrieben sein'}</div></div>${close}</div>`,
        OFFER_EXAMPLES.map((e, i) => `<div class="excard"><div class="h">BEISPIEL ${i + 1}</div><p><strong>${esc(e.title)}</strong></p><p>${esc(e.text)}</p>
          <button class="btn-chip" data-action="useOfferExample" data-arg="${i}">Beispiel übernehmen</button></div>`).join(''),
        btn('btn-outline', 'Schließen', 'closeModal'));
    }
    if (m === 'filter') {
      const count = filteredNeeds().length;
      return wrap('sheet', `<div class="dlg-head"><span class="t">Filter</span>${close}</div>`, filterFields(true),
        `${btn('btn-outline', 'Zurücksetzen', 'fReset')}${btn('btn-primary', `${plural(count, 'Bedarf', 'Bedarfe')} anzeigen`, 'closeModal')}`);
    }
    if (m === 'confirmSubmit') {
      const n = S.wishes.filter((w) => w.selected).length;
      return wrap(MOBILE ? 'center' : 'narrow', `<div class="dlg-head"><span class="t">${n === 1 ? 'Bedarf' : 'Bedarfe'} einreichen?</span>${close}</div>`,
        `<p style="margin:0;font-size:15px;line-height:1.5">Sie reichen <strong>${plural(n, 'Bedarf', 'Bedarfe')}</strong> bei Toby Bryson ein. Danach sind keine Änderungen mehr möglich.</p>${S.wishes.length > n ? `<p class="small muted" style="margin:0">${plural(S.wishes.length - n, 'Bedarf bleibt', 'Bedarfe bleiben')} als Entwurf in Ihrer Liste.</p>` : ''}`,
        `${btn('btn-outline', 'Abbrechen', 'closeModal')}${btn('btn-green', '✉ Jetzt einreichen', 'confirmSubmit')}`);
    }
    if (m === 'submitted') {
      const n = S.lastSubmitted;
      return wrap(MOBILE ? 'center' : 'narrow', `<div class="dlg-head"><span class="t">Eingereicht</span>${close}</div>`,
        `<span class="done-ico">✓</span><p class="center-text" style="margin:0;font-size:15px;line-height:1.5"><strong>Vielen Dank!</strong><br>${plural(n, 'Bedarf wurde', 'Bedarfe wurden')} an Toby Bryson übermittelt. Sie können jetzt die Bedarfe Ihres Kollegiums bewerten.</p>`,
        `${btn('btn-outline', 'Zur Startseite', 'go', 'home')}${btn('btn-primary', 'Bedarfe entdecken', 'go', 'entdecken')}`);
    }
    return '';
  }

  // ---------- Screen-Kennung für die Vergleichsansicht ----------
  function screenInfo() {
    const s = S.screen;
    if (S.modal === 'examples') return ['2h', MOBILE ? 'Beispiele · Floating-Box' : 'Beispiele (Desktop-Dialog)'];
    if (S.modal === 'filter') return ['4c', 'Filter als Floating-Box'];
    if (MOBILE) {
      return ({
        home: ['2g', 'Startseite'],
        m1: [S.need.mode === 'einfach' ? '2a' : '2b', `Schritt 1 · ${S.need.mode === 'einfach' ? 'Einfach' : 'Detailliert'}`],
        m2: ['2c', 'Schritt 2 · Einordnen'],
        m3: ['2d', 'Schritt 3 · Prüfen'],
        m4: ['2e', 'Schritt 4 · Liste & einreichen'],
        entdecken: ['4b', 'Bedarfe entdecken'],
        a1: ['4f', 'Angebot, Schritt 1'],
        a2: ['4g', 'Angebot, Schritt 2'],
        a3: ['', 'Angebot, Schritt 3 · Prüfen (ergänzt)'],
        aliste: ['', 'Meine Angebote (ergänzt, vgl. 4e)'],
      })[s];
    }
    if (s === 'melden') {
      const alert = S.needErr && missingNeed(S.need).length;
      if (alert) return ['3e', 'Offene Felder markiert'];
      if (!S.sideOpen.melden) return ['3d', 'Einordnung eingeklappt'];
      return [S.need.mode === 'einfach' ? '3b' : '3a', `Bedarf erfassen (${S.need.mode === 'einfach' ? 'Einfach' : 'Detailliert'})`];
    }
    return ({
      home: ['2g', 'Startseite – neue Desktop-Version'],
      wuensche: ['3c', 'Meine Fortbildungswünsche'],
      entdecken: ['4a', 'Bedarfe entdecken'],
      angebot: ['4d', 'Angebot beschreiben'],
      angebote: ['4e', 'Meine Angebote'],
    })[s];
  }

  // ---------- Rendern ----------
  const root = document.getElementById('app');
  function render() {
    const mb = root.querySelector('.mbody');
    const keep = mb && root.dataset.screen === S.screen ? mb.scrollTop : 0;
    const view = (MOBILE ? M : D)[S.screen] || (MOBILE ? M : D).home;
    root.innerHTML = `<div class="app">${view()}${modalHTML()}</div>`;
    root.dataset.screen = S.screen;
    const nb = root.querySelector('.mbody');
    if (nb) nb.scrollTop = keep;
    const [id, label] = screenInfo() || ['', ''];
    try { parent.postMessage({ src: 'mockup', device: MOBILE ? 'mobile' : 'desktop', id, label }, '*'); } catch (e) { /* standalone */ }
  }
  function go(screen, msg) {
    S.screen = screen;
    S.modal = null;
    S.flash = msg || null;
    render();
    window.scrollTo(0, 0);
    const mb = root.querySelector('.mbody');
    if (mb) mb.scrollTop = 0;
  }
  function refreshNeeds() {
    const r = document.getElementById('needRegion');
    if (r) r.innerHTML = needRegion();
  }

  // ---------- Aktionen ----------
  function commitNeed() {
    const w = { ...S.need, id: S.editId || S.nextId++, selected: true };
    if (S.editId) S.wishes = S.wishes.map((x) => (x.id === S.editId ? w : x));
    else S.wishes.unshift(w);
    const edited = !!S.editId;
    S.need = blankNeed();
    S.editId = null;
    S.needErr = S.textErr = false;
    return edited ? 'Änderungen übernommen' : 'Bedarf zur Liste hinzugefügt';
  }
  function commitOffer() {
    S.offers.unshift({ ...S.offer, id: S.nextId++ });
    S.offer = blankOffer();
    S.offerErr = false;
    S.offerTab = 'alle';
  }

  const A = {
    go: (arg) => go(arg),
    set(_, el) {
      setPath(el.dataset.path, el.dataset.val);
      render();
    },
    needMode(arg) { S.need.mode = arg; render(); },
    toggleSide(arg) { S.sideOpen[arg] = !S.sideOpen[arg]; render(); },
    undim(_, el) { el.classList.remove('dim'); el.removeAttribute('data-action'); },
    modal(arg) { S.modal = arg; render(); },
    closeModal() { S.modal = null; render(); },
    startNeed() {
      S.need = blankNeed(); S.editId = null; S.needErr = S.textErr = false;
      go(MOBILE ? 'm1' : 'melden');
    },
    cancelNeed() {
      const wasEdit = S.editId;
      S.need = blankNeed(); S.editId = null; S.needErr = S.textErr = false;
      go(wasEdit ? 'm4' : 'home');
    },
    useExample(i) {
      const e = EXAMPLES[i];
      Object.assign(S.need, { mode: 'detailliert', text: e.situation, bedarf: e.bedarf, ziel: e.ziel });
      if (!S.need.fach) S.need.fach = e.subject;
      S.textErr = false; S.modal = null; render();
    },
    useOfferExample(i) {
      const e = OFFER_EXAMPLES[i];
      Object.assign(S.offer, { title: e.title, desc: e.text });
      S.modal = null; render();
    },
    addNeed() {
      const miss = missingNeed(S.need);
      S.textErr = !needHasText(S.need);
      if (miss.length || S.textErr) {
        S.needErr = miss.length > 0;
        if (miss.length) S.sideOpen.melden = true;
        render();
        return;
      }
      go('wuensche', commitNeed());
    },
    m1Next() {
      S.textErr = !needHasText(S.need);
      if (S.textErr) { render(); return; }
      go('m2');
    },
    m2Next() {
      if (missingNeed(S.need).length) { S.needErr = true; render(); return; }
      S.needErr = false; go('m3');
    },
    m3Add() { go('m4', commitNeed()); },
    toggleWish(id) { const w = S.wishes.find((x) => String(x.id) === id); if (w) w.selected = !w.selected; render(); },
    selectAll() {
      const all = S.wishes.every((w) => w.selected);
      S.wishes.forEach((w) => { w.selected = !all; });
      render();
    },
    editWish(id) {
      const w = S.wishes.find((x) => String(x.id) === id);
      if (!w) return;
      const { id: wid, selected, ...rest } = w;
      S.need = { ...rest }; S.editId = wid; S.needErr = S.textErr = false;
      go(MOBILE ? 'm1' : 'melden');
    },
    deleteWish(id) {
      S.wishes = S.wishes.filter((x) => String(x.id) !== id);
      S.flash = 'Bedarf gelöscht';
      render();
    },
    submitWishes() { if (S.wishes.some((w) => w.selected)) { S.modal = 'confirmSubmit'; render(); } },
    confirmSubmit() {
      S.lastSubmitted = S.wishes.filter((w) => w.selected).length;
      S.wishes = S.wishes.filter((w) => !w.selected);
      S.flash = null;
      S.modal = 'submitted';
      render();
    },
    like(id, el) {
      const n = needById(id);
      n.liked = !n.liked;
      n.likes += n.liked ? 1 : -1;
      if (S.screen === 'entdecken' && !MOBILE) render(); else refreshNeeds();
      const b = root.querySelector(`.like[data-arg="${id}"]`);
      if (b) b.classList.add('bump');
    },
    more(id) { S.expanded[id] = !S.expanded[id]; refreshNeeds(); },
    fReset() { S.f = blankFilter(); render(); },
    startOffer() { S.offer = blankOffer(); S.offerErr = false; go(MOBILE ? 'a1' : 'angebot'); },
    submitOffer() {
      if (!offerTextOk(S.offer) || missingOfferClass(S.offer).length) {
        S.offerErr = true;
        if (missingOfferClass(S.offer).length) S.sideOpen.angebot = true;
        render();
        return;
      }
      commitOffer();
      go('angebote', 'Angebot eingereicht');
    },
    a1Next() {
      if (!offerTextOk(S.offer)) { S.offerErr = true; render(); return; }
      S.offerErr = false; go('a2');
    },
    a2Next() {
      if (missingOfferClass(S.offer).length) { S.offerErr = true; render(); return; }
      S.offerErr = false; go('a3');
    },
    a3Submit() { commitOffer(); go('aliste', 'Angebot eingereicht'); },
  };

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') ev.preventDefault();
    fn(el.dataset.arg, el);
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && S.modal) A.closeModal();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[role="button"][data-action]')) { ev.preventDefault(); ev.target.click(); }
  });
  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!el.dataset.bind || el.type === 'checkbox' || el.tagName === 'SELECT') return;
    setPath(el.dataset.bind, el.value);
    if (el.hasAttribute('data-live')) refreshNeeds();
    // Fehlermarkierung am Textfeld verschwindet, sobald getippt wird
    const f = el.closest('.field.err');
    if (f && el.value.trim()) { f.classList.remove('err'); f.querySelector('.errtext')?.remove(); }
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (!el.dataset.bind) return;
    if (el.type === 'checkbox') setPath(el.dataset.bind, el.checked);
    else if (el.tagName === 'SELECT') setPath(el.dataset.bind, el.value);
    else return;
    if (el.dataset.bind === 'offer.bedarfId' && el.value) {
      const n = needById(el.value);
      Object.assign(S.offer, { fach: n.fach.split(', ')[0], thema: n.thema });
    }
    render();
  });

  render();
})();
