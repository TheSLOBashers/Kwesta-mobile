
import React from "react";
import { useState, useEffect } from "react";

import CommentOverlay from './CommentOverlay'
import EventOverlay from "./EventOverlay";
import QuestOverlay from "./QuestOverlay";
import OpenButton from "./OpenButton";

import { View, StyleSheet, Pressable } from "react-native";

interface Props {
  quests: any;
  setQuests: (events: any) => void;
  onPointsChanged: () => void;
  onSelectQuest: (events: any) => void;
  questIsOpen: boolean;
  setCommentIsOpen: (v: boolean) => void;
  setQuestIsOpen: (v: boolean) => void;
  setEventIsOpen: (v: boolean) => void;
}

function Quests({ quests, setQuests, onPointsChanged, onSelectQuest, questIsOpen, setCommentIsOpen, setQuestIsOpen, setEventIsOpen }: Props) {

  return (
    <>
      <OpenButton
        onClick={() => {setQuestIsOpen(!questIsOpen); setCommentIsOpen(false); setEventIsOpen(false);}}
        text={"Quests"}
        position="40%"
      />

      {questIsOpen ? (
        <QuestOverlay
          key={quests.length}
          quests={quests}
          setQuests={setQuests}
          onPointsChanged={onPointsChanged}
          open={questIsOpen}
          close={() => {setQuestIsOpen(false);}}
          onSelectQuest={onSelectQuest}
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

export default Quests;
