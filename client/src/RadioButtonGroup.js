import React from "react";
import PropTypes from "prop-types";

export default class RadioButtonGroup extends React.Component {
  static defaultProps = {
    buttons: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
        id: PropTypes.string,
        checked: PropTypes.bool,
      })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  renderButtons() {
    return this.props.buttons.map((b) => {
      return (
        <div key={b.id} className="RadioButton">
          <input
            type="radio"
            id={b.id}
            name={this.props.name}
            value={b.value}
            onChange={this.props.onChange}
            checked={b.checked}
          />
          <label htmlFor={b.id}>{b.label}</label>
          <br />
        </div>
      );
    });
  }

  render() {
    return (
      <div className="RadioButtonGroup">
        <span className="Heading">{this.props.title}</span>
        <div className="RadioButtonGroupButtons">{this.renderButtons()}</div>
      </div>
    );
  }
}
