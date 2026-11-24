import { test } from 'node:test';
import assert from 'node:assert';
import { bHref } from './link.ts';

test('prefissa i link interni', () => {
  assert.strictEqual(bHref('/'), '/proposta-b/');
  assert.strictEqual(bHref('/servizi/controllo-udito/'), '/proposta-b/servizi/controllo-udito/');
  assert.strictEqual(bHref('/servizi/#auricolari'), '/proposta-b/servizi/#auricolari');
  assert.strictEqual(bHref('/contatti/?motivo=ssn#form'), '/proposta-b/contatti/?motivo=ssn#form');
});

test('lascia invariati ancore, già prefissati, esterni e asset', () => {
  for (const h of ['#auricolari', '/proposta-b/contatti/', '/proposta-b/', 'tel:+390984123456', 'https://wa.me/39', 'mailto:a@b.it', '/img/x.jpg', '/logos/logo-color.png', '/_astro/a.css']) {
    assert.strictEqual(bHref(h), h);
  }
});
