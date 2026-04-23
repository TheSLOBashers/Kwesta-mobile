
import React from "react";

import OpenButton from "./OpenButton";

import { StyleSheet } from "react-native";

interface Props {
  quests: any;
  setQuests: (events: any) => void;
  onPointsChanged: () => void;
  onSelectQuest: (events: any) => void;
  activeOverlay: string | null;
  setActiveOverlay: (v: any) => void;
}

function Quests({ quests, setQuests, onPointsChanged, onSelectQuest, activeOverlay, setActiveOverlay }: Props) {

  const isOpen = activeOverlay === "quests";

  return (
    <>
      <OpenButton
        onClick={() => setActiveOverlay(isOpen ? null : "quests")}
        text={"Quests"}
        position="40%"
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

export default Quests;
