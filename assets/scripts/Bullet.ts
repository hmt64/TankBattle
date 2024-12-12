import { _decorator, CCFloat, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property(CCFloat)
    damage: number = 5

    @property(Boolean)
    isEnemyBullet: boolean = false
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}

