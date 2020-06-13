import React from 'react';


class Toolbar extends React.Component {
  renderEditSection() {
    const { editButton, deleteButton } = this.props;
    return (
      <>
        <div className="px-1" style={{ borderLeft: '1px solid grey' }} />
        <div className="mr-2">
          {editButton()}
        </div>
        <div className="mr-2">
          {deleteButton()}
        </div>
      </>
    );
  }

  render() {
    const { state, states, selectButton, createButton, eraseButton } = this.props;

    return (
      <div className="col mb-2 d-flex">
        <div className="mr-2">
          {selectButton()}
        </div>
        <div className="mr-2">
          {createButton()}
        </div>
        <div className="mr-2">
          {eraseButton()}
        </div>
        {state === states.EDIT
          ? this.renderEditSection()
          : null
        }
      </div>
    );
  }
}


export default Toolbar;
