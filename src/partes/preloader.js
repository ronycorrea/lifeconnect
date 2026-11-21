// EFEITO 1: preloader. O progresso acompanha o carregamento real (imagens + window load), mas nunca termina
// antes de ~1,5 s, para o efeito aparecer. Em 100%: fade-out, sai do DOM e o scroll volta.
// Devolve uma promessa que resolve quando o preloader começa a sair (o hero entra junto).
import { lenis } from '../motion/suave.js';

const MINIMO = 1500;   // tempo mínimo de exibição (ms)
const LIMITE = 9000;   // se a rede travar, libera a página mesmo assim

export function iniciaPreloader() {
  const el = document.getElementById('preloader');
  return new Promise(resolve => {
    if (!el) { document.body.classList.remove('is-carregando'); return resolve(); }
    lenis?.stop();
    const barra = el.querySelector('.preloader__barra');
    const pct = el.querySelector('.preloader__pct');
    const inicio = performance.now();

    // conta as imagens que o navegador vai baixar agora (as "lazy" fora da tela ficam para depois)
    const imagens = [...document.images].filter(img => img.loading !== 'lazy');
    let prontas = 0;
    const total = imagens.length + 1; // +1 = o evento load da janela
    for (const img of imagens) {
      if (img.complete) prontas++;
      else {
        const conta = () => prontas++;
        img.addEventListener('load', conta, { once: true });
        img.addEventListener('error', conta, { once: true });
      }
    }
    let carregou = document.readyState === 'complete';
    if (!carregou) addEventListener('load', () => { carregou = true; }, { once: true });

    let mostrado = 0, ultimoTexto = -1;
    function quadro(agora) {
      const decorrido = agora - inicio;
      const real = carregou || decorrido > LIMITE ? 1 : Math.min(.96, prontas / total);
      const tempo = Math.min(1, decorrido / MINIMO);
      const alvo = Math.min(real, tempo) * 100;
      mostrado += (alvo - mostrado) * .14;
      if (alvo === 100 && mostrado > 99.4) mostrado = 100;

      barra.style.setProperty('--p', (mostrado / 100).toFixed(4));
      const texto = Math.floor(mostrado);
      if (texto !== ultimoTexto) { pct.textContent = `${texto}%`; ultimoTexto = texto; }

      if (mostrado < 100) return requestAnimationFrame(quadro);
      // 100%: fade-out e remoção
      el.classList.add('is-saindo');
      document.body.classList.remove('is-carregando');
      lenis?.start();
      resolve();
      setTimeout(() => el.remove(), 650);
    }
    requestAnimationFrame(quadro);
  });
}
