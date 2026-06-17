import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { 
  LayoutDashboard, Cpu, Leaf, Landmark, Zap, Calendar, Users, Target, LogOut, Shield, Award, ArrowUpRight, Globe, Compass 
} from 'lucide-react';
import { User, TwinData, EmissionsLog } from '../types';

// Import subcomponents
import DigitalTwin from './DigitalTwin';
import AICoach from './AICoach';
import ReceiptIntelligence from './ReceiptIntelligence';
import ImpactSimulator from './ImpactSimulator';
import CarbonTimeline from './CarbonTimeline';
import CommunityChallenges from './CommunityChallenges';
import MissionsPanel from './MissionsPanel';

interface DashboardProps {
  token: string;
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ token, user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'twin' | 'coach' | 'receipts' | 'simulator' | 'timeline' | 'challenges' | 'missions'>('dashboard');
  const [twinData, setTwinData] = useState<TwinData | null>(null);
  const [recentLogs, setRecentLogs] = useState<EmissionsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(user.points);
  const [userScore, setUserScore] = useState(user.carbon_score);

  const fetchDashboardData = async () => {
    try {
      const [twinRes, logsRes, meRes] = await Promise.all([
        fetch('/api/twin', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/receipt/logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (twinRes.ok) {
        const twin = await twinRes.json();
        setTwinData(twin);
      }
      if (logsRes.ok) {
        const logs = await logsRes.json();
        setRecentLogs(logs);
      }
      if (meRes.ok) {
        const profile = await meRes.json();
        setUserPoints(profile.points);
        setUserScore(profile.carbon_score);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback default twin configuration if Onboarding fails or is incomplete
  const footprint = twinData?.footprint || {
    transport: 150,
    food: 120,
    energy: 100,
    shopping: 80,
    travel: 50,
    waste: 15,
    total: 515
  };

  const score = userScore || twinData?.score || 60;

  // Chart Formatting
  const pieData = [
    { name: 'Transport', value: footprint.transport, color: '#FF4D6D' },
    { name: 'Diet & Food', value: footprint.food, color: '#00D4FF' },
    { name: 'Energy', value: footprint.energy, color: '#7C5CFF' },
    { name: 'Shopping', value: footprint.shopping, color: '#00E58F' },
    { name: 'Travel & Waste', value: footprint.travel + footprint.waste, color: '#FFB800' }
  ];

  // Score Categories
  const getScoreStatus = (s: number) => {
    if (s >= 90) return { label: 'Climate Champion', color: 'text-primary' };
    if (s >= 75) return { label: 'Eco Warrior', color: 'text-secondary' };
    if (s >= 50) return { label: 'Green Explorer', color: 'text-accent' };
    return { label: 'Carbon Beginner', color: 'text-error' };
  };

  const status = getScoreStatus(score);

  const sidebarItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
    { id: 'twin', label: 'Carbon Twin', icon: <Cpu size={18} /> },
    { id: 'coach', label: 'AI Climate Coach', icon: <Leaf size={18} /> },
    { id: 'receipts', label: 'Receipt Scanner', icon: <Landmark size={18} /> },
    { id: 'simulator', label: 'Impact Simulator', icon: <Zap size={18} /> },
    { id: 'timeline', label: 'Timeline Forecast', icon: <Calendar size={18} /> },
    { id: 'challenges', label: 'Community Sprints', icon: <Users size={18} /> },
    { id: 'missions', label: 'Weekly Missions', icon: <Target size={18} /> },
  ];

  // Earth calculations based on carbon footprint (1 Earth = ~200kg carbon footprint total)
  const earthsRequired = Math.round((footprint.total / 200) * 10) / 10;
  const improvedEarths = Math.max(1.0, Math.round((earthsRequired * 0.55) * 10) / 10);

  return (
    <div className="min-h-screen bg-background text-white flex select-none">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-card/45 backdrop-blur-md hidden md:flex flex-col justify-between p-6 z-10">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <span className="font-display font-extrabold text-lg tracking-wide text-white">
              CarbonIQ <span className="text-primary">AI</span>
            </span>
          </div>

          <nav role="tablist" aria-label="Dashboard views" className="space-y-1.5">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={activeView === item.id}
                aria-controls={`panel-${item.id}`}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeView === item.id 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-md shadow-primary/5' 
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-sm font-bold text-accent">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.username}</div>
              <div className="text-[10px] text-gray-500 font-semibold truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            aria-label="Sign Out"
            className="w-full flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Body workspace */}
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-10 z-10 max-w-7xl mx-auto w-full">
        {/* Mobile Navbar */}
        <div className="flex md:hidden items-center justify-between border-b border-white/5 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-display font-extrabold text-lg text-white">CarbonIQ</span>
          </div>
          <div className="flex gap-2">
            <select
              value={activeView}
              aria-label="Navigate Views"
              onChange={(e) => setActiveView(e.target.value as any)}
              className="bg-card border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
            >
              {sidebarItems.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <button
              onClick={onLogout}
              aria-label="Sign Out Mobile"
              className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-gray-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* View Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            id={`panel-${activeView}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeView}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && (
              <div className="space-y-8">
                {/* Header Welcome Dashboard */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Command Center</h1>
                    <p className="text-gray-400 text-sm mt-1">Real-time status of your Virtual Carbon Twin ecosystem.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <Award className="text-primary" size={18} />
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Total Points</span>
                        <span className="text-sm font-extrabold text-white font-display block">{userPoints} Pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Card 1: Circular Score Meter */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-[300px]">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CarbonIQ Index</span>
                      <h3 className="text-lg font-bold text-white mt-1 font-display">Sustainability Score</h3>
                    </div>

                    <div className="relative flex justify-center items-center py-4">
                      {/* CSS Circular SVG */}
                      <svg className="w-36 h-36" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                        <motion.circle 
                          cx="50" cy="50" r="40" fill="transparent" 
                          stroke="#00E58F" strokeWidth="6" 
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          strokeLinecap="round" 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black font-display text-white">{score}</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Rating</span>
                      </div>
                    </div>

                    <div className="text-center text-xs font-bold border-t border-white/5 pt-4">
                      Score Status: <span className={`${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Card 2: Recharts Pie Chart Emissions breakdown */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[300px] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Emissions Breakdown</span>
                      <h3 className="text-lg font-bold text-white mt-1 font-display">Source Distribution</h3>
                    </div>

                    <div className="flex-1 min-h-[140px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#101722', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: 10 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-400 font-semibold border-t border-white/5 pt-3">
                      {pieData.map(p => (
                        <div key={p.name} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Earth Impact Visualizer (Feature 7) */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-[300px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Earth Impact Visualizer</span>
                      <h3 className="text-lg font-bold text-white mt-1 font-display">Resource Overuse</h3>
                    </div>

                    <div className="flex items-center justify-around py-4">
                      {/* Circular Earth representers */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-error/30 to-warning/20 border border-error/30 flex items-center justify-center shadow-lg shadow-error/5 animate-pulse">
                          <Globe className="text-error" size={24} />
                        </div>
                        <span className="text-xs font-bold text-white">{earthsRequired} Earths</span>
                        <span className="text-[9px] text-gray-500 font-semibold">Current Lifestyle</span>
                      </div>

                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/5">
                          <Globe className="text-primary animate-spin-slow" size={24} style={{ animationDuration: '10s' }} />
                        </div>
                        <span className="text-xs font-bold text-primary">{improvedEarths} Earths</span>
                        <span className="text-[9px] text-primary/80 font-semibold">Optimized Target</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center leading-normal border-t border-white/5 pt-4">
                      "If everyone lived like you, we would need {earthsRequired} Earths. Under your improved profile, we only need {improvedEarths}."
                    </p>
                  </div>
                </div>

                {/* Bottom Row Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column: Quick Actions + Projections */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Quick navigation modules links */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
                      
                      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-display">Module Shortcuts</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: 'twin', label: 'View Twin', desc: 'Virtual Carbon Avatar', icon: <Cpu size={16} /> },
                          { id: 'coach', label: 'Ask Coach', desc: 'AI Climate queries', icon: <Leaf size={16} /> },
                          { id: 'receipts', label: 'Scan Bills', desc: 'OCR parsing log', icon: <Landmark size={16} /> },
                          { id: 'simulator', label: 'Simulator', desc: 'Model parameters', icon: <Zap size={16} /> }
                        ].map(shortcut => (
                          <button
                            key={shortcut.id}
                            onClick={() => setActiveView(shortcut.id as any)}
                            className="cursor-pointer p-4 rounded-2xl border border-white/5 bg-black/20 text-left hover:border-primary/20 hover:bg-primary/5 transition-all flex flex-col justify-between h-28"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-primary">
                              {shortcut.icon}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1 mt-2">
                                <span>{shortcut.label}</span>
                                <ArrowUpRight size={10} className="opacity-40" />
                              </div>
                              <span className="text-[10px] text-gray-500 font-normal truncate mt-0.5 block">{shortcut.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline forecast brief summary */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center justify-between gap-6">
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Carbon Timeline Forecast</span>
                        <h4 className="text-base font-bold text-white font-display">Projected Net-Zero Target: 2030</h4>
                        <p className="text-xs text-gray-400 max-w-md">By maintaining active weeks and completing micro-missions, reduce emissions to 35% of current levels.</p>
                      </div>
                      <button
                        onClick={() => setActiveView('timeline')}
                        className="cursor-pointer px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl text-xs font-semibold transition-all shrink-0"
                      >
                        Launch Forecast
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Recent Activity Logs */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-[380px]">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transaction Ledger</span>
                      <h3 className="text-base font-bold text-white mt-1 font-display">Recent Emissions</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-4 my-2 border-t border-b border-white/5">
                      {recentLogs.length > 0 ? (
                        recentLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center text-xs">
                            <div className="truncate pr-2">
                              <span className="font-semibold text-white block truncate">{log.source}</span>
                              <span className="text-[9px] text-gray-500 uppercase font-medium">{log.category}</span>
                            </div>
                            <span className={`font-bold ${log.amount_co2 > 0 ? 'text-error' : 'text-success'}`}>
                              {log.amount_co2 > 0 ? `+${log.amount_co2}` : log.amount_co2} kg
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 space-y-2">
                          <Compass size={24} />
                          <p className="text-[10px]">No recent transaction logs. Upload a bill in the Receipt Scanner.</p>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-500 leading-normal">
                      Logs are updated dynamically when completing weekly missions or uploading receipt intelligence documents.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'twin' && <DigitalTwin twinData={twinData || { hasTwin: true, score, footprint, highestImpactCategory: 'Transportation', highestImpactTip: 'Reduce car trips', allRecommendations: [], projections: [] }} />}
            
            {activeView === 'coach' && <AICoach token={token} twinData={twinData || { hasTwin: true, score, footprint, highestImpactCategory: 'Transportation', highestImpactTip: 'Reduce car trips', allRecommendations: [], projections: [] }} />}
            
            {activeView === 'receipts' && <ReceiptIntelligence token={token} twinData={twinData || { hasTwin: true, score, footprint, highestImpactCategory: 'Transportation', highestImpactTip: 'Reduce car trips', allRecommendations: [], projections: [] }} onLogged={fetchDashboardData} />}
            
            {activeView === 'simulator' && <ImpactSimulator twinData={twinData || { hasTwin: true, score, footprint, highestImpactCategory: 'Transportation', highestImpactTip: 'Reduce car trips', allRecommendations: [], projections: [] }} />}
            
            {activeView === 'timeline' && <CarbonTimeline twinData={twinData || { hasTwin: true, score, footprint, highestImpactCategory: 'Transportation', highestImpactTip: 'Reduce car trips', allRecommendations: [], projections: [] }} />}
            
            {activeView === 'challenges' && <CommunityChallenges token={token} currentUserUsername={user.username} />}
            
            {activeView === 'missions' && <MissionsPanel token={token} onMissionCompleted={fetchDashboardData} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
