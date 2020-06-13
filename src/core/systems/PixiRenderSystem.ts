/* eslint-disable unicorn/prefer-node-remove */
import { System, World } from "ecsy";
import Renderable from "../components/Renderable";
import Shape from "../components/Shape";
import Position from "../components/Position";
import Dimensions from "../components/Dimensions";
import { Graphics, Container, Renderer } from "pixi.js";

class PixiSystem extends System {
  public static queries = {
    renderables: {
      components: [Renderable, Shape, Position, Dimensions],
      listen: {
        added: true,
        removed: true,
      },
    },
  };

  private stage: Container;
  private renderer: Renderer;

  constructor(world: World, attributes: { renderer: Renderer }) {
    super(world, attributes);
    this.stage = new Container();
    this.renderer = attributes.renderer;
  }

  execute(): void {
    const renderablesQuery = this.queries.renderables;

    renderablesQuery.added?.forEach(renderable => {
      const dimensions = renderable.getComponent(Dimensions);
      const childName = `entity-${renderable.id}`;
      const gfx = new Graphics();
      gfx.name = childName;
      gfx.beginFill(0xf28d89, 1);
      gfx.drawRect(0, 0, dimensions.width, dimensions.height);
      gfx.endFill();
      gfx.pivot.x = dimensions.width * 0.5;
      gfx.pivot.y = dimensions.height * 0.5;
      gfx.cacheAsBitmap = true;
      this.stage.addChild(gfx);
      console.log("Added %s to stage.", childName);
    });

    renderablesQuery.results.forEach(renderable => {
      const position = renderable.getComponent(Position);
      const child = this.stage.getChildByName(`entity-${renderable.id}`);
      child.x = position.x;
      child.y = position.y;
    });

    renderablesQuery.removed?.forEach(renderable => {
      const childName = `entity-${renderable.id}`;
      const child = this.stage.getChildByName(childName);
      child.destroy();
      console.log("Destroyed %s", childName);
    });

    this.renderer.render(this.stage);
  }
}

export default PixiSystem;
