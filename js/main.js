/**
 * Главный скрипт портфолио (ванильный JS, без библиотек).
 * Подключается после config.js и projects.js, поэтому APP_CONFIG,
 * PROJECTS, CATEGORIES и TESTIMONIALS доступны как глобальные переменные.
 *
 * Разделы файла:
 *  1. Утилиты
 *  2. Тема (светлая/тёмная)
 *  3. Шапка, меню, подсветка раздела, прогресс прокрутки
 *  4. Анимации при прокрутке и счётчики
 *  5. Слайдер (класс Slider)
 *  6. Проекты: рендер, фильтр, модальное окно
 *  7. Отзывы
 *  8. Открытый API: репозитории GitHub
 *  9. Погода (Open-Meteo)
 * 10. Форма: валидация и отправка через EmailJS
 * 11. Запуск
 */
(function () {
  'use strict';

  /* ================= 1. Утилиты ================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPlaceholder = (v) => typeof v !== 'string' || v.trim() === '' || v.includes('[[');

  /** Экранирует текст перед вставкой в innerHTML (защита от XSS для данных API). */
  function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Безопасная работа с localStorage (в приватном режиме он может бросать ошибки). */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ничего страшного */ } }
  };

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  /* ================= 2. Тема ================= */
  function initTheme() {
    const root = document.documentElement;
    const btn = $('#theme-toggle');
    const meta = $('meta[name="theme-color"]');

    function apply(theme, persist) {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0c0e' : '#f6f5f1');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      if (persist) store.set('theme', theme);
    }

    apply(root.getAttribute('data-theme') || 'dark', false);
    btn.addEventListener('click', () => {
      apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ================= 3. Шапка и навигация ================= */
  function initNav() {
    const header = $('#header');
    const nav = $('#nav');
    const burger = $('#burger');
    const progress = $('#progress');
    const links = $$('.nav__link');

    // Меню на мобильных
    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    // Подсветка активного раздела через IntersectionObserver:
    // раздел считается активным, когда пересекает горизонтальную линию в центре экрана
    const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const setActive = (id) => links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => spy.observe(s));
    }

    // Тень шапки и полоса прогресса (с throttling через requestAnimationFrame)
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle('is-scrolled', y > 8);
        progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ================= 4. Анимации при прокрутке ================= */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      items.forEach((el) => io.observe(el));
    }
    initCounters();
  }

  /** Числа в блоке статистики «набегают» от нуля, когда блок появляется на экране. */
  function initCounters() {
    const nums = $$('[data-count]');
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const t0 = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* ================= 5. Слайдер ================= */
  /**
   * Свой слайдер без библиотек.
   * root     — контейнер .slider; slides — массив HTML-строк слайдов.
   * options: label — подпись для скринридера, autoplay — интервал в мс (0 = выкл.)
   * Умеет: кнопки, точки, свайп мышью/пальцем, стрелки клавиатуры, автопрокрутку
   * (ставится на паузу при наведении/фокусе), зацикливание.
   */
  class Slider {
    constructor(root, slides, options = {}) {
      this.root = root;
      this.slides = slides;
      this.index = 0;
      this.autoplay = reduceMotion ? 0 : (options.autoplay || 0);
      this.timer = null;
      this.render();
      this.bind();
      this.go(0, false);
      this.play();
    }

    render() {
      const n = this.slides.length;
      this.root.innerHTML =
        '<div class="slider__viewport" tabindex="0" aria-label="Слайды. Листайте стрелками влево и вправо">' +
          '<div class="slider__track" aria-live="off">' +
            this.slides.map((html, i) =>
              '<div class="slider__slide" role="group" aria-roledescription="слайд" aria-label="' + (i + 1) + ' из ' + n + '">' + html + '</div>'
            ).join('') +
          '</div>' +
        '</div>' +
        '<div class="slider__bar">' +
          '<div class="slider__dots">' +
            this.slides.map((_, i) => '<button class="slider__dot" type="button" aria-label="Слайд ' + (i + 1) + '" data-i="' + i + '"></button>').join('') +
          '</div>' +
          '<div class="slider__nav">' +
            '<button class="slider__btn" type="button" data-dir="-1" aria-label="Предыдущий слайд"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
            '<button class="slider__btn" type="button" data-dir="1" aria-label="Следующий слайд"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
          '</div>' +
        '</div>';
      this.viewport = $('.slider__viewport', this.root);
      this.track = $('.slider__track', this.root);
      this.dots = $$('.slider__dot', this.root);
      this.items = $$('.slider__slide', this.root);
    }

    bind() {
      this.root.addEventListener('click', (e) => {
        const dot = e.target.closest('.slider__dot');
        const arrow = e.target.closest('.slider__btn');
        if (dot) this.go(Number(dot.dataset.i));
        if (arrow) this.go(this.index + Number(arrow.dataset.dir));
        this.play();
      });

      this.viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(this.index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); this.go(this.index + 1); }
      });

      // Свайп: Pointer Events работают и для мыши, и для касаний
      let startX = 0, dx = 0, dragging = false;
      this.viewport.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, a')) return;
        dragging = true; startX = e.clientX; dx = 0;
        this.track.classList.add('is-dragging');
        this.viewport.setPointerCapture(e.pointerId);
        this.stop();
      });
      this.viewport.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        dx = e.clientX - startX;
        this.track.style.transform = 'translateX(calc(' + (-this.index * 100) + '% + ' + dx + 'px))';
      });
      const end = () => {
        if (!dragging) return;
        dragging = false;
        this.track.classList.remove('is-dragging');
        const threshold = this.viewport.clientWidth * 0.15;
        if (dx < -threshold) this.go(this.index + 1);
        else if (dx > threshold) this.go(this.index - 1);
        else this.go(this.index);
        this.play();
      };
      this.viewport.addEventListener('pointerup', end);
      this.viewport.addEventListener('pointercancel', end);

      // Автопрокрутка не должна мешать читать: пауза при наведении и фокусе
      this.root.addEventListener('mouseenter', () => this.stop());
      this.root.addEventListener('mouseleave', () => this.play());
      this.root.addEventListener('focusin', () => this.stop());
      this.root.addEventListener('focusout', () => this.play());
    }

    go(i, animate = true) {
      const n = this.slides.length;
      this.index = (i + n) % n;
      if (!animate) this.track.classList.add('is-dragging');
      this.track.style.transform = 'translateX(' + (-this.index * 100) + '%)';
      if (!animate) { void this.track.offsetWidth; this.track.classList.remove('is-dragging'); }
      this.items.forEach((el, k) => {
        const active = k === this.index;
        el.setAttribute('aria-hidden', String(!active));
        if (active) el.removeAttribute('inert'); else el.setAttribute('inert', '');
      });
      this.dots.forEach((d, k) => {
        if (k === this.index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }

    play() {
      this.stop();
      if (this.autoplay > 0 && this.slides.length > 1) {
        this.timer = setInterval(() => this.go(this.index + 1), this.autoplay);
      }
    }

    stop() { clearInterval(this.timer); this.timer = null; }
    destroy() { this.stop(); }
  }

  /* ================= 6. Проекты, фильтр, модальное окно ================= */
  const state = { filter: 'all' };

  function initProjects() {
    const filters = $('#filters');
    const grid = $('#projects-grid');
    const count = $('#filters-count');

    // Кнопки фильтра строятся из объекта CATEGORIES, счётчики считаются по данным
    const buttons = [['all', 'Все']].concat(Object.entries(CATEGORIES));
    filters.innerHTML = buttons.map(([id, label]) => {
      const n = id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.categories.includes(id)).length;
      return '<button class="filter-btn" type="button" data-filter="' + id + '" aria-pressed="false">' + esc(label) + ' <small>' + n + '</small></button>';
    }).join('');

    function render() {
      const list = state.filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.categories.includes(state.filter));
      $$('.filter-btn', filters).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
      count.textContent = list.length === PROJECTS.length
        ? 'Показаны все проекты: ' + list.length
        : 'Показано ' + list.length + ' из ' + PROJECTS.length + ' · ' + CATEGORIES[state.filter];
      grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="state">В этой категории пока нет проектов.</p>';
    }

    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      state.filter = btn.dataset.filter;
      render();
    });

    grid.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open]');
      if (open) { openModal(open.dataset.open, open); return; }
      const dead = e.target.closest('[aria-disabled="true"]');
      if (dead) { e.preventDefault(); toast('Ссылка появится после публикации проекта'); }
    });

    // Глубокие ссылки: ?filter=3d и ?project=vizi (удобно для демонстрации)
    const params = new URLSearchParams(location.search);
    const f = params.get('filter');
    if (f && CATEGORIES[f]) state.filter = f;
    render();
    const p = params.get('project');
    if (p && PROJECTS.some((x) => x.id === p)) openModal(p);
  }

  function linkBtn(href, label, cls) {
    return isPlaceholder(href)
      ? '<a class="btn btn--small ' + cls + '" href="#projects" aria-disabled="true" title="Ссылка появится после публикации">' + esc(label) + '</a>'
      : '<a class="btn btn--small ' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(label) + '</a>';
  }

  function cardHTML(p, i) {
    const cats = p.categories.map((c) => '<li class="badge">' + esc(CATEGORIES[c]) + '</li>').join('');
    return '<article class="card" style="--i:' + i + '">' +
      '<button class="card__media" type="button" data-open="' + p.id + '" aria-label="Открыть подробности: ' + esc(p.title) + '">' +
        '<img src="' + esc(p.cover) + '" alt="Обложка проекта ' + esc(p.title) + '" width="1200" height="750" loading="lazy">' +
        '<span class="card__more">Подробнее</span>' +
      '</button>' +
      '<div class="card__body">' +
        '<ul class="card__cats">' + cats + '</ul>' +
        '<h3 class="card__title">' + esc(p.title) + '</h3>' +
        '<p class="card__text">' + esc(p.short) + '</p>' +
        '<p class="card__tech">' + p.tech.slice(0, 4).map(esc).join(' · ') + '</p>' +
      '</div>' +
      '<div class="card__actions">' +
        '<button class="btn btn--small btn--accent" type="button" data-open="' + p.id + '">Подробнее</button>' +
        linkBtn(p.live, p.liveShort || 'Сайт', 'btn--ghost') +
        linkBtn(p.github, 'GitHub', 'btn--ghost') +
      '</div>' +
    '</article>';
  }

  /* --- Модальное окно на нативном <dialog>: фокус и Esc браузер берёт на себя --- */
  let modalSlider = null;
  let lastTrigger = null;

  function openModal(id, trigger) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    const dlg = $('#project-modal');
    lastTrigger = trigger || null;

    const images = [p.cover].concat(p.screens);
    $('#modal-content').innerHTML =
      '<div class="modal__layout">' +
        '<div class="modal__media"><div class="slider" id="modal-slider" aria-roledescription="carousel" aria-label="Скриншоты проекта ' + esc(p.title) + '" style="width:100%"></div></div>' +
        '<div class="modal__info">' +
          '<ul class="card__cats">' + p.categories.map((c) => '<li class="badge">' + esc(CATEGORIES[c]) + '</li>').join('') + '</ul>' +
          '<h3 class="modal__title" id="modal-title">' + esc(p.title) + '</h3>' +
          '<div class="modal__meta"><span>Год: <b>' + p.year + '</b></span><span>Роль: <b>' + esc(p.role) + '</b></span></div>' +
          '<p class="modal__desc">' + esc(p.description) + '</p>' +
          '<div><h4 class="modal__h">Технологии</h4><ul class="tags">' + p.tech.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul></div>' +
          '<div class="modal__links">' + linkBtn(p.live, p.liveLabel || 'Живая версия', 'btn--accent') + linkBtn(p.github, 'GitHub', 'btn--ghost') + '</div>' +
        '</div>' +
      '</div>';

    if (modalSlider) modalSlider.destroy();
    modalSlider = new Slider($('#modal-slider'), images.map((src, i) =>
      '<img src="' + esc(src) + '" alt="' + esc(p.title) + ': ' + (i === 0 ? 'обложка' : 'экран ' + i) + '" width="1200" height="750" draggable="false">'
    ));

    if (!dlg.open) dlg.showModal();
    document.body.classList.add('is-locked');
    $('#modal-panel').scrollTop = 0;
  }

  function initModal() {
    const dlg = $('#project-modal');
    $('#modal-close').addEventListener('click', () => dlg.close());
    // Клик по затемнённому фону (вне панели) закрывает окно
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
      if (modalSlider) { modalSlider.destroy(); modalSlider = null; }
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });
    // Ссылки-заглушки внутри окна
    dlg.addEventListener('click', (e) => {
      const dead = e.target.closest('[aria-disabled="true"]');
      if (dead) { e.preventDefault(); toast('Ссылка появится после публикации проекта'); }
    });
  }

  /* ================= 7. Отзывы ================= */
  function initReviews() {
    const root = $('#reviews-slider');
    const slides = TESTIMONIALS.map((t) =>
      '<figure class="quote">' +
        '<div><div class="quote__mark" aria-hidden="true">“</div><blockquote class="quote__text" style="margin:0">' + esc(t.text) + '</blockquote></div>' +
        '<figcaption class="quote__author"><span class="quote__avatar" aria-hidden="true">' + esc(t.name.charAt(0)) + '</span>' +
          '<span><span class="quote__name">' + esc(t.name) + '</span><br><span class="quote__role">' + esc(t.role) + '</span></span></figcaption>' +
      '</figure>');
    new Slider(root, slides, { autoplay: 7000 });
  }

  /* ================= 8. Открытый API: GitHub ================= */
  const LANG_COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26', CSS: '#563d7c', Python: '#3572a5', Rust: '#dea584', Vue: '#41b883', Shell: '#89e051' };

  function initGithub() {
    const box = $('#repos');
    const hideForks = $('#repo-hide-forks');
    const sortSel = $('#repo-sort');
    const user = (window.APP_CONFIG && APP_CONFIG.github && APP_CONFIG.github.username) || 'arablex';
    $('#repo-profile').href = 'https://github.com/' + encodeURIComponent(user);
    let repos = [];

    const skeleton = () => {
      box.setAttribute('aria-busy', 'true');
      box.innerHTML = '<div class="skeleton"></div>'.repeat(3);
    };

    function showError(msg) {
      box.setAttribute('aria-busy', 'false');
      box.innerHTML = '<div class="state state--error" role="alert"><p class="state__title">Не удалось загрузить репозитории</p><p>' + esc(msg) + '</p><button class="btn btn--small btn--ghost" type="button" id="repo-retry">Попробовать снова</button></div>';
      $('#repo-retry').addEventListener('click', load);
    }

    function draw() {
      let list = repos.filter((r) => !(hideForks.checked && r.fork));
      const by = sortSel.value;
      list = list.slice().sort((a, b) =>
        by === 'stars' ? b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)
        : by === 'name' ? a.name.localeCompare(b.name)
        : new Date(b.pushed_at) - new Date(a.pushed_at));
      box.setAttribute('aria-busy', 'false');
      if (!list.length) {
        box.innerHTML = '<div class="state"><p class="state__title">Здесь пока пусто</p><p>Публичных репозиториев по этому фильтру не найдено.</p></div>';
        return;
      }
      const fmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      box.innerHTML = list.map((r, i) =>
        '<a class="repo" style="--i:' + i + '" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' +
          '<span class="repo__name">' + esc(r.name) + '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg></span>' +
          '<span class="repo__desc">' + esc(r.description || 'Описание не указано') + '</span>' +
          '<span class="repo__meta">' +
            (r.language ? '<span class="repo__lang" style="--lang:' + (LANG_COLORS[r.language] || '#8b949e') + '">' + esc(r.language) + '</span>' : '') +
            '<span>★ ' + r.stargazers_count + '</span>' +
            '<span>Обновлён ' + fmt.format(new Date(r.pushed_at)) + '</span>' +
            (r.fork ? '<span>форк</span>' : '') +
          '</span>' +
        '</a>').join('');
    }

    async function load() {
      skeleton();
      const cacheKey = 'repos:' + user;
      try {
        // Кэш на 10 минут: у неавторизованного API лимит 60 запросов в час
        const cached = JSON.parse(store.get(cacheKey) || 'null');
        if (cached && Date.now() - cached.t < 600000) { repos = cached.data; draw(); return; }
      } catch (e) { /* битый кэш игнорируем */ }

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 9000);
      try {
        const res = await fetch('https://api.github.com/users/' + encodeURIComponent(user) + '/repos?per_page=100&sort=updated', {
          headers: { Accept: 'application/vnd.github+json' }, signal: ctrl.signal
        });
        if (res.status === 403 || res.status === 429) throw new Error('Превышен лимит запросов к GitHub API (60 в час). Попробуйте позже.');
        if (res.status === 404) throw new Error('Пользователь «' + user + '» не найден на GitHub.');
        if (!res.ok) throw new Error('GitHub вернул ошибку ' + res.status + '.');
        repos = await res.json();
        store.set(cacheKey, JSON.stringify({ t: Date.now(), data: repos }));
        draw();
      } catch (err) {
        showError(err.name === 'AbortError' ? 'Сервер слишком долго не отвечает. Проверьте интернет и повторите попытку.'
          : err instanceof TypeError ? 'Нет соединения с интернетом или запрос заблокирован.' : err.message);
      } finally {
        clearTimeout(timeout);
      }
    }

    hideForks.addEventListener('change', draw);
    sortSel.addEventListener('change', draw);

    // Грузим секцию лениво — когда она подъезжает к экрану; в режиме ?demo=apierror имитируем сбой
    const start = () => {
      if (new URLSearchParams(location.search).get('demo') === 'apierror') { showError('Это демонстрация состояния ошибки (?demo=apierror).'); return; }
      load();
    };
    skeleton();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { obs.disconnect(); start(); } }, { rootMargin: '300px' });
      io.observe($('#github'));
    } else start();
  }

  /* ================= 9. Погода (Open-Meteo) ================= */
  function initWeather() {
    const out = $('#weather-value');
    const c = APP_CONFIG.city;
    const codes = { 0: 'ясно', 1: 'почти ясно', 2: 'переменная облачность', 3: 'пасмурно', 45: 'туман', 48: 'туман', 51: 'морось', 53: 'морось', 55: 'морось', 61: 'дождь', 63: 'дождь', 65: 'сильный дождь', 71: 'снег', 73: 'снег', 75: 'сильный снег', 80: 'ливень', 95: 'гроза' };
    const time = () => new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: c.timeZone }).format(new Date());
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon + '&current=temperature_2m,weather_code')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((d) => {
        const t = Math.round(d.current.temperature_2m);
        out.textContent = (t > 0 ? '+' : '') + t + '°C, ' + (codes[d.current.weather_code] || 'без осадков') + ' · ' + time();
      })
      .catch(() => { out.textContent = 'Местное время ' + time(); });
  }

  /* ================= 10. Форма ================= */
  function initForm() {
    const form = $('#contact-form');
    const status = $('#form-status');
    const submit = $('#form-submit');
    const msg = $('#f-message');
    const counter = $('#f-counter');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Правила проверки: функция возвращает текст ошибки или пустую строку
    const rules = {
      'f-name': (v) => !v.trim() ? 'Введите имя' : v.trim().length < 2 ? 'Имя слишком короткое (минимум 2 символа)' : /\d{3,}/.test(v) ? 'Имя не должно содержать длинных чисел' : '',
      'f-email': (v) => !v.trim() ? 'Введите email' : !emailRe.test(v.trim()) ? 'Проверьте email: нужен формат name@example.com' : '',
      'f-topic': (v) => !v ? 'Выберите тему обращения' : '',
      'f-message': (v) => !v.trim() ? 'Напишите сообщение' : v.trim().length < 10 ? 'Сообщение слишком короткое (минимум 10 символов), сейчас ' + v.trim().length : '',
      'f-consent': (_, el) => !el.checked ? 'Нужно согласие на обработку данных' : ''
    };

    function validate(el) {
      const err = rules[el.id](el.value, el);
      const wrap = el.closest('.field') || el.closest('.field__consent');
      const out = $('#' + el.id + '-err');
      out.textContent = err;
      if (wrap && wrap.classList.contains('field')) {
        wrap.classList.toggle('is-invalid', !!err);
        wrap.classList.toggle('is-valid', !err && el.value.trim() !== '');
      }
      el.setAttribute('aria-invalid', String(!!err));
      el.setAttribute('aria-describedby', el.id + '-err');
      return !err;
    }

    const fields = Object.keys(rules).map((id) => $('#' + id));
    fields.forEach((el) => {
      // Первая проверка — при уходе с поля, затем — на каждый ввод
      el.addEventListener('blur', () => { el.dataset.touched = '1'; validate(el); });
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => { if (el.dataset.touched || el.type === 'checkbox' || el.tagName === 'SELECT') validate(el); });
    });
    msg.addEventListener('input', () => { counter.textContent = msg.value.length + ' / ' + msg.maxLength; });

    function setStatus(kind, html) {
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
      status.innerHTML = html;
    }

    const emailjsReady = () => {
      const c = (window.APP_CONFIG || {}).emailjs || {};
      return window.emailjs && !isPlaceholder(c.publicKey) && !isPlaceholder(c.serviceId) && !isPlaceholder(c.templateId);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', '');
      const results = fields.map((el) => { el.dataset.touched = '1'; return validate(el); });
      if (results.includes(false)) {
        const bad = fields.find((el) => el.getAttribute('aria-invalid') === 'true');
        setStatus('error', 'Исправьте отмеченные поля: форма не отправлена.');
        bad.focus();
        return;
      }
      // Заполненная ловушка — это бот: молча «успех», ничего не отправляем
      if (form.elements.website && form.elements.website.value) { setStatus('ok', 'Спасибо! Сообщение отправлено.'); return; }

      const data = {
        from_name: $('#f-name').value.trim(),
        reply_to: $('#f-email').value.trim(),
        topic: $('#f-topic').value,
        message: msg.value.trim()
      };

      if (!emailjsReady()) {
        // Ключей EmailJS нет (плейсхолдеры в js/config.js) — даём рабочую альтернативу
        const mail = APP_CONFIG.fallbackEmail;
        const href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Портфолио: ' + data.topic) +
          '&body=' + encodeURIComponent(data.message + '\n\n— ' + data.from_name + ' (' + data.reply_to + ')');
        setStatus('info', 'Отправка через EmailJS ещё не настроена (в <code>js/config.js</code> стоят плейсхолдеры). ' +
          'Форма проверена и готова, а пока напишите напрямую: <a href="' + href + '">' + esc(mail) + '</a>.');
        return;
      }

      submit.classList.add('is-loading');
      submit.setAttribute('aria-disabled', 'true');
      try {
        const c = APP_CONFIG.emailjs;
        await emailjs.send(c.serviceId, c.templateId, data, { publicKey: c.publicKey });
        setStatus('ok', 'Спасибо, ' + esc(data.from_name) + '! Сообщение отправлено, отвечу в течение суток.');
        form.reset();
        counter.textContent = '0 / ' + msg.maxLength;
        fields.forEach((el) => { delete el.dataset.touched; el.removeAttribute('aria-invalid'); const w = el.closest('.field'); if (w) w.classList.remove('is-valid', 'is-invalid'); });
      } catch (err) {
        const reason = err && err.text ? ' (' + esc(err.text) + ')' : '';
        setStatus('error', 'Не удалось отправить сообщение' + reason + '. Попробуйте ещё раз или напишите на <a href="mailto:' + APP_CONFIG.fallbackEmail + '">' + APP_CONFIG.fallbackEmail + '</a>.');
      } finally {
        submit.classList.remove('is-loading');
        submit.removeAttribute('aria-disabled');
      }
    });

    // Копирование email в буфер обмена
    $('#copy-email').addEventListener('click', async (e) => {
      const text = e.currentTarget.dataset.copy;
      try { await navigator.clipboard.writeText(text); toast('Email скопирован: ' + text); }
      catch (err) { toast('Не удалось скопировать — выделите адрес вручную'); }
    });

    // Демонстрация состояния ошибок: ?demo=errors (используется для скриншотов)
    if (new URLSearchParams(location.search).get('demo') === 'errors') {
      $('#f-name').value = 'А';
      $('#f-email').value = 'alex@';
      msg.value = 'Привет';
      form.requestSubmit();
    }
  }

  /* ================= 11. Запуск ================= */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    initTheme();
    initNav();
    initReveal();
    initProjects();
    initModal();
    initReviews();
    initGithub();
    initWeather();
    initForm();
  }

  // Скрипты подключены с defer, поэтому DOM уже готов
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
