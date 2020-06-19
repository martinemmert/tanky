import * as PIXI from "pixi.js";
import * as planck from "planck-js";

const WORLD_SCALE = 20;

const colors = {
  static: 0x00ff00,
  dynamic: 0xffffff,
  kinematic: 0xff00ff,
  vector: 0x0000ff,
  point: 0xff0000,
};

enum DIRECTIONS {
  TDC_UP = 0x1,
  TDC_RIGHT = 0x2,
  TDC_DOWN = 0x4,
  TDC_LEFT = 0x8,
}

let renderer: PIXI.Renderer;
let stage: PIXI.Container;
let canvas: PIXI.Graphics;

let world: planck.World;
let lastTime = 0;

// Let tire: TopDownTire;
let car: TopDownCar;
let controlState = 0;

// function drawVector(position: planck.Vec2, vector: planck.Vec2): void {
//   canvas.lineStyle(1, colors.vector, 1, 0);
//   canvas.moveTo(position.x * WORLD_SCALE, position.y * WORLD_SCALE);
//   canvas.lineTo(vector.x * WORLD_SCALE, vector.y * WORLD_SCALE);
// }

class TopDownTire {
  static readonly maxForwardSpeed = 75;
  static readonly maxBackwardSpeed = -40;
  static readonly maxDriveForce = 30;
  static readonly maxTurnTorque = 8;
  static readonly maxLateralImpulse = 1.3;

  public body: planck.Body;

  constructor(world: planck.World, width: number, height: number) {
    this.body = world.createBody({ type: "dynamic", allowSleep: false });
    this.body.createFixture({
      shape: new planck.Box(width, height),
      density: 1,
      restitution: 0.5,
      friction: 0.5,
      userData: {
        label: "tire",
      },
    });
  }

  getForwardVelocity(): planck.Vec2 {
    const currentForwardNormal = this.body.getWorldVector(new planck.Vec2(0, 1));
    const dot = planck.Vec2.dot(currentForwardNormal, this.body.getLinearVelocity());
    return currentForwardNormal.mul(dot);
  }

  getLateralVelocity(): planck.Vec2 {
    const currentRightNormal = this.body.getWorldVector(new planck.Vec2(1, 0));
    const dot = planck.Vec2.dot(currentRightNormal, this.body.getLinearVelocity());
    return currentRightNormal.mul(dot);
  }

  updateDrive(controlState: number): void {
    let desiredSpeed = 0;

    switch (controlState & (DIRECTIONS.TDC_UP | DIRECTIONS.TDC_DOWN)) {
      case DIRECTIONS.TDC_UP:
        desiredSpeed = TopDownTire.maxForwardSpeed;
        break;
      case DIRECTIONS.TDC_DOWN:
        desiredSpeed = TopDownTire.maxBackwardSpeed;
        break;
      default:
        return;
    }

    const currentForwardNormal = this.body.getWorldVector(new planck.Vec2(0, 1));
    const currentSpeed = planck.Vec2.dot(this.getForwardVelocity(), currentForwardNormal);
    let force = 0;
    if (desiredSpeed > currentSpeed) {
      force = TopDownTire.maxDriveForce;
    } else if (desiredSpeed < currentSpeed) {
      force = -TopDownTire.maxDriveForce;
    } else {
      return;
    }

    this.body.applyForce(currentForwardNormal.mul(force), this.body.getWorldCenter());
  }

  updateTurn(controlState: number): void {
    let desiredTorque = 0;
    switch (controlState & (DIRECTIONS.TDC_LEFT | DIRECTIONS.TDC_RIGHT)) {
      case DIRECTIONS.TDC_LEFT:
        desiredTorque = TopDownTire.maxTurnTorque * -1;
        break;
      case DIRECTIONS.TDC_RIGHT:
        desiredTorque = TopDownTire.maxTurnTorque;
        break;
      default:
        return;
    }
    this.body.applyTorque(desiredTorque);
  }

  updateFriction() {
    // Migitade lateral force
    const impulse = this.getLateralVelocity().mul(-this.body.getMass());
    const impulseLength = impulse.length();
    if (impulseLength > TopDownTire.maxLateralImpulse) {
      impulse.mul(TopDownTire.maxLateralImpulse);
      impulse.x = impulse.x / impulseLength;
      impulse.y = impulse.y / impulseLength;
    }
    this.body.applyLinearImpulse(impulse, this.body.getWorldCenter());

    // Slowing down
    const currentForwardNormal = this.getForwardVelocity();
    const currentForwardSpeed = currentForwardNormal.normalize();
    const dragForceMagnitude = -1 * currentForwardSpeed;
    this.body.applyForce(currentForwardNormal.mul(dragForceMagnitude), this.body.getWorldCenter());

    // Stop spinning
    this.body.applyAngularImpulse(0.1 * this.body.getInertia() * -this.body.getAngularVelocity());
  }

  destroy() {
    this.body.getWorld().destroyBody(this.body);
  }
}

class TopDownCar {
  static readonly scaleF: number = 0.25;

  public body: planck.Body;

  private tires: TopDownTire[] = [];
  private frontRightJoint: planck.RevoluteJoint | null;
  private frontLeftJoint: planck.RevoluteJoint | null;
  private backRightJoint: planck.RevoluteJoint | null;
  private backLeftJoint: planck.RevoluteJoint | null;

  constructor(world: planck.World, position: planck.Vec2) {
    this.body = world.createBody({ type: "dynamic" });
    const vertices: planck.Vec2[] = [];
    vertices.push(
      new planck.Vec2(1.5, 0).mul(TopDownCar.scaleF),
      new planck.Vec2(3, 2.5).mul(TopDownCar.scaleF),
      new planck.Vec2(2.8, 5.5).mul(TopDownCar.scaleF),
      new planck.Vec2(1, 10).mul(TopDownCar.scaleF),
      new planck.Vec2(-1, 10).mul(TopDownCar.scaleF),
      new planck.Vec2(-2.8, 5.5).mul(TopDownCar.scaleF),
      new planck.Vec2(-3, 2.5).mul(TopDownCar.scaleF),
      new planck.Vec2(-1.5, 0).mul(TopDownCar.scaleF),
    );
    this.body.createFixture({ shape: new planck.Polygon(vertices), density: 0.1 });
    this.body.setPosition(position);

    const tireWidth = 0.45 * TopDownCar.scaleF;
    const tireHeight = 1.25 * TopDownCar.scaleF;

    const frontRightTire = new TopDownTire(world, tireWidth, tireHeight);
    const frontLeftTire = new TopDownTire(world, tireWidth, tireHeight);
    const backRightTire = new TopDownTire(world, tireWidth, tireHeight);
    const backLeftTire = new TopDownTire(world, tireWidth, tireHeight);
    frontRightTire.body.setPosition(position);
    frontLeftTire.body.setPosition(position);
    backRightTire.body.setPosition(position);
    backLeftTire.body.setPosition(position);

    const frontRightTireJoint = new planck.RevoluteJoint(
      { lowerAngle: 0, upperAngle: 0, enableLimit: true },
      this.body,
      frontRightTire.body,
      new planck.Vec2(),
    );

    const frontLeftTireJoint = new planck.RevoluteJoint(
      { lowerAngle: 0, upperAngle: 0, enableLimit: true },
      this.body,
      frontLeftTire.body,
      new planck.Vec2(),
    );

    const backRightTireJoint = new planck.RevoluteJoint(
      { lowerAngle: 0, upperAngle: 0, enableLimit: true },
      this.body,
      backRightTire.body,
      new planck.Vec2(),
    );

    const backLeftTireJoint = new planck.RevoluteJoint(
      { lowerAngle: 0, upperAngle: 0, enableLimit: true },
      this.body,
      backLeftTire.body,
      new planck.Vec2(),
    );

    frontRightTireJoint.getLocalAnchorA().set(-3, 8.5).mul(TopDownCar.scaleF);
    frontRightTireJoint.getLocalAnchorB().setZero();
    frontLeftTireJoint.getLocalAnchorA().set(3, 8.5).mul(TopDownCar.scaleF);
    frontLeftTireJoint.getLocalAnchorB().setZero();
    backRightTireJoint.getLocalAnchorA().set(-4, 1).mul(TopDownCar.scaleF);
    backRightTireJoint.getLocalAnchorB().setZero();
    backLeftTireJoint.getLocalAnchorA().set(4, 1).mul(TopDownCar.scaleF);
    backLeftTireJoint.getLocalAnchorB().setZero();

    this.frontRightJoint = world.createJoint(frontRightTireJoint);
    this.frontLeftJoint = world.createJoint(frontLeftTireJoint);
    this.backRightJoint = world.createJoint(backRightTireJoint);
    this.backLeftJoint = world.createJoint(backLeftTireJoint);

    this.tires.push(frontRightTire, frontLeftTire, backRightTire, backLeftTire);
  }

  update(controlState: number): void {
    this.tires.forEach(tire => {
      tire.updateFriction();
      tire.updateDrive(controlState);
    });

    const lockAngle = (40 * Math.PI) / 180;
    const turnPerTimeStep = (320 * Math.PI) / 180;
    let desiredAngle = 0;
    switch (controlState & (DIRECTIONS.TDC_LEFT | DIRECTIONS.TDC_RIGHT)) {
      case DIRECTIONS.TDC_LEFT:
        desiredAngle = -lockAngle;
        break;
      case DIRECTIONS.TDC_RIGHT:
        desiredAngle = lockAngle;
        break;
      default:
    }
    const angleNow = this.frontLeftJoint?.getJointAngle() ?? 0;
    const angleToTurn = planck.Math.clamp(
      desiredAngle - angleNow,
      -turnPerTimeStep,
      turnPerTimeStep,
    );
    const newAngle = angleNow + angleToTurn;
    this.frontLeftJoint?.setLimits(newAngle, newAngle);
    this.frontRightJoint?.setLimits(newAngle, newAngle);
    // this.backRightJoint?.setLimits(-newAngle, -newAngle);
    // this.backLeftJoint?.setLimits(-newAngle, -newAngle);
  }
}

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
  world = new planck.World({ gravity: new planck.Vec2(0, 0), warmStarting: false });
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
  // tire.updateDrive(controlState);
  // tire.updateTurn(controlState);
  // tire.updateFriction();
  car.update(controlState);
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

  // tire = new TopDownTire(world, 0.35, 0.625);
  // tire.body.setPosition(new planck.Vec2(40 / WORLD_SCALE, 30 / WORLD_SCALE));

  car = new TopDownCar(world, new planck.Vec2(400 / WORLD_SCALE, 300 / WORLD_SCALE));

  document.addEventListener("keydown", event => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
        controlState = controlState | DIRECTIONS.TDC_UP;
        break;
      case "ArrowRight":
      case "d":
        controlState = controlState | DIRECTIONS.TDC_RIGHT;
        break;
      case "ArrowDown":
      case "s":
        controlState = controlState | DIRECTIONS.TDC_DOWN;
        break;
      case "ArrowLeft":
      case "a":
        controlState = controlState | DIRECTIONS.TDC_LEFT;
        break;
    }
  });

  document.addEventListener("keyup", event => {
    switch (event.key) {
      case "ArrowUp":
      case "w":
        controlState = controlState & ~DIRECTIONS.TDC_UP;
        break;
      case "ArrowRight":
      case "d":
        controlState = controlState & ~DIRECTIONS.TDC_RIGHT;
        break;
      case "ArrowDown":
      case "s":
        controlState = controlState & ~DIRECTIONS.TDC_DOWN;
        break;
      case "ArrowLeft":
      case "a":
        controlState = controlState & ~DIRECTIONS.TDC_LEFT;
        break;
    }
  });

  document.body.append(renderer.view);
  lastTime = performance.now();
  run();
}

export default main;
