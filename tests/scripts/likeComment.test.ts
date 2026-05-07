jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import likeComment from "../../scripts/likeComment";

describe("likeComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("likes a comment successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          id: "c1",
          likes: 10,
        },
      }),
    });

    const result = await likeComment("c1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/like/c1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(result).toEqual({
      id: "c1",
      likes: 10,
    });
  });

  it("throws error when response is not ok with message", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        message: "Something went wrong",
      }),
    });

    await expect(
      likeComment("c1", "test-token")
    ).rejects.toThrow("Error: Something went wrong");
  });

  it("throws fallback error when no message is provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await expect(
      likeComment("c1", "test-token")
    ).rejects.toThrow("Error: 400");
  });

  it("throws error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      likeComment("c1", "test-token")
    ).rejects.toThrow("Error: Network error");
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          id: "c2",
          likes: 1,
        },
      }),
    });

    const result = await likeComment("c2", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/like/c2",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
      }
    );

    expect(result).toEqual({
      id: "c2",
      likes: 1,
    });
  });
});