/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";


function isSpawn (structure) {
    return structure.type === STRUCTURE_SPAWN;
}

export class Builder extends ProtoRole {
    constructor() {
        super();
        this.baseParts = [WORK, CARRY];
    }

    public onSpawn() {
        let creep = this.creep;
        let room = this.room;
        room._memory.info.consumers += 1;
        room._memory.info.consumerEnergy += creep.getActiveBodyparts(WORK) * 2;

    }

    public onDeath() {
        let creep = this.creep;
        let room = this.room;
        room._memory.info.consumers -= 1;
        room._memory.info.consumerEnergy -= creep.getActiveBodyparts(WORK) * 2;


    }

    public action() {
        let creep = this.creep;
        let tempRoom = new myRoom(creep.room);
        if (tempRoom.underAttack) {
            if (creep.carry.energy > 0) {
                let spawn = this.findClosestSpawn();
                if (spawn) {
                    this.moveAndPerform(spawn, creep.transfer);
                }
            }else {
                this.keepAwayFromEnemies();
            }
            return;
        }
        if (tempRoom._memory.info.miners < tempRoom._memory.info.numSources) {
            this.rest(true);
        } else if (creep.carry.energy === 0) {
            let closestSpawn = this.findClosestSpawn();
            let pickup = util.getPickupPoint(creep.room);
            if (closestSpawn) {
                this.moveTo(pickup);
                // closestSpawn.transferEnergy(creep);
                creep.withdraw(pickup, RESOURCE_ENERGY, this.creep.carryCapacity);
            }
        } else {
            let structures = tempRoom.myStructures;
            let damagedRamparts = [];
            for (let struct of structures){
                if (struct.structureType === "rampart" && struct.hits < (struct.hitsMax / 10)) {
                    damagedRamparts.push(struct);
                }
            }

            damagedRamparts.sort(function(a: Structure, b: Structure){
                return a.hits - b.hits;
            });

            if (damagedRamparts.length) {
                this.moveTo(damagedRamparts[0]);
                creep.repair(damagedRamparts[0]);
                return;
            }

            let toRepair = [];
            for (let struct of structures) {
                if ((struct.hits / struct.hitsMax) < 0.5) {
                    toRepair.push(struct);
                }
            }

            if (toRepair.length) {
                let struct = toRepair[0];
                this.moveTo(struct);
                creep.repair(struct);
                return;
            }

            let target = this.getClosest<ConstructionSite>(FIND_CONSTRUCTION_SITES, undefined);

            if (target) {
                this.moveAndPerform(target, creep.build);
                return;
            } else {
                // TODO : FIX THIS
                target = this.rangedAttack(null);
                if (target) {
                   this.kite(target);
                }
                this.rest(true);
            }
        }

    }

    public findClosestSpawn(): Spawn {
        return this.getClosest<Spawn>(FIND_MY_SPAWNS, {
            filter: function (spawn)
            {
                return spawn.energy > 0;
            },
        });
    }
}
