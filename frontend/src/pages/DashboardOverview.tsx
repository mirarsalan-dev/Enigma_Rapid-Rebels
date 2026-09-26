import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, ArrowRightRight, TrendingUp } from 'lucide-react';

export const DashboardOverview = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {currentUser?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-gray-400">Here is your industrial symbiosis summary for today.</p>
        </div>
        <button className="px-4 py-2 bg-brand-primary hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
          Add Resource Stream
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">Active Exchanges</h3>
            <ArrowRightRight className="text-brand-primary w-5 h-5" />
          </div>
          <p className="text-4xl font-bold text-white">12</p>
          <p className="text-sm text-green-400 mt-2">+3 this month</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">CO2 Saved (Tons)</h3>
            <Leaf className="text-brand-accent w-5 h-5" />
          </div>
          <p className="text-4xl font-bold text-white">450.5</p>
          <p className="text-sm text-green-400 mt-2">+12% vs last month</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">AI Match Score</h3>
            <TrendingUp className="text-purple-400 w-5 h-5" />
          </div>
          <p className="text-4xl font-bold text-white">94%</p>
          <p className="text-sm text-gray-400 mt-2">Based on current streams</p>
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Discover New Opportunities</h3>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">
          The SYMBIO AI engine has identified 5 new potential industrial matches for your by-products within a 50-mile radius.
        </p>
        <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 font-medium transition-colors">
          View Recommendations
        </button>
      </div>
    </div>
  );
};
