export type CommentItem = {
    id: string;
    createdAt: string;
    authorId: string;
    authorName: string;
    comment: string;
    
    location: { lat: number; lng: number };
    likes: number;
    likedByUser: boolean;
    flaggedByUser: boolean;

    date?: string;
};