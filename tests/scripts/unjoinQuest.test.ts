jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import unjoinQuest from "../../scripts/unjoinQuest";

describe("unjoinQuest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("unjoins a quest successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        joined: false,
      }),
    });

    const result = await unjoinQuest("quest-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/unjoin/quest-1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(result).toEqual({
      success: true,
      joined: false,
    });
  });

  it("throws error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "server error" }),
    });

    await expect(
      unjoinQuest("quest-1", "test-token")
    ).rejects.toThrow("Error: Error: 500");
  });

  it("throws error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      unjoinQuest("quest-1", "test-token")
    ).rejects.toThrow("Error: Network error");
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    const result = await unjoinQuest("quest-2", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/unjoin/quest-2",
      {
        method: "POST",
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