jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getEventsByAreaCall from "../../scripts/getEventsByAreaCall";

describe("getEventsByAreaCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches and maps events by area correctly", async () => {
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

    const result = await getEventsByAreaCall(
      "test-token",
      35.28,
      -120.66,
      10
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/area?lat=35.28&lng=-120.66&radius=10",
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

    const result = await getEventsByAreaCall("test-token", 1, 2, 3);

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getEventsByAreaCall("test-token", 1, 2, 3);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("handles fetch errors gracefully", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await getEventsByAreaCall("test-token", 1, 2, 3);

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

    await getEventsByAreaCall(null, 10, 20, 5);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/area?lat=10&lng=20&radius=5",
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