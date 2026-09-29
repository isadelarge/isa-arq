// Página de um projeto: abertura, ficha, texto, fotos por ambiente e próximo projeto
(() => {
  const { P, bySlug, src, catName, esc, observe, scanImgs, stripHTML, roomsHTML, bindTour, count } = window.IF;
  const slug = new URLSearchParams(location.search).get('p');
  const p = bySlug[slug];
  const hero = document.querySelector('[data-p-hero]');
  const body = document.querySelector('[data-p-body]');

  if (!p) {
    hero.remove();
    document.querySelector('[data-header]').classList.add('is-solid');
    body.innerHTML = `
      <section class="wrap p-missing">
        <p class="eyebrow">Projeto não encontrado</p>
        <h1 class="display">Este projeto não está na galeria.</h1>
        <a class="btn" href="projetos.html">Ver os projetos <svg class="i"><use href="#i-arrow"/></svg></a>
      </section>`;
    return;
  }

  const kind = `projeto de ${catName[p.cat].toLowerCase()}`;
  document.title = `${p.name}, ${kind} | Isadora Figueiredo, arquiteta em Maringá`;
  document.querySelector('meta[name=description]')?.setAttribute('content', `${p.name}, ${kind} de Isadora Figueiredo${p.city ? `, em ${p.city}` : ''}. ${p.lead}`);

  hero.insertAdjacentHTML('afterbegin', `<img src="${src(p.slug, p.cover)}" alt="${esc(p.name)}, ${kind} de Isadora Figueiredo">`);
  hero.querySelector('[data-p-name]').textContent = p.name;
  hero.querySelector('[data-p-meta]').textContent = [catName[p.cat], p.city].filter(Boolean).join(', ');

  const next = P[(P.indexOf(p) + 1) % P.length];
  const specs = [
    ['Categoria', catName[p.cat]],
    p.city && ['Local', p.city],
    ['Ambientes', p.rooms.length],
    ['Fotos', p.dims.length],
  ].filter(Boolean);

  body.innerHTML = `
    <section class="section" style="padding-bottom:0">
      <div class="wrap p-intro">
        <a class="p-back link-arrow reveal" href="projetos.html"><svg class="i"><use href="#i-arrow-l"/></svg>Projetos</a>
        <dl class="p-specs reveal">${specs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        <div class="p-text">
          <p class="lead reveal">${esc(p.lead)}</p>
          <p class="reveal reveal-d1">${esc(p.text)}</p>
        </div>
      </div>
    </section>

    <section class="p-tour wrap" id="ambientes">
      <div class="section__head">
        <h2 class="display reveal-lines"><span class="ln"><span>Ambientes</span></span></h2>
        <p class="gp__meta reveal">${p.rooms.length} ambientes, ${count(p.dims.length)}</p>
      </div>
      <div class="reveal">${stripHTML(p)}</div>
      ${roomsHTML(p)}
    </section>

    <a class="p-next" href="projeto.html?p=${next.slug}" data-transition="${esc(next.name)}">
      <img src="${src(next.slug, next.cover)}" alt="${esc(next.name)}" loading="lazy">
      <div class="wrap p-next__content">
        <p class="eyebrow">Próximo projeto</p>
        <div class="p-next__bottom">
          <h2 class="display">${esc(next.name)}</h2>
          <span class="btn">Ver projeto <svg class="i"><use href="#i-arrow"/></svg></span>
        </div>
      </div>
    </a>`;

  bindTour(body.querySelector('.p-tour'), p);
  observe(body);
  scanImgs(body);
  IF.noWidows(body);
  IF.noWidows(hero);
  IF.lenis?.resize();

  // Vindo da página de Projetos: #foto-N rola até a foto clicada, #<slug>-amb-K até o ambiente
  const target = (() => {
    const m = location.hash.match(/^#foto-(\d+)$/);
    if (m) return body.querySelector(`.room__grid [data-photo="${m[1]}"]`);
    return location.hash ? body.querySelector(decodeURIComponent(location.hash)) : null;
  })();
  if (target) {
    const go = () => {
      const h = target.getBoundingClientRect().height;
      const photo = target.matches('[data-photo]');
      const offset = photo ? -Math.max(90, (innerHeight - h) / 2) : -90;
      if (IF.lenis) IF.lenis.scrollTo(target, { immediate: true, force: true, offset });
      else scrollTo(0, target.getBoundingClientRect().top + scrollY + offset);
      if (photo) { target.classList.add('is-target'); setTimeout(() => target.classList.remove('is-target'), 2400); }
    };
    requestAnimationFrame(() => requestAnimationFrame(go));
    document.fonts?.ready.then(() => setTimeout(go, 60));
  }
})();
