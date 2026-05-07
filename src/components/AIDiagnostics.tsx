import React, { useState } from 'react';
import { generateSectionWithRealAI } from '../services/aiService';
import { Activity, Beaker, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const AIDiagnostics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("dev-local-web-section-005");
  const [isIdempotentResult, setIsIdempotentResult] = useState(false);

  const runTest = async (isRepeat = false) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setIsIdempotentResult(false);

    const keyToUse = isRepeat ? idempotencyKey : `dev-local-web-section-${Date.now().toString().slice(-3)}`;
    if (!isRepeat) setIdempotencyKey(keyToUse);
    
    try {
      const response = await generateSectionWithRealAI(isRepeat ? idempotencyKey : keyToUse, manualToken);
      if (response.ok) {
        const data = response.data;
        setResult(data);
        
        // Extraer metadatos de uso para debug
        const usage = data?.usage || data?.data?.usage || {};
        const logId = usage.aiUsageLogId || data.aiUsageLogId || data.data?.aiUsageLogId;
        const cost = usage.costCredits || usage.cost || usage.credits || data.costCredits || (logId ? 2 : 0);
        
        setIsIdempotentResult(usage.covered_by === 'idempotency' || usage.is_idempotent === true);

        console.log('[REAL_AI_USAGE_DISPLAY_DEBUG]', {
          aiUsageLogId: logId,
          costCredits: cost,
          model: usage.model,
          duration: usage.duration,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          actionSlug: usage.actionSlug || data.actionSlug,
          idempotencyKey: usage.idempotencyKey || data.idempotencyKey
        });
      } else {
        setError(response.data?.error || `HTTP Error ${response.status}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUsageData = () => {
    if (!result) return null;
    const data = result.data || result;
    const usage = result.usage || data.usage || {};
    
    const logId = usage.aiUsageLogId || result.aiUsageLogId || data.aiUsageLogId;
    const cost = usage.costCredits || usage.cost || usage.credits || result.costCredits || (logId ? 2 : 0);

    return {
      logId,
      cost,
      model: usage.model || 'N/A',
      duration: usage.duration || 'N/A',
      inputTokens: usage.inputTokens || 0,
      outputTokens: usage.outputTokens || 0,
      totalTokens: usage.totalTokens || 0,
      idempotency: usage.covered_by === 'idempotency' || usage.is_idempotent === true
    };
  };

  const usageData = getUsageData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Beaker className="w-6 h-6 text-indigo-500" />
        <h2 className="text-xl font-semibold text-slate-800">Prueba IA Real (Fase 3C.3)</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50 border rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Configuración de Prueba</h3>
          <div className="grid grid-cols-1 gap-2 text-[10px] font-mono bg-white p-3 rounded border">
            <div><span className="text-slate-400">projectId:</span> 5210c610-776e-4736-b3f6-5c176e9a771b</div>
            <div><span className="text-slate-400">actionSlug:</span> web_ai_generate_section</div>
            <div><span className="text-slate-400">key:</span> {idempotencyKey}</div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Supabase Access Token (Auth)
          </h3>
          <p className="text-[10px] text-amber-700 mb-3">
            Si el Constructor no recibió el token via S.I.P., pégalo aquí para la prueba local.
          </p>
          <input 
            type="text" 
            placeholder="eyJhbGciOiJIUzI1..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="w-full p-2 text-[10px] font-mono border border-amber-300 rounded bg-white focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setIdempotencyKey("dev-local-web-section-005");
            runTest(false);
          }}
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
          Lanzar Prueba Real (005)
        </button>

        <button
          onClick={() => runTest(true)}
          disabled={loading || !idempotencyKey}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          Repetir Idempotencia
        </button>
      </div>

      {loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-indigo-600 font-medium justify-center py-4"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Llamando a App Madre API...
        </motion.div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Error en la prueba real</div>
            <div className="text-sm opacity-90 break-all">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className={`p-4 rounded-xl flex gap-3 items-center border ${usageData?.idempotency ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <CheckCircle2 className="w-5 h-5" />
            <div className="font-bold">
              {usageData?.idempotency ? 'Respuesta Idempotente (Sin nuevo cobro)' : 'Respuesta del Backend Recibida'}
            </div>
          </div>

          {!usageData?.logId && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex gap-2 items-center">
              <AlertCircle className="w-4 h-4" />
              Respuesta recibida, pero no se recibió aiUsageLogId.
            </div>
          )}

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[200px]">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border p-3 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Log ID (Supabase)</div>
              <div className="font-mono text-[10px] break-all text-slate-700">{usageData?.logId || 'N/A'}</div>
            </div>
            <div className="bg-white border p-3 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Costo Real</div>
              <div className="font-bold text-lg text-indigo-600">{usageData?.cost} Créditos</div>
              {usageData?.idempotency && <div className="text-[9px] text-blue-500 font-bold italic">Costo ya descontado previamente</div>}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl divide-y text-[10px]">
            <div className="p-2 flex justify-between">
              <span className="text-slate-400 uppercase font-bold">Modelo:</span>
              <span className="text-slate-700 font-mono">{usageData?.model}</span>
            </div>
            <div className="p-2 flex justify-between">
              <span className="text-slate-400 uppercase font-bold">Duración:</span>
              <span className="text-slate-700 font-mono">{usageData?.duration}ms</span>
            </div>
            <div className="p-2 flex justify-between">
              <span className="text-slate-400 uppercase font-bold">Tokens:</span>
              <span className="text-slate-700 font-mono">
                {usageData?.inputTokens} IQ / {usageData?.outputTokens} OQ ({usageData?.totalTokens} Total)
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso:</strong> Esta prueba descuenta 2 créditos reales de la cuenta de Solutium si el backend está conectado a Supabase. 
          Use la opción "Repetir" para validar que el sistema no descuenta créditos adicionales por la misma operación.
        </p>
      </div>
    </div>
  );
};
