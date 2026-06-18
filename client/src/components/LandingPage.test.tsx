import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from './LandingPage';

// Mock framer-motion to avoid animation ticks
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>{children}</div>
    ),
    span: ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>{children}</span>
    ),
    section: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <section className={className} {...props}>{children}</section>
    ),
    h1: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={className} {...props}>{children}</h1>
    ),
    p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...props}>{children}</p>
    ),
    button: ({ children, className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
      <button className={className} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon" />,
  Leaf: () => <span data-testid="leaf-icon" />,
  Cpu: () => <span data-testid="cpu-icon" />,
  Zap: () => <span data-testid="zap-icon" />,
  Target: () => <span data-testid="target-icon" />,
  Users: () => <span data-testid="users-icon" />,
  Landmark: () => <span data-testid="landmark-icon" />,
  Globe: () => <span data-testid="globe-icon" />,
}));

describe('LandingPage Component', () => {
  it('renders landing page titles and details', () => {
    const handleStart = vi.fn();
    render(<LandingPage onStart={handleStart} />);

    expect(screen.getAllByText(/CarbonIQ/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Track, predict, and reduce/i)).toBeInTheDocument();
  });

  it('triggers onStart when get started button is clicked', () => {
    const handleStart = vi.fn();
    render(<LandingPage onStart={handleStart} />);

    const ctaButton = screen.getByRole('button', { name: /Generate My Carbon Twin/i });
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('triggers onStart when header sign in button is clicked', () => {
    const handleStart = vi.fn();
    render(<LandingPage onStart={handleStart} />);

    const signInButton = screen.getByRole('button', { name: /Sign In to CarbonIQ/i });
    expect(signInButton).toBeInTheDocument();

    fireEvent.click(signInButton);
    expect(handleStart).toHaveBeenCalledTimes(1);
  });
});
