import Puz from 'puzjs';

export default class PuzParser {
  setUrl(url) {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(buf => this.parsePuzzle(buf));
  }

  parsePuzzle(buf) {
    const json = Puz.decode(buf);

    var puzInfo = {};
    puzInfo.height = json.grid.length;
    puzInfo.width = json.grid[0].length;
    puzInfo.solution = json.grid;
    puzInfo.clues = [];

    let i = 0;
    let clueNum = 0;
    let acrossClues = [];
    let downClues = [];
    
    for (i = 0; i < json.clues.across.length; i++) {
      if (json.clues.across[i] !== undefined) {
	acrossClues[clueNum] = json.clues.across[i];
	++clueNum;
      }
    }

    downClues = [];
    clueNum = 0;
    
    for (i = 0; i < json.clues.down.length; i++) {
      if (json.clues.down[i] !== undefined) {
	downClues[clueNum] = json.clues.down[i];
	++clueNum;
      }
    }
    
    puzInfo.clues[0] = acrossClues;
    puzInfo.clues[1] = downClues;
    puzInfo.circledClues = json.circles;

    puzInfo.meta = {};
    puzInfo.meta.title = json.meta.title;
    puzInfo.meta.author = json.meta.author;
    puzInfo.meta.copyright = json.meta.copyright;

    console.log(json);
    return puzInfo;
  }
};
