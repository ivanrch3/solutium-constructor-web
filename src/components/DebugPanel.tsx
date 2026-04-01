import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle, Clock, Activity } from 'lucide-react';
import { SolutiumLog } from '../lib/solutium-sdk';

interface DebugPanelProps {
  logs: SolutiumLog[];
  projectId?: string;
  isReady: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ logs, projectId, isReady }) => {
  const [isOpen, setIsOpen] = useState(false);

  const lastError = logs.find(l => l.error || !l.isCamelCase);

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2">
      {/* Status Toast */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-lg transition-all hover:scale-105 ${
            isReady ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {isReady ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Activity className="w-4 h-4 animate-pulse" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isReady ? 'Configuración Recibida' : 'Esperando Configuración...'}
            </span>
          </div>
          {projectId && (
            <div className="h-4 w-[1px] bg-current/20" />
          )}
          {projectId && (
            <span className="text-[10px] font-mono opacity-60">ID: {projectId.slice(0, 8)}</span>
          )}
          {lastError && (
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          )}
        </button>
      )}

      {/* Full Debug Panel */}
      {isOpen && (
        <div className="bg-surface w-80 md:w-96 max-h-[500px] rounded-2xl border border-text/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-text/5 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-text">S.I.P. Messaging Logs</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-text/5 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-text/40" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="py-10 text-center text-text/40 text-xs italic">
                No se han detectado mensajes todavía...
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border text-[10px] transition-all ${
                    log.error ? 'bg-rose-500/5 border-rose-500/10' : 
                    !log.isCamelCase ? 'bg-amber-500/5 border-amber-500/10' :
                    'bg-text/5 border-text/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-black uppercase px-1.5 py-0.5 rounded ${
                      log.type.includes('ERROR') ? 'bg-rose-500 text-white' : 'bg-primary text-white'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-text/30 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text/40">Origin:</span>
                      <span className="text-text/60 font-mono truncate max-w-[150px]">{log.origin}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-text/40">Naming:</span>
                      <span className={log.isCamelCase ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                        {log.isCamelCase ? 'Camel Case ✅' : 'Snake Case ⚠️'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-text/40">ACK Status:</span>
                      <span className={`font-bold ${
                        log.ackStatus === 'success' ? 'text-emerald-500' : 
                        log.ackStatus === 'failed' ? 'text-rose-500' : 'text-text/40'
                      }`}>
                        {log.ackStatus.toUpperCase()}
                      </span>
                    </div>

                    {log.error && (
                      <div className="mt-2 p-2 bg-rose-500/10 rounded border border-rose-500/20 text-rose-600 font-bold">
                        Error: {log.error}
                      </div>
                    )}

                    <details className="mt-2">
                      <summary className="cursor-pointer text-primary hover:underline font-bold uppercase tracking-tighter">Ver Payload Raw</summary>
                      <pre className="mt-1 p-2 bg-background rounded border border-text/5 overflow-x-auto text-[9px] text-text/60">
                        {JSON.stringify(log.payloadRaw, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-text/5 border-t border-text/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-[10px] font-bold text-text/60 uppercase">
                {isReady ? 'Conectado' : 'Sincronizando'}
              </span>
            </div>
            <span className="text-[10px] text-text/30 font-mono">v3.0 Protocol</span>
          </div>
        </div>
      )}
    </div>
  );
};
