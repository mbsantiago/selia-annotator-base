import React from "react";
import ReactDOM from "react-dom";

import ToolbarContainer from "./toolbarContainer";
import Toolbar from "./toolbar";

import { DefaultAnnotationStorage, AnnotationStorage } from "./storage";
import { STATES, DefaultStateManager, AnnotatorStateManager } from "./states";
import { STYLES } from "./styles";

class AnnotatorBase {
  constructor({
    canvas,
    toolbar,
    visualizer,
    annotations = null,
    state = null,
  } = {}) {
    this.canvas = canvas;
    this.toolbar = toolbar;
    this.visualizer = visualizer;

    // State object. Should implement the interface defined by the
    // StateManager class.
    if (state === null) {
      this.state = new DefaultStateManager();
    } else {
      this.state = state;
    }

    // Annotations object. Should implement the interface defined by
    // the AnnotationStorage class.
    if (annotations === null) {
      this.annotations = new DefaultAnnotationStorage();
    } else {
      this.annotations = annotations;
    }

    // States ENUM for internal reference
    this.states = {
      ...STATES,
      ...this.getStates(),
    };

    // Style mapping
    this.styles = STYLES;

    // Use 2D Context for annotation drawing.
    this.ctx = this.canvas.getContext("2d");

    // Add event listeners to annotator canvas
    this.events = this.getEvents();
    this.canvas.addEventListener("visualizer-update", () => this.draw(), false);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.bindEvents();

    // Add on window size change behaviour
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Set event listener status based on activation variable.
    if (this.state.isActive()) {
      this.activateCanvasEvents();
    } else {
      this.deactivateCanvasEvents();
    }

    // Wait until toolbar has mounted.
    this.toolbarContainer = null;
    this.renderToolbar(() => {
      // Initialize canvas and annotator
      this.adjustSize();
      this.init();

      // Wait for visualizer to be ready to start drawing annotations.
      this.visualizer.waitUntilReady().then(() => this.draw());
    });
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

    if (this.state.is(this.states.CREATE)) {
      this.drawCreation();
      return;
    }

    if (this.state.is(this.states.EDIT)) {
      this.drawEdit();
    }
  }

  drawAnnotations() {
    for (let [id, annotation] of this.annotations.list()) {
      const style = this.getAnnotationStyle(id);
      this.drawAnnotation(annotation, style);
    }
  }

  getAnnotationStyle(id) {
    const style = {
      ...this.styles.BASE_STYLE,
      ...this.annotations.getStyle(id),
    };

    if (this.annotations.isSelected(id) && this.state.is(this.states.EDIT)) {
      return { ...style, ...this.styles.EDIT_STYLE };
    }

    if (this.annotations.isHover(id) && this.state.is(this.states.LIST)) {
      return { ...style, ...this.styles.HOVER_STYLE };
    }

    if (this.annotations.isHover(id) && this.state.is(this.states.DELETE)) {
      return { ...style, ...this.styles.DELETE_STYLE };
    }

    return style;
  }

  setSelectedAnnotation(id) {
    this.annotations.select(id);
    this.draw();
  }

  setHoverAnnotation(id) {
    this.annotations.hover(id);
    this.draw();
  }

  getStates() {
    // Abtract method
    // Return any additional states.
    return {};
  }

  setState(state) {
    if (state === this.states.LIST || state === this.states.CREATE) {
      this.annotations.select(null);
    }

    this.state.set(state);
    this.draw();

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ state: this.state.get() });
    }
  }

  selectAnnotation(id) {
    this.annotations.select(id);

    // Only edit annotation if possible
    if (this.annotations.canEdit(id)) {
      this.setState(this.states.EDIT);
    }

    this.draw();
  }

  registerAnnotation(annotation) {
    const validated = this.validateAnnotation(annotation);

    let id = this.annotations.create(validated);
    // Do nothing if creation was not succesful
    if (id === null) return;

    this.annotations.select(id);
    this.setState(this.states.EDIT);
    this.draw();
  }

  updateAnnotation(id, annotation) {
    const validated = this.validateAnnotation(annotation);

    if (this.annotations.canEdit(id)) {
      this.annotations.edit(id, validated);
    }

    this.draw();
  }

  hoverOnAnnotation(id) {
    this.annotations.hover(id);
    this.draw();
  }

  deleteAnnotation(id) {
    if (!this.annotations.canDelete(id)) return;

    const successful = this.annotations.delete(id);
    if (!successful) return;

    this.annotations.select(null);
    this.setState(this.states.LIST);
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
    this.visualizer.draw();

    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.width = this.visualizer.canvas.width;
    this.canvas.height = this.visualizer.canvas.height;
  }

  getMouseEventPosition(event) {
    const x = event.offsetX || event.pageX - this.canvas.offsetLeft;
    const y = event.offsetY || event.pageY - this.canvas.offsetTop;
    return this.pixelToCoords(this.createPoint(x, y));
  }

  pixelToCoords(p) {
    return this.createPoint(p.x / this.canvas.width, p.y / this.canvas.height);
  }

  coordsToPixel(p) {
    return this.createPoint(p.x * this.canvas.width, p.y * this.canvas.height);
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  activateCanvasEvents() {
    this.canvas.style.pointerEvents = "auto";
  }

  deactivateCanvasEvents() {
    this.canvas.style.pointerEvents = "none";
  }

  activate() {
    this.state.activate();
    this.activateCanvasEvents();

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: this.state.isActive() });
    }
  }

  deactivate() {
    this.state.deactivate();
    this.deactivateCanvasEvents();

    if (this.toolbarContainer.setState) {
      this.toolbarContainer.setState({ active: this.state.isActive() });
    }
  }

  toggleActivate() {
    if (this.state.isActive()) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  onKeyPress(event) {
    if (!this.state.isActive()) return;
    if (!event.shiftKey) return;
    if (event.key === "S") this.setState(this.states.LIST);
    if (event.key === "A") this.setState(this.states.CREATE);
    if (event.key === "D") this.setState(this.states.DELETE);
  }

  bindEvents() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!Array.isArray(listeners)) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.addEventListener(eventType, listener, false);
      });
    });

    window.addEventListener("keypress", this.onKeyPress);
  }

  unmount() {
    Object.keys(this.events).forEach((eventType) => {
      let listeners = this.events[eventType];

      if (!Array.isArray(listeners)) {
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.removeEventListener(eventType, listener);
      });
    });

    window.removeEventListener("keypress", this.onKeyPress);
  }

  deleteSelectedAnnotation() {
    this.deleteAnnotation(this.annotations.getSelectedId());
  }

  onWindowResize() {
    this.adjustSize();
    this.draw();
  }

  getToolbarComponent(props) {
    return <Toolbar {...props} />;
  }

  renderToolbar(callback) {
    ReactDOM.render(
      <ToolbarContainer
        ref={(ref) => {
          this.toolbarContainer = ref;
        }}
        active={this.state.isActive()}
        state={this.state.get()}
        states={this.states}
        component={(props) => this.getToolbarComponent(props)}
        activator={() => this.activate()}
        setState={(state) => this.setState(state)}
        deleteAnnotation={() => this.deleteSelectedAnnotation()}
      />,
      this.toolbar,
      callback
    );
  }
}

export default AnnotatorBase;
export { AnnotationStorage, AnnotatorStateManager };
