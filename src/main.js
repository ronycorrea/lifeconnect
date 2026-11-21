// Ponto de entrada da Life Connect. Ordem: preloader, entradas de texto, rolagem, barra, paralaxe, luz,
// formulários, menu, contadores, cards, revelação; por último o 3D (CTO), por import dinâmico.
import { iniciaPreloader } from './partes/preloader.js';
import { iniciaMarcos } from './motion/marcos.js';
import { iniciaRolagem } from './motion/rolagem.js';
import { iniciaBarra } from './motion/barra.js';
import { iniciaParalaxe } from './motion/paralaxe.js';
import { iniciaLuz } from './motion/luz.js';
import { iniciaEscolhas } from './partes/escolha.js';
import { iniciaCobertura } from './partes/cobertura.js';
import { iniciaMenu } from './partes/menu.js';
import { iniciaNavegacao } from './partes/navegacao.js';
import { iniciaContadores } from './partes/contadores.js';
import { iniciaFlip } from './partes/flip.js';
import { iniciaReveal } from './partes/reveal.js';
import { iniciaBrilho } from './partes/brilho.js';

const pronto = iniciaPreloader();
iniciaMarcos({ espera: pronto });
iniciaRolagem();
iniciaBarra();
iniciaParalaxe();
iniciaLuz();
iniciaEscolhas();   // antes da cobertura: troca os selects pelas listas próprias
iniciaCobertura();
iniciaMenu();
iniciaNavegacao();
iniciaContadores();
iniciaFlip();
iniciaReveal();
iniciaBrilho();   // brilho laranja no nome gigante do rodapé

// o 3D chega depois do texto e do formulário
// Se o navegador derrubar o WebGL (placa de vídeo sobrecarregada, muitas recargas) e ele não voltar em 2 s,
// a cena é recriada num canvas novo, para a CTO e o no-break não sumirem.
function sobe3D(canvas) {
  return import('./motion/cena.js').then(({ iniciaCena }) => {
    const cena = iniciaCena(canvas);
    if (!cena) return;
    let espera = 0;
    canvas.addEventListener('webglcontextlost', () => {
      espera = setTimeout(() => {
        cena.destroi();
        const novo = canvas.cloneNode(false);
        canvas.replaceWith(novo);
        sobe3D(novo);
      }, 2000);
    }, { once: true });
    canvas.addEventListener('webglcontextrestored', () => clearTimeout(espera));
  });
}
// No celular o 3D não roda: a CTO e o no-break viram imagens paradas (mais leve e sem travar a rolagem).
const movel = matchMedia('(max-width: 760px)').matches
  || (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820);
if (movel) {
  document.documentElement.classList.add('is-movel');
  document.querySelector('.cena')?.remove();
} else {
  pronto.then(() => sobe3D(document.querySelector('.cena')));
}
