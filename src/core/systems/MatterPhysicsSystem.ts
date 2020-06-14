import { World, System } from "ecsy";
import Matter from "matter-js";
import MatterPhysics from "../components/MatterPhysics";
import Shape from "../components/Shape";
import Dimensions from "../components/Dimensions";
import Position from "../components/Position";
import Rotation from "../components/Rotation";

export default class MatterPhysicsSystem extends System {
  static queries = {
    physicEntities: {
      components: [MatterPhysics, Shape, Dimensions, Position],
      listen: {
        added: true,
        removed: true,
      },
    },
  };

  public engine: Matter.Engine;

  private lastDelta = 0;

  constructor(world: World) {
    super(world);
    this.engine = Matter.Engine.create();
  }

  execute(delta: number): void {
    const physicEntitiesQuery = this.queries.physicEntities;
    const addedEntities = physicEntitiesQuery.added;
    const removedEntities = physicEntitiesQuery.removed;
    if (addedEntities?.length) {
      const bodies = addedEntities.map(entity => {
        const physicsComponent = entity.getMutableComponent(MatterPhysics);
        const positionComponent = entity.getComponent(Position);
        const dimensionsComponent = entity.getComponent(Dimensions);
        physicsComponent.body = Matter.Bodies.rectangle(
          positionComponent.x,
          positionComponent.y,
          dimensionsComponent.width,
          dimensionsComponent.height,
          physicsComponent.options,
        );
        return physicsComponent.body;
      });
      Matter.World.add(this.engine.world, bodies);
    }

    if (removedEntities) {
      const bodies = removedEntities
        .map(entity => entity.getComponent(MatterPhysics).body)
        .filter(Boolean) as Matter.Body[];
      bodies.forEach(body => Matter.World.remove(this.engine.world, body));
    }

    // Update the simulation
    const timeCorrection = this.lastDelta ? delta / this.lastDelta : 1;
    Matter.Engine.update(this.engine, delta, timeCorrection);
    this.lastDelta = delta;

    // Update the entities
    physicEntitiesQuery.results.forEach(entity => {
      const physicsComponent = entity.getComponent(MatterPhysics);
      const positionComponent = entity.getMutableComponent(Position);

      if (!physicsComponent.body) return;
      // Update position
      positionComponent.x = physicsComponent.body.position.x;
      positionComponent.y = physicsComponent.body.position.y;
      // Update rotation if available
      if (!entity.hasComponent(Rotation)) return;
      const rotationComponent = entity.getMutableComponent(Rotation);
      rotationComponent.value = physicsComponent.body.angle;
    });
  }
}
