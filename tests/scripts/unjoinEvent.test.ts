jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import unjoinEvent from "../../scripts/unjoinEvent";

describe("unjoinEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("unjoins an event successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        joined: false,
      }),
    });

    const result = await unjoinEvent("event-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/unjoin/event-1",
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
      unjoinEvent("event-1", "test-token")
    ).rejects.toThrow("Error: Error: 500");
  });

  it("throws error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      unjoinEvent("event-1", "test-token")
    ).rejects.toThrow("Error: Network error");
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    const result = await unjoinEvent("event-2", null);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/unjoin/event-2",
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