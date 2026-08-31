import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAutomaticMenuItems,
  hasExplicitMenuLinks,
  reconcileMenuLinksForModuleChange,
  rebuildAutomaticMenuLinks,
  resolveMenuLinks,
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

test('legacy menus without an explicit links setting remain automatic', () => {
  const settings = {};
  assert.equal(hasExplicitMenuLinks(settings, 'menu_el_menu_items_links'), false);
  assert.deepEqual(
    resolveMenuLinks({ settingsValues: settings, menuLinksKey: 'menu_el_menu_items_links', automaticMenuItems: linksFor(modules) })
      .map((link) => link.moduleId),
    modules.map((module) => module.id)
  );
});

test('an explicit list is canonical and only a genuinely new module is appended', () => {
  const initialModules = modules.slice(0, 3);
  const nextModules = [...initialModules, { id: 'pricing-new', type: 'pricing', iconKey: 'pricing' }];
  const currentLinks = [linksFor(initialModules)[0], linksFor(initialModules)[2]];
  const settings = { 'menu_el_menu_items_links': currentLinks };

  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: initialModules,
    nextModules,
    settingsValues: settings,
    hasExplicitConfiguration: hasExplicitMenuLinks(settings, 'menu_el_menu_items_links')
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['hero-1', 'video-b', 'pricing-new']);
  assert.equal(result.some((link) => link.moduleId === 'video-a'), false);
});

test('an explicit empty list stays empty until a new module is added', () => {
  const key = 'menu_el_menu_items_links';
  const settings = { [key]: [] };
  assert.deepEqual(resolveMenuLinks({ settingsValues: settings, menuLinksKey: key, automaticMenuItems: linksFor(modules) }), []);

  const result = reconcileMenuLinksForModuleChange({
    currentLinks: [],
    previousModules: modules,
    nextModules: [...modules, { id: 'new-video', type: 'video', iconKey: 'video' }],
    settingsValues: settings,
    hasExplicitConfiguration: true
  });
  assert.deepEqual(result.map((link) => link.moduleId), ['new-video']);
});

test('explicit links wrapped with editor metadata still preserve an empty list', () => {
  const key = 'menu_el_menu_items_links';
  assert.deepEqual(resolveMenuLinks({
    settingsValues: { [key]: { value: [] } },
    menuLinksKey: key,
    automaticMenuItems: linksFor(modules)
  }), []);
});

test('reordering, renaming, and removing modules do not resurrect or duplicate links', () => {
  const currentLinks = [linksFor(modules)[0], linksFor(modules)[2]];
  const settings = { menu_el_menu_items_links: currentLinks };
  const reconcile = (nextModules: typeof modules) => reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: modules,
    nextModules,
    settingsValues: settings,
    hasExplicitConfiguration: true
  });

  assert.deepEqual(reconcile([modules[2], modules[1], modules[0]]).map((link) => link.moduleId), ['hero-1', 'video-b']);
  assert.deepEqual(reconcile(modules.map((module) => module.id === 'hero-1' ? { ...module, name: 'Renamed' } : module)).map((link) => link.moduleId), ['hero-1', 'video-b']);
  assert.deepEqual(reconcile([modules[0], modules[2]]).map((link) => link.moduleId), ['hero-1', 'video-b']);
});

test('removes explicit links for modules deleted from the page', () => {
  const currentLinks = linksFor(modules.slice(0, 3));
  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: modules.slice(0, 3),
    nextModules: [modules[0], modules[2]],
    settingsValues: { menu_el_menu_items_links: currentLinks },
    hasExplicitConfiguration: true
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['hero-1', 'video-b']);
});

test('preserves external links and custom anchors when modules are deleted', () => {
  const currentLinks = [
    ...linksFor(modules.slice(0, 3)),
    { id: 'external', label: 'Web', href: 'https://example.com', url: 'https://example.com' },
    { id: 'anchor', label: 'Precios', href: '#custom-anchor', url: '#custom-anchor' }
  ];
  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: modules.slice(0, 3),
    nextModules: [modules[0], modules[2]],
    settingsValues: { menu_el_menu_items_links: currentLinks },
    hasExplicitConfiguration: true
  });

  assert.deepEqual(result.map((link) => link.moduleId).filter(Boolean), ['hero-1', 'video-b']);
  assert.equal(result.some((link) => link.href === 'https://example.com'), true);
  assert.equal(result.some((link) => link.href === '#custom-anchor'), true);
});

test('adds a new module after deleting another without resurrecting its link', () => {
  const initialModules = modules.slice(0, 3);
  const currentLinks = [linksFor(initialModules)[0], linksFor(initialModules)[2]];
  const afterDelete = [modules[0], modules[2]];
  const nextModules = [...afterDelete, { id: 'new-video', type: 'video', iconKey: 'video' }];
  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: afterDelete,
    nextModules,
    settingsValues: { menu_el_menu_items_links: currentLinks },
    hasExplicitConfiguration: true
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['hero-1', 'video-b', 'new-video']);
});

test('removing multiple modules preserves prior manual exclusions', () => {
  const initialModules = modules.slice(0, 4);
  const currentLinks = [linksFor(initialModules)[0], linksFor(initialModules)[1], linksFor(initialModules)[3]];
  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules: initialModules,
    nextModules: [modules[0], modules[2]],
    settingsValues: { menu_el_menu_items_links: currentLinks },
    hasExplicitConfiguration: true
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['hero-1']);
});

test('a new module with the same type is identified by its new id', () => {
  const previousModules = [{ id: 'video-1', type: 'video', iconKey: 'video' }];
  const currentLinks = linksFor(previousModules);
  const nextModules = [{ id: 'video-2', type: 'video', iconKey: 'video' }];
  const result = reconcileMenuLinksForModuleChange({
    currentLinks,
    previousModules,
    nextModules,
    settingsValues: { menu_el_menu_items_links: currentLinks },
    hasExplicitConfiguration: true
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['video-2']);
});

test('legacy automatic menus reflect deleted modules', () => {
  const result = reconcileMenuLinksForModuleChange({
    currentLinks: linksFor(modules),
    previousModules: modules,
    nextModules: [modules[0], modules[2]],
    settingsValues: {},
    hasExplicitConfiguration: false
  });

  assert.deepEqual(result.map((link) => link.moduleId), ['hero-1', 'video-b']);
});
