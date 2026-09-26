import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, PhoneCall, ShieldCheck, Send, CheckCircle2, 
  Smartphone, AlertTriangle, Radio, RefreshCw, Bot, FileText, ArrowRight,
  Zap, Copy, Check
} from 'lucide-react';

interface TwilioConfig {
  configured: boolean;
  isLive: boolean;
  accountSidMasked: string;
  phoneNumber: string;
  whatsappNumber: string;
  hasVerifyService: boolean;
  activeChannels: string[];
}

interface TwilioLogItem {
  id: string;
  sid: string;
  channel: 'SMS' | 'WHATSAPP' | 'VOICE' | 'VERIFY';
  direction: 'OUTBOUND' | 'INBOUND';
  to: string;
  from: string;
  body: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'COMPLETED' | 'VERIFIED';
  created_at: string;
  metadata?: Record<string, any>;
}

export const TwilioHub: React.FC = () => {
  const [config, setConfig] = useState<TwilioConfig | null>(null);
  const [logs, setLogs] = useState<TwilioLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'whatsapp' | 'voice' | 'verify' | 'bot'>('dispatch');
  const [copiedSid, setCopiedSid] = useState<string | null>(null);

  // Form states
  const [smsTo, setSmsTo] = useState('+1 (555) 349-2810');
  const [smsDriver, setSmsDriver] = useState('Rajesh Kumar (Truck #LA-4829)');
  const [smsConsignment, setSmsConsignment] = useState('SY-892');
  const [smsMessage, setSmsMessage] = useState('SYMBIO Dispatch: 24.5 MT Granulated Blast Furnace Slag loaded at Apex Steel. Dest: Eco-Cement Kiln #2. Weighbridge Pass: #849201. Route: https://symbio.eco/route/SY-892');

  const [waTo, setWaTo] = useState('+1 (555) 842-1923');
  const [waConsignment, setWaConsignment] = useState('CP-8402');
  const [waMaterial, setWaMaterial] = useState('Recycled Steel Slag Aggregate');
  const [waCo2, setWaCo2] = useState(14200);

  const [voiceTo, setVoiceTo] = useState('+1 (555) 440-9281');
  const [voiceAlert, setVoiceAlert] = useState('Hazardous Byproduct Transit Corridor Deviation');
  const [voiceFacility, setVoiceFacility] = useState('Apex Metallurgy Industrial Cluster');

  const [otpPhone, setOtpPhone] = useState('+1 (555) 912-3849');
  const [otpConsignment, setOtpConsignment] = useState('SY-WEIGH-501');
  const [otpInput, setOtpInput] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [otpVerificationResult, setOtpVerificationResult] = useState<any>(null);

  const [inboundFrom, setInboundFrom] = useState('+1 (555) 912-3849');
  const [inboundCommand, setInboundCommand] = useState('STATUS');
  const [inboundChannel, setInboundChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [inboundResult, setInboundResult] = useState<any>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/twilio/config');
      if (res.ok) setConfig(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/twilio/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsTo,
          message: smsMessage,
          consignment_id: smsConsignment,
          driver_name: smsDriver,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`SMS sent successfully! SID: ${data.sid}`);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/twilio/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: waTo,
          consignment_id: waConsignment,
          material_name: waMaterial,
          co2_offset_kg: waCo2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`WhatsApp Manifest sent! SID: ${data.sid}`);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerVoiceCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/twilio/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: voiceTo,
          alert_type: voiceAlert,
          facility_name: voiceFacility,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showNotification(`Twilio Automated Voice Call initiated! SID: ${data.sid}`);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setOtpVerificationResult(null);
    try {
      const res = await fetch('/api/twilio/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: otpPhone,
          consignment_id: otpConsignment,
          gate_id: 'Scale-Bay-01',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDispatchedOtp(data.otpCode);
        setOtpInput(data.otpCode); // Pre-fill for instant seamless demo testing
        showNotification(`2FA Weighbridge Pass OTP generated: ${data.otpCode}`);
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/twilio/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: otpPhone,
          otp: otpInput,
          consignment_id: otpConsignment,
        }),
      });
      const data = await res.json();
      setOtpVerificationResult(data);
      if (data.success) {
        showNotification('Weighbridge barrier released & certified in ledger!');
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/twilio/simulate-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: inboundFrom,
          message: inboundCommand,
          channel: inboundChannel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInboundResult(data);
        showNotification('Inbound command handled by SYMBIO Auto-Responder!');
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySid = (sid: string) => {
    navigator.clipboard.writeText(sid);
    setCopiedSid(sid);
    setTimeout(() => setCopiedSid(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-brand-light">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          {actionSuccess}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-brand-primary/20 border border-gray-800 p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              TWILIO COMMUNICATIONS ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {config?.isLive ? 'LIVE TWILIO REST API' : 'SIMULATED DEVELOPER SANDBOX'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Twilio Logistics & Dispatch Center</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Real-time SMS haulage alerts, WhatsApp verifiable manifests, Twilio Verify 2FA gatepasses, and Voice emergency escalation for industrial symbiosis.
          </p>
        </div>

        <button
          onClick={() => {
            fetchConfig();
            fetchLogs();
          }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-2 self-start lg:self-center transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Status
        </button>
      </div>

      {/* Twilio Telephony & Channel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SMS Dispatch Line</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white font-mono">{config?.phoneNumber || '+1 (555) 796-2461'}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-throughput Toll-Free Haulage Line
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Business API</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white font-mono">{config?.whatsappNumber || 'whatsapp:+1 (415) 523-8886'}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Material Passport & Gate QR Dispatch
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Twilio Verify (2FA)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white">Weighbridge Auth</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-300">
            <Radio className="w-3.5 h-3.5" /> Zero-Trust Chain of Custody
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Voice IVR Escalation</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white">Spill / Route Broadcast</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Automated TwiML Audio Dialing
          </div>
        </div>
      </div>

      {/* Main Action Launchpad & Log Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Control Panel */}
        <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col">
          {/* Feature Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'dispatch' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Driver SMS Dispatch
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Manifest
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'verify' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Weighbridge 2FA OTP
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'voice' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4" /> Voice Alert
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                activeTab === 'bot' ? 'bg-amber-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" /> Inbound Bot Simulator
            </button>
          </div>

          {/* TAB 1: SMS Driver Dispatch */}
          {activeTab === 'dispatch' && (
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" /> Dispatch Load Notification to Haulage Driver
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sends immediate route details, tare tare weighbridge pass codes, and destination GPS coordinates directly to the driver's phone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={smsTo}
                    onChange={(e) => setSmsTo(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Assigned Driver & Vehicle</label>
                  <input
                    type="text"
                    value={smsDriver}
                    onChange={(e) => setSmsDriver(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Consignment ID</label>
                <input
                  type="text"
                  value={smsConsignment}
                  onChange={(e) => setSmsConsignment(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">SMS Payload Body</label>
                <textarea
                  rows={3}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-xs text-gray-200 font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Send className="w-4 h-4" /> {loading ? 'Transmitting via Twilio...' : 'Send Driver SMS via Twilio'}
              </button>
            </form>
          )}

          {/* TAB 2: WhatsApp Material Manifest */}
          {activeTab === 'whatsapp' && (
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" /> Send Rich WhatsApp Material Passport
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Dispatches verifiable material manifest to plant engineers with environmental metrics, carbon savings, and QR chain of custody.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Recipient WhatsApp Number</label>
                  <input
                    type="text"
                    value={waTo}
                    onChange={(e) => setWaTo(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Consignment ID</label>
                  <input
                    type="text"
                    value={waConsignment}
                    onChange={(e) => setWaConsignment(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Material Stream</label>
                  <input
                    type="text"
                    value={waMaterial}
                    onChange={(e) => setWaMaterial(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">CO₂e Avoided (kg)</label>
                  <input
                    type="number"
                    value={waCo2}
                    onChange={(e) => setWaCo2(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-800/80 rounded-xl border border-gray-700">
                <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1">Preview WhatsApp Template:</span>
                <p className="text-xs text-emerald-300 font-mono whitespace-pre-line">
                  🌱 *SYMBIO Material Manifest*
                  • Consignment: *#{waConsignment}*
                  • Material: *${waMaterial}*
                  • Avoided CO₂e: *{(waCo2 / 1000).toFixed(1)} Tons*
                  • GPS Track: https://symbio.eco/live/{waConsignment}
                  • Weighbridge Token: *#WB-4892*
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-4 h-4" /> {loading ? 'Transmitting via Twilio WhatsApp...' : 'Dispatch WhatsApp Manifest via Twilio'}
              </button>
            </form>
          )}

          {/* TAB 3: Weighbridge 2FA OTP Verify */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" /> Weighbridge Gate Pass 2FA (Twilio Verify)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enforces zero-trust material handoffs by generating a time-limited 6-digit OTP sent to driver scale operators to authorize cargo weighbridge dumping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Scale Operator / Driver Mobile</label>
                  <input
                    type="text"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Weighbridge Consignment ID</label>
                  <input
                    type="text"
                    value={otpConsignment}
                    onChange={(e) => setOtpConsignment(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> {dispatchedOtp ? 'Resend New 6-Digit OTP via Twilio' : 'Dispatch 6-Digit Gate Pass OTP'}
              </button>

              {dispatchedOtp && (
                <form onSubmit={handleVerifyOtp} className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-300">Enter Received OTP Code:</span>
                    <span className="text-[11px] text-purple-400 font-mono">Sandbox Code: {dispatchedOtp}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 849201"
                      className="flex-1 bg-gray-900 border border-purple-500/50 rounded-xl p-3 text-center text-lg font-bold font-mono tracking-widest text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify Gate Pass
                    </button>
                  </div>
                </form>
              )}

              {otpVerificationResult && (
                <div className={`p-4 rounded-2xl border ${otpVerificationResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-red-950/40 border-red-500/40 text-red-300'}`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {otpVerificationResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {otpVerificationResult.message || otpVerificationResult.error}
                  </div>
                  {otpVerificationResult.certificate_hash && (
                    <div className="text-xs font-mono mt-2 text-gray-400">
                      Immutable Digital Gate Certificate: <span className="text-white">{otpVerificationResult.certificate_hash}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Voice IVR Alert Call */}
          {activeTab === 'voice' && (
            <form onSubmit={handleTriggerVoiceCall} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-red-400" /> Twilio Automated Voice IVR Escalation
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Triggers an automated voice phone call to industrial plant safety directors when hazardous byproduct transit leaks or critical regulatory events occur.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Safety Officer Emergency Line</label>
                  <input
                    type="text"
                    value={voiceTo}
                    onChange={(e) => setVoiceTo(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Industrial Facility / Site</label>
                  <input
                    type="text"
                    value={voiceFacility}
                    onChange={(e) => setVoiceFacility(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Critical Anomaly Type</label>
                <select
                  value={voiceAlert}
                  onChange={(e) => setVoiceAlert(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="Hazardous Byproduct Transit Corridor Deviation">Hazardous Byproduct Transit Corridor Deviation</option>
                  <option value="Thermal Runaway Warning at Slag Storage Silo">Thermal Runaway Warning at Slag Storage Silo</option>
                  <option value="Uncertified Heavy Haul Tare Weight Discrepancy">Uncertified Heavy Haul Tare Weight Discrepancy</option>
                  <option value="Environmental Compliance Gate Blockade">Environmental Compliance Gate Blockade</option>
                </select>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-red-300">
                <span className="font-bold block mb-1">TwiML Text-to-Speech Preview:</span>
                "This is an automated safety alert from the SYMBIO Industrial Symbiosis Monitoring System. Alert: {voiceAlert} detected at {voiceFacility}..."
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <PhoneCall className="w-4 h-4" /> {loading ? 'Dialing via Twilio Voice API...' : 'Initiate Emergency Twilio Voice Call'}
              </button>
            </form>
          )}

          {/* TAB 5: Inbound Driver Bot Simulator */}
          {activeTab === 'bot' && (
            <form onSubmit={handleSimulateInbound} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-400" /> Interactive SMS / WhatsApp Inbound Bot Simulator
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Test two-way driver communications. Haulers can text STATUS, ARRIVED, SCALE 42.8T, or DELAY to trigger automated ledger updates without needing mobile apps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Channel</label>
                  <select
                    value={inboundChannel}
                    onChange={(e) => setInboundChannel(e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SMS">Twilio SMS</option>
                    <option value="WHATSAPP">Twilio WhatsApp</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={inboundFrom}
                    onChange={(e) => setInboundFrom(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Driver Text Command</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inboundCommand}
                    onChange={(e) => setInboundCommand(e.target.value)}
                    placeholder="e.g. STATUS, ARRIVED GATE 2, SCALE 42.5T, DELAY 20M"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send Text
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['STATUS', 'ARRIVED GATE 2', 'SCALE 42.8T', 'DELAY 25 MINS'].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => setInboundCommand(cmd)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] rounded-lg font-mono border border-gray-700 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {inboundResult && (
                <div className="p-4 bg-gray-800 rounded-2xl border border-gray-700 space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Twilio Auto-Responder Output:</span>
                    <span className="font-mono text-emerald-400">200 OK</span>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-xl text-xs text-amber-300 font-mono">
                    {inboundResult.bot_reply}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right Live Twilio Communications Audit Log */}
        <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full max-h-[640px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Twilio Audit Stream</h3>
              <p className="text-xs text-gray-400">{logs.length} logged messages & transactions</p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
              title="Refresh Stream"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-gray-800/80 rounded-2xl border border-gray-700/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.channel === 'SMS' ? 'bg-blue-500/20 text-blue-400' :
                      log.channel === 'WHATSAPP' ? 'bg-emerald-500/20 text-emerald-400' :
                      log.channel === 'VOICE' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {log.channel}
                    </span>
                    <span className={`text-[10px] font-bold ${log.direction === 'OUTBOUND' ? 'text-gray-400' : 'text-amber-400'}`}>
                      {log.direction === 'OUTBOUND' ? '↗ OUT' : '↙ IN'}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {log.status}
                  </span>
                </div>

                <p className="text-xs text-gray-200 font-sans leading-relaxed line-clamp-3">
                  {log.body}
                </p>

                <div className="pt-2 border-t border-gray-700/50 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <button
                    onClick={() => copySid(log.sid)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white"
                  >
                    <span>{log.sid}</span>
                    {copiedSid === log.sid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-xs">
                No Twilio messages recorded yet. Trigger one using the control panel!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
