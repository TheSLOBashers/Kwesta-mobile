import backend from "@/constants/backend";

const deleteProfilePhotoCall = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${backend}profile-photos/${encodeURIComponent(username)}`,
      {
        method: "DELETE",
      },
    );

    return response.ok;
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    return false;
  }
};

export default deleteProfilePhotoCall;
