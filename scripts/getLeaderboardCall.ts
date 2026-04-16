//import backend from "@/constants/backend";

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
    // if (!token) {
    //   return { users: [], error: "No auth token available." };
    // }
    // const attempts = [
    //   await fetchUsersWithAuth(token, true),
    //   await fetchUsersWithAuth(token, false),
    // ];
    // const response =
    //   attempts.find((attempt) => attempt.ok) ?? attempts[attempts.length - 1];
    // if (!response.ok) {
    //   if (response.status === 401) {
    //     return {
    //       users: [],
    //       error: "Backend returned 401 Unauthorized for /users.",
    //     };
    //   }
    //   return {
    //     users: [],
    //     error: `Backend returned ${response.status} for /users.`,
    //   };
    // }
    // const data = await response.json();
    // const usersArray = Array.isArray(data)
    //   ? data
    //   : (data.users ?? data.leaderboard ?? data.data ?? []);
    // const users = usersArray
    //   .map(normalizeUser) **need to reimplement**
    //   .sort(
    //     (left: LeaderboardEntry, right: LeaderboardEntry) =>
    //       right.points - left.points,
    //   );

    const users = [...mockLeaderboardUsers].sort(
      (left: LeaderboardEntry, right: LeaderboardEntry) =>
        right.points - left.points,
    );

    return { users, error: null };
  } catch {
    return {
      users: [],
      error: "Request failed before a response was received.",
    };
  }
};

export default getLeaderboardCall;
