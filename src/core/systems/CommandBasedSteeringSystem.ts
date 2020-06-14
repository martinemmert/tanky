import { System } from "ecsy";
import Velocity from "../components/Velocity";
import Commands from "../components/Commands";

export default class CommandBasedSteeringSystem extends System {
  static queries = {
    commandedEntities: {
      components: [Commands, Velocity],
    },
  };

  execute(): void {
    this.queries.commandedEntities.results.forEach(entity => {
      const commands = entity.getComponent(Commands);
      const velocity = entity.getMutableComponent(Velocity);
      if (commands.value.includes("RIGHT")) {
        velocity.x = 0.1;
      }
      if (commands.value.includes("LEFT")) {
        velocity.x = -0.1;
      }
      if (commands.value.includes("UP")) {
        velocity.y = -0.1;
      }
      if (commands.value.includes("DOWN")) {
        velocity.y = 0.1;
      }
      if (!commands.value.includes("UP") && !commands.value.includes("DOWN")) {
        velocity.y = 0;
      }
      if (!commands.value.includes("LEFT") && !commands.value.includes("RIGHT")) {
        velocity.x = 0;
      }
    });
  }
}
