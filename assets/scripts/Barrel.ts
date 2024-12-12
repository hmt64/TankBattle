import { _decorator, CCFloat, Component, instantiate, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc';
import { Tank } from './Tank';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

@ccclass('Barrel')
export class Barrel extends Component {
    @property(Prefab)
    bulletPrefab: Prefab = null

    @property(CCFloat)
    bulletSpeed: number = 20

    @property(Node)
    fireEffect: Node = null

    @property(BulletPoolManager)
    bulletPoolManager: BulletPoolManager = null

    canFire: boolean = true

    fire(direction: Vec3, fireCooldown: number) {
        if (!this.canFire) {
            return
        }
        // const bullet = instantiate(this.bulletPrefab)
        const bullet = this.bulletPoolManager.getBullet()

        bullet.setPosition(this.node.position.clone().add(direction.normalize().clone().multiplyScalar(100)))
        this.node.parent.addChild(bullet)
        this.fireEffect.active = true

        const velocity = new Vec2(this.node.up.x, this.node.up.y)
        const movement = velocity.multiplyScalar(this.bulletSpeed)
        bullet.getComponent(RigidBody2D).linearVelocity = movement

        this.canFire = false
        this.scheduleOnce(() => {
            this.fireEffect.active = false
        }, 0.1)
        this.scheduleOnce(() => {
            this.canFire = true
            // bullet.destroy()
            this.bulletPoolManager.returnBullet(bullet)
        }, fireCooldown)
    }

    handleHitTank(tankNode: Node) {
        tankNode.getComponent(Tank).beHit(5)
    }

    handleHitEnemy(enemyNode: Node) {
        // enemyNode.getComponent(Enemy).beHit(5)
    }
}

