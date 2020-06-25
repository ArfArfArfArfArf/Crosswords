import PuzzleSchema from '../schemas/Puzzle';

export default class PuzParser {
  setUrl(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => json.data);
  }
};
