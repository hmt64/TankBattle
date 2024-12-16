import { _decorator, CCFloat, Component, EffectAsset, Material, Node, ProgressBar, Sprite, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CountdownEffect')
export class CountdownEffect extends Component {


    @property({tooltip: "Time in seconds"})
    countdownTime: number = 5

    @property(EffectAsset)
    effectAsset: EffectAsset = null

    @property(CCFloat)
    speedEffect: number = 0.45

    @property(CCFloat)
    lineWidthEffect: number = 0.1

    @property(CCFloat)
    radianEffect: number = 0.7

    progressBar: ProgressBar = null


    start() {
        this.progressBar = this.getComponent(ProgressBar)
        this.startCountdown()
    }

    startCountdown() {
        if (!this.progressBar) {
            console.error('ProgressBar is not assigned!');
            return;
        }

        // Reset ProgressBar
        this.progressBar.progress = 1;

        new Tween(this.progressBar)
        .to(this.countdownTime, { progress: 0 }, {easing: 'linear'})
        .call(() => {
            this.loadEffect(this.node.children[0])
        })
        .start()
    }

    loadEffect(target: Node) {
        console.log('loadEffect')
        let mat = new Material()
        mat.initialize({
            effectAsset: this.effectAsset,
            technique: 1,
            defines: {
                USE_TEXTURE: true
            }
        })

        mat.setProperty('_speed', 0.45)
        mat.setProperty('_lineWidth', 0.1)
        mat.setProperty('_radian', 0.7)

        target.getComponent(Sprite).customMaterial = mat
    }
}

