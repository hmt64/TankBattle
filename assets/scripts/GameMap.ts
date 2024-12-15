import { _decorator, Camera, Component, math, Node, UITransform } from 'cc';
import { Config } from './Config';
const { ccclass, property } = _decorator;

@ccclass('GameMap')
export class GameMap extends Component {

    @property(Camera)
    camera: Camera = null

    @property(Node)
    target: Node = null

    @property(Node)
    topUI: Node = null

    mapSize: { width: number, height: number } = { width: 0, height: 0 }

    gameFrameSize: { width: number, height: number } = { width: 0, height: 0 }

    start() {
        this.mapSize = this.node.getComponent(UITransform).getBoundingBox()
        this.gameFrameSize = Config.instance.gameFrameSize
    }

    protected lateUpdate(dt: number): void {
        const halfFrameWidth = this.gameFrameSize.width / 2
        const halfFrameHeight = this.gameFrameSize.height / 2

        const minX = -this.mapSize.width / 2 + halfFrameWidth
        const maxX = this.mapSize.width / 2 - halfFrameWidth

        const minY = -this.mapSize.height / 2 + halfFrameHeight
        const maxY = this.mapSize.height / 2 - halfFrameHeight

        const clampedX = math.clamp(this.target.position.x, minX, maxX)
        const clampedY = math.clamp(this.target.position.y, minY, maxY)

        this.camera.node.setPosition(clampedX, clampedY, this.camera.node.position.z)
        this.topUI.setPosition(clampedX, clampedY, this.topUI.position.z)
    }
}

