import backend from "@/constants/backend";
import { addLocalRedemption } from "./localRedemptions";

const redeemPointsCall = async (
  token: string | null,
  rewardName: string,
  pointsRedeemed: number,
) => {
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const url = `${backend.replace(/\/+$/, "")}/users/me/redemptions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rewardName, pointsRedeemed }),
    });

    if (!response.ok) {
      const body = await response.text();
      // If backend does not implement this endpoint, fall back to local redemption
      if (
        response.status === 404 ||
        /Cannot POST \/users\/me\/redemptions/.test(body)
      ) {
        const now = new Date().toISOString();
        const localEntry = {
          id: `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          rewardName,
          pointsRedeemed,
          redeemedAt: now,
          status: "pending",
        };
        await addLocalRedemption(localEntry as any);
        return { usingLocal: true, entry: localEntry };
      }

      throw new Error(`Redemption failed: ${response.status} ${body}`);
    }

    const data = await response.json();
    return { usingLocal: false, entry: data };
  } catch (error: any) {
    console.error("redeemPointsCall error:", error);
    // If network error, persist locally as fallback
    const now = new Date().toISOString();
    const localEntry = {
      id: `local-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      rewardName,
      pointsRedeemed,
      redeemedAt: now,
      status: "pending",
    };
    try {
      await addLocalRedemption(localEntry as any);
      return { usingLocal: true, entry: localEntry };
    } catch (e) {
      throw error;
    }
  }
};

export default redeemPointsCall;
