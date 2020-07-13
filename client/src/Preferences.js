import React from "react";
import PropTypes from "prop-types";
import RadioButtonGroup from "./RadioButtonGroup";

export default class Preferences extends React.Component {
  static propTypes = {
    setPreferences: PropTypes.func.isRequired,
    spaceBar: PropTypes.string,
    enterKey: PropTypes.string,
    endOfWord: PropTypes.string,
    skipExisting: PropTypes.bool,
    timePuzzle: PropTypes.bool,
    showWrongAnswers: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.handleSpaceBar = this.handleSpaceBar.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleEndOfWord = this.handleEndOfWord.bind(this);
    this.handleSkipExisting = this.handleSkipExisting.bind(this);
    this.handleTimePuzzle = this.handleTimePuzzle.bind(this);
    this.handleShowWrongAnswers = this.handleShowWrongAnswers.bind(this);
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
            value="Yes"
            onChange={this.handleTimePuzzle}
            checked={this.props.timePuzzle === true ? "checked" : null}
          />
          <label htmlFor="timePuzzle">Time Puzzle</label> <br />
          <input
            type="checkbox"
            id="showwronganswers"
            name="showwronganswers"
            value="No"
            onChange={this.handleShowWrongAnswers}
            checked={this.props.showWrongAnswers === true ? "checked" : null}
          />
          <label htmlFor="showWrongAnswers">Show Wrong Answers</label> <br />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="Preferences">
        {this.renderNavigation()}
        {this.renderPuzzlePrefs()}
      </div>
    );
  }
}
