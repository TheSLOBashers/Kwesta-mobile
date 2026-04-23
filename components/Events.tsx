
import React from "react";

import OpenButton from "./OpenButton";

import { StyleSheet } from "react-native";

interface Props {
  events: any;
  setEvents: (events: any) => void;
  onPointsChanged: () => void;
  onSelectEvent: (events: any) => void;
  activeOverlay: string | null;
  setActiveOverlay: (v: any) => void;
}

function Events({ events, setEvents, onPointsChanged, onSelectEvent, activeOverlay, setActiveOverlay }: Props) {

  const isOpen = activeOverlay === "events";

  return (
    <>
      <OpenButton
        onClick={() => setActiveOverlay(isOpen ? null : "events")}
        text={"Events"}
        position="70%"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: 0,
    zIndex: 1000,
  },
});

export default Events;
