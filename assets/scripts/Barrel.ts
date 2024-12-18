import { _decorator, CCFloat, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, Prefab, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { Tank } from './Tank';
import { BulletPoolManager } from './BulletPoolManager';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('Barrel')
export class Barrel extends Component {
    @property(Node)
    fireEffect: Node = null

    @property(BulletPoolManager)
    bulletPoolManager: BulletPoolManager = null

    canFire: boolean = true
    currentBarrelNode: Node = null

    protected start(): void {
        this.currentBarrelNode = this.node
    }

    fire(direction: Vec3, fireCooldown: number, damage: number, speed: number) {
        if (!this.canFire) {
            return
        }

        this.fireEffect.active = true

        const bulletPosition = this.node.position.clone().add(direction.normalize().clone().multiplyScalar(100))
        const velocity = new Vec2(this.node.up.x, this.node.up.y)
        Bullet.createBullet(bulletPosition, velocity, 18, damage, speed, this.currentBarrelNode.parent, this.bulletPoolManager)

        this.canFire = false
        this.scheduleOnce(() => {
            this.fireEffect.active = false
        }, 0.1)

        this.scheduleOnce(() => {
            this.canFire = true
        }, fireCooldown)
    }

    setBulletPoolManager(bulletPoolManager: BulletPoolManager) {
        this.bulletPoolManager = bulletPoolManager
    }
}

