import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Car, Apple, Zap, ShoppingBag, Plane, Trash2, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  token: string;
  onComplete: () => void;
}

export default function Onboarding({ token, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [transportType, setTransportType] = useState('car_gas');
  const [dailyKm, setDailyKm] = useState(20);
  
  const [diet, setDiet] = useState('meat_moderate');
  
  const [electricityKwh, setElectricityKwh] = useState(250);
  
  const [shoppingFreq, setShoppingFreq] = useState('medium');
  
  const [shortFlights, setShortFlights] = useState(1);
  const [longFlights, setLongFlights] = useState(0);
  
  const [bagsPerWeek, setBagsPerWeek] = useState(2);

  const steps = [
    {
      title: 'Transportation',
      desc: 'How do you commute on a daily basis?',
      icon: <Car className="text-primary" size={32} />
    },
    {
      title: 'Diet & Nutrition',
      desc: 'Which category best describes your eating habits?',
      icon: <Apple className="text-secondary" size={32} />
    },
    {
      title: 'Electricity & Utilities',
      desc: 'What is your average monthly electricity usage?',
      icon: <Zap className="text-accent" size={32} />
    },
    {
      title: 'Shopping & Consumption',
      desc: 'How frequently do you buy clothing, gadgets, or new goods?',
      icon: <ShoppingBag className="text-primary" size={32} />
    },
    {
      title: 'Aviation & Travel',
      desc: 'How many flights do you take in a typical year?',
      icon: <Plane className="text-secondary" size={32} />
    },
    {
      title: 'Waste Management',
      desc: 'How many standard garbage bags does your household fill weekly?',
      icon: <Trash2 className="text-accent" size={32} />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    setError('');

    const payload = {
      transport: { type: transportType, dailyKm },
      food: { diet },
      energy: { kwh: electricityKwh },
      shopping: { frequency: shoppingFreq },
      travel: { shortFlights, longFlights },
      waste: { bagsPerWeek }
    };

    try {
      const res = await fetch('/api/twin/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit assessment');
      }

      onComplete();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      setLoading(false);
    }
  };

  const percent = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-background text-white flex flex-col justify-between py-12 px-6 relative overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <span className="font-display font-extrabold text-lg">CarbonIQ Onboarding</span>
        </div>
        <div className="text-xs font-semibold text-gray-400">
          Step {step + 1} of {steps.length} ({percent}%)
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-2xl mx-auto w-full my-auto py-10">
        <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding Progress" className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-12">
          <motion.div 
            className="bg-gradient-to-r from-primary via-secondary to-accent h-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {steps[step].icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Category {step + 1}</span>
                <h2 className="text-2xl font-bold font-display">{steps[step].title}</h2>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{steps[step].desc}</p>

            {error && (
              <div className="p-3 mb-6 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {/* Input steps router */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Vehicle Type</label>
                  <div role="radiogroup" aria-label="Vehicle Type" className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { val: 'car_gas', label: 'Gasoline Car' },
                      { val: 'car_hybrid', label: 'Hybrid Car' },
                      { val: 'car_ev', label: 'Electric EV' },
                      { val: 'public', label: 'Public Transit' },
                      { val: 'bike_walk', label: 'Bicycle / Walking' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        role="radio"
                        aria-checked={transportType === opt.val}
                        onClick={() => setTransportType(opt.val)}
                        className={`p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          transportType === opt.val 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-white/5 bg-black/20 text-gray-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {transportType !== 'bike_walk' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                      <span className="text-gray-400">Daily Distance Commuted</span>
                      <span className="text-primary">{dailyKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      value={dailyKm}
                      aria-label="Daily Distance Commuted"
                      aria-valuemin={1}
                      aria-valuemax={150}
                      aria-valuenow={dailyKm}
                      onChange={(e) => setDailyKm(parseInt(e.target.value))}
                      className="w-full accent-primary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Weekly Diet Style</label>
                <div role="radiogroup" aria-label="Weekly Diet Style" className="space-y-3">
                  {[
                    { val: 'meat_heavy', title: 'Meat Lover', desc: 'Frequent beef, pork, poultry meals daily' },
                    { val: 'meat_moderate', title: 'Moderate Omnivore', desc: 'Balanced meat, fish, and vegetable diets' },
                    { val: 'pescatarian', title: 'Pescatarian', desc: 'Seafood and plant foods only, no red/white meat' },
                    { val: 'vegetarian', title: 'Vegetarian', desc: 'Dairy, eggs, plants, zero meat' },
                    { val: 'vegan', title: 'Vegan / Plant-Based', desc: 'Strict plant inputs only, zero animal products' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      role="radio"
                      aria-checked={diet === opt.val}
                      onClick={() => setDiet(opt.val)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        diet === opt.val 
                          ? 'border-secondary bg-secondary/10 text-secondary' 
                          : 'border-white/5 bg-black/20 text-gray-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{opt.title}</div>
                        <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
                      </div>
                      {diet === opt.val && <CheckCircle2 size={18} className="text-secondary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span className="text-gray-400">Monthly Power Bill Estimate</span>
                    <span className="text-accent">{electricityKwh} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={electricityKwh}
                    aria-label="Monthly Power Bill Estimate"
                    aria-valuemin={50}
                    aria-valuemax={1000}
                    aria-valuenow={electricityKwh}
                    onChange={(e) => setElectricityKwh(parseInt(e.target.value))}
                    className="w-full accent-accent bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    Average US household is ~880 kWh. EU households range around 250-400 kWh.
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Consumer Habits</label>
                <div role="radiogroup" aria-label="Consumer Habits" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { val: 'high', title: 'High Consumer', desc: 'Regular new gadget/fashion shopping' },
                    { val: 'medium', title: 'Moderate', desc: 'Conscious shopper, occasional purchases' },
                    { val: 'low', title: 'Minimalist', desc: 'Buy only essentials, repurpose old items' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      role="radio"
                      aria-checked={shoppingFreq === opt.val}
                      onClick={() => setShoppingFreq(opt.val)}
                      className={`p-5 rounded-xl border text-left flex flex-col justify-between h-36 transition-all cursor-pointer ${
                        shoppingFreq === opt.val 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-white/5 bg-black/20 text-gray-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-sm text-white">{opt.title}</span>
                      <span className="text-xs text-gray-500 mt-2">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span className="text-gray-400">Short Haul Flights (Under 3 hours)</span>
                    <span className="text-secondary">{shortFlights} Flights/Year</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={shortFlights}
                    aria-label="Short Haul Flights per Year"
                    aria-valuemin={0}
                    aria-valuemax={20}
                    aria-valuenow={shortFlights}
                    onChange={(e) => setShortFlights(parseInt(e.target.value))}
                    className="w-full accent-secondary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span className="text-gray-400">Long Haul Flights (Over 3 hours)</span>
                    <span className="text-secondary">{longFlights} Flights/Year</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={longFlights}
                    aria-label="Long Haul Flights per Year"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={longFlights}
                    onChange={(e) => setLongFlights(parseInt(e.target.value))}
                    className="w-full accent-secondary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-semibold">
                    <span className="text-gray-400">Weekly Landfill Bags Output</span>
                    <span className="text-accent">{bagsPerWeek} Bags/Week</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={bagsPerWeek}
                    aria-label="Weekly Landfill Bags Output"
                    aria-valuemin={0}
                    aria-valuemax={10}
                    aria-valuenow={bagsPerWeek}
                    onChange={(e) => setBagsPerWeek(parseInt(e.target.value))}
                    className="w-full accent-accent bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between border-t border-white/5 pt-6">
        <button
          onClick={handlePrev}
          disabled={step === 0 || loading}
          aria-label="Back to previous step"
          className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 font-semibold text-sm hover:border-white/10 active:scale-98 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          disabled={loading}
          aria-label={step === steps.length - 1 ? 'Analyze Twin' : 'Continue to next step'}
          className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all"
        >
          <span>{loading ? 'Initializing Twin...' : step === steps.length - 1 ? 'Analyze Twin' : 'Continue'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
