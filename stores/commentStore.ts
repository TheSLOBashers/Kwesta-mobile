import { CommentItem } from "@/types/comment";
import { create } from "zustand";

type Store = {
    comments: CommentItem[];

    setComments: (
        updater: CommentItem[] | ((prev: CommentItem[]) => CommentItem[])
    ) => void;

    addComment: (comment: CommentItem) => void;
    mergeComments: (comments: CommentItem[]) => void;
    updateComment: (id: string, updates: Partial<CommentItem>) => void;
    deleteComment: (id: string) => void;
};

export const useCommentStore = create<Store>((set) => ({
    comments: [],

    setComments: (updater: CommentItem[] | ((prev: CommentItem[]) => CommentItem[])) =>
        set((state) => ({
            comments:
            typeof updater === "function"
                ? updater(state.comments)
                : updater,
        })),

    addComment: (comment) =>
        set((state) => ({
            comments: [comment, ...state.comments],
        })),

    mergeComments: (incoming) =>
        set((state) => {
            const map = new Map(state.comments.map((c) => [c.id, c]));
            incoming.forEach((c) => map.set(c.id, c));
            return { comments: Array.from(map.values()) };
        }),

    updateComment: (id, updates) =>
        set((state) => ({
            comments: state.comments.map((c) =>
                c.id === id ? { ...c, ...updates } : c
            ),
        })),

    deleteComment: (id) =>
        set((state) => ({
            comments: state.comments.filter((c) => c.id !== id),
        })),
}));