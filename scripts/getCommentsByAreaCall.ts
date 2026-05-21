import backend from "@/constants/backend";

const getCommentsByAreaCall = async (
  token: string | null,
  lat: number,
  lng: number,
  radius: number,
  since?: string | null,
) => {
  try {
    const url = since
      ? `${backend}comments/area?lat=${lat}&lng=${lng}&radius=${radius}&since=${since}`
      : `${backend}comments/area?lat=${lat}&lng=${lng}&radius=${radius}`;

    const response = await fetch(url, {
      method: "GET", // Specify the method
      headers: {
        "Content-Type": "application/json", // Indicate the content type
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }

    const data = await response.json();

    const commentsArray = data.comments || [];

    return commentsArray.map((c: any) => ({
      id: c._id,
      authorId: c.authorId,
      authorName: c.authorName,
      date: c.date,
      comment: c.comment,
      location: c.location,
      likes: c.likes || 0,
      flag: c.flag,
      likedByUser: c.likedByUser || false,
      flaggedByUser: c.flaggedByUser || false,
      createdAt: c.createdAt,
    }));
  } catch (err) {
    console.error("Error fetching comments:", err);
    return [];
  }
};

export default getCommentsByAreaCall;
