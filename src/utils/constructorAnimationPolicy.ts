export const CONSTRUCTOR_MODULE_ANIMATIONS_ENABLED = false;

export const CONSTRUCTOR_ANIMATION_DISABLED_MESSAGE =
  'Animaciones desactivadas mientras se estabiliza el render.';

type AnimationLikeSetting = {
  id?: string;
  label?: string;
  type?: string;
};

const BOOLEAN_ANIMATION_SETTING_IDS = new Set([
  'entrance_anim',
  'entrance_animation',
  'stagger_anim'
]);

const SELECT_ANIMATION_SETTING_IDS = new Set([
  'section_animation',
  'global_theme_section_animation',
  'global_entrance_anim'
]);

const ANIMATION_SETTING_LABEL_PATTERN = /animaci[oó]n|animation|stagger|cascada|scroll|reveal|hover/i;

const SETTING_KEY_SUFFIX_OVERRIDES: Array<{ suffix: string; value: any }> = [
  { suffix: '_global_theme_section_animation', value: 'none' },
  { suffix: '_global_entrance_anim', value: 'none' },
  { suffix: '_section_animation', value: 'none' },
  { suffix: '_entrance_animation', value: false },
  { suffix: '_entrance_anim', value: false },
  { suffix: '_stagger_anim', value: false }
];

export const isConstructorAnimationSetting = (setting?: AnimationLikeSetting | null) => {
  if (!setting) return false;

  const normalizedId = String(setting.id || '').trim().toLowerCase();
  const normalizedLabel = String(setting.label || '').trim().toLowerCase();

  if (
    BOOLEAN_ANIMATION_SETTING_IDS.has(normalizedId) ||
    SELECT_ANIMATION_SETTING_IDS.has(normalizedId)
  ) {
    return true;
  }

  if (setting.type === 'select' || setting.type === 'boolean') {
    return ANIMATION_SETTING_LABEL_PATTERN.test(normalizedLabel);
  }

  return false;
};

export const resolveConstructorAnimationControlState = (
  setting: AnimationLikeSetting,
  value: any
) => {
  if (CONSTRUCTOR_MODULE_ANIMATIONS_ENABLED || !isConstructorAnimationSetting(setting)) {
    return {
      disabled: false,
      disabledMessage: undefined as string | undefined,
      effectiveValue: value,
      forcedOptions: undefined as Array<{ label: string; value: string }> | undefined
    };
  }

  const normalizedId = String(setting.id || '').trim().toLowerCase();
  const effectiveValue = BOOLEAN_ANIMATION_SETTING_IDS.has(normalizedId) ? false : 'none';

  return {
    disabled: true,
    disabledMessage: CONSTRUCTOR_ANIMATION_DISABLED_MESSAGE,
    effectiveValue,
    forcedOptions: SELECT_ANIMATION_SETTING_IDS.has(normalizedId)
      ? [{ label: 'Sin animación', value: 'none' }]
      : undefined
  };
};

export const resolveEffectiveAnimation = (configuredAnimation: unknown) => {
  if (!CONSTRUCTOR_MODULE_ANIMATIONS_ENABLED) {
    return 'none';
  }

  return configuredAnimation;
};

export const resolveAnimationSafeSettings = <T extends Record<string, any>>(settingsValues: T): T => {
  if (CONSTRUCTOR_MODULE_ANIMATIONS_ENABLED || !settingsValues) {
    return settingsValues;
  }

  let changed = false;
  const nextSettings: Record<string, any> = { ...settingsValues };

  Object.entries(nextSettings).forEach(([key]) => {
    const override = SETTING_KEY_SUFFIX_OVERRIDES.find((entry) => key.endsWith(entry.suffix));
    if (!override) return;
    if (nextSettings[key] === override.value) return;
    nextSettings[key] = override.value;
    changed = true;
  });

  return changed ? (nextSettings as T) : settingsValues;
};
