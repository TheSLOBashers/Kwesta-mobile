import backend from "@/constants/backend";

async function unflagComment(index: any, token: string | null) {
    try {

    const response = await fetch(
      `${backend}comments/unflag/${index}`,
      {
        method: "PUT", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const json = await response.json();
    if (!response.ok) {
      console.log("UNFLAG ERROR RESPONSE:", json);
      throw new Error(json.error || `Status ${response.status}`);
    }

    return json;

  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  } 
}

export default unflagComment;