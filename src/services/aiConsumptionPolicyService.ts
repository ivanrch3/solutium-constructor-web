
export interface AIConsumptionPolicy {
  charge_project_credits: boolean;
  payer_type: 'project' | 'solutium' | 'included_support' | 'unknown';
  covered_by: 'project' | 'solutium' | 'none';
  cost: number;
  reason?: string;
}

export class AIConsumptionPolicyService {
  /**
   * Determina la política de consumo para una acción específica
   */
  public static getPolicy(appSlug: string, actionSlug: string): AIConsumptionPolicy {
    // Caso: web_ai_generate_section (PILOTO)
    if (appSlug === 'constructor_web' && actionSlug === 'web_ai_generate_section') {
      return {
        charge_project_credits: true,
        payer_type: 'project',
        covered_by: 'project',
        cost: 2
      };
    }

    // Caso: archie_chat (Soporte incluido)
    if (actionSlug === 'archie_chat') {
      return {
        charge_project_credits: false,
        payer_type: 'included_support',
        covered_by: 'solutium',
        cost: 0
      };
    }

    // Caso: Acciones desconocidas (PROTECCIÓN)
    if (!actionSlug || actionSlug === 'unknown') {
      return {
        charge_project_credits: false,
        payer_type: 'unknown',
        covered_by: 'none',
        cost: 0,
        reason: "UNKNOWN_ACTION_NOT_BILLED"
      };
    }

    // Por defecto: no cobrar si no está configurado (Safe Policy)
    return {
      charge_project_credits: false,
      payer_type: 'unknown',
      covered_by: 'none',
      cost: 0,
      reason: "ACTION_NOT_CONFIGURED"
    };
  }
}
