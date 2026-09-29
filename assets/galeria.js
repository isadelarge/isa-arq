// Galeria: um bloco por projeto (mosaico de cinco fotos) e o tour de fotos por ambiente
(() => {
  const { P, bySlug, src, catName, esc, lock, observe, scanImgs, stripHTML, roomsHTML, bindTour, mosaicPick, count, escStack, scrollToEl } = window.IF;
  const list = document.querySelector('[data-gallery]');
  const pindex = document.querySelector('[data-pindex]');
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  const meta = (p) => [catName[p.cat], p.city].filter(Boolean).join(', ');
  const roomOf = (p, i) => p.rooms.findIndex((r) => r.photos.includes(i));

  list.innerHTML = P.map((p) => {
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
  pindex.innerHTML = P.map((p) => `<a href="#g-${p.slug}" data-cat="${p.cat}">${esc(p.name)}</a>`).join('');
  observe(list); observe(pindex.parentElement); scanImgs(list); IF.noWidows(list);

  // Filtros: Todos, Arquitetura, Interiores
  const setFilter = (cat) => {
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === cat));
    document.querySelectorAll('.gp, .pindex a').forEach((el) => { el.hidden = cat !== 'todos' && el.dataset.cat !== cat; });
    IF.lenis?.resize();
  };
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    setFilter(b.dataset.filter);
    const url = new URL(location.href);
    if (b.dataset.filter === 'todos') url.searchParams.delete('c'); else url.searchParams.set('c', b.dataset.filter);
    history.replaceState(history.state, '', url);
  }));
  const initial = new URLSearchParams(location.search).get('c');
  if (initial && catName[initial]) setFilter(initial);
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

  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tour-open]');
    if (!b) return;
    const p = bySlug[b.dataset.tourOpen];
    let room = b.dataset.room != null ? +b.dataset.room : null;
    if (b.dataset.at != null) room = roomOf(p, +b.dataset.at);
    open(p.slug, room);
  });
})();
