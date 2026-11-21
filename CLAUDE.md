# Guia do projeto — Life Connect

Landing page da Life Connect (provedor de **internet fibra óptica na cidade**, Coari-AM), em Vite sem framework.
Base: o pacote "Alto" (Profitize), com todo o motion mantido. O satélite e a antena parabólica da base foram
retirados; no lugar entrou uma **CTO de fibra em 3D** (`src/motion/cto.js`) e a **luz da fibra** (`src/motion/luz.js`).
Nada de "rural", satélite ou antena nos textos.

## Rodar
- `npm run dev` (abre em localhost:5173) · `npm run build` (gera `dist/` para subir na hospedagem) · `npm run fotos` (recorta as fotos).

## Onde mexer
| o quê | onde |
|---|---|
| Textos de cada seção | `src/secoes/*.html` (uma seção por arquivo; ordem em `index.html`) |
| Planos e preços | `src/secoes/planos.html`, opções em `src/secoes/cobertura.html`, `PRECOS` em `src/partes/cobertura.js` |
| WhatsApp, telefone, endereço, Instagram | `src/secoes/menu.html`, `rodape.html` e `WHATSAPP` em `src/partes/cobertura.js` |
| Cores, fontes, grade | `src/estilos/tokens.css` (cor da CTO: `LARANJA` em `src/motion/materiais.js`) |
| Logo e ícone da aba | `public/logo.png` (logo da arte oficial, na tela de carregamento) e `public/favicon.png` / `apple-touch-icon.png` (o símbolo) |
| Contadores | `data-to` / `data-time` em `src/secoes/numeros.html` |
| Fotos | originais em `fotos-originais/`, recortes em `fotos-originais/prepara-fotos.mjs` → `public/img/` |
| Avaliações e mapa | `src/secoes/avaliacoes.html` (nota, total e os cards copiados do Google Maps; o mapa é um iframe com as coordenadas -4.0978411,-63.1364882) |
| No-break 3D | `src/motion/nobreak.js` (vagas `nobreak-a/b` em `src/secoes/energia.html`; `el` = luzes de carga acesas) |
| Pose da CTO | `data-pose` das vagas em `src/secoes/instalacao.html` (`az` = giro no poste, `el` = abertura da tampa) |

## Regras (herdadas da base)
- Rolagem pelo Lenis (`src/motion/suave.js`); tudo preso à rolagem usa `aCadaQuadro`, nunca outro rAF.
- Texto entra por marco uma vez (`marcos.js`), nunca preso à rolagem. Títulos com no máximo 2 linhas.
- Hovers como `:where(html:not(.is-scrolling)) .x:hover` dentro de `@media (hover: hover)`.
- `prefers-reduced-motion` desliga Lenis, reveal, contadores animados e paralaxe.
- O formulário (bairro, rua, plano) abre o WhatsApp com a mensagem pronta: texto em `mensagem()` de `src/partes/cobertura.js`; a lista de bairros fica em `src/secoes/cobertura.html`.
- Dados que a empresa ainda não passou ficam `[preencher]`.
