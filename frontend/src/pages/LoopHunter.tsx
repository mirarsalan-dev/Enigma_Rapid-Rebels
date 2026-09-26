import React, { useState, useEffect } from 'react';
import { Activity, Zap, RefreshCw, GitMerge, ArrowRight, Server, Search } from 'lucide-react';

interface LoopPathStep {
  node_id: string;
  node_type: string;
  node_name: string;
  relationship_to_next: string | null;
}

interface LoopPath {
  pathway_type: string;
  number_of_hops: number;
  materials_exchanged: string[];
  processing_steps: string[];
  companies_involved: string[];
  transportation_requirements: string;
  timing_constraints: string;
  estimated_environmental_benefit: string;
  estimated_economic_opportunity: string;
  steps: LoopPathStep[];
}

export const LoopHunter: React.FC = () => {
  const [paths, setPaths] = useState<LoopPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sourceCompany, setSourceCompany] = useState('Apex Steel Plant');
  const [message, setMessage] = useState<string | null>(null);

  const discoverLoops = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setMessage(null);
    setPaths([]);
    
    try {
      const res = await fetch('http://localhost:8000/opportunities/loop-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_company_id: sourceCompany,
          max_hops: 5
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPaths(data.paths || []);
        if (data.message) {
          setMessage(data.message);
        }
      }
    } catch (err) {
      console.error("Failed to run loop hunter", err);
    } finally {
      setLoading(false);
    }
  };

  const getPathwayColor = (type: string) => {
    switch(type) {
      case 'CLOSED LOOP': return 'border-brand-accent text-brand-accent bg-brand-accent/10';
      case 'MULTI-HOP EXCHANGE': return 'border-blue-500 text-blue-500 bg-blue-500/10';
      case 'TRANSFORMATION REQUIRED': return 'border-orange-500 text-orange-500 bg-orange-500/10';
      case 'DIRECT EXCHANGE': return 'border-green-500 text-green-500 bg-green-500/10';
      default: return 'border-gray-500 text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex items-center space-x-3 mb-8">
        <RefreshCw className="w-8 h-8 text-brand-accent animate-[spin_10s_linear_infinite]" />
        <h1 className="text-2xl font-bold text-white">LOOP HUNTER</h1>
      </div>

      <div className="bg-gray-900 border border-brand-accent/30 p-6 rounded-2xl mb-8 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        <h2 className="text-lg font-medium text-white mb-4">Multi-Hop Symbiosis Discovery</h2>
        <p className="text-gray-400 text-sm mb-6">
          Uncover complex, multi-stage industrial symbiosis networks. Loop Hunter analyzes the Waste-to-Resource Knowledge Graph to discover circular pathways beyond simple direct exchanges.
        </p>
        
        <form onSubmit={discoverLoops} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Starting Company Node (e.g. Apex Steel Plant, BuildRight Construction)</label>
            <input 
              type="text" 
              value={sourceCompany}
              onChange={(e) => setSourceCompany(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-accent"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-brand-accent hover:bg-purple-600 disabled:bg-gray-700 rounded-lg text-white font-bold transition-colors flex items-center justify-center shadow-lg shadow-brand-accent/20"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin mr-2" /> : <Search className="w-5 h-5 mr-2" />}
            {loading ? 'Hunting Loops...' : 'Run Loop Hunter'}
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <GitMerge className="w-5 h-5 mr-2 text-brand-accent" />
            Discovered Pathways
          </h2>
          
          {loading ? (
            <div className="text-center py-16 text-gray-400 flex flex-col items-center">
              <Server className="w-10 h-10 animate-pulse text-brand-accent mb-4" />
              <p>Traversing W2RKG Graph to identify circular loops and complex transformations...</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400">NO VIABLE PATHWAY IDENTIFIED</p>
            </div>
          ) : (
            <div className="space-y-8">
              {paths.map((path, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg relative">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${getPathwayColor(path.pathway_type).split(' ')[0]}`}></div>
                  
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getPathwayColor(path.pathway_type)}`}>
                          {path.pathway_type}
                        </span>
                        <div className="mt-4 text-sm text-gray-400 flex space-x-6">
                          <span><strong>{path.number_of_hops}</strong> Hops</span>
                          <span><strong>{path.companies_involved.length}</strong> Companies</span>
                          <span><strong>{path.materials_exchanged.length}</strong> Materials</span>
                        </div>
                      </div>
                      
                      <div className="text-right max-w-xs">
                        <div className="text-sm font-semibold text-green-400 mb-1">
                          {path.estimated_environmental_benefit}
                        </div>
                        <div className="text-xs text-brand-light">
                          {path.estimated_economic_opportunity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visualization of the flow */}
                  <div className="p-6 bg-gray-900/50">
                    <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Resource Flow</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {path.steps.map((step, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <div className={`px-3 py-2 rounded-lg border flex flex-col items-center min-w-[120px] text-center ${
                            step.node_type === 'Company' ? 'bg-gray-800 border-gray-700' :
                            step.node_type === 'Material' ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' :
                            step.node_type === 'Process' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                            'bg-gray-800 border-gray-700'
                          }`}>
                            <span className="text-[10px] uppercase opacity-60 mb-1">{step.node_type}</span>
                            <span className="font-semibold text-sm text-white">{step.node_name}</span>
                          </div>
                          
                          {sIdx < path.steps.length - 1 && (
                            <div className="flex flex-col items-center justify-center px-1">
                              <ArrowRight className="w-5 h-5 text-gray-500 mb-1" />
                              <span className="text-[10px] text-gray-500 uppercase">{step.relationship_to_next}</span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-800">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Logistics & Timing</h4>
                      <p className="text-sm text-gray-300 mb-1"><span className="text-gray-500">Transport:</span> {path.transportation_requirements}</p>
                      <p className="text-sm text-gray-300"><span className="text-gray-500">Timing:</span> {path.timing_constraints}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Transformations</h4>
                      <p className="text-sm text-gray-300">
                        {path.processing_steps.length > 0 ? path.processing_steps.join(' → ') : 'None Required'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
