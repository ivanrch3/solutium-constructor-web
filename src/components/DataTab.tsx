import React, { useState, useEffect } from 'react';
import { getProfiles, getProjects, getCustomers, getProducts } from '../services/dataService';

type SubTab = 'profiles' | 'projects' | 'customers' | 'products';

interface DataTabProps {
  projectId: string | null;
}

export const DataTab: React.FC<DataTabProps> = ({ projectId }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('profiles');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fetchData = async (tab: SubTab, pageIndex: number) => {
    if (!projectId) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      let result: any[] = [];
      switch (tab) {
        case 'profiles':
          result = await getProfiles(pageIndex, pageSize, projectId);
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
  }, [activeSubTab, page, projectId]);

  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    setPage(0);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-text">Gestión de Datos</h2>
      
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {(['profiles', 'projects', 'customers', 'products'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-3 px-2 capitalize font-medium transition-colors ${
              activeSubTab === tab 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-gray-500 hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto bg-surface rounded-lg shadow-sm border border-gray-100 p-4">
        {loading ? (
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
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-text bg-surface hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-500">Página {page + 1}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={data.length < pageSize || loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-text bg-surface hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
