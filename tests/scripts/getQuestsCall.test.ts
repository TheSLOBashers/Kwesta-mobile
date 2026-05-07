jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getQuestsCall from "../../scripts/getQuestsCall";

describe("getQuestsCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches and maps quests correctly", async () => {
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

    const result = await getQuestsCall("test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests",
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

    const result = await getQuestsCall("test-token");

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getQuestsCall("test-token");

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

    const result = await getQuestsCall("test-token");

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

    await getQuestsCall(null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests",
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