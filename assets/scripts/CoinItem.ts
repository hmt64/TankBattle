import { _decorator, bezier, Camera, CCFloat, Color, Component, Label, Node, Sprite, tween, UITransform, Vec2, Vec3 } from 'cc';
import { EventCenter } from './EventCenter';
const { ccclass, property } = _decorator;

@ccclass('CoinItem')
export class CoinItem extends Component {

    @property(Camera)
    camera: Camera = null

    @property(CCFloat)
    timeDestroyCoin: number = 1

    _viewCount = 0
    _realCount = 0

    
    private _sprCoin: Node = null
    private _lbCoin: Label = null

    protected onLoad(): void {
        this._initVariables()
        this._initEvents()
    }

    /** Khởi tạo biến và tham chiếu */
    private _initVariables() {
        this._sprCoin = this.node.getChildByName("sprCoin")
        this._lbCoin = this.node.getChildByName("lbCoin").getComponent(Label)
        this._refreshLabel();
    }

    private _initEvents() {
        EventCenter.instance.on('add-coin', this._onAddCoin, this)
    }

    private _removeEvents() {
        EventCenter.instance.off('add-coin', this._onAddCoin, this)
    }

    private _onAddCoin(event: { count: number, position: Vec3 }) {
        for (let i = 0; i < event.count; i++) {
            this._createCoin(event.count, event.position, this.timeDestroyCoin, i * 0.1)
        }
    }

    update(deltaTime: number) {
        this._refreshLabel()
    }

    private _createCoin(count: number, position: Vec3, time: number, delay: number) {
        const coin = new Node()
        const localPosition = this._sprCoin.parent!.getComponent(UITransform)?.convertToNodeSpaceAR(position)
        coin.position = localPosition
        coin.parent = this._sprCoin.parent
        
        const sprite = coin.addComponent(Sprite)
        sprite.spriteFrame = this._sprCoin.getComponent(Sprite).spriteFrame

        const targetPosition = this._sprCoin.position;

        // Tạo điểm điều khiển ngẫu nhiên
        const controlPoint = localPosition.clone().add(new Vec3(
            (Math.random() - 0.5) * 300, // X lệch ngẫu nhiên
            Math.random() * 300 + 100,  // Y lệch ngẫu nhiên
            0                           // Z không cần
        ));

        // Chuyển các điểm thành tọa độ riêng biệt
        const startX = localPosition.x, startY = localPosition.y;
        const controlX = controlPoint.x, controlY = controlPoint.y;
        const endX = targetPosition.x, endY = targetPosition.y;

        let elapsed = 0;

        tween(coin)
            .delay(delay)
            .to(time, {}, {
                onUpdate: (target: Node, ratio: number) => {
                    elapsed += 1 / 60; // Giả sử 60 FPS
                const t = Math.min(elapsed / time, 1); // Tính giá trị t (0 -> 1)

                // Tính toán tọa độ mới bằng công thức Bezier
                const x = bezier(startX, controlX, controlX, endX, t);
                const y = bezier(startY, controlY, controlY, endY, t);

                // Cập nhật vị trí node
                target.setPosition(x, y, 0);
                }
            })
            .call(() => {
                this._viewCount += count
                this._refreshLabel()
                coin.destroy()
            })
            .start()
    }

    private _refreshLabel() {
        this._lbCoin.string = this._viewCount.toString()
    }

    private _onReduceCoin(event: { count: number }) {
        this._handleCoinChange(-event.count);
    }

    private _handleCoinChange(count: number, position?: Vec3) {
        // if (count <= 0 || !position) {
        //     this._realCount += count;
        //     this._refreshLabel();
        // } else {
        //     for (let i = 0; i < 4; i++) {
        //         this._createCoin(Math.floor(count / 4), position, 1 + i * 0.1)
        //     }
        // }
    }
}

