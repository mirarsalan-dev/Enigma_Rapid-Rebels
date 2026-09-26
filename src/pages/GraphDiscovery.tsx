import React, { useState, useEffect } from 'react';
import { 
  Network, ArrowRight, RefreshCw, Zap, Sparkles, Truck, 
  Layers, ShieldCheck, CheckCircle2, Send, Flame, Compass, 
  MapPin, Clock, Star, ExternalLink, Activity
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
  icon: string;
  color: string;
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
    category: 'Source Hub (Producer)',
    rating: 4.9,
    eta: 'Ready Now',
    volume: '3,400 MT/wk',
    co2_saved: '1,840 MT',
    x: 120,
    y: 190,
    status: 'surging',
    icon: '🏭',
    color: '#E23744'
  },
  {
    id: 'node_slag',
    name: 'Granulated Slag (GBFS)',
    type: 'material',
    category: 'Secondary Byproduct Stream',
    rating: 4.8,
    eta: 'Instant Transfer',
    volume: '2,800 MT',
    co2_saved: '2,350 MT',
    x: 320,
    y: 110,
    status: 'active',
    icon: '💎',
    color: '#F43F5E'
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
    icon: '⚡',
    color: '#FB7185'
  },
  {
    id: 'node_granulator',
    name: 'Green Resource Ball Mill & Processor',
    type: 'processor',
    category: 'Processing Cloud Hub',
    rating: 4.95,
    eta: '18 min Milling',
    volume: '4,100 MT/wk',
    co2_saved: '3,100 MT',
    x: 540,
    y: 190,
    status: 'surging',
    icon: '⚙️',
    color: '#E11D48'
  },
  {
    id: 'node_cement',
    name: 'Eco-Cement Kiln #2 (Pasadena)',
    type: 'receiver',
    category: 'End Consumer & Clinker Blend',
    rating: 4.9,
    eta: '24 min Delivery',
    volume: '5,000 MT Demand',
    co2_saved: '4,200 MT',
    x: 760,
    y: 110,
    status: 'active',
    icon: '🏗️',
    color: '#BE123C'
  },
  {
    id: 'node_precast',
    name: 'BuildRight Precast Structural Systems',
    type: 'receiver',
    category: 'Precast Infrastructure Yards',
    rating: 4.85,
    eta: '32 min Delivery',
    volume: '3,200 MT Demand',
    co2_saved: '2,800 MT',
    x: 760,
    y: 280,
    status: 'active',
    icon: '🏢',
    color: '#9F1239'
  }
];

const INITIAL_LINKS: GraphLink[] = [
  { source: 'node_steel', target: 'node_slag', label: 'EAF Tap Discharge', transit_time: '12 min', distance: '4.2 km', load: '40t Hopper', status: 'optimal' },
  { source: 'node_steel', target: 'node_flyash', label: 'Thermal Flue Gas Scrub', transit_time: '8 min', distance: '2.8 km', load: '32t Tanker', status: 'fast' },
  { source: 'node_slag', target: 'node_granulator', label: 'Rapid Water Quench', transit_time: '18 min', distance: '14.5 km', load: 'Heavy Freight', status: 'active' },
  { source: 'node_flyash', target: 'node_granulator', label: 'Alkaline Activation', transit_time: '15 min', distance: '11.0 km', load: 'Pneumatic Tanker', status: 'optimal' },
  { source: 'node_granulator', target: 'node_cement', label: 'ASTM C989 Clinker Blend', transit_time: '24 min', distance: '22.4 km', load: 'Express Haul', status: 'fast' },
  { source: 'node_granulator', target: 'node_precast', label: 'Structural Concrete Slag', transit_time: '32 min', distance: '28.1 km', load: 'Precast Batch', status: 'active' },
  { source: 'node_precast', target: 'node_steel', label: 'Scrap Re-melt Closed Loop', transit_time: '35 min', distance: '31.0 km', load: 'Cyclic Loop 🔄', status: 'optimal' }
];

export const GraphDiscovery: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState<GraphLink[]>(INITIAL_LINKS);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 100);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSimulateDispatch = (sourceNode: GraphNode) => {
    showNotification(`🚚 Zomato-Speed Dispatch Alert: Heavy Hauler assigned to ${sourceNode.name}! Real-time tracking enabled.`);
  };

  const filteredNodes = nodes.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'producers') return n.type === 'producer' || n.type === 'material';
    if (filterType === 'receivers') return n.type === 'receiver' || n.type === 'processor';
    if (filterType === 'surging') return n.status === 'surging';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-brand-light">
      {/* Toast Alert */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 bg-[#E23744] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-4 border border-rose-400/40">
          <Sparkles className="w-5 h-5 text-amber-300" />
          {actionNotice}
        </div>
      )}

      {/* Zomato-Themed Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-[#1a080a] to-[#2b080c] border border-rose-900/40 p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E23744]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#E23744] text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/40 tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 fill-current" />
              ZOMATO NETWORK GRAPH
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              99.4% FULFILLMENT EFFICIENCY
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Waste-to-Resource Delivery Mesh & Closed Loops
          </h1>
          <p className="text-xs text-rose-200/70 mt-1 max-w-2xl">
            Live multi-hop byproduct dispatch graph connecting heavy metallurgy sources, granulation kitchens, and kiln consumers with express transit times.
          </p>
        </div>

        {/* Live Surge Statistics */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="bg-gray-900/90 border border-rose-900/50 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-[#E23744]/20 text-[#E23744] rounded-xl font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Avg Transit Time</span>
              <span className="text-sm font-extrabold text-white font-mono">22.4 Mins</span>
            </div>
          </div>

          <div className="bg-gray-900/90 border border-rose-900/50 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Avoided CO₂e</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">14,200 MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900/80 border border-gray-800 p-3.5 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Corridor Filter:</span>
          {[
            { id: 'all', label: 'All Mesh Nodes', icon: Layers },
            { id: 'producers', label: '🏭 Kitchens & Sources', icon: Flame },
            { id: 'receivers', label: '🏗️ Precast & Kilns', icon: Star },
            { id: 'surging', label: '⚡ High Demand Surge', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-[#E23744] text-white shadow-lg shadow-rose-600/30'
                  : 'bg-gray-800/80 text-gray-400 hover:text-white border border-gray-700/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setNodes([...INITIAL_NODES]);
            showNotification('Mesh graph topology refreshed with real-time OSRM corridors.');
          }}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Topology
        </button>
      </div>

      {/* Interactive Zomato Graph Canvas & Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Canvas */}
        <div className="lg:col-span-8 bg-gray-950 border border-rose-950/60 rounded-3xl p-4 shadow-2xl relative overflow-hidden min-h-[520px] flex flex-col">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2374415_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          {/* Floating Canvas Tag */}
          <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur border border-rose-900/50 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E23744] animate-ping"></span>
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide">Interactive Delivery Mesh</span>
          </div>

          {/* SVG Vector Canvas */}
          <svg className="w-full h-[460px] relative z-0">
            <defs>
              <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E23744" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FB7185" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Connecting Edges */}
            {links.map((link, idx) => {
              const src = nodes.find((n) => n.id === link.source);
              const tgt = nodes.find((n) => n.id === link.target);
              if (!src || !tgt) return null;

              const isSelected = selectedNode?.id === src.id || selectedNode?.id === tgt.id;
              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2 - 10;

              return (
                <g key={idx}>
                  {/* Glowing Edge Line */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isSelected ? '#E23744' : '#334155'}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeDasharray={link.status === 'optimal' ? '6,6' : 'none'}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-300"
                  />

                  {/* Pulsing Animated Particle along Edge */}
                  {isSelected && (
                    <circle
                      cx={src.x + (tgt.x - src.x) * (pulseIndex / 100)}
                      cy={src.y + (tgt.y - src.y) * (pulseIndex / 100)}
                      r="4"
                      fill="#F43F5E"
                      className="shadow-lg animate-pulse"
                    />
                  )}

                  {/* Edge Distance & Transit Badge */}
                  <rect
                    x={midX - 32}
                    y={midY - 10}
                    width="64"
                    height="18"
                    rx="6"
                    fill="#0f172a"
                    stroke={isSelected ? '#E23744' : '#1e293b'}
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    fill={isSelected ? '#FB7185' : '#94a3b8'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {link.transit_time}
                  </text>
                </g>
              );
            })}

            {/* Interactive Node Circles */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer Pulsing Aura for selected node */}
                  {isSelected && (
                    <circle
                      r="32"
                      fill="#E23744"
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={isSelected ? '24' : '20'}
                    fill={isSelected ? '#E23744' : '#1e293b'}
                    stroke={isSelected ? '#ffffff' : node.color}
                    strokeWidth={isSelected ? '3' : '2'}
                    filter="url(#glow)"
                    className="transition-all duration-300 group-hover:scale-110"
                  />

                  {/* Emoji Icon inside Node */}
                  <text
                    y="5"
                    textAnchor="middle"
                    fontSize="14"
                    className="select-none pointer-events-none"
                  >
                    {node.icon}
                  </text>

                  {/* Node Name Label */}
                  <text
                    y="36"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : '600'}
                    className="select-none pointer-events-none transition-colors"
                  >
                    {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                  </text>

                  {/* Rating Tag */}
                  <rect
                    x="-18"
                    y="-34"
                    width="36"
                    height="14"
                    rx="4"
                    fill="#15803d"
                  />
                  <text
                    y="-23"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    className="select-none"
                  >
                    ★ {node.rating}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Corridor Legend */}
          <div className="mt-auto pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E23744]"></span> Producers / Kitchens
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]"></span> Material Streams
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Closed Loops 🔄
              </span>
            </div>
            <span className="font-mono text-rose-400">Click any node to inspect & dispatch</span>
          </div>
        </div>

        {/* Selected Node Zomato-Style Delivery Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedNode ? (
            <div className="bg-gray-900 border border-rose-900/40 rounded-3xl p-5 shadow-2xl space-y-4">
              {/* Header Badge */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#E23744]/20 border border-rose-500/40 flex items-center justify-center text-xl">
                    {selectedNode.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                      {selectedNode.category}
                    </span>
                    <h3 className="font-bold text-white text-base leading-tight">{selectedNode.name}</h3>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md">
                  ★ {selectedNode.rating}
                </div>
              </div>

              {/* Zomato Quick Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-950/80 rounded-2xl border border-gray-800 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Dispatch ETA</span>
                  <span className="text-sm font-extrabold text-white font-mono">{selectedNode.eta}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Weekly Volume</span>
                  <span className="text-sm font-extrabold text-rose-400 font-mono">{selectedNode.volume}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">CO₂e Abatement</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">{selectedNode.co2_saved}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Corridor Status</span>
                  <span className="text-xs font-bold text-amber-400 uppercase">{selectedNode.status}</span>
                </div>
              </div>

              {/* Upstream / Downstream Link Connections */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-300 uppercase block">Active Delivery Pipelines:</span>
                {links
                  .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map((link, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-800/80 rounded-xl border border-gray-700 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{link.label}</span>
                        <span className="text-[11px] text-gray-400">{link.load} • {link.distance}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-mono text-[11px] font-bold">
                        {link.transit_time}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleSimulateDispatch(selectedNode)}
                  className="w-full py-3 bg-[#E23744] hover:bg-[#c92f3b] text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  <Truck className="w-4 h-4" /> Dispatch Hauler (Twilio SMS Alert)
                </button>
                <Link
                  to="/dashboard/map"
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-gray-700"
                >
                  <MapPin className="w-3.5 h-3.5" /> View on Industrial GIS Map
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center text-gray-500 text-xs">
              Select any node on the graph canvas to inspect delivery corridors.
            </div>
          )}

          {/* Quick Closed Loop Highlights */}
          <div className="bg-gray-900 border border-rose-900/30 p-4 rounded-3xl space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase">100% Circular Closed Loop</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Apex Steel ➔ Granulator ➔ BuildRight Precast ➔ Scrap Re-melt. Zero landfill waste achieved across 31 km corridor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
