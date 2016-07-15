/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../managers/room_manager";

export class Archer extends ProtoRole {
    constructor() {
        super();
        this.baseParts = [TOUGH, RANGED_ATTACK];
    }

    public action() {
        let target = this.getRangedTarget();
        if (target) {
            this.rangedAttack(target);
            this.kite(target);
        }else {
            this.rest(false);
        }
    }
}
