import backend from "@/constants/backend";

async function flagComment(index: any, token: string | null) {
  try {
    const response = await fetch(`${backend}comments/flag/${index}`, {
      method: "PUT", // Specify the method
      headers: {
        "Content-Type": "application/json", // Indicate the content type
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return json;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
}

export default flagComment;
