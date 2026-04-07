import backend from "@/constants/backend";

async function unjoinQuest(index: any, token: string | null) {
    try {

    const response = await fetch(
      `${backend}quests/unjoin/${index}`,
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          "Authorization": `Bearer ${token}`
        }
      }
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return json;

  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  } 
}

export default unjoinQuest;