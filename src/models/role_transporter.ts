/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";

export class Transporter extends ProtoRole {
    constructor(creep: Creep) {
        super(creep);
        this.baseParts = [CARRY, CARRY];
    }

    public onSpawn() {
        let creep = this.creep;
        let room = this.room;

    }

    public onDeath() {
        let creep = this.creep;
        let room = this.room;

    }
}
