import { defineConfig } from 'vite';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Cada seção mora em src/secoes/<nome>.html; o index.html junta todas com <!-- secao: nome -->.
// Parâmetros viram {{chave}} no arquivo: <!-- secao: cobertura id=hero --> (o formulário aparece duas vezes).
const pasta = fileURLToPath(new URL('./src/secoes/', import.meta.url));
const marcador = /<!--\s*secao:\s*([\w-]+)((?:\s+[\w-]+=[\w-]+)*)\s*-->/g;

const junta = (html, nivel = 0) =>
  nivel > 3
    ? html
    : html.replace(marcador, (_, nome, params) => {
        let parte = fs.readFileSync(`${pasta}${nome}.html`, 'utf8');
        for (const [, k, v] of params.matchAll(/([\w-]+)=([\w-]+)/g)) parte = parte.replaceAll(`{{${k}}}`, v);
        return junta(parte, nivel + 1);
      });

const secoes = () => ({
  name: 'secoes',
  transformIndexHtml: { order: 'pre', handler: html => junta(html) },
  handleHotUpdate({ file, server }) {
    if (file.startsWith(pasta) && file.endsWith('.html')) server.ws.send({ type: 'full-reload' });
  },
});

export default defineConfig({
  plugins: [secoes()],
  build: { chunkSizeWarningLimit: 700 },
});
