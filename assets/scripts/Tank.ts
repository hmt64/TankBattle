import { _decorator, Camera, CCFloat, CCInteger, Collider2D, Color, Component, ERaycast2DType, math, Node, PhysicsSystem2D, ProgressBar, Rect, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
import { ColliderGroup } from './Constants/Constants';
import { Barrel } from './Barrel';
import { DrawLine } from './DrawLine';
const { ccclass, property } = _decorator;
// import { Barrel } from './Barrel';

@ccclass('Tank')
export class Tank extends Component {

    @property(CCInteger)
    speed: number = 20

    @property(Node)
    hull: Node = null

    @property(Node)
    barrel: Node = null

    @property(CCFloat)
    detectionRadius: number = 300

    @property(Camera)
    camera: Camera = null

    @property(DrawLine)
    drawLine: DrawLine = null

    movement: Vec2 = Vec2.ZERO.clone()
    rigidBody: RigidBody2D = null
    barrelScript: Barrel = null

    isRaycastInView: boolean = false
    isInDetectionRange: boolean = false

    _def: number = 3
    _hp: number = 10
    _maxHp: number = 10
    _firingRate: number = 0.8

    progressBar: ProgressBar = null

    start() {
        this.rigidBody = this.getComponent(RigidBody2D)
        this.barrelScript = this.barrel.getComponent(Barrel)
        this.progressBar = this.node.children[2].getComponent(ProgressBar)
    }

    update(deltaTime: number) {
        this.autoAimInRange()
        this.rotateAllPartTankForward(this.isInDetectionRange)
    }

    protected lateUpdate(dt: number): void {
        this.rigidBody.linearVelocity = this.movement
    }

    private rotateAllPartTankForward(isAutoAiming: boolean = false) {
        if (this.movement.equals(Vec2.ZERO)) {
            return
        }
        const normalizedMovement = this.movement.clone().normalize()
        const angle = Math.atan2(normalizedMovement.y, normalizedMovement.x) * 180 / Math.PI - 90
        this.hull.angle = angle
        if (!isAutoAiming) {
        console.log('rotateAllPartTankForward not auto aim')

            this.barrel.angle = angle
        }
    }

    onMove(axisRaw: Vec2) {
        this.movement = axisRaw.multiplyScalar(this.speed)
    }

    public aim(targetPosition: Vec3, isAuto: boolean = false) {
        let direction = new Vec3()

        if (isAuto) {
            direction = Vec3.subtract(new Vec3(), targetPosition, this.node.worldPosition)
        } else {
            const worldPosition = new Vec3()
            this.camera.screenToWorld(targetPosition, worldPosition)
            // direction = Vec3.subtract(new Vec3(), targetPosition, this.node.worldPosition)

            const localMousePosition = new Vec3()
            this.node.parent!.inverseTransformPoint(localMousePosition, worldPosition)
            localMousePosition.z = 0
            direction = localMousePosition.clone().subtract(this.node.position.clone())
            
        }
        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI - 90
        this.barrel.angle = angle
        this.barrelScript.fire(direction, this._firingRate)
    }

    private autoAimInRange() {
        const rect = new Rect(
            this.node.worldPosition.x - this.detectionRadius,
            this.node.worldPosition.y - this.detectionRadius,
            this.detectionRadius * 2,
            this.detectionRadius * 2
        )

        const detectectCenterPoint = rect.center
        const potentialColliders = PhysicsSystem2D.instance.testAABB(rect)

        const collidersInCircle: Collider2D[] = []
        for (const collider of potentialColliders) {
            const colliderPosition = collider.node.worldPosition
            const distance = Vec2.distance(detectectCenterPoint, new Vec2(colliderPosition.x, colliderPosition.y))
            if (distance < this.detectionRadius && collider.group === ColliderGroup.Enemy) {
                collidersInCircle.push(collider)
            }
        }

        if (collidersInCircle.length > 0) {
            const sortedColliders = collidersInCircle.sort((a, b) => {
                const aDistance = Vec2.distance(detectectCenterPoint, new Vec2(a.node.worldPosition.x, a.node.worldPosition.y))
                const bDistance = Vec2.distance(detectectCenterPoint, new Vec2(b.node.worldPosition.x, b.node.worldPosition.y))
                return aDistance - bDistance
            })

            for (const point of sortedColliders) {
                if (point.group === ColliderGroup.Bullet) {
                    continue
                }
                const closestPoint = this.detectClosestPoint(detectectCenterPoint, new Vec2(point.node.worldPosition.x, point.node.worldPosition.y))
                if (this.isRaycastInView && closestPoint != null) {
                    this.isInDetectionRange = true
                    this.aim(new Vec3(closestPoint.x, closestPoint.y, 0), this.isInDetectionRange)
                    break
                } else {
                    this.isInDetectionRange = false
                }
            }
        } else {
            this.isInDetectionRange = false
        }
    }

    private detectClosestPoint(p1: Vec2, p2: Vec2) {
        let results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.Closest)

        if (results.length > 0) {
            const pointGroup = results[0].collider.group
            if (pointGroup === ColliderGroup.Enemy) {
                this.isRaycastInView = true
                return results[0].point
            } else {
                return null
            }
        } else {
            this.isRaycastInView = false
            return null
        }
    }

    beHit(damage: number) {
        damage -= this._def
        if (damage <= 0) {
            damage = 0
        }

        this._hp -= damage
        if (this._hp <= 0) {
            this._hp = 0
        }

        this.refreshHpBar()

        if (this._hp === 0) {
            this.doDeath()
        }
    }

    private refreshHpBar() {
        this.progressBar.progress = this._hp / this._maxHp
    }

    private doDeath() {
        this.node.destroy()
    }
}

