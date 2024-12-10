import { _decorator, CCInteger, Collider2D, Component, ERaycast2DType, Node, PhysicsSystem2D, Rect, RigidBody2D, Vec2, Vec3 } from 'cc';
import { ColliderGroup } from './Constants/Constants';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

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

    isInDetectionRange: boolean = false
    isRaycastInView: boolean = false
    isChasing: boolean = false
    isReachedTarget: boolean = false

    rigidBody: RigidBody2D = null
    movement: Vec2 = Vec2.ZERO.clone()
    waypoints: Vec3[] = []
    raycastType: ERaycast2DType = ERaycast2DType.Closest
    currentNodeWorldPosition: Vec3 = Vec3.ZERO.clone()

    start() {
        this.rigidBody = this.getComponent(RigidBody2D)
        this.currentNodeWorldPosition = this.node.worldPosition
    }

    update(deltaTime: number) {
        
        this.detectTargetInView()

        if (!this.isRaycastInView || !this.isInDetectionRange) {
            this.stopMove()
        }

        if (this.isRaycastInView) {
            this.detectTargetInCircleRange()
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
    }

    rotateHullForward() {
        const normalizedMovement = this.movement.clone().normalize()
        const angle = Math.atan2(normalizedMovement.y, normalizedMovement.x) * 180 / Math.PI - 90
        this.hull.angle = angle
    }

    private detectTargetInView() {
        let p1 = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y)
        let p2 = new Vec2(this.player.worldPosition.x, this.player.worldPosition.y)

        let results = PhysicsSystem2D.instance.raycast(p1, p2, ERaycast2DType.All)
        
        if (results.length > 0) {
            const sortedResults = [...results].sort((a, b) => {
                const distanceA = a.point.subtract(p1.clone()).length()
                const distanceB = b.point.subtract(p1.clone()).length()
                return distanceA - distanceB
            })

            let obstacleDetected = false
            for (const result of sortedResults) {
                const nodeGroup = result.collider.group
                const point = result.point

                if (nodeGroup === ColliderGroup.Obstacle) {
                    obstacleDetected = true
                    this.isRaycastInView = false
                    return
                } else if (nodeGroup === ColliderGroup.Player) {
                    if (!obstacleDetected) {
                        p2 = point
                        this.isRaycastInView = true
                        return
                    }
                }
            }
        } else {
            this.isRaycastInView = false
        }
    }

    private detectTargetInCircleRange(){
        const rect = new Rect(
            this.node.worldPosition.x - this.detectionRadius,
            this.node.worldPosition.y - this.detectionRadius,
            this.detectionRadius * 2,
            this.detectionRadius * 2
        )

        const centerPoint = rect.center
        const potentialColliders = PhysicsSystem2D.instance.testAABB(rect)

        const collidersInCircle: Collider2D[] = []
        for (const collider of potentialColliders) {
            const nodeGroup = collider.group
            const colliderPosition = collider.node.worldPosition
            const distance = Vec2.distance(centerPoint, new Vec2(colliderPosition.x, colliderPosition.y))
            if (distance < this.detectionRadius && nodeGroup === ColliderGroup.Player) {
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

    private moveToPlayer() {
        // tạo đường zic-zac hình tam giác vuông
        const targetPosition = this.player.worldPosition.clone()
        if (!this.waypoints || this.waypoints.length === 0) {
            this.waypoints = this.generateWaypoints(this.node.worldPosition, targetPosition)
        }

        const nextWayPoint = this.waypoints[0].clone()
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

    private generateWaypoints(start: Vec3, end: Vec3): Vec3[] {
        const path: Vec3[] = []
        const endPoint = end.clone()
        const startPoint = start.clone()

        const direction = endPoint.subtract(startPoint).normalize()

        const distance = Vec2.distance(new Vec2(startPoint.x, startPoint.y), new Vec2(endPoint.x, endPoint.y))

        const perpendicularDistance = (Math.random() * 2 - 1) * distance / 2

        const perpendicular = new Vec3(-direction.y, direction.x, 0).normalize()

        const triangleVertex = startPoint.add(direction.multiplyScalar((Math.random() * 2 - 1) * distance * 0.5)).add(perpendicular.multiplyScalar(perpendicularDistance))

        path.push(triangleVertex)
        path.push(endPoint)

        return path
    }

    private stopMove() {
        this.movement = Vec2.ZERO.clone()
        this.isReachedTarget = false
    }
}

