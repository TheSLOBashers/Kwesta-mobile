jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import updateEventCall from "../../scripts/updateEventCall";

describe("updateEventCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates an event successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        event: {
          id: "e1",
          title: "Updated Event",
        },
      }),
    });

    const result = await updateEventCall(
      "e1",
      { title: "Updated Event" },
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/e1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ title: "Updated Event" }),
      }
    );

    expect(result).toEqual({
      id: "e1",
      title: "Updated Event",
    });
  });

  it("returns null when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await updateEventCall(
      "e1",
      { title: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await updateEventCall(
      "e1",
      { title: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error updating event:",
      "Network error"
    );
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        event: {
          id: "e2",
          title: "Hello",
        },
      }),
    });

    const result = await updateEventCall(
      "e2",
      { title: "Hello" },
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/events/e2",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer null",
        },
        body: JSON.stringify({ title: "Hello" }),
      }
    );

    expect(result).toEqual({
      id: "e2",
      title: "Hello",
    });
  });
});