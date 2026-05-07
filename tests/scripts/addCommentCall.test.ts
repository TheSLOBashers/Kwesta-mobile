jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

jest.mock("../../scripts/flagComment", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../scripts/utils/profanityFilter", () => ({
  containsFoulLanguage: jest.fn(),
}));

import addCommentCall from "../../scripts/addCommentCall";
import flagComment from "../../scripts/flagComment";
import { containsFoulLanguage } from "../../scripts/utils/profanityFilter";

describe("addCommentCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("creates a comment successfully without flagging", async () => {
    (containsFoulLanguage as jest.Mock).mockReturnValue(false);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          _id: "comment-1",
          comment: "Nice post!",
        },
      }),
    });

    const result = await addCommentCall(
      { comment: "Nice post!" },
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ comment: "Nice post!" }),
      }
    );

    expect(result).toEqual({
      _id: "comment-1",
      id: "comment-1",
      comment: "Nice post!",
      flaggedByUser: false,
    });

    expect(flagComment).not.toHaveBeenCalled();
  });

  it("flags a comment when profanity is detected", async () => {
    (containsFoulLanguage as jest.Mock).mockReturnValue(true);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        comment: {
          _id: "comment-2",
          comment: "bad word",
        },
      }),
    });

    const result = await addCommentCall(
      { comment: "bad word" },
      "test-token"
    );

    expect(flagComment).toHaveBeenCalledWith(
      "comment-2",
      "test-token"
    );

    expect(result).toEqual({
      _id: "comment-2",
      id: "comment-2",
      comment: "bad word",
      flaggedByUser: true,
    });
  });

  it("returns null when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await addCommentCall(
      { comment: "Hello" },
      "test-token"
    );

    expect(result).toBeNull();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("returns null when fetch throws an error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await addCommentCall(
      { comment: "Hello" },
      "test-token"
    );

    expect(result).toBeNull();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error adding comment:",
      "Network error"
    );

    consoleSpy.mockRestore();
  });
});