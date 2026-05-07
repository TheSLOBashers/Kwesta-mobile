jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import deleteQuestCall from "../../scripts/deleteQuestCall";

describe("deleteQuestCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("calls fetch with correct DELETE request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteQuestCall("quest-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/quest-1",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  });

  it("works with different quest ids", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteQuestCall("abc123", "another-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/abc123",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer another-token",
        },
      }
    );
  });

  it("propagates fetch rejection errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      deleteQuestCall("quest-1", "test-token")
    ).rejects.toThrow("Network error");
  });
});