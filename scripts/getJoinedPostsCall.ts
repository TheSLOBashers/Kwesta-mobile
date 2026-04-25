import backend from "@/constants/backend";

const getJoinedPostsCall = async (token: string | null) => {
    try {
        const response = await fetch(`${backend}users/me/joinedPosts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch joined posts");
        }

        const data = await response.json();

        const safeEvents = Array.isArray(data.events) ? data.events : [];
        const safeQuests = Array.isArray(data.quests) ? data.quests : [];

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
            joined: e.joined || true,
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
            joined: q.joined || true,
        }));

        return [...events, ...quests].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    } catch (err) {
        console.error("Error fetching joined posts:", err);
        return [];
    }
};

export default getJoinedPostsCall;