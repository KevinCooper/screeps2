/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../managers/room_manager";

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
        creep.room.memory.consumers[creep.id] = {
            consumptionPerTick : creep.getActiveBodyparts(WORK) * 2,
        };

    }

    public onDeath() {
        let creep = this.creep;
        let spawn: Spawn = Game.getObjectById<Spawn>(this.creep.memory.spawn);
        delete spawn.room.memory.consumers[creep.id];

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
        if (creep.room.memory.miners < creep.room.memory.sources) {
            this.rest(true);
        } else if (creep.carry.energy === 0) {
            let closestSpawn = this.findClosestSpawn();
            if (closestSpawn) {
                this.moveTo(closestSpawn);
                // closestSpawn.transferEnergy(creep);
                creep.withdraw(closestSpawn, RESOURCE_ENERGY, this.creep.carryCapacity);
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
