import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalRedemption = {
  id: string;
  rewardName: string;
  pointsRedeemed: number;
  redeemedAt: string; // ISO
  status: string;
};

const KEY = "local_point_redemptions";

export async function getLocalRedemptions(): Promise<LocalRedemption[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalRedemption[];
  } catch (e) {
    console.error("getLocalRedemptions error", e);
    return [];
  }
}

export async function addLocalRedemption(entry: LocalRedemption) {
  try {
    const existing = await getLocalRedemptions();
    const next = [entry, ...existing];
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.error("addLocalRedemption error", e);
  }
}

export async function clearLocalRedemptions() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.error("clearLocalRedemptions error", e);
  }
}

export async function removeLocalRedemption(id: string) {
  try {
    const existing = await getLocalRedemptions();
    const next = existing.filter((e) => e.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    console.error("removeLocalRedemption error", e);
  }
}

export async function sumLocalRedeemedPoints(): Promise<number> {
  try {
    const arr = await getLocalRedemptions();
    return arr.reduce((s, e) => s + (Number(e.pointsRedeemed) || 0), 0);
  } catch (e) {
    console.error("sumLocalRedeemedPoints error", e);
    return 0;
  }
}
