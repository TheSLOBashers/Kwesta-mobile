jest.mock("@/constants/backend", () => ({
  __esModule: true,
  default: "https://test-api.com/",
}));

import getUserProfileCall from "../../scripts/getUserProfileCall";

describe("getUserProfileCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches and normalizes the authenticated user profile", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        username: "alice",
        points: 42,
        permissions: "regular",
        followers: [{ _id: "u1", username: "bob", points: 10 }],
        following: [{ _id: "u2", username: "cam", points: 20 }],
        followersCount: 1,
        followingCount: 1,
      }),
    });

    const result = await getUserProfileCall("test-token");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test-api.com/users/me",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      },
    );
    expect(result).toEqual({
      username: "alice",
      points: 42,
      permissions: "regular",
      followers: [{ id: "u1", username: "bob", points: 10 }],
      following: [{ id: "u2", username: "cam", points: 20 }],
      followersCount: 1,
      followingCount: 1,
    });
  });

  it("falls back to array lengths when count fields are missing", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        username: "alice",
        followers: [{ _id: "u1", username: "bob" }],
        following: [{ _id: "u2", username: "cam" }],
      }),
    });

    const result = await getUserProfileCall("test-token");

    expect(result?.followersCount).toBe(1);
    expect(result?.followingCount).toBe(1);
  });

  it("returns null when the request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const result = await getUserProfileCall("test-token");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching user profile:",
      expect.any(Error),
    );
  });
});
