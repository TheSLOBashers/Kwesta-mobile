jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getMyPostsCall from "../../scripts/getMyPostsCall";

describe("getMyPostsCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and maps comments, events, and quests", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [
          {
            id: "c1",
            authorId: "u1",
            authorName: "Alice",
            date: "2026-05-01",
            location: "SLO",
            comment: "Nice post",
            likes: 2,
            flag: false,
          },
        ],
        events: [
          {
            id: "e1",
            authorId: "u2",
            authorName: "Bob",
            date: "2026-05-02",
            location: "Park",
            description: "Event here",
            likes: 5,
            flag: false,
          },
        ],
        quests: [
          {
            id: "q1",
            authorId: "u3",
            authorName: "Charlie",
            date: "2026-05-03",
            location: "Beach",
            description: "Quest here",
            likes: 7,
            flag: false,
          },
        ],
      }),
    });

    const result = await getMyPostsCall("test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/posts",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(result).toHaveLength(3);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "c1", type: "comment" }),
        expect.objectContaining({ id: "e1", type: "event" }),
        expect.objectContaining({ id: "q1", type: "quest" }),
      ])
    );
  });

  it("handles missing arrays safely", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await getMyPostsCall("test-token");

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getMyPostsCall("test-token");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching my posts:",
      expect.any(Error)
    );
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await getMyPostsCall("test-token");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching my posts:",
      expect.any(Error)
    );
  });

  it("handles null token correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [],
        events: [],
        quests: [],
      }),
    });

    await getMyPostsCall(null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/posts",
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