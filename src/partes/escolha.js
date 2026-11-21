// Escolhas do formulário: o <select> nativo fica no form (valor e evento change), escondido; no lugar dele, um botão
// com a lista no desenho da marca. Teclado como no select do sistema; clique fora, Esc, Tab ou rolar a página fecha.
let aberta = null;

export function iniciaEscolhas() {
  document.querySelectorAll('.campo--escolha select').forEach(monta);
  addEventListener('pointerdown', e => { if (aberta && !aberta.campo.contains(e.target)) aberta.fecha(false); });
  addEventListener('scroll', () => { if (aberta && Math.abs(scrollY - aberta.y) > 60) aberta.fecha(false); }, { passive: true });
}

const normaliza = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function monta(select) {
  const campo = select.closest('[data-campo]');
  const rotulo = campo.querySelector(`label[for="${select.id}"]`);
  const id = select.id;

  // o botão herda o id (o <label for> passa a apontar para ele) e a descrição do erro
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.id = id;
  botao.className = 'campo__entrada escolha__botao';
  botao.setAttribute('role', 'combobox');
  botao.setAttribute('aria-haspopup', 'listbox');
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-controls', `${id}-lista`);
  const descricao = select.getAttribute('aria-describedby');
  if (descricao) botao.setAttribute('aria-describedby', descricao);

  select.id = `${id}-nativo`;
  select.removeAttribute('aria-describedby');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.classList.replace('campo__entrada', 'escolha__nativo');

  const lista = document.createElement('ul');
  lista.id = `${id}-lista`;
  lista.className = 'escolha__lista';
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('data-lenis-prevent', ''); // a lista rola sozinha, sem mover a página
  if (rotulo) { rotulo.id ||= `${id}-rotulo`; lista.setAttribute('aria-labelledby', rotulo.id); }

  // a opção sem valor ("Tipo de imóvel") é só o texto vazio do botão, não entra na lista
  const opcoes = [...select.options].filter(o => o.value).map(o => {
    const li = document.createElement('li');
    li.id = `${id}-${o.value}`;
    li.className = 'escolha__opcao';
    li.setAttribute('role', 'option');
    li.dataset.valor = o.value;
    li.innerHTML = `<span>${o.textContent}</span><svg class="escolha__marca" viewBox="0 0 14 10" aria-hidden="true"><path d="M1 5l4 4 8-8"/></svg>`;
    lista.append(li);
    return li;
  });

  select.after(botao);
  campo.append(lista);

  let ativa = -1, busca = '', tBusca = 0, teclou = false;
  const api = { campo, fecha, y: 0 };
  const estaAberta = () => campo.classList.contains('is-aberto');
  const indiceDoValor = () => opcoes.findIndex(li => li.dataset.valor === select.value);
  const abrePeloTeclado = () => abre(Math.max(indiceDoValor(), 0)); // no mouse e no toque, nada aceso de saída

  function sincroniza() {
    botao.textContent = select.selectedOptions[0]?.textContent ?? '';
    botao.classList.toggle('is-vazio', !select.value);
    for (const li of opcoes) li.setAttribute('aria-selected', String(li.dataset.valor === select.value));
  }

  function marca(i) {
    ativa = i;
    opcoes.forEach((li, j) => li.classList.toggle('is-ativa', j === i));
    if (i >= 0) { botao.setAttribute('aria-activedescendant', opcoes[i].id); opcoes[i].scrollIntoView({ block: 'nearest' }); }
    else botao.removeAttribute('aria-activedescendant');
  }

  function abre(i = indiceDoValor()) {
    if (aberta && aberta !== api) aberta.fecha(false);
    // abre para cima quando não cabe embaixo (o formulário do hero fica no pé da tela)
    const r = campo.getBoundingClientRect();
    const embaixo = innerHeight - r.bottom;
    campo.classList.toggle('is-acima', embaixo < lista.offsetHeight + 24 && r.top > embaixo);
    campo.classList.add('is-aberto');
    botao.setAttribute('aria-expanded', 'true');
    marca(i);
    aberta = api;
    api.y = scrollY;
  }

  function fecha(devolveFoco = true) {
    campo.classList.remove('is-aberto');
    botao.setAttribute('aria-expanded', 'false');
    marca(-1);
    if (aberta === api) aberta = null;
    if (devolveFoco) botao.focus({ preventScroll: true });
  }

  function escolhe(i) {
    const valor = opcoes[i]?.dataset.valor;
    if (valor && select.value !== valor) {
      select.value = valor;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    fecha();
  }

  // digitar a primeira letra pula para a opção, como no select do sistema
  function procura(tecla) {
    clearTimeout(tBusca);
    busca += normaliza(tecla);
    tBusca = setTimeout(() => { busca = ''; }, 600);
    const inicio = busca.length === 1 ? (estaAberta() ? ativa : indiceDoValor()) + 1 : Math.max(ativa, 0);
    const ordem = [...opcoes.slice(inicio), ...opcoes.slice(0, inicio)];
    const achada = ordem.find(li => normaliza(li.textContent).startsWith(busca));
    if (!achada) return;
    const i = opcoes.indexOf(achada);
    if (estaAberta()) marca(i); else escolhe(i);
  }

  select.addEventListener('change', sincroniza);

  // Enter e Espaço resolvem no keydown; o clique que o navegador gera em seguida é ignorado
  botao.addEventListener('click', () => {
    if (teclou) return;
    estaAberta() ? fecha() : abre();
  });
  botao.addEventListener('keyup', () => setTimeout(() => { teclou = false; }));
  botao.addEventListener('keydown', e => {
    const n = opcoes.length;
    const aberto = estaAberta();
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        e.preventDefault();
        if (!aberto || e.altKey) return aberto ? escolhe(ativa) : abrePeloTeclado();
        return marca(Math.min(n - 1, Math.max(0, ativa + (e.key === 'ArrowDown' ? 1 : -1))));
      case 'Home':
      case 'End':
        e.preventDefault();
        if (!aberto) abrePeloTeclado();
        return marca(e.key === 'Home' ? 0 : n - 1);
      case 'Enter':
      case ' ':
        e.preventDefault();
        teclou = true;
        return aberto ? escolhe(ativa) : abrePeloTeclado();
      case 'Escape':
        if (aberto) { e.preventDefault(); fecha(); }
        return;
      case 'Tab':
        if (aberto) fecha(false);
        return;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); procura(e.key); }
    }
  });

  // a lista não toma o foco: ele fica no botão, que anuncia a opção ativa
  lista.addEventListener('mousedown', e => e.preventDefault());
  opcoes.forEach((li, i) => {
    li.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && ativa !== i) marca(i); });
    li.addEventListener('click', () => escolhe(i));
  });

  sincroniza();
}
