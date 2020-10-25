import React, { Component } from "react";
import PropTypes from 'prop-types';

export default class Stopwatch extends Component {
  static defualtProps = {
    timerOn: PropTypes.bool.isRequired,
    timerStart: Date,
    timerTime: PropTypes.number.isRequired,
    onPause: PropTypes.func.isRequired,
  }
  
  state = {
    timerTime: this.props.timerTime,
  };

  componentDidMount() {
    if (this.props.timerOn) {
      this.timer = setInterval(() => {
	this.setState({
          timerTime: Date.now() - this.props.timerStart,
	});
      }, 1000);
    }
  }
  
  componentWillUpdate(nextProps, nextState) {
    if (!this.props.timerOn && nextProps.timerOn) {
      this.timer = setInterval(() => {
	this.setState({
          timerTime: Date.now() - nextProps.timerStart
	});
      }, 1000);
    } else if (this.props.timerOn && !nextProps.timerOn) {
      clearInterval(this.timer);
    }
  }

  stopTimer = () => {
    this.props.onPause();
  };

  render() {
    const { timerTime } = this.state;
    let seconds = ("0" + (Math.floor(timerTime / 1000) % 60)).slice(-2);
    let minutes = ("0" + (Math.floor(timerTime / 60000) % 60)).slice(-2);
    let hours = ("0" + Math.floor(timerTime / 3600000)).slice(-2);
    return (
      <div className="Stopwatch">
        <div className="Stopwatch-display">
          {hours} : {minutes} : {seconds}
        </div>
        {this.props.timerOn === true && (
          <button onClick={this.stopTimer}>Pause</button>
        )}
      </div>
    );
  }
}
