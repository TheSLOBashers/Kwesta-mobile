
import React from "react";
import { useState, useEffect } from "react";

import CommentOverlay from './CommentOverlay'
import OpenButton from "./OpenButton";

import { View, StyleSheet, Pressable } from "react-native";

interface Props {
  comments: any;
  setComments: (comments: any) => void;
  onPointsChanged: () => void;
  onSelectComment: (comment: any) => void;
  commentIsOpen: boolean;
  setCommentIsOpen: (v: boolean) => void;
}

function Comments({ comments, setComments, onPointsChanged, onSelectComment, commentIsOpen, setCommentIsOpen }: Props) {

  return (
    <>
      <OpenButton
        onClick={() => setCommentIsOpen(!commentIsOpen)}
        text={"Comments"}
        position="10%"
      />

      {commentIsOpen ? (
        <CommentOverlay
          key={comments.length}
          comments={comments}
          setComments={setComments}
          onPointsChanged={onPointsChanged}
          open={commentIsOpen}
          close={() => {setCommentIsOpen(false), console.log("breakpoint 2")}}
          onSelectComment={onSelectComment}
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

export default Comments;
