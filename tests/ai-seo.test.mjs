import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);

async function loadSEO(name, siteURL, basePath = '') {
  const outfile = resolve('work', 'ai-seo-tests', `${name}.cjs`);
  await build({
    stdin: {
      contents: `
        export { homeStructuredData, serializeStructuredData } from './lib/structured-data';
        export { aiContent } from './lib/ai-content';
        export { pageMetadata } from './lib/metadata';
        export { defaultFAQ } from './lib/public-data';
        export { services, steps } from './lib/content';
        export { siteConfig } from './lib/site-config';
        export { FAQ } from './components/site/TrustAndFAQ';
      `,
      resolveDir: process.cwd(),
      sourcefile: 'seo-test-entry.ts',
    },
    outfile, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    external: ['react', 'react-dom', 'next', 'next/*'],
    define: {
      'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(siteURL),
      'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(basePath),
    },
    logLevel: 'silent',
  });
  return require(outfile);
}

test('canonical, entity IDs, service anchors and discovery links retain the deployment path exactly once', async () => {
  for (const [name, origin, base] of [
    ['root', 'https://advisor.example', ''],
    ['pages', 'https://advisor.example/martin-kostrhun/', '/martin-kostrhun'],
  ]) {
    const seo = await loadSEO(name, origin, base);
    const home = `https://advisor.example${base}/`;
    const data = seo.homeStructuredData();
    const metadata = seo.pageMetadata(seo.siteConfig.title);
    assert.equal(metadata.alternates.canonical, home);
    assert.equal(metadata.openGraph.url, home);
    assert.equal(metadata.openGraph.images[0].url, `${home}images/DSC01608-original.jpg`);
    assert.equal(metadata.authors[0].url, `${home}#o-mne`);
    assert.equal(new Set(data['@graph'].map(node => node['@id'])).size, data['@graph'].length);
    for (const node of data['@graph']) assert.ok(node['@id'].startsWith(home));
    const business = data['@graph'].find(node => node['@type'] === 'FinancialService');
    assert.equal(business.address.addressLocality, 'Hradec Králové');
    assert.equal(business.identifier.value, seo.siteConfig.ico);
    assert.deepEqual(business.hasOfferCatalog.itemListElement.map(offer => offer.itemOffered.url), seo.services.map(service => `${home}#sluzba-${service.id}`));
    for (const full of [false, true]) {
      const text = seo.aiContent(full);
      for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
        if (href.startsWith('https://advisor.example')) assert.ok(href.startsWith(home), href);
        assert.ok(!href.includes('/martin-kostrhun/martin-kostrhun'), href);
      }
    }
    assert.ok(seo.aiContent().includes(`${home}llms-full.txt`));
  }
});

test('FAQ HTML, JSON-LD and full text expose the same questions and answers without JavaScript', async () => {
  const seo = await loadSEO('faq', 'https://advisor.example');
  const html = renderToStaticMarkup(createElement(seo.FAQ));
  const text = seo.aiContent(true);
  const questions = seo.homeStructuredData()['@graph'].find(node => node['@type'] === 'FAQPage').mainEntity;
  assert.equal([...html.matchAll(/<details\b/g)].length, questions.length);
  for (const faq of seo.defaultFAQ) {
    assert.ok(html.includes(`id="otazka-${faq.id}"`));
    assert.ok(html.includes(faq.question));
    assert.ok(html.includes(faq.answer));
    assert.ok(text.includes(faq.question));
    assert.ok(text.includes(faq.answer));
    const question = questions.find(item => item.name === faq.question);
    assert.equal(question.acceptedAnswer.text, faq.answer);
    if (faq.source) {
      assert.ok(html.includes(`href="${faq.source.href}"`));
      assert.ok(text.includes(faq.source.href));
    }
  }
});

test('text views reuse public services, process and identity without fabricated offers or ratings', async () => {
  const seo = await loadSEO('content', 'https://advisor.example');
  const text = seo.aiContent(true);
  for (const service of seo.services) assert.ok(text.includes(service.description));
  for (const [, description] of seo.steps) assert.ok(text.includes(description));
  assert.ok(text.includes(seo.siteConfig.introduction));
  assert.ok(text.includes(seo.siteConfig.originalRegulatoryFooter));
  const data = seo.homeStructuredData();
  for (const node of data['@graph']) {
    assert.equal(node.aggregateRating, undefined);
    assert.equal(node.priceRange, undefined);
    assert.equal(node.openingHours, undefined);
  }
});

test('an unconfigured preview has no fabricated canonical or public entity IDs', async () => {
  const seo = await loadSEO('preview', '', '/martin-kostrhun');
  assert.equal(seo.homeStructuredData(), null);
  assert.equal(seo.pageMetadata('Preview').alternates, undefined);
  assert.ok(seo.aiContent().includes('(/martin-kostrhun/#o-mne)'));
  assert.ok(seo.aiContent().includes('(/martin-kostrhun/llms-full.txt)'));
  assert.doesNotMatch(seo.aiContent(true), /localhost|undefined|https:\/\/advisor\.example/);
});

test('JSON-LD text cannot close its script element', async () => {
  const seo = await loadSEO('escaping', 'https://advisor.example');
  const value = { text: '</script><script>alert("x")</script>' };
  const serialized = seo.serializeStructuredData(value);
  assert.ok(!serialized.includes('<'));
  assert.deepEqual(JSON.parse(serialized), value);
});
