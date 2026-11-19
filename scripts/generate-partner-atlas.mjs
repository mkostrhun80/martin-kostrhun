import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { partners } from '../lib/partners.ts';

const tileWidth = 256, tileHeight = 128, columns = 8;
const root = fileURLToPath(new URL('../public/', import.meta.url));
const escapeXML = value => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]);

export async function generatePartnerAtlas() {
  // Build once, outside the visitor's browser; one image is decoded/uploaded.
  const tiles = await Promise.all(partners.map(async partner => {
    let input;
    if (partner.logo) {
      const logo = await sharp(await readFile(resolve(root, '.' + partner.logo)))
        .resize({ width: 184, height: 74, fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      if (partner.logoLight) for (let n = 0; n < logo.data.length; n += 4) logo.data[n] = logo.data[n + 1] = logo.data[n + 2] = 0;
      input = { input: logo.data, raw: { width: logo.info.width, height: logo.info.height, channels: 4 }, left: Math.round((tileWidth - logo.info.width) / 2), top: Math.round((tileHeight - logo.info.height) / 2) };
    } else {
      const words = partner.shortName.split(' '), lines = []; let line = '';
      for (const word of words) {
        if ((line + ' ' + word).length > 24 && line) { lines.push(line); line = word; } else line = line ? line + ' ' + word : word;
      }
      lines.push(line);
      const text = lines.map((text, n) => `<tspan x="128" y="${64 + (n - (lines.length - 1) / 2) * 25}">${escapeXML(text)}</tspan>`).join('');
      input = { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><text text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="20" fill="#14243a">${text}</text></svg>`), left: 0, top: 0 };
    }
    return sharp({ create: { width: tileWidth, height: tileHeight, channels: 4, background: '#fffdf9' } }).composite([input]).png().toBuffer();
  }));
  const buffer = await sharp({ create: { width: columns * tileWidth, height: Math.ceil(partners.length / columns) * tileHeight, channels: 4, background: '#fffdf9' } })
    .composite(tiles.map((input, index) => ({ input, left: index % columns * tileWidth, top: Math.floor(index / columns) * tileHeight })))
    .webp({ lossless: true, effort: 6 }).toBuffer();
  const output = resolve(root, 'images/partners/ribbon-atlas.webp');
  const previous = await readFile(output).catch(() => null);
  if (!previous?.equals(buffer)) await writeFile(output, buffer);
  console.log(`Partner atlas: ${partners.length} partners, ${Math.ceil(buffer.length / 1024)} KB.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generatePartnerAtlas();
