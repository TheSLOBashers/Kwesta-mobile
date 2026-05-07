jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import deleteCommentCall from "../../scripts/deleteCommentCall";

describe("deleteCommentCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("calls fetch with the correct DELETE request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteCommentCall("comment-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/comment-1",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  });

  it("works with different comment ids", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteCommentCall("abc123", "another-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/abc123",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer another-token",
        },
      }
    );
  });

  it("propagates fetch errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      deleteCommentCall("comment-1", "test-token")
    ).rejects.toThrow("Network error");
  });
});