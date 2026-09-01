import assert from 'node:assert/strict';
import test from 'node:test';
import { PRICING_MODULE } from '../src/components/constructor/registry';
import { buildInternalSectionOptions } from '../src/utils/internalSectionOptions';
import {
  getPricingMobileToggleLabel,
  normalizePricingPlansForRender,
  resolvePricingIsMobile,
  resolvePricingMobilePlanIndex,
  shouldUsePricingMobileSwitch
} from '../src/utils/pricingMobile';

test('pricing CTA repeater exposes the canonical internal-section contract', () => {
  const repeater = PRICING_MODULE.elements.find((element: any) => element.id === 'el_pricing_plans')?.settings?.contenido?.find((setting: any) => setting.id === 'plans') as any;
  const linkType = repeater.fields.find((field: any) => field.id === 'cta_link_type');
  const url = repeater.fields.find((field: any) => field.id === 'cta_url');
  const target = repeater.fields.find((field: any) => field.id === 'cta_target');

  assert.equal(linkType.defaultValue, 'external');
  assert.equal(url.internalSectionSource, 'siteSections');
  assert.equal(url.linkTypeSettingId, 'cta_link_type');
  assert.equal(target.hideForInternalLink, true);
  assert.equal(target.linkTypeSettingId, 'cta_link_type');
});

test('pricing internal section options use real modules and canonical anchors', () => {
  const options = buildInternalSectionOptions([
    { id: 'section_pricing', type: 'pricing', name: 'Planes' } as any,
    { id: 'section_features', type: 'features', name: 'Beneficios' } as any
  ], 'section_pricing');

  assert.deepEqual(options, [
    { label: 'Seleccione una sección', value: '' },
    { label: 'Características', value: '#section-section_features' }
  ]);
});

test('pricing mobile switch is generic, starts on the first plan, and preserves custom names', () => {
  const plans = [{ name: 'Solutium Go' }, { name: 'Solutium Go Pro' }];
  assert.equal(shouldUsePricingMobileSwitch(plans.length), true);
  assert.equal(resolvePricingMobilePlanIndex('free'), 0);
  assert.equal(getPricingMobileToggleLabel('free', plans), 'Solutium Go Pro');
  assert.equal(resolvePricingMobilePlanIndex('pro'), 1);
  assert.equal(getPricingMobileToggleLabel('pro', plans), 'Solutium Go');
  assert.equal(shouldUsePricingMobileSwitch(1), false);
  assert.equal(shouldUsePricingMobileSwitch(3), false);
});

test('constructor viewport takes precedence over desktop browser width', () => {
  assert.equal(resolvePricingIsMobile({ constructorViewport: 'mobile', windowWidth: 1440 }), true);
  assert.equal(resolvePricingIsMobile({ constructorViewport: 'desktop', windowWidth: 375 }), false);
  assert.equal(resolvePricingIsMobile({ constructorViewport: 'tablet', windowWidth: 375 }), false);
  assert.equal(resolvePricingIsMobile({ windowWidth: 375 }), true);
  assert.equal(resolvePricingIsMobile({ windowWidth: 1024 }), false);
});

test('legacy and new pricing plans share the effective visible collection', () => {
  const legacyPlans = [
    { id: 'free', name: 'Solutium Go' },
    { id: 'old-pro', name: 'Legacy Pro', deleted: true },
    { id: 'pro', name: 'Solutium Go Pro' }
  ];
  const newPlans = [{ name: 'Solutium Go' }, { name: 'Solutium Go Pro' }];

  assert.deepEqual(normalizePricingPlansForRender(legacyPlans).map((plan) => plan.id), ['free', 'pro']);
  assert.equal(shouldUsePricingMobileSwitch(normalizePricingPlansForRender(legacyPlans).length), true);
  assert.equal(shouldUsePricingMobileSwitch(normalizePricingPlansForRender(newPlans).length), true);
  assert.equal(shouldUsePricingMobileSwitch(normalizePricingPlansForRender([...newPlans, { name: 'Extra' }]).length), false);
  assert.equal(shouldUsePricingMobileSwitch(normalizePricingPlansForRender(newPlans.slice(0, 1)).length), false);
});
