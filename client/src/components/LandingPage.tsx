import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Cpu, Zap, Target, Users, Landmark, Globe } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  const features = [
    {
      icon: <Cpu className="text-primary" size={24} />,
      title: 'Digital Carbon Twin',
      desc: 'Creates a real-time virtual avatar mapping your consumption habits to visual carbon models.',
    },
    {
      icon: <Zap className="text-secondary" size={24} />,
      title: 'Future Impact Simulator',
      desc: 'Test ecological actions like EV purchases or solar panels to forecast your score and financial savings.',
    },
    {
      icon: <Leaf className="text-accent" size={24} />,
      title: 'AI Climate Coach',
      desc: 'An analytical assistant powered by LLMs that answers carbon-math and drafts personalized reduction plans.',
    },
    {
      icon: <Target className="text-primary" size={24} />,
      title: 'Weekly Missions',
      desc: 'Earn points and actively optimize your twin with bite-sized, achievable ecological actions.',
    },
    {
      icon: <Landmark className="text-secondary" size={24} />,
      title: 'Receipt Intelligence',
      desc: 'Instantly OCR grocery or utility bills to map line-item purchase data to carbon footprints.',
    },
    {
      icon: <Users className="text-accent" size={24} />,
      title: 'Community Challenges',
      desc: 'Join plastic-free or energy-saving sprints. Rank on global, university, or friend leaderboards.',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-white select-none">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xl">
            🌱
          </div>
          <span className="font-display font-extrabold text-xl tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            CarbonIQ <span className="text-primary">AI</span>
          </span>
        </div>
        <button
          onClick={onStart}
          aria-label="Sign In to CarbonIQ"
          className="cursor-pointer glass-panel px-5 py-2.5 rounded-xl border border-white/10 hover:border-primary/50 text-sm font-semibold text-white transition-all duration-300"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300"
          >
            <Leaf size={14} className="text-primary animate-pulse" />
            <span>Introducing Digital Carbon Avatars</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            Meet Your <br />
            <span className="text-gradient">Digital Carbon Twin</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-lg md:text-xl font-normal max-w-lg leading-relaxed"
          >
            Track, predict, and reduce your carbon footprint with AI-powered sustainability intelligence.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStart}
              aria-label="Generate My Carbon Twin Profile"
              className="cursor-pointer px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-background font-bold text-base rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-98 transition-all shadow-xl shadow-primary/10"
            >
              <span>Generate My Carbon Twin</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10"
          >
            <div>
              <div className="text-3xl font-bold font-display text-white">43%</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Avg CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display text-primary">0.0 kg</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Real-Time Offset</div>
            </div>
            <div>
              <div className="text-3xl font-bold font-display text-secondary">2.4 → 1.3</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Earths Needed</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Visual: Premium Animated Twin representation */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-white/5 animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-primary/10 animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute w-[520px] h-[520px] rounded-full border border-white/5 animate-[spin_80s_linear_infinite]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1.5 }}
            className="relative z-10 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/25 via-secondary/15 to-accent/20 flex flex-col justify-center items-center border border-white/10 shadow-[0_0_80px_rgba(0,229,143,0.15)] group hover:border-primary/40 transition-all duration-700"
          >
            {/* Visual core avatar representer */}
            <Globe className="text-primary w-24 h-24 mb-4 animate-[pulse_3s_ease-in-out_infinite]" />
            <span className="font-display text-xs tracking-widest text-primary/80 uppercase font-semibold">
              Carbon IQ Avatar
            </span>
            <span className="font-display font-black text-3xl mt-1 tracking-tight text-white">
              Twin.v1.0
            </span>
            <div className="absolute bottom-6 flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Awaiting Onboarding
              </span>
            </div>

            {/* Orbiting metrics tags */}
            <div className="absolute -top-4 -right-12 glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg select-none">
              <span className="text-xl">🍔</span>
              <div>
                <div className="text-[10px] text-gray-500 font-semibold">Diet footprint</div>
                <div className="text-xs font-bold text-white">Plant-rich profile</div>
              </div>
            </div>

            <div className="absolute bottom-16 -left-16 glass-panel p-3.5 rounded-2xl flex items-center gap-3 border border-white/10 shadow-lg select-none">
              <span className="text-xl">🚗</span>
              <div>
                <div className="text-[10px] text-gray-500 font-semibold">Daily Transit</div>
                <div className="text-xs font-bold text-white">Tesla Model 3 EV</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Climate Intelligence. Personalized.
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Say goodbye to generalized tips. CarbonIQ builds a dedicated twin mapping all variables of your lifestyle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden group border border-white/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-300">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-display text-white group-hover:text-primary transition-colors">
                {feat.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
