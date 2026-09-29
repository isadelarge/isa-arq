(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const root = document.documentElement;
  const P = window.PROJECTS || [];
  const bySlug = Object.fromEntries(P.map((p) => [p.slug, p]));
  const src = (slug, i) => `assets/img/${slug}/${String(i).padStart(2, '0')}.webp`;
  const catName = { arquitetura: 'Arquitetura', interiores: 'Interiores' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const WA_NUMBER = '5544991344852';
  const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  // Ícones: um só traço em todo o site
  document.body.insertAdjacentHTML('afterbegin', `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M1.5 8h12.5M9.5 3.5 14 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="i-arrow-l" viewBox="0 0 16 16"><path d="M14.5 8H2M6.5 3.5 2 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="i-up" viewBox="0 0 16 16"><path d="M8 14.5V2M3.5 6.5 8 2l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="i-close" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3 3 13" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="i-out" viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
    <symbol id="i-grid" viewBox="0 0 16 16"><path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" fill="none" stroke="currentColor" stroke-width="1.2"/></symbol>
  </svg>`);

  // Rolagem com inércia
  const lenis = !reduce && window.Lenis ? new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, autoRaf: true }) : null;
  if (!lenis) root.style.scrollBehavior = 'smooth';
  const lock = (on) => { root.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
  const scrollToEl = (el, offset = 0) => {
    if (lenis) lenis.scrollTo(el, { duration: 1.6, offset, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  // Transição entre páginas: painel sobe, a próxima página revela de cima
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
    e.preventDefault();
    const label = a.dataset.transition || '';
    const panel = document.createElement('div');
    panel.className = 'pt-leave';
    panel.innerHTML = `<span>${esc(label)}</span>`;
    document.body.appendChild(panel);
    try { sessionStorage.setItem('if-pt', label); } catch (_) {}
    setTimeout(() => { location.href = a.href; }, 780);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) document.querySelectorAll('.pt-leave').forEach((p) => p.remove()); });
  if (root.classList.contains('pt-arrive')) setTimeout(() => root.classList.remove('pt-arrive'), 1300);

  // Intro: abre a home, menos quando o link leva direto a uma seção (#) ou pelo botão voltar
  const intro = document.querySelector('[data-intro]');
  const navType = performance.getEntriesByType?.('navigation')[0]?.type;
  const skipIntro = !!location.hash || navType === 'back_forward';
  const ready = () => root.classList.add('is-ready');
  if (intro && !skipIntro) {
    lenis?.stop();
    scrollTo(0, 0);
    const end = () => {
      if (intro.classList.contains('is-leaving')) return;
      intro.classList.add('is-leaving');
      root.classList.remove('is-intro');
      lenis?.start();
      setTimeout(ready, 350);
      setTimeout(() => { intro.classList.add('is-gone'); dispatchEvent(new Event('if:intro-done')); }, 1400);
    };
    const heroImg = document.querySelector('.hero__media img');
    Promise.all([
      document.fonts?.ready,
      new Promise((r) => { if (!heroImg || heroImg.complete) r(); else heroImg.onload = heroImg.onerror = r; }),
      new Promise((r) => setTimeout(r, reduce ? 200 : 2200)),
    ]).then(end);
    setTimeout(end, 6000);
    intro.addEventListener('click', end);
  } else {
    intro?.classList.add('is-gone');
    root.classList.remove('is-intro');
    requestAnimationFrame(ready);
  }

  // Header: transparente sobre a foto de abertura, sólido depois, some ao descer e volta ao subir
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('[data-hero]');
  // Abertura só com o nome: a navbar fica escondida no topo até surgir depois da intro
  const bare = hero?.hasAttribute('data-bare');
  let lastY = scrollY, acc = 0, autoScroll = false;
  // Some ao rolar para baixo, volta com um leve movimento para cima.
  // Soma o deslocamento em cada direção, porque a rolagem suave chega em passos pequenos.
  const onScroll = () => {
    const y = scrollY, dy = y - lastY, limit = hero ? hero.offsetHeight - 80 : 10;
    lastY = y;
    header.classList.toggle('is-solid', !hero || y > limit);
    if (dy && Math.sign(dy) !== Math.sign(acc)) acc = 0;
    acc = autoScroll ? 0 : acc + dy;
    if (bare && y < 60 && !header.classList.contains('is-revealed')) header.classList.add('is-hidden');
    else if (autoScroll || y <= 90) header.classList.remove('is-hidden');
    else if (acc > 12) header.classList.add('is-hidden');
    else if (acc < -6) header.classList.remove('is-hidden');
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Depois da intro, a navbar surge em fade sobre a foto; no celular a página também desce até a primeira seção
  if (bare) {
    const mobile = matchMedia('(max-width: 900px)').matches;
    addEventListener('if:intro-done', () => {
      const first = hero.nextElementSibling;
      let touched = false;
      const stop = () => { touched = true; };
      ['touchstart', 'wheel', 'keydown'].forEach((t) => addEventListener(t, stop, { once: true, passive: true }));
      setTimeout(() => {
        header.classList.add('is-revealed', 'is-fadein');
        header.classList.remove('is-hidden');
        setTimeout(() => header.classList.remove('is-fadein'), 900);
        setTimeout(() => {
          if (!mobile || touched || scrollY > 20 || !first || reduce) return;
          autoScroll = true;
          const done = () => { autoScroll = false; lastY = scrollY; acc = 0; };
          setTimeout(done, 2000); // garante a volta ao normal se a rolagem for interrompida
          if (lenis) lenis.scrollTo(first, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: done });
          else { first.scrollIntoView({ behavior: 'smooth' }); setTimeout(done, 1200); }
        }, 1000);
      }, 1000);
    }, { once: true });
  }

  // Menu
  const menu = document.querySelector('[data-menu]');
  const openBtn = document.querySelector('[data-menu-open]');
  const setMenu = (open) => { menu.classList.toggle('is-open', open); openBtn.setAttribute('aria-expanded', open); lock(open); };
  openBtn.addEventListener('click', () => setMenu(true));
  menu.querySelector('[data-menu-close]').addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { if (!a.hash || a.pathname !== location.pathname) setMenu(false); }));

  // Painel lateral "Falar com a equipe": monta a mensagem e abre o WhatsApp
  document.body.insertAdjacentHTML('beforeend', `
  <div class="start" data-start-card aria-hidden="true">
    <div class="start__scrim" data-start-close></div>
    <aside class="start__card" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="start-title" tabindex="-1">
      <div class="start__top">
        <p class="eyebrow">Falar com a equipe</p>
        <button class="icon-btn" data-start-close aria-label="Fechar"><svg class="i"><use href="#i-close"/></svg></button>
      </div>
      <form class="start__form" data-start-form>
        <h2 id="start-title" class="start__title">Conte o que você imagina.</h2>
        <p class="start__lead">A mensagem segue pelo WhatsApp e a equipe responde para marcar uma primeira conversa.</p>
        <fieldset class="field">
          <legend>Tipo de projeto</legend>
          <div class="chips">
            <label><input type="radio" name="tipo" value="uma casa" checked><span>Casa</span></label>
            <label><input type="radio" name="tipo" value="um apartamento"><span>Apartamento</span></label>
            <label><input type="radio" name="tipo" value="um espaço comercial"><span>Espaço comercial</span></label>
            <label><input type="radio" name="tipo" value="outro tipo de espaço"><span>Outro</span></label>
          </div>
        </fieldset>
        <div class="field-row">
          <label class="field"><span>Nome</span><input name="nome" autocomplete="name" required></label>
          <label class="field"><span>Cidade</span><input name="cidade" autocomplete="address-level2"></label>
        </div>
        <label class="field"><span>Sobre a ideia</span><textarea name="mensagem" rows="3" placeholder="Metragem, prazo, o que for importante"></textarea></label>
        <button class="btn btn--solid" type="submit">Enviar pelo WhatsApp <svg class="i"><use href="#i-arrow"/></svg></button>
      </form>
      <div class="start__alt">
        <a href="${wa('Olá! Vim pelo site e gostaria de conversar sobre um projeto.')}" target="_blank" rel="noopener">Chamar direto no WhatsApp</a>
        <a href="https://www.instagram.com/isadorafigueiredo.arq/" target="_blank" rel="noopener">Instagram</a>
        <span>Rua Luiz Gama, 662, Maringá</span>
      </div>
    </aside>
  </div>`);
  const start = document.querySelector('[data-start-card]');
  const startForm = start.querySelector('[data-start-form]');
  let startFocus = null;
  const setStart = (open) => {
    start.classList.toggle('is-open', open);
    start.setAttribute('aria-hidden', !open);
    lock(open);
    if (open) { startFocus = document.activeElement; setTimeout(() => start.querySelector('.start__card').focus({ preventScroll: true }), 50); }
    else startFocus?.focus?.({ preventScroll: true });
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-start]')) {
      e.preventDefault();
      if (menu.classList.contains('is-open')) { menu.classList.remove('is-open'); openBtn.setAttribute('aria-expanded', false); }
      setStart(true);
    }
    if (e.target.closest('[data-start-close]')) setStart(false);
  });
  startForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(startForm);
    const nome = f.get('nome').trim(), cidade = f.get('cidade').trim(), msg = f.get('mensagem').trim();
    const text = `Olá! Meu nome é ${nome}. Vim pelo site e gostaria de conversar sobre ${f.get('tipo')}${cidade ? ` em ${cidade}` : ''}.${msg ? ` ${msg}` : ''}`;
    window.open(wa(text), '_blank', 'noopener');
    setStart(false);
  });

  // Âncoras da mesma página rolam suavemente
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.target === '_blank' || a.dataset.transition !== undefined) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = document.querySelector(decodeURIComponent(url.hash));
    if (!t) return;
    e.preventDefault();
    if (menu.classList.contains('is-open')) setMenu(false);
    scrollToEl(t);
  });

  // Hero: fotos alternando com o nome do projeto
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-slide]')];
    const name = hero.querySelector('[data-hero-name]');
    if (slides.length > 1 && !reduce) {
      let s = 0;
      setInterval(() => {
        if (document.hidden) return;
        slides[s].classList.remove('is-active');
        s = (s + 1) % slides.length;
        slides[s].classList.add('is-active');
        if (!name) return;
        name.classList.add('is-swap');
        setTimeout(() => { name.textContent = slides[s].dataset.name; name.classList.remove('is-swap'); }, 600);
      }, 6500);
    }
  }

  // Revelação ao entrar na tela
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: matchMedia('(max-width: 900px)').matches ? '0px 0px 12% 0px' : '0px 0px -10% 0px' });
  const observe = (scope = document) => scope.querySelectorAll('.reveal, .reveal-lines, .img-reveal').forEach((el) => {
    if (!el.classList.contains('is-in')) io.observe(el);
  });
  observe();

  // Texto de identidade: palavras acendem conforme a rolagem
  const words = document.querySelector('[data-words]');
  let wordEls = [];
  if (words) {
    const walk = (node) => [...node.childNodes].map((n) => {
      if (n.nodeType === 3) return n.textContent.split(/(\s+)/).map((t) => (t.trim() ? `<span class="w">${t}</span>` : t)).join('');
      const tag = n.tagName.toLowerCase();
      return `<${tag}>${walk(n)}</${tag}>`;
    }).join('');
    words.innerHTML = walk(words);
    wordEls = [...words.querySelectorAll('.w')];
    if (reduce) wordEls.forEach((w) => w.classList.add('on'));
  }
  const updateWords = () => {
    if (!wordEls.length || reduce) return;
    const r = words.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const n = Math.round(p * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('on', i < n));
  };

  // Parallax suave
  const updateParallax = () => {
    const vh = innerHeight;
    document.querySelectorAll('[data-parallax]').forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      img.style.transform = `translate3d(0, ${(p * -5).toFixed(2)}%, 0)`;
    });
  };
  let ticking = false;
  const frame = () => { updateWords(); if (!reduce) updateParallax(); ticking = false; };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();

  // Cursor "Ver" sobre fotos e imagem flutuante nas frentes de atuação
  const cursor = document.querySelector('[data-cursor]');
  const float = document.querySelector('[data-fronts-float]');
  const fine = matchMedia('(hover: hover)').matches;
  if (fine && (cursor || float)) {
    let tx = 0, ty = 0, cx = 0, cy = 0, fx = 0, fy = 0;
    const SEL = '.work, .mosaic__item, .room__grid button';
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => { if (e.target.closest(SEL)) cursor?.classList.add('is-on'); });
    document.addEventListener('pointerout', (e) => { if (e.target.closest(SEL) && !e.relatedTarget?.closest?.(SEL)) cursor?.classList.remove('is-on'); });
    if (float) {
      const img = float.querySelector('img');
      document.querySelectorAll('[data-fronts] a').forEach((a) => {
        a.addEventListener('pointerenter', () => { img.src = a.dataset.img; float.classList.add('is-on'); });
        a.addEventListener('pointerleave', () => float.classList.remove('is-on'));
      });
    }
    const follow = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      if (cursor) cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (float) {
        fx += (tx - fx) * 0.1; fy += (ty - fy) * 0.1;
        float.style.transform = `translate3d(${fx + 30}px, ${fy - float.offsetHeight / 2}px, 0)`;
      }
      requestAnimationFrame(follow);
    };
    follow();
  }

  // ---------- Visualizador de fotos ----------
  document.body.insertAdjacentHTML('beforeend', `
  <div class="lb" data-lb tabindex="-1" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Foto ampliada">
    <div class="lb__top wrap">
      <p class="lb__name" data-lb-name></p>
      <span class="lb__count" data-lb-count></span>
      <button class="icon-btn" data-lb-close aria-label="Fechar"><svg class="i"><use href="#i-close"/></svg></button>
    </div>
    <div class="lb__stage" data-lb-stage></div>
    <div class="lb__foot"></div>
    <button class="lb__nav lb__nav--prev icon-btn" data-lb-prev aria-label="Foto anterior"><svg class="i"><use href="#i-arrow-l"/></svg></button>
    <button class="lb__nav lb__nav--next icon-btn" data-lb-next aria-label="Próxima foto"><svg class="i"><use href="#i-arrow"/></svg></button>
  </div>`);
  const lb = document.querySelector('[data-lb]');
  const stage = lb.querySelector('[data-lb-stage]');
  const lbName = lb.querySelector('[data-lb-name]');
  const lbCount = lb.querySelector('[data-lb-count]');
  let seq = [], at = 0, lastFocus = null, lbLocked = false;
  const pad = (n) => String(n).padStart(2, '0');
  const show = (n) => {
    at = (n + seq.length) % seq.length;
    const x = seq[at];
    stage.querySelectorAll('img').forEach((im) => { im.classList.remove('is-active'); setTimeout(() => im.remove(), 700); });
    const im = new Image();
    im.alt = `${x.p.name}, ${x.room}`; im.src = src(x.p.slug, x.i);
    stage.appendChild(im);
    const on = () => requestAnimationFrame(() => im.classList.add('is-active'));
    if (im.complete) on(); else im.onload = on;
    lbName.innerHTML = `${esc(x.p.name)}<small>${esc(x.room)}</small>`;
    lbCount.textContent = `${pad(at + 1)} / ${pad(seq.length)}`;
    const nx = seq[(at + 1) % seq.length]; new Image().src = src(nx.p.slug, nx.i);
  };
  const openLb = (items, start = 0) => {
    seq = items; lastFocus = document.activeElement;
    lbLocked = !root.classList.contains('is-locked');
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    if (lbLocked) lock(true);
    show(Math.max(0, start)); lb.focus({ preventScroll: true });
  };
  const closeLb = () => {
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    if (lbLocked) lock(false);
    lastFocus?.focus?.({ preventScroll: true });
  };
  lb.querySelector('[data-lb-close]').addEventListener('click', closeLb);
  lb.querySelector('[data-lb-prev]').addEventListener('click', () => show(at - 1));
  lb.querySelector('[data-lb-next]').addEventListener('click', () => show(at + 1));
  let sx = null;
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1)); sx = null;
  });

  // Teclado: Esc fecha o que estiver aberto, setas navegam no visualizador
  const escStack = [];
  addEventListener('keydown', (e) => {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft') show(at - 1);
      return;
    }
    if (e.key !== 'Escape') return;
    if (start.classList.contains('is-open')) return setStart(false);
    if (menu.classList.contains('is-open')) return setMenu(false);
    escStack.at(-1)?.();
  });

  // ---------- Ambientes: faixa de miniaturas e seções de fotos ----------
  const land = (p, i) => p.dims[i][0] > p.dims[i][1] * 1.05;
  // Paisagens: a primeira ocupa a largura toda, as demais vão em pares. Retratos sempre em pares.
  const cells = (p, ids) => {
    const L = ids.filter((i) => land(p, i)), T = ids.filter((i) => !land(p, i));
    const out = L.map((i, k) => {
      const wide = k === 0 || (k === L.length - 1 && (L.length - 1) % 2 === 1);
      return { i, wide, ar: wide ? `${p.dims[i][0]} / ${p.dims[i][1]}` : '3 / 2' };
    });
    T.forEach((i) => out.push({ i, wide: false, ar: '4 / 5' }));
    return out;
  };
  const roomId = (p, k) => `${p.slug}-amb-${k}`;
  const count = (n) => `${n} ${n === 1 ? 'foto' : 'fotos'}`;
  const stripHTML = (p) => `
    <div class="rooms">
      ${p.rooms.map((r, k) => `
        <button data-go-room="${roomId(p, k)}">
          <div class="frame"><img src="${src(p.slug, r.photos[0])}" alt="" loading="lazy"></div>
          <b>${esc(r.name)}</b><small>${count(r.photos.length)}</small>
        </button>`).join('')}
    </div>`;
  const roomsHTML = (p) => p.rooms.map((r, k) => `
    <section class="room" id="${roomId(p, k)}">
      <div class="room__head"><h3>${esc(r.name)}</h3><p>${count(r.photos.length)}</p></div>
      <div class="room__grid">
        ${cells(p, r.photos).map((c) => `
          <button class="${c.wide ? 'is-wide' : ''}" data-photo="${c.i}" aria-label="Ampliar foto de ${esc(r.name)}">
            <div class="frame" style="aspect-ratio:${c.ar}"><img src="${src(p.slug, c.i)}" alt="${esc(p.name)}, ${esc(r.name)}" loading="lazy"></div>
          </button>`).join('')}
      </div>
    </section>`).join('');
  // Sequência do visualizador na mesma ordem em que as fotos aparecem na tela
  const sequence = (p) => p.rooms.flatMap((r) => cells(p, r.photos).map((c) => ({ p, i: c.i, room: r.name })));
  // Miniaturas levam ao ambiente, fotos abrem o visualizador
  const bindTour = (scope, p, scroller) => {
    scope.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go-room]');
      if (go) {
        const t = scope.querySelector('#' + go.dataset.goRoom);
        if (!t) return;
        if (scroller) scroller.scrollTo({ top: t.offsetTop - 70, behavior: reduce ? 'auto' : 'smooth' });
        else scrollToEl(t, -80);
        return;
      }
      const ph = e.target.closest('[data-photo]');
      if (ph) {
        const s = sequence(p);
        openLb(s, s.findIndex((x) => x.i === +ph.dataset.photo));
      }
    });
  };
  // Mosaico de cinco fotos: capa e a primeira foto de cada ambiente
  const mosaicPick = (p) => {
    const pick = [p.cover];
    p.rooms.forEach((r) => { if (pick.length < 5 && !pick.includes(r.photos[0])) pick.push(r.photos[0]); });
    for (let i = 0; pick.length < 5 && i < p.dims.length; i++) if (!pick.includes(i)) pick.push(i);
    return pick;
  };

  // Imagens aparecem com fade quando carregam
  const mark = (img) => img.closest('.frame')?.classList.add('is-loaded');
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') mark(e.target); }, true);
  const scanImgs = (scope = document) => scope.querySelectorAll('.frame img').forEach((img) => { if (img.complete && img.naturalWidth) mark(img); });
  scanImgs();

  // Depoimentos
  const rv = document.querySelector('[data-reviews]');
  if (rv) {
    const items = [...rv.querySelectorAll('.review')];
    const countEl = rv.querySelector('[data-count]');
    let r = 0, timer;
    const go = (n) => {
      items[r].classList.remove('is-active');
      r = (n + items.length) % items.length;
      items[r].classList.add('is-active');
      countEl.textContent = `${pad(r + 1)} / ${pad(items.length)}`;
    };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(r + 1), 8000); };
    rv.querySelector('[data-prev]').addEventListener('click', () => { go(r - 1); auto(); });
    rv.querySelector('[data-next]').addEventListener('click', () => { go(r + 1); auto(); });
    auto();
  }

  // Sem palavra sozinha na última linha: une as duas últimas palavras de cada texto
  const WIDOW = 'p, h1, h2, h3, h4, dd, figcaption, blockquote, li, .chip, .lead';
  const noWidows = (scope = document) => scope.querySelectorAll(WIDOW).forEach((el) => {
    if (el.dataset.nw || el.closest('.ln') || el.querySelector(WIDOW)) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (let k = nodes.length - 1; k >= 0; k--) {
      const t = nodes[k].nodeValue, trimmed = t.replace(/\s+$/, '');
      const at = trimmed.lastIndexOf(' ');
      if (at > 0) { nodes[k].nodeValue = trimmed.slice(0, at) + '\u00A0' + t.slice(at + 1); break; }
      if (trimmed) { // última palavra está sozinha neste nó: cola no espaço do nó anterior
        const prev = nodes[k - 1]; if (!prev) break;
        const pv = prev.nodeValue; if (/\s$/.test(pv)) prev.nodeValue = pv.replace(/\s+$/, '\u00A0');
        break;
      }
    }
    el.dataset.nw = '1';
  });
  noWidows();

  // Toque: linha embaixo e troca de cor ficam visíveis por um instante, também no celular
  const TAP = '.btn, .link-arrow, .footer__links a, .pindex a, .menu__links a, .contact__link, .header__nav a, .icon-btn, .chip, .filters button';
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest(TAP); if (!el) return;
    el.classList.add('is-tap');
    setTimeout(() => el.classList.remove('is-tap'), 650);
  }, { passive: true });

  // Pontinhos embaixo do carrossel de fotos no celular
  const dots = (scope = document) => scope.querySelectorAll('.mosaic').forEach((m) => {
    if (m.nextElementSibling?.classList.contains('mosaic__dots')) return;
    const items = [...m.querySelectorAll('.mosaic__item')];
    if (items.length < 2) return;
    m.insertAdjacentHTML('afterend', `<div class="mosaic__dots" aria-hidden="true">${items.map(() => '<span></span>').join('')}</div>`);
    const marks = [...m.nextElementSibling.children];
    const sync = () => {
      const step = items[1].offsetLeft - items[0].offsetLeft || 1;
      const k = Math.min(items.length - 1, Math.round(m.scrollLeft / step));
      marks.forEach((d, i) => d.classList.toggle('is-on', i === k));
    };
    m.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    sync();
  });
  dots();

  // "Ver mais" da seção da arquiteta no celular
  document.querySelectorAll('[data-more-about]').forEach((b) => b.addEventListener('click', () => {
    const box = b.closest('.about__text');
    box.classList.add('is-open'); b.setAttribute('aria-expanded', 'true');
    IF.lenis?.resize();
  }));

  window.IF = { P, bySlug, src, catName, esc, lenis, lock, scrollToEl, observe, scanImgs, openLb, sequence, stripHTML, roomsHTML, bindTour, mosaicPick, count, escStack, noWidows, wa, dots };
})();
