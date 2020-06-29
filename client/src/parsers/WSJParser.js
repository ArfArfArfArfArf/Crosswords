import PuzzleSchema from '../schemas/Puzzle';

export default class WSJParser {
  setUrl(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => { return this.parse(json.data) } )
  }

  /*
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
*/
  parse(data) {
    var puzInfo = {};
    var i, j;
    
    console.log(data);
    
    puzInfo.width = parseInt(data.copy.gridsize.rows);
    puzInfo.height = parseInt(data.copy.gridsize.cols);

    puzInfo.solution = Array(puzInfo.height);
    puzInfo.circledClues = Array(puzInfo.height);

    for (i = 0; i < puzInfo.height; i++) {
      puzInfo.solution[i] = Array(puzInfo.width).fill('');
      puzInfo.circledClues[i] = Array(puzInfo.width).fill('.');

      for (j = 0; j < puzInfo.width; j++) {
	const value = data.grid[i][j].Letter;

	if (value === '') {
	  puzInfo.solution[i][j] = '.';
	} else {
	  puzInfo.solution[i][j] = value;
	}

	if (data.grid[i][j].style && data.grid[i][j].style.shapebg === 'circle') {
	  puzInfo.circledClues[i][j] = '1';
	}
      }
    }
    
    puzInfo.clues = [];
    for (i = 0; i < 2; i++) {
      var clueList = []
      var k;

      for (k = 0; k < data.copy.clues[i].clues.length; k++) {
	console.log(data.copy.clues[i].clues[k].clue);
	clueList[k] = data.copy.clues[i].clues[k].clue;
      }
      
      if (data.copy.clues[i].title === "Across") {
	puzInfo.clues[0] = clueList;
      } else {
	puzInfo.clues[1] = clueList;
      }
    }

    puzInfo.meta = {};

    console.log(puzInfo);
    return puzInfo;
  }
}
