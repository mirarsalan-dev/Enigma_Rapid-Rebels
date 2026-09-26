import React, { useState, useEffect } from 'react';
import { 
  Settings, Building, MessageSquare, Bot, MapPin, ShieldCheck, 
  Save, RefreshCw, CheckCircle2, AlertTriangle, Sliders, Smartphone, Download, Upload
} from 'lucide-react';

interface SymbioSettings {
  organization: {
    company_name: string;
    plant_code: string;
    facility_type: string;
    industry_sector: string;
    contact_email: string;
    headquarters_address: string;
    coordinates: { lat: number; lng: number };
  };
  twilio: {
    default_sms_to: string;
    default_whatsapp_to: string;
    safety_escalation_phone: string;
    enable_otp_weighbridge: boolean;
    otp_expiration_minutes: number;
    auto_notify_on_dispatch: boolean;
  };
  ai_advisor: {
    model: string;
    temperature: number;
    system_instruction: string;
    enable_stream: boolean;
    include_carbon_estimates: boolean;
  };
  gis_routing: {
    max_haul_radius_km: number;
    default_speed_kmh: number;
    prefer_highways: boolean;
    show_hotspot_clusters: boolean;
    osrm_profile: string;
  };
  compliance: {
    strict_cpcb_validation: boolean;
    auto_generate_material_passport: boolean;
    require_lab_moisture_test: boolean;
    alert_on_transit_deviation: boolean;
  };
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SymbioSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'org' | 'twilio' | 'ai' | 'gis' | 'compliance'>('org');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const exportConfig = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symbio-settings-${Date.now()}.json`;
    a.click();
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading platform configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-brand-light">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully and applied across all SYMBIO services!
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/30 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              SYSTEM CONFIGURATION
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings & Telematics Parameters</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage organization metadata, Twilio dispatch lines, Gemini AI Advisor parameters, and GIS routing tolerances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportConfig}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2 bg-brand-primary hover:bg-blue-600 disabled:bg-gray-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        {[
          { id: 'org', name: 'Organization & Plant', icon: Building },
          { id: 'twilio', name: 'Twilio Telematics & SMS', icon: MessageSquare },
          { id: 'ai', name: 'Gemini AI Advisor', icon: Bot },
          { id: 'gis', name: 'GIS & OSRM Routing', icon: MapPin },
          { id: 'compliance', name: 'Compliance & Verification', icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white shadow-lg'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content Panels */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
        {/* TAB 1: Organization & Facility Profile */}
        {activeTab === 'org' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-primary" /> Facility & Organization Profile
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Defines the physical origin and facility identity for material provenance and dispatch certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={settings.organization.company_name}
                  onChange={(e) => setSettings({
                    ...settings,
                    organization: { ...settings.organization, company_name: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Plant / Site Code</label>
                <input
                  type="text"
                  value={settings.organization.plant_code}
                  onChange={(e) => setSettings({
                    ...settings,
                    organization: { ...settings.organization, plant_code: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Industry Sector</label>
                <select
                  value={settings.organization.industry_sector}
                  onChange={(e) => setSettings({
                    ...settings,
                    organization: { ...settings.organization, industry_sector: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="Steel Industry">Steel & Metallurgy</option>
                  <option value="Cement Industry">Cement & Clinker Manufacturing</option>
                  <option value="Construction Industry">Construction & Precast Concrete</option>
                  <option value="Thermal Power">Thermal Power Generation</option>
                  <option value="Recycling & Aggregates">Recycling & Aggregates Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Dispatch Contact Email</label>
                <input
                  type="email"
                  value={settings.organization.contact_email}
                  onChange={(e) => setSettings({
                    ...settings,
                    organization: { ...settings.organization, contact_email: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Facility Physical Address</label>
              <input
                type="text"
                value={settings.organization.headquarters_address}
                onChange={(e) => setSettings({
                  ...settings,
                  organization: { ...settings.organization, headquarters_address: e.target.value }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Twilio Telematics & Telephony */}
        {activeTab === 'twilio' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" /> Twilio Communications & Telematics Hub
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Manage default dispatch lines, automated weighbridge OTP security, and emergency safety voice broadcast rosters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Default Haul Driver SMS Line</label>
                <input
                  type="text"
                  value={settings.twilio.default_sms_to}
                  onChange={(e) => setSettings({
                    ...settings,
                    twilio: { ...settings.twilio, default_sms_to: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Plant WhatsApp Manifest Recipient</label>
                <input
                  type="text"
                  value={settings.twilio.default_whatsapp_to}
                  onChange={(e) => setSettings({
                    ...settings,
                    twilio: { ...settings.twilio, default_whatsapp_to: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Safety Officer Voice Alert Line</label>
                <input
                  type="text"
                  value={settings.twilio.safety_escalation_phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    twilio: { ...settings.twilio, safety_escalation_phone: e.target.value }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twilio.enable_otp_weighbridge}
                  onChange={(e) => setSettings({
                    ...settings,
                    twilio: { ...settings.twilio, enable_otp_weighbridge: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <span className="text-xs text-gray-300">
                  Enforce Twilio Verify 2FA OTP for Tare Scale & Weighbridge Barrier Release
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twilio.auto_notify_on_dispatch}
                  onChange={(e) => setSettings({
                    ...settings,
                    twilio: { ...settings.twilio, auto_notify_on_dispatch: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <span className="text-xs text-gray-300">
                  Automatically send SMS dispatch to driver upon load confirmation in Exchanges
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: Gemini AI Advisor */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-accent" /> Gemini AI Model & Reasoning Parameters
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure generative model temperature, domain reasoning guidelines, and carbon LCA estimation parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Target Generative Model</label>
                <input
                  type="text"
                  disabled
                  value="gemini-3.8-flash (Recommended Standard)"
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-xl p-2.5 text-sm text-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Model Temperature ({settings.ai_advisor.temperature})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.ai_advisor.temperature}
                  onChange={(e) => setSettings({
                    ...settings,
                    ai_advisor: { ...settings.ai_advisor, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-brand-primary mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Default AI System Instruction</label>
              <textarea
                rows={5}
                value={settings.ai_advisor.system_instruction}
                onChange={(e) => setSettings({
                  ...settings,
                  ai_advisor: { ...settings.ai_advisor, system_instruction: e.target.value }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-xs text-gray-200 font-mono focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: GIS & OSRM Routing */}
        {activeTab === 'gis' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" /> Geographic Information System (GIS) & Transit
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure maximum economic haul radiuses, OSRM speed calibration, and symbiosis cluster overlays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Maximum Economic Haul Radius ({settings.gis_routing.max_haul_radius_km} km)
                </label>
                <input
                  type="range"
                  min="25"
                  max="350"
                  step="5"
                  value={settings.gis_routing.max_haul_radius_km}
                  onChange={(e) => setSettings({
                    ...settings,
                    gis_routing: { ...settings.gis_routing, max_haul_radius_km: parseInt(e.target.value) }
                  })}
                  className="w-full accent-brand-primary mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Heavy Haul Average Speed ({settings.gis_routing.default_speed_kmh} km/h)
                </label>
                <input
                  type="number"
                  value={settings.gis_routing.default_speed_kmh}
                  onChange={(e) => setSettings({
                    ...settings,
                    gis_routing: { ...settings.gis_routing, default_speed_kmh: parseInt(e.target.value) }
                  })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gis_routing.show_hotspot_clusters}
                  onChange={(e) => setSettings({
                    ...settings,
                    gis_routing: { ...settings.gis_routing, show_hotspot_clusters: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <span className="text-xs text-gray-300">
                  Render Industrial Hotspot Cluster Overlays on GIS map
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gis_routing.prefer_highways}
                  onChange={(e) => setSettings({
                    ...settings,
                    gis_routing: { ...settings.gis_routing, prefer_highways: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <span className="text-xs text-gray-300">
                  Prefer multi-axle heavy-haul freight corridors over secondary surface roads
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: Compliance & Regulatory Verification */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" /> Regulatory Compliance & Data Provenance
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Enforce CPCB secondary raw material schedules, QR Material Passports, and automated chain of custody audits.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/60 rounded-xl border border-gray-700">
                <input
                  type="checkbox"
                  checked={settings.compliance.strict_cpcb_validation}
                  onChange={(e) => setSettings({
                    ...settings,
                    compliance: { ...settings.compliance, strict_cpcb_validation: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Strict CPCB / ASTM Material Qualification</span>
                  <span className="text-[11px] text-gray-400 block">Requires laboratory test certificate before unlocking marketplace listing.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/60 rounded-xl border border-gray-700">
                <input
                  type="checkbox"
                  checked={settings.compliance.auto_generate_material_passport}
                  onChange={(e) => setSettings({
                    ...settings,
                    compliance: { ...settings.compliance, auto_generate_material_passport: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Automatic Digital Material Passport Issuance</span>
                  <span className="text-[11px] text-gray-400 block">Generates cryptographic QR passport upon exchange contract execution.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/60 rounded-xl border border-gray-700">
                <input
                  type="checkbox"
                  checked={settings.compliance.alert_on_transit_deviation}
                  onChange={(e) => setSettings({
                    ...settings,
                    compliance: { ...settings.compliance, alert_on_transit_deviation: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-primary bg-gray-800 border-gray-700"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Real-Time Geofence Deviation Voice Alert</span>
                  <span className="text-[11px] text-gray-400 block">Triggers emergency Twilio Voice call if driver deviates &gt; 10 km from corridor.</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
