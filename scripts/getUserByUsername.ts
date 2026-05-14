import backend from "@/constants/backend";

const getUserByUsernameCall = async (
  username: string
) => {
  if (!username) {
    return null;
  }

  try {
    const response = await fetch(
      `${backend}users/username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(
      "Error fetching user by username:",
      error
    );
    return null;
  }
};

export default getUserByUsernameCall;