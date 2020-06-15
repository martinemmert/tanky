import Matter from "matter-js";

const options: Matter.IEngineDefinition = {
  world: Matter.World.create({
    gravity: { x: 0, y: 0, scale: 0.001 },
  }),
};

const engine = Matter.Engine.create(options);

const boxA = Matter.Bodies.rectangle(400, 200, 80, 80);
const ground = Matter.Bodies.rectangle(window.innerWidth * 0.5, window.innerHeight - 100, 810, 60, {
  isStatic: true,
});

Matter.World.add(engine.world, [boxA, ground]);

let moveState: string | undefined;

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowUp":
      moveState = "up";
      break;
    case "ArrowDown":
      moveState = "down";
      break;
    case "Space":
      moveState = "stop";
      break;
  }
});

document.addEventListener("keyup", function () {
  moveState = undefined;
});

// function beforeUpdate(delta) {
//   const { velocity } = boxA;
//   let desiredVelocity = 0;
//   switch (moveState) {
//     case "up":
//       desiredVelocity = Math.max(velocity.y - 0.1, -5);
//       break;
//     case "down":
//       desiredVelocity = Math.min(velocity.y + 0.1, 5);
//       break;
//     case "stop":
//       desiredVelocity = velocity.y * 0.98;
//       break;
//   }
//   const vyChange = desiredVelocity - velocity.y;
//   // const force = boxA.mass * vyChange * (delta / 1000);
//   // Matter.Body.applyForce(boxA, boxA.position, { x: 0, y: force });
//   // console.log(force);
// }

// document.addEventListener("keydown", function (event) {
//   switch (event.key) {
//     case "ArrowUp":
//       Matter.Body.setVelocity(boxA, { x: boxA.velocity.x, y: -10 });
//       break;
//     case "ArrowDown":
//       Matter.Body.setVelocity(boxA, { x: boxA.velocity.x, y: 10 });
//       break;
//     case "ArrowRight":
//       Matter.Body.setVelocity(boxA, { x: 10, y: boxA.velocity.y });
//       break;
//     case "ArrowLeft":
//       Matter.Body.setVelocity(boxA, { x: -10, y: boxA.velocity.y });
//       break;
//   }
// });

const debugRenderer = Matter.Render.create({
  engine,
  element: document.body,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: true,
    showDebug: true,
    showVelocity: true,
    showPositions: true,
    showAxes: true,
  },
});

debugRenderer.canvas.style.display = "block";
// Run!
function run() {
  const time = performance.now();
  const delta = time - lastTime;
  beforeUpdate(delta);
  Matter.Engine.update(engine);
  Matter.Render.world(debugRenderer);
  lastTime = time;
  requestAnimationFrame(run);
}
let lastTime = performance.now();
run();
