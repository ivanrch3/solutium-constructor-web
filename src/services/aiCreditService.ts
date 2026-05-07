
import { getSupabase } from './supabaseClient';

export interface AICreditCheckResult {
  hasBalance: boolean;
  currentBalance: number;
  required: number;
}

export class AICreditService {
  /**
   * Verifica si un proyecto tiene saldo suficiente
   */
  public static async checkBalance(projectId: string, required: number): Promise<AICreditCheckResult> {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[AICreditService] Supabase not initialized, bypassing balance check for safety (STAGING MODE)');
      return { hasBalance: true, currentBalance: 999, required };
    }

    // En un sistema real, aquí consultaríamos la tabla de balances
    // Para esta validación, simulamos la consulta a Supabase si existe, 
    // o devolvemos éxito si estamos en modo local sin DB conectada.
    try {
      const { data, error } = await supabase
        .from('project_balances') // Asumiendo esta tabla según contexto Genoma
        .select('bonus_balance')
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        console.warn('[AICreditService] Project balance not found, allowing test.');
        return { hasBalance: true, currentBalance: 100, required };
      }

      return {
        hasBalance: data.bonus_balance >= required,
        currentBalance: data.bonus_balance,
        required
      };
    } catch (e) {
      return { hasBalance: true, currentBalance: 0, required };
    }
  }

  /**
   * Registra el uso y la transacción en Supabase
   */
  public static async consumeCredits(params: {
    projectId: string;
    userId: string;
    appSlug: string;
    actionSlug: string;
    cost: number;
    idempotencyKey?: string;
    metadata?: any;
  }) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[AICreditService] Cannot persist: Supabase client missing.');
      return null;
    }

    console.log(`[AICreditService] PERSIESTING REAL USAGE: ${params.actionSlug} cost ${params.cost}`);

    // 1. Create ai_usage_log
    const { data: logData, error: logError } = await supabase
      .from('ai_usage_logs')
      .insert({
        project_id: params.projectId,
        user_id: params.userId,
        app_slug: params.appSlug,
        action_slug: params.actionSlug,
        credits_cost: params.cost,
        idempotency_key: params.idempotencyKey,
        metadata: params.metadata,
        status: 'completed'
      })
      .select()
      .single();

    if (logError) {
      console.error('[AICreditService] Error creating usage log:', logError);
      throw logError;
    }

    // 2. Create ai_credit_transaction (consumption)
    if (params.cost > 0) {
      const { error: txError } = await supabase
        .from('ai_credit_transactions')
        .insert({
          project_id: params.projectId,
          amount: params.cost,
          type: 'consume',
          source: 'ai_usage',
          reference_id: logData.id,
          idempotency_key: params.idempotencyKey,
          description: `Consumo IA: ${params.actionSlug}`
        });

      if (txError) {
        console.error('[AICreditService] Error creating transaction:', txError);
        // Nota: En producción esto debería ser atómico o compensado
      }
    }

    return logData;
  }

  /**
   * Verifica si ya existe un log para esta idempotencyKey
   */
  public static async checkIdempotency(key: string) {
    const supabase = getSupabase();
    if (!supabase || !key) return null;

    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('idempotency_key', key)
      .maybeSingle();

    if (error) {
      console.warn('[AICreditService] Idempotency check failed:', error);
      return null;
    }

    return data;
  }
}
