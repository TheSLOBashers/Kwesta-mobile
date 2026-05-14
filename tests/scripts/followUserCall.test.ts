jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import followUserCall from "../../scripts/followUserCall";
import unfollowUserCall from "../../scripts/unfollowUserCall";

describe("social user route calls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls the backend follow route", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await followUserCall("test-token", "target-user");

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/following/target-user",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      },
    );
  });

  it("calls the backend unfollow route", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const result = await unfollowUserCall("test-token", "target-user");

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me/following/target-user",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      },
    );
  });

  it("returns false when follow fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    const result = await followUserCall("test-token", "target-user");

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Error following user:",
      expect.any(Error),
    );
  });
});
