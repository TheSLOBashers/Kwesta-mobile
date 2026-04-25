import backend from "@/constants/backend";
export default async function deleteQuestCall(id: string, token: string) {
    await fetch(`${backend}quests/${id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
}