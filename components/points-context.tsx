import getUserPointsCall from "@/scripts/getUserPoints";
import { sumLocalRedeemedPoints } from "@/scripts/localRedemptions";
import syncLocalRedemptions from "@/scripts/syncLocalRedemptions";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
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
  const previousPointsRef = useRef<number | null>(null);
  const hasLoadedPointsRef = useRef(false);

  const refreshUserPoints = useCallback(async () => {
    const authToken = token;

    if (!authToken) {
      previousPointsRef.current = null;
      hasLoadedPointsRef.current = false;
      setPoints(null);
      return;
    }
    try {
      await syncLocalRedemptions(authToken);
    } catch (e) {
      console.error("syncLocalRedemptions failed", e);
    }

    const nextPoints = await getUserPointsCall(authToken);
    const localRedeemed = await sumLocalRedeemedPoints();
    const displayedPoints = Math.max(0, nextPoints - localRedeemed);
    const previousPoints = previousPointsRef.current;

    if (
      hasLoadedPointsRef.current &&
      previousPoints !== null &&
      displayedPoints > previousPoints
    ) {
      const gainedPoints = displayedPoints - previousPoints;
      Alert.alert(
        "Points gained",
        `You earned ${gainedPoints} point${gainedPoints === 1 ? "" : "s"}.`,
      );
    }

    previousPointsRef.current = displayedPoints;
    hasLoadedPointsRef.current = true;
    setPoints(displayedPoints);
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
