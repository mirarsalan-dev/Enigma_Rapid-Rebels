import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Factory, ArrowRight, ShieldCheck, 
  Activity, CheckCircle2, ChevronRight, Zap, Database, 
  Truck, Layers, Compass, BarChart3, Sun, Moon, ArrowUpRight,
  FileCheck2, Building2, Sparkles, Check
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'slag' | 'ash' | 'sand'>('slag');
  const { currentTheme, toggleTheme } = useTheme();

  const symbiosisDemos = {
    slag: {
      title: 'Blast Furnace Slag ➔ Eco-Cement Pozzolan',
      generator: 'Apex Metallurgy & Steel Mill',
      receiver: 'Eco-Cement Kiln & Grinding Hub #2',
      process: 'Milling & Water Quenching (GBFS Grade 100)',
      savings: '$18,400 / month',
      abated: '450.5 tCO₂e / mo',
      compliance: 'ASTM C989 Standard Specification',
      flowRate: '1,800 tonnes / month',
      replacement: '35% Virgin Clinker Replacement',
    },
    ash: {
      title: 'Pulverized Fly Ash ➔ Precast Concrete Binder',
      generator: 'Pacific Thermal Power Facility',
      receiver: 'BuildRight Precast Structural Systems',
      process: 'Class F Silo Pneumatic Sieve & Blending',
      savings: '$12,900 / month',
      abated: '320.0 tCO₂e / mo',
      compliance: 'ASTM C618 / IS 3812 Standard',
      flowRate: '1,200 tonnes / month',
      replacement: '28% Portland Cement Replacement',
    },
    sand: {
      title: 'Spent Foundry Sand ➔ Asphalt Hot Mix Base',
      generator: 'Pacific Casting & Metal Foundry',
      receiver: 'CalTrans Pavement Batch Plant #4',
      process: 'Magnetic Separation & Thermal Drying',
      savings: '$9,800 / month',
      abated: '185.2 tCO₂e / mo',
      compliance: 'AASHTO M320 / CPCB Protocol',
      flowRate: '950 tonnes / month',
      replacement: '100% Virgin Silica Aggregate Replacement',
    },
  };

  const currentDemo = symbiosisDemos[activeTab];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D14] text-black dark:text-white font-sans antialiased">
      {/* Top Enterprise Navigation Bar */}
      <header className="px-6 lg:px-12 py-3.5 border-b border-[#E2E8F0] dark:border-[#222C3F] flex justify-between items-center bg-white/95 dark:bg-[#090D14]/95 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-black dark:text-white">
                SYMBIO
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/50 uppercase">
                ESG Intelligence
              </span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-[#64748B] hover:text-black dark:text-[#94A3B8] dark:hover:text-white rounded-md border border-[#E2E8F0] dark:border-[#222C3F]"
            title="Toggle theme"
          >
            {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <Link to="/login" className="text-[#64748B] dark:text-[#94A3B8] hover:text-black dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Enterprise Hero Section */}
        <section className="pt-16 pb-14 px-6 lg:px-12 max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] text-xs font-medium text-black dark:text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            <span>Enterprise Industrial Symbiosis & Scope 3 Abatement Ledger</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-black dark:text-white max-w-4xl mx-auto leading-tight">
            Transform Industrial Waste into <span className="text-[#2563EB]">Verified Secondary Value</span>
          </h1>

          <p className="text-base text-[#64748B] dark:text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            The multi-tier intelligence OS connecting raw industrial byproducts, heavy manufacturing sinks, and certified Scope 3 carbon compliance ledgers.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Platform Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard/loop-hunter"
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-[#131926] hover:bg-slate-50 dark:hover:bg-[#182030] text-black dark:text-white font-semibold text-sm rounded-md border border-[#E2E8F0] dark:border-[#222C3F] shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>View Closed Loop Engine</span>
              <ArrowUpRight className="w-4 h-4 text-[#2563EB]" />
            </Link>
          </div>

          {/* Proof Badges Bar */}
          <div className="pt-8 border-t border-[#E2E8F0] dark:border-[#222C3F] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-lg bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F]">
              <div className="text-2xl font-bold font-mono text-black dark:text-white">450.5 MT</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">CO₂e Abated Monthly</div>
            </div>
            <div className="p-3.5 rounded-lg bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F]">
              <div className="text-2xl font-bold font-mono text-black dark:text-white">96.4%</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">Material Retention Ratio</div>
            </div>
            <div className="p-3.5 rounded-lg bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F]">
              <div className="text-2xl font-bold font-mono text-black dark:text-white">18.4 km</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">Avg Optimal Freight Radius</div>
            </div>
            <div className="p-3.5 rounded-lg bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F]">
              <div className="text-2xl font-bold font-mono text-black dark:text-white">ISO 14044</div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-medium">Audit-Ready LCA Ledgers</div>
            </div>
          </div>
        </section>

        {/* Live Material Valorization Switcher */}
        <section className="py-12 bg-white dark:bg-[#0D131F] border-y border-[#E2E8F0] dark:border-[#222C3F]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Interactive Valorization Proof</span>
              <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
                Engineered Symbiosis Workflows
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Select an industrial stream below to preview certified cascade parameters and Scope 3 avoided carbon metrics.
              </p>
            </div>

            {/* Stream Selector Buttons */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setActiveTab('slag')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  activeTab === 'slag'
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white dark:bg-[#131926] text-black dark:text-white border-[#E2E8F0] dark:border-[#222C3F]'
                }`}
              >
                Blast Furnace Slag
              </button>
              <button
                onClick={() => setActiveTab('ash')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  activeTab === 'ash'
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white dark:bg-[#131926] text-black dark:text-white border-[#E2E8F0] dark:border-[#222C3F]'
                }`}
              >
                Pulverized Fly Ash
              </button>
              <button
                onClick={() => setActiveTab('sand')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors border ${
                  activeTab === 'sand'
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white dark:bg-[#131926] text-black dark:text-white border-[#E2E8F0] dark:border-[#222C3F]'
                }`}
              >
                Foundry Silica Sand
              </button>
            </div>

            {/* Active Demo Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0] dark:border-[#222C3F]">
                <div>
                  <span className="text-[11px] font-semibold text-[#2563EB] block">Verified Secondary Stream</span>
                  <h3 className="text-lg font-bold text-black dark:text-white mt-0.5">{currentDemo.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F] rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">Avoided Carbon</span>
                    <span className="font-mono font-bold text-sm text-[#2563EB]">{currentDemo.abated}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F] rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">Monthly Economic Savings</span>
                    <span className="font-mono font-bold text-sm text-black dark:text-white">{currentDemo.savings}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-xs">
                <div className="space-y-1">
                  <span className="text-[#64748B] text-[11px]">Primary Generator:</span>
                  <p className="font-semibold text-black dark:text-white">{currentDemo.generator}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#64748B] text-[11px]">Secondary Receiver:</span>
                  <p className="font-semibold text-black dark:text-white">{currentDemo.receiver}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#64748B] text-[11px]">ASTM/ISO Standard:</span>
                  <p className="font-mono font-medium text-black dark:text-white">{currentDemo.compliance}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 lg:px-12 border-t border-[#E2E8F0] dark:border-[#222C3F] bg-white dark:bg-[#090D14] text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-black dark:text-white">SYMBIO Enterprise OS</span>
          <span>© 2026 Industrial Symbiosis & ESG Intelligence</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/login" className="hover:text-black dark:hover:text-white">Security & Audits</Link>
          <Link to="/login" className="hover:text-black dark:hover:text-white">CSRD Frameworks</Link>
          <Link to="/login" className="hover:text-black dark:hover:text-white">API Access</Link>
        </div>
      </footer>
    </div>
  );
};
