import { _decorator, Component, EventTarget, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventCenter')
export class EventCenter extends Component {

    private static _instance: EventTarget = new EventTarget()
    
    static get instance(): EventTarget {
        return this._instance
    }
}


