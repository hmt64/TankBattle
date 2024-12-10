export const ColliderGroup = {
    Player: 1 << 1,
    Enemy: 1 << 2,
    Bullet: 1 << 3,
    Obstacle: 1 << 4,
}
export type ColliderGroup = typeof ColliderGroup[keyof typeof ColliderGroup]


