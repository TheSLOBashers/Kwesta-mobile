jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import flagComment from "../../scripts/flagComment";

describe("flagComment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("flags a comment successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        flagged: true,
      }),
    });

    const result = await flagComment("comment-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/flag/comment-1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(result).toEqual({
      success: true,
      flagged: true,
    });
  });

  it("throws error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "server error" }),
    });

    await expect(
      flagComment("comment-1", "test-token")
    ).rejects.toThrow("Error: Error: 500");
  });

  it("throws error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network failure")
    );

    await expect(
      flagComment("comment-1", "test-token")
    ).rejects.toThrow("Error: Network failure");
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    const result = await flagComment("comment-2", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/flag/comment-2",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
      }
    );

    expect(result).toEqual({
      success: true,
    });
  });
});