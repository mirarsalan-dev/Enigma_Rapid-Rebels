import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, PhoneCall, ShieldCheck, Send, CheckCircle2, 
  Smartphone, AlertTriangle, Radio, RefreshCw, Bot,
  Zap, Copy, Check, Terminal
} from 'lucide-react';

interface TwilioConfig {
  configured: boolean;
  isLive: boolean;
  accountSidMasked: string;
  phoneNumber: string;
  defaultTo?: string;
  defaultCallUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'voice' | 'dispatch' | 'whatsapp' | 'verify' | 'bot'>('voice');
  const [copiedSid, setCopiedSid] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Form states - Preloaded with the user's specific credentials
  const defaultToPhone = '+919869108305';
  const defaultFromPhone = '+17372508034';
  const defaultWebhookUrl = 'https://webhooks.twilio.com/v1/Voice/Template/voice_speech_recognition';

  const [voiceTo, setVoiceTo] = useState(defaultToPhone);
  const [voiceFrom, setVoiceFrom] = useState(defaultFromPhone);
  const [voiceCallMode, setVoiceCallMode] = useState<'webhook' | 'tts'>('webhook');
  const [voiceCallUrl, setVoiceCallUrl] = useState(defaultWebhookUrl);
  const [voiceAlert, setVoiceAlert] = useState('Hazardous Byproduct Transit Corridor Deviation');
  const [voiceFacility, setVoiceFacility] = useState('Apex Metallurgy Industrial Cluster');
  const [lastCallResult, setLastCallResult] = useState<any>(null);

  const [smsTo, setSmsTo] = useState(defaultToPhone);
  const [smsDriver, setSmsDriver] = useState('Rajesh Kumar (Truck #LA-4829)');
  const [smsConsignment, setSmsConsignment] = useState('SY-892');
  const [smsMessage, setSmsMessage] = useState('SYMBIO Dispatch: 24.5 MT Granulated Blast Furnace Slag loaded at Apex Steel. Dest: Eco-Cement Kiln #2. Weighbridge Pass: #849201. Route: https://symbio.eco/route/SY-892');

  const [waTo, setWaTo] = useState(defaultToPhone);
  const [waConsignment, setWaConsignment] = useState('CP-8402');
  const [waMaterial, setWaMaterial] = useState('Recycled Steel Slag Aggregate');
  const [waCo2, setWaCo2] = useState(14200);

  const [otpPhone, setOtpPhone] = useState(defaultToPhone);
  const [otpConsignment, setOtpConsignment] = useState('SY-WEIGH-501');
  const [otpInput, setOtpInput] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [otpVerificationResult, setOtpVerificationResult] = useState<any>(null);

  const [inboundFrom, setInboundFrom] = useState(defaultToPhone);
  const [inboundCommand, setInboundCommand] = useState('STATUS');
  const [inboundChannel, setInboundChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [inboundResult, setInboundResult] = useState<any>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const curlCommandString = `curl -X POST "https://api.twilio.com/2010-04-01/Accounts/${config?.accountSidMasked || 'YOUR_ACCOUNT_SID'}/Calls.json" \\
-H "Content-Type: application/x-www-form-urlencoded" \\
-d "To=${encodeURIComponent(voiceTo)}" \\
-d "From=${encodeURIComponent(voiceFrom)}" \\
-d "Url=${encodeURIComponent(voiceCallUrl)}" \\
-u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"`;

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/twilio/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.defaultTo) {
          setVoiceTo(data.defaultTo);
          setSmsTo(data.defaultTo);
          setWaTo(data.defaultTo);
          setOtpPhone(data.defaultTo);
          setInboundFrom(data.defaultTo);
        }
        if (data.phoneNumber) {
          setVoiceFrom(data.phoneNumber);
        }
        if (data.defaultCallUrl) {
          setVoiceCallUrl(data.defaultCallUrl);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/twilio/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, [fetchConfig, fetchLogs]);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleTriggerVoiceCall = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLastCallResult(null);
    try {
      const res = await fetch('/api/twilio/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: voiceTo,
          from: voiceFrom,
          alert_type: voiceAlert,
          facility_name: voiceFacility,
          url: voiceCallMode === 'webhook' ? voiceCallUrl : undefined,
        }),
      });
      const data = await res.json();
      setLastCallResult(data);
      if (res.ok && data.success) {
        showNotification(`Twilio Voice Call initiated to ${data.recipient || voiceTo}! Call SID: ${data.sid}`);
      } else {
        showNotification(`Voice Call status: ${data.error || data.message || 'Call queued'}`);
      }
      fetchLogs();
    } catch (err: any) {
      console.error(err);
      showNotification(`Voice Call Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
        setOtpInput(data.otpCode);
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

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommandString);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-[#1D4ED8] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold border border-blue-400">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {/* Header Banner - White, Blue, Black Palette */}
      <div className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] p-6 rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#E0EBFF] dark:bg-[#1D4ED8]/20 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[#1D4ED8]/40 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-pulse"></span>
              TWILIO TELEPHONY & DISPATCH
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-gray-200 border border-[#E2E8F0] dark:border-gray-700 font-mono">
              SID: ACb79f94...09e8
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              LIVE REST API READY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            Twilio Telephony & Emergency Voice Center
          </h1>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Enterprise voice speech recognition calling, driver SMS dispatch, WhatsApp material manifests, and zero-trust weighbridge 2FA verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchConfig();
              fetchLogs();
            }}
            className="px-3.5 py-2 bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-[#0F172A] dark:text-white text-xs font-semibold rounded-lg border border-[#E2E8F0] dark:border-gray-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" /> Refresh Logs
          </button>
          <button
            onClick={() => handleTriggerVoiceCall()}
            disabled={loading}
            className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-60 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            {loading ? 'Dialing Twilio API...' : 'Call +919869108305'}
          </button>
        </div>
      </div>

      {/* Twilio Telephony & Channel Status Cards - Clean White & Blue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Outbound Voice Call Engine */}
        <div className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Voice Outbound Caller</span>
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-[#0F172A] dark:text-white font-mono">{voiceFrom}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#1D4ED8] dark:text-blue-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Targets: {voiceTo}
          </div>
        </div>

        {/* Card 2: Driver SMS Line */}
        <div className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">SMS Dispatch Line</span>
            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-300">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-[#0F172A] dark:text-white font-mono">{config?.phoneNumber || voiceFrom}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Turn-by-Turn Route Notifications
          </div>
        </div>

        {/* Card 3: WhatsApp Verified Manifest */}
        <div className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">WhatsApp Business</span>
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-bold text-[#0F172A] dark:text-white font-mono truncate">{config?.whatsappNumber || 'whatsapp:+14155238886'}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Digital Material Passports
          </div>
        </div>

        {/* Card 4: Weighbridge 2FA Verify */}
        <div className="bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">Weighbridge Gate 2FA</span>
            <div className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-[#0F172A] dark:text-white">Zero-Trust Pass</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <Radio className="w-3 h-3" /> Tare Weight Authorization
          </div>
        </div>
      </div>

      {/* Main Action Launchpad & Log Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Control Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-6 shadow-sm flex flex-col">
          {/* Feature Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4 mb-6">
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'voice' 
                  ? 'bg-[#1D4ED8] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-gray-700'
              }`}
            >
              <PhoneCall className="w-4 h-4" /> Voice Call (Curl Credentials)
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'dispatch' 
                  ? 'bg-[#1D4ED8] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Driver SMS Dispatch
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'whatsapp' 
                  ? 'bg-[#1D4ED8] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Manifest
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'verify' 
                  ? 'bg-[#1D4ED8] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-gray-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Weighbridge 2FA OTP
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'bot' 
                  ? 'bg-[#1D4ED8] text-white shadow-sm' 
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white border border-[#E2E8F0] dark:border-gray-700'
              }`}
            >
              <Bot className="w-4 h-4" /> Inbound Bot
            </button>
          </div>

          {/* TAB: Voice Call with User's Exact Credentials & Curl */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Credentials & Curl Execution Box */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#070B16] border border-[#CBD5E1] dark:border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#1D4ED8]" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                      Live Twilio API Credentials & Outbound Command
                    </span>
                  </div>
                  <button
                    onClick={copyCurl}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-gray-700 text-xs font-medium text-[#0F172A] dark:text-white hover:bg-slate-50 transition-colors"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#1D4ED8]" />
                        <span>Copy curl</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preformatted curl code */}
                <pre className="p-3 bg-[#0F172A] text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                  {curlCommandString}
                </pre>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-gray-800">
                    <span className="block text-[10px] text-[#64748B]">Account SID</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white truncate block">ACb79f94...09e8</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-gray-800">
                    <span className="block text-[10px] text-[#64748B]">Caller ID (From)</span>
                    <span className="font-mono font-bold text-[#1D4ED8] dark:text-blue-400 block">+17372508034</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-gray-800">
                    <span className="block text-[10px] text-[#64748B]">Destination (To)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">{voiceTo}</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-gray-800">
                    <span className="block text-[10px] text-[#64748B]">Dialog Template</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white block truncate">voice_speech_recognition</span>
                  </div>
                </div>
              </div>

              {/* Call Result Box */}
              {lastCallResult && (
                <div className={`p-4 rounded-xl border ${
                  lastCallResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {lastCallResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                      <span>{lastCallResult.message || lastCallResult.error}</span>
                    </div>
                    {lastCallResult.sid && (
                      <span className="px-2 py-0.5 bg-white dark:bg-black/50 rounded text-[11px] font-mono font-bold border border-current">
                        SID: {lastCallResult.sid}
                      </span>
                    )}
                  </div>
                  {lastCallResult.liveCallResult && (
                    <div className="mt-2 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-current/20">
                      <div>Status: <span className="font-bold">{lastCallResult.liveCallResult.status}</span></div>
                      <div>To: <span>{lastCallResult.liveCallResult.to}</span></div>
                      <div>From: <span>{lastCallResult.liveCallResult.from}</span></div>
                      <div>Created: <span>{new Date().toLocaleTimeString()}</span></div>
                    </div>
                  )}
                </div>
              )}

              {/* Form to Customize and Execute Call */}
              <form onSubmit={handleTriggerVoiceCall} className="space-y-4">
                <div className="flex gap-2 p-1 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setVoiceCallMode('webhook')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-all ${
                      voiceCallMode === 'webhook'
                        ? 'bg-[#1D4ED8] text-white shadow-sm'
                        : 'text-[#475569] dark:text-gray-300 hover:text-[#0F172A]'
                    }`}
                  >
                    Voice Speech Recognition Webhook (Standard Template)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceCallMode('tts')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition-all ${
                      voiceCallMode === 'tts'
                        ? 'bg-[#1D4ED8] text-white shadow-sm'
                        : 'text-[#475569] dark:text-gray-300 hover:text-[#0F172A]'
                    }`}
                  >
                    Industrial Anomaly Alert (Custom Text-to-Speech)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">
                      Recipient Phone Number (To)
                    </label>
                    <input
                      type="text"
                      value={voiceTo}
                      onChange={(e) => setVoiceTo(e.target.value)}
                      placeholder="+919869108305"
                      className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">
                      Twilio Caller ID (From)
                    </label>
                    <input
                      type="text"
                      value={voiceFrom}
                      onChange={(e) => setVoiceFrom(e.target.value)}
                      placeholder="+17372508034"
                      className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none"
                      required
                    />
                  </div>
                </div>

                {voiceCallMode === 'webhook' ? (
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">
                      Twilio Voice Webhook URL
                    </label>
                    <input
                      type="text"
                      value={voiceCallUrl}
                      onChange={(e) => setVoiceCallUrl(e.target.value)}
                      placeholder="https://webhooks.twilio.com/v1/Voice/Template/voice_speech_recognition"
                      className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none"
                      required
                    />
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Twilio dials the phone number and executes the interactive voice speech recognition instructions provided by this URL.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Facility Name</label>
                        <input
                          type="text"
                          value={voiceFacility}
                          onChange={(e) => setVoiceFacility(e.target.value)}
                          className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#1D4ED8]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Critical Anomaly Type</label>
                        <select
                          value={voiceAlert}
                          onChange={(e) => setVoiceAlert(e.target.value)}
                          className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#1D4ED8]"
                        >
                          <option value="Hazardous Byproduct Transit Corridor Deviation">Hazardous Byproduct Transit Corridor Deviation</option>
                          <option value="Thermal Runaway Warning at Slag Storage Silo">Thermal Runaway Warning at Slag Storage Silo</option>
                          <option value="Uncertified Heavy Haul Tare Weight Discrepancy">Uncertified Heavy Haul Tare Weight Discrepancy</option>
                          <option value="Environmental Compliance Gate Blockade">Environmental Compliance Gate Blockade</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs text-[#1D4ED8] dark:text-blue-300">
                      <span className="font-bold block mb-1">Synthesized Voice Message Preview:</span>
                      "This is an automated safety alert from the SYMBIO Industrial Symbiosis Monitoring System. Alert: {voiceAlert} detected at {voiceFacility}..."
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:opacity-50 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  {loading ? 'Dialing Twilio Voice API...' : `Execute Twilio Call to ${voiceTo} Now`}
                </button>
              </form>
            </div>
          )}

          {/* TAB: SMS Driver Dispatch */}
          {activeTab === 'dispatch' && (
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1D4ED8]" /> Dispatch Haulage Alert via Twilio SMS
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Sends route parameters, weighbridge pass code, and GPS geofence targets to driver mobile phones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={smsTo}
                    onChange={(e) => setSmsTo(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#1D4ED8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Assigned Driver & Vehicle</label>
                  <input
                    type="text"
                    value={smsDriver}
                    onChange={(e) => setSmsDriver(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#1D4ED8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Consignment ID</label>
                <input
                  type="text"
                  value={smsConsignment}
                  onChange={(e) => setSmsConsignment(e.target.value)}
                  className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#1D4ED8]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">SMS Message Content</label>
                <textarea
                  rows={3}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#1D4ED8]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> {loading ? 'Dispatching SMS...' : 'Send SMS via Twilio'}
              </button>
            </form>
          )}

          {/* TAB: WhatsApp Verified Manifest */}
          {activeTab === 'whatsapp' && (
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Digital Material Manifest
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Transmits formatted ESG proof, avoided CO₂e certificates, and QR gate clearance codes directly to receiving plant engineers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Recipient WhatsApp Mobile</label>
                  <input
                    type="text"
                    value={waTo}
                    onChange={(e) => setWaTo(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Consignment ID</label>
                  <input
                    type="text"
                    value={waConsignment}
                    onChange={(e) => setWaConsignment(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Material Stream</label>
                  <input
                    type="text"
                    value={waMaterial}
                    onChange={(e) => setWaMaterial(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">CO₂e Avoided (kg)</label>
                  <input
                    type="number"
                    value={waCo2}
                    onChange={(e) => setWaCo2(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block mb-1">Template Preview:</span>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 font-mono whitespace-pre-line leading-relaxed">
                  🌱 *SYMBIO Material Manifest*
                  • Consignment: *#{waConsignment}*
                  • Material: *{waMaterial}*
                  • Avoided CO₂e: *{(waCo2 / 1000).toFixed(1)} Tons*
                  • Track: https://symbio.eco/live/{waConsignment}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> {loading ? 'Dispatching WhatsApp...' : 'Send WhatsApp via Twilio'}
              </button>
            </form>
          )}

          {/* TAB: Weighbridge 2FA OTP */}
          {activeTab === 'verify' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Weighbridge Gate Pass 2FA (Twilio Verify)
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Enforces zero-trust material handoffs by generating a time-limited 6-digit OTP sent to driver scale operators to authorize cargo weighbridge dumping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Scale Operator / Driver Mobile</label>
                  <input
                    type="text"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Consignment ID</label>
                  <input
                    type="text"
                    value={otpConsignment}
                    onChange={(e) => setOtpConsignment(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" /> {dispatchedOtp ? 'Resend New 6-Digit OTP via Twilio' : 'Dispatch 6-Digit Gate Pass OTP'}
              </button>

              {dispatchedOtp && (
                <form onSubmit={handleVerifyOtp} className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Enter Received OTP Code:</span>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono font-bold">Generated: {dispatchedOtp}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 849201"
                      className="flex-1 bg-white dark:bg-[#101F32] border border-indigo-400 rounded-lg p-2.5 text-center text-base font-bold font-mono tracking-widest text-[#0F172A] dark:text-white outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verify Pass
                    </button>
                  </div>
                </form>
              )}

              {otpVerificationResult && (
                <div className={`p-3.5 rounded-lg border text-xs ${
                  otpVerificationResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-300' 
                    : 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-900 dark:text-red-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {otpVerificationResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{otpVerificationResult.message || otpVerificationResult.error}</span>
                  </div>
                  {otpVerificationResult.certificate_hash && (
                    <div className="text-[11px] font-mono mt-1 text-[#64748B]">
                      Digital Certificate: <span className="font-bold text-[#0F172A] dark:text-white">{otpVerificationResult.certificate_hash}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Inbound Bot Simulator */}
          {activeTab === 'bot' && (
            <form onSubmit={handleSimulateInbound} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#1D4ED8]" /> Inbound SMS / WhatsApp Auto-Responder Bot
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Test two-way driver communications. Haulers can text STATUS, ARRIVED, SCALE 42.8T, or DELAY to trigger automated ledger updates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Channel</label>
                  <select
                    value={inboundChannel}
                    onChange={(e) => setInboundChannel(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white outline-none focus:border-[#1D4ED8]"
                  >
                    <option value="SMS">Twilio SMS</option>
                    <option value="WHATSAPP">Twilio WhatsApp</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    value={inboundFrom}
                    onChange={(e) => setInboundFrom(e.target.value)}
                    className="w-full bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#1D4ED8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0F172A] dark:text-white mb-1">Driver Text Command</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inboundCommand}
                    onChange={(e) => setInboundCommand(e.target.value)}
                    placeholder="e.g. STATUS, ARRIVED GATE 2, SCALE 42.5T, DELAY 20M"
                    className="flex-1 bg-white dark:bg-[#101F32] border border-[#CBD5E1] dark:border-gray-700 rounded-lg p-2.5 text-xs text-[#0F172A] dark:text-white font-mono outline-none focus:border-[#1D4ED8]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['STATUS', 'ARRIVED GATE 2', 'SCALE 42.8T', 'DELAY 25 MINS'].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => setInboundCommand(cmd)}
                      className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-slate-200 text-[#0F172A] dark:text-gray-300 text-[10px] rounded font-mono border border-[#E2E8F0] dark:border-gray-700 transition-colors"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>

              {inboundResult && (
                <div className="p-3.5 bg-slate-50 dark:bg-[#101F32] rounded-lg border border-[#E2E8F0] dark:border-gray-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#64748B]">
                    <span>Twilio Auto-Responder Output:</span>
                    <span className="font-mono text-emerald-600 font-bold">200 OK</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-black rounded border border-[#E2E8F0] dark:border-gray-800 text-xs text-[#0F172A] dark:text-emerald-400 font-mono">
                    {inboundResult.bot_reply}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right Live Twilio Communications Audit Stream - Clean White Card */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-6 shadow-sm flex flex-col h-full max-h-[640px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-[#0F172A] dark:text-white text-sm">Twilio Telephony & Comms Stream</h3>
              <p className="text-[11px] text-[#64748B]">{logs.length} logged messages & transactions</p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-slate-100 text-[#0F172A] dark:text-gray-300 rounded border border-[#E2E8F0] dark:border-gray-700 text-xs transition-colors"
              title="Refresh Stream"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-[#F8FAFC] dark:bg-[#101F32] rounded-lg border border-[#E2E8F0] dark:border-gray-800 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.channel === 'VOICE' ? 'bg-red-50 text-red-700 border border-red-200' :
                      log.channel === 'SMS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      log.channel === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {log.channel}
                    </span>
                    <span className="text-[10px] font-medium text-[#64748B]">
                      {log.direction === 'OUTBOUND' ? '↗ OUT' : '↙ IN'}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {log.status}
                  </span>
                </div>

                <p className="text-xs text-[#0F172A] dark:text-slate-200 font-sans leading-relaxed line-clamp-3">
                  {log.body}
                </p>

                <div className="pt-1.5 border-t border-[#E2E8F0] dark:border-gray-800 flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                  <button
                    onClick={() => copySid(log.sid)}
                    className="flex items-center gap-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <span>{log.sid}</span>
                    {copiedSid === log.sid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 text-[#94A3B8] text-xs">
                No Twilio messages recorded yet. Trigger one using the control panel!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
