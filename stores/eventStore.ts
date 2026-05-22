import { EventItem } from "@/types/event";
import { create } from "zustand";

type Store = {
    events: EventItem[];
    setEvents: (events: EventItem[]) => void;
    addEvent: (event: EventItem) => void;
    mergeEvents: (events: EventItem[]) => void;
    updateEvent: (id: string, updates: Partial<EventItem>) => void;
    deleteEvent: (id: string) => void;
};

export const useEventStore = create<Store>((set) => ({
    events: [],

    setEvents: (updater: EventItem[] | ((prev: EventItem[]) => EventItem[])) =>
        set((state) => ({
            events:
            typeof updater === "function"
                ? updater(state.events)
                : updater,
        })),

    addEvent: (event) =>
        set((state) => ({
            events: [event, ...state.events],
        })),

    mergeEvents: (incoming) =>
        set((state) => {
            const map = new Map(state.events.map((e) => [e.id, e]));
            incoming.forEach((e) => map.set(e.id, e));
            return { events: Array.from(map.values()) };
        }),

    updateEvent: (id, updates) =>
        set((state) => ({
            events: state.events.map((e) =>
                e.id === id ? { ...e, ...updates } : e
            ),
        })),

    deleteEvent: (id) =>
        set((state) => ({
            events: state.events.filter((e) => e.id !== id),
        })),
}));