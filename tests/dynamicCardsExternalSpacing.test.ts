import assert from 'node:assert/strict';
import { DYNAMIC_CARDS_MODULE } from '../src/components/constructor/registry';
import {
  DYNAMIC_CARDS_EXTERNAL_SPACING_DEFAULTS,
  resolveDynamicCardsExternalSpacing
} from '../src/components/constructor/modules/dynamicCardsLayout';

assert.deepEqual(DYNAMIC_CARDS_EXTERNAL_SPACING_DEFAULTS, { top: 0, bottom: 0 });
assert.equal(resolveDynamicCardsExternalSpacing(undefined, 0), 0);
assert.equal(resolveDynamicCardsExternalSpacing(40, 0), 40);
assert.equal(resolveDynamicCardsExternalSpacing('80', 0), 80);
assert.equal(resolveDynamicCardsExternalSpacing(140, 0), 120);

const structureSettings = DYNAMIC_CARDS_MODULE.globalSettings?.estructura || [];
const getSetting = (id: string) => structureSettings.find((setting) => setting.id === id);
assert.equal(getSetting('margin_top')?.defaultValue, 0);
assert.equal(getSetting('margin_bottom')?.defaultValue, 0);
assert.equal(getSetting('margin_top')?.subsection, 'Espaciado exterior');
assert.equal(getSetting('margin_bottom')?.subsection, 'Espaciado exterior');

assert.equal(getSetting('height_desktop')?.defaultValue, 560);
assert.equal(getSetting('height_tablet')?.defaultValue, 480);
assert.equal(getSetting('height_mobile')?.defaultValue, 420);
assert.equal(getSetting('padding_y_desktop'), undefined);
assert.equal(getSetting('padding_y_tablet'), undefined);
assert.equal(getSetting('padding_y_mobile'), undefined);

console.log('dynamic cards external spacing tests passed');
