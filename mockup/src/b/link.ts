// Proposta B: ogni link interno resta dentro /proposta-b/.
// Invariati: ancore (#...), link già prefissati, esterni (http, tel, mailto...) e asset.
const PREFIX = '/proposta-b';
const ASSETS = ['/img/', '/logos/', '/_astro/'];

export function bHref(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (href === PREFIX || href.startsWith(PREFIX + '/')) return href;
  if (ASSETS.some((a) => href.startsWith(a))) return href;
  return PREFIX + href;
}
