import { SystemStateComponent } from "ecsy";
import { Body } from "planck-js";

export default class PhysicsBody extends SystemStateComponent {
  public body: Body | undefined;
  public isDynamic = false;

  constructor(body: Body, isDynamic = false) {
    super();
    this.body = body;
    this.isDynamic = isDynamic;
  }

  copy(source: PhysicsBody): void {
    this.body = source.body;
    this.isDynamic = source.isDynamic;
  }

  reset(): void {
    this.body = undefined;
    this.isDynamic = false;
  }
}
