import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, RefreshCcw } from 'lucide-react';

interface NodeData {
  id: string;
  type: string;
  properties: Record<string, any>;
}

interface EdgeData {
  relationship: string;
  source_type: string;
}

interface PathStep {
  id: string;
  type: string;
  properties: Record<string, any>;
  edge_to_next?: EdgeData;
}

type Path = PathStep[];

export const GraphDiscovery: React.FC = () => {
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'hops' | 'loops'>('hops');
  const [sourceId, setSourceId] = useState('Steel Industry');
  const [targetId, setTargetId] = useState('BuildRight Construction');
  const [hops, setHops] = useState(3);
  const [maxLoopLength, setMaxLoopLength] = useState(5);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      let url = '';
      if (mode === 'hops') {
        url = `http://localhost:8000/api/graph/discover/hop?source_id=${encodeURIComponent(sourceId)}&target_id=${encodeURIComponent(targetId)}&hops=${hops}`;
      } else {
        url = `http://localhost:8000/api/graph/discover/closed-loops?max_length=${maxLoopLength}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setPaths(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching graph data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Industry': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'Material': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'Process': return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'Application': return 'bg-pink-100 border-pink-500 text-pink-800';
      case 'Company': return 'bg-green-100 border-green-500 text-green-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getEdgeColor = (sourceType: string) => {
    if (sourceType === 'ai_suggested') return 'text-purple-600 border-purple-600';
    if (sourceType === 'externally_discovered') return 'text-orange-600 border-orange-600';
    return 'text-gray-600 border-gray-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Network className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Waste-to-Resource Knowledge Graph (W2RKG)</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Discovery Mode</label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            >
              <option value="hops">N-Hop Pathways</option>
              <option value="loops">Closed Loops</option>
            </select>
          </div>

          {mode === 'hops' && (
            <>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Node</label>
                <input 
                  type="text" 
                  value={sourceId} 
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Node</label>
                <input 
                  type="text" 
                  value={targetId} 
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hops</label>
                <input 
                  type="number" 
                  min="1" max="5"
                  value={hops} 
                  onChange={(e) => setHops(parseInt(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border w-24"
                />
              </div>
            </>
          )}

          {mode === 'loops' && (
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Loop Length</label>
              <input 
                type="number" 
                min="2" max="10"
                value={maxLoopLength} 
                onChange={(e) => setMaxLoopLength(parseInt(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border w-24"
              />
            </div>
          )}

          <div className="w-full md:w-auto pb-1">
            <button 
              onClick={fetchPaths}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Discover</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Discovered Pathways ({paths.length})
        </h2>
        
        {paths.length === 0 && !loading && (
          <div className="text-center p-12 bg-gray-50 rounded-lg text-gray-500 border border-dashed border-gray-300">
            No pathways found. Try adjusting the parameters.
          </div>
        )}

        {paths.map((path, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <div className="flex items-center min-w-max space-x-4">
              {path.map((step, stepIdx) => (
                <React.Fragment key={stepIdx}>
                  {/* Node */}
                  <div className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 min-w-[120px] ${getNodeColor(step.type)}`}>
                    <span className="text-xs uppercase font-bold opacity-75 mb-1">{step.type}</span>
                    <span className="text-sm font-semibold text-center">{step.properties?.name || step.id}</span>
                  </div>
                  
                  {/* Edge to next */}
                  {step.edge_to_next && (
                    <div className="flex flex-col items-center justify-center px-2">
                      <span className={`text-xs font-semibold mb-1 uppercase tracking-wide ${getEdgeColor(step.edge_to_next.source_type)}`}>
                        {step.edge_to_next.relationship}
                      </span>
                      <div className="flex items-center w-full">
                        <div className={`h-0.5 w-full border-t-2 border-dashed flex-grow ${getEdgeColor(step.edge_to_next.source_type)}`}></div>
                        <ArrowRight className={`w-5 h-5 -ml-1 ${getEdgeColor(step.edge_to_next.source_type)}`} />
                      </div>
                      <span className={`text-[10px] mt-1 ${getEdgeColor(step.edge_to_next.source_type)} opacity-75`}>
                        ({step.edge_to_next.source_type})
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
