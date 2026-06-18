import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';

expect.extend(toHaveNoViolations);

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@test.com',
  carbon_score: 75,
  points: 500,
};

const mockLogout = vi.fn();
const mockToken = 'mock-token';

beforeEach(() => {
  globalThis.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/api/twin')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          footprint: {
            transport: 150,
            food: 120,
            energy: 100,
            shopping: 80,
            travel: 50,
            waste: 15,
            total: 515,
          },
          score: 75,
        }),
      });
    }
    if (url.includes('/api/receipt/logs')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes('/api/auth/me')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          points: 500,
          carbon_score: 75,
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as any;
});

describe('Dashboard - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Dashboard token={mockToken} user={mockUser} onLogout={mockLogout} />
    );
    // Wait for the main content to load
    await screen.findByRole('main', { name: /carbon dashboard/i });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have main landmark with label', async () => {
    render(<Dashboard token={mockToken} user={mockUser} onLogout={mockLogout} />);
    const main = await screen.findByRole('main', { name: /carbon dashboard/i });
    expect(main).toBeInTheDocument();
  });

  it('should have accessible headings hierarchy', async () => {
    render(<Dashboard token={mockToken} user={mockUser} onLogout={mockLogout} />);
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: /carbon footprint/i })).toBeInTheDocument();
  });

  it('should have accessible progress bar', async () => {
    render(<Dashboard token={mockToken} user={mockUser} onLogout={mockLogout} />);
    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-label');
  });

  it('should have live region for dynamic updates', async () => {
    render(<Dashboard token={mockToken} user={mockUser} onLogout={mockLogout} />);
    const liveRegion = await screen.findByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
