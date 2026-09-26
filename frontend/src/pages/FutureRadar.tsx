import React, { useState } from 'react';
import { Radar, AlertTriangle, TrendingUp, TrendingDown, Clock, Search } from 'lucide-react';

interface ForecastPeriod {
  horizon: string;
  expected_surplus: number;
  expected_demand: number;
  potential_gap: number;
  confidence_score: number;
}

interface ForecastResponse {
  material: string;
  insufficient_data: boolean;
  message: string;
  periods: ForecastPeriod[];
  recurring_patterns: string[];
  expected_shortages: string[];
  potential_exchanges: string[];
}

export const FutureRadar: React.FC = () => {
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/radar/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material_name: material }),
      });
      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      } else {
        console.error('Failed to fetch forecast');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex items-center space-x-3 mb-8">
        <Radar className="w-8 h-8 text-brand-primary" />
        <h1 className="text-2xl font-bold text-white">Industrial Future Radar</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Forecast Material Ecosystem</h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="e.g., Steel Slag, Plastic PET"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-primary hover:bg-blue-600 disabled:bg-gray-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
          >
            {loading ? 'Forecasting...' : <><Search className="w-5 h-5 mr-2" /> Run Radar</>}
          </button>
        </form>
      </div>

      {forecast && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {forecast.insufficient_data ? (
            <div className="bg-yellow-900/20 border border-yellow-700/50 p-6 rounded-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Insufficient historical data for reliable forecast.</h3>
              <p className="text-yellow-200/70 max-w-lg mx-auto">
                We need more recorded exchanges and listings for "{forecast.material}" to generate a valid time-series model. SYMBIO does not fabricate historical records.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {forecast.periods.map((period, idx) => (
                  <div key={idx} className={`bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden ${idx === 0 ? 'ring-2 ring-brand-primary/50' : ''}`}>
                    {idx === 0 && <div className="absolute top-0 right-0 bg-brand-primary text-xs font-bold px-3 py-1 rounded-bl-lg">LIVE</div>}
                    
                    <h3 className="text-gray-400 font-semibold mb-4 flex items-center">
                      <Clock className="w-4 h-4 mr-2" /> {period.horizon}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Surplus</p>
                        <p className="text-xl font-bold text-white flex items-center">
                          {period.expected_surplus.toFixed(0)} tonnes
                          <TrendingUp className="w-4 h-4 text-green-400 ml-2" />
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Demand</p>
                        <p className="text-xl font-bold text-white flex items-center">
                          {period.expected_demand.toFixed(0)} tonnes
                          <TrendingDown className="w-4 h-4 text-brand-accent ml-2" />
                        </p>
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Potential Gap</p>
                        <p className="text-lg font-bold text-brand-primary">
                          {period.potential_gap.toFixed(0)} tonnes
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 text-right">Confidence: {(period.confidence_score * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Recurring Patterns</h3>
                  <ul className="space-y-3">
                    {forecast.recurring_patterns.map((pattern, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <span className="text-brand-primary mr-2">•</span> {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Expected Shortages</h3>
                  <ul className="space-y-3">
                    {forecast.expected_shortages.map((shortage, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <span className="text-red-400 mr-2">!</span> {shortage}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Potential Future Exchanges</h3>
                  <ul className="space-y-3">
                    {forecast.potential_exchanges.map((exchange, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-300">
                        <span className="text-green-400 mr-2">→</span> {exchange}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
