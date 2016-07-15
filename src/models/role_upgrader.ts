/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../managers/room_manager";

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
        creep.room.memory.upgraders[creep.id] = {
            upgradePerTick : creep.getActiveBodyparts(WORK) * 2,
        };

        creep.room.memory.consumers[creep.id] = {
            consumptionPerTick : creep.getActiveBodyparts(WORK) * 2,
        };
    }

    public onDeath() {
        let creep = this.creep;
        let spawn = Game.getObjectById<Spawn>(creep.memory.spawn);

        delete spawn.room.memory.upgraders[creep.id];
        delete spawn.room.memory.consumers[creep.id];
    }

    public action() {
        let creep = this.creep;

        let controller = Game.getObjectById<Controller>(creep.memory.controller);
        let spawn = Game.getObjectById<Spawn>(creep.memory.spawn);

        let tempRoom = new myRoom(creep.room);
        if (tempRoom.underAttack) {
            if (creep.carry.energy > 0) {
                this.moveAndPerform(spawn, creep.transfer)
            } else {
                this.keepAwayFromEnemies();
            }
        } else {
            if (creep.room.memory.miners < creep.room.memory.sources) {
                this.rest(true);
            } else if (creep.carry.energy > 0) {
                this.moveAndPerform(controller, creep.upgradeController);
            } else {
                this.moveTo(spawn);
                spawn.transferEnergy(creep);
            }
        }
    }
}