import backend from "@/constants/backend";

const uploadProfilePhotoCall = async (
  username: string,
  image: {
    uri: string;
    name: string;
    type: string;
  },
) => {
  if (username === "") {
    console.error("Invalid empty username for uploading photo.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("username", username);
    formData.append("image", image as any);

    const response = await fetch(`${backend}profile-photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Upload failed:", response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading profile photo:", error);

    return null;
  }
};

export default uploadProfilePhotoCall;
