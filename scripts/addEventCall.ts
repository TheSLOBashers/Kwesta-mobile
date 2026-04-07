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
            let text = await response.text();
            throw new Error(`Error: ${String(text)}`);
        }

        const json = await response.json();
        return json;
    } catch (err: any) {
        console.error("Error adding event:", err.message);
        return null;
    }
};

export default addEventCall;