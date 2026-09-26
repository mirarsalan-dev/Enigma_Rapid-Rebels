import React, { useState, useEffect } from 'react';
import { Factory, MapPin, Phone, CheckCircle, Clock } from 'lucide-react';

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

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/companies/');
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

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Factory className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white">Industrial Network</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading network...</div>
      ) : companies.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <Factory className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No companies found</h3>
          <p className="text-gray-400">Your industrial network is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <div key={company.company_id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{company.name}</h3>
                  {company.verification_status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <span className="inline-block px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs font-medium rounded-full mb-4">
                  {company.industry}
                </span>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{company.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{company.contact_information.phone || company.contact_information.email}</span>
                  </div>
                </div>
              </div>
              
              {company.capabilities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {company.capabilities.map((cap, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
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
