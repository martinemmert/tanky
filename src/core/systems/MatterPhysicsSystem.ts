import { World, System, Not } from "ecsy";
import Matter from "matter-js";
import Position from "../components/Position";
import Rotation from "../components/Rotation";
import MatterBody from "../components/MatterBody";
import MatterComposite from "../components/MatterComposite";

export default class MatterPhysicsSystem extends System {
  static queries = {
    bodies: {
      components: [MatterBody, Not(MatterComposite), Position],
      listen: {
        added: true,
        removed: true,
      },
    },
    composites: {
      components: [Not(MatterBody), MatterComposite, Position],
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
    this.engine.world.gravity.y = 0;
  }

  execute(delta: number): void {
    this.queries.bodies.added?.forEach(entity => {
      const { body } = entity.getComponent(MatterBody);
      const position = entity.getComponent(Position);
      if (body) {
        Matter.Body.translate(body, position);
        Matter.World.add(this.engine.world, body);
      }
    });

    this.queries.bodies.results.forEach(entity => {
      const { body } = entity.getComponent(MatterBody);
      const position = entity.getMutableComponent(Position);
      if (body) {
        position.x = body.position.x;
        position.y = body.position.y;
        if (entity.hasComponent(Rotation)) {
          const rotation = entity.getComponent(Rotation);
          rotation.value = body.angle;
        }
      }
    });

    this.queries.bodies.removed?.forEach(entity => {
      const { body } = entity.getComponent(MatterBody);
      if (body) Matter.World.remove(this.engine.world, body);
    });

    this.queries.composites.added?.forEach(entity => {
      const { composite } = entity.getComponent(MatterComposite);
      const position = entity.getComponent(Position);
      if (composite) {
        Matter.Composite.translate(composite, position);
        Matter.World.add(this.engine.world, composite);
      }
    });

    this.queries.composites.removed?.forEach(entity => {
      const { composite } = entity.getComponent(MatterComposite);
      if (composite) Matter.World.remove(this.engine.world, composite);
    });

    // Update the simulation
    const timeCorrection = this.lastDelta ? delta / this.lastDelta : 1;
    this.lastDelta = delta;
    Matter.Engine.update(this.engine, delta, timeCorrection);
  }
}
