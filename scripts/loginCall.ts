import backend from "@/constants/backend";

const loginCall = async (
  username: string,
  password: string,
  setError: (error: string) => void,
  setIsLoading: (loading: boolean) => void,
  setMod: (m : string | null) => void,
  setTokenAs: (token : string | null) => void,
  device_brand: string | null,
  device_designName: string | null,
  device_deviceName: string | null,
  device_deviceYearClass: string | null,
  device_deviceType: string | null
) => {
  try {
    setIsLoading(true);

    device_brand = device_brand ? device_brand : "?";
    device_designName = device_designName ? device_designName : "?";
    device_deviceName = device_deviceName ? device_deviceName : "?";
    device_deviceYearClass = device_deviceYearClass ? device_deviceYearClass : "?";
    device_deviceType = device_deviceType ? device_deviceType : "?";

    const response = await fetch(
      `${backend}auth/login`,
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json" // Indicate the content type
        },
        body: JSON.stringify({ username, password, device_brand: device_brand, device_designName: device_designName, device_deviceName: device_deviceName, device_deviceYearClass: device_deviceYearClass, device_deviceType: device_deviceType }) // Convert the data to a JSON string
      }
    );

    const json = await response.json();
    if (!response.ok) {
      if (json.message === "Invalid username or password") {
        setError(json.message);
        throw new Error(`${json.message}`);
      } else if (json.message === "Account banned") {
        setError(json.message);
        throw new Error(`${json.message}`);
      }
      throw new Error(`${json.message}`);
    }

    if (json.permissions && (json.permissions === "moderator" || json.permissions === "admin")) {
      setMod("True");
    }
    setTokenAs(json.token);
    setError("");
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

export default loginCall;
