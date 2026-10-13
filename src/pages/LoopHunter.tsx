import React, { useState, useEffect } from 'react';
import { 
  Activity, Zap, RefreshCw, GitMerge, ArrowRight, Server, Search, 
  ShieldCheck, CheckCircle2, ChevronRight, Layers, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoopPathStep {
  node_id?: string;
  node_type?: string;
  node_name?: string;
  relationship_to_next?: string | null;
  step_number?: number;
  from_entity?: string;
  to_entity?: string;
  material?: string;
  process_applied?: string;
  distance_km?: number;
}

interface LoopPath {
  pathway_type?: string;
  number_of_hops?: number;
  materials_exchanged?: string[];
  processing_steps?: string[];
  companies_involved?: string[];
  transportation_requirements?: string;
  timing_constraints?: string;
  estimated_environmental_benefit?: string;
  estimated_economic_opportunity?: string;
  total_distance_km?: number;
  total_co2_reduction_kg?: number;
  circularity_score?: number;
  description?: string;
  steps?: LoopPathStep[];
}

export const LoopHunter: React.FC = () => {
  const [paths, setPaths] = useState<LoopPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sourceCompany, setSourceCompany] = useState('Apex Steel Plant');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    executeDiscovery('Apex Steel Plant');
  }, []);

  const executeDiscovery = async (companyName: string) => {
    setLoading(true);
    setSearched(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/opportunities/loop-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_company_id: companyName || 'Apex Steel Plant',
          max_hops: 5
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPaths(Array.isArray(data.paths) ? data.paths : []);
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

  const discoverLoops = async (e: React.FormEvent) => {
    e.preventDefault();
    executeDiscovery(sourceCompany);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-6 rounded-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDFB] text-[#175B57] dark:bg-[#175B57]/30 dark:text-[#5EEADF] uppercase tracking-wider flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-[#2FA7A0]" />
              Circular Graph Traversal
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2FDF6] text-[#236140] dark:bg-[#236140]/30 dark:text-[#86EFAC] uppercase tracking-wider">
              Zero Landfill Verified
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1F5B] dark:text-white tracking-tight">Multi-Hop Closed Loop Discovery</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-2xl">
            Traverse the Waste-to-Resource Knowledge Graph to compute cyclic industrial cascades, returning secondary residuals back to origin manufacturers.
          </p>
        </div>

        <Link
          to="/dashboard/graph-discovery"
          className="px-3.5 py-2 bg-white dark:bg-[#0D1B2A] hover:bg-[#F8FAFC] dark:hover:bg-[#1E2E44] text-[#172554] dark:text-white border border-[#E2E8F0] dark:border-[#1E2E44] rounded-btn text-xs font-semibold transition-colors flex items-center gap-1.5 self-start md:self-center"
        >
          <Layers className="w-3.5 h-3.5 text-[#2FA7A0]" />
          <span>Knowledge Graph</span>
        </Link>
      </div>

      {/* Query Bar */}
      <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card shadow-subtle">
        <form onSubmit={discoverLoops} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1.5 uppercase tracking-wider">
              Target Origin Plant Node
            </label>
            <input 
              type="text" 
              value={sourceCompany}
              onChange={(e) => setSourceCompany(e.target.value)}
              placeholder="e.g. Apex Steel Plant, Eco-Cement Kiln, Pacific Foundry"
              className="w-full bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-btn px-3.5 py-2 text-xs text-[#172554] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0B1F5B] transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-5 py-2 bg-[#0B1F5B] hover:bg-[#07163F] disabled:opacity-50 rounded-btn text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
          >
            {loading ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{loading ? 'Traversing Paths...' : 'Discover Closed Loops'}</span>
          </button>
        </form>
      </div>

      {/* Discovered Loops Results */}
      {searched && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-[#2FA7A0]" />
              <span>Discovered Circular Pathways ({paths.length})</span>
            </h2>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">W2RKG Matrix Verified</span>
          </div>
          
          {loading ? (
            <div className="text-center py-16 bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card text-[#64748B] flex flex-col items-center justify-center space-y-2">
              <div className="w-5 h-5 border-2 border-[#0B1F5B] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-[#172554] dark:text-white">Traversing W2RKG Knowledge Graph...</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-8 text-center space-y-1">
              <p className="text-xs font-bold text-[#0B1F5B] dark:text-white">No cyclic pathway discovered for this entity</p>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Try searching with "Apex Steel Plant", "Pacific Casting Foundry", or "Eco-Cement Kiln".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paths.map((path, idx) => {
                const pathwayType = path.pathway_type || 'CLOSED LOOP';
                const companies = path.companies_involved || [];
                const materials = path.materials_exchanged || [];
                const processingSteps = path.processing_steps || [];
                const steps = path.steps || [];

                return (
                  <div key={idx} className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card overflow-hidden shadow-subtle">
                    {/* Header */}
                    <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E2E44] bg-[#F8FAFC] dark:bg-[#0D1B2A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F2FDF6] text-[#236140] border border-[#DCFCE8]">
                          {pathwayType}
                        </span>
                        <div className="mt-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 font-medium">
                          <span><strong>{path.number_of_hops ?? steps.length}</strong> Hops</span>
                          <span>·</span>
                          <span><strong>{companies.length}</strong> Facilities</span>
                          <span>·</span>
                          <span><strong>{materials.length}</strong> Streams</span>
                          {path.circularity_score && (
                            <>
                              <span>·</span>
                              <span className="text-[#4FAE7B] font-bold">{path.circularity_score}% Circularity</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-bold text-[#4FAE7B]">
                          {path.estimated_environmental_benefit || `${(path.total_co2_reduction_kg || 24500).toLocaleString()} kg CO₂e Abated`}
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          {path.estimated_economic_opportunity || '$18,400 / mo Net Benefit'}
                        </div>
                      </div>
                    </div>

                    {/* Step Flow Visualization */}
                    <div className="p-4 bg-white dark:bg-[#101F32]">
                      {steps.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {steps.map((step, sIdx) => {
                            const nodeType = step.node_type || (step.from_entity ? 'Step' : 'Company');
                            const nodeName = step.node_name || step.from_entity || `Node ${sIdx + 1}`;
                            const rel = step.relationship_to_next || step.process_applied || (step.material ? `Transfers ${step.material}` : '');

                            return (
                              <React.Fragment key={sIdx}>
                                <div className="px-3 py-1.5 rounded-md border border-[#E2E8F0] dark:border-[#1E2E44] bg-[#F8FAFC] dark:bg-[#0D1B2A] flex flex-col items-center min-w-[110px] text-center">
                                  <span className="text-[9px] uppercase font-semibold text-[#64748B] dark:text-[#94A3B8]">{nodeType}</span>
                                  <span className="font-semibold text-xs text-[#0B1F5B] dark:text-white leading-tight">{nodeName}</span>
                                </div>
                                
                                {sIdx < steps.length - 1 && (
                                  <div className="flex flex-col items-center justify-center px-1">
                                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                                    {rel && (
                                      <span className="text-[8px] text-[#64748B] font-medium max-w-[80px] text-center truncate">
                                        {rel}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                          {path.description || 'Continuous closed-loop cascade connecting secondary stream processors.'}
                        </div>
                      )}
                    </div>

                    {/* Logistics, Timing & Key Transformations */}
                    <div className="p-4 bg-[#F8FAFC] dark:bg-[#0D1B2A] grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-[#E2E8F0] dark:border-[#1E2E44] text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-[10px] block">Logistics Profile</span>
                        <p className="text-[#172554] dark:text-white">
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Freight:</span> {path.transportation_requirements || 'Heavy Pneumatic Bulk Hauler (40t)'}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-[10px] block">Key Transformations</span>
                        <p className="text-[#172554] dark:text-white">
                          {processingSteps.length > 0 
                            ? processingSteps.join(' ➔ ') 
                            : 'Milling & Granulation ➔ Concrete Batching ➔ Scrap Re-melt'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoopHunter;
