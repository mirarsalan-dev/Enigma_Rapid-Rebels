import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft } from 'lucide-react';

interface Exchange {
  exchange_id: string;
  source_company_id: string;
  receiving_company_id: string;
  material_id: string;
  quantity: number;
  status: string;
  pickup_details: string | null;
  delivery_details: string | null;
  created_at: string;
}

export const Exchanges: React.FC = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/exchanges/');
        if (res.ok) {
          const data = await res.json();
          setExchanges(data);
        }
      } catch (err) {
        console.error("Failed to fetch exchanges", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-900/50 text-green-400';
      case 'in_progress': return 'bg-blue-900/50 text-blue-400';
      case 'initiated': return 'bg-yellow-900/50 text-yellow-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white">Exchanges</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading exchanges...</div>
      ) : exchanges.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <ArrowRightLeft className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No active exchanges</h3>
          <p className="text-gray-400">Your material exchanges will appear here once initiated.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges.map(exchange => (
            <div key={exchange.exchange_id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-6 flex-1">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-400">Source</span>
                  <span className="font-semibold text-white">{exchange.source_company_id.substring(0, 8)}</span>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-sm text-gray-400">Receiver</span>
                  <span className="font-semibold text-white">{exchange.receiving_company_id.substring(0, 8)}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <span className="text-sm text-gray-400">Material ID</span>
                <span className="font-medium text-brand-accent">{exchange.material_id.substring(0, 8)}</span>
                <span className="text-xs text-gray-500 mt-1">{exchange.quantity} units</span>
              </div>

              <div className="flex flex-col items-end flex-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(exchange.status)}`}>
                  {exchange.status}
                </span>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(exchange.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
