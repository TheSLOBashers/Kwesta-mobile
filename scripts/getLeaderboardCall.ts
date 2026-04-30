import backend from "../constants/backend";

type LeaderboardEntry = {
  id: string;
  name: string;
  undername: string;
  points: number;
};

type LeaderboardResult = {
  users: LeaderboardEntry[];
  error: string | null;
};

const mockLeaderboardUsers: LeaderboardEntry[] = [
  { id: "1", name: "Ava Martinez", undername: "@ava", points: 1240 },
  { id: "2", name: "Noah Kim", undername: "@noahk", points: 1195 },
  { id: "3", name: "Sophia Patel", undername: "@sophiap", points: 1104 },
  { id: "4", name: "Liam Johnson", undername: "@liamj", points: 987 },
  { id: "5", name: "Mia Chen", undername: "@mia", points: 904 },
  { id: "6", name: "Ethan Brown", undername: "@ethanb", points: 842 },
];
// async function fetchUsersWithAuth(token: string, useBearer: boolean) {
//   return fetch(`${backend}users`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: useBearer ? `Bearer ${token}` : token,
//     },
//   });
// }

const getLeaderboardCall = async (
  token: string | null,
): Promise<LeaderboardResult> => {
  try {
    // try to fetch real users from backend
    const res = await fetch(`${backend}users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      // fallback to mock on non-OK response
      const users = [...mockLeaderboardUsers].sort(
        (l: LeaderboardEntry, r: LeaderboardEntry) => r.points - l.points,
      );
      return { users, error: `Backend returned ${res.status} for /users.` };
    }

    const data = await res.json();
    const usersArray: any[] = Array.isArray(data)
      ? data
      : (data.users_list ?? data.users ?? data.leaderboard ?? data.data ?? []);

    const normalizeUser = (u: any): LeaderboardEntry => {
      const id = u._id ?? u.id ?? u.userId ?? "";
      const username = u.username ?? u.handle ?? u.undername ?? "";
      const name =
        (u.name ?? u.displayName ?? u.fullName ?? username) || "Unknown";
      const undername = username
        ? `@${username.replace(/^@/, "")}`
        : (u.undername ?? "");
      const points = Number(u.points ?? u.score ?? u.totalPoints ?? 0) || 0;

      return {
        id: String(id),
        name,
        undername,
        points,
      };
    };

    const users = usersArray
      .map(normalizeUser)
      .sort((a, b) => b.points - a.points);

    return { users, error: null };
  } catch {
    return {
      users: [],
      error: "Request failed before a response was received.",
    };
  }
};

export default getLeaderboardCall;
