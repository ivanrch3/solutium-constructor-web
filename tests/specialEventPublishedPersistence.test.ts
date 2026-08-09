import assert from 'node:assert/strict';
import test from 'node:test';
import type { EditorState } from '../src/types/constructor.ts';
import { migrateEditorStateToPersistentModuleIds } from '../src/utils/constructorStateMigration.ts';
import { bridgeModuleContent } from '../src/utils/hydrationBridge.ts';
import { buildPublishedModuleSettings } from '../src/utils/publishedModuleSettings.ts';

const legacySpecialEventState: EditorState = {
  addedModules: [{
    id: 'mod_special_event_1',
    type: 'special_event',
    name: 'Evento Especial',
    elements: [{
      id: 'el_special_event_identity',
      name: 'Evento',
      type: 'content',
      groups: ['contenido'],
      settings: { contenido: [] }
    }],
    globalGroups: [],
    globalSettings: {}
  }],
  expandedModuleId: 'mod_special_event_1',
  selectedElementId: 'mod_special_event_1_el_special_event_identity',
  expandedGroupsByElement: {},
  settingsValues: {
    mod_special_event_1_el_special_event_identity_slug: 'los15desara',
    mod_special_event_1_el_special_event_cover_show_title: false
  }
};

test('preserves a legacy special-event slug through id migration, publication, and viewer hydration', () => {
  const moduleId = 'mod_11111111-1111-4111-8111-111111111111';
  const migrated = migrateEditorStateToPersistentModuleIds(legacySpecialEventState, () => moduleId);
  const publishedSettings = buildPublishedModuleSettings(migrated.settingsValues, moduleId);
  const viewerSettings = bridgeModuleContent({
    type: 'special_event',
    moduleId,
    content: {},
    settings: publishedSettings,
    existingDeepValues: {}
  });

  assert.equal(migrated.addedModules[0].id, moduleId);
  assert.equal(migrated.selectedElementId, `${moduleId}_el_special_event_identity`);
  assert.equal(publishedSettings.el_special_event_identity_slug, 'los15desara');
  assert.equal(viewerSettings[`${moduleId}_el_special_event_identity_slug`], 'los15desara');
  assert.equal(viewerSettings[`${moduleId}_el_special_event_cover_show_title`], false);
});

test('does not alter settings belonging to modules that already have persistent ids', () => {
  const moduleId = 'mod_22222222-2222-4222-8222-222222222222';
  const state: EditorState = {
    ...legacySpecialEventState,
    addedModules: [{ ...legacySpecialEventState.addedModules[0], id: moduleId }],
    settingsValues: { [`${moduleId}_el_special_event_identity_slug`]: 'otro-evento' }
  };

  assert.equal(migrateEditorStateToPersistentModuleIds(state, () => 'unused'), state);
});
