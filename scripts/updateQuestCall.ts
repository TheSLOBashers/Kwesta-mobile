import backend from "@/constants/backend";

const updateQuestCall = async (
    questId: string,
    updatedData: any,
    token: string | null
) => {
    try {
        const response = await fetch(`${backend}quests/${questId}`, {
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

        return json.quest;

    } catch (err: any) {
        console.error("Error updating quest:", err.message);
        return null;
    }
};

export default updateQuestCall;