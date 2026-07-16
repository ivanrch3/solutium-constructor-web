export type BentoIconDevice = 'desktop' | 'tablet' | 'mobile';

export interface BentoIconSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
  internalGap: number;
}

type IconSpacingOverride = Partial<{
  verticalPadding: number;
  horizontalPadding: number;
  internalGap: number;
}>;

const toNonNegativeNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
};

const hasValue = (value: unknown) => value !== undefined && value !== null;

export const resolveBentoIconSpacing = (item: any, device: BentoIconDevice): BentoIconSpacing => {
  const legacyCardPadding = hasValue(item?.card_padding)
    ? toNonNegativeNumber(item.card_padding, 24)
    : 24;
  const hasLegacyCardPadding = hasValue(item?.card_padding)
    || ['top', 'right', 'bottom', 'left'].some((side) => hasValue(item?.[`card_padding_${side}`]));
  const legacyVerticalPadding = hasLegacyCardPadding
    ? legacyCardPadding
    : toNonNegativeNumber(item?.element_padding_y, 20);
  const legacyHorizontalPadding = hasLegacyCardPadding ? legacyCardPadding : 0;
  const legacyTop = toNonNegativeNumber(item?.card_padding_top, legacyVerticalPadding);
  const legacyRight = toNonNegativeNumber(item?.card_padding_right, legacyHorizontalPadding);
  const legacyBottom = toNonNegativeNumber(item?.card_padding_bottom, legacyVerticalPadding);
  const legacyLeft = toNonNegativeNumber(item?.card_padding_left, legacyHorizontalPadding);
  const legacyInternalGap = Math.max(
    toNonNegativeNumber(item?.icon_content_gap, 12),
    toNonNegativeNumber(item?.text_content_gap, 8)
  );
  const responsive = item?.icon_spacing?.[device] as IconSpacingOverride | undefined;

  if (!responsive) {
    return {
      top: legacyTop,
      right: legacyRight,
      bottom: legacyBottom,
      left: legacyLeft,
      internalGap: legacyInternalGap
    };
  }

  const verticalPadding = toNonNegativeNumber(responsive.verticalPadding, (legacyTop + legacyBottom) / 2);
  const horizontalPadding = toNonNegativeNumber(responsive.horizontalPadding, (legacyLeft + legacyRight) / 2);

  return {
    top: verticalPadding,
    right: horizontalPadding,
    bottom: verticalPadding,
    left: horizontalPadding,
    internalGap: toNonNegativeNumber(responsive.internalGap, legacyInternalGap)
  };
};

export const updateBentoIconSpacing = (
  item: any,
  device: BentoIconDevice,
  updates: IconSpacingOverride
) => {
  const current = resolveBentoIconSpacing(item, device);
  const existing = item?.icon_spacing && typeof item.icon_spacing === 'object'
    ? item.icon_spacing
    : {};

  return {
    ...existing,
    [device]: {
      verticalPadding: updates.verticalPadding ?? current.top,
      horizontalPadding: updates.horizontalPadding ?? current.left,
      internalGap: updates.internalGap ?? current.internalGap
    }
  };
};
