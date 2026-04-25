import backend from "@/constants/backend";
export default async function deleteCommentCall(id: string, token: string) {
    await fetch(`${backend}comments/${id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
}