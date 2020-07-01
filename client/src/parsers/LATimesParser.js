import { direction } from '../Constants';

export default class LATimesParser {
  setUrl(url) {
    return fetch(url)
      .then(response => response.text())
      .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
      .then(data => this.parse(data))
  }

  parse(data) {
    var puzInfo = {};
    
    const grid = data.getElementsByTagName('grid')[0];

    puzInfo.width = parseInt(grid.getAttribute('width'));
    puzInfo.height = parseInt(grid.getAttribute('height'));

    puzInfo.solution = Array(puzInfo.height);
    puzInfo.circledClues = Array(puzInfo.height);

    var i, j;

    for (i = 0; i < puzInfo.height; i++) {
      puzInfo.solution[i] = Array(puzInfo.height).fill('');
      puzInfo.circledClues[i] = Array(puzInfo.height).fill('.');
    }
    
    const cells = data.getElementsByTagName('cell');

    const len = cells.length;
    
    for (i = 0; i < len; i++) {
      const x = parseInt(cells[i].getAttribute('x'));
      const y = parseInt(cells[i].getAttribute('y'));
      const value = cells[i].getAttribute('solution');
      const bg = cells[i].getAttribute('background-shape');

      puzInfo.solution[y - 1][x - 1] = value || '.';

      if (bg && bg === "circle") {
	puzInfo.circledClues[y - 1][x - 1] = '1';
      } 
    }
    
    puzInfo.clues = [];

    const clues = data.getElementsByTagName('clues');
    var clueDir = -1;

    for (i = 0; i < clues.length; i++) {
      const title = clues[i].getElementsByTagName('title')[0];
      if (title.innerHTML.includes("Across")) {
	clueDir = direction.ACROSS;
      } else {
	clueDir = direction.DOWN;
      }

      const clueValues = clues[i].getElementsByTagName('clue');
      var clueList = [];
      
      for (j = 0; j < clueValues.length; j++) {
	clueList[j] = clueValues[j].innerHTML;
      }

      if (clueDir === direction.ACROSS) {
	puzInfo.clues[0] = clueList;
      } else {
	puzInfo.clues[1] = clueList;
      }
    }

    const metaData = data.getElementsByTagName('metadata')[0];

    puzInfo.meta = {};

    puzInfo.meta.title = metaData.getElementsByTagName('title')[0].innerHTML;
    puzInfo.meta.creator = metaData.getElementsByTagName('creator')[0].innerHTML;
    puzInfo.meta.copyright = metaData.getElementsByTagName('copyright')[0].innerHTML;
    
    return puzInfo;
  }
}
