import { shape, string, arrayOf, number } from 'prop-types';

const PuzzleSchema = shape({
  title: string,
  author: string,
  copyright: string,

  width: number.required,
  height: number.required,

  acrossClues: arrayOf(string),
  downClues: arrayOf(string),

  solution: arrayOf(string),

  userInput: arrayOf(string),
});

export default PuzzleSchema;
