import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Sprite, SpriteFrame, Vec2, Vec3 } from 'cc';
import { BulletType, ColliderGroup } from './Constants/Constants';
import { BulletPoolManager } from './BulletPoolManager';
import { Enemy } from './Enemy';
import { Tank } from './Tank';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    bulletPoolManager: BulletPoolManager = null;

    owner: Node = null

    _bulletType = 1
    _bulletLevel = 1
    _gameController: Node = null
    _direction: Vec2 = Vec2.ZERO.clone()
    _speed: number = 3
    _gunshot: number = 5
    _damage: number = 3
    _destroyTime: number = -1
    _camp: string = ""

    _currentBullet = null
    _isStop: boolean = false
    _collider: Collider2D = null

    initBullet(dir: Vec2, gunshot: number, atk: number, speed: number, poolManager: BulletPoolManager) {
        this._direction = dir
        this._gunshot = gunshot
        this._speed = speed
        this._damage = atk
        this._destroyTime = this._gunshot / this._speed
        this.bulletPoolManager = poolManager

        // this._isStop = false

        console.log('destroyTime', this._destroyTime)

        this._registerCollisionEvent();
    }

    // Đăng ký sự kiện va chạm
    private _registerCollisionEvent() {
        this._collider = this.getComponent(Collider2D)
        if (this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    // Gỡ bỏ sự kiện va chạm
    private _unregisterCollisionEvent() {
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected update(dt: number): void {
        if (!this._isStop) {
            if (this._destroyTime > 0) {
                this._destroyTime -= dt
                if (this._destroyTime <= 0) {
                    // this.node.getComponent(RigidBody2D).linearVelocity = Vec2.ZERO.clone()
                    // this.returnToPool()
                }
            }
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group === ColliderGroup.Obstacle) {
            this.handleHitObstacle()
        } else if (otherCollider.group === ColliderGroup.Enemy) {
            this.handleHitEnemy(otherCollider.node)
        } else if (otherCollider.group === ColliderGroup.Player) {
            this.handleHitPlayer(otherCollider.node)
        }
    }

    private handleHitObstacle() {
        this.returnToPool()
    }

    private handleHitEnemy(enemyNode: Node) {
        const enemy = enemyNode.getComponent(Enemy)
        if (enemy) {
            enemy.beHit(this._damage)
        }
        this.returnToPool()
    }

    private handleHitPlayer(playerNode: Node) {
        const player = playerNode.getComponent(Tank)
        if (player) {
            player.beHit(this._damage)
        }
        this.returnToPool()
    }

    public returnToPool() {
        this._isStop = true
        if (this.bulletPoolManager) {
            this.bulletPoolManager.returnBullet(this.node)
            this._unregisterCollisionEvent()
        } else {
            this.node.destroy()
        }
    }

    static createBullet(pos: Vec3, dir: Vec2, gunshot: number, atk: number, speed: number, parentNode: Node, poolManager: BulletPoolManager): Node {
        const bulletNode = poolManager.getBullet()
        bulletNode.setParent(parentNode)
        bulletNode.setPosition(new Vec3(pos.x, pos.y, 5000))

        const bullet = bulletNode.getComponent(Bullet);
        if (bullet) {
            bullet.initBullet(dir, gunshot, atk, speed, poolManager)
        }

        // Thiết lập vận tốc cho rigidbody
        const rigidBody = bulletNode.getComponent(RigidBody2D);
        if (rigidBody) {
            rigidBody.linearVelocity = dir.multiplyScalar(speed);
        }

        return bulletNode;
    }
}

