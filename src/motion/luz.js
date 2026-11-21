// Luz da fibra: o que entrou no lugar do satélite da base.
// - Hero: o cabo de fibra no respiro do título curva de leve na direção do mouse (segue em ~0,3 s).
// - Passagens ([data-passagem]): um pulso de luz cruza o vão da direita para a esquerda enquanto a faixa sobe
//   de 92% a 8% da tela; com data-passagem="fim", o trecho é medido pelo fim da página (rodapé).
// - Anéis do no-break ([data-aneis]): giram conforme a seção atravessa a tela.
// Tudo roda no relógio único do suave.js (aCadaQuadro), no mesmo quadro do Lenis, sem amortecimento próprio.
import { aCadaQuadro, lenis } from './suave.js';

const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function iniciaLuz() {
  const visiveis = new Set();
  const io = new IntersectionObserver(es => {
    for (const e of es) (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target));
  }, { rootMargin: '20% 0px' });

  // ---- fibra do hero ----
  const fibra = document.querySelector('[data-fibra]');
  const caminhos = fibra ? [...fibra.querySelectorAll('path')] : [];
  const mouse = { x: .5, y: 0, ax: .5, ay: 0 };
  if (fibra && !reduz) {
    io.observe(fibra);
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = fibra.getBoundingClientRect();
      mouse.x = e.clientX / innerWidth;
      mouse.y = limita((e.clientY - (r.top + r.height / 2)) / (innerHeight * .5), -1, 1);
    }, { passive: true });
  }

  // ---- foto do hero: anda um pouco com o mouse (no computador) ----
  const hero = document.querySelector('.hero');
  const foto = document.querySelector('[data-hero-foto]');
  const fm = { x: 0, y: 0, ax: 0, ay: 0 };
  if (hero && foto && !reduz) {
    io.observe(hero);
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      fm.x = (e.clientX / innerWidth - .5) * -22;
      fm.y = (e.clientY / innerHeight - .5) * -12;
    }, { passive: true });
  }

  // ---- passagens ----
  const passagens = [...document.querySelectorAll('[data-passagem]')].map(el => ({ el, pulso: el.querySelector('.pulso'), fim: el.dataset.passagem === 'fim' }));
  passagens.forEach(p => io.observe(p.el));

  // ---- anéis ----
  const aneis = document.querySelector('[data-aneis]');
  if (aneis) io.observe(aneis);

  let ultimo = performance.now(), dAnterior = '';
  aCadaQuadro(agora => {
    const dt = Math.min(.05, (agora - ultimo) / 1000);
    ultimo = agora;
    const vh = innerHeight, vw = innerWidth;

    if (fibra && !reduz && visiveis.has(fibra)) {
      const k = 1 - Math.exp(-dt / .3 * 3);
      mouse.ax += (mouse.x - mouse.ax) * k;
      mouse.ay += (mouse.y - mouse.ay) * k;
      const d = `M0 50 Q${(mouse.ax * 1000).toFixed(1)} ${(50 + mouse.ay * 28).toFixed(2)} 1000 50`;
      if (d !== dAnterior) { for (const c of caminhos) c.setAttribute('d', d); dAnterior = d; }
    }

    if (hero && foto && !reduz && visiveis.has(hero) && hero.classList.contains('is-mexendo')) {
      const k = 1 - Math.exp(-dt * 4);
      fm.ax += (fm.x - fm.ax) * k;
      fm.ay += (fm.y - fm.ay) * k;
      hero.style.setProperty('--fx', `${fm.ax.toFixed(2)}px`);
      hero.style.setProperty('--fy', `${fm.ay.toFixed(2)}px`);
    }

    for (const p of passagens) {
      if (!visiveis.has(p.el) || !p.pulso) continue;
      const r = p.el.getBoundingClientRect();
      let t;
      if (p.fim) {
        const rolagem = lenis?.animatedScroll ?? scrollY;
        const max = document.documentElement.scrollHeight - vh;
        const ini = r.top + rolagem - vh;
        t = limita((rolagem - ini) / Math.max(1, max - ini));
      } else {
        t = limita((vh * .92 - (r.top + r.height / 2)) / (vh * .84));
      }
      const w = p.pulso.offsetWidth;
      const x = vw * 1.08 + (-w - vw * .08 - vw * 1.08) * t;
      p.pulso.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    }

    if (aneis && visiveis.has(aneis)) {
      const r = aneis.getBoundingClientRect();
      const t = (vh - r.top) / (vh + r.height);
      aneis.style.setProperty('--r', (t * .9 + (reduz ? 0 : agora / 40000)).toFixed(4));
    }
  });
}
