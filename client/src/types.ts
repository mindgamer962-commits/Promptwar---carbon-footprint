export interface User {
  id: number;
  username: string;
  email: string;
  carbon_score: number;
  points: number;
}

export interface Footprint {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  travel: number;
  waste: number;
  total: number;
}

export interface TwinData {
  hasTwin: boolean;
  score: number;
  footprint: Footprint;
  highestImpactCategory: string;
  highestImpactTip: string;
  allRecommendations: Array<{ category: string; score: number; tip: string }>;
  projections: Array<{
    year: number;
    predictedEmissions: number;
    businessAsUsual: number;
    projectedScore: number;
  }>;
}

export interface EmissionsLog {
  id: number;
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'travel' | 'waste' | string;
  amount_co2: number;
  source: string;
  details: string;
  created_at: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  points: number;
  co2_savings: number;
  category: string;
  completed: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  badge: string;
  category: string;
  joined: boolean;
  progress: number;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  carbon_score: number;
  points: number;
  isCurrentUser: boolean;
}
