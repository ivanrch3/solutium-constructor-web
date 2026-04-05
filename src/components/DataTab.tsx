import React, { useState, useEffect } from 'react';
import { getProfiles, getProjects, getCustomers, getProducts } from '../services/dataService';
import { syncAsset } from '../services/assetService';

type SubTab = 'profiles' | 'projects' | 'customers' | 'products' | 'test';

interface DataTabProps {
  projectId: string | null;
  currentUserId: string | null;
}

export const DataTab: React.FC<DataTabProps> = ({ projectId, currentUserId }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('profiles');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const pageSize = 20;

  const handleTestSync = async () => {
    if (!projectId) {
      setTestResult({ success: false, message: 'No hay un proyecto activo para la prueba.' });
      return;
    }

    setLoading(true);
    setTestResult(null);
    try {
      const testEntity = {
        id: `test_${Date.now()}`,
        projectId: projectId,
        status: 'testing',
        customerName: 'Prueba de Sistema'
      };

      const testContent = `Archivo de prueba generado el ${new Date().toLocaleString()}`;
      const url = await syncAsset(
        testEntity,
        'test',
        testContent,
        'txt',
        'text/plain',
        'Prueba de Sincronización'
      );

      setTestResult({ 
        success: true, 
        message: `¡Prueba exitosa! Archivo subido y registrado. URL: ${url}` 
      });
    } catch (err) {
      console.error('Error en la prueba de sincronización:', err);
      setTestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Error desconocido en la prueba.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (tab: SubTab, pageIndex: number) => {
    if (!projectId || !currentUserId) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      let result: any[] = [];
      switch (tab) {
        case 'profiles':
          result = await getProfiles(pageIndex, pageSize, projectId, currentUserId);
          break;
        case 'projects':
          result = await getProjects(pageIndex, pageSize, projectId);
          break;
        case 'customers':
          result = await getCustomers(pageIndex, pageSize, projectId);
          break;
        case 'products':
          result = await getProducts(pageIndex, pageSize, projectId);
          break;
      }
      setData(result);
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSubTab, page);
  }, [activeSubTab, page, projectId, currentUserId]);

  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    setPage(0);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-text">Gestión de Datos</h2>
      
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {(['profiles', 'projects', 'customers', 'products', 'test'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-3 px-2 capitalize text-base font-medium transition-colors ${
              activeSubTab === tab 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-text'
            }`}
          >
            {tab === 'test' ? 'Prueba de Sincronización' : tab}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto bg-surface rounded-lg shadow-sm border border-gray-100 p-4">
        {activeSubTab === 'test' ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-8 text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-2">Verificación de Activos</h3>
              <p className="text-gray-500 mb-6">
                Esta prueba verificará la conexión con Digital Ocean Spaces y el registro en la tabla 'assets' de Supabase siguiendo el estándar de Solutium.
              </p>
              
              <button
                onClick={handleTestSync}
                disabled={loading}
                className="btn-primary w-full py-3 text-lg"
              >
                {loading ? 'Sincronizando...' : 'Ejecutar Prueba de Sincronización'}
              </button>

              {testResult && (
                <div className={`mt-6 p-4 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  <p className="font-bold mb-1">{testResult.success ? 'Éxito' : 'Error'}</p>
                  <p className="break-all">{testResult.message}</p>
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No hay datos disponibles.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th 
                      key={key}
                      className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-200">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {Object.keys(data[0]).map((key) => {
                      const val = row[key];
                      let displayVal = '';
                      
                      if (val === null) displayVal = 'null';
                      else if (val === undefined) displayVal = 'undefined';
                      else if (typeof val === 'object') displayVal = JSON.stringify(val);
                      else displayVal = String(val);

                      return (
                        <td 
                          key={key} 
                          className="px-4 py-3 text-sm text-text border-b border-gray-100 truncate max-w-xs"
                          title={displayVal}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="btn-primary"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-500">Página {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={data.length < pageSize || loading}
          className="btn-primary"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
