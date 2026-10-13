import React, { useState } from 'react';
import { 
  Network, ArrowRight, RefreshCw, Zap, Sparkles, Truck, 
  Layers, ShieldCheck, CheckCircle2, Compass, 
  MapPin, Clock, Star, ExternalLink, Activity, Database, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface GraphNode {
  id: string;
  name: string;
  type: 'producer' | 'material' | 'processor' | 'receiver' | 'transit';
  category: string;
  rating: number;
  eta: string;
  volume: string;
  co2_saved: string;
  x: number;
  y: number;
  status: 'active' | 'surging' | 'scheduled';
  nodeColor: string;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  transit_time: string;
  distance: string;
  load: string;
  status: 'fast' | 'active' | 'optimal';
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: 'node_steel',
    name: 'Apex Metallurgy & Steel Plant',
    type: 'producer',
    category: 'Source Facility (Generator)',
    rating: 4.9,
    eta: 'Ready Now',
    volume: '3,400 MT/wk',
    co2_saved: '1,840 MT',
    x: 120,
    y: 190,
    status: 'surging',
    nodeColor: '#090D14'
  },
  {
    id: 'node_slag',
    name: 'Granulated Slag (GBFS)',
    type: 'material',
    category: 'Secondary Byproduct Stream',
    rating: 4.8,
    eta: 'Direct Feed',
    volume: '2,800 MT',
    co2_saved: '2,350 MT',
    x: 320,
    y: 110,
    status: 'active',
    nodeColor: '#2563EB'
  },
  {
    id: 'node_flyash',
    name: 'Class F Pulverized Fly Ash',
    type: 'material',
    category: 'Pozzolanic Reactive Byproduct',
    rating: 4.7,
    eta: '5 min Scale Tare',
    volume: '1,950 MT',
    co2_saved: '1,620 MT',
    x: 320,
    y: 280,
    status: 'active',
    nodeColor: '#2563EB'
  },
  {
    id: 'node_granulator',
    name: 'Green Resource Ball Mill & Processor',
    type: 'processor',
    category: 'Intermediate Processing Hub',
    rating: 4.95,
    eta: '18 min Milling',
    volume: '4,100 MT/wk',
    co2_saved: '3,100 MT',
    x: 540,
    y: 190,
    status: 'surging',
    nodeColor: '#0284C7'
  },
  {
    id: 'node_cement',
    name: 'Eco-Cement Kiln #2 (Pasadena)',
    type: 'receiver',
    category: 'Receiving Manufacturer (Cement)',
    rating: 4.9,
    eta: '24 min Delivery',
    volume: '5,000 MT Demand',
    co2_saved: '4,200 MT',
    x: 760,
    y: 110,
    status: 'active',
    nodeColor: '#2563EB'
  },
  {
    id: 'node_precast',
    name: 'BuildRight Precast Structural Systems',
    type: 'receiver',
    category: 'Receiving Manufacturer (Precast)',
    rating: 4.85,
    eta: '32 min Delivery',
    volume: '3,200 MT Demand',
    co2_saved: '2,800 MT',
    x: 760,
    y: 280,
    status: 'active',
    nodeColor: '#2563EB'
  }
];

const INITIAL_LINKS: GraphLink[] = [
  { source: 'node_steel', target: 'node_slag', label: 'EAF Tap Discharge', transit_time: '12 min', distance: '4.2 km', load: '40t Hopper', status: 'optimal' },
  { source: 'node_steel', target: 'node_flyash', label: 'Flue Gas Scrubbing', transit_time: '8 min', distance: '2.8 km', load: '32t Tanker', status: 'fast' },
  { source: 'node_slag', target: 'node_granulator', label: 'Water Quench & Granulation', transit_time: '18 min', distance: '14.5 km', load: 'Heavy Freight', status: 'active' },
  { source: 'node_flyash', target: 'node_granulator', label: 'Alkaline Activation', transit_time: '15 min', distance: '11.0 km', load: 'Pneumatic Tanker', status: 'optimal' },
  { source: 'node_granulator', target: 'node_cement', label: 'ASTM C989 Clinker Blend', transit_time: '24 min', distance: '22.4 km', load: 'Bulk Freight', status: 'fast' },
  { source: 'node_granulator', target: 'node_precast', label: 'Structural Concrete SCM', transit_time: '32 min', distance: '28.1 km', load: 'Precast Batch', status: 'active' },
  { source: 'node_precast', target: 'node_steel', label: 'Scrap Re-melt Closed Loop', transit_time: '35 min', distance: '31.0 km', load: 'Cyclic Loop 🔄', status: 'optimal' }
];

export const GraphDiscovery: React.FC = () => {
  const [nodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [links] = useState<GraphLink[]>(INITIAL_LINKS);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSimulateDispatch = (sourceNode: GraphNode) => {
    showNotification(`Dispatch order created for ${sourceNode.name}. Freight corridor logged to logistics telematics.`);
  };

  const filteredNodes = nodes.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'producers') return n.type === 'producer' || n.type === 'material';
    if (filterType === 'receivers') return n.type === 'receiver' || n.type === 'processor';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold border border-[#E2E8F0] dark:border-[#222C3F]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionNotice}
        </div>
      )}

      {/* Clean Enterprise Header */}
      <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] p-6 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 uppercase tracking-wider">
              Waste-to-Resource Knowledge Graph (W2RKG)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Circularity Index: 96.4%
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">
            Industrial Topology & Material Knowledge Graph
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-2xl">
            Interactive directed graph mapping material transformations, kiln inputs, and cyclic re-melt loops across participating facilities.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#090D14] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#222C3F]">
          {[
            { id: 'all', label: 'All Nodes' },
            { id: 'producers', label: 'Generators & Streams' },
            { id: 'receivers', label: 'Processors & Sinks' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterType === f.id
                  ? 'bg-white dark:bg-[#2563EB] text-black dark:text-white shadow-sm'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-black dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive SVG Graph Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] rounded-xl p-6 shadow-sm relative flex flex-col justify-between overflow-hidden min-h-[500px]">
          <div className="flex justify-between items-center mb-3 z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
              <Network className="w-4 h-4 text-[#2563EB]" />
              <span>Interactive Topology Engine</span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
              6 Active Nodes · 7 Verified Corridors
            </div>
          </div>

          {/* SVG Directed Graph */}
          <svg className="w-full h-80 select-none" viewBox="0 0 880 380">
            <defs>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
              </marker>
              <marker id="arrow-black" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#090D14" />
              </marker>
            </defs>

            {/* Connecting Edges */}
            {links.map((link, idx) => {
              const src = nodes.find((n) => n.id === link.source);
              const tgt = nodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;

              const isLoop = link.label.includes('Closed Loop') || link.source === 'node_precast';
              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2 - (isLoop ? 45 : 0);

              return (
                <g key={idx} className="opacity-85 hover:opacity-100 transition-opacity">
                  <path
                    d={isLoop 
                      ? `M ${src.x} ${src.y} Q ${midX} ${midY + 120} ${tgt.x} ${tgt.y}` 
                      : `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`}
                    fill="none"
                    stroke={isLoop ? '#2563EB' : '#090D14'}
                    strokeWidth={isLoop ? 2 : 1.5}
                    strokeDasharray={isLoop ? '4,4' : 'none'}
                    markerEnd={isLoop ? 'url(#arrow-blue)' : 'url(#arrow-black)'}
                  />
                  {/* Midpoint Label Badge */}
                  <rect
                    x={midX - 45}
                    y={isLoop ? midY + 50 : midY - 10}
                    width={90}
                    height={18}
                    rx={4}
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                  />
                  <text
                    x={midX}
                    y={isLoop ? midY + 62 : midY + 2}
                    fill="#64748B"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {link.label.length > 16 ? link.label.substring(0, 15) + '...' : link.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                >
                  <circle
                    r={isSelected ? 22 : 18}
                    fill={isSelected ? '#2563EB' : '#FFFFFF'}
                    stroke={isSelected ? '#1D4ED8' : node.nodeColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <circle
                    r={isSelected ? 14 : 12}
                    fill={node.nodeColor}
                    opacity={isSelected ? '0.3' : '0.15'}
                  />
                  <text
                    y={32}
                    textAnchor="middle"
                    fill={isSelected ? '#2563EB' : '#090D14'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '600'}
                  >
                    {node.name.length > 18 ? node.name.substring(0, 16) + '...' : node.name}
                  </text>
                  <text
                    y={44}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                  >
                    {node.volume}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Metrics Footer Strip */}
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#222C3F] flex flex-wrap items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#090D14]"></span>
                <span>Generators</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                <span>Streams / Sinks</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]"></span>
                <span>Processors</span>
              </span>
            </div>
            <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              Closed Loop SLA: Active
            </div>
          </div>
        </div>

        {/* Right Inspection Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#222C3F]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {selectedNode.category}
                  </span>
                  <h3 className="text-base font-bold text-black dark:text-white mt-0.5">
                    {selectedNode.name}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F]">
                  <span className="text-[10px] text-[#64748B] block">Throughput / Volume</span>
                  <span className="font-mono font-bold text-black dark:text-white text-sm">{selectedNode.volume}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#090D14] border border-[#E2E8F0] dark:border-[#222C3F]">
                  <span className="text-[10px] text-[#64748B] block">Avoided Scope 3 CO₂</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{selectedNode.co2_saved}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0] dark:border-[#222C3F]">
                  <span className="text-[#64748B]">Fulfillment Window:</span>
                  <span className="font-semibold text-black dark:text-white">{selectedNode.eta}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E8F0] dark:border-[#222C3F]">
                  <span className="text-[#64748B]">Audited Grade:</span>
                  <span className="font-mono font-medium text-black dark:text-white">ASTM C989 / ISO 14044</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#64748B]">Verified Match Rating:</span>
                  <span className="font-bold text-black dark:text-white">{selectedNode.rating} / 5.0</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleSimulateDispatch(selectedNode)}
                  className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-md text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Initiate Freight Dispatch</span>
                </button>
                <Link
                  to="/dashboard/loop-hunter"
                  className="w-full py-2 bg-white dark:bg-[#090D14] hover:bg-slate-50 dark:hover:bg-[#182030] text-black dark:text-white border border-[#E2E8F0] dark:border-[#222C3F] rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Model Cascading Loops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#131926] border border-[#E2E8F0] dark:border-[#222C3F] rounded-xl p-8 text-center text-xs text-[#64748B]">
              Select a node on the canvas to inspect mass-balance and logistics telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphDiscovery;
