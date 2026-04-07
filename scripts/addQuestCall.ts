import backend from "@/constants/backend";

async function addQuestCall(description: any, points: any, date: any, time: any, location: any, token: string | null) {
    try {

    const response = await fetch(
      `${backend}quests/`,
      {
        method: "POST", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ description, points, date, time, location })
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

export default addQuestCall;