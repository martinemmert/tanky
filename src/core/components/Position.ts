import { Component } from "ecsy";

class Position extends Component {
  x = 0;
  y = 0;

  copy(source: Position): void {
    this.x = source.x;
    this.y = source.y;
  }

  reset(): void {
    this.x = 0;
    this.y = 0;
  }
}

export default Position;
