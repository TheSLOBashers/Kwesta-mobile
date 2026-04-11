import backend from "@/constants/backend";

const updateEventCall = async (
    eventId: string,
    updatedData: any,
    token: string | null
) => {
    try {
        const response = await fetch(`${backend}events/${eventId}`, {
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

        return json.event;

    } catch (err: any) {
        console.error("Error updating event:", err.message);
        return null;
    }
};

export default updateEventCall;