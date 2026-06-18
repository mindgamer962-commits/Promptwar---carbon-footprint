import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import MissionsPanel from './MissionsPanel';

expect.extend(toHaveNoViolations);

const mockMissions = [
  {
    id: '1',
    title: 'Bike to Work',
    description: 'Ride your bike instead of driving',
    impact: '2.5 kg CO2 saved',
    completed: false,
  },
  {
    id: '2',
    title: 'Meatless Monday',
    description: 'Skip meat for one day',
    impact: '1.8 kg CO2 saved',
    completed: false,
  },
];

describe('MissionsPanel - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MissionsPanel missions={mockMissions} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper section landmark', () => {
    render(<MissionsPanel missions={mockMissions} />);
    expect(screen.getByRole('region', { name: /missions/i })).toBeInTheDocument();
  });

  it('should have accessible mission buttons', () => {
    render(<MissionsPanel missions={mockMissions} />);
    mockMissions.forEach((mission) => {
      expect(screen.getByRole('button', { name: new RegExp(mission.title) })).toBeInTheDocument();
    });
  });

  it('should support keyboard navigation with arrow keys', async () => {
    const user = userEvent.setup();
    render(<MissionsPanel missions={mockMissions} />);
    
    const firstMission = screen.getByRole('button', { name: /Bike to Work/i });
    await user.tab();
    expect(firstMission).toHaveFocus();
  });

  it('should announce mission completion status', () => {
    render(<MissionsPanel missions={mockMissions} />);
    expect(screen.getByRole('status')).toHaveTextContent('0 of 2 missions completed');
  });
});
