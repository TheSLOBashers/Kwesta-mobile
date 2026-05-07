jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import addQuestCall from "../../scripts/addQuestCall";

describe("addQuestCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("creates a quest successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "quest-1",
        description: "Clean the beach",
        points: 50,
        date: "2026-05-06",
        time: "12:00 PM",
        location: "SLO Beach",
      }),
    });

    const result = await addQuestCall(
      "Clean the beach",
      50,
      "2026-05-06",
      "12:00 PM",
      "SLO Beach",
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          description: "Clean the beach",
          points: 50,
          date: "2026-05-06",
          time: "12:00 PM",
          location: "SLO Beach",
        }),
      }
    );

    expect(result).toEqual({
      _id: "quest-1",
      description: "Clean the beach",
      points: 50,
      date: "2026-05-06",
      time: "12:00 PM",
      location: "SLO Beach",
    });
  });

  it("throws an error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        error: "Server error",
      }),
    });

    await expect(
      addQuestCall(
        "Bad Quest",
        10,
        "2026-05-06",
        "3:00 PM",
        "Nowhere",
        "test-token"
      )
    ).rejects.toThrow("Error: Error: 500");
  });

  it("throws an error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      addQuestCall(
        "Quest",
        20,
        "2026-05-06",
        "1:00 PM",
        "Downtown",
        "test-token"
      )
    ).rejects.toThrow("Error: Network error");
  });

  it("works with a null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "quest-2",
        description: "Public Quest",
      }),
    });

    const result = await addQuestCall(
      "Public Quest",
      5,
      "2026-05-07",
      "10:00 AM",
      "Library",
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
        body: JSON.stringify({
          description: "Public Quest",
          points: 5,
          date: "2026-05-07",
          time: "10:00 AM",
          location: "Library",
        }),
      }
    );

    expect(result).toEqual({
      _id: "quest-2",
      description: "Public Quest",
    });
  });
});