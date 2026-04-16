import backend from "@/constants/backend";
import flagComment from "./flagComment";
import { containsFoulLanguage } from "./utils/profanityFilter";

const addCommentCall = async (commentData: any, token: string | null) => {
  try {
    const response = await fetch(`${backend}comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const json = await response.json();

    // Create a new comment with the flag so that we can have it update on the carousel
    const newComment = {
      ...json.comment,
      id: json.comment._id,
      flaggedByUser: false,
    };

    // Now we filter the comment
    if (containsFoulLanguage(commentData.comment)) {
      await flagComment(json.comment._id, token);
      newComment.flaggedByUser = true;
    }

    return newComment;
  } catch (err: any) {
    console.error("Error adding comment:", err.message);
    return null;
  }
};

export default addCommentCall;
