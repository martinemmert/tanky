import { SystemStateComponent } from "ecsy";
import { World as B2World } from "planck-js";

export default class PhysicsWorld extends SystemStateComponent {
  public value: B2World | undefined;

  constructor(world: B2World) {
    super();
    this.value = world;
  }

  copy(source: PhysicsWorld): void {
    this.value = source.value;
  }

  reset(): void {
    this.value = undefined;
  }
}
