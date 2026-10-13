import React, { useState, useEffect } from 'react';
import { 
  Factory, MapPin, Phone, CheckCircle, Clock, Search, 
  Building2, ShieldCheck, Mail, Globe, Sparkles, Filter, ExternalLink 
} from 'lucide-react';

interface ContactInfo {
  email: string;
  phone: string | null;
  website: string | null;
}

interface Company {
  company_id: string;
  name: string;
  industry: string;
  address: string;
  contact_information: ContactInfo;
  verification_status: string;
  capabilities: string[];
}

export const IndustrialDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/companies/');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const industries = ['ALL', ...Array.from(new Set(companies.map(c => c.industry).filter(Boolean)))];

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.address.toLowerCase().includes(search.toLowerCase()) ||
                          c.capabilities.some(cap => cap.toLowerCase().includes(search.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-6 rounded-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0EBFF] text-[#0B1F5B] dark:bg-[#0B1F5B]/50 dark:text-[#94BAFF] uppercase tracking-wider flex items-center gap-1">
              <Factory className="w-3.5 h-3.5" />
              Verified Facility Master Directory
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2FDF6] text-[#236140] dark:bg-[#236140]/30 dark:text-[#86EFAC] uppercase tracking-wider">
              CPCB / UDYAM Registry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1F5B] dark:text-white tracking-tight">
            Industrial Facility Network
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Registered steel mills, cement kilns, thermal power plants, and certified byproduct valorization hubs.
          </p>
        </div>

        <div className="px-3.5 py-2 bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-lg text-xs text-right">
          <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase font-semibold">Active Entities</span>
          <span className="text-lg font-bold text-[#0B1F5B] dark:text-white font-mono">{filteredCompanies.length} / {companies.length}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-4 rounded-card shadow-subtle">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:flex-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, location, or processing capability..."
              className="w-full bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-btn pl-9 pr-3.5 py-2 text-xs text-[#172554] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0B1F5B]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedIndustry === ind
                    ? 'bg-[#0B1F5B] text-white border-[#0B1F5B]'
                    : 'bg-[#F8FAFC] dark:bg-[#0D1B2A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#172554] border-[#E2E8F0] dark:border-[#1E2E44]'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#64748B] flex flex-col items-center justify-center space-y-2">
          <div className="w-5 h-5 border-2 border-[#0B1F5B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">Loading industrial facility master...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] rounded-card p-10 text-center space-y-1">
          <Factory className="w-8 h-8 text-[#94A3B8] mx-auto mb-1" />
          <h3 className="text-sm font-bold text-[#0B1F5B] dark:text-white">No facilities match search criteria</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Try clearing your search query or selecting another industry category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div 
              key={company.company_id} 
              className="bg-white dark:bg-[#101F32] border border-[#E2E8F0] dark:border-[#1E2E44] p-5 rounded-card flex flex-col justify-between transition-colors shadow-subtle hover:border-[#CBD5E1]"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F5B] dark:text-white">
                      {company.name}
                    </h3>
                    <span className="inline-block px-2 py-0.2 bg-[#F1F5F9] dark:bg-[#1E2E44] text-[#0B1F5B] dark:text-[#94BAFF] text-[10px] font-semibold rounded mt-1">
                      {company.industry}
                    </span>
                  </div>

                  {company.verification_status === 'verified' ? (
                    <div className="p-1 rounded bg-[#F2FDF6] text-[#236140]" title="CPCB Verified Facility">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-[#FEF9EE] text-[#D6A43A]" title="Pending Audit">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs text-[#64748B] dark:text-[#94A3B8] pt-2 border-t border-[#F1F5F9] dark:border-[#1E2E44]">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
                    <span className="leading-snug">{company.address}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                    <span className="font-mono text-[11px]">{company.contact_information.phone || company.contact_information.email}</span>
                  </div>
                </div>
              </div>

              {company.capabilities && company.capabilities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#1E2E44]">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider font-semibold block mb-1.5">
                    Processing Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {company.capabilities.map((cap, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 bg-[#F8FAFC] dark:bg-[#0D1B2A] border border-[#E2E8F0] dark:border-[#1E2E44] text-[#172554] dark:text-[#F8FAFC] text-[10px] font-medium rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndustrialDashboard;
