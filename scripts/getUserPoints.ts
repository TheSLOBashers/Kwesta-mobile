import backend from "@/constants/backend";

const getUserPointsCall = async (token: string | null) => {
  const authToken = token;

  if (!authToken) {
    return 0;
  }

  try {
    const response = await fetch(
      `${backend}users/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user points");
    }

    const data = await response.json();
    return data.points || 0;
  } catch (error: any) {
    console.error("Error fetching user points:", error);
    return 0;
  }
};

export default getUserPointsCall;
