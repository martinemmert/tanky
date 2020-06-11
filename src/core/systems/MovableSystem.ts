import { System } from "ecsy";
import Velocity from "../components/Velocity";
import Position from "../components/Position";

class MovableSystem extends System {
  // TODO: add time to calculate movement via pixel per seconds
  execute(delta: number): void {
    this.queries.moving.results.forEach(entity => {
      const velocity = entity.getComponent(Velocity);
      const position = entity.getMutableComponent(Position);
      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
    });
  }
}

MovableSystem.queries = {
  moving: {
    components: [Velocity, Position],
  },
};

export default MovableSystem;
