import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, DollarSign, Award, Info, Sparkles } from 'lucide-react';
import { TwinData } from '../types';

interface ImpactSimulatorProps {
  twinData: TwinData;
}

export default function ImpactSimulator({ twinData }: ImpactSimulatorProps) {
  const baseFootprint = twinData.footprint || {
    transport: 150,
    food: 120,
    energy: 100,
    shopping: 80,
    travel: 50,
    waste: 15,
    total: 515
  };

  // Simulator Sliders States
  const [evRatio, setEvRatio] = useState(0); // 0 to 100%
  const [plantDietRatio, setPlantDietRatio] = useState(0); // 0 to 100%
  const [transitDays, setTransitDays] = useState(0); // 0 to 7 days
  const [solarInstalled, setSolarInstalled] = useState(false);
  const [tempAdjust, setTempAdjust] = useState(0); // 0 to 4 degrees C

  // Compute Simulated Reductions
  // 1. EV Impact: reduces transport emissions by up to 70% if 100% EV
  const transportSavings = Math.round(baseFootprint.transport * (evRatio / 100) * 0.7);
  const transportCostSavings = Math.round((evRatio / 100) * 80); // Up to $80 saved/mo on fuel

  // 2. Diet Impact: heavy meat diet -> plant-rich (reduces food emissions by up to 60%)
  const foodSavings = Math.round(baseFootprint.food * (plantDietRatio / 100) * 0.6);
  const foodCostSavings = Math.round((plantDietRatio / 100) * 45); // Up to $45 saved/mo on meat costs

  // 3. Transit Days Impact: reduces remaining transport emissions by 12% per day weekly
  const remainingTransport = baseFootprint.transport - transportSavings;
  const transitSavings = Math.round(remainingTransport * (transitDays / 7) * 0.5);
  const transitCostSavings = Math.round((transitDays / 7) * 30); // Up to $30 saved/mo on parking/fuel

  // 4. Solar Impact: reduces electricity emissions by 90%
  const solarSavings = solarInstalled ? Math.round(baseFootprint.energy * 0.9) : 0;
  const solarCostSavings = solarInstalled ? 120 : 0; // $120/mo solar production credits

  // 5. Thermostat: 10% reduction in electricity per degree C adjustment
  const remainingEnergy = baseFootprint.energy - solarSavings;
  const tempSavings = Math.round(remainingEnergy * (tempAdjust * 0.08));
  const tempCostSavings = Math.round(tempAdjust * 8);

  // Totals
  const totalMonthlySavings = transportSavings + foodSavings + transitSavings + solarSavings + tempSavings;
  const totalYearlySavings = totalMonthlySavings * 12;

  const totalMonthlyCostSavings = transportCostSavings + foodCostSavings + transitCostSavings + solarCostSavings + tempCostSavings;
  const totalYearlyCostSavings = totalMonthlyCostSavings * 12;

  // New simulated score
  const baseScore = twinData.score || 60;
  const simulatedFootprintTotal = Math.max(80, baseFootprint.total - totalMonthlySavings);
  const simulatedScore = Math.min(100, Math.round(100 - (simulatedFootprintTotal / 15)));

  // Chart Data
  const chartData = [
    { name: 'Transport', Current: baseFootprint.transport, Simulated: Math.max(0, baseFootprint.transport - transportSavings - transitSavings) },
    { name: 'Diet & Food', Current: baseFootprint.food, Simulated: Math.max(0, baseFootprint.food - foodSavings) },
    { name: 'Energy', Current: baseFootprint.energy, Simulated: Math.max(0, baseFootprint.energy - solarSavings - tempSavings) },
    { name: 'Shopping', Current: baseFootprint.shopping, Simulated: baseFootprint.shopping },
    { name: 'Travel & Waste', Current: baseFootprint.travel + baseFootprint.waste, Simulated: baseFootprint.travel + baseFootprint.waste }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* Simulation Controls */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Future Impact Simulator</h1>
          <p className="text-gray-400 text-sm mt-1">Adjust sliders to model sustainability actions and project your future footprint and financials.</p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-8">
          {/* Transport EV Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-300">EV Commuting Ratio</span>
              <span className="text-primary">{evRatio}% EV driven</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={evRatio}
              aria-label="EV Commuting Ratio percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={evRatio}
              onChange={(e) => setEvRatio(parseInt(e.target.value))}
              className="w-full accent-primary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
              <span>0% Gasoline Sedan</span>
              <span>100% Pure EV</span>
            </div>
          </div>

          {/* Diet Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-300">Plant-Rich Diet Ratio</span>
              <span className="text-secondary">{plantDietRatio}% Vegetarian/Vegan</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={plantDietRatio}
              aria-label="Plant-Rich Diet Ratio percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={plantDietRatio}
              onChange={(e) => setPlantDietRatio(parseInt(e.target.value))}
              className="w-full accent-secondary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
              <span>Heavy Meat omnivore</span>
              <span>100% Plant-Based</span>
            </div>
          </div>

          {/* Public Transit Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-300">Weekly Public Transit Days</span>
              <span className="text-accent">{transitDays} Days/Week</span>
            </div>
            <input
              type="range"
              min="0"
              max="7"
              value={transitDays}
              aria-label="Weekly Public Transit Days"
              aria-valuemin={0}
              aria-valuemax={7}
              aria-valuenow={transitDays}
              onChange={(e) => setTransitDays(parseInt(e.target.value))}
              className="w-full accent-accent bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
              <span>Always Drive Solo</span>
              <span>7 days/week Transit</span>
            </div>
          </div>

          {/* Grid Split Solar and Thermostat */}
          <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/20">
              <div>
                <label htmlFor="solar-pv-checkbox" className="text-xs font-bold text-white block cursor-pointer">Rooftop Solar PVs</label>
                <span className="text-[10px] text-gray-500 mt-1 block">Offset grid emissions to zero</span>
              </div>
              <input
                id="solar-pv-checkbox"
                type="checkbox"
                checked={solarInstalled}
                aria-label="Rooftop Solar Panels installed status"
                onChange={(e) => setSolarInstalled(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 accent-primary cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-300">Thermostat Adjustment</span>
                <span className="text-primary">+{tempAdjust}°C (Cooling)</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={tempAdjust}
                aria-label="Thermostat Adjustment in degrees Celsius"
                aria-valuemin={0}
                aria-valuemax={4}
                aria-valuenow={tempAdjust}
                onChange={(e) => setTempAdjust(parseInt(e.target.value))}
                className="w-full accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Recharts graph */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 h-80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Emissions Comparison (kg CO₂ / mo)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#101722', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="Current" fill="#FF4D6D" radius={[4, 4, 0, 0]} maxBarSize={35} />
              <Bar dataKey="Simulated" fill="#00E58F" radius={[4, 4, 0, 0]} maxBarSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulator Metrics Dashboard */}
      <div className="space-y-6 lg:mt-12">
        {/* Metric Card 1: Carbon Reduction */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Leaf className="text-primary" size={16} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carbon Savings</span>
          </div>

          <div className="text-3xl font-black font-display text-primary">{totalYearlySavings.toLocaleString()} kg</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">Estimated yearly atmospheric emissions avoided based on slider positions.</p>
        </div>

        {/* Metric Card 2: Financial Savings */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <DollarSign className="text-secondary" size={16} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial Offset</span>
          </div>

          <div className="text-3xl font-black font-display text-secondary">${totalYearlyCostSavings.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">Yearly savings generated via reduced fuel/power consumption and utility solar credits.</p>
        </div>

        {/* Metric Card 3: Score Impact */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Award className="text-accent" size={16} />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projected score</span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black font-display text-white">{simulatedScore}</div>
            <span className="text-xs font-semibold text-accent">({simulatedScore >= 90 ? 'Champion' : simulatedScore >= 75 ? 'Warrior' : 'Explorer'})</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 leading-relaxed flex items-center gap-1.5">
            <Info size={14} className="text-accent" />
            <span>Increases your current index score by +{simulatedScore - baseScore} points.</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-start">
          <Sparkles className="text-primary shrink-0" size={16} />
          <p className="text-[11px] text-gray-400 leading-normal">
            Ready to lock these parameters? Discuss with your **AI Climate Coach** to log actionable weekly missions tailored to these scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
