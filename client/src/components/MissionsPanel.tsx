import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Flame } from 'lucide-react';
import type { Mission } from '../types';

interface MissionsPanelProps {
  token: string;
  onMissionCompleted: () => void;
}

export default function MissionsPanel({ token, onMissionCompleted }: MissionsPanelProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/missions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load missions');
      const data = await res.json();
      setMissions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const completeMission = async (missionId: number) => {
    try {
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ missionId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete mission');
      }

      // Mark local state completed
      setMissions(prev => 
        prev.map(m => m.id === missionId ? { ...m, completed: true } : m)
      );
      
      onMissionCompleted(); // Trigger score/points refresh in parent
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'transport') return '🚗';
    if (category === 'food') return '🍔';
    if (category === 'energy') return '⚡';
    return '🗑️';
  };

  // Calculate completed count
  const completedCount = missions.filter(m => m.completed).length;
  const progressPercent = missions.length ? Math.round((completedCount / missions.length) * 100) : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* Active Missions list */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Weekly Missions</h1>
          <p className="text-gray-400 text-sm mt-1">Complete micro-sustainability tasks to optimize your twin profile and unlock rewards.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((m) => (
              <div 
                key={m.id} 
                className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  m.completed ? 'border-success/20 bg-success/5 opacity-80' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                    {getCategoryIcon(m.category)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                      <span>{m.title}</span>
                      {m.completed && <CheckCircle size={14} className="text-success" />}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{m.description}</p>
                    <div className="flex gap-4 mt-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      <span>CO₂ offset: <span className="text-error font-bold">-{m.co2_savings} kg</span></span>
                      <span>Reward: <span className="text-primary font-bold">+{m.points} Pts</span></span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {m.completed ? (
                    <span className="text-xs font-semibold text-success bg-success/15 border border-success/20 px-4 py-2 rounded-xl block text-center">
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => completeMission(m.id)}
                      aria-label={`Complete mission: ${m.title}`}
                      className="w-full sm:w-auto cursor-pointer px-5 py-2.5 bg-primary text-background font-bold rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all"
                    >
                      Complete Mission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal tracking statistics */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden h-[450px] flex flex-col justify-between mt-12 lg:mt-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="text-primary" size={18} />
            <h3 className="text-base font-bold font-display text-white">Sprint progress</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
              <span>Missions Complete</span>
              <span>{completedCount} / {missions.length}</span>
            </div>

            <div role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Sprint progress percentage" className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-primary to-secondary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Compounded Offset</span>
              <div className="text-xl font-bold font-display text-error">
                -{missions.filter(m => m.completed).reduce((acc, curr) => acc + curr.co2_savings, 0).toFixed(1)} kg CO₂
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-center">
          <Flame className="text-orange-500 shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Streak active</h4>
            <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Complete at least one mission every week to maintain your Streak Multiplier.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
