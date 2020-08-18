import React from 'react';
import PuzzleStore from './stores/PuzzleStore';
import { daysOfTheWeek } from "./Constants";
import PuzzleInfo from './PuzzleInfo';
import PropTypes from 'prop-types';

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
  
  renderDay(date) {
    return this.props.puzzles.map((p, i) => {
      if (p.frequency & this.getDay(date)) {
	return(
	    <div key={`${p.ID}-${date}`} className="PuzzleLink">
	    <span className="PuzzleName" onClick={this.puzzleClick.bind(this, i, date.toString())}>{p.name}</span>
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
	    { this.renderDay(date) } 
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
