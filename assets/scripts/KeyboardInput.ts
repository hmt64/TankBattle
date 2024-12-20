import { _decorator, Component, EventKeyboard, Input, input, KeyCode, math, Node, Vec2 } from 'cc';
import { IInput } from './Interfaces/IInput';

export class KeyboardInput implements IInput {

    private up: KeyCode
    private down: KeyCode
    private left: KeyCode
    private right: KeyCode

    isMovingLeft: boolean = false
    isMovingRight: boolean = false
    isMovingUp: boolean = false
    isMovingDown: boolean = false

    public constructor(up: KeyCode, down: KeyCode, left: KeyCode, right: KeyCode) {
        this.up = up
        this.down = down
        this.left = left
        this.right = right

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)
    }

    getAxis(): Vec2 {
        return new Vec2(this.getAxisRaw('Horizontal'), this.getAxisRaw('Vertical'))
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

    private onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case this.up:
                this.isMovingUp = true
                break
            case this.down:
                this.isMovingDown = true
                break
            case this.left:
                this.isMovingLeft = true
                break
            case this.right:
                this.isMovingRight = true
                break
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case this.up:
                this.isMovingUp = false
                break
            case this.down:
                this.isMovingDown = false
                break
            case this.left:
                this.isMovingLeft = false
                break
            case this.right:
                this.isMovingRight = false
                break
        }
    }
    
}

