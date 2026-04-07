import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './auth-context';
import getUserPointsCall from '@/scripts/getUserPoints';

interface PointsContextType {
  points: number | null;
  refreshUserPoints: () => void;
}

// 1. Initialize Context
const PointsContext = createContext<PointsContextType | null>(null);

// 2. Create the Provider component
export const PointsProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserPoints = async () => {
    const authToken = token;

    if (!authToken) {
      setPoints(0);
      return;
    }

    const points = await getUserPointsCall(token);
    setPoints(points);
  };

  // Check for existing session on mount (e.g., from localStorage)
  useEffect(() => {
    const loadData = async () => {

      refreshUserPoints();

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <PointsContext.Provider value={{points, refreshUserPoints }}>
      {!loading && children}
    </PointsContext.Provider>
  );
};

// 3. Custom hook for consuming the context
export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === null) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};
