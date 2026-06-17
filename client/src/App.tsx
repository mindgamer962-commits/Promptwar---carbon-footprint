import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { User } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('carboniq_token'));
  const [user, setUser] = useState<User | null>(null);
  const [hasTwin, setHasTwin] = useState<boolean | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        
        // Check if user has initialized twin
        const twinRes = await fetch('/api/twin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (twinRes.ok) {
          const twinData = await twinRes.json();
          setHasTwin(twinData.hasTwin);
        } else {
          setHasTwin(false);
        }
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to validate session token:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setShowAuth(false);
    setLoading(true); // Triggers re-validation to load twin status
  };

  const handleLogout = () => {
    localStorage.removeItem('carboniq_token');
    setToken(null);
    setUser(null);
    setHasTwin(null);
    setShowAuth(false);
    setLoading(false);
  };

  const handleOnboardingComplete = () => {
    setHasTwin(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in routing
  if (!token) {
    if (showAuth) {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }
    return <LandingPage onStart={() => setShowAuth(true)} />;
  }

  // Logged in but needs onboarding
  if (hasTwin === false) {
    return <Onboarding token={token} onComplete={handleOnboardingComplete} />;
  }

  // Fully authenticated workspace
  if (user) {
    return <Dashboard token={token} user={user} onLogout={handleLogout} />;
  }

  return <Auth onAuthSuccess={handleAuthSuccess} />;
}
