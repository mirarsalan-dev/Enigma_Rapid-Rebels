import React, { useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, Zap, Factory, CheckCircle2 } from 'lucide-react';

interface StagnationResolution {
  pathway: string;
  resolution_type: string;
  description: string;
  target_companies: string[];
}

interface StagnationResponse {
  alert_id: string;
  status: string;
  stagnant_quantity: number;
  resolutions: StagnationResolution[];
}

export const StagnationMonitor: React.FC = () => {
  const [exchangeId, setExchangeId] = useState('EXC-88421');
  const [materialName, setMaterialName] = useState('Steel Slag');
  const [receivedQty, setReceivedQty] = useState(500);
  const [usedQty, setUsedQty] = useState(50);
  const [holderId, setHolderId] = useState('Company B');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StagnationResponse | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/stagnation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange_id: exchangeId,
          material_name: materialName,
          received_quantity: receivedQty,
          used_quantity: usedQty,
          current_holder_id: holderId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getResolutionColor = (type: string) => {
    switch (type) {
      case 'IMMEDIATE MATCH': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'TRANSFORMATION REQUIRED': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'MARKET DEMAND GAP': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'NO VIABLE PATHWAY IDENTIFIED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getResolutionIcon = (type: string) => {
    switch (type) {
      case 'IMMEDIATE MATCH': return <CheckCircle2 className="w-5 h-5 mr-2" />;
      case 'TRANSFORMATION REQUIRED': return <Factory className="w-5 h-5 mr-2" />;
      case 'MARKET DEMAND GAP': return <Activity className="w-5 h-5 mr-2" />;
      case 'NO VIABLE PATHWAY IDENTIFIED': return <AlertTriangle className="w-5 h-5 mr-2" />;
      default: return <Zap className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Activity className="w-8 h-8 text-brand-accent" />
          <h1 className="text-2xl font-bold text-white">Material Stagnation Intelligence</h1>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Simulate Ongoing Exchange State</h2>
        <p className="text-gray-400 text-sm mb-6">
          SYMBIO continuously monitors materials post-exchange. If a receiving company cannot process the full volume, SYMBIO detects stagnation and hunts for downstream consumers.
        </p>

        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Exchange ID</label>
            <input 
              type="text" 
              value={exchangeId}
              onChange={(e) => setExchangeId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Material</label>
            <input 
              type="text" 
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Received Qty</label>
            <input 
              type="number" 
              value={receivedQty}
              onChange={(e) => setReceivedQty(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Used Qty</label>
            <input 
              type="number" 
              value={usedQty}
              onChange={(e) => setUsedQty(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-accent"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2.5 bg-brand-accent hover:bg-purple-600 disabled:bg-gray-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
          >
            {loading ? 'Analyzing...' : 'Detect Stagnation'}
          </button>
        </form>
      </div>

      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {analysis.stagnant_quantity > 0 ? (
            <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-2xl flex items-start space-x-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-1">MATERIAL STAGNATION ALERT</h3>
                    <p className="text-gray-300">Alert ID: <span className="font-mono text-gray-400">{analysis.alert_id}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{analysis.stagnant_quantity} <span className="text-lg text-gray-400">tonnes</span></p>
                    <p className="text-sm text-red-400 font-medium">Unused Volume Detected</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-700/50 p-6 rounded-2xl flex items-center space-x-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-green-400">Ecosystem Healthy</h3>
                <p className="text-green-200/70">100% of received material has been processed or utilized.</p>
              </div>
            </div>
          )}

          {analysis.stagnant_quantity > 0 && analysis.resolutions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Downstream Resolution Search</h3>
              <div className="grid grid-cols-1 gap-4">
                {analysis.resolutions.map((res, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase mb-3 ${getResolutionColor(res.resolution_type)}`}>
                        {getResolutionIcon(res.resolution_type)}
                        {res.resolution_type}
                      </div>
                      <p className="text-white font-medium text-lg mb-2">{res.description}</p>
                      
                      <div className="flex items-center space-x-2 text-brand-accent font-mono text-sm bg-gray-800 px-4 py-2 rounded-lg inline-flex">
                        {res.pathway.split('→').map((node, j, arr) => (
                          <React.Fragment key={j}>
                            <span className="font-bold">{node.trim()}</span>
                            {j < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-500 mx-1" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    {res.target_companies.length > 0 && (
                      <div className="w-full md:w-64 bg-gray-800 p-4 rounded-xl shrink-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Potential Receivers</p>
                        <ul className="space-y-2">
                          {res.target_companies.map((comp, j) => (
                            <li key={j} className="text-sm text-white flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-2"></div>
                              {comp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
