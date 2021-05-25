/* Basic states for the annotator
 *
 * These states indicate wether the annotation tool is ..:
 *
/* Showing all annotations */
const LIST = "list";
/* Creating an annotation */
const CREATE = "create";
/* Editing an annotation */
const EDIT = "edit";
/* Selecting an annotation for deletion */
const DELETE = "delete";

const STATES = {
  LIST,
  CREATE,
  EDIT,
  DELETE,
};

class AnnotatorStateManager {
  /* Get the current state of the annotator */
  get() {}

  /* Set the state of the annotator */
  set(state) {}

  /* Check if the annotator is in a determined state */
  is(state) {}

  /* Check if the annotator is active */
  isActive() {}

  activate() {}

  deactivate() {}

  toggle() {}
}

class DefaultStateManager extends AnnotatorStateManager {
  constructor({ active = true, state = LIST }) {
    super();
    this.active = active;
    this.state = state;
  }

  get(state) {
    return this.state;
  }

  set(state) {
    this.state = state;
  }

  is(state) {
    return this.state === state;
  }

  isActive() {
    return this.active;
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  toggle() {
    this.active = !this.active;
  }
}

export { STATES, AnnotatorStateManager, DefaultStateManager };
