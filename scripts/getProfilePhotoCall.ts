import backend from "@/constants/backend";

// Gets profile photo and returns it as a url
const getProfilePhotoCall = async (
  username: string,
): Promise<string | null> => {
  const url = `${backend}profile-photos/${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return `${url}?t=${Date.now()}`;
  } catch (error) {
    console.error("Error getting profile photo:", error);
    return null;
  }
};

export default getProfilePhotoCall;
