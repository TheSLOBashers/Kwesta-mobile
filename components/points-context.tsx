import getUserPointsCall from "@/scripts/getUserPoints";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth-context";

interface PointsContextType {
  points: number | null;
  refreshUserPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | null>(null);

export const PointsProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, loading: authLoading } = useAuth();
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserPoints = useCallback(async () => {
    const authToken = token;

    if (!authToken) {
      setPoints(null);
      return;
    }

    const points = await getUserPointsCall(token);
    setPoints(points);
  }, [token]);

  // Wait for auth to load, then fetch points whenever token changes.
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) {
        return;
      }

      setLoading(true);
      await refreshUserPoints();

      setLoading(false);
    };

    loadData();
  }, [token, authLoading, refreshUserPoints]);

  return (
    <PointsContext.Provider value={{ points, refreshUserPoints }}>
      {!loading && children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === null) {
    throw new Error("usePoints must be used within a PointsProvider");
  }
  return context;
};
