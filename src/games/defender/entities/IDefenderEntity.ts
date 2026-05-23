import { IEntity } from '../../../engine/entities/IEntity';

export interface IDefenderEntity extends IEntity {
    takeBulletHit?(): void;
}
