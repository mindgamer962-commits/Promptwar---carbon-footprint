import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MissionsPanel from './MissionsPanel';
import { Mission } from '../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
    span: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockMissions: Mission[] = [
  { id: 1, title: 'Reduce AC usage by 30 mins', description: 'Turn down the air conditioning.', points: 50, co2_savings: 1.2, category: 'energy', completed: false },
  { id: 2, title: 'Meat-free day', description: 'Eat only vegetarian meals.', points: 100, co2_savings: 3.1, category: 'food', completed: true }
];

globalThis.fetch = vi.fn() as any;

describe('MissionsPanel Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loaded missions list and completed statuses', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMissions,
    });

    render(<MissionsPanel token="mock-token" onMissionCompleted={vi.fn()} />);

    expect(screen.getByText('Weekly Missions')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Reduce AC usage by 30 mins')).toBeInTheDocument();
      expect(screen.getByText('Meat-free day')).toBeInTheDocument();
    });

    // Verify Completed label is shown for the second mission
    expect(screen.getByText('Completed')).toBeInTheDocument();
    // Verify Complete Mission button is shown for the first active mission
    expect(screen.getByRole('button', { name: /Complete mission: Reduce AC usage/i })).toBeInTheDocument();
  });

  it('sends complete request and triggers callback on completion click', async () => {
    const handleMissionCompleted = vi.fn();
    
    // Load call
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMissions,
    });
    
    // Complete call
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, points_earned: 50, co2_reduced: 1.2 }),
    });

    render(<MissionsPanel token="mock-token" onMissionCompleted={handleMissionCompleted} />);

    await waitFor(() => {
      expect(screen.getByText('Reduce AC usage by 30 mins')).toBeInTheDocument();
    });

    const completeBtn = screen.getByRole('button', { name: /Complete mission: Reduce AC usage/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/missions/complete', expect.objectContaining({
        method: 'POST',
      }));
      expect(handleMissionCompleted).toHaveBeenCalledTimes(1);
    });
  });
});
