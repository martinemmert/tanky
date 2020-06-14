import { Component } from "ecsy";

export default class Rotation extends Component {
  value = 0;

  copy(source: Rotation): void {
    this.value = source.value;
  }

  reset(): void {
    this.value = 0;
  }
}
