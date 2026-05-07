import { render } from "@testing-library/react-native";
import React from "react";
import PostCard from "../../components/PostCard";
import PostFeed from "../../components/PostFeed";

import type { Mock } from "jest-mock";

jest.mock("../../components/PostCard", () => {
  return jest.fn(() => null);
});

const mockedPostCard = PostCard as unknown as Mock;

describe("PostFeed", () => {
  const mockData = [
    { id: "1", type: "post", title: "Post 1" },
    { id: "2", type: "post", title: "Post 2" },
  ];

  const onEdit = jest.fn();
  const onUnjoin = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders FlatList with PostCard items", () => {
    render(
      <PostFeed
        data={mockData}
        onEdit={onEdit}
        mode="mine"
        onUnjoin={onUnjoin}
        onDelete={onDelete}
      />
    );

    expect(PostCard).toHaveBeenCalledTimes(2);
  });

  it("passes correct props to PostCard", () => {
    render(
      <PostFeed
        data={mockData}
        onEdit={onEdit}
        mode="joined"
        onUnjoin={onUnjoin}
        onDelete={onDelete}
      />
    );

    const firstCall = mockedPostCard.mock.calls[0][0];

    expect(firstCall).toEqual(
        expect.objectContaining({
            item: mockData[0],
            onEdit,
            mode: "joined",
            onUnjoin,
            onDelete,
        })
    );
  });

  it("passes ListHeader to FlatList", () => {
    const Header = <></>;

    const { UNSAFE_getByType } = render(
        <PostFeed
        data={mockData}
        onEdit={onEdit}
        mode="mine"
        ListHeader={Header}
        />
    );

    const flatList = UNSAFE_getByType(require("react-native").FlatList);

    expect(flatList.props.ListHeaderComponent).toBe(Header);
  });

  it("uses correct keyExtractor format", () => {
    const { UNSAFE_getByType } = render(
      <PostFeed
        data={mockData}
        onEdit={onEdit}
        mode="mine"
      />
    );

    const flatList = UNSAFE_getByType(require("react-native").FlatList);

    const keys = mockData.map((i) => `${i.type}-${i.id}`);

    expect(flatList.props.keyExtractor(mockData[0])).toBe(keys[0]);
  });
});