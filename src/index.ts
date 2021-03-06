import { World } from "ecsy";
import * as PIXI from "pixi.js";
import Dimensions from "./core/components/Dimensions";
import Position from "./core/components/Position";
import Renderable from "./core/components/Renderable";
import Shape, { SHAPE_PRIMITIVE_TYPES } from "./core/components/Shape";
import Velocity from "./core/components/Velocity";
import MovableSystem from "./core/systems/MovableSystem";
import PixiRenderSystem from "./core/systems/PixiRenderSystem";
import PlayerControllsSystem from "./core/systems/PlayerControllsSystem";
import PlayerControlled from "./core/components/PlayerControlled";
import Commands from "./core/components/Commands";
import KeyboardSignals from "./core/signals/KeyboardSignals";
import PlayerTankCommands from "./core/controll-maps/player-tank.json";
import CommandBasedSteeringSystem from "./core/systems/CommandBasedSteeringSystem";

const SPEED_MULTIPLIER = 0.1;

// Initialize pixi app
const renderer = new PIXI.Renderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";

window.addEventListener("resize", () => {
  // TODO: resize stage to correct resolution
  renderer.resize(window.innerWidth, window.innerHeight);
});

document.body.append(renderer.view);

function createBoxEntity(world: World): void {
  world
    .createEntity()
    .addComponent(Velocity, getRandomVelocity())
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.BOX })
    .addComponent(Position, getRandomPosition())
    .addComponent(Dimensions, getRandomDimensions())
    .addComponent(Renderable);
}

function createPlayerEntity(world: World): void {
  world
    .createEntity("Player")
    .addComponent(Velocity)
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.TRIANGLE })
    .addComponent(Position, { x: 100, y: 100 })
    .addComponent(Dimensions, { width: 50, height: 50 })
    .addComponent(Renderable)
    .addComponent(PlayerControlled)
    .addComponent(Commands);
}

function getRandomVelocity() {
  return {
    x: SPEED_MULTIPLIER * (2 * Math.random() - 1),
    y: SPEED_MULTIPLIER * (2 * Math.random() - 1),
  };
}

function getRandomPosition() {
  return {
    x: Math.random() * renderer.view.width,
    y: Math.random() * renderer.view.height,
  };
}

function getRandomDimensions() {
  return {
    width: Math.random() * 20 + 10,
    height: Math.random() * 20 + 10,
  };
}

const world = new World();
const keyboardSignals = new KeyboardSignals(window.document);

world.registerSystem(PlayerControllsSystem, {
  keyboardSignals,
  commandMap: new Map(Object.entries(PlayerTankCommands)),
});
world.registerSystem(CommandBasedSteeringSystem);
world.registerSystem(MovableSystem);
world.registerSystem(PixiRenderSystem, { renderer });

for (let i = 0; i < 200; i++) {
  createBoxEntity(world);
}

createPlayerEntity(world);

// Run!
function run() {
  // Compute delta and elapsed time
  const time = performance.now();
  const delta = time - lastTime;

  // Run all the systems
  world.execute(delta, time);

  lastTime = time;
  requestAnimationFrame(run);
}

let lastTime = performance.now();
run();
keyboardSignals.start();
