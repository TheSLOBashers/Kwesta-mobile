jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getCommentsByAreaCall from "../../scripts/getCommentsByAreaCall";

describe("getCommentsByAreaCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches and maps comments by area correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [
          {
            _id: "c1",
            authorId: "u1",
            authorName: "Alice",
            date: "2026-05-06",
            comment: "Hello world",
            location: "SLO",
            likes: 5,
            flag: false,
            likedByUser: true,
            flaggedByUser: false,
          },
        ],
      }),
    });

    const result = await getCommentsByAreaCall(
      "test-token",
      35.28,
      -120.66,
      10
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/area?lat=35.28&lng=-120.66&radius=10",
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
        comment: "Hello world",
        location: "SLO",
        likes: 5,
        flag: false,
        likedByUser: true,
        flaggedByUser: false,
      },
    ]);
  });

  it("returns empty array when response has no comments field", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const result = await getCommentsByAreaCall(
      "test-token",
      1,
      2,
      3
    );

    expect(result).toEqual([]);
  });

  it("returns empty array when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getCommentsByAreaCall(
      "test-token",
      1,
      2,
      3
    );

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("handles fetch failure gracefully", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await getCommentsByAreaCall(
      "test-token",
      1,
      2,
      3
    );

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching comments:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("handles null token correctly in request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comments: [],
      }),
    });

    await getCommentsByAreaCall(null, 10, 20, 5);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/area?lat=10&lng=20&radius=5",
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