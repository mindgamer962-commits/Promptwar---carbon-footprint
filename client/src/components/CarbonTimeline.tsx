import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronRight, TrendingDown, Target, Sparkles, Star } from 'lucide-react';
import { TwinData } from '../types';

interface CarbonTimelineProps {
  twinData: TwinData;
}

export default function CarbonTimeline({ twinData }: CarbonTimelineProps) {
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);

  const footprintTotal = twinData.footprint?.total || 500;
  const score = twinData.score || 60;

  // Custom milestones details for each year
  const timelineMilestones = [
    {
      year: 2026,
      title: 'Foundation & Baseline Mapping',
      description: 'Establish your Digital Carbon Twin, complete baseline lifestyle assessment, and claim Eco Explorer status.',
      targetEmissions: Math.round(footprintTotal),
      targetScore: score,
      badge: 'Twin Pioneer',
      color: 'border-primary text-primary bg-primary/5',
      glow: 'shadow-primary/5'
    },
    {
      year: 2027,
      title: 'Electrified Commute Upgrade',
      description: 'Switch personal transport to EV or carpool 3 times weekly, cutting transport emissions by 45%.',
      targetEmissions: Math.round(footprintTotal * 0.85),
      targetScore: Math.min(98, score + 8),
      badge: 'Volt Commuter',
      color: 'border-secondary text-secondary bg-secondary/5',
      glow: 'shadow-secondary/5'
    },
    {
      year: 2028,
      title: 'Plant-Forward Dietary Shift',
      description: 'Transition to meat-free weekdays and compost organic wastes, reducing dietary footprints by 35%.',
      targetEmissions: Math.round(footprintTotal * 0.70),
      targetScore: Math.min(98, score + 15),
      badge: 'Green Gastronomist',
      color: 'border-accent text-accent bg-accent/5',
      glow: 'shadow-accent/5'
    },
    {
      year: 2029,
      title: 'Household Solar Power Grid',
      description: 'Install residential solar panels or switch electricity grid provider to 100% nuclear/hydro power.',
      targetEmissions: Math.round(footprintTotal * 0.50),
      targetScore: Math.min(98, score + 22),
      badge: 'Watt Master',
      color: 'border-primary text-primary bg-primary/5',
      glow: 'shadow-primary/5'
    },
    {
      year: 2030,
      title: 'Net-Zero Ecosystem Active',
      description: 'Achieve Net-Zero carbon balance. Fully completed weekly missions and reached 90+ Champion rank.',
      targetEmissions: Math.round(footprintTotal * 0.35),
      targetScore: Math.min(100, score + 30),
      badge: 'Net-Zero Sovereign',
      color: 'border-secondary text-secondary bg-secondary/5',
      glow: 'shadow-secondary/5'
    }
  ];

  // Recharts prediction chart lines
  const chartData = timelineMilestones.map(m => ({
    year: String(m.year),
    'CarbonIQ Target': m.targetEmissions,
    'Business As Usual': Math.round(footprintTotal * (1 + (m.year - 2026) * 0.025))
  }));

  const activeMilestone = timelineMilestones[selectedYearIndex];

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* Timeline Nav and Details */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Carbon Timeline Projections</h1>
          <p className="text-gray-400 text-sm mt-1">Forecast emissions reduction milestones and CarbonIQ score progress up to 2030.</p>
        </div>

        {/* Interactive Timeline Bar */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            {timelineMilestones.map((item, idx) => (
              <button
                key={item.year}
                onClick={() => setSelectedYearIndex(idx)}
                className={`cursor-pointer flex flex-col items-center gap-2 relative z-10 ${
                  selectedYearIndex === idx ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all ${
                    selectedYearIndex === idx 
                      ? 'border-primary bg-primary/15 text-primary scale-110 shadow-lg shadow-primary/10' 
                      : 'border-white/5 bg-black/20 text-gray-500'
                  }`}
                >
                  {item.year}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.year === 2026 ? 'Now' : `Yr ${idx}`}</span>
              </button>
            ))}

            {/* Connecting timeline background line */}
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-white/5 z-0" />
          </div>
        </div>

        {/* Active Milestone Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYearIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className={`text-[10px] font-bold border px-3 py-1 rounded-full uppercase tracking-wider ${activeMilestone.color}`}>
                  {activeMilestone.badge}
                </span>
                <h2 className="text-2xl font-bold font-display text-white mt-4">{activeMilestone.title}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Milestone Year</span>
                <div className="text-4xl font-extrabold text-white font-display mt-0.5">{activeMilestone.year}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">{activeMilestone.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Estimated Footprint</span>
                <span className="text-xl font-bold font-display text-white mt-1 block">
                  {activeMilestone.targetEmissions} kg CO₂ / mo
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Projected Score</span>
                <span className="text-xl font-bold font-display text-primary mt-1 block">
                  {activeMilestone.targetScore} / 100
                </span>
              </div>

              <div className="col-span-2 md:col-span-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Target Reduction</span>
                <span className="text-xl font-bold font-display text-secondary mt-1 block">
                  -{Math.round((1 - (activeMilestone.targetEmissions / footprintTotal)) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Projections Line Chart sidebar */}
      <div className="space-y-6 lg:mt-12">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[320px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-1.5">
            <TrendingDown size={14} className="text-secondary" />
            <span>Target vs Baseline Trajectory (kg CO₂ / mo)</span>
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E58F" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00E58F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#101722', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="CarbonIQ Target" stroke="#00E58F" fillOpacity={1} fill="url(#colorTarget)" strokeWidth={2} />
              <Area type="monotone" dataKey="Business As Usual" stroke="#FF4D6D" strokeDasharray="5 5" fillOpacity={0} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="text-secondary" size={16} />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Milestone Accomplishments</h4>
          </div>
          <ul className="space-y-3">
            {[
              { year: '2027', task: 'Switch commuter vehicle to pure EV' },
              { year: '2028', task: 'Go vegetarian weekdays' },
              { year: '2029', task: 'Deploy home PV solar' }
            ].map((m, i) => (
              <li key={i} className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{m.task}</span>
                <span className="font-bold text-secondary">{m.year}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
