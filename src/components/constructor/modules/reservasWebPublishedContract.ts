import type { RenderingContract } from '../../../types/schema';
import type { ReservasWebActivitySummary } from '../../../types/reservasWeb';
import { isReservasWebActivityArchived } from '../../../types/reservasWeb';
import { normalizeReservasWebConfig, type ReservasWebConfigV1, type ReservasWebStyleV1 } from './reservasWebConfig';

export type ReservasWebPublishedSnapshot = {
  version: ReservasWebConfigV1['version'];
  activities: { publicActivityIdentifiers: string[] };
  display: ReservasWebConfigV1['display'];
  content: ReservasWebConfigV1['content'];
  style: ReservasWebStyleV1;
};

export class ReservasWebPublicationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservasWebPublicationValidationError';
  }
}

const cloneDisplay = (display: ReservasWebConfigV1['display']): ReservasWebConfigV1['display'] => ({ ...display });
const cloneContent = (content: ReservasWebConfigV1['content']): ReservasWebConfigV1['content'] => ({ ...content });
const cloneStyle = (style: ReservasWebStyleV1): ReservasWebStyleV1 => ({ ...style });

export const serializeReservasWebForPublication = (
  input: unknown,
  reservasWebActivities: readonly ReservasWebActivitySummary[]
): ReservasWebPublishedSnapshot => {
  const config = normalizeReservasWebConfig(input);
  const activityIds = config.activities.activityIds;

  if (activityIds.length === 0) {
    throw new ReservasWebPublicationValidationError('Selecciona una actividad antes de publicar Reservas Web.');
  }

  const activitiesById = new Map(reservasWebActivities.map((activity) => [activity.id, activity]));
  const publicActivityIdentifiers = activityIds.map((activityId) => {
    const activity = activitiesById.get(activityId);
    if (!activity) {
      throw new ReservasWebPublicationValidationError('La actividad seleccionada ya no est\u00e1 disponible para publicar.');
    }
    if (isReservasWebActivityArchived(activity)) {
      throw new ReservasWebPublicationValidationError('La actividad seleccionada est\u00e1 archivada y no puede publicarse para reservas.');
    }

    const publicIdentifier = typeof activity.publicIdentifier === 'string' ? activity.publicIdentifier.trim() : '';
    if (!publicIdentifier) {
      throw new ReservasWebPublicationValidationError('La actividad seleccionada todav\u00eda no tiene una referencia p\u00fablica v\u00e1lida.');
    }
    return publicIdentifier;
  });

  return {
    version: config.version,
    activities: { publicActivityIdentifiers },
    display: cloneDisplay(config.display),
    content: cloneContent(config.content),
    style: cloneStyle(config.style)
  };
};

const isReservasWebSection = (section: RenderingContract['sections'][number]) =>
  section.type === 'reservas_web' || section.tipo === 'reservas_web';

export const serializeReservasWebContractForPublication = (
  contract: RenderingContract,
  reservasWebActivities: readonly ReservasWebActivitySummary[]
): RenderingContract => ({
  ...contract,
  sections: contract.sections.map((section) => {
    if (!isReservasWebSection(section)) return section;

    const publishedSnapshot = serializeReservasWebForPublication(
      section.settings?.el_reservas_web_config,
      reservasWebActivities
    );

    return {
      ...section,
      settings: {
        ...section.settings,
        el_reservas_web_config: publishedSnapshot
      }
    };
  })
});
