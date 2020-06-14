import { World } from "ecsy";
import PlayerControlSystem from "../systems/PlayerControllsSystem";
import KeyboardSignals from "../signals/KeyboardSignals";
import PlayerControlled from "../components/PlayerControlled";
import Commands from "../components/Commands";
import PlayerTankCommands from "../controll-maps/player-tank.json";

function setup() {
  const world = new World();
  const keyboardSignals = new KeyboardSignals(window.document);
  world.registerSystem(PlayerControlSystem, {
    keyboardSignals,
    commandMap: new Map(Object.entries(PlayerTankCommands)),
  });
  const entity = world.createEntity("Player").addComponent(PlayerControlled).addComponent(Commands);
  return { world, entity, keyboardSignals };
}

describe("PlayerControlledEntity", () => {
  test("it should receive the commands based on key down events", () => {
    const { world, entity, keyboardSignals } = setup();
    keyboardSignals.start();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    world.execute(0, 0);
    expect(entity.getComponent(Commands).value).toMatchObject([
      "ACCELERATE",
      "BREAK",
      "TURN_LEFT",
      "TURN_RIGHT",
    ]);
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowUp" }));
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowDown" }));
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }));
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }));
    world.execute(0, 0);
    expect(entity.getComponent(Commands).value).toMatchObject([]);
  });
});
