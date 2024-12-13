import { _decorator, CCInteger, Component, instantiate, Node, Prefab, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletPoolManager')
export class BulletPoolManager extends Component {

    @property(Prefab)
    bulletPrefab: Prefab = null

    @property(CCInteger)
    poolSize: number = 10

    defaultSpriteFrame: SpriteFrame = null

    private pool: Node[] = []

    protected onLoad(): void {
        for (let i = 0; i < this.poolSize; i++) {
            const bullet = instantiate(this.bulletPrefab)
            bullet.active = false
            this.pool.push(bullet)
        }
        this.defaultSpriteFrame = this.bulletPrefab.data.children[0].getComponent(Sprite).spriteFrame
    }

    getBullet(): Node {
        let bullet: Node = null
        if (this.pool.length > 0) {
            bullet = this.pool.pop()
        } else {
            bullet = instantiate(this.bulletPrefab)
        }
        bullet.active = true
        return bullet
    }

    returnBullet(bullet: Node): void {
        bullet.children[0].active = false
        bullet.children[1].active = true

        bullet.setPosition(Vec3.ZERO.clone())
        bullet.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO.clone()

        this.scheduleOnce(() => {
            bullet.active = false
            
            bullet.children[0].active = true
            bullet.children[1].active = false

            this.pool.push(bullet)
        }, 0.08)
    }
}

