import assert from 'node:assert/strict';
import test from 'node:test';
import { CTA_MODULE } from '../src/components/constructor/registry';
import { buildInternalSectionOptions, resolveSectionLinkControlMode } from '../src/utils/internalSectionOptions';
import { resolveHeroCtaLink } from '../src/utils/heroCtaLink';

const actions = CTA_MODULE.elements.find((element: any) => element.id === 'el_cta_actions') as any;
const setting = (id: string) => actions.settings.contenido.find((item: any) => item.id === id);

test('CTA exposes the canonical external/internal link contract for both buttons', () => {
  for (const prefix of ['primary', 'secondary']) {
    const linkType = setting(`${prefix}_link_type`);
    const destination = setting(`${prefix}_url`);
    const target = setting(`${prefix}_target`);

    assert.equal(linkType.defaultValue, 'external');
    assert.equal(destination.internalSectionSource, 'siteSections');
    assert.equal(destination.linkTypeSettingId, `${prefix}_link_type`);
    assert.equal(target.hideForInternalLink, true);
    assert.equal(target.linkTypeSettingId, `${prefix}_link_type`);
  }
});

test('CTA internal options use readable labels and canonical section anchors', () => {
  assert.deepEqual(buildInternalSectionOptions([
    { id: 'hero-1', type: 'hero', name: 'Portada' } as any,
    { id: 'features-1', type: 'features', name: 'Características' } as any,
    { id: 'cta-1', type: 'cta', name: 'Call to Action' } as any
  ], 'cta-1'), [
    { label: 'Seleccione una sección', value: '' },
    { label: 'Portada', value: '#section-hero-1' },
    { label: 'Características', value: '#section-features-1' }
  ]);
});

test('legacy anchors hydrate into the matching section option without changing identity', () => {
  const options = buildInternalSectionOptions([
    { id: 'contacto', type: 'contact', name: 'Contacto' } as any,
    { id: 'cta-1', type: 'cta', name: 'Call to Action' } as any
  ], 'cta-1', '#contacto');

  assert.equal(resolveSectionLinkControlMode(undefined), 'external');
  assert.equal(resolveSectionLinkControlMode('external'), 'external');
  assert.deepEqual(options[1], { label: 'Contacto', value: '#contacto' });
  assert.equal(options.some((option) => option.value === '#section-contacto'), false);
});

test('external links preserve accepted protocols and target while internal links never open a new tab', () => {
  assert.deepEqual(resolveHeroCtaLink('https://example.com', 'external', '_blank'), {
    href: 'https://example.com', target: '_blank', rel: 'noopener noreferrer', type: 'external'
  });
  assert.equal(resolveHeroCtaLink('http://example.com', 'external')?.href, 'http://example.com');
  assert.equal(resolveHeroCtaLink('www.example.com', 'external')?.href, 'https://www.example.com');
  assert.equal(resolveHeroCtaLink('mailto:test@example.com', 'external')?.href, 'mailto:test@example.com');
  assert.equal(resolveHeroCtaLink('tel:+50655555555', 'external')?.href, 'tel:+50655555555');
  assert.equal(resolveHeroCtaLink('wa.me/50655555555', 'external')?.href, 'https://wa.me/50655555555');

  const internal = resolveHeroCtaLink('#contacto', 'internal', '_blank');
  assert.deepEqual(internal, { href: '#section-contacto', type: 'internal' });
});

test('missing and renamed sections remain safe and ID-based', () => {
  const removed = buildInternalSectionOptions([{ id: 'cta-1', type: 'cta', name: 'CTA' } as any], 'cta-1', '#removed');
  assert.equal(removed[0].label, 'No disponible (#removed)');
  assert.equal(removed[0].value, '#removed');

  const renamed = buildInternalSectionOptions([{ id: 'contacto', type: 'contact', name: 'Contacto', editor_label: 'Contacto actualizado' } as any], 'cta-1', '#section-contacto');
  assert.deepEqual(renamed[1], { label: 'Contacto actualizado', value: '#section-contacto' });
});

console.log('CTA internal section link tests passed');
