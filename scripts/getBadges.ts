import backend from "@/constants/backend";

const getBadgesCall = async (
): Promise<boolean> => {
  try {
    const response = await fetch(`${backend}badges`, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("Failed to get badges");
    }

    return response.json();
  } catch (err) {
    console.error("Error getting badges:", err);
    return false;
  }
};

export default getBadgesCall;
