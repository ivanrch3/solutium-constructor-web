import type { ReservasWebActivitySummary } from '../../../types/reservasWeb';
import { getReservasWebConfigSettingKey, normalizeReservasWebConfig } from './reservasWebConfig';
import { ReservasWebPreview } from './ReservasWebPreview';

type ReservasWebModuleProps = {
  moduleId: string;
  settingsValues: Record<string, unknown>;
  reservasWebActivities?: ReservasWebActivitySummary[];
};

export const ReservasWebModule = ({ moduleId, settingsValues, reservasWebActivities = [] }: ReservasWebModuleProps) => (
  <ReservasWebPreview
    moduleId={moduleId}
    config={normalizeReservasWebConfig(settingsValues[getReservasWebConfigSettingKey(moduleId)])}
    reservasWebActivities={reservasWebActivities}
  />
);
