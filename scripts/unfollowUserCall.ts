import backend from "@/constants/backend";

const unfollowUserCall = async (
  token: string | null,
  userId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${backend}users/me/following/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to unfollow user");
    }

    return true;
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return false;
  }
};

export default unfollowUserCall;
