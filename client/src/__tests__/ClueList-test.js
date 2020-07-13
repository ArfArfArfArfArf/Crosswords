import React from "react";
import ClueList from "../ClueList";
import { render, queryByAttribute } from "@testing-library/react";

var defaultProps = {
  title: "Across",
  clueDirection: 0,
  clueNumbers: [1, 6, 9],
  clues: ["Clue 1", "Clue 6", "Clue 9"],
  selectedClue: 1,
  primary: true,
  onClueClicked: jest.fn,
  gridHeight: 15,
  obscured: false,
};

var blurProps = {
  title: "Across",
  clueDirection: 0,
  clueNumbers: [1, 6, 9],
  clues: ["Clue 1", "Clue 6", "Clue 9"],
  selectedClue: 1,
  primary: true,
  onClueClicked: jest.fn,
  gridHeight: 15,
  obscured: true,
};

const getById = queryByAttribute.bind(null, "id");

test("it displays the clues", () => {
  const { container, getByText } = render(<ClueList {...defaultProps} />);

  expect(getByText("1. Clue 1")).toBeInTheDocument();
  expect(getByText("6. Clue 6")).toBeInTheDocument();
  expect(getByText("9. Clue 9")).toBeInTheDocument();
});

test("it blurs the clues if flag is set", () => {
  const { container } = render(<ClueList {...blurProps} />);

  expect(getById(container, "cluelist")).toHaveClass("obscured");
});
