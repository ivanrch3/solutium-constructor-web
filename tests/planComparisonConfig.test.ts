import assert from 'node:assert/strict';
import { PLAN_COMPARISON_MODULE } from '../src/components/constructor/registry';
import {
  addComparisonFeature,
  addComparisonPlan,
  addComparisonSection,
  createDefaultPlanComparisonConfig,
  duplicateComparisonFeature,
  duplicateComparisonPlan,
  duplicateComparisonSection,
  normalizePlanComparisonConfig,
  removeComparisonPlan,
  reorderItem,
  setComparisonPlanFeatured,
  sortFeaturesAlphabetically,
  updateComparisonCell,
  type PlanComparisonConfigV1
} from '../src/components/constructor/modules/planComparisonConfig';
import { buildPublishedModuleSettings } from '../src/utils/publishedModuleSettings';

const config = createDefaultPlanComparisonConfig();

assert.equal(config.version, 1);
assert.equal(config.source.mode, 'standalone');
assert.equal(config.plans.length, 2);
assert.equal(config.sections.length, 2);
assert.equal(config.sections[0].features.length, 3);
assert.equal(config.sections[1].features.length, 3);
assert.equal(new Set(config.plans.map((plan) => plan.id)).size, 2);
assert.equal(config.plans.filter((plan) => plan.featured).length, 1);
assert.equal(config.bottomCta.enabled, true);
assert.equal(config.header.eyebrow, 'Comparación');
assert.equal(config.header.title, 'Elige el plan adecuado');
assert.equal(config.header.description, 'Compara lo que incluye cada opción.');

const planIds = config.plans.map((plan) => plan.id);
const normalized = normalizePlanComparisonConfig({
  version: 99,
  source: { mode: 'pricing', pricingModuleId: 'pricing-source' },
  plans: [
    { id: planIds[0], name: 'Conservado', featured: true, visible: true },
    { id: 'invalid', name: 'Nuevo', featured: true, visible: true },
    { id: 'third', name: 'Tercero', featured: false, visible: true },
    { id: 'fourth', name: 'Cuarto', featured: false, visible: true },
    { id: 'fifth', name: 'Fuera del límite', featured: false, visible: true }
  ],
  sections: [{
    id: 'invalid-section',
    title: 'Sección',
    defaultExpanded: false,
    features: [{
      id: 'invalid-feature',
      name: 'Función',
      values: {
        [planIds[0]]: { type: 'text', text: 'Texto libre' },
        [planIds[1]]: { type: 'bad' },
        [planIds[2]]: { type: 'text', text: 'Texto libre' }
      }
    }]
  }]
} as unknown as Partial<PlanComparisonConfigV1>);

assert.equal(normalized.source.mode, 'pricing');
assert.equal(normalized.source.pricingModuleId, 'pricing-source');
assert.equal(normalized.plans.length, 4);
assert.equal(normalized.plans[0].id, planIds[0]);
assert.equal(normalized.plans.filter((plan) => plan.featured).length, 1);
assert.equal(normalized.sections[0].defaultExpanded, false);
assert.equal(normalized.sections[0].features[0].values[normalized.plans[1].id].type, 'not_applicable');
assert.equal(normalized.sections[0].features[0].values[normalized.plans[0].id].text, 'Texto libre');

const snapshotFallback = normalizePlanComparisonConfig({
  source: { mode: 'pricing', pricingModuleId: 'pricing-source' },
  snapshot: { plans: [{ id: planIds[0], name: 'Snapshot A', visible: true }] },
  sections: []
});
assert.equal(snapshotFallback.plans[0].name, 'Snapshot A');
assert.equal(snapshotFallback.plans.length, 2);
assert.equal(PLAN_COMPARISON_MODULE.type, 'plan_comparison');
assert.equal(PLAN_COMPARISON_MODULE.name, 'Comparador de planes');
assert.equal(PLAN_COMPARISON_MODULE.content?.defaultConfig?.version, 1);
assert.equal(PLAN_COMPARISON_MODULE.globalSettings?.estructura?.some((setting) => setting.id === 'padding_y'), true);
assert.deepEqual(PLAN_COMPARISON_MODULE.globalGroups, ['estructura', 'estilo', 'tipografia', 'interaccion']);
assert.equal(PLAN_COMPARISON_MODULE.elements.length, 0);
assert.equal((PLAN_COMPARISON_MODULE.content?.defaultConfig as any)?.header?.eyebrow, 'Comparación');
assert.equal(PLAN_COMPARISON_MODULE.globalSettings?.tipografia?.some((setting) => setting.id === 'cell_value_font_family' && setting.subsection === 'Valores de celda'), true);

const publishedSettings = buildPublishedModuleSettings({
  'mod_comparison_global_config': config,
  'mod_comparison_global_padding_y': 64,
  'other_module_global_config': { ignored: true }
}, 'mod_comparison');
assert.equal(publishedSettings['global_config'], config);
assert.equal(publishedSettings['global_padding_y'], 64);
assert.equal('other_module_global_config' in publishedSettings, false);

let editorConfig = createDefaultPlanComparisonConfig();
const originalPlanId = editorConfig.plans[0].id;
const originalSectionId = editorConfig.sections[0].id;
const originalFeatureId = editorConfig.sections[0].features[0].id;

const duplicatedPlanConfig = duplicateComparisonPlan(editorConfig, originalPlanId);
const duplicatedPlan = duplicatedPlanConfig.plans[1];
assert.notEqual(duplicatedPlan.id, originalPlanId);
assert.equal(duplicatedPlan.featured, false);
assert.deepEqual(duplicatedPlanConfig.sections[0].features[0].values[duplicatedPlan.id], editorConfig.sections[0].features[0].values[originalPlanId]);

editorConfig = addComparisonPlan(editorConfig);
editorConfig = addComparisonPlan(editorConfig);
assert.equal(editorConfig.plans.length, 4);
assert.equal(addComparisonPlan(editorConfig).plans.length, 4);

const reorderedPlans = reorderItem(editorConfig.plans, 0, 'down');
assert.equal(reorderedPlans[1].id, originalPlanId);
assert.equal(reorderedPlans[0].id !== originalPlanId, true);

const featuredConfig = setComparisonPlanFeatured(editorConfig, editorConfig.plans[2].id, true);
assert.equal(featuredConfig.plans.filter((plan) => plan.featured).length, 1);
assert.equal(featuredConfig.plans[2].featured, true);

const removedPlanConfig = removeComparisonPlan(editorConfig, originalPlanId);
assert.equal(removedPlanConfig.plans.some((plan) => plan.id === originalPlanId), false);
assert.equal(originalPlanId in removedPlanConfig.sections[0].features[0].values, false);
assert.equal(removeComparisonPlan({ ...editorConfig, plans: editorConfig.plans.slice(0, 2) }, editorConfig.plans[0].id).plans.length, 2);

const addedSectionConfig = addComparisonSection(editorConfig);
assert.equal(addedSectionConfig.sections.length, 3);
const duplicatedSectionConfig = duplicateComparisonSection(editorConfig, originalSectionId);
assert.notEqual(duplicatedSectionConfig.sections[1].id, originalSectionId);
assert.notEqual(duplicatedSectionConfig.sections[1].features[0].id, originalFeatureId);
assert.deepEqual(duplicatedSectionConfig.sections[1].features[0].values, editorConfig.sections[0].features[0].values);

const duplicatedFeatureConfig = duplicateComparisonFeature(editorConfig, originalSectionId, originalFeatureId);
assert.equal(duplicatedFeatureConfig.sections[0].features.length, editorConfig.sections[0].features.length + 1);
assert.notEqual(duplicatedFeatureConfig.sections[0].features[1].id, originalFeatureId);

const sortedConfig = sortFeaturesAlphabetically({ ...editorConfig, sections: editorConfig.sections.slice(0, 1).map((section) => ({ ...section, features: [...section.features].reverse() })) }, originalSectionId);
assert.deepEqual(sortedConfig.sections[0].features.map((feature) => feature.name), [...sortedConfig.sections[0].features.map((feature) => feature.name)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
assert.deepEqual(sortedConfig.sections[0].features[0].values, editorConfig.sections[0].features.find((feature) => feature.name === sortedConfig.sections[0].features[0].name)?.values);

const updatedCellConfig = updateComparisonCell(editorConfig, originalSectionId, originalFeatureId, editorConfig.plans[0].id, { type: 'text', text: '250' });
assert.deepEqual(updatedCellConfig.sections[0].features[0].values[editorConfig.plans[0].id], { type: 'text', text: '250' });
const cleanedCellConfig = updateComparisonCell(updatedCellConfig, originalSectionId, originalFeatureId, editorConfig.plans[0].id, { type: 'included', text: 'ignored' });
assert.deepEqual(cleanedCellConfig.sections[0].features[0].values[editorConfig.plans[0].id], { type: 'included' });
assert.equal(addComparisonFeature(editorConfig, originalSectionId).sections[0].features.length, editorConfig.sections[0].features.length + 1);
