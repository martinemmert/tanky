import { World } from "ecsy";
import MovableSystem from "./core/systems/MovableSystem";
import RenderSystem from "./core/systems/RenderSystem";
import Velocity from "./core/components/Velocity";
import Shape, { SHAPE_PRIMITIVE_TYPES } from "./core/components/Shape";
import Position from "./core/components/Position";
import Renderable from "./core/components/Renderable";
import Canvas from "./core/components/Canvas";
import Dimensions from "./core/components/Dimensions";

console.log("Hello World!");

const SPEED_MULTIPLIER = 0.1;

// Initialize canvas
const canvas = document.createElement("canvas");
canvas.setAttribute("style", "display: block");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.append(canvas);

function createBoxEntity(world: World): void {
  world
    .createEntity()
    .addComponent(Velocity, getRandomVelocity())
    .addComponent(Shape, { primitive: SHAPE_PRIMITIVE_TYPES.BOX })
    .addComponent(Position, getRandomPosition())
    .addComponent(Dimensions, getRandomDimensions())
    .addComponent(Renderable);
}

function getRandomVelocity() {
  return {
    x: SPEED_MULTIPLIER * (2 * Math.random() - 1),
    y: SPEED_MULTIPLIER * (2 * Math.random() - 1),
  };
}

function getRandomPosition() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
  };
}

function getRandomDimensions() {
  return {
    width: Math.random() * 20 + 10,
    height: Math.random() * 20 + 10,
  };
}

const world = new World();
world.registerSystem(MovableSystem);
world.registerSystem(RenderSystem);

const canvasEntity = world
  .createEntity("Canvas")
  .addComponent(Canvas, { ctx: canvas.getContext("2d") })
  .addComponent(Dimensions, { width: canvas.width, height: canvas.height });

for (let i = 0; i < 200; i++) {
  createBoxEntity(world);
}

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

window.addEventListener("resize", function () {
  const dimensions = canvasEntity.getMutableComponent(Dimensions);
  dimensions.width = canvas.width = window.innerWidth;
  dimensions.height = canvas.height = window.innerHeight;
});
