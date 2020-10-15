import React from "react";
import { Droppable } from 'react-beautiful-dnd';
import PuzzleInfo from './PuzzleInfo';

export default class PuzzlePrefInfo extends React.Component {
  static propTypes = {
    puzzle: PuzzleInfo.isRequired
  };
  
  render() {
    return(
	<Droppable>
	  <div className="PuzzlePrefInfo">
	    {this.props.puzzle.name}
          </div>
	</Droppable>
    );
  }
}
