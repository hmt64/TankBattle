import { _decorator, Button, CCFloat, CCInteger, Component, EffectAsset, Material, Node, ProgressBar, Sprite, SpriteFrame, Tween } from 'cc';
import { SkillType } from './Constants/Constants';
const { ccclass, property } = _decorator;

@ccclass('IconSkill')
export class IconSkill extends Component {

    @property(SpriteFrame)
    skillsSpriteFrame: SpriteFrame[] = []

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

    @property(CCInteger)
    skillType: SkillType = SkillType.MultiRay

    @property(Boolean)
    isStartCountdown: boolean = false

    progressBar: ProgressBar = null

    sprDark: Node = null
    sprLight: Node = null

    start() {
        this.sprDark = this.node.getChildByName('sprDark')
        this.sprLight = this.node.getChildByName('sprLight')
        this.sprDark.getComponent(Sprite).spriteFrame = this.skillsSpriteFrame[this.skillType]
        this.sprLight.getComponent(Sprite).spriteFrame = this.skillsSpriteFrame[this.skillType]
        this.progressBar = this.sprDark.getComponent(ProgressBar)
        if (this.isStartCountdown) {
            this.startCountdown()
        } else {
            this.loadEffect(this.sprLight)
        }
    }

    update(deltaTime: number) {
        
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
            this.loadEffect(this.sprLight)
        })
        .start()
    }

    loadEffect(target: Node) {
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
        let button = target.addComponent(Button)
        button.transition = Button.Transition.SCALE
    }

    setSpriteFrame(spriteFrameId: SkillType) {
        this.sprLight.getComponent(Sprite).spriteFrame = this.skillsSpriteFrame[spriteFrameId]
    }
}

