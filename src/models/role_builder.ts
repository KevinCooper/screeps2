/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";


function isSpawn (structure) {
    return structure.type === STRUCTURE_SPAWN;
}

export class Builder extends ProtoRole {

    constructor(creep: Creep) {
        super(creep);
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
                this.rest(true);
                // let spawn = this.findClosestSpawn();
                // if (spawn) {
                //     this.moveAndPerform(spawn, creep.transfer);
                // }
            }else {
                this.keepAwayFromEnemies();
            }
            return;
        }
        if (tempRoom._memory.info.miners < tempRoom._memory.info.numSources ||
                tempRoom._memory.info.minerHelpers < tempRoom._memory.info.neededMinerHelpers) {
            this.rest(true);
        } else if (creep.carry.energy === 0) {
            // let closestSpawn = this.findClosestSpawn();
            let pickup = util.getPickupPoint(creep.room, creep);
            /*for (let miner of this.room.myCreeps.filter(util.isMiner)) {
                if (creep.pos.getRangeTo(miner) < creep.pos.getRangeTo(pickup)) {
                    let energyOrbs = miner.pos.lookFor<Resource>("energy");
                    if (energyOrbs !== null && energyOrbs.length) {
                        pickup = null;
                        this.moveTo(miner);
                        creep.pickup(energyOrbs[0]);
                    }
                }
            }*/
            if (pickup) {
                this.moveTo(pickup);
                // closestSpawn.transferEnergy(creep);
                creep.withdraw(pickup, RESOURCE_ENERGY);
            }
        } else if(creep.carry.energy > 0) {
            let structures = tempRoom.room.find<Structure>(FIND_STRUCTURES);
            let target = this.getClosest<ConstructionSite>(FIND_CONSTRUCTION_SITES, undefined);
            if (target) {
                this.moveAndPerform(target, creep.build);
                return;
            }

            let damagedRamparts = [];
            for (let struct of structures){
                if (struct.structureType === "rampart" && struct.hits < (struct.hitsMax / 10) ) {
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
                if ((struct.hits / struct.hitsMax) < 0.5 && struct.hits < 20000) {
                    toRepair.push(struct);
                }
            }
            if (toRepair.length) {
                let struct = toRepair[0];
                if (!creep.pos.isNearTo(struct)) {
                    this.moveTo(struct);
                } else {
                    creep.repair(struct);
                }
                return;
            }else {
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
