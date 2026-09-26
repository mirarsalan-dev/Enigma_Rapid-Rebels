import React, { useState, useEffect } from 'react';
import { Database, Plus } from 'lucide-react';

interface Material {
  material_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  verification_status: string;
}

export const Resources: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/materials/');
        if (res.ok) {
          const data = await res.json();
          setMaterials(data);
        }
      } catch (err) {
        console.error("Failed to fetch materials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white">Resources</h1>
        </div>
        <button className="flex items-center px-4 py-2 bg-brand-primary hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Resource
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading resources...</div>
      ) : materials.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No resources found</h3>
          <p className="text-gray-400">Add a resource to start tracking your materials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(material => (
            <div key={material.material_id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{material.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${material.verification_status === 'verified' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                    {material.verification_status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{material.category}</p>
              </div>
              <div className="text-xl font-bold text-white">
                {material.quantity} <span className="text-sm text-gray-400">{material.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
