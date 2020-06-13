export enum SHAPE_PRIMITIVE_TYPES {
  BOX,
}

class Shape {
  public primitive?: SHAPE_PRIMITIVE_TYPES = SHAPE_PRIMITIVE_TYPES.BOX;

  public reset(): void {
    this.primitive = undefined;
  }
}

export default Shape;
