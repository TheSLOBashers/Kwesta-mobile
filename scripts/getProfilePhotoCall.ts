import backend from "@/constants/backend";

// Gets profile photo and returns it as a url
const getProfilePhotoCall = async (
  username: string,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${backend}profile-photos/${encodeURIComponent(username)}`,
    );

    if (!response.ok) {
      return null;
    }

    return `${backend}profile-photos/${encodeURIComponent(username)}`;
  } catch (error) {
    console.error("Error getting profile photo:", error);
    return null;
  }
};

export default getProfilePhotoCall;
