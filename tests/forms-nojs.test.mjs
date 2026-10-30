import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
const require = createRequire(import.meta.url);

test('forms-enabled server HTML cannot submit private fields through a native GET before hydration', async () => {
  for (const [component, exportName] of [['FeedbackExperience', 'FeedbackExperience'], ['ContactExperience', 'ContactExperience']]) {
    const output = resolve('work', `nojs-${component}.cjs`);
    await build({ entryPoints: [`components/site/${component}.tsx`], bundle: true, platform: 'node', format: 'cjs', outfile: output, jsx: 'automatic', external: ['react', 'react-dom', 'next'], define: { 'process.env.NEXT_PUBLIC_FORMS_VERIFIED': '"true"' }, logLevel: 'silent' });
    const Component = require(output)[exportName];
    const html = renderToStaticMarkup(createElement(Component));
    const forms = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)];
    assert.equal(forms.length, 1);
    assert.match(forms[0][1], /method="POST"/i, 'a missing method would leak fields into the current URL');
    assert.match(forms[0][1], /action="https:\/\/api.web3forms.com\/submit"/);
    const submit = [...forms[0][2].matchAll(/<button\b([^>]*)>/g)].filter(match => /type="submit"/.test(match[1]));
    assert.equal(submit.length, 1); assert.match(submit[0][1], /disabled/, 'SSR must stay disabled until a real CAPTCHA callback supplies a token');
    assert.match(html, /<noscript>/); assert.match(html, /mailto:martin.kostrhun@edofinance.cz/);
  }
});
