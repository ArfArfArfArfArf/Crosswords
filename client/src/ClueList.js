import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { direction } from './Constants';

export default class ClueList extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    clueDirection: PropTypes.number.isRequired,
    clueNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
    clues: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedClue: PropTypes.number.isRequired,
    primary: PropTypes.bool.isRequired,
    onClueClicked: PropTypes.func.isRequired,
    gridHeight: PropTypes.number.isRequired,
    obscured: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    this.props.onClueClicked(this.props.clueDirection, e.target.dataset.id);
  }

  getDirString() {
    return this.props.clueDirection === direction.ACROSS ? "across" : "down";
  }

  componentDidUpdate() {
    const dir = this.getDirString();
    
    const li = document.getElementById(`${dir}-${this.props.selectedClue}`);
    const div = document.getElementById(`${dir}-cluelist`);

    const libox = li.getBoundingClientRect();
    const divbox = div.getBoundingClientRect();

    if (libox.top < divbox.top || libox.bottom > divbox.bottom) {
      li.scrollIntoView();
    }
  }
  
  render() {
    const height= this.props.gridHeight * 2;
    const dir = this.getDirString();

    return(
	<div className="ClueList">
	  <span className="ClueListTitle">{this.props.title}</span>
 	  <div id={`${dir}-cluelist`} style={{ height: `${height}rem`, overflow: 'scroll'}} className="Clues">
	    <ul id='cluelist' className={classnames({"nobullets": true, "obscured": this.props.obscured})}>
  	      {this.props.clueNumbers.map((v, i) => { return(<li id={`${dir}-${v}`} data-id={v} key={v} onClick={this.onClick} className={classnames({"Clue": true, "highlighted": v === this.props.selectedClue && !this.props.primary, "primary": v === this.props.selectedClue && this.props.primary })}>{v}. {this.props.clues[i]}</li>) })}
            </ul>
	  </div>
	</div>
    );
  }
}
