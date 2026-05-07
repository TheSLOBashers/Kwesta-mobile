jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getCommentsCall from "../../scripts/getCommentsCall";

describe("getCommentsCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches and maps comments correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [
          {
            _id: "c1",
            authorId: "u1",
            authorName: "Alice",
            date: "2026-05-06",
            comment: "Hello",
            location: "SLO",
            likes: 3,
            flag: false,
            likedByUser: true,
            flaggedByUser: false,
          },
        ],
      }),
    });

    const result = await getCommentsCall("test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments",
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
        id: "c1",
        authorId: "u1",
        authorName: "Alice",
        date: "2026-05-06",
        comment: "Hello",
        location: "SLO",
        likes: 3,
        flag: false,
        likedByUser: true,
        flaggedByUser: false,
      },
    ]);
  });

  it("returns empty array when no comments field exists", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await getCommentsCall("test-token");

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getCommentsCall("test-token");

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

    const result = await getCommentsCall("test-token");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching comments:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles null token correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [],
      }),
    });

    await getCommentsCall(null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments",
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