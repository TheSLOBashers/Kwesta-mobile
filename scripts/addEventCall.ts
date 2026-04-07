import backend from "@/constants/backend";

const addEventCall = async (eventData: any,  token: string | null) => {
    try {
        const response = await fetch(`${backend}events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (err) {
        console.error("Error adding event:", err);
        return null;
    }
};

export default addEventCall;