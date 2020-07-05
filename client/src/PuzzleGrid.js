import React from 'react';
import PuzzleGridCell from './PuzzleGridCell';
import PropTypes from 'prop-types';
import { direction } from './Constants';

export default class PuzzleGrid extends React.Component {
  static propTypes = {
    gridWidth: PropTypes.number.isRequired,
    gridHeight: PropTypes.number.isRequired,
    gridInputCallback: PropTypes.func.isRequired,
    userInput: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    gridSolution: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    gridFocusCallback: PropTypes.func.isRequired,
    gridClickCallback: PropTypes.func.isRequired,
    selectedX: PropTypes.number.isRequired,
    selectedY: PropTypes.number.isRequired,
    gridDirection: PropTypes.number.isRequired,
    clueNumbers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    circledClues: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    showWrongAnswers: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.clueNumber = 0;
  }
  
  isSelectedInput(x, y) {
    return this.props.selectedY === y && this.props.selectedX === x;
  }

  isInCurrentWord(x, y) {
    const { gridSolution, gridDirection, selectedX, selectedY } = this.props;

    if (gridDirection === direction.ACROSS) {
      if (selectedY !== y) {
	return false;
      }

      if (x === selectedX) {
	return true;
      }
      
      if (x < selectedX) {
	let p = x;
	
	while (p < selectedX && gridSolution[y][p] !== '.') {
	  ++p;
	}
	
	if (p === selectedX) {
	  return true;
	}
      } else {
	let p = x;
	
	while (p > selectedX && gridSolution[y][p] !== '.') {
	  --p;
	}
	
	if (p === selectedX) {
	  return true;
	}
      }

      return false;
    } else {
      if (selectedX !== x) {
	return false;
      }

      if (y === selectedY) {
	return true;
      }
      
      if (y < selectedY) {
	let p = y;
	
	while (p < selectedY && gridSolution[p][x] !== '.') {
	  ++p;
	}
	
	if (p === selectedY) {
	  return true;
	}
      } else {
	let p = y;
	
	while (p > selectedY && gridSolution[p][x] !== '.') {
	  --p;
	}
	
	if (p === selectedY) {
	  return true;
	}
      }

      return false;
    }
  }

  renderGridRows() {
    return [...Array(this.props.gridHeight).keys()].map((i) => { return (
	<div className="GridRow" key={`Row${i}`}>
	  {this.renderGridRow(i)}
        </div>
    )});
  }

  isIncorrect(i, j) {
    const { userInput, gridSolution } = this.props;

    if (this.props.showWrongAnswers === false) {
      return false;
    }
    
    if (gridSolution[i][j] === '.' || userInput[i][j] === '') {
      return false;
    }
    
    if (userInput[i][j].toUpperCase() !== gridSolution[i][j].toUpperCase()) {
      return true;
    }

    return false;
  }

  renderGridRow(i) {
    let j;
    let grid = [];

    for (j = 0; j < this.props.gridWidth; j++) {
      grid.push(
	  <PuzzleGridCell 
  	    inCurrentWord={this.isInCurrentWord(j, i)}
	    isSelectedInput={this.isSelectedInput(j, i)}
            userValue={this.props.userInput[i][j]}
            correctValue={this.props.gridSolution[i][j]}
	    clueNumber={this.props.clueNumbers[i][j].toString()}
            key={"Cell:" + i + "," + j}
            gridX={j}
            gridY={i}
            focusCallback={this.props.gridFocusCallback}
            inputCallback={this.props.gridInputCallback}
	    clickCallback={this.props.gridClickCallback}
	    circled={this.props.circledClues.length > 0 && this.props.circledClues[i][j] === '1'}
	    isIncorrect={this.isIncorrect(i, j)}
          />
        );
    }

    return grid;
  }

  render() {
    return (
        <div id="grid" className="Grid">
          {this.renderGridRows()}
        </div>
    );
  }
}
