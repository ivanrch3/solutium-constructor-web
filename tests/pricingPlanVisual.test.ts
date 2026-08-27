import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveIconName,
  resolvePricingImageAlt,
  resolvePricingImageSrc,
  resolvePricingPlanVisualType
} from '../src/utils/pricingPlanVisual.ts';
import { evaluateRepeaterShowIf, getRepeaterFieldIdentity, resolveRepeaterFieldEffectiveValue } from '../src/utils/repeaterField.ts';
import {
  filterLucideIconNames,
  getAvailableLucideIconNames,
  normalizeLucideIconSearch
} from '../src/utils/lucideIconPicker.ts';
import { resolvePricingColumnCount, resolvePricingGridClass } from '../src/utils/pricingLayout.ts';
import { PRICING_MODULE } from '../src/components/constructor/registry.tsx';
import * as LucideIcons from 'lucide-react';

test('icon values normalize strings, picker objects and invalid values safely', () => {
  assert.equal(resolveIconName('Rocket'), 'Rocket');
  assert.equal(resolveIconName('Zap'), 'Zap');
  assert.equal(resolveIconName({ name: 'Shield' }), 'Shield');
  assert.equal(resolveIconName({ iconName: 'Star' }), 'Star');
  assert.equal(resolveIconName(null), 'Check');
  assert.equal(resolveIconName(undefined), 'Check');
  assert.equal(resolveIconName({ broken: true }), 'Check');
});

test('legacy plans default to icon and visual type switches without deleting values', () => {
  assert.equal(resolvePricingPlanVisualType(undefined), 'icon');
  assert.equal(resolvePricingPlanVisualType('invalid'), 'icon');
  assert.equal(resolvePricingPlanVisualType('image'), 'image');
  const plan = { icon: 'Rocket', image: '/plan.png', visual_type: 'image' };
  assert.equal(plan.image, '/plan.png');
  assert.equal(plan.icon, 'Rocket');
});

test('pricing image source matches the native image control URL contract', () => {
  const uploadedUrl = 'https://cdn.example.com/pricing-plan.webp';
  assert.equal(resolvePricingImageSrc(uploadedUrl), uploadedUrl);
  assert.equal(resolvePricingImageSrc(`  ${uploadedUrl}  `), uploadedUrl);
  assert.equal(resolvePricingImageSrc(null), '');
  assert.equal(resolvePricingImageSrc(undefined), '');
  assert.equal(resolvePricingImageSrc({ url: uploadedUrl }), '');
});

test('image visuals retain image mode and provide accessible fallbacks', () => {
  const plan = { visual_type: 'image', image: 'https://cdn.example.com/plan.png', image_alt: '', name: 'Pro', image_size: 96 };
  assert.equal(resolvePricingPlanVisualType(plan.visual_type), 'image');
  assert.equal(resolvePricingImageSrc(plan.image), plan.image);
  assert.equal(resolvePricingImageAlt(plan.image_alt, plan.name), 'Pro');
  assert.equal(resolvePricingImageAlt('', ''), 'Imagen del plan');
  assert.equal(plan.image_size, 96);
  assert.equal(resolvePricingPlanVisualType({}), 'icon');
});

test('pricing repeater exposes native conditional icon and image controls', () => {
  const repeater = (PRICING_MODULE.elements.find((element: any) => element.id === 'el_pricing_plans') as any).settings.contenido[0];
  const icon = repeater.fields.find((field: any) => field.id === 'icon');
  const image = repeater.fields.find((field: any) => field.id === 'image');
  assert.equal(icon.type, 'icon');
  assert.equal(icon.showIf.settingId, 'visual_type');
  assert.equal(image.type, 'image');
  assert.equal(image.showIf.value, 'image');
});

test('repeater showIf resolves missing defaults independently for each plan', () => {
  const fields = [{ id: 'visual_type', defaultValue: 'icon' }];
  const plans = [{ name: 'Plan 1', icon: 'Rocket' }, { name: 'Plan 2', icon: 'Zap' }];
  assert.equal(resolveRepeaterFieldEffectiveValue(plans[0], 'visual_type', fields), 'icon');
  assert.equal(resolveRepeaterFieldEffectiveValue(plans[1], 'visual_type', fields), 'icon');
  assert.equal(evaluateRepeaterShowIf(plans[0], { settingId: 'visual_type', value: 'icon' }, fields), true);
  assert.equal(evaluateRepeaterShowIf(plans[1], { settingId: 'visual_type', value: 'icon' }, fields), true);
});

test('repeater showIf uses the current item rather than another plan', () => {
  const fields = [{ id: 'visual_type', defaultValue: 'icon' }];
  assert.equal(evaluateRepeaterShowIf({ visual_type: 'image' }, { settingId: 'visual_type', value: 'icon' }, fields), false);
  assert.equal(evaluateRepeaterShowIf({ visual_type: 'icon' }, { settingId: 'visual_type', value: 'icon' }, fields), true);
  assert.equal(evaluateRepeaterShowIf({ visual_type: 'image' }, { settingId: 'visual_type', value: 'image' }, fields), true);
});

test('icon picker identities are isolated per plan and field', () => {
  const first = getRepeaterFieldIdentity('pricing_plans', { id: 'plan_1' }, 0, 'icon');
  const second = getRepeaterFieldIdentity('pricing_plans', { id: 'plan_2' }, 1, 'icon');
  assert.notEqual(first.itemContextId, second.itemContextId);
  assert.notEqual(first.fieldKey, second.fieldKey);
});

test('icon picker builds a canonical list of renderable Lucide components', () => {
  const iconNames = getAvailableLucideIconNames(LucideIcons as Record<string, unknown>);
  assert.ok(iconNames.includes('Rocket'));
  assert.ok(iconNames.includes('Star'));
  assert.ok(iconNames.includes('Zap'));
  assert.equal(iconNames.includes('createLucideIcon'), false);
  assert.equal(iconNames.includes('icons'), false);
});

test('icon picker search only normalizes strings and never throws', () => {
  const iconNames = ['Rocket', 'Star', 'Zap'];
  assert.deepEqual(filterLucideIconNames(iconNames, ''), []);
  assert.deepEqual(filterLucideIconNames(iconNames, 'r'), ['Rocket', 'Star']);
  assert.deepEqual(filterLucideIconNames(iconNames, 'ro'), ['Rocket']);
  assert.deepEqual(filterLucideIconNames(iconNames, 'rocket'), ['Rocket']);
  assert.deepEqual(filterLucideIconNames(iconNames, 'star'), ['Star']);
  assert.deepEqual(filterLucideIconNames(iconNames, 'zap'), ['Zap']);
  assert.equal(normalizeLucideIconSearch(null), '');
  assert.equal(normalizeLucideIconSearch(undefined), '');
  assert.equal(normalizeLucideIconSearch({ query: 'rocket' }), '');
  assert.deepEqual(filterLucideIconNames(iconNames, { query: 'rocket' }), []);
});

test('pricing columns derive from plan count instead of the legacy global setting', () => {
  assert.equal(resolvePricingColumnCount(0), 1);
  assert.equal(resolvePricingColumnCount(1), 1);
  assert.equal(resolvePricingColumnCount(2), 2);
  assert.equal(resolvePricingColumnCount(3), 3);
  assert.equal(resolvePricingColumnCount(4), 4);
  assert.equal(resolvePricingColumnCount(5), 4);
  assert.equal(resolvePricingColumnCount(10), 4);
  assert.equal(resolvePricingColumnCount(3 - 1), 2);
  assert.equal(resolvePricingColumnCount(2 + 1), 3);
  assert.equal(resolvePricingGridClass(resolvePricingColumnCount(5)), 'grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-4');
});

test('pricing registry no longer offers a manually configurable column count', () => {
  assert.equal(PRICING_MODULE.globalSettings.estructura.some((setting: any) => setting.id === 'columns'), false);
});
