import { World } from "ecsy";
import * as PIXI from "pixi.js";
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
import Center from "./core/components/Center";
// import Rotation from "./core/components/Rotation";
import MatterPhysicsSystem from "./core/systems/MatterPhysicsSystem";
import Matter from "matter-js";
import CarSteering from "./core/components/CarSteering";
import CommandCarSteeringSystem from "./core/systems/CommandCarSteeringSystem";
import ApplyCarSteeringSystem from "./core/systems/ApplyCarSteeringSystem";
import CarAcceleration from "./core/components/CarAcceleration";
import MatterComposite from "./core/components/MatterComposite";
import MatterBody from "./core/components/MatterBody";

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

// function createBoxEntity(world: World): void {
//   world
//     .createEntity()
//     .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.BOX })
//     .addComponent(Position, getRandomPosition())
//     .addComponent(Rotation)
//     .addComponent(Center)
//     .addComponent(MatterPhysics, { options: { restitution: 0.5 } })
//     .addComponent(Dimensions, getRandomDimensions())
//     .addComponent(Renderable);
// }

function createPlayerEntity(world: World): void {
  world
    .createEntity("Player")
    .addComponent(Velocity)
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.TRIANGLE })
    .addComponent(Position, { x: 100, y: 100 })
    .addComponent(Center)
    .addComponent(Dimensions, { width: 50, height: 50 })
    .addComponent(CarSteering)
    .addComponent(CarAcceleration)
    .addComponent(MatterComposite, {
      options: { restitution: 0 },
      composite: Matter.Composite.create({
        bodies: [
          Matter.Bodies.rectangle(-20, 0, 10, 20, { label: "left-wheel" }),
          Matter.Bodies.rectangle(0, 0, 10, 10),
          Matter.Bodies.rectangle(20, 0, 10, 20, { label: "right-wheel" }),
        ],
      }),
    })
    .addComponent(Renderable)
    .addComponent(PlayerControlled)
    .addComponent(Commands);
}

// function getRandomPosition() {
//   return {
//     x: Math.random() * renderer.view.width,
//     y: 0,
//   };
// }

// function getRandomDimensions() {
//   return {
//     width: Math.random() * 100 + 10,
//     height: Math.random() * 100 + 10,
//   };
// }

const world = new World();
const keyboardSignals = new KeyboardSignals(window.document);

world.registerSystem(PlayerControllsSystem, {
  keyboardSignals,
  commandMap: new Map(Object.entries(PlayerTankCommands)),
});
world.registerSystem(CommandBasedSteeringSystem);
// world.registerSystem(MovableSystem);
world.registerSystem(CommandCarSteeringSystem);
world.registerSystem(ApplyCarSteeringSystem);
world.registerSystem(MatterPhysicsSystem);
world.registerSystem(PixiRenderSystem, { renderer });

// for (let i = 0; i < 5; i++) {
//   createBoxEntity(world);
// }

createPlayerEntity(world);

world
  .createEntity()
  .addComponent(Position, { x: window.innerWidth * 0.5, y: window.innerHeight - 100 })
  .addComponent(MatterBody, {
    options: { isStatic: true },
    body: Matter.Bodies.rectangle(0, 0, window.innerWidth - 20, 20),
  })
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

const sys = world.getSystem(MatterPhysicsSystem) as MatterPhysicsSystem;

const debugRenderer = Matter.Render.create({
  engine: sys.engine,
  canvas: debugCanvas,
  options: {
    height: debugCanvas.height,
    width: debugCanvas.width,
    wireframes: true,
    showDebug: true,
    showVelocity: true,
    showPositions: true,
    showAxes: true,
  },
});

Matter.Render.run(debugRenderer);
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
