import backend from "@/constants/backend";

const followUserCall = async (
  token: string | null,
  userId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${backend}users/me/following/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to follow user");
    }

    return true;
  } catch (err) {
    console.error("Error following user:", err);
    return false;
  }
};

export default followUserCall;
