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

  hero.insertAdjacentHTML('afterbegin', `<img src="${src(p.slug, p.cover)}"${IF.dim(p, p.cover)} fetchpriority="high" alt="${esc(p.name)}, ${kind} de Isadora Figueiredo">`);
  hero.querySelector('[data-p-name]').textContent = p.name;
  hero.querySelector('[data-p-meta]').textContent = [catName[p.cat], p.city].filter(Boolean).join(', ');

  const next = P[(P.indexOf(p) + 1) % P.length];
  // Ficha técnica, como no Taipa: todos os campos aparecem; o que ainda falta em data.js vira um tracinho
  const specs = [
    ['Cliente', p.client], ['Local', p.city], ['Tipologia', p.type],
    ['Área construída', p.area], ['Terreno', p.site], ['Pavimentos', p.floors], ['Conclusão', p.year],
    ['Escopo', `Projeto de ${catName[p.cat].toLowerCase()}`], ['Equipe', 'Isadora Figueiredo e equipe'],
    ['Fotografia', p.photo],
  ];
  const val = (v) => (v || v === 0) ? esc(v) : '<span class="is-empty" aria-label="a informar">–</span>';
  // Números abaixo da ficha: área, ano e ambientes
  const num = (v) => v && String(v).replace(/\s*m²$/, '');
  const metrics = [[num(p.area), 'm² construídos'], [p.year, 'ano de conclusão'], [p.rooms.length, 'ambientes']];

  body.innerHTML = `
    <section class="section" style="padding-bottom:0">
      <div class="wrap p-intro">
        <a class="p-back link-arrow reveal" href="projetos.html"><svg class="i"><use href="#i-arrow-l"/></svg>Projetos</a>
        <details class="p-details reveal" data-p-details open>
          <summary class="p-details__toggle"><span class="p-details__more">Ver mais detalhes</span><span class="p-details__less">Ver menos detalhes</span><svg class="i"><use href="#i-plus"/></svg></summary>
          <dl class="p-specs">${specs.map(([k, v]) => `<dt>${k}</dt><dd>${val(v)}</dd>`).join('')}</dl>
          <div class="p-metrics">${metrics.map(([n, l]) => `<div><span class="p-metrics__num">${val(n)}</span><span>${l}</span></div>`).join('')}</div>
        </details>
        <div class="p-text">
          <p class="lead reveal">${esc(p.lead)}</p>
          <p class="reveal reveal-d1">${esc(p.text)}</p>
        </div>
      </div>
    </section>

    <section class="p-tour wrap" id="ambientes">
      <div class="section__head">
        <h2 class="display reveal-lines"><span class="ln"><span>Ambientes</span></span></h2>
      </div>
      <div class="reveal">${stripHTML(p)}</div>
      ${roomsHTML(p)}
    </section>

    <a class="p-next" href="projeto.html?p=${next.slug}" data-transition="${esc(next.name)}">
      <img src="${src(next.slug, next.cover)}"${IF.dim(next, next.cover)} alt="${esc(next.name)}" loading="lazy">
      <div class="wrap p-next__content">
        <p class="eyebrow">Próximo projeto</p>
        <div class="p-next__bottom">
          <h2 class="display">${esc(next.name)}</h2>
          <span class="btn">Ver projeto <svg class="i"><use href="#i-arrow"/></svg></span>
        </div>
      </div>
    </a>`;

  // No desktop a ficha fica sempre aberta; no celular abre em "Ver mais detalhes"
  const details = body.querySelector('[data-p-details]');
  const mq = matchMedia('(max-width: 900px)');
  const syncDetails = () => { details.open = !mq.matches; };
  mq.addEventListener('change', syncDetails);
  syncDetails();
  details.querySelector('summary').addEventListener('click', (e) => { if (!mq.matches) e.preventDefault(); });
  details.addEventListener('toggle', () => setTimeout(() => IF.lenis?.resize(), 520));

  bindTour(body.querySelector('.p-tour'), p);
  IF.dots(body);
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
