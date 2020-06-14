import { System } from "ecsy";
import { Box } from "planck-js";
import PhysicsBody from "../components/PhysicsBody";
import PhysicsShape from "../components/PhysicsShape";
import Dimensions from "../components/Dimensions";

export default class PhysicsShapeSystem extends System {
  static queries = {
    bodies: {
      components: [PhysicsBody, PhysicsShape, Dimensions],
      listen: {
        added: true,
      },
    },
  };

  execute(): void {
    this.queries.bodies.added?.forEach(entity => {
      const dimensionComponent = entity.getComponent(Dimensions);
      const physicsShapeComponent = entity.getMutableComponent(PhysicsShape);
      physicsShapeComponent.value = new Box(
        dimensionComponent.width * 0.5,
        dimensionComponent.height * 0.5,
      );
    });
  }
}
