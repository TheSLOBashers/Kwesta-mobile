import backend from "@/constants/backend";

const getCommentsByAreaUpdates = async (
  token: string | null,
  lat: number,
  lng: number,
  radius: number,
  since?: string | null,
) => {
  try {
    const url = since
      ? `${backend}comments/area/updates?lat=${lat}&lng=${lng}&radius=${radius}&since=${encodeURIComponent(since)}`
      : `${backend}comments/area/updates?lat=${lat}&lng=${lng}&radius=${radius}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch comment updates");
    }

    const data = await response.json();
    const commentsArray = data.comments || [];

    return commentsArray.map((c: any) => ({
      id: c._id ?? c.id,
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
    console.error("Error fetching comment updates:", err);
    return [];
  }
};

export default getCommentsByAreaUpdates;