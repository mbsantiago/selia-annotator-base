import { STYLES } from "./styles";

class AnnotationStorage {
  /* Returns a list of all ids and annotations */
  list() {}

  /* Returns a list of all annotations  */
  listAnnotations() {}

  /* Returns a list of all ids */
  listIds() {}

  /* Read the annotation with a given ID */
  get(id) {}

  /* Read the selected annotation */
  getSelected() {}

  getSelectedId() {}

  getHover() {}

  getHoverId() {}

  /* Determines if a given annotation is currently selected */
  isSelected(id) {}

  /* Determines if a given annotation is being hovered */
  isHover(id) {}

  /* Determines if an annotation can be edited */
  canEdit(id) {}

  /* Determines if an annotation can be deleted */
  canDelete(id) {}

  /* Select an annotation as being hovered over */
  hover(id) {}

  /* Select an annotation to edit */
  select(id) {}

  /* Create a new annotation and get the id */
  create(annotation) {
    // This should return the id of the new annotation
  }

  /* Delete an annotation */
  delete(id) {}

  /* Update the annotation information */
  edit(id, annotation) {}

  /* Get the drawing style to be applied to an annotation */
  getStyle(id) {
    // Get the drawing style for an annotation
  }

  /* Delete all annotations */
  clear() {
    // Delete all annotations
  }
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class DefaultAnnotationStorage extends AnnotationStorage {
  constructor({ annotations = {}, selected = null, hover = null } = {}) {
    super();

    this.annotations = annotations;
    this.selectedAnnotation = selected;
    this.hoverAnnotation = hover;
  }

  list() {
    return Object.entries(this.annotations);
  }

  listAnnotations() {
    return Object.values(this.annotations);
  }

  listIds() {
    return Object.keys(this.annotations);
  }

  get(id) {
    return this.annotations[id];
  }

  getSelected() {
    if (this.selectedAnnotation === null) return null;
    return this.annotations[this.selectedAnnotation];
  }

  getSelectedId() {
    return this.selectedAnnotation;
  }

  getHover() {
    if (this.hoverAnnotation === null) return null;
    return this.annotations[this.hoverAnnotation];
  }

  getHoverId() {
    return this.hoverAnnotation;
  }

  isSelected(id) {
    return id === this.selectedAnnotation;
  }

  isHover(id) {
    return id === this.hoverAnnotation;
  }

  canEdit(id) {
    return true;
  }

  canDelete(id) {
    return true;
  }

  hover(id) {
    this.hoverAnnotation = id;
  }

  select(id) {
    this.selectedAnnotation = id;
  }

  create(annotation) {
    let id = uuidv4();
    this.annotations[id] = annotation;
    return id;
  }

  delete(id) {
    delete this.annotations[id];
    return true;
  }

  edit(id, annotation) {
    this.annotations[id] = annotation;
  }

  getStyle(id) {
    if (this.isHover(id)) {
      return STYLES.HOVER_STYLE;
    }

    if (this.isSelected(id)) {
      return STYLES.SELECT_STYLE;
    }

    return STYLES.LIST_STYLE;
  }
}

export { AnnotationStorage, DefaultAnnotationStorage };
