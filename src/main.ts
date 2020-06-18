import * as PIXI from "pixi.js";
import * as planck from "planck-js";

const WORLD_SCALE = 32;

const colors = {
  static: 0x00ff00,
  dynamic: 0xffffff,
  kinematic: 0xff00ff,
  vector: 0x0000ff,
  point: 0xff0000,
};

let renderer: PIXI.Renderer;
let stage: PIXI.Container;
let canvas: PIXI.Graphics;

let world: planck.World;
let lastTime = 0;

// function drawVector(position: planck.Vec2, vector: planck.Vec2): void {
//   canvas.lineStyle(1, colors.vector, 1, 0);
//   canvas.moveTo(position.x * WORLD_SCALE, position.y * WORLD_SCALE);
//   canvas.lineTo(vector.x * WORLD_SCALE, vector.y * WORLD_SCALE);
// }

function drawPolygon(body: planck.Body, shape: planck.PolygonShape): void {
  const position = body.getPosition();
  const vertices = shape.m_vertices;
  const bodyType = body.getType();
  const angle = body.getAngle();

  // Bail out if no vertices do exist
  if (vertices.length === 0) return;
  // Set line style & fill style
  canvas.lineStyle(1, colors[bodyType], 1, 0);
  canvas.beginFill(colors[bodyType], 0.3);

  vertices.forEach((vertice, index) => {
    // Translate the x,y coordinates into pixel space
    const { x: cx, y: cy } = position;
    const { x: vx, y: vy } = vertice;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let nx = cos * vx - sin * vy;
    let ny = cos * vy + sin * vx;
    nx = (nx + cx) * WORLD_SCALE;
    ny = (ny + cy) * WORLD_SCALE;

    // Move to the first vertice
    if (index === 0) return canvas.moveTo(nx, ny);
    // Draw a line to the next vertice
    canvas.lineTo(nx, ny);
  });
  // Close path if more than one edges exist
  if (vertices.length > 2) canvas.closePath();
  canvas.endFill();
}

function drawCircle(body: planck.Body, shape: planck.CircleShape): void {
  const position = body.getPosition();
  const radius = shape.getRadius();
  const bodyType = body.getType();
  const angle = body.getAngle();

  // Set line style & fill style
  canvas.lineStyle(1, colors[bodyType], 1, 0);
  canvas.beginFill(colors[bodyType], 0.3);

  const { x: cx, y: cy } = position;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const vx = 0;
  const vy = radius;
  let nx = cos * vx - sin * vy;
  let ny = cos * vy + sin * vx;
  nx = (nx + cx) * WORLD_SCALE;
  ny = (ny + cy) * WORLD_SCALE;

  canvas.moveTo(cx * WORLD_SCALE, cy * WORLD_SCALE);
  canvas.lineTo(nx, ny);
  canvas.drawCircle(cx * WORLD_SCALE, cy * WORLD_SCALE, radius * WORLD_SCALE);
  canvas.endFill();
}

function createWorld(): void {
  world = new planck.World({ gravity: new planck.Vec2(0, 9.81) });
  // ceiling
  const ceiling = createBox(world, 770, 10, "static");
  ceiling.setPosition(new planck.Vec2(400 / WORLD_SCALE, 10 / WORLD_SCALE));
  // right
  const right = createBox(world, 590, 10, "static");
  right.setPosition(new planck.Vec2(790 / WORLD_SCALE, 300 / WORLD_SCALE));
  right.setAngle((90 * Math.PI) / 180);
  // ground
  const ground = createBox(world, 770, 10, "static", 0);
  ground.setPosition(new planck.Vec2(400 / WORLD_SCALE, 590 / WORLD_SCALE));
  // Left
  const left = createBox(world, 590, 10, "static");
  left.setPosition(new planck.Vec2(10 / WORLD_SCALE, 300 / WORLD_SCALE));
  left.setAngle((90 * Math.PI) / 180);
}

function createBox(
  world: planck.World,
  width: number,
  height: number,
  type: "static" | "dynamic" = "dynamic",
  restitution = 0,
): planck.Body {
  const box = world.createBody({ type });
  box.createFixture({
    shape: planck.Box(width / 2 / WORLD_SCALE, height / 2 / WORLD_SCALE),
    restitution,
    density: 1,
    friction: 0.1,
  });
  return box;
}

function createCircle(
  world: planck.World,
  radius: number,
  type: "static" | "dynamic" = "dynamic",
  restitution = 0,
): planck.Body {
  const circle = world.createBody({ type });
  circle.createFixture({
    shape: planck.Circle(radius / WORLD_SCALE),
    restitution,
    friction: 1,
    density: 0.5,
  });
  return circle;
}

function drawWorld(): void {
  for (let body = world.getBodyList(); body; body = body.getNext()) {
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const shape = fixture.getShape();
      switch (shape.getType()) {
        case "circle":
          drawCircle(body, shape as planck.CircleShape);
          break;
        case "polygon":
          drawPolygon(body, shape as planck.PolygonShape);
          break;
      }
    }
  }
  renderer.render(stage);
}

function updateWorld(delta: number): void {
  world.step(delta);
  world.clearForces();
}

function run(): void {
  canvas.clear();
  const time = performance.now();
  const delta = (time - lastTime) * 0.001;
  updateWorld(delta);
  lastTime = time;
  drawWorld();
  requestAnimationFrame(run);
}

function dropCircle(x: number, y: number): void {
  const circle = createCircle(world, Math.random() * 50 + 10, "dynamic", Math.random());
  const px = x / WORLD_SCALE;
  const py = y / WORLD_SCALE;
  circle.setPosition(new planck.Vec2(px, py));
  circle.setAngle((360 * Math.random() * Math.PI) / 180);
  circle.applyForce(new planck.Vec2(0, Math.random() * 10), circle.getPosition());
}

function dropBox(x: number, y: number): void {
  const box = createBox(world, Math.random() * 50 + 10, Math.random() * 50 + 10, "dynamic", 0);
  const px = x / WORLD_SCALE;
  const py = y / WORLD_SCALE;
  box.setPosition(new planck.Vec2(px, py));
  box.setAngle((360 * Math.random() * Math.PI) / 180);
  box.applyForce(new planck.Vec2(0, Math.random() * 10), box.getPosition());
}

function main(): void {
  renderer = new PIXI.Renderer({
    width: 800,
    height: 600,
    antialias: true,
    forceFXAA: true,
  });

  stage = new PIXI.Container();
  canvas = new PIXI.Graphics();
  stage.addChild(canvas);

  createWorld();

  let dropIt = false;

  document.addEventListener("mousedown", event => {
    if (Math.round(Math.random()) === 0) {
      dropCircle(event.clientX, event.clientY);
    } else {
      dropBox(event.clientX, event.clientY);
    }
  });

  document.addEventListener("mouseup", () => {
    dropIt = false;
  });

  document.addEventListener("mousemove", event => {
    if (dropIt) {
      if (Math.round(Math.random()) === 0) {
        dropBox(event.clientX, event.clientY);
      } else {
        dropBox(event.clientX, event.clientY);
      }
    }
  });

  document.body.append(renderer.view);
  lastTime = performance.now();
  run();
}

export default main;
