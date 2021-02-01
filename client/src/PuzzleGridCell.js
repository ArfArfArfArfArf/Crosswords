import React from "react";
import PropTypes from "prop-types";
import { inputStates } from "./Constants";

const IS_INPUT_SUPPORTED = (function () {
  try {
    // just kill browsers off, that throw an error if they don't know
    // `InputEvent`
    const event = new InputEvent("input", {
      data: "xyz",
      inputType: "deleteContentForward",
    });
    let support = false;

    // catch the others
    // https://github.com/chromium/chromium/blob/c029168ba251a240b0ec91fa3b4af4214fbbe9ab/third_party/blink/renderer/core/events/input_event.cc#L78-L82
    const el = document.createElement("input");
    el.addEventListener("input", function (e) {
      if (e.inputType === "deleteContentForward") {
        support = true;
      }
    });

    el.dispatchEvent(event);
    return support;
  } catch (error) {
    return false;
  }
})();

export default class PuzzleGridCell extends React.Component {
  static propTypes = {
    gridX: PropTypes.number.isRequired,
    gridY: PropTypes.number.isRequired,
    inputCallback: PropTypes.func.isRequired,
    focusCallback: PropTypes.func.isRequired,
    clickCallback: PropTypes.func.isRequired,
    userValue: PropTypes.string.isRequired,
    clueNumber: PropTypes.string.isRequired,
    inCurrentWord: PropTypes.bool.isRequired,
    isSelectedInput: PropTypes.bool.isRequired,
    circled: PropTypes.bool.isRequired,
    inputState: PropTypes.number.isRequired,
    showWrongAnswers: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.keypressCallback = this.keypressCallback.bind(this);
    this.inputCallback = this.inputCallback.bind(this);
    this.onFocus = this.onFocus.bind(this);

    this.inputSupported = IS_INPUT_SUPPORTED;
  }

  componentDidUpdate(prevProps) {
    if (
      (this.props.userValue !== "" || prevProps.userValue !== "") &&
      prevProps.userValue !== this.props.userValue
    ) {
      document
        .getElementById(this.props.gridY + ":" + this.props.gridX)
        .getElementsByTagName("input")[0].value = this.props.userValue;
    }
  }

  normalizeInputEvent(event) {
    var inputType = "";
    var navigationType = "";
    var data = "";
    
    if (event instanceof KeyboardEvent) {
      if (event.key === "Backspace") {
        inputType = "deleteContentBackward";
      } else if (event.key === "Delete") {
        inputType = "deleteContentForward";
      } else if (event.key.startsWith("Arrow")) {
        navigationType = event.key.replace("Arrow", "cursor");
      } else {
        data = event.key;
        inputType = "insertText";
      }
    } else {
      // @ts-ignore event.inputType is there on android - actually what we need here!
      inputType = event.inputType;
      data = event.data;

      if (inputType === "insertText") {
        navigationType = "cursorRight";
      }
    }

    return { inputType, navigationType, data, shiftKey: event.shiftKey };
  }

  inputCallback(e) {
    e.preventDefault();
    const { target, data } = e.nativeEvent;

    if (target.value.length > 1) {
      var value = target.value;

      if (data === " " || data === "," || data === ".") {
	value = this.props.userValue;
      } else {
	value = value.replace(this.props.userValue, "");

	if (value.length > 1) {
          target.value = value[value.length - 1];
	}
      }

      target.value = value;

    } else {
      if (target.value === "." || target.value === "," || target.value === ' ') {
        target.value = this.props.userInput || "";
      }
    }

    this.props.inputCallback(this.normalizeInputEvent(e.nativeEvent));
    return false;
  }

  keypressCallback(e) {
    if (!this.inputSupported || e.nativeEvent.key.length > 1) {
      e.preventDefault();

      if (e.nativeEvent.key === "Backspace") {
        e.nativeEvent.target.value = "";
      }

      this.props.inputCallback(this.normalizeInputEvent(e.nativeEvent));
      return false;
    }

    return true;
  }

  onFocus(e) {
    document
      .getElementById(this.props.gridY + ":" + this.props.gridX)
      .getElementsByTagName("input")[0]
      .focus();
  }

  onClick(e) {
    if (this.props.userValue !== ".") {
      this.props.clickCallback(this.props.gridX, this.props.gridY);
      e.preventDefault();
    }
  }

  getTabIndex() {
    if (this.props.userValue === ".") {
      return -1;
    } else {
      return 0;
    }
  }

  render() {
    const { userValue, clueNumber, inputState, showWrongAnswers } = this.props;

    let className = "GridCell";
    let valueClassName = "clueValue";
    let cellValue = userValue;

    if (this.props.inCurrentWord) {
      className += " highlighted";
      valueClassName += " highlighted";
    }

    if (userValue === ".") {
      className += " black";
      cellValue = "";
      valueClassName += " black";
    }

    if ((inputState === inputStates.INCORRECT && showWrongAnswers) || inputState === inputStates.CHECKED_INCORRECT) {
      className += " incorrect";
      valueClassName += " red";
    }

    if (this.props.isSelectedInput) {
      className += " selected";
      valueClassName += " selected";
    }

    let clueNumString = "";

    if (clueNumber !== "0" && userValue !== ".") {
      clueNumString = clueNumber;
    }

    return (
      <div
        data-testid="gridcell"
        className={className}
        onFocus={this.onFocus}
        onClick={this.onClick}
        tabIndex={this.getTabIndex()}
        id={this.props.gridY + ":" + this.props.gridX}
        key={this.props.gridY + ":" + this.props.gridX}
      >
        {this.props.circled && (
          <div className="circled">
            <svg
              data-testid="circle"
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              height="2rem"
              width="2rem"
            >
              <circle
                cx="1rem"
                cy="1rem"
                r="1rem"
                fill="transparent"
                stroke="#000000"
              />
            </svg>
          </div>
        )}
        <span data-testid="clueNumber" className="clueNumber">
          {clueNumString}
        </span>
        <input
          onKeyDown={this.keypressCallback}
          onInput={this.inputCallback}
          type="text"
          size="1"
          tabIndex="-1"
          data-testid="value"
          className={valueClassName}
          defaultValue={cellValue}
        />
      </div>
    );
  }
}
