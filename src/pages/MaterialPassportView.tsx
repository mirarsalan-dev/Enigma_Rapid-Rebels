import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, User, Sparkles, FileBadge, ArrowDown } from 'lucide-react';

interface PassportDataPoint {
  value: string;
  source_type: string;
}

interface CustodyStep {
  step_type: string;
  entity_name: string;
  timestamp: string;
  location: string;
  notes?: string;
}

interface MaterialPassport {
  passport_id: string;
  material: PassportDataPoint;
  source_company: PassportDataPoint;
  batch: PassportDataPoint;
  quantity: PassportDataPoint;
  composition: PassportDataPoint;
  quality: PassportDataPoint;
  test_status: PassportDataPoint;
  origin: PassportDataPoint;
  destination: PassportDataPoint;
  processing_history: PassportDataPoint[];
  exchange_history: PassportDataPoint[];
  chain_of_custody: CustodyStep[];
  created_at: string;
  updated_at: string;
}

export const MaterialPassportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [passport, setPassport] = useState<MaterialPassport | null>(null);
  const [loading, setLoading] = useState(true);

  // default to mock ID if not provided in route
  const passportId = id || "MP-2026-00124"; 

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const res = await fetch(`/api/passports/${passportId}`);
        const data = await res.json();
        setPassport(data);
      } catch (err) {
        console.error("Failed to fetch passport", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, [passportId]);

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'AI_GENERATED':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
            <Sparkles className="w-3 h-3" /> AI Suggested
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        );
      case 'USER_PROVIDED':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
            <User className="w-3 h-3" /> User Provided
          </span>
        );
      case 'TEST_CERTIFICATE':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium ml-2">
            <FileBadge className="w-3 h-3" /> Test/Certificate
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-8">Loading Digital Passport...</div>;
  if (!passport) return <div className="p-8 text-red-500">Failed to load passport data.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header Section with QR */}
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Digital Material Passport</h1>
            <p className="text-gray-400 font-mono text-lg">ID: {passport.passport_id}</p>
            <p className="text-gray-500 text-sm mt-2">Issued: {new Date(passport.created_at).toLocaleDateString()}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <QRCodeSVG value={`https://symbio.app/passport/${passport.passport_id}`} size={120} />
            <p className="text-gray-900 text-center text-xs mt-2 font-semibold">SCAN TO VERIFY</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Properties */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Material Details</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Material</span>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{passport.material.value}</span>
                  {getSourceBadge(passport.material.source_type)}
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Source Company</span>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{passport.source_company.value}</span>
                  {getSourceBadge(passport.source_company.source_type)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Batch Number</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">{passport.batch.value}</span>
                    {getSourceBadge(passport.batch.source_type)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">{passport.quantity.value}</span>
                    {getSourceBadge(passport.quantity.source_type)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Composition</span>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{passport.composition.value}</span>
                  {getSourceBadge(passport.composition.source_type)}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Quality & Test Status</span>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-900">{passport.quality.value}</span>
                  {getSourceBadge(passport.quality.source_type)}
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{passport.test_status.value}</span>
                  {getSourceBadge(passport.test_status.source_type)}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4 mt-8">Processing & Exchange</h2>
            <div className="space-y-3">
              {passport.processing_history.map((hist, i) => (
                <div key={i} className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">{hist.value}</span>
                  {getSourceBadge(hist.source_type)}
                </div>
              ))}
              {passport.exchange_history.map((hist, i) => (
                <div key={i} className="flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-700">{hist.value}</span>
                  {getSourceBadge(hist.source_type)}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Chain of Custody */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Chain of Custody</h2>
            
            <div className="relative pl-4 space-y-6">
              {/* Vertical line connector */}
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

              {passport.chain_of_custody.map((step, index) => {
                const isLast = index === passport.chain_of_custody.length - 1;
                return (
                  <div key={index} className="relative z-10 flex">
                    <div className="mr-4 mt-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isLast ? 'bg-brand-primary' : 'bg-gray-400'}`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                          {step.step_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(step.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900">{step.entity_name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{step.location}</p>
                      
                      {step.notes && (
                        <p className="text-sm text-gray-500 italic border-l-2 border-gray-300 pl-2 mt-2">
                          "{step.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
