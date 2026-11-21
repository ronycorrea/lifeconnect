// EFEITO 2: contadores. Quando o número entra na tela, conta de 0 até data-to em data-time ms, com easing
// "swing" (ease-in-out suave, como o do jQuery), Math.floor a cada quadro e termina exatamente no valor final.
// Roda uma vez por contador. Com movimento reduzido, mostra o valor final direto.
// Também conta a nota e o total das avaliações ([data-to] em qualquer lugar; data-casas = casas decimais).
const swing = p => 0.5 - Math.cos(p * Math.PI) / 2;

export function iniciaContadores() {
  const nums = [...document.querySelectorAll('[data-to]')];
  if (!nums.length) return;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const conta = el => {
    const fim = parseFloat(el.dataset.to) || 0;
    const casas = parseInt(el.dataset.casas, 10) || 0;
    const fator = 10 ** casas;
    const mostra = v => { el.textContent = casas ? v.toFixed(casas).replace('.', ',') : String(v); };
    const duracao = parseInt(el.dataset.time, 10) || 2000;
    if (reduz) { mostra(fim); return; }
    const inicio = performance.now();
    const passo = agora => {
      const p = Math.min(1, (agora - inicio) / duracao);
      mostra(p < 1 ? Math.floor(fim * fator * swing(p)) / fator : fim);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  if (!('IntersectionObserver' in window)) return nums.forEach(conta);
  const io = new IntersectionObserver(entradas => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      conta(e.target);
    }
  }, { threshold: .6 });
  nums.forEach(n => io.observe(n));
}
