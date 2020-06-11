import Renderable from "../components/Renderable";
import Shape, { SHAPE_PRIMITIVE_TYPES } from "../components/Shape";
import { System } from "ecsy";
import Canvas from "../components/Canvas";
import Dimensions from "../components/Dimensions";
import Position from "../components/Position";

class RenderSystem extends System {
  execute(): void {
    const canvasQuery = this.queries.canvas;
    const renderableQuery = this.queries.renderables;

    canvasQuery.results.forEach(canvasEntity => {
      const canvas = canvasEntity.getComponent(Canvas);
      const dimensions = canvasEntity.getComponent(Dimensions);
      canvas.ctx.globalAlpha = 1;
      canvas.ctx.fillStyle = "#ffffff";
      canvas.ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      renderableQuery.results.forEach(renderableEntity => {
        const shape = renderableEntity.getComponent(Shape);
        const position = renderableEntity.getComponent(Position);
        const dimensions = renderableEntity.getComponent(Dimensions);

        const halfWidth = dimensions.width * 0.5;
        const halfHeight = dimensions.height * 0.5;

        const [x1, y1, x2, y2] = [
          position.x - halfWidth,
          position.y - halfHeight,
          dimensions.width,
          dimensions.height,
        ];

        if (shape.primitive === SHAPE_PRIMITIVE_TYPES.BOX) {
          canvas.ctx.beginPath();
          canvas.ctx.rect(x1, y1, x2, y2);
          canvas.ctx.fillStyle = "#f28d89";
          canvas.ctx.fill();
          canvas.ctx.lineWidth = 1;
          canvas.ctx.strokeStyle = "#222";
          canvas.ctx.stroke();
        }
      });
    });
  }
}

RenderSystem.queries = {
  canvas: {
    components: [Canvas, Dimensions],
  },
  renderables: {
    components: [Renderable, Shape, Position, Dimensions],
  },
};

export default RenderSystem;
