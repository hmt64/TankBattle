import { _decorator, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node, Vec2, Vec3 } from 'cc';
import { Tank } from './Tank';
const { ccclass, property } = _decorator;

@ccclass('TankInput')
export class TankInput extends Component {

    @property(Tank)
    tank: Tank = null

    isMovingLeft: boolean = false
    isMovingRight: boolean = false
    isMovingUp: boolean = false
    isMovingDown: boolean = false

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this)
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    }

    protected start(): void {
        this.tank = this.tank.getComponent(Tank)
    }

    getAxisRaw(direction: string) {
        if (direction === 'Horizontal') {
            if (this.isMovingLeft) return -1
            if (this.isMovingRight) return 1
        } else if (direction === 'Vertical') {
            if (this.isMovingDown) return -1
            if (this.isMovingUp) return 1
        }
        return 0
    }

    protected onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this.isMovingLeft = true
                break
            case KeyCode.ARROW_RIGHT:
                this.isMovingRight = true
                break
            case KeyCode.ARROW_UP:
                this.isMovingUp = true
                break
            case KeyCode.ARROW_DOWN:
                this.isMovingDown = true
                break
        }
        this.move()
    }

    protected onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this.isMovingLeft = false
                break
            case KeyCode.ARROW_RIGHT:
                this.isMovingRight = false
                break
            case KeyCode.ARROW_UP:
                this.isMovingUp = false
                break
            case KeyCode.ARROW_DOWN:
                this.isMovingDown = false
                break
        }
        this.move()
    }

    move() {
        this.tank.onMove(new Vec2(this.getAxisRaw('Horizontal'), this.getAxisRaw('Vertical')))
    }

    onMouseDown(event: EventMouse) {
        this.tank.aim(new Vec3(event.getLocationX(), event.getLocationY(), 0))
    }

    onMouseUp(event: EventMouse) {
        // this.tank.aim(new Vec3(event.getLocationX(), event.getLocationY(), 0))
    }
}

