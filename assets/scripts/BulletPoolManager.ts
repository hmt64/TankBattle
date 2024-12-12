import { _decorator, CCInteger, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletPoolManager')
export class BulletPoolManager extends Component {

    @property(Prefab)
    bulletPrefab: Prefab = null

    @property(CCInteger)
    poolSize: number = 10

    private pool: Node[] = []

    protected onLoad(): void {
        for (let i = 0; i < this.poolSize; i++) {
            const bullet = instantiate(this.bulletPrefab)
            bullet.active = false
            this.pool.push(bullet)
        }
    }

    getBullet(): Node {
        if (this.pool.length > 0) {
            const bullet = this.pool.pop()
            bullet.active = true
            return bullet
        } else {
            const bullet = instantiate(this.bulletPrefab)
            bullet.active = true
            return bullet
        }
    }

    returnBullet(bullet: Node): void {
        bullet.active = false
        bullet.setPosition(0, 0)
        this.pool.push(bullet)
    }
}

