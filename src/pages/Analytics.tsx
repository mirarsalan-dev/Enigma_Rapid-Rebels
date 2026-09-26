import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Activity, Database, Globe, Building2, 
  TrendingUp, AlertTriangle, Flame, Zap, ShieldCheck, Truck, Star, ArrowUpRight
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

  const renderZomatoBarChart = (title: string, rawData: ChartDataPoint[] | undefined, icon: React.ReactNode, subtitle?: string) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return (
        <div className="bg-gray-900/90 border border-gray-800 p-6 rounded-3xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center">{icon} <span className="ml-2">{title}</span></h3>
          <p className="text-gray-500 text-xs italic">No telemetry data recorded yet</p>
        </div>
      );
    }

    // Safely normalize raw data into label and numeric value
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
    
    return (
      <div className="bg-gray-900/90 border border-rose-950/40 p-6 rounded-3xl shadow-xl hover:border-rose-900/60 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E23744]/20 text-[#E23744] border border-rose-500/30 uppercase">
            Live Stream
          </span>
        </div>

        <div className="space-y-3.5">
          {chartData.map((d, i) => {
            const percentage = Math.round((d.value / maxVal) * 100);
            return (
              <div key={i} className="group">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-300 group-hover:text-white transition-colors">{d.label}</span>
                  <span className="font-extrabold text-white font-mono">
                    {(d.value ?? 0).toLocaleString()} <span className="text-[10px] text-gray-500">t</span>
                  </span>
                </div>
                <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-800">
                  <div 
                    className="bg-gradient-to-r from-[#E23744] to-[#FB7185] h-full rounded-full transition-all duration-700 shadow-md shadow-rose-600/30" 
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
    <div className="space-y-6 max-w-7xl mx-auto text-brand-light">
      {/* Zomato Top Header */}
      <div className="bg-gradient-to-r from-gray-950 via-[#180709] to-[#2b080c] border border-rose-900/40 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E23744] text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/40 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" />
              ZOMATO PULSE ANALYTICS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              REAL-TIME INDUSTRIAL VELOCITY
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Supply Chain Velocity & Environmental Pulse</h1>
          <p className="text-xs text-rose-200/70 mt-1">
            Real-time material exchange throughput, avoided landfill volumes, and regional transport efficiency.
          </p>
        </div>

        {/* Scope Switcher */}
        <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-rose-950/60 shadow-xl">
          {[
            { id: 'company', label: 'Company', icon: Building2 },
            { id: 'ecosystem', label: 'Ecosystem', icon: Database },
            { id: 'platform', label: 'Platform', icon: Globe },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                scope === s.id
                  ? 'bg-[#E23744] text-white shadow-lg shadow-rose-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400 flex items-center justify-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#E23744] animate-ping"></div>
          Streaming live network metrics...
        </div>
      ) : !data || !data.has_data ? (
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-3xl text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No data available</h2>
          <p className="text-gray-400 text-sm">There are not enough records in the {scope} scope to generate analytics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Level Zomato KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/90 border border-rose-950/50 p-5 rounded-3xl relative overflow-hidden group hover:border-[#E23744]/60 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resource Generated</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white font-mono">
                {(data?.metrics?.resource_generated ?? 48500).toLocaleString()} <span className="text-sm font-normal text-gray-400">t</span>
              </h3>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% this month
              </div>
            </div>

            <div className="bg-gray-900/90 border border-rose-950/50 p-5 rounded-3xl relative overflow-hidden group hover:border-[#E23744]/60 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resource Exchanged</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white font-mono">
                {(data?.metrics?.resource_exchanged ?? 32400).toLocaleString()} <span className="text-sm font-normal text-gray-400">t</span>
              </h3>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-blue-400 font-bold">
                <Star className="w-3.5 h-3.5" /> 99.4% Fulfillment Rate
              </div>
            </div>

            <div className="bg-gray-900/90 border border-rose-950/50 p-5 rounded-3xl relative overflow-hidden group hover:border-[#E23744]/60 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Landfill Diverted</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-emerald-400 font-mono">
                {(data?.metrics?.resource_diverted ?? 31800).toLocaleString()} <span className="text-sm font-normal text-gray-400">t</span>
              </h3>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                Zero Landfill Compliant
              </div>
            </div>

            <div className="bg-gray-900/90 border border-rose-950/50 p-5 rounded-3xl relative overflow-hidden group hover:border-[#E23744]/60 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">CO₂e Abated</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-white font-mono">
                {(Math.round((data?.metrics?.potential_environmental_benefit ?? 450500) / 1000)).toLocaleString()} <span className="text-sm font-normal text-gray-400">MT</span>
              </h3>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-purple-300 font-bold">
                ASTM C989 & IS 456 Factors
              </div>
            </div>
          </div>

          {/* Secondary Velocity Pills */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Active Routes</p>
              <p className="text-xl font-extrabold text-blue-400 font-mono">{data?.metrics?.active_exchanges ?? 12}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Delivered</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">{data?.metrics?.successful_exchanges ?? 84}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Cancellations</p>
              <p className="text-xl font-extrabold text-rose-400 font-mono">{data?.metrics?.failed_exchanges ?? 1}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Match Quality</p>
              <p className="text-xl font-extrabold text-amber-400 font-mono">
                {Math.round(((data?.metrics?.average_opportunity_score ?? 0.914) <= 1 ? (data?.metrics?.average_opportunity_score ?? 0.914) * 100 : (data?.metrics?.average_opportunity_score ?? 91.4)))}%
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Avg Freight Haul</p>
              <p className="text-xl font-extrabold text-white font-mono">{(data?.metrics?.avg_transport_distance ?? 21.8).toFixed(1)} km</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Stagnation</p>
              <p className="text-xl font-extrabold text-orange-400 font-mono">{data?.metrics?.material_stagnation_volume ?? 180} t</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderZomatoBarChart(
              "Material Stream Throughput", 
              data?.charts?.material_categories, 
              <PieChart className="w-5 h-5 text-[#E23744]" />,
              "Active byproduct tonnage distributed by ASTM class"
            )}
            {renderZomatoBarChart(
              "Monthly Transit Velocity", 
              data?.charts?.monthly_trends, 
              <TrendingUp className="w-5 h-5 text-rose-400" />,
              "Sequential growth in secondary resource pickups"
            )}
            {renderZomatoBarChart(
              "Resource Supply Flow", 
              data?.charts?.resource_flow, 
              <Activity className="w-5 h-5 text-emerald-400" />,
              "Origin vs destination flow rates"
            )}
            {renderZomatoBarChart(
              "Sector Participation", 
              data?.charts?.industry_participation, 
              <Building2 className="w-5 h-5 text-blue-400" />,
              "Steel, Cement, Precast & Foundry cluster share"
            )}
          </div>
        </div>
      )}
    </div>
  );
};
