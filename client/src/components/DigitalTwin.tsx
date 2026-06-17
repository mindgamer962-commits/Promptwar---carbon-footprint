import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, TrendingDown, Leaf, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { TwinData } from '../types';

interface DigitalTwinProps {
  twinData: TwinData;
}

export default function DigitalTwin({ twinData }: DigitalTwinProps) {
  const { score, footprint, highestImpactCategory, highestImpactTip } = twinData;

  const currentSelfScore = score;
  const sustainableSelfScore = Math.min(100, score + 25);
  
  // Calculate sustainable footprint (ideal targets)
  const sustainableFootprint = {
    transport: Math.round(footprint.transport * 0.3),
    food: Math.round(footprint.food * 0.4),
    energy: Math.round(footprint.energy * 0.2),
    shopping: Math.round(footprint.shopping * 0.5),
    travel: Math.round(footprint.travel * 0.5),
    waste: Math.round(footprint.waste * 0.4),
    total: Math.round(footprint.total * 0.35)
  };

  const getScoreTier = (s: number) => {
    if (s >= 90) return { label: 'Climate Champion', color: 'text-primary border-primary/20 bg-primary/5' };
    if (s >= 75) return { label: 'Eco Warrior', color: 'text-secondary border-secondary/20 bg-secondary/5' };
    if (s >= 50) return { label: 'Green Explorer', color: 'text-accent border-accent/20 bg-accent/5' };
    return { label: 'Carbon Beginner', color: 'text-error border-error/20 bg-error/5' };
  };

  const currentTier = getScoreTier(currentSelfScore);
  const sustainableTier = getScoreTier(sustainableSelfScore);

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Digital Carbon Twin</h1>
        <p className="text-gray-400 text-sm mt-1">Visualize your current carbon profile vs your potential future self.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Current Self */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/5"
        >
          {/* Industrial Orange Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-error/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-xs font-bold text-error uppercase tracking-widest bg-error/5 border border-error/10 px-3 py-1 rounded-full">
                Current Self
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-3">High-Emission Profile</h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold font-display text-white">{footprint.total}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">kg CO₂ / Month</div>
            </div>
          </div>

          {/* Interactive Core Graphic */}
          <div className="relative h-64 flex items-center justify-center mb-8 bg-black/30 rounded-2xl border border-white/5">
            {/* Pulsing Grid Rings */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-error/10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-[spin_60s_linear_infinite]" />

            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-error/30 to-warning/20 border border-error/30 flex flex-col justify-center items-center shadow-[0_0_50px_rgba(255,77,109,0.15)]">
              <AlertTriangle className="text-error w-10 h-10 mb-2 animate-bounce" />
              <span className="font-display font-black text-2xl text-white">{currentSelfScore}</span>
              <span className="text-[8px] uppercase tracking-widest text-error/80 font-bold">Carbon IQ</span>
            </div>

            <div className="absolute bottom-4 left-4 flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-error animate-ping" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Carbon Heavy Output</span>
            </div>
          </div>

          {/* Emission Stats */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category Footprints</h3>
            {[
              { label: 'Transportation', value: footprint.transport, max: 300, color: 'bg-error' },
              { label: 'Food & Nutrition', value: footprint.food, max: 250, color: 'bg-error' },
              { label: 'Electricity & Gas', value: footprint.energy, max: 300, color: 'bg-error' },
              { label: 'Goods & Shopping', value: footprint.shopping, max: 200, color: 'bg-error' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.value} kg CO₂</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full`}
                    style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Future Sustainable Self */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/5"
        >
          {/* Green Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
                Future Twin
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-3">Sustainable Profile</h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold font-display text-primary">{sustainableFootprint.total}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">kg CO₂ / Month</div>
            </div>
          </div>

          {/* Interactive Core Graphic */}
          <div className="relative h-64 flex items-center justify-center mb-8 bg-black/30 rounded-2xl border border-white/5">
            {/* Pulsing Grid Rings */}
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-primary/20 animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute w-56 h-56 rounded-full border border-primary/10 animate-[spin_60s_linear_infinite]" />

            <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/20 border border-primary/30 flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,229,143,0.25)]">
              <Leaf className="text-primary w-10 h-10 mb-2 animate-bounce" />
              <span className="font-display font-black text-2xl text-primary">{sustainableSelfScore}</span>
              <span className="text-[8px] uppercase tracking-widest text-primary/80 font-bold">Carbon IQ</span>
            </div>

            <div className="absolute bottom-4 left-4 flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] uppercase font-bold text-primary">Eco Shield Active</span>
            </div>
          </div>

          {/* Emission Stats */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Target Footprints</h3>
            {[
              { label: 'Transportation', value: sustainableFootprint.transport, max: 300, color: 'bg-primary' },
              { label: 'Food & Diet', value: sustainableFootprint.food, max: 250, color: 'bg-primary' },
              { label: 'Electricity & Gas', value: sustainableFootprint.energy, max: 300, color: 'bg-primary' },
              { label: 'Goods & Shopping', value: sustainableFootprint.shopping, max: 200, color: 'bg-primary' }
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-primary">{item.value} kg CO₂</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full`}
                    style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Explainability & Insights Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-primary animate-pulse" size={20} />
          <h3 className="text-lg font-bold font-display text-white">AI Twin Insights</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Top Emission Driver</span>
            <div className="text-base font-bold text-white">{highestImpactCategory}</div>
            <p className="text-xs text-gray-400">{highestImpactTip}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Potential Reduction</span>
            <div className="text-xl font-bold text-primary font-display flex items-center gap-2">
              <TrendingDown size={18} />
              <span>-{Math.round((footprint.total - sustainableFootprint.total) * 12)} kg/year</span>
            </div>
            <p className="text-xs text-gray-400">By adopting clean transport alternatives and plant-forward nutrition habits.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Climate Score Action Plan</span>
              <div className="text-sm font-semibold text-white mt-1">Deploy Home Renewable Solar</div>
            </div>
            <div className="text-xs text-secondary font-bold flex items-center gap-1 mt-2">
              <span>Install Solar Panels</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
