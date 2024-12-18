import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonSetting')
export class ButtonSetting extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    onClickSetting() {
        director.pause()
        // this.node.parent.parent.getChildByName('_lyRestart').active = true
    }
}

