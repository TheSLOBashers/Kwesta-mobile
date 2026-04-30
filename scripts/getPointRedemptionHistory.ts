import backend from "@/constants/backend";
import { getLocalRedemptions } from "./localRedemptions";

export type PointRedemptionHistoryEntry = {
  id: string;
  rewardName: string;
  pointsRedeemed: number;
  redeemedAt: string;
  status: string;
};

type PointRedemptionHistoryResult = {
  entries: PointRedemptionHistoryEntry[];
  usingMockData: boolean;
  error: string | null;
};

const mockPointRedemptionHistory: PointRedemptionHistoryEntry[] = [
  {
    id: "mock-redemption-1",
    rewardName: "Campus Cafe Gift Card",
    pointsRedeemed: 150,
    redeemedAt: "2026-04-11T18:20:00.000Z",
    status: "completed",
  },
  {
    id: "mock-redemption-2",
    rewardName: "Bookstore Discount Voucher",
    pointsRedeemed: 90,
    redeemedAt: "2026-03-30T21:05:00.000Z",
    status: "completed",
  },
  {
    id: "mock-redemption-3",
    rewardName: "Rec Center Day Pass",
    pointsRedeemed: 60,
    redeemedAt: "2026-03-18T16:45:00.000Z",
    status: "pending",
  },
];

function toArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const candidateArrays = [
    data.entries,
    data.redemptions,
    data.history,
    data.data,
    data.items,
    data.results,
  ];

  const foundArray = candidateArrays.find((value) => Array.isArray(value));
  return Array.isArray(foundArray) ? foundArray : [];
}

function normalizeEntry(
  raw: any,
  index: number,
): PointRedemptionHistoryEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const rawPoints =
    raw.pointsRedeemed ?? raw.points ?? raw.cost ?? raw.amount ?? raw.value;
  const parsedPoints = Number(rawPoints);

  if (!Number.isFinite(parsedPoints)) {
    return null;
  }

  const id = String(raw.id ?? raw._id ?? `redemption-${index}`);
  const rewardName = String(
    raw.rewardName ?? raw.reward ?? raw.title ?? raw.name ?? "Redemption",
  );
  const redeemedAt = String(
    raw.redeemedAt ?? raw.createdAt ?? raw.date ?? new Date().toISOString(),
  );
  const status = String(raw.status ?? "completed");

  return {
    id,
    rewardName,
    pointsRedeemed: Math.abs(Math.round(parsedPoints)),
    redeemedAt,
    status,
  };
}

function buildRedemptionsUrl(): string {
  return `${backend.replace(/\/+$/, "")}/users/me/redemptions`;
}

async function fetchBackendHistory(
  authToken: string,
): Promise<PointRedemptionHistoryEntry[]> {
  const response = await fetch(buildRedemptionsUrl(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch redemption history from backend.");
  }

  const data = await response.json();
  const entries = toArray(data)
    .map(normalizeEntry)
    .filter((entry): entry is PointRedemptionHistoryEntry => entry !== null)
    .sort(
      (left, right) =>
        new Date(right.redeemedAt).getTime() -
        new Date(left.redeemedAt).getTime(),
    );

  return entries;
}

const getPointRedemptionHistory = async (
  token: string | null,
): Promise<PointRedemptionHistoryResult> => {
  if (!token) {
    return {
      entries: [...mockPointRedemptionHistory],
      usingMockData: true,
      error: "No auth token available for redemption history.",
    };
  }

  try {
    const entries = await fetchBackendHistory(token);
    // include any local redemptions saved when backend endpoint wasn't available
    try {
      const local = await getLocalRedemptions();
      const mapped = local.map((l) => ({
        id: l.id,
        rewardName: l.rewardName,
        pointsRedeemed: l.pointsRedeemed,
        redeemedAt: l.redeemedAt,
        status: l.status,
      }));
      const merged = [...mapped, ...entries].sort(
        (left, right) =>
          new Date(right.redeemedAt).getTime() -
          new Date(left.redeemedAt).getTime(),
      );
      return {
        entries: merged,
        usingMockData: false,
        error: null,
      };
    } catch (e) {
      return {
        entries,
        usingMockData: false,
        error: null,
      };
    }
  } catch (error: any) {
    // backend failed - include local redemptions in the fallback history
    try {
      const local = await getLocalRedemptions();
      const mapped = local.map((l) => ({
        id: l.id,
        rewardName: l.rewardName,
        pointsRedeemed: l.pointsRedeemed,
        redeemedAt: l.redeemedAt,
        status: l.status,
      }));
      const merged = [...mapped, ...mockPointRedemptionHistory].sort(
        (left, right) =>
          new Date(right.redeemedAt).getTime() -
          new Date(left.redeemedAt).getTime(),
      );

      return {
        entries: merged,
        usingMockData: true,
        error:
          error?.message ??
          "Failed to load redemption history from backend. Showing mock data.",
      };
    } catch (e) {
      return {
        entries: [...mockPointRedemptionHistory],
        usingMockData: true,
        error:
          error?.message ??
          "Failed to load redemption history from backend. Showing mock data.",
      };
    }
  }
};

export default getPointRedemptionHistory;
