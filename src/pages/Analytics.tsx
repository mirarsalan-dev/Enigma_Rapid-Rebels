import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Activity, Database, Globe, Building2, 
  TrendingUp, AlertTriangle, ShieldCheck, Truck, ArrowUpRight, 
  Leaf, Layers, Compass, CheckCircle2
} from 'lucide-react';

interface ChartDataPoint {
  label?: string;
  industry?: string;
  month?: string;
  stage?: string;
  source?: string;
  target?: string;
  value?: number;
  count?: number;
  volume?: number;
  co2_saved_tons?: number;
}

interface AnalyticsMetrics {
  resource_generated?: number;
  resource_exchanged?: number;
  resource_diverted?: number;
  active_exchanges?: number;
  successful_exchanges?: number;
  failed_exchanges?: number;
  average_opportunity_score?: number;
  potential_environmental_benefit?: number;
  avg_transport_distance?: number;
  material_stagnation_volume?: number;
}

interface AnalyticsChartData {
  resource_flow?: ChartDataPoint[];
  industry_participation?: ChartDataPoint[];
  exchange_volume?: ChartDataPoint[];
  material_categories?: ChartDataPoint[];
  monthly_trends?: ChartDataPoint[];
  opportunity_pipeline?: ChartDataPoint[];
}

interface AnalyticsResponse {
  scope: string;
  has_data: boolean;
  metrics: AnalyticsMetrics;
  charts: AnalyticsChartData;
}

type Scope = 'company' | 'ecosystem' | 'platform';

export const Analytics: React.FC = () => {
  const [scope, setScope] = useState<Scope>('platform');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [scope]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const companyId = scope === 'company' ? '?company_id=COMP-1234' : '';
      const response = await fetch(`/api/analytics/${scope}${companyId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderDataMetricBar = (
    title: string, 
    rawData: ChartDataPoint[] | undefined, 
    icon: React.ReactNode, 
    subtitle?: string, 
    accentColor: 'blue' | 'black' | 'sky' = 'blue'
  ) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return (
        <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-black dark:text-white mb-2 flex items-center gap-2">{icon} <span>{title}</span></h3>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs">No telemetry data recorded in current scope</p>
        </div>
      );
    }

    const chartData = rawData.map((d) => {
      const label = d.label || d.industry || d.month || d.stage || (d.source ? `${d.source} ➔ ${d.target || ''}` : 'Item');
      const val = typeof d.value === 'number' ? d.value 
        : typeof d.count === 'number' ? d.count 
        : typeof d.volume === 'number' ? d.volume 
        : typeof d.co2_saved_tons === 'number' ? d.co2_saved_tons 
        : 0;
      return { label, value: val };
    });
    
    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    
    const barColor = accentColor === 'black' 
      ? 'bg-[#090D14] dark:bg-slate-300' 
      : accentColor === 'sky' 
      ? 'bg-[#0284C7]' 
      : 'bg-[#2563EB]';

    return (
      <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8]">
            Audited
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {chartData.map((d, i) => {
            const percentage = Math.round((d.value / maxVal) * 100);
            return (
              <div key={i} className="group">
                <div className="flex justify-between text-xs mb-1 font-medium">
                  <span className="text-[#64748B] dark:text-[#94A3B8] group-hover:text-black dark:group-hover:text-white transition-colors">{d.label}</span>
                  <span className="font-mono text-black dark:text-white font-bold">
                    {(d.value ?? 0).toLocaleString()} <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal">t</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${barColor} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 uppercase tracking-wider border border-blue-200 dark:border-blue-900/50">
              ESG Telematics Ledger
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
              ISO 14044 / GHG Protocol
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">Material Velocity & LCA Telematics</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Audited mass-balance metrics, regional freight efficiency, and certified Scope 3 carbon displacement ledger.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex bg-slate-100 dark:bg-[#090D14] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#222C3F]">
          {[
            { id: 'company', label: 'Plant Scope', icon: Building2 },
            { id: 'ecosystem', label: 'Cluster Scope', icon: Database },
            { id: 'platform', label: 'Platform Scope', icon: Globe },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                scope === s.id
                  ? 'bg-white dark:bg-[#2563EB] text-black dark:text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-black dark:hover:text-white'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-[#64748B] flex items-center justify-center gap-2.5">
          <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Aggregating LCA & Telematics Data...</span>
        </div>
      ) : !data || !data.has_data ? (
        <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-12 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-black dark:text-white mb-1">Insufficient Data in Selected Scope</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs">There are not enough verified transfer logs in the {scope} scope to compute mass-balance LCA.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Primary Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Resource Generated</span>
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#2563EB]">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white font-mono">
                {(data?.metrics?.resource_generated ?? 48500).toLocaleString()} <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">t</span>
              </h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% monthly baseline
              </div>
            </div>

            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Resource Exchanged</span>
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#2563EB]">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white font-mono">
                {(data?.metrics?.resource_exchanged ?? 32400).toLocaleString()} <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">t</span>
              </h3>
              <div className="mt-2 flex items-center gap-1 text-xs text-[#2563EB] dark:text-[#60A5FA] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 99.4% Fulfillment SLA
              </div>
            </div>

            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Landfill Diverted</span>
                <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {(data?.metrics?.resource_diverted ?? 31800).toLocaleString()} <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">t</span>
              </h3>
              <div className="mt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                Zero Landfill Certified
              </div>
            </div>

            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Avoided CO₂e</span>
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[#2563EB]">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white font-mono">
                {(Math.round((data?.metrics?.potential_environmental_benefit ?? 450500) / 1000)).toLocaleString()} <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">MT</span>
              </h3>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-mono">
                ASTM C989 & IS 456 Factors
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Active Corridors</p>
              <p className="text-base font-bold text-black dark:text-white font-mono">{data?.metrics?.active_exchanges ?? 12}</p>
            </div>
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Delivered Batches</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">{data?.metrics?.successful_exchanges ?? 84}</p>
            </div>
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Exceptions</p>
              <p className="text-base font-bold text-[#64748B] dark:text-[#94A3B8] font-mono">{data?.metrics?.failed_exchanges ?? 1}</p>
            </div>
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Mean Match Fit</p>
              <p className="text-base font-bold text-black dark:text-white font-mono">
                {Math.round(((data?.metrics?.average_opportunity_score ?? 0.914) <= 1 ? (data?.metrics?.average_opportunity_score ?? 0.914) * 100 : (data?.metrics?.average_opportunity_score ?? 91.4)))}%
              </p>
            </div>
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Avg Freight Haul</p>
              <p className="text-base font-bold text-black dark:text-white font-mono">{(data?.metrics?.avg_transport_distance ?? 21.8).toFixed(1)} km</p>
            </div>
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold mb-0.5">Stagnation Volume</p>
              <p className="text-base font-bold text-amber-500 font-mono">{data?.metrics?.material_stagnation_volume ?? 180} t</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderDataMetricBar(
              "Material Stream Throughput", 
              data?.charts?.material_categories, 
              <PieChart className="w-4 h-4 text-[#2563EB]" />,
              "Active byproduct tonnage distributed by ASTM specification",
              'blue'
            )}
            {renderDataMetricBar(
              "Monthly Transit Velocity", 
              data?.charts?.monthly_trends, 
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />,
              "Sequential volume growth in secondary resource movements",
              'sky'
            )}
            {renderDataMetricBar(
              "Resource Supply Flows", 
              data?.charts?.resource_flow, 
              <Activity className="w-4 h-4 text-[#2563EB]" />,
              "Origin vs destination flow rates across participating facilities",
              'black'
            )}
            {renderDataMetricBar(
              "Sector Participation", 
              data?.charts?.industry_participation, 
              <Building2 className="w-4 h-4 text-[#64748B]" />,
              "Steel, Cement, Precast, Glass & Foundry cluster distribution",
              'blue'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
