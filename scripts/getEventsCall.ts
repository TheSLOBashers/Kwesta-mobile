import backend from "@/constants/backend";

const getEventsCall = async (token: string | null) => {
    try {
        const response = await fetch(
        `${backend}events`,
        {
            method: "GET", // Specify the method
            headers: {
            "Content-Type": "application/json", // Indicate the content type
            Authorization: `Bearer ${token}`
            }
        }
        );
        if(!response.ok) {
            throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        const eventsArray = data.events || [];

        return eventsArray.map((e: any) => ({
            id: e._id,
            author: e.author?.username || e.author,
            date: e.date,
            time: e.time,
            description: e.description,
            location: e.location,
            joined: e.joined || false,
            image: e.image,
            flag: e.flag,
        }));
    } catch (err) {
        console.error("Error fetching events:", err);
        return [];
    }
};

export default getEventsCall;