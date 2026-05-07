jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import updateCommentCall from "../../scripts/updateCommentCall";

describe("updateCommentCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates a comment successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          id: "c1",
          comment: "updated text",
        },
      }),
    });

    const result = await updateCommentCall(
      "c1",
      { comment: "updated text" },
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/c1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ comment: "updated text" }),
      }
    );

    expect(result).toEqual({
      id: "c1",
      comment: "updated text",
    });
  });

  it("returns null when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await updateCommentCall(
      "c1",
      { comment: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await updateCommentCall(
      "c1",
      { comment: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error updating comment:",
      "Network error"
    );
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          id: "c2",
          comment: "hello",
        },
      }),
    });

    const result = await updateCommentCall(
      "c2",
      { comment: "hello" },
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/c2",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
        body: JSON.stringify({ comment: "hello" }),
      }
    );

    expect(result).toEqual({
      id: "c2",
      comment: "hello",
    });
  });
});