import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn, toCamelCase } from '../lib/utils';

const DataAudit: React.FC = () => {
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
        // Mostramos los datos tal cual vienen, sin camelCase para auditoría pura
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
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded">Audit Mode</span>
          <h1 className="text-2xl font-bold text-gray-900">Variables de Base de Datos</h1>
        </div>
        <p className="text-gray-500 text-sm">Inspección completa de todas las tablas y variables sincronizadas vía S.I.P. v4.0 / Esquema v4.0.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
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

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="m-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No hay datos disponibles en la tabla <span className="font-mono text-blue-600">[{activeTab}]</span>.
            </div>
          ) : (
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100">
                  {Object.keys(records[0]).map((key) => (
                    <th key={key} className="px-4 py-3 font-black text-gray-500 uppercase tracking-tighter border-r border-gray-100 last:border-0">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 text-gray-700 border-r border-gray-50 last:border-0 align-top break-all min-w-[120px]">
                        {typeof val === 'object' ? (
                          <pre className="text-[9px] leading-tight text-blue-800 bg-blue-50/50 p-1 rounded">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAudit;
