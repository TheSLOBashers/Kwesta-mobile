import backend from "@/constants/backend";

const updateCommentCall = async (
    commentId: string,
    updatedData: any,
    token: string | null
) => {
    try {
        const response = await fetch(`${backend}comments/${commentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const json = await response.json();

        return json.comment;

    } catch (err: any) {
        console.error("Error updating comment:", err.message);
        return null;
    }
};

export default updateCommentCall;