import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAutomaticMenuItems,
  rebuildAutomaticMenuLinks,
  resolveSectionHref,
} from '../src/utils/menuNavigation.ts';

const modules = [
  { id: 'hero-1', type: 'hero', iconKey: 'hero' },
  { id: 'video-a', type: 'video', iconKey: 'video' },
  { id: 'video-b', type: 'video', iconKey: 'video' },
  { id: 'contact-1', type: 'contact', iconKey: 'contact' },
];

const linksFor = (orderedModules: typeof modules) => buildAutomaticMenuItems({
  modules: orderedModules,
  settingsValues: {}
});

test('rebuilds automatic links in the new module order and renumbers duplicate labels', () => {
  const initialLinks = linksFor(modules);
  const reorderedModules = [modules[0], modules[2], modules[1], modules[3]];
  const rebuilt = rebuildAutomaticMenuLinks({
    modules: reorderedModules,
    settingsValues: {},
    currentLinks: initialLinks
  });

  assert.deepEqual(rebuilt.map((link) => link.moduleId), ['hero-1', 'video-b', 'video-a', 'contact-1']);
  assert.deepEqual(rebuilt.map((link) => link.targetSectionId), ['hero-1', 'video-b', 'video-a', 'contact-1']);
  assert.deepEqual(rebuilt.map((link) => link.href), [
    resolveSectionHref('hero-1'),
    resolveSectionHref('video-b'),
    resolveSectionHref('video-a'),
    resolveSectionHref('contact-1')
  ]);
  assert.deepEqual(rebuilt.map((link) => link.url), rebuilt.map((link) => link.href));
  assert.deepEqual(rebuilt.map((link) => link.label), ['Portada', 'Video', 'Video 2', 'Contacto']);
  assert.deepEqual(rebuilt.map((link) => link.source), ['auto', 'auto', 'auto', 'auto']);
});

test('supports moving in either direction without changing module IDs or anchors', () => {
  const initialLinks = linksFor(modules);
  const movedDown = [modules[0], modules[1], modules[3], modules[2]];
  const movedUp = [modules[0], modules[3], modules[1], modules[2]];

  for (const orderedModules of [movedDown, movedUp]) {
    const rebuilt = rebuildAutomaticMenuLinks({
      modules: orderedModules,
      settingsValues: {},
      currentLinks: initialLinks
    });

    rebuilt.forEach((link) => {
      assert.equal(link.href, resolveSectionHref(String(link.moduleId)));
      assert.equal(link.url, resolveSectionHref(String(link.moduleId)));
      assert.equal(link.targetSectionId, link.moduleId);
    });
  }
});

test('preserves manual links while rebuilding automatic links', () => {
  const currentLinks = [
    ...linksFor(modules),
    { id: 'manual', label: 'Precios', url: 'https://example.com/pricing', href: 'https://example.com/pricing' }
  ];
  const rebuilt = rebuildAutomaticMenuLinks({
    modules: [modules[0], modules[2], modules[1], modules[3]],
    settingsValues: {},
    currentLinks
  });

  assert.equal(rebuilt.at(-1)?.id, 'manual');
  assert.equal(rebuilt.at(-1)?.url, 'https://example.com/pricing');
  assert.deepEqual(rebuilt.slice(0, 4).map((link) => link.source), ['auto', 'auto', 'auto', 'auto']);
});

test('automatic links can be rebuilt at boundaries without changing their targets', () => {
  const initialLinks = linksFor(modules);
  const firstOrder = [...modules];
  const lastOrder = [...modules];

  const firstResult = rebuildAutomaticMenuLinks({ modules: firstOrder, settingsValues: {}, currentLinks: initialLinks });
  const lastResult = rebuildAutomaticMenuLinks({ modules: lastOrder, settingsValues: {}, currentLinks: initialLinks });

  assert.deepEqual(firstResult.map((link) => link.moduleId), firstOrder.map((module) => module.id));
  assert.deepEqual(lastResult.map((link) => link.moduleId), lastOrder.map((module) => module.id));
});
