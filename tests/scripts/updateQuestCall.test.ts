jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import updateQuestCall from "../../scripts/updateQuestCall";

describe("updateQuestCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("updates a quest successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        quest: {
          id: "q1",
          title: "Updated Quest",
        },
      }),
    });

    const result = await updateQuestCall(
      "q1",
      { title: "Updated Quest" },
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/q1",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({ title: "Updated Quest" }),
      }
    );

    expect(result).toEqual({
      id: "q1",
      title: "Updated Quest",
    });
  });

  it("returns null when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await updateQuestCall(
      "q1",
      { title: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
  });

  it("handles fetch error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    const result = await updateQuestCall(
      "q1",
      { title: "fail" },
      "test-token"
    );

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error updating quest:",
      "Network error"
    );
  });

  it("works with null token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        quest: {
          id: "q2",
          title: "Hello",
        },
      }),
    });

    const result = await updateQuestCall(
      "q2",
      { title: "Hello" },
      null
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/quests/q2",
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
      id: "q2",
      title: "Hello",
    });
  });
});