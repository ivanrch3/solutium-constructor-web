import assert from 'node:assert/strict';
import { resolveHeroCtaLink } from '../src/utils/heroCtaLink';
import { bridgeModuleContent } from '../src/utils/hydrationBridge';

const external = resolveHeroCtaLink('https://solutium.app', 'external', '_self');
assert.deepEqual(external, { href: 'https://solutium.app', type: 'external' });
assert.equal(resolveHeroCtaLink('http://example.com/producto', 'external')?.href, 'http://example.com/producto');
assert.equal(resolveHeroCtaLink('www.example.com', 'external')?.href, 'https://www.example.com');

const newTab = resolveHeroCtaLink('https://example.com', 'external', '_blank');
assert.deepEqual(newTab, {
  href: 'https://example.com',
  target: '_blank',
  rel: 'noopener noreferrer',
  type: 'external'
});

const internal = resolveHeroCtaLink('#contacto', 'internal', '_blank');
assert.deepEqual(internal, { href: '#section-contacto', type: 'internal' });
assert.deepEqual(resolveHeroCtaLink('contacto', 'internal'), { href: '#section-contacto', type: 'internal' });
assert.equal(resolveHeroCtaLink('#contacto', 'internal')?.href.startsWith('https://'), false);
assert.equal(resolveHeroCtaLink('#contacto', 'internal')?.target, undefined);

// Legacy URL-only values remain supported.
assert.deepEqual(resolveHeroCtaLink('#contacto'), { href: '#section-contacto', type: 'internal' });
assert.equal(resolveHeroCtaLink('https://example.com')?.href, 'https://example.com');

assert.equal(resolveHeroCtaLink('javascript:alert(1)', 'external'), null);
assert.equal(resolveHeroCtaLink('data:text/html,<script>alert(1)</script>', 'external'), null);
assert.equal(resolveHeroCtaLink('vbscript:msgbox(1)', 'external'), null);

const legacyHydrated = bridgeModuleContent({
  type: 'hero',
  moduleId: 'hero-1',
  content: { btn_url: '#contacto' },
  settings: {},
  existingDeepValues: {}
});
assert.equal(legacyHydrated['hero-1_el_hero_ctas_primary_url'], '#contacto');

// Preview and published HeroModule consume the same resolved contract.
assert.deepEqual(
  resolveHeroCtaLink('www.example.com', 'external', '_blank'),
  resolveHeroCtaLink('www.example.com', 'external', '_blank')
);
assert.deepEqual(
  resolveHeroCtaLink('#section-contacto', 'internal', '_blank'),
  resolveHeroCtaLink('#section-contacto', 'internal', '_blank')
);

console.log('hero CTA link tests passed');
