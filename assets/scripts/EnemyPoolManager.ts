import { _decorator, CCInteger, Component, instantiate, Node, Prefab, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { Enemy } from './Enemy';
import { DrawLine } from './DrawLine';
import { BulletPoolManager } from './BulletPoolManager';
const { ccclass, property } = _decorator;

@ccclass('EnemyPoolManager')
export class EnemyPoolManager extends Component {
    @property(Prefab)
    enemyTankPrefab: Prefab = null

    @property(CCInteger)
    poolSize: number = 50

    @property(Node)
    target: Node = null

    @property(DrawLine)
    drawLine: DrawLine = null

    @property(BulletPoolManager)
    bulletPoolManager: BulletPoolManager = null

    @property(SpriteFrame)
    boomTankSpriteFrame: SpriteFrame = null

    defaultSpriteFrame: SpriteFrame = null

    private pool: Node[] = []

    protected onLoad(): void {
        for (let i = 0; i < this.poolSize; i++) {
            const enemyTank = instantiate(this.enemyTankPrefab)
            enemyTank.active = false
            enemyTank.getComponent(Enemy).setTarget(this.target)
            enemyTank.getComponent(Enemy).setDrawLine(this.drawLine)
            enemyTank.getComponent(Enemy).setBulletPoolManager(this.bulletPoolManager)
            this.pool.push(enemyTank)
        }
        this.defaultSpriteFrame = this.enemyTankPrefab.data.children[0].getComponent(Sprite).spriteFrame
    }

    getEnemyTank(): Node {
        let enemyTank: Node = null
        if (this.pool.length > 0) {
            enemyTank = this.pool.pop()
            enemyTank.children[0].getComponent(Sprite).spriteFrame = this.defaultSpriteFrame
            enemyTank.children[1].active = true
            enemyTank.children[2].active = true
            enemyTank.setPosition(Vec3.ZERO.clone())
            enemyTank.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO.clone()
        } else {
            enemyTank = instantiate(this.enemyTankPrefab)
        }
        enemyTank.active = true
        return enemyTank
    }

    returnEnemyTank(enemyTank: Node): void {
        enemyTank.children[0].getComponent(Sprite).spriteFrame = this.boomTankSpriteFrame
        enemyTank.children[1].active = false
        enemyTank.children[2].active = false

        this.scheduleOnce(() => {
            enemyTank.active = false

            this.pool.push(enemyTank)
        }, 0.09)
    }
}

