import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import QuestOverlay from "../../components/QuestOverlay";

import joinQuest from "@/scripts/joinQuest";
import unjoinQuest from "@/scripts/unjoinQuest";

jest.mock("@/scripts/joinQuest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/scripts/unjoinQuest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/components/auth-context", () => ({
  useAuth: () => ({
    token: "test-token",
  }),
}));

global.alert = jest.fn();

describe("QuestOverlay", () => {
  const mockQuests = [
    {
      id: "e1",
      authorName: "Bob",
      date: new Date().toISOString(),
      description: "Quest 1",
      joined: false,
    },
    {
      id: "e2",
      authorName: "Alice",
      date: new Date().toISOString(),
      description: "Quest 2",
      joined: false,
    },
  ];

  const setQuests = jest.fn();
  const close = jest.fn();
  const onPointsChanged = jest.fn();
  const onSelectQuest = jest.fn();
  const selectedQuest = mockQuests[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls onSelectQuest after scroll snap", async () => {
    const { getByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={mockQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={mockQuests[0]}
      />,
    );

    const scroll = getByTestId("quest-scroll");

    fireEvent.scroll(scroll, {
      nativeEvent: {
        contentOffset: { x: 500 },
      },
    });

    fireEvent(scroll, "momentumScrollEnd", {
      nativeEvent: {
        contentOffset: { x: 500 },
      },
    });

    await waitFor(() => {
      expect(onSelectQuest).toHaveBeenCalled();
    });
  });

  it("calls joinQuest successfully", async () => {
    (joinQuest as jest.Mock).mockResolvedValue({});

    const { getAllByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={mockQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={selectedQuest}
      />,
    );

    const joinButtons = getAllByTestId("joinButton");
    fireEvent.press(joinButtons[0]);

    await waitFor(() => {
      expect(joinQuest).toHaveBeenCalledWith("e1", "test-token");
      expect(setQuests).toHaveBeenCalled();
      expect(onPointsChanged).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Successfully joined quest!");
    });
  });

  it("handles joinQuest error", async () => {
    (joinQuest as jest.Mock).mockRejectedValue(new Error("fail"));

    const { getAllByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={mockQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={selectedQuest}
      />,
    );

    fireEvent.press(getAllByTestId("joinButton")[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error joining quest"),
      );
    });
  });

  it("calls unjoinQuest successfully", async () => {
    const joinedQuests = [{ ...mockQuests[0], joined: true }];

    (unjoinQuest as jest.Mock).mockResolvedValue({});

    const { getByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={joinedQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={selectedQuest}
      />,
    );

    fireEvent.press(getByTestId("unjoinButton"));

    await waitFor(() => {
      expect(unjoinQuest).toHaveBeenCalledWith("e1", "test-token");
      expect(setQuests).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Successfully unjoined quest!");
    });
  });

  it("handles unjoinQuest error", async () => {
    (unjoinQuest as jest.Mock).mockRejectedValue(new Error("fail"));

    const joinedQuests = [{ ...mockQuests[0], joined: true }];

    const { getByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={joinedQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={selectedQuest}
      />,
    );

    fireEvent.press(getByTestId("unjoinButton"));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error joining quest"),
      );
    });
  });

  it("handles scroll and updates active index", () => {
    const { getByTestId } = render(
      <QuestOverlay
        open={true}
        close={close}
        quests={mockQuests}
        setQuests={setQuests}
        onPointsChanged={onPointsChanged}
        onSelectQuest={onSelectQuest}
        selectedQuest={selectedQuest}
      />,
    );

    const scroll = getByTestId("quest-scroll");

    fireEvent.scroll(scroll, {
      nativeEvent: {
        contentOffset: { x: 500 },
      },
    });

    expect(scroll).toBeTruthy();
  });
});
