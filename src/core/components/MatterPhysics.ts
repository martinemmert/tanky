import { Component } from "ecsy";
import { Body, IChamferableBodyDefinition } from "matter-js";

export default class MatterPhysics extends Component {
  public body?: Body;
  public options: IChamferableBodyDefinition = {};

  reset(): void {
    this.body = undefined;
    this.options = {};
  }
}
