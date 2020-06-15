import { Component } from "ecsy";
import { Composite, ICompositeDefinition } from "matter-js";

export default class MatterComposite extends Component {
  public composite?: Composite;
  public options?: ICompositeDefinition = {};

  reset(): void {
    this.composite = undefined;
    this.options = undefined;
  }
}
