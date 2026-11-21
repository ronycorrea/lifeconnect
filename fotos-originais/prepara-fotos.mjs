// Recorta as fotos originais da Life Connect (pasta fotos-originais/) e grava em public/img/ como WebP.
// Rodar: npm run fotos. Para trocar uma foto, substitua o .jpg aqui e ajuste o recorte abaixo.
// recorte = { left, top, width, height } em pixels da foto original; largura = tamanho máximo final (sem ampliar).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const origem = new URL('./', import.meta.url);
const destino = new URL('../public/img/', import.meta.url);
mkdirSync(destino, { recursive: true });

const fotos = [
  // hero: a equipe na frente da loja (apresentação)
  { de: 'loja-equipe.jpg', para: 'hero.webp', recorte: { left: 0, top: 560, width: 960, height: 540 }, largura: 1400 },
  { de: 'loja-equipe.jpg', para: 'hero-m.webp', recorte: { left: 0, top: 470, width: 960, height: 720 }, largura: 960 },
  // seção "chão": foto larga da equipe fazendo fusão de fibra
  { de: 'fusao-fibra.jpg', para: 'chao.webp', largura: 1600 },
  { de: 'fusao-fibra.jpg', para: 'chao-m.webp', recorte: { left: 160, top: 0, width: 720, height: 960 }, largura: 900 },
  // seção "casa": fachada da loja com a equipe
  { de: 'loja-equipe.jpg', para: 'casa.webp', recorte: { left: 0, top: 250, width: 960, height: 720 }, largura: 1600 },
  { de: 'loja-equipe.jpg', para: 'casa-m.webp', recorte: { left: 0, top: 220, width: 960, height: 960 }, largura: 960 },
  // fotos de gente que atravessam a dobra
  { de: 'tecnico-cabo.jpg', para: 'gente-1.webp', recorte: { left: 0, top: 40, width: 720, height: 900 }, largura: 720 },
  { de: 'equipe-arvores.jpg', para: 'gente-2.webp', recorte: { left: 0, top: 520, width: 720, height: 540 }, largura: 720 },
  { de: 'poste-escada.jpg', para: 'gente-3.webp', recorte: { left: 0, top: 260, width: 720, height: 900 }, largura: 720 },
  // instalação dentro de casa (seção de passos)
  { de: 'instalacao-casa.jpg', para: 'instalacao.webp', recorte: { left: 0, top: 60, width: 900, height: 1125 }, largura: 800 },
  // fundos dos cards de vantagens (4:5)
  { de: 'poste-ceu.jpg', para: 'vantagem-1.webp', recorte: { left: 0, top: 280, width: 899, height: 1124 }, largura: 800 },
  { de: 'fusao-fibra.jpg', para: 'vantagem-2.webp', recorte: { left: 300, top: 0, width: 768, height: 960 }, largura: 800 },
  { de: 'loja-equipe.jpg', para: 'vantagem-3.webp', recorte: { left: 0, top: 560, width: 960, height: 720 }, largura: 800 },
];

for (const f of fotos) {
  let img = sharp(new URL(f.de, origem).pathname.replace(/^\/(\w:)/, '$1')).rotate();
  if (f.recorte) img = img.extract(f.recorte);
  // nunca amplia além do tamanho original (ampliar borra); nitidez suave para compensar a compressão do WhatsApp
  await img.resize({ width: f.largura, withoutEnlargement: true, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 2.2 })
    .webp({ quality: 90, smartSubsample: true }).toFile(new URL(f.para, destino).pathname.replace(/^\/(\w:)/, '$1'));
  console.log('ok', f.para);
}
