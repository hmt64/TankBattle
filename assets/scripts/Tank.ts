import { _decorator, CCInteger, Component, Node, RigidBody2D, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tank')
export class Tank extends Component {

    @property(CCInteger)
    speed: number = 20

    @property(Node)
    hull: Node = null

    @property(Node)
    barrel: Node = null

    movement: Vec2 = Vec2.ZERO.clone()
    rigidBody: RigidBody2D = null

    start() {
        this.rigidBody = this.getComponent(RigidBody2D)
    }

    update(deltaTime: number) {
        this.rotateAllPartTankForward()
    }

    protected lateUpdate(dt: number): void {
        this.rigidBody.linearVelocity = this.movement
    }

    private rotateAllPartTankForward() {
        const normalizedMovement = this.movement.clone().normalize()
        const angle = Math.atan2(normalizedMovement.y, normalizedMovement.x) * 180 / Math.PI - 90
        this.hull.angle = angle
        this.barrel.angle = angle
    }

    onMove(axisRaw: Vec2) {
        this.movement = axisRaw.multiplyScalar(this.speed)
    }

    public aim(targetPosition: Vec3) {

    }
}

