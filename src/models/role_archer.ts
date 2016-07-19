/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";

export class Archer extends ProtoRole {
    constructor(creep: Creep) {
        super(creep);
        this.baseParts = [RANGED_ATTACK, RANGED_ATTACK];
    }

    public action() {
        let target = this.getRangedTarget();
        if (target) {
            this.rangedAttack(target);
            if(Game.getObjectById<Structure>("578c3dbcf783f31624b45c04") !== null){
                this.moveTo(Game.getObjectById<Structure>("578c3dbcf783f31624b45c04"));
            }else{
                this.kite(target);
            }
        }else {
            if (Game.flags["capture"]) {
                this.creep.moveTo(Game.flags["capture"])
            } else {
                this.rest(false);
            }
        }
    }
}
