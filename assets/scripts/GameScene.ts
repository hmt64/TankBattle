import { _decorator, Component, Node, Prefab, Vec3, view, View } from 'cc';
import { Config } from './Config';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    protected __preload(): void {
        const visibleSize = view.getVisibleSize()
        Config.instance.init({
            gameFrameSize: visibleSize,
            gameFactor: visibleSize.width / view.getVisibleSizeInPixel().width,
            safeTopTop: visibleSize.height / 2,
            safeTopBottom: visibleSize.height / 2 - 30
        })
    }
}

