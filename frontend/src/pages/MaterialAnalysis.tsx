import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MaterialDNA {
  material_name: string;
  source_industry?: string;
  composition?: Record<string, any>;
  physical_properties?: Record<string, any>;
  chemical_properties?: Record<string, any>;
  quantity?: number;
  unit?: string;
  quality_grade?: string;
  moisture?: string;
  contamination_information?: string;
  availability_window?: string;
  location?: string;
  processing_requirements?: string;
  possible_applications?: string[];
  verification_status: string;
  evidence_source?: string;
}

interface AnalysisResponse {
  dna: MaterialDNA;
  disclaimer: string;
}

export const MaterialAnalysis: React.FC = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // In a real app we'd get the auth token and send it in Authorization header
      const response = await fetch('http://localhost:8000/api/materials/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze material');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            SYMBIO AI Material Intelligence
          </h2>
          <p className="mt-3 text-center text-sm text-gray-500 max-w-2xl mx-auto">
            Extract structured Material DNA from industrial material descriptions.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAnalyze}>
          <div>
            <label htmlFor="description" className="sr-only">
              Material Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm shadow-sm transition duration-150 ease-in-out"
              placeholder="e.g. Steel plant generates approximately 500 tonnes/month of granulated blast furnace slag."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition duration-150 ease-in-out shadow-md"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Generate Material DNA'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-10 border-t border-gray-200 pt-8 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              Material DNA
            </h3>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 shadow-inner">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Material Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{result.dna.material_name || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Source Industry</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.dna.source_industry || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">{result.dna.quantity ?? 'N/A'} {result.dna.unit}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${result.dna.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                        result.dna.verification_status === 'PARTIALLY_VERIFIED' ? 'bg-yellow-100 text-yellow-800' : 
                        result.dna.verification_status === 'NEEDS_TESTING' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {result.dna.verification_status}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Possible Applications</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {result.dna.possible_applications && result.dna.possible_applications.length > 0 ? (
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {result.dna.possible_applications.map((app, idx) => (
                          <li key={idx} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm bg-white">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate text-emerald-600 font-medium">{app}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </dd>
                </div>
                
                {/* Advanced Properties (show as JSON for now if present) */}
                {(result.dna.composition || result.dna.physical_properties || result.dna.chemical_properties) && (
                  <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Advanced Properties</dt>
                    <dd className="text-sm text-gray-900">
                      <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-xs shadow-inner">
                        {JSON.stringify({
                          composition: result.dna.composition,
                          physical_properties: result.dna.physical_properties,
                          chemical_properties: result.dna.chemical_properties,
                          quality_grade: result.dna.quality_grade,
                          moisture: result.dna.moisture,
                          contamination_information: result.dna.contamination_information,
                          processing_requirements: result.dna.processing_requirements,
                        }, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800 font-medium">
                    {result.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
