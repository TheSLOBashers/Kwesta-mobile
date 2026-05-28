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

    const blob = await response.blob();

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error getting profile photo:", error);

    return null;
  }
};

export default getProfilePhotoCall;
