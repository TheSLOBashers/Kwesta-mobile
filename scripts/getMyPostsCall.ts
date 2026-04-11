import backend from "@/constants/backend";

const getMyPostsCall = async (token: string | null) => {
    try {
        const response = await fetch(`${backend}users/me/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch my posts");
        }

        const data = await response.json();

        const safeComments = Array.isArray(data.comments) ? data.comments : [];
        const safeEvents = Array.isArray(data.events) ? data.events : [];
        const safeQuests = Array.isArray(data.quests) ? data.quests : [];

        const comments = safeComments.map((c: any) => ({
            id: c.id,
            type: "comment",
            authorId: c.authorId,
            authorName: c.authorName,
            date: c.date,
            location: c.location,
            comment: c.comment,
            likes: c.likes,
            flag: c.flag,
        }));

        const events = safeEvents.map((e: any) => ({
            id: e.id,
            type: "event",
            authorId: e.authorId,
            authorName: e.authorName,
            date: e.date,
            location: e.location,
            description: e.description,
            likes: e.likes,
            flag: e.flag,
        }));

        const quests = safeQuests.map((q: any) => ({
            id: q.id,
            type: "quest",
            authorId: q.authorId,
            authorName: q.authorName,
            date: q.date,
            location: q.location,
            description: q.description,
            likes: q.likes,
            flag: q.flag,
        }));

        return [...comments, ...events, ...quests];
    } catch (err) {
        console.error("Error fetching my posts:", err);
        return [];
    }
};

export default getMyPostsCall;