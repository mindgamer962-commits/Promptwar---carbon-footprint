import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Award, Shield, Zap, CheckCircle2, Trophy, Landmark } from 'lucide-react';
import { Challenge, LeaderboardUser } from '../types';

interface CommunityChallengesProps {
  token: string;
  currentUserUsername: string;
}

export default function CommunityChallenges({ token, currentUserUsername }: CommunityChallengesProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges'>('leaderboard');
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'college' | 'friends'>('global');
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCommunityData = async () => {
    setLoading(true);
    setError('');
    try {
      const [challengesRes, leaderboardRes] = await Promise.all([
        fetch('/api/challenges', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/leaderboard')
      ]);

      if (!challengesRes.ok || !leaderboardRes.ok) {
        throw new Error('Failed to load community data');
      }

      const challengesData = await challengesRes.json();
      const leaderboardData = await leaderboardRes.json();

      setChallenges(challengesData);
      
      // Update leaderboard list to flag current user
      const flaggedLeaderboard = leaderboardData.map((u: any) => ({
        ...u,
        isCurrentUser: u.username.toLowerCase() === currentUserUsername.toLowerCase()
      }));
      setLeaderboard(flaggedLeaderboard);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const joinChallenge = async (challengeId: number) => {
    try {
      const res = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ challengeId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join challenge');
      }

      // Refresh challenges list
      setChallenges(prev => 
        prev.map(c => c.id === challengeId ? { ...c, joined: true, progress: 0 } : c)
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getBadgeEmoji = (badge: string) => {
    if (badge === 'plastic_ninja') return '🥤';
    if (badge === 'pedal_hero') return '🚲';
    if (badge === 'watt_saver') return '⚡';
    return '🏆';
  };

  // Mock secondary lists for college & friends to enrich UX
  const collegeLeaderboard = [
    { rank: 1, username: 'Stanford Eco-Club', carbon_score: 91, points: 8400, isCurrentUser: false },
    { rank: 2, username: 'MIT Green Labs', carbon_score: 87, points: 7900, isCurrentUser: false },
    { rank: 3, username: 'UC Berkeley Bio-Group', carbon_score: 82, points: 6400, isCurrentUser: false }
  ];

  const friendsLeaderboard = [
    { rank: 1, username: 'sara_organic', carbon_score: 93, points: 1540, isCurrentUser: false },
    { rank: 2, username: currentUserUsername, carbon_score: 85, points: 1200, isCurrentUser: true },
    { rank: 3, username: 'mark_commutes', carbon_score: 61, points: 410, isCurrentUser: false }
  ];

  const activeLeaderboardList = 
    leaderboardTab === 'global' ? leaderboard :
    leaderboardTab === 'college' ? collegeLeaderboard : friendsLeaderboard;

  return (
    <div className="grid lg:grid-cols-3 gap-8 select-none">
      {/* Challenges & Sprints Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Community Hub</h1>
            <p className="text-gray-400 text-sm mt-1">Participate in ecological challenges, earn rare achievements, and rank against friends.</p>
          </div>

          <div role="tablist" aria-label="Community sections" className="flex border border-white/5 bg-black/20 p-1.5 rounded-xl">
            <button
              role="tab"
              aria-selected={activeTab === 'leaderboard'}
              onClick={() => setActiveTab('leaderboard')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leaderboard' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
              }`}
            >
              Leaderboards
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'challenges'}
              onClick={() => setActiveTab('challenges')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'challenges' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
              }`}
            >
              Active Challenges
            </button>
          </div>
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
        ) : activeTab === 'challenges' ? (
          <div className="space-y-4">
            {challenges.map((c) => (
              <div key={c.id} className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    {getBadgeEmoji(c.badge)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">{c.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-md">{c.description}</p>
                    <div className="flex gap-4 mt-3 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                      <span>Points: <span className="text-primary">+{c.points}</span></span>
                      <span>Category: {c.category}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {c.joined ? (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                        <CheckCircle2 size={16} />
                        <span>Joined Sprint</span>
                      </div>
                      <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-success h-full w-1/4" />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => joinChallenge(c.id)}
                      aria-label={`Join challenge: ${c.title}`}
                      className="cursor-pointer px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Leaderboard view */
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <div role="tablist" aria-label="Leaderboard standings filter" className="flex border-b border-white/5 pb-2 gap-4">
              {['global', 'college', 'friends'].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={leaderboardTab === tab}
                  onClick={() => setLeaderboardTab(tab as any)}
                  className={`cursor-pointer pb-2 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                    leaderboardTab === tab ? 'text-primary font-bold' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab} Standings
                  {leaderboardTab === tab && (
                    <motion.div layoutId="leaderboardUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2.5">
              {activeLeaderboardList.map((user) => (
                <div 
                  key={user.username}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    user.isCurrentUser 
                      ? 'border-primary/20 bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-white/5 bg-black/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank badges */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-extrabold text-sm text-gray-400">
                      {user.rank === 1 ? <Trophy className="text-warning" size={18} /> :
                       user.rank === 2 ? <Trophy className="text-gray-300" size={18} /> :
                       user.rank === 3 ? <Trophy className="text-amber-600" size={18} /> :
                       user.rank}
                    </div>

                    <div>
                      <span className="font-semibold text-sm text-white">{user.username}</span>
                      {user.isCurrentUser && <span className="ml-2 text-[9px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">You</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block text-right">Points</span>
                      <span className="text-xs font-bold text-white font-display mt-0.5 block">{user.points} Pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block text-right">CarbonIQ</span>
                      <span className="text-xs font-bold text-primary font-display mt-0.5 block">{user.carbon_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gamification stats sidebar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden h-[500px] flex flex-col justify-between mt-12 lg:mt-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Award className="text-primary" size={18} />
            <h3 className="text-base font-bold font-display text-white">Your Achievements</h3>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Carbon Twin Configured', xp: '100 Pts', completed: true },
              { title: 'Scan First Utility Bill', xp: '50 Pts', completed: false },
              { title: 'Bike to Work completed', xp: '150 Pts', completed: false }
            ].map((ac, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-black/10 flex justify-between items-center text-xs">
                <span className={ac.completed ? 'text-white font-semibold' : 'text-gray-500'}>{ac.title}</span>
                <span className={ac.completed ? 'text-primary font-bold' : 'text-gray-500 font-semibold'}>
                  {ac.completed ? 'Completed' : ac.xp}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-tr from-accent/15 to-primary/5 border border-accent/20 space-y-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-secondary animate-pulse" />
            <span>Weekly Sprint Multiplier</span>
          </h4>
          <p className="text-[11px] text-gray-400 leading-normal">
            Joining challenges increases your reward coefficients! Sprints end every Sunday at 00:00 UTC.
          </p>
        </div>
      </div>
    </div>
  );
}
