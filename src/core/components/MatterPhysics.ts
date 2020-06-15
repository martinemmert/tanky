import { Component } from "ecsy";
import { Body, Composite, IChamferableBodyDefinition } from "matter-js";

export default class MatterPhysics extends Component {
  public body?: Body | Composite;
  public options: IChamferableBodyDefinition = {};

  reset(): void {
    this.body = undefined;
    this.options = {};
  }
}
