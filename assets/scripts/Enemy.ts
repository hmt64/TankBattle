import { _decorator, CCInteger, Collider2D, Color, Component, EPhysics2DDrawFlags, ERaycast2DType, math, Node, PhysicsSystem2D, ProgressBar, Rect, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { ColliderGroup } from './Constants/Constants';
import { DrawLine } from './DrawLine';
import { Barrel } from './Barrel';
import { EventCenter } from './EventCenter';
import { BulletPoolManager } from './BulletPoolManager';
import { Tank } from './Tank';
import { ITarget } from './Interfaces/ITarget';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component implements ITarget {

    @property(CCInteger)
    speed: number = 4

    @property(CCInteger)
    detectionRadius: number = 200

    @property(Node)
    hull: Node = null

    @property(Node)
    barrel: Node = null

    @property(Node)
    player: Node = null

    @property(SpriteFrame)
    boomTankSpriteFrame: SpriteFrame = null

    @property(DrawLine)
    drawLine: DrawLine = null

    isInDetectionRange: boolean = false
    isRaycastInView: boolean = false
    isChasing: boolean = false
    isReachedTarget: boolean = false

    rigidBody: RigidBody2D = null
    movement: Vec2 = Vec2.ZERO.clone()
    waypoints: Vec3[] = []
    raycastType: ERaycast2DType = ERaycast2DType.Closest
    currentNodeWorldPosition: Vec3 = Vec3.ZERO.clone()
    progressbar: ProgressBar = null
    barrelScript: Barrel = null

    _def: number = 3
    _hp: number = 10
    _maxHp: number = 10
    _firingRate: number = 1.2
    _bulletDamage: number = 3
    _bulletSpeed: number = 12
    _coinCount: number = 3

    start() {
        this.rigidBody = this.getComponent(RigidBody2D)
        this.currentNodeWorldPosition = this.node.worldPosition
        this.barrelScript = this.barrel.getComponent(Barrel)
        this.progressbar = this.node.children[2].getComponent(ProgressBar)
    }

    update(deltaTime: number) {

        if (!this.player.isValid) {
            return
        }

        // this.drawLine.clear()

        this.detectObstaclesInPathByRaycast()
        
        this.detectTargetInView()

        if (!this.isRaycastInView || !this.isInDetectionRange) {
            this.stopMove()
        }

        if (this.isRaycastInView) {
            this.detectTargetInCircleRange()
            // có thể check thêm điều kiện nếu player ra khỏi vùng detection thì stopMove
        }

        if (this.isInDetectionRange) {
            this.rotateBarrelToTarget()
            if (!this.isReachedTarget) {
                this.moveToPlayer()
                this.rotateHullForward()
            }
        }
    }

    protected lateUpdate(dt: number): void {
        this.rigidBody.linearVelocity = this.movement
    }

    private rotateBarrelToTarget() {
        const targetPosition = this.player.worldPosition.clone()
        const direction = targetPosition.subtract(this.node.worldPosition)
        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI - 90
        this.barrel.angle = angle
        this.barrelScript.fire(direction, this._firingRate, this._bulletDamage, this._bulletSpeed)
    }

    rotateHullForward() {
        const normalizedMovement = this.movement.clone().normalize()
        const angle = Math.atan2(normalizedMovement.y, normalizedMovement.x) * 180 / Math.PI - 90
        this.hull.angle = angle
    }

    /**
     * @en Uses raycast to detect Player target, only blocked by obstacles, 
     * not other enemies
     */
    private detectTargetInView() {
        let p1 = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y)
        let p2 = new Vec2(this.player.worldPosition.x, this.player.worldPosition.y)

        let results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.All)

        // this.drawLine.drawLine(new Vec3(p1.x, p1.y, 0), new Vec3(p2.x, p2.y, 0), Color.BLACK)

        // results.forEach(result => {
        //     // draw hit point
        //     this.drawLine.drawShape(result.point, 10, null, Color.RED)
        // })
        
        if (results.length > 0) {
            const sortedResults = [...results].sort((a, b) => {
                const distanceA = a.point.subtract(p1.clone()).length()
                const distanceB = b.point.subtract(p1.clone()).length()
                return distanceA - distanceB
            })

            for (const result of sortedResults) {
                const target = result.collider.node.getComponent(Tank)
                const point = result.point

                if (target && target.isDetectable()) {
                    p2 = point
                    this.isRaycastInView = true
                    return
                }
            }
        } else {
            this.isRaycastInView = false
        }
    }

    /**
     * @en Detect collider Player in circular area and proceed to chase the target
     */
    private detectTargetInCircleRange(){
        const rect = new Rect(
            this.node.worldPosition.x - this.detectionRadius,
            this.node.worldPosition.y - this.detectionRadius,
            this.detectionRadius * 2,
            this.detectionRadius * 2
        )


        const centerPoint = rect.center
        const potentialColliders = PhysicsSystem2D.instance.testAABB(rect)

        // this.drawLine.drawShape(centerPoint, this.detectionRadius, null, Color.YELLOW)
        // this.drawLine.drawShape(centerPoint, this.detectionRadius, rect, Color.BLACK)


        const collidersInCircle: Collider2D[] = []
        for (const collider of potentialColliders) {
            const target = collider.node.getComponent(Tank)
            const colliderPosition = collider.node.worldPosition
            const distance = Vec2.distance(centerPoint, new Vec2(colliderPosition.x, colliderPosition.y))
            if (distance < this.detectionRadius && target && target.isDetectable()) {
                collidersInCircle.push(collider)
            }
        }

        if (collidersInCircle.length > 0) {
            this.isInDetectionRange = true
            this.isChasing = true
        } else {
            this.isInDetectionRange = false
            this.isChasing = false
            this.waypoints = []
        }
    }

    /**
     * @en Move to target according to points in waypoints array
     */
    private moveToPlayer() {
        // tạo đường zic-zac hình tam giác vuông
        const targetPosition = this.player.worldPosition.clone()
        if (!this.waypoints || this.waypoints.length === 0) {
            this.waypoints = this.generateWaypoints(this.node.worldPosition, targetPosition)
        }

        const nextWayPoint = this.waypoints[0].clone()
        // this.drawLine.drawLine(this.node.worldPosition, nextWayPoint, Color.BLACK)
        const directionToWaypoint = nextWayPoint.subtract(this.node.worldPosition)
        if (directionToWaypoint.length() < 100) {
            this.waypoints.shift()
            if (this.waypoints.length === 0) {
                this.isReachedTarget = true
                this.stopMove()
            }
            return
        }
        const velocity = directionToWaypoint.normalize().multiplyScalar(this.speed)
        this.movement = new Vec2(velocity.x, velocity.y)
    }

    /**
     * @en Create a path in the shape of a right triangle
     */
    private generateWaypoints(start: Vec3, end: Vec3): Vec3[] {
        const path: Vec3[] = []
        const endPoint = end.clone()
        const startPoint = start.clone()

        const direction = endPoint.clone().subtract(startPoint).normalize()

        const distance = Vec2.distance(new Vec2(startPoint.x, startPoint.y), new Vec2(endPoint.x, endPoint.y))

        const perpendicularDistance = (Math.random() * 2 - 1) * distance / 2

        const perpendicular = new Vec3(-direction.y, direction.x, 0).normalize()

        const triangleVertex = startPoint.add(direction.multiplyScalar((Math.random() * 2 - 1) * distance * 0.5)).add(perpendicular.multiplyScalar(perpendicularDistance))

        path.push(triangleVertex)
        path.push(endPoint)

        return path
    }

    /**
     * @en Change direction when detected obstacles in path
     */
    detectObstaclesInPathByRaycast() {
        const currentNodeWorldPosition = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y)
        const detectedTargetMiddlePoint = this.movement.clone().normalize().multiplyScalar(200).add(currentNodeWorldPosition)
        const detectedTargetLeftPoint = this.movement.clone().normalize().multiplyScalar(100).add(currentNodeWorldPosition)
        const detectedTargetRightPoint = this.movement.clone().normalize().multiplyScalar(100).add(currentNodeWorldPosition)

        const upVector =  this.node.up
        const downVector = this.node.up.multiplyScalar(-1)

        const distanceSideRaycast = 80
        const endVectorUp = new Vec3(
            currentNodeWorldPosition.clone().x + upVector.x * distanceSideRaycast,
            currentNodeWorldPosition.clone().y + upVector.y * distanceSideRaycast,
            0
        )
        const endVectorDown = new Vec3(
            currentNodeWorldPosition.clone().x + downVector.x * distanceSideRaycast,
            currentNodeWorldPosition.clone().y + downVector.y * distanceSideRaycast,
            0
        )

        // tính các điểm mục tiêu cho 2 tia 2 bên
        const offsetValue = 30
        const leftOffset = new Vec2(-offsetValue, -offsetValue)
        const rightOffset = new Vec2(offsetValue, offsetValue)

        // điểm bắt đầu và kết thúc của 2 tia 2 bên
        const leftRayStart = currentNodeWorldPosition.clone().add(leftOffset)
        const leftRayEnd = detectedTargetLeftPoint.clone().add(leftOffset)
        const rightRayStart = currentNodeWorldPosition.clone().add(rightOffset)
        const rightRayEnd = detectedTargetRightPoint.clone().add(rightOffset)

        // Phát hiện vật cản với 5 tia ray
        const rays = [
            { start: currentNodeWorldPosition, end: detectedTargetMiddlePoint, pos: 'middle' },
            { start: leftRayStart, end: leftRayEnd, pos: 'left' },
            { start: rightRayStart, end: rightRayEnd, pos: 'right' },
            // { start: currentNodeWorldPosition, end: endVectorUp, pos: 'up' },
            // { start: currentNodeWorldPosition, end: endVectorDown, pos: 'down' }
        ]

        // this.drawLine.drawLine(new Vec3(currentNodeWorldPosition.x, currentNodeWorldPosition.y, 0), new Vec3(detectedTargetMiddlePoint.x, detectedTargetMiddlePoint.y, 0))
        // this.drawLine.drawLine(new Vec3(leftRayStart.x, leftRayStart.y, 0), new Vec3(leftRayEnd.x, leftRayEnd.y, 0))
        // this.drawLine.drawLine(new Vec3(rightRayStart.x, rightRayStart.y, 0), new Vec3(rightRayEnd.x, rightRayEnd.y, 0))
        // this.drawLine.drawLine(new Vec3(currentNodeWorldPosition.x, currentNodeWorldPosition.y, 0), new Vec3(endVectorUp.x, endVectorUp.y, 0))
        // this.drawLine.drawLine(new Vec3(currentNodeWorldPosition.x, currentNodeWorldPosition.y, 0), new Vec3(endVectorDown.x, endVectorDown.y, 0))

        for (const ray of rays) {
            let results = PhysicsSystem2D.instance.raycast(ray.start, ray.end, this.raycastType)
            if (results.length > 0) {
                if (results[0]) {
                    const nodeGroup = results[0].collider.group
                    if (
                        nodeGroup === ColliderGroup.Obstacle ||
                        nodeGroup === ColliderGroup.Enemy
                    ) {
                        this.waypoints = []
                    }
                }
            }
        }
    }

    private stopMove() {
        this.movement = Vec2.ZERO.clone()
        this.isReachedTarget = false
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
        this.progressbar.progress = this._hp / this._maxHp
    }

    private doDeath() {
        if (this.node.isValid) {
            EventCenter.instance.emit('destroy-enemy', {
                enemyTank: this.node,
                position: this.node.worldPosition
            })
            EventCenter.instance.emit('add-coin', {
                count: this._coinCount,
                position: this.node.worldPosition
            })
        }
    }

    setTarget(target: Node) {
        if (this.player == null) {
            this.player = target
        }
    }

    setDrawLine(drawLine: DrawLine) {
        this.drawLine = drawLine
    }

    setBulletPoolManager(bulletPoolManager: BulletPoolManager) {  
        this.barrel.getComponent(Barrel).setBulletPoolManager(bulletPoolManager)
    }

    isDetectable(): boolean {
        return true
    }
}

