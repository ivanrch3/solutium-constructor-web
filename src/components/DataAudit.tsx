import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn, toCamelCase } from '../lib/utils';

const DataAudit: React.FC = () => {
  const { projectId, user } = useAuth();
  const [activeTab, setActiveTab] = useState('customers');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'customers', label: 'Clientes' },
    { id: 'products', label: 'Productos' },
    { id: 'assets', label: 'Activos' },
    { id: 'projects', label: 'Proyectos' },
    { id: 'profiles', label: 'Perfiles' },
    { id: 'modules', label: 'Módulos' },
    { id: 'pages', label: 'Páginas' },
    { id: 'leads', label: 'Leads' }
  ];

  useEffect(() => {
    const fetchRecords = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);

      try {
        // Mocking audit data
        const mockData: Record<string, any[]> = {
          customers: [
            { id: 'c1', name: 'Juan Perez', email: 'juan@example.com', project_id: 'proj_123' },
            { id: 'c2', name: 'Maria Lopez', email: 'maria@example.com', project_id: 'proj_123' }
          ],
          products: [
            { id: 'prod_1', name: 'Producto Premium', price: 99.99, project_id: 'proj_123', status: 'active' },
            { id: 'prod_2', name: 'Producto Básico', price: 49.99, project_id: 'proj_123', status: 'active' }
          ],
          assets: [
            { id: 'a1', type: 'image', url: 'https://picsum.photos/seed/a1/200', project_id: 'proj_123' }
          ],
          projects: [
            { id: 'proj_123', name: 'Mi Proyecto Solutium', owner_id: 'proj_user_123' }
          ],
          profiles: [
            { id: 'proj_user_123', full_name: 'Ivan Solutium', email: 'ivanrch3@gmail.com', role: 'admin' }
          ],
          modules: [
            { id: 'm1', type: 'hero', title: 'Portada Principal', project_id: 'proj_123' },
            { id: 'm2', type: 'features', title: 'Nuestros Servicios', project_id: 'proj_123' }
          ],
          pages: [
            { id: 'p1', name: 'Inicio', slug: 'home', project_id: 'proj_123' },
            { id: 'p2', name: 'Contacto', slug: 'contact', project_id: 'proj_123' }
          ],
          leads: [
            { id: 'l1', name: 'Carlos Ruiz', email: 'carlos@test.com', message: 'Interesado en servicios', created_at: '2026-03-26' }
          ]
        };

        setRecords(toCamelCase(mockData[activeTab]) || []);
      } catch (err: any) {
        console.error('Error fetching audit data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [activeTab, projectId]);

  if (user?.role === 'user') {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acceso Denegado</h2>
        <p className="text-gray-500">Solo los administradores pueden acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría de Datos</h1>
        <p className="text-gray-500">Visualiza la información cruda de la base de datos para este proyecto.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-bold transition-all border-b-2",
                activeTab === tab.id 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              No se encontraron registros en esta tabla.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {Object.keys(records[0]).map((key) => (
                    <th key={key} className="px-4 py-3 font-bold text-gray-900 uppercase text-[10px] tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
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
