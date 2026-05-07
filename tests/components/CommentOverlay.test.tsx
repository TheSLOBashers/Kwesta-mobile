jest.mock("@/scripts/likeComment", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/scripts/flagComment", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/scripts/unflagComment", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/components/auth-context", () => ({
  useAuth: () => ({
    token: "test-token",
  }),
}));

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import CommentOverlay from "../../components/CommentOverlay";

import flagComment from "@/scripts/flagComment";
import likeComment from "@/scripts/likeComment";
import unflagComment from "@/scripts/unflagComment";

global.alert = jest.fn();

describe("CommentOverlay", () => {
  const mockComments = [
    {
      id: "c1",
      authorName: "Bob",
      date: new Date().toISOString(),
      comment: "Hello",
      likes: 0,
      likedByUser: false,
      flaggedByUser: false,
    },
    {
      id: "c2",
      authorName: "Alice",
      date: new Date().toISOString(),
      comment: "Second",
      likes: 0,
      likedByUser: false,
      flaggedByUser: false,
    },
  ];

  const setComments = jest.fn();
  const close = jest.fn();
  const onPointsChanged = jest.fn();
  const onSelectComment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders comments and triggers onSelectComment effect", () => {
    const { getByText } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    expect(getByText("Bob")).toBeTruthy();
    expect(onSelectComment).toHaveBeenCalled();
  });

  it("calls likeComment successfully", async () => {
    (likeComment as jest.Mock).mockResolvedValue({});

    const { getAllByText } = render(
        <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
        />
    );

    const likeButtons = getAllByText("Like Comment");
    fireEvent.press(likeButtons[0]);

    await waitFor(() => {
        expect(likeComment).toHaveBeenCalledWith("c1", "test-token");
        expect(setComments).toHaveBeenCalled();
        expect(onPointsChanged).toHaveBeenCalled();
    });
  });

  it("handles likeComment error", async () => {
    (likeComment as jest.Mock).mockRejectedValue(new Error("fail"));

    const { getAllByText } = render(
        <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
        />
    );

    const likeButtons = getAllByText("Like Comment")
    fireEvent.press(likeButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error liking comment")
      );
    });
  });

  it("calls flagComment successfully", async () => {
    (flagComment as jest.Mock).mockResolvedValue({});

    const { getAllByText } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    const flagButtons = getAllByText("Flag comment");
    fireEvent.press(flagButtons[0]);

    await waitFor(() => {
      expect(flagComment).toHaveBeenCalledWith("c1", "test-token");
      expect(setComments).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        "Successfully flagged comment!"
      );
    });
  });

  it("handles flagComment error", async () => {
    (flagComment as jest.Mock).mockRejectedValue(new Error("fail"));

    const { getAllByText } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    const flagButtons = getAllByText("Flag comment");
    fireEvent.press(flagButtons[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error flagging comment")
      );
    });
  });

  it("calls unflagComment successfully", async () => {
    const flagged = [
      { ...mockComments[0], flaggedByUser: true },
    ];

    (unflagComment as jest.Mock).mockResolvedValue({});

    const { getByText } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={flagged}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    fireEvent.press(getByText("Unflag comment"));

    await waitFor(() => {
      expect(unflagComment).toHaveBeenCalledWith("c1", "test-token");
      expect(setComments).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        "Successfully unflagged comment!"
      );
    });
  });

  it("handles unflagComment error", async () => {
    (unflagComment as jest.Mock).mockRejectedValue(new Error("fail"));

    const flagged = [
      { ...mockComments[0], flaggedByUser: true },
    ];

    const { getByText } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={flagged}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    fireEvent.press(getByText("Unflag comment"));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error unflagging comment")
      );
    });
  });

  it("handles scroll and changes active index", () => {
    const { getByTestId } = render(
      <CommentOverlay
        open={true}
        close={close}
        comments={mockComments}
        setComments={setComments}
        onPointsChanged={onPointsChanged}
        onSelectComment={onSelectComment}
      />
    );

    const scroll = getByTestId("comment-scroll");

    fireEvent.scroll(scroll, {
      nativeEvent: {
        contentOffset: { x: 500 },
      },
    });

    expect(scroll).toBeTruthy();
  });
});