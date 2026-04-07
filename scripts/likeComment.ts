import backend from "@/constants/backend";


const likeComment = async (commentId: any, token: string | null) => {
  try {
    const response = await fetch(
      `${backend}comments/like/${commentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        json.message || `Error: ${response.status}`
      );
    }

    return json.comment;
  } catch (error: any) {
    throw new Error(`Error: ${error.message}`);
  }
};

export default likeComment;
