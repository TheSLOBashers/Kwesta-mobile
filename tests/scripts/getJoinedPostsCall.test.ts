jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getJoinedPostsCall from "../../scripts/getJoinedPostsCall";

describe("getJoinedPostsCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and merges joined events and quests sorted by date", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            id: "e1",
            authorId: "u1",
            authorName: "Bob",
            date: "2026-05-07",
            location: "SLO",
            description: "Event 1",
            likes: 2,
            flag: false,
            joined: true,
          },
        ],
        quests: [
          {
            id: "q1",
            authorId: "u2",
            authorName: "Alice",
            date: "2026-05-06",
            location: "Park",
            description: "Quest 1",
            likes: 5,
            flag: false,
            joined: false,
          },
        ],
      }),
    });

    const result = await getJoinedPostsCall("test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/joinedPosts",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "q1",
        type: "quest",
      })
    );

    expect(result[1]).toEqual(
      expect.objectContaining({
        id: "e1",
        type: "event",
      })
    );
  });

  it("returns empty array when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getJoinedPostsCall("test-token");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("handles missing events and quests safely", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await getJoinedPostsCall("test-token");

    expect(result).toEqual([]);
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await getJoinedPostsCall("test-token");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching joined posts:",
      expect.any(Error)
    );
  });

  it("handles null token correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [],
        quests: [],
      }),
    });

    await getJoinedPostsCall(null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/joinedPosts",
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