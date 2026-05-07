
import { AIConsumptionPolicyService } from './aiConsumptionPolicyService';
import { AICreditService } from './aiCreditService';
import { GoogleGenAI } from "@google/genai";

export class AIBrokerService {
  /**
   * Procesa una solicitud de IA con validación de créditos e idempotencia
   */
  public static async processAIRequest(params: {
    projectId: string;
    userId: string;
    appSlug: string;
    actionSlug: string;
    prompt: string;
    idempotencyKey?: string;
    geminiApiKey: string;
  }) {
    console.log(`[WEB_BUILDER_AI_REAL_ENDPOINT_HIT]
projectId: ${params.projectId}
userId: ${params.userId}
appSlug: ${params.appSlug}
actionSlug: ${params.actionSlug}
idempotencyKey: ${params.idempotencyKey}
source: localhost`);

    // 1. Verificar idempotencia
    if (params.idempotencyKey) {
      const existingLog = await AICreditService.checkIdempotency(params.idempotencyKey);
      if (existingLog) {
        console.log(`[AI_BROKER] IDEMPOTENCY HIT (Supabase): ${params.idempotencyKey}`);
        return {
          status: 'success',
          data: {
            content: existingLog.metadata?.response_text || "Contenido recuperado por idempotencia",
            usage: {
              ...existingLog.metadata?.usage,
              idempotencyKey: params.idempotencyKey,
              is_idempotency_hit: true
            },
            log_id: existingLog.id
          }
        };
      }
    }

    // 2. Obtener política y costo
    const policy = AIConsumptionPolicyService.getPolicy(params.appSlug, params.actionSlug);
    console.log(`[AI_BROKER] Policy detected: charge=${policy.charge_project_credits}, cost=${policy.cost}`);

    // 3. Verificar saldo si corresponde
    if (policy.charge_project_credits) {
      const balance = await AICreditService.checkBalance(params.projectId, policy.cost);
      if (!balance.hasBalance) {
        throw new Error(`Insufficient credits. Required: ${policy.cost}, Current: ${balance.currentBalance}`);
      }
    }

    // 4. Llamar a Gemini
    let resultText = "";
    try {
      const genAI = new GoogleGenAI({ apiKey: params.geminiApiKey });
      const model = genAI.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }]
      });
      const response = await model;
      resultText = response.text;
    } catch (e: any) {
      console.error("[AI_BROKER] Gemini call failed:", e);
      throw new Error(`Gemini Error: ${e.message}`);
    }

    // 5. Consumir créditos y registrar log (persistente en Supabase)
    const usageMetadata = {
      appSlug: params.appSlug,
      actionSlug: params.actionSlug,
      cost: policy.cost,
      payer_type: policy.payer_type,
      covered_by: policy.covered_by,
      charge_project_credits: policy.charge_project_credits,
      idempotencyKey: params.idempotencyKey,
      response_text: resultText.substring(0, 500) // Guardamos parte de la respuesta en metadata para idempotencia
    };

    let logId = `local_${Date.now()}`;
    try {
      const log = await AICreditService.consumeCredits({
        projectId: params.projectId,
        userId: params.userId,
        appSlug: params.appSlug,
        actionSlug: params.actionSlug,
        cost: policy.cost,
        idempotencyKey: params.idempotencyKey,
        metadata: {
          ...usageMetadata,
          prompt_preview: params.prompt.substring(0, 100)
        }
      });
      if (log) logId = log.id;
    } catch (e) {
      console.warn("[AI_BROKER] Supabase persistence failed, but returning result.", e);
    }

    return {
      status: 'success',
      data: {
        content: resultText,
        usage: usageMetadata,
        log_id: logId
      }
    };
  }
}
