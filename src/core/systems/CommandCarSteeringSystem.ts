import { System } from "ecsy";
import CarSteering from "../components/CarSteering";
import Commands from "../components/Commands";
import CarAcceleration from "../components/CarAcceleration";

export default class CommandCarSteeringSystem extends System {
  static queries = {
    steeredCars: {
      components: [CarSteering, Commands],
    },
    acceleratedCars: {
      components: [CarAcceleration, Commands],
    },
  };

  execute(): void {
    const steeredCarsQuery = this.queries.steeredCars;
    const acceleratedCarsQuery = this.queries.acceleratedCars;

    steeredCarsQuery.results.forEach(entity => {
      const commandsComponent = entity.getComponent(Commands).value;
      const carSteeringComponent = entity.getMutableComponent(CarSteering);

      const doesSteerLeft = commandsComponent.includes("TURN_LEFT");
      const doesSteerRight = commandsComponent.includes("TURN_RIGHT");

      if (!doesSteerLeft && !doesSteerRight) {
        carSteeringComponent.steeringDirection = 0;
      }

      if (doesSteerLeft && !doesSteerRight) {
        carSteeringComponent.steeringDirection =
          carSteeringComponent.steeringDirection - carSteeringComponent.maxSteeringAcceleration;
        carSteeringComponent.steeringDirection = Math.max(
          CarSteering.MAX_LEFT_DIRECTION,
          carSteeringComponent.steeringDirection,
        );
      }
      if (doesSteerRight && !doesSteerLeft) {
        carSteeringComponent.steeringDirection =
          carSteeringComponent.steeringDirection + carSteeringComponent.maxSteeringAcceleration;
        carSteeringComponent.steeringDirection = Math.min(
          CarSteering.MAX_RIGHT_DIRECTION,
          carSteeringComponent.steeringDirection,
        );
      }
    });

    acceleratedCarsQuery.results.forEach(entity => {
      const commands = entity.getComponent(Commands).value;
      const carAccelerationComponent = entity.getMutableComponent(CarAcceleration);

      if (commands.includes("ACCELERATE")) {
        carAccelerationComponent.value = 1;
      } else {
        carAccelerationComponent.value = 0;
      }
    });
  }
}
