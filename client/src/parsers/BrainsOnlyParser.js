export default class BrainsOnlyParser {
  setUrl(url) {
    return fetch(url)
      .then((response) => response.text())
      .then((text) => {
        return this.parse(text);
      });
  }

  parse(text) {
    const lines = text.split("\n");
    console.log(lines);

    if (lines[0] !== "ARCHIVE") {
      throw new Error("Invalid Puzzle");
    }

    var puzInfo = {};
    
    puzInfo.meta = { title: lines[4], author: lines[6] };
    puzInfo.width = parseInt(lines[8]);
    puzInfo.height = parseInt(lines[10]);

    puzInfo.solution = Array(puzInfo.height);
    puzInfo.circledClues = Array(puzInfo.height).fill(' ');

    var numAcrossClues = parseInt(lines[12]);
    var numDownClues = parseInt(lines[14]);

    var i;

    for (i = 0; i < puzInfo.height; i++)
    {
      puzInfo.solution[i] = lines[16 + i].replace(/#/g, '.');
    }

    puzInfo.clues = [];
    puzInfo.clues[0] = [];
    puzInfo.clues[1] = [];

    for (i = 0; i < numAcrossClues; i++) {
      puzInfo.clues[0][i] = lines[16 + puzInfo.height + 1 + i];
    }

    for (i = 0; i < numDownClues; i++) {
      puzInfo.clues[1][i] = lines[16 + puzInfo.height + 2 + numAcrossClues + i];
    }

    return puzInfo;
  }
}
