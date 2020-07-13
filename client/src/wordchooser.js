import React from "react";
import Modal from "react-modal";
import PropTypes from "prop-types";

export default class WordChooser extends React.Component {
  static propTypes = {
    modalIsOpen: PropTypes.bool,
    words: PropTypes.arrayOf(
      PropTypes.shape({
        word: PropTypes.string,
        id: PropTypes.number,
      })
    ),
  };

  renderWords() {
    let len = this.props.words.length;
    let i;
    let checkbox = "";

    for (i = 0; i < len; i++) {
      let word = this.props.words[i].word;
      let id = this.props.words[i].id;

      checkbox +=
        "<input type='checkbox' name='" +
        word +
        "' value='" +
        id +
        ">" +
        word +
        "</input>";
    }

    return checkbox;
  }

  render() {
    return (
      <Modal isOpen={this.props.modalIsOpen} contentLabel="Modal">
        <div>{this.renderWords()}</div>
      </Modal>
    );
  }
}
