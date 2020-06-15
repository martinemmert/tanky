import { Component } from "ecsy";

export default class CarSteering extends Component {
  static MAX_LEFT_DIRECTION = -1;
  static MAX_RIGHT_DIRECTION = 1;
  /**
   * the current steering direction between [-1, 0, 1]
   */
  public steeringDirection = 0;

  public maxSteeringAcceleration = 0.1;

  // TODO: add easing equations
  reset(): void {
    this.steeringDirection = 0;
    this.maxSteeringAcceleration = 0.1;
  }
}
