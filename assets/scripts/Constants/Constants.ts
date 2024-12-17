export const ColliderGroup = {
    Player: 1 << 1,
    Enemy: 1 << 2,
    Bullet: 1 << 3,
    Obstacle: 1 << 4,
}
export type ColliderGroup = typeof ColliderGroup[keyof typeof ColliderGroup]

export const BulletType = {
    Normal: 1,
    TwoRay: 2,
    FanShape: 3,
    FourDirection: 4,
}
export type BulletType = typeof BulletType[keyof typeof BulletType]


export const SkillType = {
    MultiRay: 0,
    RestoreHealth: 1,
    Freeze: 2,
    Shield: 3,
}
export type SkillType = typeof SkillType[keyof typeof SkillType]