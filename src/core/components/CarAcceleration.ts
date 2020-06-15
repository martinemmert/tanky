import { Component } from "ecsy";

export default class CarAcceleration extends Component {
  public value = 0;

  reset(): void {
    this.value = 0;
  }
}
