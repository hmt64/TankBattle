import { _decorator, CCFloat, Component, EventKeyboard, EventMouse, Input, input, instantiate, KeyCode, Node, Prefab, Vec2, Vec3 } from 'cc';
import { Enemy } from './Enemy';
import { Tank } from './Tank';
const { ccclass, property } = _decorator;

@ccclass('TankInput')
export class BarrelBackup extends Component {

    @property(Prefab)
    bulletPrefab: Prefab = null

    @property(CCFloat)
    bulletSpeed: number = 20

    movement: Vec2 = Vec2.ZERO.clone()
    canFire: boolean = true
    currentNode: Node = null

    protected start(): void {
        this.currentNode = this.node
    }

    fire(direction: Vec3, fireCooldown: number) {
        if (!this.canFire) {
            return
        }

        const bullet = instantiate(this.bulletPrefab)
        bullet.setPosition(this.node.position.clone())
        this.currentNode.parent.addChild(bullet)

        this.canFire = false
        this.scheduleOnce(() => {
            this.canFire = true
        }, fireCooldown)
    }

    handleHitTank(tankNode: Node) {
        tankNode.getComponent(Tank).beHit(5)
    }

    handleHitEnemy(enemyNode: Node) {
        // enemyNode.getComponent(Enemy).beHit(5)
    }
}

