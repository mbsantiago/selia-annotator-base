import React from 'react';


const activeButtonClass = 'btn btn-primary';
const buttonClass = 'btn btn-light';


class Toolbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: props.active,
      state: props.state,
    };
  }

  getClassName(other) {
    const { state, active } = this.state;
    if (!active) return buttonClass;
    return state === other ? activeButtonClass : buttonClass;
  }

  handleClick(state) {
    const { setState, activator } = this.props;

    // Signal to the exterior that the annotator has been activated.
    activator();

    // Change state in parent component.
    setState(state);

    this.setState({
      state,
      active: true,
    });
  }

  renderSelectButton() {
    const { states } = this.props;
    return (
      <button
        type="submit"
        className={this.getClassName(states.SELECT)}
        onClick={() => this.handleClick(states.SELECT)}
      >
        <i className="fas fa-mouse-pointer" />
      </button>
    );
  }

  renderCreateButton() {
    const { states } = this.props;
    return (
      <button
        type="submit"
        className={this.getClassName(states.CREATE)}
        onClick={() => this.handleClick(states.CREATE)}
      >
        <i className="fas fa-plus" />
      </button>
    );
  }

  renderDeleteButton() {
    const { states } = this.props;
    return (
      <button
        type="submit"
        className={this.getClassName(states.DELETE)}
        onClick={() => this.handleClick(states.DELETE)}
      >
        <i className="fas fa-eraser" />
      </button>
    );
  }

  renderEditButton() {
    const { states } = this.props;
    return (
      <button
        type="submit"
        className={this.getClassName(states.EDIT)}
        onClick={() => this.handleClick(states.EDIT)}
      >
        <i className="fas fa-edit" />
      </button>
    );
  }

  renderEditSection() {
    const { state } = this.state;
    const { states } = this.props;
    const { renderExtra } = this.props;

    if (state !== states.EDIT) return <></>;

    return (
      <>
        <div className="px-1" style={{ borderLeft: '1px solid grey' }} />
        <div className="mr-2">
          {this.renderEditButton()}
        </div>
        {renderExtra()}
      </>
    );
  }

  render() {
    const { states } = this.props;

    return (
      <div className="col mb-2 d-flex">
        <div className="mr-2">
          {this.renderSelectButton()}
        </div>
        <div className="mr-2">
          {this.renderCreateButton()}
        </div>
        <div className="mr-2">
          {this.renderDeleteButton()}
        </div>
        {this.renderEditSection()}
      </div>
    );
  }
}


export default Toolbar;
