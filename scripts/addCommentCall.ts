import backend from "@/constants/backend";

const addCommentCall = async (commentData: any, token: string | null) => {
    try {
        const response = await fetch(`${backend}comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(commentData),
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const json = await response.json();
        return json.comment;
    } catch (err: any) {
        console.error("Error adding comment:", err.message);
        return null;
    }
};

export default addCommentCall;