import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Activity, Database, Globe, Building2, TrendingUp, AlertTriangle } from 'lucide-react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AnalyticsMetrics {
  resource_generated: number;
  resource_exchanged: number;
  resource_diverted: number;
  active_exchanges: number;
  successful_exchanges: number;
  failed_exchanges: number;
  average_opportunity_score: number;
  potential_environmental_benefit: number;
  avg_transport_distance: number;
  material_stagnation_volume: number;
}

interface AnalyticsChartData {
  resource_flow: ChartDataPoint[];
  industry_participation: ChartDataPoint[];
  exchange_volume: ChartDataPoint[];
  material_categories: ChartDataPoint[];
  monthly_trends: ChartDataPoint[];
  opportunity_pipeline: ChartDataPoint[];
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
      const response = await fetch(`http://localhost:8000/api/analytics/${scope}${companyId}`);
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

  const renderSimpleBarChart = (title: string, chartData: ChartDataPoint[], icon: React.ReactNode) => {
    if (!chartData || chartData.length === 0) return (
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">{icon} <span className="ml-2">{title}</span></h3>
        <p className="text-gray-500 italic">No chart data available</p>
      </div>
    );
    
    const maxVal = Math.max(...chartData.map(d => d.value));
    
    return (
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">{icon} <span className="ml-2">{title}</span></h3>
        <div className="space-y-4">
          {chartData.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{d.label}</span>
                <span className="font-bold text-white">{d.value}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-brand-primary h-2 rounded-full" 
                  style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <BarChart3 className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white">SYMBIO Analytics</h1>
        </div>

        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setScope('company')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${scope === 'company' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Building2 className="w-4 h-4 mr-2" /> Company
          </button>
          <button 
            onClick={() => setScope('ecosystem')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${scope === 'ecosystem' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Database className="w-4 h-4 mr-2" /> Ecosystem
          </button>
          <button 
            onClick={() => setScope('platform')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${scope === 'platform' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Globe className="w-4 h-4 mr-2" /> Platform
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading metrics...</div>
      ) : !data || !data.has_data ? (
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-2xl text-center">
          <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No data available</h2>
          <p className="text-gray-400">There are not enough records in the {scope} scope to generate analytics.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-brand-primary">
              <p className="text-sm text-gray-400 font-medium mb-1">Resource Generated</p>
              <h3 className="text-2xl font-bold text-white">{data.metrics.resource_generated.toLocaleString()} <span className="text-sm font-normal text-gray-500">tonnes</span></h3>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-brand-accent">
              <p className="text-sm text-gray-400 font-medium mb-1">Resource Exchanged</p>
              <h3 className="text-2xl font-bold text-white">{data.metrics.resource_exchanged.toLocaleString()} <span className="text-sm font-normal text-gray-500">tonnes</span></h3>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-green-500">
              <p className="text-sm text-gray-400 font-medium mb-1">Diverted from Disposal</p>
              <h3 className="text-2xl font-bold text-white">{data.metrics.resource_diverted.toLocaleString()} <span className="text-sm font-normal text-gray-500">tonnes</span></h3>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl border-l-4 border-l-green-400">
              <p className="text-sm text-gray-400 font-medium mb-1">Potential Env. Benefit</p>
              <h3 className="text-2xl font-bold text-white">{data.metrics.potential_environmental_benefit.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg CO₂e</span></h3>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active</p>
              <p className="text-xl font-bold text-blue-400">{data.metrics.active_exchanges}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Successful</p>
              <p className="text-xl font-bold text-green-400">{data.metrics.successful_exchanges}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Failed</p>
              <p className="text-xl font-bold text-red-400">{data.metrics.failed_exchanges}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Avg Opp Score</p>
              <p className="text-xl font-bold text-yellow-400">{(data.metrics.average_opportunity_score * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Avg Distance</p>
              <p className="text-xl font-bold text-white">{data.metrics.avg_transport_distance.toFixed(1)} km</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stagnation</p>
              <p className="text-xl font-bold text-orange-400">{data.metrics.material_stagnation_volume} t</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSimpleBarChart("Material Categories", data.charts.material_categories, <PieChart className="w-5 h-5 text-brand-primary" />)}
            {renderSimpleBarChart("Monthly Trends", data.charts.monthly_trends, <TrendingUp className="w-5 h-5 text-brand-accent" />)}
            {renderSimpleBarChart("Resource Flow", data.charts.resource_flow, <Activity className="w-5 h-5 text-green-400" />)}
            {renderSimpleBarChart("Industry Participation", data.charts.industry_participation, <Building2 className="w-5 h-5 text-blue-400" />)}
          </div>
        </div>
      )}
    </div>
  );
};
