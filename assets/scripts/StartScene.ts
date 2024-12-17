import { _decorator, Component, director, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartScene')
export class StartScene extends Component {

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    onTouchStart(event: EventTouch) {
        director.loadScene('Game')
    }
}

