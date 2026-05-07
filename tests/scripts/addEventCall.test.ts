jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import addEventCall from "../../scripts/addEventCall";

describe("addEventCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("creates an event successfully", async () => {
    const mockEvent = {
      title: "Test Event",
      location: "Campus",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "event-1",
        title: "Test Event",
        location: "Campus",
      }),
    });

    const result = await addEventCall(
      mockEvent,
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(mockEvent),
      }
    );

    expect(result).toEqual({
      _id: "event-1",
      title: "Test Event",
      location: "Campus",
    });
  });

  it("returns null when fetch response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: async () => "Internal Server Error",
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await addEventCall(
      { title: "Bad Event" },
      "test-token"
    );

    expect(result).toBeNull();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error adding event:",
      "Error: Internal Server Error"
    );

    consoleSpy.mockRestore();
  });

  it("returns null when fetch throws an error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await addEventCall(
      { title: "Test Event" },
      "test-token"
    );

    expect(result).toBeNull();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error adding event:",
      "Network error"
    );

    consoleSpy.mockRestore();
  });

  it("works with a null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "event-2",
        title: "Public Event",
      }),
    });

    const result = await addEventCall(
      { title: "Public Event" },
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
        body: JSON.stringify({
          title: "Public Event",
        }),
      }
    );

    expect(result).toEqual({
      _id: "event-2",
      title: "Public Event",
    });
  });
});