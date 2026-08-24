import assert from 'node:assert/strict';
import { HERO_MODULE } from '../src/components/constructor/registry';
import { HERO_FLOATING_ANIMATION_DEFAULT } from '../src/components/constructor/modules/HeroModule';
import {
  resolveAnimationSafeSettings,
  resolveConstructorAnimationControlState,
  isConstructorAnimationSetting
} from '../src/utils/constructorAnimationPolicy';

const heroMedia = HERO_MODULE.elements.find((element) => element.id === 'el_hero_media');
const floatingSetting = heroMedia?.settings?.interaccion?.find((setting) => setting.id === 'floating_anim');

assert.equal(floatingSetting?.defaultValue, false);
assert.equal(HERO_FLOATING_ANIMATION_DEFAULT, false);
assert.equal(isConstructorAnimationSetting(floatingSetting), true);

const controlState = resolveConstructorAnimationControlState(floatingSetting!, true);
assert.equal(controlState.disabled, true);
assert.equal(controlState.effectiveValue, false);

const safeSettings = resolveAnimationSafeSettings({
  'hero-1_el_hero_media_floating_anim': true,
  'hero-1_global_entrance_anim': 'fade_up',
  'hero-1_global_stagger_anim': true
});
assert.equal(safeSettings['hero-1_el_hero_media_floating_anim'], false);
assert.equal(safeSettings['hero-1_global_entrance_anim'], 'none');
assert.equal(safeSettings['hero-1_global_stagger_anim'], false);

