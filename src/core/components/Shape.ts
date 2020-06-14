export enum SHAPE_PRIMITIVE_TYPES {
  BOX,
  TRIANGLE,
}

class Shape {
  public primitive?: SHAPE_PRIMITIVE_TYPES;

  constructor(primitive?: SHAPE_PRIMITIVE_TYPES) {
    this.primitive = primitive ?? this.primitive;
  }

  public reset(): void {
    this.primitive = undefined;
  }
}

export default Shape;
