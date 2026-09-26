import React, { useState } from 'react';
import { Lightbulb, Search, ArrowRight, Activity, Cpu } from 'lucide-react';

interface ImpactFactor {
  name: string;
  value: number;
  unit: string;
  source: string;
  assumption: string;
  calculation_method: string;
}

interface EnvironmentalImpact {
  waste_diverted_kg: number;
  virgin_material_avoided_kg_co2e: ImpactFactor;
  avoided_disposal_kg_co2e: ImpactFactor;
  transport_emissions_kg_co2e: ImpactFactor;
  net_benefit_kg_co2e: number;
  disclaimer: string;
}

interface Opportunity {
  source_company: string;
  receiving_company: string;
  material: string;
  quantity: number;
  compatibility: number;
  processing_requirement: string | null;
  distance_km: number;
  timing_match: boolean;
  environmental_estimate: string;
  opportunity_score: number;
  explanation: string;
  impact_estimate?: EnvironmentalImpact;
}

interface UnknownUseOpportunity {
  material: string;
  required_process: string;
  potential_output: string;
  potential_industries: string[];
  potential_downstream_users: string;
  estimated_logistics_complexity: string;
  estimated_environmental_opportunity: string;
  category: string;
  description: string;
}

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [unknownUses, setUnknownUses] = useState<UnknownUseOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'direct' | 'unknown'>('direct');
  const [materialName, setMaterialName] = useState('Steel Slag');
  const [quantity, setQuantity] = useState(100);
  const [searched, setSearched] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  const discoverOpportunities = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setDisclaimer(null);
    setOpportunities([]);
    setUnknownUses([]);
    
    try {
      if (mode === 'direct') {
        const res = await fetch('/api/opportunities/discover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_company_id: "COMP-1234",
            material: {
              material_name: materialName,
              verification_status: "UNVERIFIED"
            },
            quantity_available: quantity
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.opportunities || []);
        }
      } else {
        const res = await fetch('/api/opportunities/unknown-use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            material: {
              material_name: materialName,
              verification_status: "UNVERIFIED"
            }
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setUnknownUses(data.opportunities || []);
          if (data.disclaimer) {
            setDisclaimer(data.disclaimer);
          }
        }
      }
    } catch (err) {
      console.error("Failed to discover opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex items-center space-x-3 mb-8">
        <Lightbulb className="w-8 h-8 text-brand-accent" />
        <h1 className="text-2xl font-bold text-white">Discover Opportunities</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-8">
        <div className="flex space-x-4 mb-6 border-b border-gray-800 pb-4">
          <button 
            className={`font-medium pb-2 px-1 border-b-2 transition-colors ${mode === 'direct' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            onClick={() => setMode('direct')}
          >
            Direct Exchange
          </button>
          <button 
            className={`font-medium pb-2 px-1 border-b-2 transition-colors ${mode === 'unknown' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            onClick={() => setMode('unknown')}
          >
            Unknown Use Discovery (Phase 6)
          </button>
        </div>
        
        <form onSubmit={discoverOpportunities} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Material Name</label>
            <input 
              type="text" 
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
              required
            />
          </div>
          {mode === 'direct' && (
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full md:w-auto px-6 py-3 disabled:bg-gray-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${mode === 'direct' ? 'bg-brand-primary hover:bg-blue-600' : 'bg-brand-accent hover:bg-purple-600'}`}
          >
            {loading ? <Activity className="w-5 h-5 animate-spin mr-2" /> : (mode === 'direct' ? <Search className="w-5 h-5 mr-2" /> : <Cpu className="w-5 h-5 mr-2" />)}
            {loading ? 'Analyzing...' : (mode === 'direct' ? 'Discover Matches' : 'Discover Unknown Uses')}
          </button>
        </form>
      </div>

      {searched && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Results</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400">Running SYMBIO AI Engine...</div>
          ) : mode === 'direct' && opportunities.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No viable pathways identified for this material at the moment.</p>
            </div>
          ) : mode === 'unknown' && unknownUses.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No alternative applications identified.</p>
            </div>
          ) : mode === 'direct' ? (
            <div className="grid grid-cols-1 gap-6">
              {opportunities.map((opp, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 text-lg font-bold text-white mb-1">
                        <span>{(opp.source_company || (opp as any).source_company_id || 'Apex Steel').substring(0, 20)}</span>
                        <ArrowRight className="w-5 h-5 text-gray-500" />
                        <span>{(opp.receiving_company || (opp as any).receiving_company_name || (opp as any).receiving_company_id || 'BuildRight Precast').substring(0, 20)}</span>
                      </div>
                      <p className="text-brand-accent font-medium">{(opp.material || (opp as any).material_name || 'Secondary Material')} ({opp.quantity || 100} units)</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(
                          (opp.opportunity_score != null 
                            ? (opp.opportunity_score > 1 ? opp.opportunity_score : opp.opportunity_score * 100) 
                            : ((opp as any).compatibility_score || 90))
                        )}%
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Match Score</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-4 bg-gray-800 p-4 rounded-lg">
                    {opp.explanation || (opp as any).match_explanation || 'High compatibility identified based on physical and geographic proximity.'}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                    <div>
                      <span className="block text-gray-500 mb-1">Compatibility</span>
                      <span className="text-white font-medium">{Math.round(opp.compatibility * 100)}%</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Distance</span>
                      <span className="text-white font-medium">{opp.distance_km} km</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Timing Match</span>
                      <span className="text-white font-medium">{opp.timing_match ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 mb-1">Processing</span>
                      <span className="text-white font-medium">{opp.processing_requirement || 'None'}</span>
                    </div>
                  </div>

                  {opp.impact_estimate && (
                    <div className="border border-green-900/50 bg-green-900/10 rounded-xl p-4 mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-green-400">🌱 {opp.impact_estimate.disclaimer}</h4>
                        <span className="text-xl font-bold text-green-300">
                          {opp.impact_estimate.net_benefit_kg_co2e.toFixed(1)} kg CO₂e Saved
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Material Diverted</p>
                          <p className="text-lg font-bold text-white">{opp.impact_estimate.waste_diverted_kg.toLocaleString()} kg</p>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Transport Impact</p>
                          <p className="text-lg font-bold text-red-400">{opp.impact_estimate.transport_emissions_kg_co2e.value.toFixed(1)} kg CO₂e</p>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">Potential Benefit</p>
                          <p className="text-lg font-bold text-green-400">
                            {(opp.impact_estimate.virgin_material_avoided_kg_co2e.value + opp.impact_estimate.avoided_disposal_kg_co2e.value).toFixed(1)} kg CO₂e
                          </p>
                        </div>
                      </div>

                      <details className="text-xs text-gray-400 group cursor-pointer">
                        <summary className="font-semibold text-green-500 hover:text-green-400 transition-colors list-none flex items-center">
                          <span className="mr-2">▶</span> View Calculation Breakdown & Sources
                        </summary>
                        <div className="mt-3 space-y-3 pl-4 border-l border-green-900/30">
                          {[
                            opp.impact_estimate.virgin_material_avoided_kg_co2e, 
                            opp.impact_estimate.avoided_disposal_kg_co2e, 
                            opp.impact_estimate.transport_emissions_kg_co2e
                          ].map((factor, i) => (
                            <div key={i} className="bg-gray-800/50 p-3 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <strong className="text-gray-200">{factor.name}</strong>
                                <span className={factor.value < 0 || factor.name === 'Transport Emissions' ? 'text-red-400' : 'text-green-400'}>
                                  {factor.name === 'Transport Emissions' ? '-' : '+'}{factor.value.toFixed(1)} {factor.unit}
                                </span>
                              </div>
                              <p className="mb-1"><span className="text-gray-500">Method:</span> {factor.calculation_method}</p>
                              <p className="mb-1"><span className="text-gray-500">Assumption:</span> {factor.assumption}</p>
                              <p><span className="text-gray-500">Source:</span> <span className="italic">{factor.source}</span></p>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {disclaimer && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-lg flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-200">{disclaimer}</p>
                </div>
              )}
              {unknownUses.map((opp, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>
                  
                  <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <h3 className="text-xl font-bold text-white mb-2 md:mb-0">{opp.description}</h3>
                    <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-full text-xs font-semibold uppercase">
                      {opp.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Material</p>
                      <p className="text-white font-medium">{opp.material}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Potential Output</p>
                      <p className="text-white font-medium">{opp.potential_output}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Required Process</p>
                      <p className="text-white font-medium">{opp.required_process}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Potential Downstream Users</p>
                      <p className="text-white font-medium">{opp.potential_downstream_users}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Key Estimates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start">
                        <span className="w-32 text-gray-500 shrink-0">Target Industries:</span>
                        <span className="text-brand-light">{opp.potential_industries.join(", ")}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="w-32 text-gray-500 shrink-0">Logistics:</span>
                        <span className="text-brand-light">{opp.estimated_logistics_complexity}</span>
                      </div>
                      <div className="flex items-start md:col-span-2">
                        <span className="w-32 text-gray-500 shrink-0">Environmental:</span>
                        <span className="text-green-400 font-medium">{opp.estimated_environmental_opportunity}</span>
                      </div>
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
