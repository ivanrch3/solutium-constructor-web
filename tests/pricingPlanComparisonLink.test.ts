import assert from 'node:assert/strict';
import {
  createPricingPlanId,
  duplicatePricingPlan,
  getPricingPlansSettingKey,
  normalizePricingPlans,
  readPricingPlans,
  reconcileLinkedPlanComparison,
  resolvePricingPlansForComparison,
  unlinkPlanComparison
} from '../src/components/constructor/modules/pricingPlanComparisonLink';
import { createDefaultPlanComparisonConfig } from '../src/components/constructor/modules/planComparisonConfig';

const legacyPlans = [
  { name: 'Básico', monthlyPrice: 0, yearlyPrice: 0, cta: 'Empezar', highlight: false },
  { name: 'Pro', monthlyPrice: 29, yearlyPrice: 24, cta: 'Elegir', cta_url: '/pro', highlight: true }
];

const normalized = normalizePricingPlans(legacyPlans);
assert.equal(normalized.length, 2);
assert.equal(normalized.every((plan) => typeof plan.id === 'string' && plan.id.startsWith('plan_')), true);
assert.equal(new Set(normalized.map((plan) => plan.id)).size, 2);
assert.equal(normalizePricingPlans(normalized)[0].id, normalized[0].id);
const duplicated = duplicatePricingPlan(normalized, 0);
assert.equal(duplicated.length, 3);
assert.notEqual(duplicated[1].id, duplicated[0].id);

const explicitId = createPricingPlanId();
assert.equal(normalizePricingPlans([{ id: explicitId, name: 'A' }])[0].id, explicitId);
assert.equal(getPricingPlansSettingKey('pricing-1', { 'pricing-1_el_pricing_plans_plans': normalized }), 'pricing-1_el_pricing_plans_plans');
assert.equal(getPricingPlansSettingKey('pricing-1', { 'pricing-1_global_plans': legacyPlans }), 'pricing-1_global_plans');
assert.deepEqual(readPricingPlans('pricing-1', { 'pricing-1_global_plans': legacyPlans }).plans.map((plan) => plan.name), ['Básico', 'Pro']);

const resolved = resolvePricingPlansForComparison(normalized, { currencySymbol: '€' });
assert.deepEqual(resolved.map((plan) => plan.price), ['€0', '€29']);
assert.deepEqual(resolved.map((plan) => plan.secondaryPrice), ['€0', '€24']);
assert.equal(resolved[1].cta?.url, '/pro');
assert.equal(resolved[1].featured, true);

const standalone = createDefaultPlanComparisonConfig();
const featureId = standalone.sections[0].features[0].id;
const linked = reconcileLinkedPlanComparison(standalone, normalized, {
  pricingModuleId: 'pricing-1',
  currencySymbol: '$'
});
assert.equal(linked.source.mode, 'pricing');
assert.equal(linked.source.pricingModuleId, 'pricing-1');
assert.deepEqual(linked.snapshot?.plans.map((plan) => plan.id), linked.plans.map((plan) => plan.id));
assert.equal(linked.sections[0].features.find((feature) => feature.id === featureId)?.values[linked.plans[0].id].type, 'not_applicable');

const renamed = reconcileLinkedPlanComparison(linked, normalized.map((plan) => ({ ...plan, name: 'Renombrado' })), {
  pricingModuleId: 'pricing-1',
  currencySymbol: '$'
});
assert.equal(renamed.sections[0].features.find((feature) => feature.id === featureId)?.values[renamed.plans[0].id].type, 'not_applicable');
assert.equal(renamed.plans[0].name, 'Renombrado');

const unlinked = unlinkPlanComparison(renamed);
assert.equal(unlinked.source.mode, 'standalone');
assert.equal(unlinked.source.pricingModuleId, undefined);
assert.deepEqual(unlinked.plans.map((plan) => plan.id), renamed.plans.map((plan) => plan.id));

const withNewPlan = reconcileLinkedPlanComparison(linked, [...normalized, { name: 'Extra' }], {
  pricingModuleId: 'pricing-1',
  currencySymbol: '$'
});
assert.equal(withNewPlan.plans.length, 3);
assert.equal(withNewPlan.sections[0].features[0].values[withNewPlan.plans[2].id].type, 'not_applicable');

const removed = reconcileLinkedPlanComparison(linked, [normalized[0]], {
  pricingModuleId: 'pricing-1',
  currencySymbol: '$'
});
assert.equal(removed.plans.length, 2);
assert.equal(removed.plans[0].id, normalized[0].id);
