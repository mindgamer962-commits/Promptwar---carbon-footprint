import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DigitalTwin from './DigitalTwin';
import { TwinData } from '../types';

// Mock framer-motion to avoid animation ticks in jsdom environment
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    span: ({ children, className, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons for simplicity
vi.mock('lucide-react', () => ({
  Shield: () => <span data-testid="shield-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
  TrendingDown: () => <span data-testid="trending-down-icon" />,
  Leaf: () => <span data-testid="leaf-icon" />,
  AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
  ChevronRight: () => <span data-testid="chevron-right-icon" />,
  Zap: () => <span data-testid="zap-icon" />,
}));

const mockTwinData: TwinData = {
  hasTwin: true,
  score: 65,
  footprint: {
    transport: 150,
    food: 120,
    energy: 100,
    shopping: 80,
    travel: 50,
    waste: 15,
    total: 515,
  },
  highestImpactCategory: 'Transportation',
  highestImpactTip: 'Switch your commute to public transit or an EV.',
  allRecommendations: [
    { category: 'Transportation', score: 150, tip: 'Switch your commute to public transit or an EV.' },
  ],
  projections: [
    { year: 2026, predictedEmissions: 515, businessAsUsual: 515, projectedScore: 65 },
  ],
};

describe('DigitalTwin Component', () => {
  it('renders the Digital Twin header and subtext', () => {
    render(<DigitalTwin twinData={mockTwinData} />);
    
    expect(screen.getByText('Digital Carbon Twin')).toBeInTheDocument();
    expect(
      screen.getByText('Visualize your current carbon profile vs your potential future self.')
    ).toBeInTheDocument();
  });

  it('displays correct carbon emissions metrics and scores', () => {
    render(<DigitalTwin twinData={mockTwinData} />);

    // Check carbon footprint values are rendered
    expect(screen.getByText('515')).toBeInTheDocument(); // total carbon output
    expect(screen.getByText('65')).toBeInTheDocument();  // current twin score

    // Sustainable self footprint is Math.round(515 * 0.35) = 180
    expect(screen.getByText('180')).toBeInTheDocument();
  });

  it('renders top emission driver recommendations', () => {
    render(<DigitalTwin twinData={mockTwinData} />);
    
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();
    expect(screen.getByText('Switch your commute to public transit or an EV.')).toBeInTheDocument();
  });
});
