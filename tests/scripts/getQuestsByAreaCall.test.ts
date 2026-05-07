jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getQuestsByAreaCall from "../../scripts/getQuestsByAreaCall";

describe("getQuestsByAreaCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches and maps quests by area correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        quests: [
          {
            _id: "q1",
            authorId: "u1",
            authorName: "Alice",
            date: "2026-05-06",
            description: "Pick up trash",
            location: "Park",
            flag: false,
            points: 10,
            time: "10:00 AM",
            joined: true,
          },
        ],
      }),
    });

    const result = await getQuestsByAreaCall(
      "test-token",
      35.28,
      -120.66,
      10
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/area?lat=35.28&lng=-120.66&radius=10",
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
        id: "q1",
        authorId: "u1",
        authorName: "Alice",
        date: "2026-05-06",
        description: "Pick up trash",
        location: "Park",
        flag: false,
        points: 10,
        time: "10:00 AM",
        joined: true,
      },
    ]);
  });

  it("returns empty array when response has no quests field", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await getQuestsByAreaCall("test-token", 1, 2, 3);

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getQuestsByAreaCall("test-token", 1, 2, 3);

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

    const result = await getQuestsByAreaCall("test-token", 1, 2, 3);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching quests:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles null token correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        quests: [],
      }),
    });

    await getQuestsByAreaCall(null, 10, 20, 5);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/area?lat=10&lng=20&radius=5",
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