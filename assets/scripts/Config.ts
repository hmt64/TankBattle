import { Size } from 'cc';

export class Config {
    
    private static _instance: Config = null

    public eventCenter: any = null;
    public gameFrameSize: Size = new Size(0, 0);
    public gameFactor: number = 1;
    public safeTopTop: number = 0;
    public safeTopBottom: number = 0;
    public config: any = null;
    public bundle: any = null;

    private constructor() {}

    static get instance() {
        if (!this._instance) {
            this._instance = new Config
        }
        return this._instance
    }

    public init(data: Partial<Config>) {
        Object.assign(this, data)
    }
}

