// Formulário de disponibilidade: bairro, rua e plano. Ao enviar, abre o WhatsApp da Life Connect com a mensagem
// pronta ("Eu moro na rua tal, no bairro tal..."). Também sincroniza o plano entre os dois formulários e cuida
// dos botões "Assinar" dos planos.
import { rolaAte } from '../motion/suave.js';

// planos e preços: mantenha igual a src/secoes/planos.html e às opções de src/secoes/cobertura.html
export const PRECOS = { 25: '99,90', 40: '149,90', 50: '199,90' };
const WHATSAPP = '5592991647054'; // número do atendimento (tirado das artes; confirme)

// a mensagem que chega no WhatsApp: troque o texto aqui se quiser
function mensagem({ rua, bairro, mega }) {
  return `Olá, Life Connect! Eu moro na ${rua}, no bairro ${bairro}, e gostaria de perguntar se existe a possibilidade de instalação por aqui. Tenho interesse no plano de ${mega} Mega.`;
}
const linkWhats = texto => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

export function iniciaCobertura() {
  const forms = [...document.querySelectorAll('[data-cobertura]')];
  const selectsPlano = [...document.querySelectorAll('select[data-plano]')];
  let sincronizando = false;

  // plano igual nos dois formulários e destacado na seção de planos
  const marcaPlano = valor => {
    document.querySelectorAll('[data-plano-col]').forEach(col => col.classList.toggle('is-escolhido', col.dataset.planoCol === valor));
  };
  const escolhePlano = valor => {
    sincronizando = true;
    for (const s of selectsPlano) {
      if (s.value !== valor) { s.value = valor; s.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    sincronizando = false;
    marcaPlano(valor);
  };
  selectsPlano.forEach(s => s.addEventListener('change', () => { if (!sincronizando) escolhePlano(s.value); }));
  marcaPlano(selectsPlano[0]?.value);

  // "Assinar": escolhe o plano, rola até o formulário da casa e foca o bairro
  document.querySelectorAll('[data-assinar]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    escolhePlano(a.dataset.assinar);
    rolaAte(document.getElementById('cobertura'), { block: 'center' });
    setTimeout(() => document.getElementById('bairro-casa')?.focus({ preventScroll: true }), 1250);
  }));

  for (const form of forms) {
    const bairro = form.querySelector('select[name="bairro"]');
    const rua = form.querySelector('input[name="rua"]');
    const outroBairro = form.querySelector('input[name="outro"]');
    const campoOutro = outroBairro.closest('[data-campo]');
    const plano = form.querySelector('select[name="plano"]');
    const campos = form.querySelector('.cobertura__campos');
    const resposta = form.querySelector('.cobertura__resposta');
    const titulo = form.querySelector('.resposta__titulo');
    const detalhe = form.querySelector('.resposta__detalhe');
    const acao = form.querySelector('.acao');
    const outro = form.querySelector('.resposta__outro');
    // o botão da lista própria herdou o id do select (escolha.js)
    const botaoBairro = () => bairro.closest('[data-campo]').querySelector('.escolha__botao') || bairro;

    const erro = (entrada, msg) => {
      const campo = entrada.closest('[data-campo]');
      campo.classList.toggle('is-erro', !!msg);
      campo.querySelector('.campo__erro').textContent = msg || '';
    };

    // "Outro bairro" abre o campo para digitar o nome; qualquer outro bairro esconde
    bairro.addEventListener('change', () => {
      if (bairro.value) erro(bairro, '');
      const outro = bairro.value === 'outro';
      if (outro === !campoOutro.hidden) return;
      campoOutro.hidden = !outro;
      if (outro) setTimeout(() => outroBairro.focus(), 60);
      else erro(outroBairro, '');
    });
    outroBairro.addEventListener('input', () => { if (outroBairro.value.trim().length >= 3) erro(outroBairro, ''); });
    rua.addEventListener('input', () => { if (rua.value.trim().length >= 3) erro(rua, ''); });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const ruaTexto = rua.value.trim().replace(/\s+/g, ' ');
      const erroBairro = bairro.value ? '' : 'Escolha o seu bairro';
      const outroTexto = outroBairro.value.trim().replace(/\s+/g, ' ');
      const erroOutro = bairro.value === 'outro' && outroTexto.length < 3 ? 'Digite o nome do seu bairro' : '';
      const erroRua = ruaTexto.length >= 3 ? '' : 'Digite o nome da sua rua';
      erro(bairro, erroBairro);
      erro(outroBairro, erroOutro);
      erro(rua, erroRua);
      if (erroBairro) return botaoBairro().focus();
      if (erroOutro) return outroBairro.focus();
      if (erroRua) return rua.focus();

      // "Rua" no começo só se a pessoa não escreveu (Rua, Av., Travessa...)
      const ruaFinal = /^(rua|r\.|av|avenida|travessa|tv|beco|estrada|estr|ramal|alameda|vila|conjunto|conj)\b/i.test(ruaTexto) ? ruaTexto : `Rua ${ruaTexto}`;
      const nomeBairro = bairro.value === 'outro' ? outroTexto : bairro.value;
      const texto = mensagem({ rua: ruaFinal, bairro: nomeBairro, mega: plano.value });
      const link = linkWhats(texto);
      // abre já no clique (o navegador só deixa abrir nova aba direto da ação da pessoa)
      window.open(link, '_blank', 'noopener');

      acao.href = link;
      titulo.textContent = 'Abrimos o WhatsApp com a sua mensagem.';
      detalhe.textContent = `“${texto}”`;
      form.classList.add('is-saindo');
      setTimeout(() => {
        campos.hidden = true;
        resposta.hidden = false;
        form.classList.remove('is-saindo');
      }, 420);
    });

    outro.addEventListener('click', () => {
      resposta.hidden = true;
      campos.hidden = false;
      rua.focus();
      rua.select();
    });
  }
}
