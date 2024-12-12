import { _decorator, CCFloat, CCInteger, Component, instantiate, math, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

@ccclass('Shooter')
export class Shooter extends Component {

    @property(CCInteger)
    bulletSpeed: number = 30

    @property(CCFloat)
    bulletLifetime: number = 2

    @property(CCFloat)
    firingRate: number = 0.5

    @property(BulletPoolManager)
    bulletPoolManager: BulletPoolManager = null

    public isFiring = false
    public direction: Vec3 = Vec3.ZERO.clone()
    canFire = true
    fireInterval: number
    factoryGenerator: Generator<Node, Node>
    

    start() {
        this.bulletPoolManager = this.bulletPoolManager.getComponent(BulletPoolManager)
    }
    
    update(deltaTime: number) {
        this.fire()
    }

    fire() {
        if (this.isFiring && this.canFire) {
            const bullet = this.bulletPoolManager.getBullet()
            bullet.setPosition(this.node.position.clone())
            this.node.parent.addChild(bullet)

            const rigidBody = bullet.getComponent(RigidBody2D)
            const velocity = this.direction.multiplyScalar(this.bulletSpeed)
            const movement = new Vec2(velocity.x, velocity.y)
            rigidBody.linearVelocity = movement
            


            this.canFire = false
            this.scheduleOnce(() => {
                this.canFire = true
                this.bulletPoolManager.returnBullet(bullet)
            }, 1)
        }
    }
}

