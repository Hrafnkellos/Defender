// Enemy — Defender base class for enemies.
// Extends Entity with Defender-specific behaviour: firing alien bullets toward the player ship.

import { Entity }       from '../../../engine/entities/Entity';
import { camera }       from '../../../engine/managers/camera';
import { randRange }    from '../../../engine/utils/util';
import { entityManager as defEntityManager } from '../managers/entityManager';

export class Enemy extends Entity {
    chanceOfFire: number = 0;
    rateOfFire:   number = 1000;
    timeToFire:   number = 0;

    maybeFireBullet(du: number): void {
        const fireProb = randRange(0, 1);
        this.timeToFire -= du;
        if (fireProb < this.chanceOfFire && this.timeToFire <= 0 && camera.isOnScreen(this.cx)) {

            const ship     = defEntityManager._ships[0];
            const rotation = Math.atan2(-(ship.cy - this.cy), (ship.cx - this.cx));

            this.timeToFire = this.rateOfFire * Math.random();

            const dX        = Math.cos(rotation);
            const dY        = -Math.sin(rotation);
            const launchDist = this.getRadius() * 1.2;
            const relVel    = 3;

            defEntityManager.fireAlienBullet(
                this.cx + dX * launchDist, this.cy + dY * launchDist,
                dX * relVel, dY * relVel,
                rotation
            );
        }
    }
}
