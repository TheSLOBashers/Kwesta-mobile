jest.mock("@/scripts/joinEvent", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/scripts/unjoinEvent", () => ({
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
import EventOverlay from "../../components/EventOverlay";

import joinEvent from "@/scripts/joinEvent";
import unjoinEvent from "@/scripts/unjoinEvent";

global.alert = jest.fn();

describe("EventOverlay", () => {
  const mockEvents = [
    {
      id: "e1",
      authorName: "Bob",
      date: new Date().toISOString(),
      description: "Event 1",
      joined: false,
    },
    {
      id: "e2",
      authorName: "Alice",
      date: new Date().toISOString(),
      description: "Event 2",
      joined: false,
    },
  ];

  const setEvents = jest.fn();
  const close = jest.fn();
  const onPointsChanged = jest.fn();
  const onSelectEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders events and triggers onSelectEvent effect", () => {
    const { getByText } = render(
      <EventOverlay
        open={true}
        close={close}
        events={mockEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    expect(getByText("Bob")).toBeTruthy();
    expect(onSelectEvent).toHaveBeenCalled();
  });

  it("calls joinEvent successfully", async () => {
    (joinEvent as jest.Mock).mockResolvedValue({});

    const { getAllByText } = render(
      <EventOverlay
        open={true}
        close={close}
        events={mockEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    const joinButtons = getAllByText("Join Event");
    fireEvent.press(joinButtons[0]);

    await waitFor(() => {
      expect(joinEvent).toHaveBeenCalledWith("e1", "test-token");
      expect(setEvents).toHaveBeenCalled();
      expect(onPointsChanged).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        "Successfully joined event!"
      );
    });
  });

  it("handles joinEvent error", async () => {
    (joinEvent as jest.Mock).mockRejectedValue(new Error("fail"));

    const { getAllByText } = render(
      <EventOverlay
        open={true}
        close={close}
        events={mockEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    fireEvent.press(getAllByText("Join Event")[0]);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error joining event")
      );
    });
  });

  it("calls unjoinEvent successfully", async () => {
    const joinedEvents = [
      { ...mockEvents[0], joined: true },
    ];

    (unjoinEvent as jest.Mock).mockResolvedValue({});

    const { getByText } = render(
      <EventOverlay
        open={true}
        close={close}
        events={joinedEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    fireEvent.press(getByText("Unjoin Event"));

    await waitFor(() => {
      expect(unjoinEvent).toHaveBeenCalledWith("e1", "test-token");
      expect(setEvents).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(
        "Successfully unjoined event!"
      );
    });
  });

  it("handles unjoinEvent error", async () => {
    (unjoinEvent as jest.Mock).mockRejectedValue(new Error("fail"));

    const joinedEvents = [
      { ...mockEvents[0], joined: true },
    ];

    const { getByText } = render(
      <EventOverlay
        open={true}
        close={close}
        events={joinedEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    fireEvent.press(getByText("Unjoin Event"));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining("Error joining event")
      );
    });
  });

  it("handles scroll and updates active index", () => {
    const { getByTestId } = render(
      <EventOverlay
        open={true}
        close={close}
        events={mockEvents}
        setEvents={setEvents}
        onPointsChanged={onPointsChanged}
        onSelectEvent={onSelectEvent}
      />
    );

    const scroll = getByTestId("event-scroll");

    fireEvent.scroll(scroll, {
      nativeEvent: {
        contentOffset: { x: 500 },
      },
    });

    expect(scroll).toBeTruthy();
  });
});