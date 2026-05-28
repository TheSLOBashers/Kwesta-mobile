import backend from "@/constants/backend";

const uploadProfilePhotoCall = async (username: string, image: File) => {
  try {
    const formData = new FormData();

    formData.append("username", username);
    formData.append("image", image);

    const response = await fetch(`${backend}profile-photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading profile photo:", error);

    return null;
  }
};

export default uploadProfilePhotoCall;
