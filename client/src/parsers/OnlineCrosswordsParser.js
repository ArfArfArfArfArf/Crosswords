export default class OnlineCrosswordsParser {
  setUrl(url) {
    return fetch(url)
      .then((response) => response.text())
      .then((text) => new window.DOMParser().parseFromString(text, "text/xml"))
      .then((data) => this.parse(data));
  }

  parse(data) {
    var puzInfo = {};

    const width = data.getElementsByTagName("Width");

    if (width.length === 0) {
      puzInfo.meta = { title: "Online Crosswords" };
      puzInfo.height = 15;
      puzInfo.width = 15;
    } else {
      puzInfo.width = parseInt(width[0].getAttribute("v"));
      puzInfo.height = parseInt(data.getElementsByTagName("Height")[0].getAttribute("v"));
      puzInfo.meta = { title: data.getElementsByTagName("Title")[0].getAttribute("v") };
    }
    
    var i;
    var colOffset = 0;
    
    puzInfo.solution = Array(puzInfo.height);
    puzInfo.circledClues = Array(puzInfo.height).fill(' ');

    for (i = 0; i < puzInfo.height; i++) {
      puzInfo.solution[i] = Array(puzInfo.width).fill('.');
    }
    
    let puzzleTag = data.getElementsByTagName("puzzle");

    if (puzzleTag.length === 0) {
      puzzleTag = data.getElementsByTagName("crossword");
      colOffset = 1;
    }

    const puzzle = puzzleTag[0];

    const across = puzzle.getElementsByTagName("across")[0];
    const children = across.children;
    
    let len = children.length;

    puzInfo.clues = [];

    puzInfo.clues[0] = [];
    
    for (i = 0; i < len; i++) {
      const child = children[i];

      const a = child.getAttribute("a");
      const c = unescape(child.getAttribute("c").replace(/\+/g, ' '));
      const n = parseInt(child.getAttribute("n"));

      puzInfo.clues[0][i] = c;
      
      let row, col;

      row = Math.floor((n - colOffset) / puzInfo.height);
      col = (n - colOffset) % puzInfo.width;

      let j;

      for (j = 0; j < a.length; j++) {
	puzInfo.solution[row][col + j] = a.charAt(j);
      }
    }

    puzInfo.clues[1] = [];
    const down = puzzle.getElementsByTagName("down")[0];
    const children2 = down.children;
    len = children2.length;
    
    for (i = 0; i < len; i++) {
      const child = children2[i];
      const c = unescape(child.getAttribute("c").replace(/\+/g, ' '));

      puzInfo.clues[1][i] = c;
    }
    
    return puzInfo;
  }
}


