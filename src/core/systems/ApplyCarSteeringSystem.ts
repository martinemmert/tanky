import { System } from "ecsy";
import CarSteering from "../components/CarSteering";
import Matter from "matter-js";
import CarAcceleration from "../components/CarAcceleration";
import MatterComposite from "../components/MatterComposite";

export default class ApplyCarSteeringSystem extends System {
  static queries = {
    steeredCars: {
      components: [CarSteering, MatterComposite],
    },
    acceleratedCars: {
      components: [CarAcceleration, MatterComposite],
    },
  };

  execute(): void {
    const steeredCarsQuery = this.queries.steeredCars;
    const acceleratedCarsQuery = this.queries.acceleratedCars;

    steeredCarsQuery.results.forEach(entity => {
      const carSteeringComponent = entity.getComponent(CarSteering);
      const { composite } = entity.getMutableComponent(MatterComposite);

      composite?.bodies.forEach(body => {
        if (body.label.toLowerCase().includes("wheel")) {
          Matter.Body.setAngle(body, carSteeringComponent.steeringDirection);
        }
      });
    });

    acceleratedCarsQuery.results.forEach(entity => {
      const carAccelerationComponent = entity.getComponent(CarAcceleration);
      const { composite } = entity.getMutableComponent(MatterComposite);

      composite?.bodies.forEach(body => {
        if (body.label.toLowerCase().includes("wheel")) {
          Matter.Body.applyForce(body, body.position, {
            x: 0,
            y: carAccelerationComponent.value * 0.001,
          });
        }
      });
    });
  }
}
