import { Component } from "ecsy";
import { Shape } from "planck-js";

export default class PhysicsShape extends Component {
  public value: Shape | undefined;

  constructor(shape: Shape) {
    super();
    this.value = shape;
  }

  copy(source: PhysicsShape): void {
    this.value = source.value;
  }

  reset(): void {
    this.value = undefined;
  }
}
