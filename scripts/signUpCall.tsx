import backend from "@/constants/backend";

const signupCall = async (
  username: string,
  email: string,
  password: string,
  setError: (error: string) => void,
  setIsLoading: (loading: boolean) => void,
) => {
  try {
    setIsLoading(true);

    const response = await fetch(
      `${backend}users`,
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json" // Indicate the content type
        },
        body: JSON.stringify({ username, email, password }) // Convert the data to a JSON string
      }
    );

    const json = await response.json();
    if (!response.ok) {
      if (
        json.message === "Username already exists" ||
        json.message === "Email already exists"
      ) {
        setError(json.message);
        throw new Error(`${json.message}`);
      }
      throw new Error(`Error: ${response.status}`);
    }
    setError("");
  } catch (error: any) {
    setError(
      error.message ||
        "Unable to connect. Is the server running?"
    );
    throw new Error(`${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

export default signupCall;
