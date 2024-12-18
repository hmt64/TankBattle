import { _decorator, Button, Component, director, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Restart')
export class Restart extends Component {

    btnRestart: Node = null;

    start() {
        this.btnRestart = this.node.getChildByName('BtnRestart')
        // this._startPulsatingEffect()        
    }

    update(deltaTime: number) {
        
    }

    onBtnRestart() {
        director.loadScene('StartScene')
    }

    private _startPulsatingEffect() {
        const originalScale = this.btnRestart.scale.clone();
        const zoomScale = originalScale.clone().multiplyScalar(1.2);

        director.resume()
        // Tween để phóng to và thu nhỏ liên tục
        tween(this.btnRestart)
            .repeatForever(
                tween()
                    .to(0.4, { scale: zoomScale })  // Phóng to
                    .to(0.4, { scale: originalScale }) // Thu nhỏ về ban đầu
            )
            .call(() => {
                director.pause()
            })
            .start();
    }
}

