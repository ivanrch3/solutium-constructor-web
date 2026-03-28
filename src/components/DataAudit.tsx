import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, Database } from 'lucide-react';
import { cn, toCamelCase } from '../lib/utils';

interface DataAuditProps {
  onClose?: () => void;
}

const DataAudit: React.FC<DataAuditProps> = ({ onClose }) => {
  const { 
    user, 
    project, 
    products, 
    customers, 
    members, 
    integrations, 
    assets 
  } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataMap: Record<string, any[]> = {
    customers: customers || [],
    products: products || [],
    assets: assets || [],
    members: members || [],
    integrations: integrations || [],
    project: project ? [project] : [],
    profile: user ? [user] : []
  };

  const tabs = [
    { id: 'customers', label: 'Clientes', count: dataMap.customers.length },
    { id: 'products', label: 'Productos', count: dataMap.products.length },
    { id: 'assets', label: 'Activos', count: dataMap.assets.length },
    { id: 'members', label: 'Miembros', count: dataMap.members.length },
    { id: 'integrations', label: 'Integraciones', count: dataMap.integrations.length },
    { id: 'project', label: 'Proyecto', count: dataMap.project.length },
    { id: 'profile', label: 'Perfil', count: dataMap.profile.length }
  ];

  useEffect(() => {
    const getRecords = () => {
      setLoading(true);
      setError(null);

      try {
        setRecords(dataMap[activeTab] || []);
      } catch (err: any) {
        console.error('Error getting audit data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getRecords();
  }, [activeTab, customers, products, assets, members, integrations, project, user]);

  if (user?.role === 'user' && !window.location.hostname.includes('localhost')) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-gray-500">Solo los administradores pueden acceder a esta sección de auditoría.</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold"
          >
            Cerrar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Verificación de Datos</h1>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded">S.I.P. v4.0</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Esquema Unificado v4.0</p>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide bg-white px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2",
                activeTab === tab.id 
                  ? "border-blue-600 text-blue-600 bg-blue-50/30" 
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Consultando Base de Datos...</p>
            </div>
          ) : error ? (
            <div className="m-8 p-6 bg-red-50 text-red-600 rounded-2xl flex items-start gap-4 border border-red-100">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold mb-1">Error de Sincronización</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
              <Database className="w-12 h-12 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">
                No hay datos en <span className="font-mono text-blue-600">[{activeTab}]</span>
              </p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full text-left text-[11px] font-mono border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    {Object.keys(records[0]).map((key) => (
                      <th key={key} className="px-4 py-4 font-black text-gray-500 uppercase tracking-tighter border-r border-gray-200 last:border-0 whitespace-nowrap">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-4 py-4 text-gray-700 border-r border-gray-100 last:border-0 align-top break-all min-w-[150px] group-hover:text-gray-900">
                          {val === null ? (
                            <span className="text-gray-300 italic">null</span>
                          ) : typeof val === 'object' ? (
                            <pre className="text-[10px] leading-relaxed text-blue-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                              {JSON.stringify(val, null, 2)}
                            </pre>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAudit;
