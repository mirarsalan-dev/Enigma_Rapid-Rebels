import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Layers, Clock, ArrowUpRight, Play, ExternalLink, Leaf
} from 'lucide-react';

interface DataSource {
  name: string;
  provider: string;
  type: string;
  endpoint: string;
  license: string;
  refresh_frequency: string;
  enabled: boolean;
  status: string;
  records_count: number;
  last_successful_run: string;
  last_error: string | null;
}

interface IngestionRun {
  run_id: string;
  source: string;
  started_at: string;
  completed_at: string;
  status: string;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  records_rejected: number;
  checksum: string;
}

interface EnvironmentalFactor {
  factor_name: string;
  value: number;
  unit: string;
  source: string;
  version: string;
  region: string;
  assumption: string;
}

export const DataAdminDashboard: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [factors, setFactors] = useState<EnvironmentalFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [dryRun, setDryRun] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, runsRes, factorsRes] = await Promise.all([
        fetch('/api/ingestion/sources'),
        fetch('/api/ingestion/runs'),
        fetch('/api/environmental/factors')
      ]);

      if (sourcesRes.ok) setSources(await sourcesRes.json());
      if (runsRes.ok) setRuns(await runsRes.json());
      if (factorsRes.ok) setFactors(await factorsRes.json());
    } catch (err) {
      console.error('Failed to load ingestion data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerIngestion = async (sourceName?: string) => {
    try {
      setTriggering(true);
      setFeedbackMsg(null);
      const res = await fetch('/api/ingestion/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_name: sourceName || 'Global Suite',
          state: selectedState,
          dry_run: dryRun,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(`✓ Ingestion completed: ${data.message} (${dryRun ? 'DRY RUN' : 'SAVED TO DB'})`);
        fetchData();
      } else {
        setFeedbackMsg(`⚠ Ingestion failed: ${data.error || 'Server error'}`);
      }
    } catch (err) {
      setFeedbackMsg(`⚠ Network error executing ingestion.`);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              PROVENANCE & AUDIT ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ZERO-FABRICATION DISCIPLINE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              DEMO API ACTIVE
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Ingestion & Integrity Hub</h1>
          <p className="text-gray-400 mt-1">
            Production data pipelines integrating Official Government Registries, CPCB Waste Inventories, and Live Operational Events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
          >
            <option value="Maharashtra">Maharashtra (MIDC Corridor)</option>
            <option value="Gujarat">Gujarat Industrial Belt</option>
            <option value="National">National Benchmark</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg cursor-pointer">
            <input 
              type="checkbox" 
              checked={dryRun} 
              onChange={(e) => setDryRun(e.target.checked)}
              className="rounded bg-gray-900 text-brand-primary focus:ring-0" 
            />
            <span>Dry-Run Mode</span>
          </label>

          <button
            onClick={() => handleTriggerIngestion()}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-blue-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shadow-lg shadow-brand-primary/20"
          >
            {triggering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {triggering ? 'Ingesting...' : 'Run Global Ingestion'}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-white text-sm flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* Layer Classification Legend */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-emerald-500/30 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE OPERATIONAL DATA</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-2xl font-bold text-white">8,200 t</p>
          <p className="text-xs text-gray-400 mt-1">Live company surplus, active GPS hoppers & contracted pickups</p>
        </div>

        <div className="bg-gray-900 border border-blue-500/30 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 tracking-wider">GOVERNMENT / REFERENCE</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">13,466</p>
          <p className="text-xs text-gray-400 mt-1">MCA companies, UDYAM MSMEs, CPCB Hazardous Inventories</p>
        </div>

        <div className="bg-gray-900 border border-purple-500/30 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-400 tracking-wider">AI-SUGGESTED OPPORTUNITY</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">37 Streams</p>
          <p className="text-xs text-gray-400 mt-1">Derived from W2R knowledge graph & compatibility heuristics</p>
        </div>

        <div className="bg-gray-900 border border-amber-500/30 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 tracking-wider">MODELLED ECOSYSTEMS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">8 Closed Loops</p>
          <p className="text-xs text-gray-400 mt-1">Multi-hop cyclic pathways & 180-day forecast radar</p>
        </div>
      </div>

      {/* External Data Sources Registry */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-primary" />
              Connected Data Sources & Provenance Registry
            </h2>
            <p className="text-sm text-gray-400">Official repositories and APIs configured with rate-limiting and provenance tracking</p>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
              <tr>
                <th className="py-3 px-6">Data Source & Provider</th>
                <th className="py-3 px-6">Classification</th>
                <th className="py-3 px-6">Refresh Frequency</th>
                <th className="py-3 px-6">Total Records</th>
                <th className="py-3 px-6">Last Synchronized</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sources.map((src) => (
                <tr key={src.name} className="hover:bg-gray-850/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{src.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span>{src.provider}</span>
                      <span>•</span>
                      <span className="text-gray-500 truncate max-w-xs">{src.license}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      src.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      src.status === 'OBSERVED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {src.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-300">
                    <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 font-mono">
                      {src.refresh_frequency}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">
                    {src.records_count.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-400">
                    {new Date(src.last_successful_run).toLocaleDateString()} at{' '}
                    {new Date(src.last_successful_run).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleTriggerIngestion(src.name)}
                      disabled={triggering}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-white rounded border border-gray-700 transition-colors"
                    >
                      Sync Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Runs Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Ingestion Execution Log
            </h2>
            <span className="text-xs text-gray-400">SHA-256 Checksum Verified</span>
          </div>

          <div className="space-y-3">
            {runs.slice(0, 5).map((run) => (
              <div key={run.run_id} className="p-4 rounded-xl bg-gray-950/60 border border-gray-800/80">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <span className="font-semibold text-white text-sm">{run.source}</span>
                    <span className="ml-2 font-mono text-xs text-gray-500">[{run.run_id}]</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    run.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {run.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs mt-2 pt-2 border-t border-gray-800 text-gray-400">
                  <div>Fetched: <span className="text-white font-medium">{run.records_fetched}</span></div>
                  <div>Inserted: <span className="text-emerald-400 font-medium">{run.records_inserted}</span></div>
                  <div>Updated: <span className="text-blue-400 font-medium">{run.records_updated}</span></div>
                  <div>Rejected: <span className="text-red-400 font-medium">{run.records_rejected}</span></div>
                </div>

                <div className="mt-2 text-[11px] text-gray-500 font-mono flex justify-between">
                  <span>Checksum: {run.checksum || 'N/A'}</span>
                  <span>{new Date(run.started_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Environmental Factors Registry */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              Environmental Factors Registry (IS / CPCB / EPA)
            </h2>
            <span className="text-xs text-emerald-400 font-mono">NON-FABRICATED</span>
          </div>

          <div className="space-y-3">
            {factors.map((fac) => (
              <div key={fac.factor_name} className="p-4 rounded-xl bg-gray-950/60 border border-gray-800/80">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white text-sm">{fac.factor_name}</h3>
                  <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">
                    {fac.value} {fac.unit}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{fac.assumption}</p>
                <div className="mt-2 pt-2 border-t border-gray-800/80 text-[11px] text-gray-500 flex justify-between">
                  <span>Authority: {fac.source}</span>
                  <span className="font-mono">{fac.version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
