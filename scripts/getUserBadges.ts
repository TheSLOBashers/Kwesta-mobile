import backend from "@/constants/backend";

const getUserBadgesCall = async (token: string | null) => {
  const authToken = token;

  if (!authToken) {
    return [];
  }

  try {
    const response = await fetch(`${backend}users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user badges");
    }

    const data = await response.json();
    return data.badges ?? [];
  } catch (error: any) {
    console.error("Error fetching user badges:", error);
    return [];
  }
};

export default getUserBadgesCall;
