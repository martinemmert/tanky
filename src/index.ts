import { World } from "ecsy";
import * as PIXI from "pixi.js";
import { World as B2World, Vec2 } from "planck-js";
import Dimensions from "./core/components/Dimensions";
import Position from "./core/components/Position";
import Renderable from "./core/components/Renderable";
import Shape, { SHAPE_PRIMITIVE_TYPES } from "./core/components/Shape";
import Velocity from "./core/components/Velocity";
// import MovableSystem from "./core/systems/MovableSystem";
import PixiRenderSystem from "./core/systems/PixiRenderSystem";
import PlayerControllsSystem from "./core/systems/PlayerControllsSystem";
import PlayerControlled from "./core/components/PlayerControlled";
import Commands from "./core/components/Commands";
import KeyboardSignals from "./core/signals/KeyboardSignals";
import PlayerTankCommands from "./core/controll-maps/player-tank.json";
import CommandBasedSteeringSystem from "./core/systems/CommandBasedSteeringSystem";
import PhysicsWorldSystem from "./core/systems/PhysicsWorldSystem";
import PhysicsBodySystem from "./core/systems/PhysicsBodySystem";
import PhysicsShapeSystem from "./core/systems/PhysicsShapeSystem";
import PhysicsShape from "./core/components/PhysicsShape";
import PhysicsBody from "./core/components/PhysicsBody";
import PhysicsFixture from "./core/components/PhysicsFixture";
import PhysicsWorld from "./core/components/PhysicsWorld";
import Rotation from "./core/components/Rotation";
import Center from "./core/components/Center";
import Renderer from "planck-renderer";

// const SPEED_MULTIPLIER = 0.1;

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
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.BOX })
    .addComponent(Position, getRandomPosition())
    .addComponent(Rotation)
    .addComponent(Center)
    .addComponent(Dimensions, getRandomDimensions())
    .addComponent(PhysicsBody, { isDynamic: true })
    .addComponent(PhysicsShape)
    .addComponent(PhysicsFixture)
    .addComponent(Renderable);
}

function createPlayerEntity(world: World): void {
  world
    .createEntity("Player")
    .addComponent(Velocity)
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.TRIANGLE })
    .addComponent(Position, { x: 100, y: 100 })
    .addComponent(Rotation)
    .addComponent(Center)
    .addComponent(Dimensions, { width: 50, height: 50 })
    .addComponent(PhysicsBody, { isDynamic: true })
    .addComponent(PhysicsShape)
    .addComponent(PhysicsFixture)
    .addComponent(Renderable)
    .addComponent(PlayerControlled)
    .addComponent(Commands);
}

// function getRandomVelocity() {
//   return {
//     x: SPEED_MULTIPLIER * (2 * Math.random() - 1),
//     y: SPEED_MULTIPLIER * (2 * Math.random() - 1),
//   };
// }

function getRandomPosition() {
  return {
    x: Math.random() * renderer.view.width,
    y: 0,
  };
}

function getRandomDimensions() {
  return {
    width: Math.random() * 100 + 10,
    height: Math.random() * 100 + 10,
  };
}

const world = new World();
const keyboardSignals = new KeyboardSignals(window.document);

world.registerSystem(PlayerControllsSystem, {
  keyboardSignals,
  commandMap: new Map(Object.entries(PlayerTankCommands)),
});
world.registerSystem(CommandBasedSteeringSystem);
// world.registerSystem(MovableSystem);
world.registerSystem(PhysicsShapeSystem);
world.registerSystem(PhysicsBodySystem);
world.registerSystem(PhysicsWorldSystem);
world.registerSystem(PixiRenderSystem, { renderer });

const b2World = new B2World({
  gravity: new Vec2(0, 10),
});

world.createEntity("PhysicsWorld").addComponent(PhysicsWorld, {
  value: b2World,
});

for (let i = 0; i < 20; i++) {
  createBoxEntity(world);
}

createPlayerEntity(world);

world
  .createEntity()
  .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.BOX })
  .addComponent(Position, { x: window.innerWidth * 0.5, y: window.innerHeight - 100 })
  .addComponent(Rotation)
  .addComponent(Center)
  .addComponent(Dimensions, { width: window.innerWidth - 100, height: 20 })
  .addComponent(PhysicsBody, { dynamic: false })
  .addComponent(PhysicsShape)
  .addComponent(PhysicsFixture)
  .addComponent(Renderable);

const debugCanvas = document.createElement("canvas");
debugCanvas.width = window.innerWidth;
debugCanvas.height = window.innerHeight;
debugCanvas.style.position = "absolute";
debugCanvas.style.display = "block";

window.addEventListener("resize", () => {
  // TODO: resize stage to correct resolution
  debugCanvas.width = window.innerWidth;
  debugCanvas.height = window.innerHeight;
});

document.body.append(debugCanvas);

const debugRenderer = new Renderer(b2World, debugCanvas.getContext("2d"), {
  scale: 1,
  strokeStyle: {
    dynamic: "red",
    static: "green",
    kinematic: "blue",
  },
});

// Run!
function run() {
  // Compute delta and elapsed time
  const time = performance.now();
  const delta = time - lastTime;

  // Run all the systems
  world.execute(delta, time);
  debugRenderer.renderWorld();
  lastTime = time;
  requestAnimationFrame(run);
}

let lastTime = performance.now();
run();
keyboardSignals.start();
