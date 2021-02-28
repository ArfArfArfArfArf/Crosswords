import React from "react";
import PuzzleGridCell from "./PuzzleGridCell";
import PropTypes from "prop-types";
import { direction } from "./Constants";

export default class PuzzleGrid extends React.Component {
  static propTypes = {
    gridWidth: PropTypes.number.isRequired,
    gridHeight: PropTypes.number.isRequired,
    gridInputCallback: PropTypes.func.isRequired,
    userInput: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    gridSolution: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    gridFocusCallback: PropTypes.func.isRequired,
    gridClickCallback: PropTypes.func.isRequired,
    selectedX: PropTypes.number.isRequired,
    selectedY: PropTypes.number.isRequired,
    gridDirection: PropTypes.number.isRequired,
    clueNumbers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
      .isRequired,
    circledClues: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
      .isRequired,
    inputState: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    showWrongAnswers: PropTypes.bool.isRequired,
    downAlternates: PropTypes.arrayOf(PropTypes.string),
    acrossAlternates: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);

    this.clueNumber = 0;
  }

  isSelectedInput(x, y) {
    return this.props.selectedY === y && this.props.selectedX === x;
  }

  isInAlternateWord(x,y) {
    const { acrossAlternates, downAlternates, gridSolution, clueNumbers } = this.props;

    if (gridSolution[y][x] === '.') {
      return false;
    }
    
    if (acrossAlternates) {
      let nx = x;

      while (nx > -1 && gridSolution[y][nx] !== '.') {
	--nx;
      }

      ++nx;

      if (-1 !== acrossAlternates.findIndex(i => i === clueNumbers[y][nx].toString())) {
	return true;
      }
    }

    if (downAlternates) {
      let ny = y;

      while (ny > -1 && gridSolution[ny][x] !== '.') {
	ny--;
      }

      ++ny;
      console.log("NY: " + ny + ", x: " + x);
      console.log(clueNumbers[ny][x]);
      if (-1 !== downAlternates.findIndex(i => i === clueNumbers[ny][x].toString())) {
	return true;
      }
    }
    
    return false;
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

        while (p < selectedX && gridSolution[y][p] !== ".") {
          ++p;
        }

        if (p === selectedX) {
          return true;
        }
      } else {
        let p = x;

        while (p > selectedX && gridSolution[y][p] !== ".") {
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

        while (p < selectedY && gridSolution[p][x] !== ".") {
          ++p;
        }

        if (p === selectedY) {
          return true;
        }
      } else {
        let p = y;

        while (p > selectedY && gridSolution[p][x] !== ".") {
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
    return [...Array(this.props.gridHeight).keys()].map((i) => {
      return (
        <div className="GridRow" key={`Row${i}`}>
          {this.renderGridRow(i)}
        </div>
      );
    });
  }

  renderGridRow(i) {
    let j;
    let grid = [];

    for (j = 0; j < this.props.gridWidth; j++) {
      grid.push(
        <PuzzleGridCell
          inCurrentWord={this.isInCurrentWord(j, i)}
          isSelectedInput={this.isSelectedInput(j, i)}
	  inAlternateWord={this.isInAlternateWord(j,i)}
          userValue={this.props.userInput[i][j]}
          correctValue={this.props.gridSolution[i][j]}
          clueNumber={this.props.clueNumbers[i][j].toString()}
          key={"Cell:" + i + "," + j}
          gridX={j}
          gridY={i}
          focusCallback={this.props.gridFocusCallback}
          inputCallback={this.props.gridInputCallback}
          clickCallback={this.props.gridClickCallback}
          circled={
            this.props.circledClues.length > 0 &&
            this.props.circledClues[i][j] === "1"
          }
          inputState={this.props.inputState[i][j]}
	  showWrongAnswers={this.props.showWrongAnswers}
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
