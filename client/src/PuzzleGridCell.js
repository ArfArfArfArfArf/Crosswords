import React from 'react';
import PropTypes from 'prop-types';

export default class PuzzleGridCell extends React.Component {
  static propTypes = {
    gridX: PropTypes.number.isRequired,
    gridY: PropTypes.number.isRequired,
    inputCallback: PropTypes.func.isRequired,
    focusCallback: PropTypes.func.isRequired,
    clickCallback: PropTypes.func.isRequired,
    userValue: PropTypes.string.isRequired,
    correctValue: PropTypes.string.isRequired,
    clueNumber: PropTypes.string.isRequired,
    inCurrentWord: PropTypes.bool.isRequired,
    isSelectedInput: PropTypes.bool.isRequired,
    circled: PropTypes.bool.isRequired,
  };
  
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    if (this.props.userValue !== '.') {
      this.props.clickCallback(this.props.gridX, this.props.gridY);
      e.preventDefault();
    }
  }
  
  getTabIndex() {
    if (this.props.userValue === '.') {
      return -1;
    } else {
      return 0;
    }
  }
  
  render()
  {
    const { userValue, clueNumber } = this.props;
    
    let className = "GridCell";
    let valueClassName = "clueValue";
    let cellValue = userValue;
    
    if (this.props.inCurrentWord) {
      className += " highlighted";
    }

    if (userValue === '.') {
      className += " black";
      cellValue = '';
    }

    if (this.props.isSelectedInput) {
      className += " selected";
    }
    
    let clueNumString = '';
    
    if (clueNumber !== "0" && userValue !== '.') {
      clueNumString = clueNumber;
    }

    return (
	<div data-testid='gridcell' className={className} onFocus={this.onFocus} onClick={this.onClick} tabIndex={this.getTabIndex()} id={this.props.gridY + ":" + this.props.gridX} key={this.props.gridY + ":" + this.props.gridX}>
          {this.props.circled &&
	    <div className="circled">
	      <svg data-testid="circle" xmlns="http://www.w3.org/2000/svg" version="1.1" height="2rem" width="2rem">
                <circle cx="1rem" cy="1rem" r="1rem" fill="transparent" stroke="#000000" />
	      </svg>
	    </div>
	  }
  	  <span data-testid="clueNumber" className="clueNumber">{clueNumString}</span>
	  <div contentEditable="true" tabIndex="-1" data-testid="value" className={valueClassName}>{cellValue}</div>
        </div>
    );
  }
}
