import backend from "@/constants/backend";

const blockDeviceCall = async (
  token: string | null,
  device: any
) => {
  try {
    const response = await fetch(
      `${backend}auth/blockDevice`,
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({device: device})
      }
    );

    if (!response.ok) {
      throw new Error(`Status: ${response.status} : ${response.text}`);
    }

    return true;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export default blockDeviceCall;
