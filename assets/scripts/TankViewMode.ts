import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TankViewMode')
export class TankViewMode extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.angle -= 1
    }
}

