import { useState, useCallback } from "react";

export function useSnappedCard(initialIndex = 0) {
  const [active, setActive] = useState(initialIndex);

  // Call this whenever scrolling ends
  const snapToCard = useCallback((offsetX: number, cardWidth: number, cardMargin: number, totalCards: number) => {
    const totalCardWidth = cardWidth + cardMargin;
    const index = Math.round(offsetX / totalCardWidth);
    const clampedIndex = Math.max(0, Math.min(index, totalCards - 1));
    setActive(clampedIndex);
    return clampedIndex; // useful for scrollTo
  }, []);

  return { active, setActive, snapToCard };
}