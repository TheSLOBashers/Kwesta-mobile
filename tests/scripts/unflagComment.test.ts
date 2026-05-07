jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import unflagComment from "../../scripts/unflagComment";

describe("unflagComment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();

        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

  it("unflags a comment successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        flagged: false,
      }),
    });

    const result = await unflagComment("c1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/unflag/c1",
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
      flagged: false,
    });
  });

  it("logs and throws error when response is not ok", async () => {
    const consoleSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Something failed",
      }),
      status: 500,
    });

    await expect(
      unflagComment("c1", "test-token")
    ).rejects.toThrow("Error: Something failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "UNFLAG ERROR RESPONSE:",
      { error: "Something failed" }
    );

    consoleSpy.mockRestore();
  });

  it("throws fallback error when no error field exists", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    });

    await expect(
      unflagComment("c1", "test-token")
    ).rejects.toThrow("Error: Status 400");
  });

  it("throws error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      unflagComment("c1", "test-token")
    ).rejects.toThrow("Error: Network error");
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    const result = await unflagComment("c2", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/comments/unflag/c2",
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