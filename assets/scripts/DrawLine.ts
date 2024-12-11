import { _decorator, Color, Component, Graphics, Node, Rect, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DrawLine')
export class DrawLine extends Component {

    @property(Graphics)
    ctx: Graphics = null

    defaultColor: Color = Color.RED

    start() {
        this.ctx.node.worldPosition = Vec3.ZERO
    }

    public clear() {
        this.ctx.clear()
    }

    public drawShape(centerPoint: Vec2, radius: number, rect: Rect | null, color: Color = this.defaultColor) {
        this.ctx.strokeColor = this.hexToColor(color)

        if (!rect) {
            this.ctx.circle(centerPoint.x, centerPoint.y, radius)
        } else {
            this.ctx.rect(rect.x, rect.y, rect.width, rect.height)
        }
        this.ctx.stroke()
    }

    public drawLine(start: Vec3, end: Vec3, color: Color = this.defaultColor) {
        this.ctx.strokeColor = this.hexToColor(color)

        this.ctx.fill()
        this.ctx.moveTo(start.x, start.y)
        this.ctx.lineTo(end.x, end.y)
        this.ctx.stroke()
    }

    private hexToColor(hex: Color) {
        return new Color(hex.r, hex.g, hex.b, hex.a)
    }
}

