import backend from "@/constants/backend";
import { getLocalRedemptions, removeLocalRedemption } from "./localRedemptions";

export default async function syncLocalRedemptions(token: string | null) {
  if (!token) return;

  const url = `${backend.replace(/\/+$/, "")}/users/me/redemptions`;
  const local = await getLocalRedemptions();

  for (const entry of local) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rewardName: entry.rewardName,
          pointsRedeemed: entry.pointsRedeemed,
        }),
      });

      if (response.ok) {
        // successfully synced
        await removeLocalRedemption(entry.id);
      }
      // if not ok, leave it for a later retry
    } catch (e) {
      // network error — give up for now
      console.error("syncLocalRedemptions error", e);
      return;
    }
  }
}
