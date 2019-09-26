const STATE = {
  EMPTY_ANNOTATOR: 'empty',
  EDITING: 'edit',
  DONE: 'done',
}


class AnnotatorBase {
  constructor(config) {
    this.canvas = config.canvas;
    this.visualizer = config.visualizer;
    this.annotation = config.annotation || null;
    this.registerAnnotation = config.registerAnnotation || (() => null);
    this.edit = config.edit || false;

    this.phase = (this.annotation !== null) ? STATE.DONE : STATE.EMPTY_ANNOTATOR;

    this.ctx = this.canvas.getContext('2d');
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

    this.events = this.getEvents();
    this.canvas.addEventListener('visualizer-update', (e) => this.draw(), false)

    this.adjustSize();
    this.init();

    if (this.edit) {
      this.bindEvents();
    }

    this.draw();
  }

  createPoint(x, y) {
    let p = this.svg.createSVGPoint();
    p.x = x;
    p.y = y;
    return p;
  }

  getEvents() {
    return {}
  }

  adjustSize() {
    this.canvas.style.width ='100%';
    this.canvas.style.height='100%';
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  getMouseEventPosition(event) {
    let x = event.offsetX || (event.pageX - this.canvas.offsetLeft)
    let y = event.offsetY || (event.pageY - this.canvas.offsetTop)
    return this.createPoint(x, y);
  }

  init() {}

  drawAnnotation(annotation) {}

  draw() {
    this.clean();

    if (this.phase === STATE.DONE) {
      this.drawAnnotation(this.annotation);
    } else if (this.phase === STATE.EDITING) {
      this.drawEdit()
    }
  }

  clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  bindEvents() {
    if (!(this.edit)) return;

    for (let eventType in this.events) {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))){
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.addEventListener(eventType, listener, false);
      });
    }
  }

  unmount() {
    if (!(this.edit)) return;

    for (let eventType in this.events) {
      let listeners = this.events[eventType];

      if (!(Array.isArray(listeners))){
        listeners = [listeners];
      }

      listeners.forEach((listener) => {
        this.canvas.removeEventListener(eventType, listener);
      });
    }
  }
}


export default AnnotatorBase;
