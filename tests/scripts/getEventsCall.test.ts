jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getEventsCall from "../../scripts/getEventsCall";

describe("getEventsCall", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();

        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("fetches and maps events correctly", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
            events: [
                {
                    _id: "e1",
                    authorId: "u1",
                    authorName: "Bob",
                    date: "2026-05-06",
                    time: "12:00 PM",
                    description: "Beach cleanup",
                    location: "SLO Beach",
                    joined: true,
                    image: "img.png",
                    flag: false,
                },
            ],
        }),
        });

        const result = await getEventsCall("test-token");

        expect(global.fetch).toHaveBeenCalledWith(
            "https://test-api.com/events",
            {
                method: "GET",
                headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer test-token",
                },
            }
        );

        expect(result).toEqual([
            {
                id: "e1",
                authorId: "u1",
                authorName: "Bob",
                date: "2026-05-06",
                time: "12:00 PM",
                description: "Beach cleanup",
                location: "SLO Beach",
                joined: true,
                image: "img.png",
                flag: false,
            },
        ]);
    });

    it("returns empty array when response has no events field", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        const result = await getEventsCall("test-token");

        expect(result).toEqual([]);
    });

    it("returns empty array when response is not ok and logs error text", async () => {
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        const errorTextSpy = jest.fn().mockResolvedValue("Server error");

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            text: errorTextSpy,
        });

        const result = await getEventsCall("test-token");

        expect(errorTextSpy).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
            "RAW ERROR RESPONSE:",
            "Server error"
        );
        expect(result).toEqual([]);

        consoleSpy.mockRestore();
    });

    it("handles fetch errors gracefully", async () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        (global.fetch as jest.Mock).mockRejectedValue(
            new Error("Network error")
        );

        const result = await getEventsCall("test-token");

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error fetching events:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it("handles null token correctly", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                events: [],
            }),
        });

        await getEventsCall(null);

        expect(global.fetch).toHaveBeenCalledWith(
        "https://test-api.com/events",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer null",
                },
            }
        );
    });
});