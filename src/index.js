import React from 'react';
import Toolbar from './toolbar';


const LIST = 'list';
const SELECT = 'select';
const CREATE = 'create';
const EDIT = 'edit';
const DELETE = 'delete';
const STATES = {
  LIST,
  SELECT,
  CREATE,
  EDIT,
  DELETE,
};


const LIST_STYLE = {
  strokeStyle: 'yellow',
  lineWidth: 1,
};
const SELECT_STYLE = {
  strokeStyle: 'cyan',
  lineWidth: 4,
};
const CREATE_STYLE = {
  lineDash: [10, 15],
  strokeStyle: 'red',
  lineWidth: 4,
};
const EDIT_STYLE = {
  strokeStyle: 'yellow',
  lineWidth: 4,
};
const DELETE_STYLE = {
  strokeStyle: 'red',
  lineWidth: 4,
};
const STYLES = {
  LIST_STYLE,
  SELECT_STYLE,
  CREATE_STYLE,
  EDIT_STYLE,
  DELETE_STYLE,
};


function hasAttr(obj, attr) {
  return Object.prototype.hasOwnProperty.call(obj, attr);
}


let dummyIndex = 0;
function dummyAnnotationRegister(annotation) {
  dummyIndex += 1;
  return dummyIndex;
}


class AnnotatorBase {
  constructor(config) {
    this.canvas = config.canvas;
    this.visualizer = config.visualizer;

    this.props = {};

    // Annotations object. Should be a mapping of the type
    // { annotationId: annotation }. AnnotationIDs should be
    // strings.
    if (hasAttr(config, 'annotations')) {
      this.annotations = config.annotations;
    } else {
      this.annotations = {};
    }

    // Indicates whether the annotator is active
    if (hasAttr(config, 'active')) {
      this.active = config.active;
    } else {
      this.active = true;
    }

    // Function to signal to the exterior that the annotator has
    // been activated. Should be a function of type
    // () => void;
    if (hasAttr(config, 'activator')) {
      this.activator = () => {
        this.activate();
        config.activator();
      };
    } else {
      this.activator = () => this.activate();
    }

    // State of the annotator. Can only be one of 'select', 'list',
    // 'create', 'edit', 'delete';
    if (hasAttr(config, 'state')) {
      this.state = config.state;
    } else {
      this.state = CREATE;
    }

    // External function used to notify of a change in state. Should be
    // a function of type (state) => void.
    if (hasAttr(config, 'setState')) {
      this.props.setState = config.changeState;
    } else {
      this.props.setState = (state) => null;
    }

    // External function used to register a new annotation. Should be
    // a function of type (annotation) => annotationId. It should
    // return null if the externall registration was unsuccessful.
    // Annotation ID should be strings.
    if (hasAttr(config, 'registerAnnotation')) {
      this.props.registerAnnotation = config.registerAnnotation;
    } else {
      this.props.registerAnnotation = dummyAnnotationRegister;
    }

    // External function used to select an annotation. Should be
    // a function of type (annotationId) => bool. The function should
    // return the externally updated annotation.
    if (hasAttr(config, 'updateAnnotation')) {
      this.props.updateAnnotation = config.updateAnnotation;
    } else {
      this.props.updateAnnotation = (annotationId, annotation) => annotation;
    }

    // External function used to update an annotation. Should be
    // a function of type (annotationId, annotation) => bool. The function
    // should return if the external update was successful.
    if (hasAttr(config, 'selectAnnotation')) {
      this.props.selectAnnotation = config.selectAnnotation;
    } else {
      this.props.selectAnnotation = (annotationId) => true;
    }

    // External function used to get the annotation style. Should
    // be a function of type (annotationId) => style. `style` is
    // an object with style directives.
    if (hasAttr(config, 'getAnnotationStyle')) {
      this.props.getAnnotationStyle = config.getAnnotationStyle;
    } else {
      this.props.getAnnotationStyle = (annotationId) => {};
    }

    // External function used to mark an annotation when hovered on.
    // Should be a function of type (annotationId) => void;
    if (hasAttr(config, 'hoverOnAnnotation')) {
      this.props.hoverOnAnnotation = config.hoverOnAnnotation;
    } else {
      this.props.hoverOnAnnotation = (annotationId) => null;
    }

    // External function used to delete an annotation. Should be
    // a function of type (annotationId) => bool. The function should
    // return if the external delete was successfull.
    if (hasAttr(config, 'deleteAnnotation')) {
      this.props.deleteAnnotation = config.deleteAnnotation;
    } else {
      this.props.deleteAnnotation = (annotationId) => true;
    }

    // Currently selected annotation.
    if (hasAttr(config, 'selectedAnnotation')) {
      this.selectedAnnotation = config.selectedAnnotation;
    } else {
      this.selectedAnnotation = null;
    }

    // States ENUM for internal reference
    this.states = STATES;

    // Style mapping
    this.styles = STYLES;

    // To be used when mouse is over annotation
    this.hoverAnnotation = null;

    // Use 2D Context for annotation drawing.
    this.ctx = this.canvas.getContext('2d');

    // Add event listeners to annotator canvas canvas
    this.events = this.getEvents();
    this.canvas.addEventListener(
      'visualizer-update',
      () => this.draw(),
      false,
    );
    this.onKeyPress = this.onKeyPress.bind(this);
    this.bindEvents();

    // Set event listener status based on activation variable.
    if (this.active) {
      this.activateCanvasEvents();
    } else {
      this.deactivateCanvasEvents();
    }

    // Toolbar reference
    this.toolbar = null;

    // Initialize canvas and annotator
    this.adjustSize();
    this.init();

    // Wait for visualizer to be ready to start drawing annotations.
    this.visualizer.waitUntilReady().then(() => this.draw());
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */

  init() {
    // Method for custom intialization code.
  }

  drawAnnotation(annotation, style) {
    // Abstract method.
  }

  getEvents() {
    // Overwrite this method to define event listeners.
    return {};
  }

  /* eslint-enable class-methods-use-this */

  draw() {
    this.clean();
    this.drawAnnotations();

    if (this.state === CREATE) {
      this.drawCreation();
      return;
    }

    if (this.state === EDIT) {
      this.drawEdit();
    }
  }

  drawAnnotations() {
    Object.entries(this.annotations).forEach(([annotationId, annotation]) => {
      const style = this.getAnnotationStyle(annotationId);
      this.drawAnnotation(annotation, style);
    });
  }

  getAnnotationStyle(annotationId) {
    if (this.selectedAnnotation === annotationId && this.state === EDIT) {
      return EDIT_STYLE;
    }

    if (this.hoverAnnotation === annotationId && this.state === SELECT) {
      return SELECT_STYLE;
    }

    if (this.hoverAnnotation === annotationId && this.state === DELETE) {
      return DELETE_STYLE;
    }

    return {
      ...LIST_STYLE,
      ...this.props.getAnnotationStyle(annotationId),
    };
  }

  setSelectedAnnotation(annotationId) {
    this.selectedAnnotation = annotationId;
    this.draw();
  }

  setHoverAnnotation(annotationId) {
    this.hoverAnnotation = annotationId;
    this.draw();
  }

  setState(state) {
    if (state === SELECT || state === LIST) {
      this.selectedAnnotation = null;
    }

    this.props.setState(state);
    this.state = state;
    this.draw();
  }

  selectAnnotation(annotationId) {
    this.props.selectAnnotation(annotationId);
    this.selectedAnnotation = annotationId;
    this.setState(this.states.EDIT);
    this.draw();
  }

  registerAnnotation(annotation) {
    const validated = this.validateAnnotation(annotation);
    const id = this.props.registerAnnotation(validated);

    if (id === null) return;

    this.annotations[id] = validated;
    this.selectedAnnotation = id;
    this.setState(this.states.EDIT);
    this.draw();
  }

  updateAnnotation(annotationId, annotation) {
    const validated = this.validateAnnotation(annotation);
    const updatedAnnotation = this.props.updateAnnotation(annotationId, validated);
    this.annotations[annotationId] = updatedAnnotation;
    this.draw();
  }

  hoverOnAnnotation(annotationId) {
    this.props.hoverOnAnnotation(annotationId);
    this.hoverAnnotation = annotationId;
    this.draw();
  }

  deleteAnnotation(annotationId) {
    const successful = this.props.deleteAnnotation(annotationId);
    if (!successful) return;

    delete this.annotations[annotationId];
    this.setState(this.states.SELECT);
    this.draw();
  }

  createPoint(x, y) {
    const p = new DOMPoint();
    p.x = x;
    p.y = y;
    return p;
  }

  adjustSize() {
    this.visualizer.adjustSize();

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.visualizer.canvas.width;
    this.canvas.height = this.visualizer.canvas.height;
  }

  getMouseEventPosition(event) {
    const x = event.offsetX || (event.pageX - this.canvas.offsetLeft);
    const y = event.offsetY || (event.pageY - this.canvas.offsetTop);
    return this.pixelToCoords(this.createPoint(x, y));
  }

  pixelToCoords(p) {
    return this.createPoint(
      p.x / this.canvas.width,
      p.y / this.canvas.height,
    );
  }

  coordsToPixel(p) {
    return this.createPoint(
      p.x * this.canvas.width,
      p.y * this.canvas.height,
    );
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  activateCanvasEvents() {
    this.canvas.style.pointerEvents = 'auto';
  }

  deactivateCanvasEvents() {
    this.canvas.style.pointerEvents = 'none';
  }

  activate() {
    this.active = true;
    this.activateCanvasEvents();

    if (this.toolbar.setState) {
      this.toolbar.setState({ active: true });
    }
  }

  deactivate() {
    this.active = false;
    this.deactivateCanvasEvents();

    if (this.toolbar.setState) {
      this.toolbar.setState({ active: false });
    }
  }

  toggleActivate() {
    if (this.active) {
      this.active = false;
      this.deactivateCanvasEvents();
    } else {
      this.active = true;
      this.activateCanvasEvents();
    }

    if (this.toolbar.setState) {
      this.toolbar.setState((prevState) => ({ active: !prevState.active }));
    }
  }

  onKeyPress(event) {
    if (!this.active) return;
    if (!event.shiftKey) return;
    if (event.key === 'A') this.setState(CREATE);
    if (event.key === 'S') this.setState(SELECT);
    if (event.key === 'D') this.setState(DELETE);
  }

  bindEvents() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.addEventListener(eventType, listener, false);
      });
    });

    window.addEventListener('keypress', this.onKeyPress);
  }

  unmount() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.removeEventListener(eventType, listener);
      });
    });

    window.removeEventListener('keypress', this.onKeyPress);
  }

  renderExtraTools() {
    // Return a React component for extra buttons on the toolbar.
    return null;
  }

  renderToolbar() {
    return (
      <Toolbar
        ref={(ref) => { this.toolbar = ref; }}
        active={this.active}
        states={this.states}
        state={this.state}
        activator={() => this.activator()}
        setState={(state) => this.setState(state)}
        renderExtra={() => this.renderExtraTools()}
        deleteAnnotation={() => this.deleteAnnotation(this.selectedAnnotation)}
      />
    );
  }
}


export default AnnotatorBase;
