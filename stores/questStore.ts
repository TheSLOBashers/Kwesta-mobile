import { QuestItem } from "@/types/quest";
import { create } from "zustand";

type Store = {
  quests: QuestItem[];

    setQuests: (quests: QuestItem[]) => void;
    addQuest: (quest: QuestItem) => void;
    mergeQuests: (quests: QuestItem[]) => void;
    updateQuest: (id: string, updates: Partial<QuestItem>) => void;
    deleteQuest: (id: string) => void;
};

export const useQuestStore = create<Store>((set) => ({
    quests: [],

    setQuests: (updater: QuestItem[] | ((prev: QuestItem[]) => QuestItem[])) =>
            set((state) => ({
                quests:
                typeof updater === "function"
                    ? updater(state.quests)
                    : updater,
            })),

    addQuest: (quest) =>
        set((state) => ({
            quests: [quest, ...state.quests],
        })),

    mergeQuests: (incoming) =>
        set((state) => {
            const map = new Map(state.quests.map((q) => [q.id, q]));
            incoming.forEach((q) => map.set(q.id, q));
            return { quests: Array.from(map.values()) };
        }),

    updateQuest: (id, updates) =>
        set((state) => ({
            quests: state.quests.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            ),
        })),

    deleteQuest: (id) =>
        set((state) => ({
        quests: state.quests.filter((q) => q.id !== id),
        })),
}));