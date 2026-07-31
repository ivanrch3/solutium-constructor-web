type CatalogProductDescriptionInput = {
  shortDescription?: unknown;
  short_description?: unknown;
  detailedDescription?: unknown;
  detailed_description?: unknown;
  description?: unknown;
};

const normalizeDescription = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export function resolveCatalogProductDescriptions(input: CatalogProductDescriptionInput) {
  const shortDescription = normalizeDescription(input.shortDescription || input.short_description);
  const detailedDescription = normalizeDescription(
    input.detailedDescription || input.detailed_description || input.description
  );
  const legacyDescription = normalizeDescription(input.description);

  return {
    shortDescription,
    detailedDescription,
    cardDescription: shortDescription || detailedDescription || legacyDescription,
    detailDescription: detailedDescription || shortDescription || legacyDescription
  };
}

/**
 * Published catalog snapshots keep commercial fields frozen, but older ones
 * may predate `shortDescription`. Reconcile only display text from the live
 * catalog record so cards can use the current short description without
 * changing the snapshot's prices, options, or selection.
 */
export function mergeCurrentCatalogDescriptions<
  TSnapshot extends CatalogProductDescriptionInput,
  TCurrent extends CatalogProductDescriptionInput
>(snapshot: TSnapshot, current: TCurrent | undefined): TSnapshot {
  if (!current) return snapshot;

  const currentDescriptions = resolveCatalogProductDescriptions(current);
  if (!currentDescriptions.shortDescription && !currentDescriptions.detailedDescription) return snapshot;

  return {
    ...snapshot,
    ...(currentDescriptions.shortDescription
      ? {
          shortDescription: currentDescriptions.shortDescription,
          short_description: currentDescriptions.shortDescription
        }
      : {}),
    ...(currentDescriptions.detailedDescription
      ? {
          detailedDescription: currentDescriptions.detailedDescription,
          detailed_description: currentDescriptions.detailedDescription,
          description: currentDescriptions.detailedDescription
        }
      : {})
  } as TSnapshot;
}
