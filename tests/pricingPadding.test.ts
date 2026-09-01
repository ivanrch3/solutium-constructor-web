import assert from 'node:assert/strict';
import test from 'node:test';
import { PRICING_MODULE } from '../src/components/constructor/registry.tsx';
import { bridgeModuleContent } from '../src/utils/hydrationBridge.ts';
import {
  PRICING_DEFAULT_PADDING_Y,
  PRICING_LEGACY_PADDING_CLASS,
  PRICING_PADDING_SETTING_ID,
  getPricingPaddingPersistenceKey,
  getPricingSectionPaddingStyle,
  resolvePricingPaddingY
} from '../src/utils/pricingSectionLayout.ts';

const pricingPaddingSetting = PRICING_MODULE.globalSettings.estructura.find((setting: any) => setting.id === PRICING_PADDING_SETTING_ID) as any;

test('pricing registry exposes the global vertical padding contract', () => {
  assert.equal(pricingPaddingSetting.label, 'Padding Vertical');
  assert.equal(pricingPaddingSetting.defaultValue, PRICING_DEFAULT_PADDING_Y);
  assert.equal(pricingPaddingSetting.min, 0);
  assert.equal(getPricingPaddingPersistenceKey('pricing-1'), 'pricing-1_global_padding_y');
});

test('missing pricing padding preserves the legacy responsive default', () => {
  assert.equal(resolvePricingPaddingY(undefined), undefined);
  assert.deepEqual(getPricingSectionPaddingStyle(undefined), { className: PRICING_LEGACY_PADDING_CLASS, style: {} });
});

test('explicit pricing padding controls both section edges, including zero', () => {
  for (const value of [0, 16, 32, 80, 165, 200]) {
    assert.deepEqual(getPricingSectionPaddingStyle(value), {
      className: '',
      style: { paddingTop: `${value}px`, paddingBottom: `${value}px` }
    });
  }
});

test('string values normalize and invalid values use the current fallback', () => {
  assert.equal(resolvePricingPaddingY('165'), 165);
  assert.equal(resolvePricingPaddingY('not-a-number'), PRICING_DEFAULT_PADDING_Y);
  assert.deepEqual(getPricingSectionPaddingStyle('not-a-number').style, {
    paddingTop: '40px',
    paddingBottom: '40px'
  });
});

test('padding and card spacing remain independent', () => {
  const gapSetting = PRICING_MODULE.globalSettings.estructura.find((setting: any) => setting.id === 'gap') as any;
  assert.equal(gapSetting.label, 'Espaciado entre Tarjetas');
  assert.equal(gapSetting.defaultValue, 32);
  assert.notEqual(gapSetting.id, pricingPaddingSetting.id);
  assert.equal(getPricingSectionPaddingStyle(165).style.paddingTop, '165px');
  assert.equal((getPricingSectionPaddingStyle(165).style as any).padding, undefined);
});

test('one resolved value is shared across desktop, tablet, mobile, preview, and published render paths', () => {
  const style = getPricingSectionPaddingStyle('165').style;
  assert.deepEqual(style, { paddingTop: '165px', paddingBottom: '165px' });
  assert.equal(getPricingPaddingPersistenceKey('pricing-1'), 'pricing-1_global_padding_y');
});

test('published flat settings hydrate to the same Pricing deep key', () => {
  const hydrated = bridgeModuleContent({
    type: 'pricing',
    moduleId: 'pricing-1',
    content: {},
    settings: { padding_y: 165 },
    existingDeepValues: {}
  });
  assert.equal(hydrated['pricing-1_global_padding_y'], 165);
});

test('hydration preserves explicit zero and existing deep values', () => {
  assert.equal(bridgeModuleContent({ type: 'pricing', moduleId: 'pricing-1', content: {}, settings: { padding_y: 0 }, existingDeepValues: {} })['pricing-1_global_padding_y'], 0);
  assert.equal(bridgeModuleContent({ type: 'pricing', moduleId: 'pricing-1', content: {}, settings: { padding_y: 165 }, existingDeepValues: { 'pricing-1_global_padding_y': 32 } })['pricing-1_global_padding_y'], 32);
});

test('padding style does not alter gap or card padding contracts', () => {
  const sectionStyle = getPricingSectionPaddingStyle(165).style as Record<string, string>;
  assert.deepEqual(Object.keys(sectionStyle).sort(), ['paddingBottom', 'paddingTop']);
});

test('legacy responsive class is removed whenever explicit padding is present', () => {
  assert.equal(getPricingSectionPaddingStyle(0).className.includes('py-'), false);
  assert.equal(getPricingSectionPaddingStyle(undefined).className, PRICING_LEGACY_PADDING_CLASS);
});
