
import React from "react";
import { useState, useEffect } from "react";

import CommentOverlay from './CommentOverlay'
import EventOverlay from "./EventOverlay";
import OpenButton from "./OpenButton";

import { View, StyleSheet, Pressable } from "react-native";

interface Props {
  events: any;
  setEvents: (events: any) => void;
  onPointsChanged: () => void;
  onSelectEvent: (events: any) => void;
  eventIsOpen: boolean;
  setEventIsOpen: (v: boolean) => void;
}

function Events({ events, setEvents, onPointsChanged, onSelectEvent, eventIsOpen, setEventIsOpen }: Props) {

  return (
    <>
      <OpenButton
        onClick={() => setEventIsOpen(!eventIsOpen)}
        text={"Events"}
        position="70%"
      />

      {eventIsOpen ? (
        <EventOverlay
          key={events.length}
          events={events}
          setEvents={setEvents}
          onPointsChanged={onPointsChanged}
          open={eventIsOpen}
          close={() => {setEventIsOpen(false); console.log("breakpoint 1")}}
          onSelectEvent={onSelectEvent}
        />
      ) : null}
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
