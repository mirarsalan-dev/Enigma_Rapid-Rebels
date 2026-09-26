import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Tag, Plus, Target, CheckCircle, AlertTriangle, ExternalLink, Zap } from 'lucide-react';

interface WasteListing {
  listing_id: string;
  producer_id: string;
  material_id: string;
  quantity: number;
  quality: string;
  availability: string;
  pickup_location: string;
  expected_price: number | null;
  status: string;
}

interface Demand {
  demand_id: string;
  seeker_id: string;
  material_requirements: string;
  quantity: number;
  quality: string;
  location: string;
  time_window: string;
  status: string;
}

interface ExternalMatch {
  company_name: string;
  contact_snippet: string;
  source_url: string;
  match_reason: string;
  verification_status: string;
  disclaimer: string;
}

export const Marketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'supplier' | 'seeker'>('supplier');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [externalMatches, setExternalMatches] = useState<ExternalMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiMatching, setAiMatching] = useState(false);

  // Forms
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    quality: '',
    location: '',
    availability: '', // For supplier
    time_window: '', // For seeker
  });

  useEffect(() => {
    fetchListings();
    fetchDemands();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/waste-listings/');
      if (res.ok) setListings(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchDemands = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/marketplace/demands');
      if (res.ok) setDemands(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSearchAndMatch = async () => {
    if (!searchQuery) return;
    setAiMatching(true);
    setExternalMatches([]);
    try {
      const res = await fetch('http://localhost:8000/api/marketplace/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, type: activeTab })
      });
      if (res.ok) {
        const data = await res.json();
        setExternalMatches(data.external_matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiMatching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (activeTab === 'supplier') {
      // Mock creating a listing
      const newListing = {
        producer_id: "producer_123",
        material_id: formData.material,
        quantity: parseFloat(formData.quantity) || 0,
        quality: formData.quality,
        availability: formData.availability,
        pickup_location: formData.location,
      };
      await fetch('http://localhost:8000/api/waste-listings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      fetchListings();
    } else {
      // Mock creating a demand
      const newDemand = {
        seeker_id: "seeker_123",
        material_requirements: formData.material,
        quantity: parseFloat(formData.quantity) || 0,
        quality: formData.quality,
        location: formData.location,
        time_window: formData.time_window,
      };
      await fetch('http://localhost:8000/api/marketplace/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDemand)
      });
      fetchDemands();
    }
    setShowForm(false);
    setFormData({ material: '', quantity: '', quality: '', location: '', availability: '', time_window: '' });
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-brand-light">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-8 h-8 text-brand-primary" />
          <h1 className="text-2xl font-bold text-white">SYMBIO Marketplace</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-brand-primary hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
        >
          {showForm ? 'Cancel' : (activeTab === 'supplier' ? <><Tag className="w-5 h-5 mr-2" /> List Material</> : <><Target className="w-5 h-5 mr-2" /> Publish Demand</>)}
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => {setActiveTab('supplier'); setExternalMatches([]);}}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'supplier' ? 'bg-brand-primary text-white shadow-lg shadow-blue-900/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          RESOURCE SUPPLIER
        </button>
        <button 
          onClick={() => {setActiveTab('seeker'); setExternalMatches([]);}}
          className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'seeker' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          RESOURCE SEEKER
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            {activeTab === 'supplier' ? 'Create Resource Listing' : 'Publish Resource Demand'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder={activeTab === 'supplier' ? 'Material (e.g. Steel Slag)' : 'Material Requirements'} className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
            <input required type="number" placeholder="Quantity (tons)" className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            <input required type="text" placeholder="Quality/Grade" className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.quality} onChange={e => setFormData({...formData, quality: e.target.value})} />
            <input required type="text" placeholder="Location" className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            {activeTab === 'supplier' ? (
              <input required type="text" placeholder="Availability (e.g. Next 30 days)" className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} />
            ) : (
              <input required type="text" placeholder="Time Window (e.g. Q4 2026)" className="bg-gray-800 text-white px-4 py-2 rounded-lg" value={formData.time_window} onChange={e => setFormData({...formData, time_window: e.target.value})} />
            )}
            
            {activeTab === 'supplier' && (
              <div className="flex items-center text-sm text-gray-400 p-2 border border-gray-800 rounded-lg">
                <input type="checkbox" id="verify" className="mr-2" />
                <label htmlFor="verify">Attach verification/chemical analysis docs (Simulated)</label>
              </div>
            )}
          </div>
          <button type="submit" disabled={loading} className="mt-4 w-full bg-brand-primary text-white py-3 rounded-lg font-bold">
            {loading ? 'Processing...' : (activeTab === 'supplier' ? 'Publish Listing' : 'Publish Demand')}
          </button>
        </form>
      )}

      {/* AI Discovery & Search */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-8 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder={activeTab === 'supplier' ? "Search demands or discover seekers..." : "Search listings or discover suppliers..."}
            className="w-full bg-gray-800 border-none text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-brand-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAndMatch()}
          />
        </div>
        <button className="p-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
          <Filter className="w-5 h-5" />
        </button>
        <button onClick={handleSearchAndMatch} disabled={aiMatching} className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">
          {aiMatching ? 'Matching...' : <><Zap className="w-5 h-5 mr-2" /> AI Match</>}
        </button>
      </div>

      {/* External Matches / Opportunity Discovery */}
      {externalMatches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-400" /> 
            AI Opportunity Discovery (External SerpApi Matches)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {externalMatches.map((match, idx) => (
              <div key={idx} className="bg-gray-800 border border-indigo-900/50 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-indigo-300">{match.company_name}</h3>
                  <a href={match.source_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">{match.verification_status}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2 italic">"{match.contact_snippet}"</p>
                <p className="text-xs text-indigo-200 mb-4 bg-indigo-900/30 p-2 rounded">Match reason: {match.match_reason}</p>
                <div className="bg-orange-900/20 border border-orange-900/50 p-2 rounded text-xs text-orange-200">
                  {match.disclaimer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Listings/Demands Grid */}
      <h2 className="text-xl font-bold text-white mb-4">
        {activeTab === 'supplier' ? 'Active Internal Demands (Opportunities for you)' : 'Active Internal Listings (Supplies for you)'}
      </h2>
      
      {activeTab === 'supplier' ? (
        // SHOW DEMANDS
        demands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No demands found. AI Match to discover external buyers.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demands.map(d => (
              <div key={d.demand_id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl border-t-4 border-t-green-500">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">{d.material_requirements}</h3>
                  <span className="bg-green-900/50 text-green-400 text-xs px-2 py-1 rounded">Demand</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Qty: {d.quantity} | {d.quality}</p>
                <p className="text-sm text-gray-400 mb-3">{d.location} • {d.time_window}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> SYMBIO Verified Partner
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // SHOW LISTINGS
        listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No listings found. AI Match to discover external suppliers.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map(l => (
              <div key={l.listing_id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl border-t-4 border-t-brand-primary">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">{l.material_id}</h3>
                  <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded">Listing</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">Qty: {l.quantity} | {l.quality}</p>
                <p className="text-sm text-gray-400 mb-3">{l.pickup_location} • {l.availability}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> SYMBIO Verified Partner
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
