(function () {
  'use strict';
  var d = document, L = window.LOGO, EASE = 'cubic-bezier(.16,.84,.32,1)';
  var WA = '351963356549';
  var CORES = { claro: '#ece4d6', escuro: '#121312', ouro: '#c08a5c' };

  /* ---------- logo vetorizada (partes do post de abertura do estúdio) ---------- */
  function path(p, x, y) { return '<path transform="translate(' + x + ' ' + y + ')" d="' + p.d + '"/>'; }
  function logoH(cor) {
    // VAL QUÍ RÍA lado a lado, alinhado pela linha de base
    var g = 70, top = 1e9, bot = -1e9, x = 0, out = '', base = 0;
    var ps = [L.val, L.qui, L.ria];
    ps.forEach(function (p) { top = Math.min(top, p.y - p.base); bot = Math.max(bot, p.y + p.h - p.base); });
    top = Math.min(top, L.acento.y - L.qui.base);
    ps.forEach(function (p, i) {
      out += path(p, x, p.y - p.base - top);
      if (p === L.qui) out += path(L.acento, x + (L.acento.x - L.qui.x), L.acento.y - L.qui.base - top);
      x += p.w + (i < 2 ? g : 0);
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + x + ' ' + (bot - top) + '" fill="' + cor + '" fill-rule="evenodd">' + out + '</svg>';
  }
  function logoV(cor, comSub) {
    var ps = [L.val, L.acento, L.qui, L.ria, L.agulha].concat(comSub ? [L.sub] : []);
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, out = '';
    ps.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x + p.w); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y + p.h); });
    ps.forEach(function (p) { out += path(p, p.x - x0, p.y - y0); });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (x1 - x0) + ' ' + (y1 - y0) + '" fill="' + cor + '" fill-rule="evenodd">' + out + '</svg>';
  }
  function agulha(cor) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + L.agulha.w + ' ' + L.agulha.h + '" fill="' + cor + '"><path d="' + L.agulha.d + '"/></svg>';
  }
  d.querySelectorAll('.logo-h').forEach(function (el) { el.innerHTML = logoH(CORES[el.dataset.cor] || CORES.claro); });
  d.querySelectorAll('.logo-v').forEach(function (el) { el.innerHTML = logoV(CORES.claro, true); });
  d.querySelectorAll('.agulha').forEach(function (el) { el.innerHTML = agulha(CORES.ouro); });
  d.querySelectorAll('.orn-q').forEach(function (el) {
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + L.q.w + ' ' + L.q.h + '" fill="#121312" fill-rule="evenodd"><path d="' + L.q.d + '"/></svg>';
  });

  /* ---------- hero: a agulha atravessa o quadro e revela a joia seguinte ---------- */
  var fotos = [].slice.call(d.querySelectorAll('#fotos img'));
  var voo = d.getElementById('voo');
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (voo && fotos.length) {
    voo.innerHTML = agulha(CORES.osso || '#e9dccb');
    voo.querySelector('svg').setAttribute('fill', '#e3c8a8');
    var atual = -1, PASSO = 1150, CICLO = 5200;
    function passa() {
      var prox = (atual + 1) % fotos.length, el = fotos[prox];
      var w = voo.parentNode.clientWidth, vw = voo.clientWidth;
      el.classList.add('vem');
      if (reduz) { fim(); return; }
      // agulha: entra pela esquerda, a ponta (à direita) cruza o quadro
      var a = voo.animate([{ transform: 'translate(' + (-vw) + 'px,-50%)' }, { transform: 'translate(' + (w + 20) + 'px,-50%)' }], { duration: PASSO, easing: 'cubic-bezier(.55,.1,.35,1)', fill: 'forwards' });
      // revelação acompanha a ponta da agulha (tip = translate + vw)
      var tot = w + 20 + vw, o1 = Math.min(.999, (w + 10) / tot);
      el.animate([{ clipPath: 'inset(0 100% 0 0)', offset: 0 }, { clipPath: 'inset(0 0% 0 0)', offset: o1 }, { clipPath: 'inset(0 0% 0 0)', offset: 1 }], { duration: PASSO, easing: 'cubic-bezier(.55,.1,.35,1)', fill: 'forwards' });
      a.onfinish = fim;
      function fim() {
        fotos.forEach(function (f, i) { if (i !== prox) { f.classList.remove('on'); f.getAnimations().forEach(function (x) { x.cancel(); }); } });
        el.classList.add('on'); el.classList.remove('vem');
        el.getAnimations().forEach(function (x) { x.cancel(); });
        atual = prox;
      }
    }
    setTimeout(passa, 250);
    var timer = setInterval(passa, CICLO);
    d.addEventListener('visibilitychange', function () {
      clearInterval(timer); if (!d.hidden) timer = setInterval(passa, CICLO);
    });
  }

  /* ---------- nav ---------- */
  var nav = d.getElementById('nav'), navbt = d.getElementById('navbt'), menu = d.getElementById('menu');
  function solida() { nav.classList.toggle('solida', window.scrollY > 40 || menu.classList.contains('aberto')); }
  window.addEventListener('scroll', solida, { passive: true }); solida();
  navbt.addEventListener('click', function () {
    var ab = menu.classList.toggle('aberto'); navbt.setAttribute('aria-expanded', ab); solida();
  });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('aberto'); navbt.setAttribute('aria-expanded', 'false'); solida(); } });

  /* ---------- perfurações ---------- */
  var OB = window.OBRAS || [], grade = d.getElementById('grade'), maisBt = d.getElementById('mais');
  var filtro = 'todas', mostrar = 24, lista = [];
  function render() {
    lista = OB.filter(function (o) { return filtro === 'todas' || o.z === filtro; });
    grade.innerHTML = lista.slice(0, mostrar).map(function (o, i) {
      return '<button class="peca" data-i="' + i + '" aria-label="' + o.t + '"><img src="img/t/' + o.n + '.webp" alt="' + o.t + '" width="720" height="900"><span class="sr">' + o.t + '</span></button>';
    }).join('');
    maisBt.parentNode.hidden = lista.length <= mostrar;
  }
  d.querySelectorAll('[data-f]').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      filtro = b.dataset.f; mostrar = 24; render();
      grade.animate([{ opacity: .2, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE });
    });
  });
  maisBt.addEventListener('click', function () { mostrar += 24; render(); });
  render();

  /* ---------- joias ---------- */
  var JOIAS = { ouro: 12, titanio: 12 }, jg = d.getElementById('joiasgrade'), tipo = 'ouro';
  var NOMES = { ouro: 'Ouro 14k/18k', titanio: 'Titânio / ouro rosé' };
  function renderJ() {
    var h = '';
    for (var i = 0; i < JOIAS[tipo]; i++) {
      h += '<figure class="joia"><div class="joia-img"><img src="img/' + tipo + '/' + i + '.webp" alt="Joia ' + NOMES[tipo] + ' disponível no estúdio" width="900" height="1125"></div>' +
        '<button type="button" data-joia="' + tipo + '-' + (i + 1) + '">Quero esta</button></figure>';
    }
    jg.innerHTML = h;
  }
  d.querySelectorAll('[data-j]').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('[data-j]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      tipo = b.dataset.j; renderJ();
      jg.animate([{ opacity: .2, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EASE });
    });
  });
  renderJ();
  // pré-carregar o outro conjunto para a troca ser imediata
  for (var k = 0; k < 12; k++) { (new Image()).src = 'img/titanio/' + k + '.webp'; }

  var form = d.getElementById('form'), erro = d.getElementById('erro');
  function preenche(texto, material) {
    form.ideia.value = texto;
    if (material) { var r = form.querySelector('input[name=material][value="' + material + '"]'); if (r) r.checked = true; }
    form.joia.value = 'Vi uma no site';
    d.getElementById('marcar').scrollIntoView({ behavior: reduz ? 'auto' : 'smooth' });
    setTimeout(function () { form.nome.focus({ preventScroll: true }); }, 700);
  }
  jg.addEventListener('click', function (e) {
    var b = e.target.closest('[data-joia]'); if (!b) return;
    var p = b.dataset.joia.split('-');
    preenche('Gostei da joia ' + (p[0] === 'ouro' ? 'em ouro' : 'em titânio / ouro rosé') + ' n.º ' + p[1] + ' que vi no site.', p[0] === 'ouro' ? 'Ouro 14k' : 'Titânio');
  });

  /* ---------- lightbox ---------- */
  var lb = d.getElementById('lb'), lbimg = d.getElementById('lbimg'), lbcap = d.getElementById('lbcap'), li = 0, voltaFoco = null;
  function abre(i) {
    li = (i + lista.length) % lista.length; var o = lista[li];
    lbimg.src = 'img/g/' + o.n + '.webp'; lbimg.alt = o.t; lbcap.textContent = o.t;
    if (lb.hidden) {
      voltaFoco = d.activeElement; lb.hidden = false; d.body.style.overflow = 'hidden';
      lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE });
      d.getElementById('lbx').focus();
    }
  }
  function fecha() { lb.hidden = true; d.body.style.overflow = ''; if (voltaFoco) voltaFoco.focus({ preventScroll: true }); }
  grade.addEventListener('click', function (e) { var b = e.target.closest('.peca'); if (b) abre(+b.dataset.i); });
  d.getElementById('lbx').addEventListener('click', fecha);
  d.getElementById('lbprev').addEventListener('click', function () { abre(li - 1); });
  d.getElementById('lbnext').addEventListener('click', function () { abre(li + 1); });
  d.getElementById('lbquero').addEventListener('click', function () {
    var o = lista[li]; fecha();
    var z = { orelha: 'Orelha', rosto: 'Ainda não sei', corpo: 'Umbigo' }[o.z];
    var r = form.querySelector('input[name=zona][value="' + z + '"]'); if (r) r.checked = true;
    preenche('Quero algo como "' + o.t + '" que vi no site.');
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowRight') abre(li + 1);
    if (e.key === 'ArrowLeft') abre(li - 1);
  });

  /* ---------- formulário → WhatsApp ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nome = (f.get('nome') || '').trim();
    if (!nome) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Valquíria! Sou *' + nome + '* e quero marcar uma perfuração.', '',
      '*Perfuração:* ' + f.get('zona'),
      '*Material:* ' + f.get('material')];
    if ((f.get('local') || '').trim()) l.push('*Local:* ' + f.get('local').trim());
    l.push('*Joia:* ' + f.get('joia'));
    l.push('*Disponibilidade:* ' + f.get('quando'));
    if ((f.get('ideia') || '').trim()) l.push('*Ideia:* ' + f.get('ideia').trim());
    l.push('', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
  form.nome.addEventListener('input', function () { if (form.nome.value.trim()) erro.hidden = true; });

  /* ---------- entrada ao rolar ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vis'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  d.querySelectorAll('.rev').forEach(function (el) { io ? io.observe(el) : el.classList.add('vis'); });
})();
