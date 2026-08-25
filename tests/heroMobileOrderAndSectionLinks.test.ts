import assert from 'node:assert/strict';
import { HERO_MODULE } from '../src/components/constructor/registry';
import { resolveHeroLayoutOrder } from '../src/components/constructor/modules/heroLayoutOrder';
import { buildInternalSectionOptions, resolveSectionLinkControlMode } from '../src/utils/internalSectionOptions';

assert.deepEqual(resolveHeroLayoutOrder('reverse'), {
  mobile: ['visual', 'content'],
  desktop: ['visual', 'content']
});
assert.deepEqual(resolveHeroLayoutOrder('split'), {
  mobile: ['content', 'visual'],
  desktop: ['content', 'visual']
});

const modules = [
  { id: 'hero-1', type: 'hero', iconKey: 'hero', name: 'Sección Hero' },
  { id: 'features-1', type: 'features', iconKey: 'features', name: 'Características' },
  { id: 'features-2', type: 'features', iconKey: 'features', name: 'Características' }
] as any;
const options = buildInternalSectionOptions(modules, 'hero-1');
assert.deepEqual(options.map((option) => option.value), ['', '#features-1', '#features-2']);
assert.equal(options[1].label, 'Características');
assert.equal(options[2].label, 'Características (2)');
assert.equal(options.every((option) => option.value === '' || option.value.startsWith('#')), true);

const legacyOptions = buildInternalSectionOptions(modules, 'hero-1', '#contacto');
assert.equal(legacyOptions[0].value, '#contacto');
assert.equal(legacyOptions[0].label, 'No disponible (#contacto)');
assert.equal(resolveSectionLinkControlMode('internal'), 'internal');
assert.equal(resolveSectionLinkControlMode('external'), 'external');
assert.equal(resolveSectionLinkControlMode(undefined), 'external');

const heroCtas = HERO_MODULE.elements.find((element) => element.id === 'el_hero_ctas');
const primaryUrl = heroCtas?.settings?.contenido?.find((setting) => setting.id === 'primary_url');
const primaryTarget = heroCtas?.settings?.contenido?.find((setting) => setting.id === 'primary_target');
assert.equal(primaryUrl?.internalSectionSource, 'siteSections');
assert.equal(primaryUrl?.linkTypeSettingId, 'primary_link_type');
assert.equal(primaryTarget?.hideForInternalLink, true);

console.log('hero mobile order and section links tests passed');
