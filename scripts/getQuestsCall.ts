import backend from "@/constants/backend";

const getQuestsCall = async (token: string | null) => {
  try {
    const response = await fetch(
      `${backend}quests`,
      {
        method: "GET", // Specify the method
        headers: {
          "Content-Type": "application/json", // Indicate the content type
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch quests");
    }

    const data = await response.json();

    const questsArray = data.quests || [];

    return questsArray.map((q: any) => ({
      id: q._id,
      authorId: q.authorId,
      authorName: q.authorName,
      date: q.date,
      description: q.description,
      location: q.location,
      flag: q.flag,
      points: q.points,
      time: q.time,
      joined: q.joined || false
    }));
  } catch (err) {
    console.error("Error fetching quests:", err);
    return [];
  }
};

export default getQuestsCall;
