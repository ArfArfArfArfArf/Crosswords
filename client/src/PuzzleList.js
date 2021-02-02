import React from 'react';
import PuzzleStore from './stores/PuzzleStore';
import { daysOfTheWeek } from "./Constants";
import PuzzleInfo from './PuzzleInfo';
import PropTypes from 'prop-types';
import { GoX, GoCheck } from "react-icons/go";
import { puzzleFlags } from './Constants';

export default class PuzzleList extends React.Component {
  static defaultProps = {
    puzzles: PropTypes.arrayOf(PuzzleInfo).isRequired,
    puzzleSelected: PropTypes.func.isRequired,
  };
  
  constructor(props) {
    super(props);

    this.puzzleClick = this.puzzleClick.bind(this);
  }

  getDay(date) {
    switch (date.getDay()) {
    case 0:
      return daysOfTheWeek.SUNDAY;
    case 1:
      return daysOfTheWeek.MONDAY;
    case 2:
      return daysOfTheWeek.TUESDAY;
    case 3:
      return daysOfTheWeek.WEDNESDAY;
    case 4:
      return daysOfTheWeek.THURSDAY;
    case 5:
      return daysOfTheWeek.FRIDAY;
    case 6:
      return daysOfTheWeek.SATURDAY;
    default:
      return undefined;
    }
  }
  
  puzzleClick(id, date) {
    this.props.puzzleSelected(id, date);
  }

  renderDelete(date, name) {
    const year = date.getFullYear() - 2000;
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return (
	<GoX
          style={{ cursor: "hand", width: "1rem", height: "1rem", right: 0 }}
          aria-label="Close Preferences"
          onClick={this.deletePuzzle.bind(this, name, year, month, day)}
        />

    );
  }

  deletePuzzle(name, year, month, day) {
    PuzzleStore.deletePuzzle(name, year, month, day);
    this.forceUpdate();
  }
  
  renderPuzzleData(date, name, puzzleInfo) {
    if (puzzleInfo) {
      if (puzzleInfo.puzzleComplete) {
	return (
	    <div className="PuzzleData">
              <GoCheck
                style={{ color: "green", width: "2rem", height: "2rem" }}
                aria-label="Completed"
              />
	      Completed
	      {this.renderDelete(date, name)}
	    </div>
	);
      } else {
	const { gridWidth, gridHeight, gridSolution } = puzzleInfo;

	var i,j, count;

	count = 0;
      
	for (i = 0; i < gridHeight; i++) {
	  for (j = 0; j < gridWidth; j++) {
	    if (gridSolution[i][j] !== '.') {
	      ++count;
	    }
	  }
	}
	return (
	    <div className="PuzzleData">
	      {Math.floor(100 * (count - puzzleInfo.incorrectAnswers)/count)}% complete
	      {this.renderDelete(date, name)}
	    </div>
	);
      }
    }
    return null;
  }

  renderPuzzleInfo(index, puzzle, date, puzzleInfo) {
    return (
	<div className="PuzzleInfo">
	  <span className="PuzzleName" onClick={this.puzzleClick.bind(this, index, date.toString())}>{puzzle.name}</span>
	  {this.renderPuzzleData(date, puzzle.name, puzzleInfo)}
        </div>
    );
  }

  renderDay(date, archived) {
    return this.props.puzzles.map((p, i) => {
      const year = date.getFullYear() - 2000;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const puzzleInfo = PuzzleStore.getPuzzle(p.name, year, month, day);

      if (puzzleInfo || (p.enabled && p.frequency & this.getDay(date) && !(archived && p.flags & puzzleFlags.NO_ARCHIVE))) {
	return(
	    <div key={`${p.ID}-${date}`} className="PuzzleLink">
	    {this.renderPuzzleInfo(i, p, date, puzzleInfo)}
	    </div>
	);
      } else {
	return null;
      }
    });
  }
  
  renderPuzzles() {
    var date = new Date(Date.now());

    date.setDate(date.getDate() + 1);
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return [...Array(14).keys()].map((i) => {
      date.setDate(date.getDate() - 1);
      return (
	  <div key={date} className="PuzzleDate">
	    <span className="PuzzleDateString"> { date.toLocaleDateString(undefined, options) } </span>
	    { this.renderDay(date, !(i === 0)) } 
	  </div>
      );
    });
  }

  render() {
    return (
	<div className="PuzzleList">
	  {this.renderPuzzles()}
	</div>
    );
  }
}
