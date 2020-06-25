import React from 'react';
import PuzzleGridCell from '../PuzzleGridCell';
import { render } from '@testing-library/react';

var defaultProps = {
  gridX: 0,
  gridY: 0,
  inputCallback: jest.fn,
  focusCallback: jest.fn,
  clickCallback: jest.fn,
  userValue: 'a',
  correctValue: 'a',
  clueNumber: "1",
  inCurrentWord: true,
  isSelectedInput: true,
  circled: false,
};

var circleProps = {
  gridX: 0,
  gridY: 0,
  inputCallback: jest.fn,
  focusCallback: jest.fn,
  clickCallback: jest.fn,
  userValue: '.',
  correctValue: '.',
  clueNumber: "0",
  inCurrentWord: false,
  isSelectedInput: false,
  circled: true,
};


test('renders a gridcell component', () => {
  const { container, queryByTestId, getByTestId } = render(<PuzzleGridCell {...defaultProps} />);
  
  const cell = getByTestId('gridcell');
  
  expect(cell).toBeInTheDocument();
});

test('renders a highlighted cell', () => {
  const { getByTestId } = render(<PuzzleGridCell {...defaultProps} />);
  expect(getByTestId('gridcell')).toHaveClass('highlighted');
});

test('renders the value in the cell', () => {
  const { getByTestId } = render(<PuzzleGridCell {...defaultProps} />);

  const value = getByTestId('value');
  expect(value).toBeInTheDocument();
  expect(value.innerHTML).toContain('a');
});
     
test('renders a clue number', () => {
  const { queryByTestId, getByTestId } = render(<PuzzleGridCell {...defaultProps} />);

  const clueNumber = getByTestId('clueNumber');
  expect(clueNumber).toBeInTheDocument();
  expect(clueNumber.innerHTML).toContain('1');

  expect(queryByTestId('circle')).toBeNull();
});

test('renders a circle for circled clues', () => {
  const { container, queryByTestId, getByTestId } = render(<PuzzleGridCell {...circleProps} />);

  expect(queryByTestId('circle')).toBeTruthy();
});

test('does not render highlight', () => {
  const { getByTestId } = render(<PuzzleGridCell {...circleProps} />);
  expect(getByTestId('gridcell')).not.toHaveClass('highlighted');
});

test('does not render a clue number', () => {
  const { queryByTestId } = render(<PuzzleGridCell {...circleProps} />);
  expect(queryByTestId('clueNumber').innerHTML).toBeNull;
});

test('renders a black cell for word breaks', () => {
  const { getByTestId } = render(<PuzzleGridCell {...circleProps} />);
  expect(getByTestId('gridcell')).toHaveClass('black');
});
