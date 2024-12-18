import { _decorator, Camera, Component, director, Label, math, Node, UITransform, Vec3 } from 'cc';
import { Config } from './Config';
import { EnemyPoolManager } from './EnemyPoolManager';
import { EventCenter } from './EventCenter';
const { ccclass, property } = _decorator;

@ccclass('GameMap')
export class GameMap extends Component {

    @property(Camera)
    camera: Camera = null

    @property(Node)
    target: Node = null

    @property(Node)
    topUI: Node = null

    @property(Node)
    leftUI: Node = null

    @property(Node)
    restartNode: Node = null

    @property(EnemyPoolManager)
    enemyPoolManager: EnemyPoolManager = null

    @property(Node)
    enemyBornPos: Node[] = []

    mapSize: { width: number, height: number } = { width: 0, height: 0 }

    gameFrameSize: { width: number, height: number } = { width: 0, height: 0 }

    countNewEnemy: number = 0
    lbEnemyCount: Label = null

    protected onLoad(): void {
        EventCenter.instance.on("destroy-enemy", this.deleteEnemy, this)
    }

    start() {
        this.mapSize = this.node.getComponent(UITransform).getBoundingBox()
        this.gameFrameSize = Config.instance.gameFrameSize
        while (this.countNewEnemy < Config.instance.level[0]["EnemyCount"]) {
            this.countNewEnemy++
            this.createEnemy()
        }
        this.lbEnemyCount = this.leftUI.getChildByName("lbEnemyCount").getComponent(Label)
    }

    protected update(dt: number): void {
        this.lbEnemyCount.string = this.countNewEnemy.toString()
        if (this.countNewEnemy <= 0) {
            this.finishScene()
        }
    }

    protected lateUpdate(dt: number): void {
        const halfFrameWidth = this.gameFrameSize.width / 2
        const halfFrameHeight = this.gameFrameSize.height / 2

        const minX = -this.mapSize.width / 2 + halfFrameWidth
        const maxX = this.mapSize.width / 2 - halfFrameWidth

        const minY = -this.mapSize.height / 2 + halfFrameHeight
        const maxY = this.mapSize.height / 2 - halfFrameHeight

        const clampedX = math.clamp(this.target.position.x, minX, maxX)
        const clampedY = math.clamp(this.target.position.y, minY, maxY)

        this.camera.node.setPosition(clampedX, clampedY, this.camera.node.position.z)
        this.topUI.setPosition(clampedX, clampedY, this.topUI.position.z)
        this.leftUI.setPosition(clampedX, clampedY, this.leftUI.position.z)
        this.restartNode.setPosition(clampedX, clampedY, this.restartNode.position.z)
    }

    createEnemy() {
        let enemy = this.enemyPoolManager.getEnemyTank()
        enemy.setParent(this.node)
        const randomIndex = Math.floor(Math.random() * this.enemyBornPos.length);
        enemy.setPosition(this.enemyBornPos[randomIndex].position);
    }

    deleteEnemy(event: { enemyTank: Node,position: Vec3 }) {
        this.enemyPoolManager.returnEnemyTank(event.enemyTank)
        this.countNewEnemy--
    }

    finishScene() {
        this.scheduleOnce(() => {
            director.pause()
            const restartNode = this.node.parent.getChildByName('_lyRestart')
            restartNode.active = true
            restartNode.getChildByName("_nCoin").children[2].getComponent(Label).string = this.topUI.getChildByName("CoinItem").children[2].getComponent(Label).string
        }, 2)
    }
}

