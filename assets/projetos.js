// Projetos: um bloco por projeto, com filtro por categoria.
// Uma foto leva à página do projeto já nela; "Ver todas as fotos" abre a página do início.
(() => {
  const { P, src, catName, esc, observe, scanImgs, mosaicPick, scrollToEl } = window.IF;
  const gallery = document.querySelector('[data-gallery]');
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  const meta = (p) => [catName[p.cat], p.city].filter(Boolean).join(', ');
  const state = { cat: 'todos' };

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
      </div>
      <div class="mosaic reveal">
        ${mosaicPick(p).map((i) => `
          <a class="mosaic__item" href="projeto.html?p=${p.slug}#foto-${i}" data-transition="${esc(p.name)}" aria-label="Ver esta foto de ${esc(p.name)}">
            <img src="${src(p.slug, i)}" alt="${esc((p.rooms.find((r) => r.photos.includes(i)) || {}).name || p.name)}, ${esc(p.name)}, projeto de ${catName[p.cat].toLowerCase()}" loading="lazy">
          </a>`).join('')}
      </div>
      <div class="gp__foot reveal">
        <a class="link-arrow gp__all" href="projeto.html?p=${p.slug}" data-transition="${esc(p.name)}"><span class="gp__all-long">Ver todas as fotos</span><span class="gp__all-short">Ver as ${total} fotos</span> <svg class="i"><use href="#i-arrow"/></svg></a>
      </div>
    </section>`;
  }).join('');
  observe(gallery); scanImgs(gallery); IF.noWidows(gallery); IF.dots(gallery);
  gallery.querySelectorAll('.gp').forEach((g) => { const d = g.querySelector('.mosaic__dots'); if (d) g.querySelector('.gp__foot').prepend(d); });

  // ---------- Categoria, guardada na URL ----------
  const apply = () => {
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === state.cat));
    const hide = (el) => { el.hidden = state.cat !== 'todos' && el.dataset.cat !== state.cat; };
    gallery.querySelectorAll('.gp').forEach(hide);
    const url = new URL(location.href);
    state.cat === 'todos' ? url.searchParams.delete('c') : url.searchParams.set('c', state.cat);
    url.searchParams.delete('v');   // endereços antigos da lista caem na galeria
    history.replaceState(history.state, '', url);
    IF.lenis?.resize();
  };
  filterBtns.forEach((b) => b.addEventListener('click', () => { state.cat = b.dataset.filter; apply(); }));
  const qs = new URLSearchParams(location.search);
  if (catName[qs.get('c')]) state.cat = qs.get('c');
  apply();
  if (location.hash.startsWith('#g-')) {
    const t = document.querySelector(location.hash);
    if (t) setTimeout(() => scrollToEl(t, -70), 400);
  }
})();
