import React from "react";
import PropTypes from "prop-types";
import RadioButtonGroup from "./RadioButtonGroup";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PuzzleInfo from './PuzzleInfo';

class PuzzlePrefInfo extends React.Component {
  static propTypes = {
    puzzle: PuzzleInfo,
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(this.props.puzzle.ID, e.target.checked);
  }
  
  render() {
    const { puzzle, index } = this.props;
    
    return(
	<Draggable draggableId={puzzle.ID} index={index}>
	  {(provided) => (
	    <div className="PuzzlePrefInfo"
	      {...provided.draggableProps}
	      {...provided.dragHandleProps}
	      ref={provided.innerRef}
	    >
	      <input type='checkbox' id={puzzle.ID} defaultChecked={puzzle.enabled} value={puzzle.enabled} onChange={this.onChange} />
	      {this.props.puzzle.name}
            </div>
	  )}
	</Draggable>
    );
  }
}

class PuzzleColumn extends React.Component {
  static propTypes = {
    puzzles: PropTypes.arrayOf(PuzzleInfo).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    return(
      <div className="PuzzleListContainer">
        <h3>Available Puzzles</h3>
	Drang and drop to re-order the puzzles, click on the checkbox to enable/disable puzzle
	<Droppable droppableId="puzzles">
	{ (provided) => (
	    <div
	      className="PuzzleList"
	      {...provided.droppableProps}
	      ref={provided.innerRef}
	    >
	      {this.props.puzzles.map( (puzzle, index) => <PuzzlePrefInfo key={puzzle.ID} puzzle={puzzle} index={index} onChange={this.props.onChange} />)}
	      {provided.placeholder}
	    </div>
	)}
	</Droppable>
	</div>
    );
  }
}

export default class Preferences extends React.Component {
  static propTypes = {
    setPreferences: PropTypes.func.isRequired,
    spaceBar: PropTypes.string,
    enterKey: PropTypes.string,
    endOfWord: PropTypes.string,
    skipExisting: PropTypes.bool,
    timePuzzle: PropTypes.bool,
    showWrongAnswers: PropTypes.bool,
    puzzles: PropTypes.arrayOf(PuzzleInfo),
  };

  constructor(props) {
    super(props);

    this.handleSpaceBar = this.handleSpaceBar.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleEndOfWord = this.handleEndOfWord.bind(this);
    this.handleSkipExisting = this.handleSkipExisting.bind(this);
    this.handleTimePuzzle = this.handleTimePuzzle.bind(this);
    this.handleShowWrongAnswers = this.handleShowWrongAnswers.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.onEnablePuzzle = this.onEnablePuzzle.bind(this);
    
    this.state = { puzzles: props.puzzles };
  }

  onEnablePuzzle(id, v) {
    var puzzles = this.state.puzzles;

    var i;

    console.log("ID: " + id + ", enabled: " + v);
    
    for (i = 0; i < puzzles.length; i++) {
      if (puzzles[i].ID === id) {
	puzzles[i].enabled = v;
      }
    }

    this.setState( { puzzles } );

    this.props.setPreferences( { puzzles } );
  }
  
  handleEnterKey(e) {
    this.props.setPreferences({ enterKey: e.target.value });
  }

  handleSpaceBar(e) {
    this.props.setPreferences({ spaceBar: e.target.value });
  }

  handleEndOfWord(e) {
    this.props.setPreferences({ endOfWord: e.target.value });
  }

  handleSkipExisting(e) {
    this.props.setPreferences({ skipExisting: e.target.checked });
  }

  handleTimePuzzle(e) {
    this.props.setPreferences({ timePuzzle: e.target.checked });
  }

  handleShowWrongAnswers(e) {
    this.props.setPreferences({ showWrongAnswers: e.target.checked });
  }

  renderNavigation() {
    return (
      <div>
        <span className="Heading">Navigation</span>
        <RadioButtonGroup
          buttons={[
            {
              value: "change",
              label: "Space bar changes direction",
              id: "change",
              checked: this.props.spaceBar === "change",
            },
            {
              value: "erase",
              label: "Space bar erases current square",
              id: "erase",
              checked: this.props.spaceBar === "erase",
            },
          ]}
          onChange={this.handleSpaceBar}
          title={"Space Bar"}
          name={"spaceBar"}
        />
        <RadioButtonGroup
          buttons={[
            {
              value: "change",
              label: "Enter key changes direction",
              id: "change",
              checked: this.props.enterKey === "change",
            },
            {
              value: "next",
              label: "Enter key moves to next word",
              id: "next",
              checked: this.props.enterKey === "next",
            },
          ]}
          onChange={this.handleEnterKey}
          title={"Enter Key"}
          name={"enterKey"}
        />
        <RadioButtonGroup
          buttons={[
            {
              value: "stop",
              label: "Stop",
              id: "change",
              checked: this.props.endOfWord === "stop",
            },
            {
              value: "next",
              label: "Move to next word",
              id: "next",
              checked: this.props.endOfWord === "next",
            },
          ]}
          onChange={this.handleEndOfWord}
          title={"End of word"}
          name={"endOfWord"}
        />
        <div className="SkipExisting">
          <input
            type="checkbox"
            id="skipexisting"
            name="skipexisting"
            value="Yes"
            onChange={this.handleSkipExisting}
            checked={this.props.skipExisting === true ? "checked" : null}
          />
          <label htmlFor="skipexisting">Skip Existing Letters</label>
        </div>
      </div>
    );
  }

  renderPuzzlePrefs() {
    return (
      <div>
        <span className="Heading">Puzzle</span>
        <div className="PuzzlePrefs">
          <input
            type="checkbox"
            id="timepuzzle"
            name="timepuzzle"
            value={this.props.timePuzzle}
            onChange={this.handleTimePuzzle}
            checked={this.props.timePuzzle === true ? "checked" : null}
          />
          <label htmlFor="timePuzzle">Time Puzzle</label> <br />
          <input
            type="checkbox"
            id="showwronganswers"
            name="showwronganswers"
            value={this.props.showWrongAnswers}
            onChange={this.handleShowWrongAnswers}
            checked={this.props.showWrongAnswers === true ? "checked" : null}
          />
          <label htmlFor="showWrongAnswers">Show Wrong Answers</label> <br />
        </div>
      </div>
    );
  }

  renderPuzzleInfo(puz) {
    return (
      <div key={puz.id} className="PuzzleInfo">
	{puz.name}
      </div>
    );
  }

  dragEnd(result) {
    const { destination, source, draggableId } = result;
    const { puzzles } = this.state;
    
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    puzzles.splice(destination.index, 0, puzzles.splice(source.index, 1)[0]);

    this.setState(puzzles);
  }

  renderPuzzleOrder() {
    return (
	<DragDropContext onDragEnd={this.dragEnd}>
	  <PuzzleColumn puzzles={this.props.puzzles} onChange={this.onEnablePuzzle} />
	</DragDropContext>
    );
  }
  
  render() {
    return (
      <div className="Preferences">
        {this.renderNavigation()}
        {this.renderPuzzlePrefs()}
        {this.renderPuzzleOrder()}
      </div>
    );
  }
}
