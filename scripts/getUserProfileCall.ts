import backend from "@/constants/backend";

export type SocialUser = {
  id: string;
  username: string;
  points: number;
};

export type UserProfile = {
  username: string;
  points: number;
  permissions?: string;
  followers: SocialUser[];
  following: SocialUser[];
  followersCount: number;
  followingCount: number;
};

const normalizeSocialUser = (user: any): SocialUser => ({
  id: String(user?._id ?? user?.id ?? user?.userId ?? ""),
  username: String(user?.username ?? "Unknown"),
  points: Number(user?.points ?? 0) || 0,
});

const getUserProfileCall = async (
  token: string | null,
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${backend}users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    const followers = Array.isArray(data.followers)
      ? data.followers.map(normalizeSocialUser)
      : [];
    const following = Array.isArray(data.following)
      ? data.following.map(normalizeSocialUser)
      : [];

    return {
      username: String(data.username ?? ""),
      points: Number(data.points ?? 0) || 0,
      permissions: data.permissions,
      followers,
      following,
      followersCount: Number(data.followersCount ?? followers.length) || 0,
      followingCount: Number(data.followingCount ?? following.length) || 0,
    };
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
};

export default getUserProfileCall;
