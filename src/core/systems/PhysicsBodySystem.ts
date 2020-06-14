import { System } from "ecsy";
import { Vec2 } from "planck-js";
import PhysicsBody from "../components/PhysicsBody";
import PhysicsWorld from "../components/PhysicsWorld";
import PhysicsFixture from "../components/PhysicsFixture";
import PhysicsShape from "../components/PhysicsShape";
import Position from "../components/Position";
import Rotation from "../components/Rotation";
import Center from "../components/Center";

export default class PhysicsBodySystem extends System {
  static queries = {
    worlds: {
      components: [PhysicsWorld],
    },
    bodies: {
      components: [PhysicsBody, PhysicsFixture, PhysicsShape, Position, Rotation, Center],
      listen: {
        added: true,
        removed: true,
      },
    },
  };

  execute(): void {
    const worldsQuery = this.queries.worlds;
    const bodiesQuery = this.queries.bodies;

    worldsQuery.results.forEach(worldEntity => {
      const world = worldEntity.getComponent(PhysicsWorld).value;

      if (!world) return;

      bodiesQuery.added?.forEach(entity => {
        const bodyComponent = entity.getMutableComponent(PhysicsBody);
        const fixtureComponent = entity.getMutableComponent(PhysicsFixture);
        const shapeComponent = entity.getComponent(PhysicsShape);
        const positionComponent = entity.getComponent(Position);
        const rotationComponent = entity.getComponent(Rotation);

        bodyComponent.body = world.createBody();
        if (bodyComponent.isDynamic) bodyComponent.body.setDynamic();

        if (shapeComponent.value) {
          fixtureComponent.value = bodyComponent.body.createFixture(shapeComponent.value, 1);
        } else {
          throw new Error(`Missing PysicsShape component value`);
        }
        bodyComponent.body?.setMassData({ mass: 1, center: new Vec2(), I: 1 });
        bodyComponent.body?.setPosition(new Vec2(positionComponent.x, positionComponent.y));
        bodyComponent.body?.setAngle(rotationComponent.value);
      });

      bodiesQuery.removed?.forEach(entity => {
        const bodyComponent = entity.getComponent(PhysicsBody);
        const fixtureComponent = entity.getComponent(PhysicsFixture);

        if (bodyComponent.body) {
          if (fixtureComponent.value) {
            bodyComponent.body.destroyFixture(fixtureComponent.value);
            fixtureComponent.reset();
          }
          world.destroyBody(bodyComponent.body);
          bodyComponent.reset();
        }
        entity.removeComponent(PhysicsBody);
      });
    });
  }
}
