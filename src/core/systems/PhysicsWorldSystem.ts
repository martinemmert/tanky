import { System } from "ecsy";
import PhysicsWorld from "../components/PhysicsWorld";
import PhysicsBody from "../components/PhysicsBody";
import Position from "../components/Position";
import Rotation from "../components/Rotation";

export default class PhysicsWorldSystem extends System {
  static queries = {
    worlds: {
      components: [PhysicsWorld],
    },
    bodies: {
      components: [PhysicsBody, Position, Rotation],
    },
  };

  execute(delta: number): void {
    const bodiesQuery = this.queries.bodies;
    this.queries.worlds.results.forEach(worldEntity => {
      const world = worldEntity.getComponent(PhysicsWorld).value;

      if (!world) return;
      world.step(1 / delta);
      world.clearForces();

      bodiesQuery.results.forEach(bodyEntity => {
        const physicsBodyComponent = bodyEntity.getComponent(PhysicsBody);
        const positionComponent = bodyEntity.getMutableComponent(Position);
        const rotationComponent = bodyEntity.getMutableComponent(Rotation);
        if (physicsBodyComponent.body) {
          positionComponent.x = physicsBodyComponent.body.getPosition().x;
          positionComponent.y = physicsBodyComponent.body.getPosition().y;
          rotationComponent.value = physicsBodyComponent.body.getAngle();
        }
      });
    });
  }
}
