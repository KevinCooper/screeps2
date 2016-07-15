/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";

function isSpawn (structure) {
    return structure.type === STRUCTURE_SPAWN;
}

export class Upgrader extends ProtoRole {
    constructor() {
        super();
        this.baseParts = [WORK, CARRY];
    }

    public onSpawn() {
        let creep = this.creep;
        let room = this.room;
        creep.memory.is = creep.id;

        if (creep.room.controller) {
            creep.memory.controller = creep.room.controller.id;
        }

        let spawn = creep.room.lookForAt<Spawn>("structure", creep.pos).filter(isSpawn)[0];

        if (!spawn) {
            console.log("Trouble - no spawns found - role_upgrader.");
            spawn = new myRoom(creep.room).mySpawns[0];
        }

        creep.memory.spawn = spawn.id;
        room._memory.info.upgraders += 1;
        room._memory.info.upgradeEnergy += creep.getActiveBodyparts(WORK) * 2;
    }

    public onDeath() {
        let creep = this.creep;
        let spawn = Game.getObjectById<Spawn>(creep.memory.spawn);
        let room = this.room;
        room._memory.info.upgraders -= 1;
        room._memory.info.upgradeEnergy -= creep.getActiveBodyparts(WORK) * 2;
    }

    public action() {
        let creep = this.creep;

        let controller = Game.getObjectById<Controller>(creep.memory.controller);
        //let spawn = Game.getObjectById<Spawn>(creep.memory.spawn);
        let pickup = util.getPickupPoint(creep.room);
        let tempRoom = new myRoom(creep.room);
        if (tempRoom.underAttack) {
            if (creep.carry.energy > 0) {
                this.moveAndPerform(pickup, creep.transfer)
            } else {
                this.keepAwayFromEnemies();
            }
        } else {
            if (tempRoom._memory.info.miners < tempRoom._memory.info.numSources) {
                this.rest(true);
            } else if (creep.carry.energy > 0) {
                this.moveAndPerform(controller, creep.upgradeController);
            } else {
                this.moveTo(pickup);
                creep.withdraw(pickup, RESOURCE_ENERGY, creep.carryCapacity)
                //spawn.transferEnergy(creep);
            }
        }
    }
}