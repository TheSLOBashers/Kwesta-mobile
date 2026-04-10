
import React from "react";

import OpenButton from "./OpenButton";

import { StyleSheet } from "react-native";

interface Props {
  comments: any;
  setComments: (comments: any) => void;
  onPointsChanged: () => void;
  onSelectComment: (comment: any) => void;
  activeOverlay: string | null;
  setActiveOverlay: (v: any) => void;
}

function Comments({ comments, setComments, onPointsChanged, onSelectComment, activeOverlay, setActiveOverlay }: Props) {

  const isOpen = activeOverlay === "comments";
  
  return (
    <>
      <OpenButton
        onClick={() => setActiveOverlay(isOpen ? null : "comments")}
        text={"Comments"}
        position="10%"
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

export default Comments;
