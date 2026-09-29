// Projetos: duas formas de ver, galeria (um bloco por projeto, com tour por ambiente) ou lista (nomes com a foto ao lado)
(() => {
  const { P, bySlug, src, catName, esc, lock, observe, scanImgs, stripHTML, roomsHTML, bindTour, mosaicPick, count, escStack, scrollToEl } = window.IF;
  const gallery = document.querySelector('[data-gallery]');
  const listSec = document.querySelector('[data-list]');
  const names = document.querySelector('[data-list-names]');
  const preview = document.querySelector('[data-list-preview]');
  const viewBtns = [...document.querySelectorAll('[data-view]')];
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  const meta = (p) => [catName[p.cat], p.city].filter(Boolean).join(', ');
  const roomOf = (p, i) => p.rooms.findIndex((r) => r.photos.includes(i));
  const state = { view: 'galeria', cat: 'todos' };

  // ---------- Galeria ----------
  gallery.innerHTML = P.map((p) => {
    const total = p.dims.length;
    return `
    <section class="gp" id="g-${p.slug}" data-cat="${p.cat}">
      <div class="gp__head">
        <div class="reveal">
          <h2 class="display"><a href="projeto.html?p=${p.slug}" data-transition="${esc(p.name)}">${esc(p.name)}</a></h2>
          <p class="gp__meta">${esc(meta(p))}</p>
        </div>
        <a class="link-arrow reveal" href="projeto.html?p=${p.slug}" data-transition="${esc(p.name)}">Página do projeto <svg class="i"><use href="#i-arrow"/></svg></a>
      </div>
      <div class="mosaic reveal">
        ${mosaicPick(p).map((i) => `
          <button class="mosaic__item" data-tour-open="${p.slug}" data-at="${i}" aria-label="Ver fotos de ${esc(p.name)}">
            <img src="${src(p.slug, i)}" alt="${esc(p.name)}" loading="lazy">
          </button>`).join('')}
        <button class="mosaic__all" data-tour-open="${p.slug}"><svg class="i"><use href="#i-grid"/></svg>Ver todas as ${total} fotos</button>
      </div>
      <button class="btn gp__all" data-tour-open="${p.slug}"><svg class="i"><use href="#i-grid"/></svg>Ver todas as ${total} fotos</button>
      <div class="gp__rooms reveal">
        ${p.rooms.map((r, k) => `<button class="chip" data-tour-open="${p.slug}" data-room="${k}">${esc(r.name)}<span>${r.photos.length}</span></button>`).join('')}
      </div>
    </section>`;
  }).join('');
  observe(gallery); scanImgs(gallery); IF.noWidows(gallery); IF.dots(gallery);

  // ---------- Lista ----------
  names.innerHTML = P.map((p) => `
    <li data-cat="${p.cat}">
      <a href="projeto.html?p=${p.slug}" data-transition="${esc(p.name)}" data-slug="${p.slug}">
        <img class="plist__thumb" src="${src(p.slug, p.cover)}" alt="" loading="lazy">
        <span class="plist__name">${esc(p.name)}</span>
        <span class="plist__meta">${esc(meta(p))}</span>
      </a>
    </li>`).join('');
  preview.innerHTML = `<div class="plist__shot">${P.map((p) => `<img src="${src(p.slug, p.cover)}" alt="" data-slug="${p.slug}" loading="lazy">`).join('')}</div>
    <figcaption><span data-cap-name></span><span data-cap-meta></span></figcaption>`;
  const shots = [...preview.querySelectorAll('img')];
  const capName = preview.querySelector('[data-cap-name]'), capMeta = preview.querySelector('[data-cap-meta]');
  const showPreview = (slug) => {
    const p = bySlug[slug]; if (!p) return;
    shots.forEach((im) => im.classList.toggle('is-on', im.dataset.slug === slug));
    capName.textContent = p.name; capMeta.textContent = meta(p);
    names.querySelectorAll('a').forEach((a) => a.classList.toggle('is-on', a.dataset.slug === slug));
  };
  names.addEventListener('pointerover', (e) => { const a = e.target.closest('a[data-slug]'); if (a) showPreview(a.dataset.slug); });
  names.addEventListener('focusin', (e) => { const a = e.target.closest('a[data-slug]'); if (a) showPreview(a.dataset.slug); });
  const firstVisible = () => names.querySelector('li:not([hidden]) a')?.dataset.slug;

  // ---------- Estado: modo de ver e categoria, guardados na URL ----------
  const apply = () => {
    document.body.dataset.view = state.view;
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === state.view));
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === state.cat));
    const hide = (el) => { el.hidden = state.cat !== 'todos' && el.dataset.cat !== state.cat; };
    gallery.querySelectorAll('.gp').forEach(hide);
    names.querySelectorAll('li').forEach(hide);
    gallery.hidden = state.view !== 'galeria';
    listSec.hidden = state.view !== 'lista';
    if (state.view === 'lista') { showPreview(firstVisible()); observe(listSec); }
    const url = new URL(location.href);
    state.cat === 'todos' ? url.searchParams.delete('c') : url.searchParams.set('c', state.cat);
    state.view === 'galeria' ? url.searchParams.delete('v') : url.searchParams.set('v', state.view);
    history.replaceState(history.state, '', url);
    IF.lenis?.resize();
  };
  viewBtns.forEach((b) => b.addEventListener('click', () => { state.view = b.dataset.view; apply(); }));
  filterBtns.forEach((b) => b.addEventListener('click', () => { state.cat = b.dataset.filter; apply(); }));
  const qs = new URLSearchParams(location.search);
  if (catName[qs.get('c')]) state.cat = qs.get('c');
  if (qs.get('v') === 'lista') state.view = 'lista';
  apply();
  if (location.hash.startsWith('#g-')) {
    const t = document.querySelector(location.hash);
    if (t) setTimeout(() => scrollToEl(t, -70), 400);
  }

  // ---------- Tour de fotos ----------
  const tour = document.querySelector('[data-tour]');
  const tourName = tour.querySelector('[data-tour-name]');
  const tourPage = tour.querySelector('[data-tour-page]');
  let body = tour.querySelector('[data-tour-body]');
  let pushed = false;

  const open = (slug, target) => {
    const p = bySlug[slug];
    if (!p) return;
    tourName.textContent = p.name;
    tourPage.href = `projeto.html?p=${p.slug}`;
    tourPage.dataset.transition = p.name;
    const fresh = body.cloneNode(false);
    fresh.innerHTML = `
      <h2 class="display tour__title">Ambientes</h2>
      <p class="gp__meta">${esc(meta(p))}, ${count(p.dims.length)}</p>
      ${stripHTML(p)}
      ${roomsHTML(p)}`;
    body.replaceWith(fresh); body = fresh;
    bindTour(body, p, tour);
    scanImgs(body); IF.noWidows(body);
    tour.classList.add('is-open'); tour.setAttribute('aria-hidden', 'false');
    lock(true);
    tour.scrollTop = 0;
    if (target != null) {
      const room = body.querySelector(`#${p.slug}-amb-${target}`);
      if (room) requestAnimationFrame(() => { tour.scrollTop = room.offsetTop - 70; });
    }
    tour.focus({ preventScroll: true });
    history.pushState({ tour: slug }, '', `#fotos-${slug}`);
    pushed = true;
    escStack.push(close);
  };
  function close(fromHistory) {
    if (!tour.classList.contains('is-open')) return;
    tour.classList.remove('is-open'); tour.setAttribute('aria-hidden', 'true');
    lock(false);
    escStack.pop();
    if (pushed && fromHistory !== true) { pushed = false; history.back(); } else pushed = false;
  }
  addEventListener('popstate', () => close(true));
  tour.querySelector('[data-tour-close]').addEventListener('click', () => close());

  gallery.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tour-open]');
    if (!b) return;
    const p = bySlug[b.dataset.tourOpen];
    let room = b.dataset.room != null ? +b.dataset.room : null;
    if (b.dataset.at != null) room = roomOf(p, +b.dataset.at);
    open(p.slug, room);
  });
})();
