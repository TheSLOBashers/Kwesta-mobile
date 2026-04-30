import backend from "@/constants/backend";

async function checkValidToken(token: string | null) {
    try {

    const response = await fetch(
      `${backend}auth/test`,
      {
        method: "GET", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return true;

  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  } 
}

export default checkValidToken;