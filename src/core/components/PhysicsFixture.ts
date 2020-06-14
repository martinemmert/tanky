import { Component } from "ecsy";
import { Fixture, Shape } from "planck-js";

export default class PhysicsFixture extends Component {
  public value: Fixture | undefined;
  public shape: Shape | undefined;

  copy(source: PhysicsFixture): void {
    this.value = source.value;
    this.shape = source.shape;
  }

  reset(): void {
    this.value = undefined;
    this.shape = undefined;
  }
}
