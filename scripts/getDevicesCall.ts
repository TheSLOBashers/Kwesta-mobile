import backend from "@/constants/backend";

const getDevicesCall = async (
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  token: string | null
) => {
  try {
    setIsLoading(true);

    const response = await fetch(
      `${backend}auth/devices`,
      {
        method: "GET", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          Authorization: `Bearer ${token}`
        }
      }
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return json;
  } catch (error: any) {
    setError(
      error.message ||
        "Unable to connect. Is the server running?"
    );
    throw new Error(`Error: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

export default getDevicesCall;
