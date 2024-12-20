import { _decorator, Camera, CCFloat, Component, EventMouse, EventTouch, Input, input, math, Node, Vec2, Vec3 } from 'cc';
import { IInput } from './Interfaces/IInput';
const { ccclass, property } = _decorator;

@ccclass('VirtualJoystic')
export class VirtualJoystic extends Component implements IInput {
    @property(CCFloat)
    private maxDistance: number = 10

    @property(Node)
    private knob: Node = null

    @property(Camera)
    private camera: Camera = null

    isUsingJoyStick: boolean = false
    defaultPos: Vec2 = Vec2.ZERO.clone()
    
    public init() {
        input.on(Input.EventType.MOUSE_DOWN, this.activateMouseJoystick, this)
        input.on(Input.EventType.MOUSE_UP, this.deactivateJoystick, this)
        input.on(Input.EventType.MOUSE_MOVE, this.moveKnobMouse, this)

        input.on(Input.EventType.TOUCH_START, this.activateTouchJoystick, this)
        input.on(Input.EventType.TOUCH_END, this.deactivateJoystick, this)
        input.on(Input.EventType.TOUCH_MOVE, this.moveKnobTouch, this)
    }

    getAxis() {
        if (this.isUsingJoyStick) {
            return new Vec2(this.knob.position.x / this.maxDistance, this.knob.position.y / this.maxDistance)
        }
        return Vec2.ZERO.clone()
    }

    private activateMouseJoystick(event: EventMouse) {
        this.activateJoystick(event.getUILocation())
    }

    private activateTouchJoystick(event: EventTouch) {
        this.activateJoystick(event.getUILocation())
    }

    private activateJoystick(location: Vec2) {
        this.isUsingJoyStick = true
        this.node.active = true
        this.defaultPos = location

        const worldPosition = new Vec3();
        this.camera.screenToWorld(new Vec3(location.x, location.y, 0), worldPosition);
        const localPosition = this.node.parent?.inverseTransformPoint(new Vec3(), worldPosition);
        this.node.setPosition(localPosition)
        this.knob.setPosition(Vec3.ZERO.clone()) 
    }

    private deactivateJoystick() {
        this.isUsingJoyStick = false
        this.node.active = false
    }

    private moveKnobMouse(event: EventMouse) {
        this.moveKnob(event.getUILocation())
    }

    private moveKnobTouch(event: EventTouch) {
        this.moveKnob(event.getUILocation())
    }

    private moveKnob(location: Vec2) {
        if (!this.isUsingJoyStick) return

        const posDelta = location.subtract(this.defaultPos)
        let x = posDelta.x
        let y = posDelta.y

        const length = Math.sqrt(posDelta.x * posDelta.x + posDelta.y * posDelta.y)
        if (this.maxDistance < length) {
            const multiplier = this.maxDistance / length

            x *= multiplier
            y *= multiplier
        }

        this.knob.setPosition(new Vec3(x, y, 0))
    }
}

