/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../managers/room_manager";

export class Harvester extends ProtoRole {

    constructor() {
        super();
        this.baseParts = [WORK, CARRY];
    }

    public onSpawn() {
        let creep = this.creep;
        creep.memory.id = creep.id;

        let source: Source = this.getClosest(FIND_SOURCES_ACTIVE, undefined);
        let spawn: Spawn = source.pos.findClosestByRange<Spawn>(FIND_MY_SPAWNS);

        creep.memory.source = source.id;
        creep.memory.spawn = spawn.id;
        creep.room.memory.suppliers[creep.id] = {
            supplyPerTick : creep.getActiveBodyparts (WORK) * 2,
        };
    }

    public onDeath() {
        let creep = this.creep;
        let spawn: Spawn = Game.getObjectById<Spawn>(this.creep.memory.spawn);
        if (spawn) {
            delete spawn.room.memory.suppliers[creep.id];
        }
    }

    public action() {
        let creep: Creep = this.creep;
        if (creep.carry.energy < creep.carryCapacity) {
            let source: Source = Game.getObjectById<Source>(this.creep.memory.source);
            if (source) {
                this.moveAndPerform(source, creep.harvest);
            }
        }else {
            let target: Spawn = Game.getObjectById<Spawn>(creep.memory.spawn);
            if (target) {
                if (creep.pos.isNearTo(target)) {
                    if (target.energy < target.energyCapacity) {
                        creep.transfer(target, RESOURCE_ENERGY);
                    }else {
                        creep.drop(RESOURCE_ENERGY);
                    }
                }else {
                    this.moveTo(target);
                }
            }
        }
    }
}
