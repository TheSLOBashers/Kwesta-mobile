jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import deleteEventCall from "../../scripts/deleteEventCall";

describe("deleteEventCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("calls fetch with correct DELETE request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteEventCall("event-1", "test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/event-1",
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  });

  it("calls fetch with different event id", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });

    await deleteEventCall("abc123", "another-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/abc123",
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
      deleteEventCall("event-1", "test-token")
    ).rejects.toThrow("Network error");
  });
});