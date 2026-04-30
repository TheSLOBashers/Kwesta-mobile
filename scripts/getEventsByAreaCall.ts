import backend from "@/constants/backend";

const getEventsByAreaCall = async (token: string | null, lat: number, lng: number, radius: number) => {
  try {
    const response = await fetch(
      `${backend}events/area?lat=${lat}&lng=${lng}&radius=${radius}`,
      {
        method: "GET", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();

    const eventsArray = data.events || [];

    return eventsArray.map((e: any) => ({
        id: e._id,
        authorId: e.authorId,
        authorName: e.authorName,
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

export default getEventsByAreaCall;