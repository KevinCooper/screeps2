/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";
import util = require("./../util/util");
/**
 * This guy just finds a source, and stays near it. His job is just to mine away and let the energy fall on the ground
 * @TODO: See if we can't implement preffered spawn spots close to their source
 */
export class MinerHelper extends ProtoRole {

    constructor() {
        super();
        this.baseParts = [CARRY, CARRY];
    }

    public isCreepToHelp (possibleTarget: Creep): boolean {
        return possibleTarget !== this.creep
            && possibleTarget.my
            && possibleTarget.memory.role === this.creep.memory.role
            && possibleTarget.memory.miner === this.creep.memory.miner
            && !possibleTarget.memory.courier
            && possibleTarget.carry.energy === possibleTarget.carryCapacity
            && this.spawn.pos.getRangeTo (this.creep) < this.spawn.pos.getRangeTo (possibleTarget);
    }

    public isMinerNeedingHelpers (miner: Creep) : boolean {
        return miner.memory.role === "miner" && miner.memory.helpers.length < miner.memory.helpersNeeded;
    }

    public notMe (miner: Creep): boolean {
        return miner !== this.creep;
    }


    get spawn(){
        if (!this._cache.spawn) {
            if (this.creep.memory.spawn) {
                this._cache.spawn = Game.getObjectById(this.creep.memory.spawn);
                if (!this._cache.spawn) {
                    this.assignSpawn();
                }
            }else {
                this.assignSpawn();
            }
        }
        return this._cache.spawn;
    }
    set spawn(value: Spawn){
        this._cache.spawn = value;
        if (this._cache.spawn) {
            this.creep.memory.spawn = this._cache.spawn.id;
        }
    }

    get miner(){
        if (!this._cache.miner) {
            if (this.creep.memory.miner) {
                this._cache.miner = Game.getObjectById (this.creep.memory.miner);
                if (!this._cache.miner) {
                    this.assignMiner();
                }
            }else {
                this.assignMiner();
            }
        }
        return this._cache.miner;
    }

    set miner(value: Creep){
        this._cache.miner = value;
        if (this._cache.miner) {
            this.creep.memory.miner = this._cache.miner.id;
            this._cache.miner.memory.helpers.push(this.creep.id);
        }
    }

    public assignSpawn() {
        let spawn: Spawn = this.getClosest(FIND_MY_SPAWNS, undefined);
        if (!spawn) {
            return;
        }
        this.spawn = spawn;
    }

    public assignMiner() {
        let creep: Creep = this.creep;
        let room = this.room;
        let miner: Creep = this.getClosest(FIND_CREEPS, {filter : this.isMinerNeedingHelpers});
        if (!miner) {
            return;
        }
        this.miner = miner;
        room._memory.info.suppliers += 1;
        room._memory.info.supplyEnergy += creep.getActiveBodyparts(CARRY) * 2;
        room._memory.info.minerHelpers += 1;
    }

    public onSpawn() {
        let creep : Creep = this.creep;
        creep.memory.id = creep.id;
        // Because I want it to be done ASAP
        this.assignSpawn ();
        this.assignMiner ();

    }

    public onDeath() {
        let creep: Creep = this.creep;
        let room = this.room;
        room._memory.info.minerHelpers -= 1;
        room._memory.info.suppliers -= 1;
        room._memory.info.supplyEnergy -= creep.getActiveBodyparts(CARRY) * 2;
        if (creep.memory.miner) {
            let miner = Game.getObjectById<Creep>(creep.memory.miner);
            if (miner) {
                for (let i in miner.memory.helpers) {
                    if (miner.memory.helpers[i] == creep.memory.id) {
                        miner.memory.helpers.splice (i, 1);
                        break;
                    }
                }
            }
        }
    }

    /**
    * @TODO: Make helpers smarter about avoiding miners, instead of just waiting till they're 5 tiles away
    * @TODO: When spawns are at .25, and extensions have >= 200, help builders before filling shit up
    */
    public action() {
        let creep : Creep = this.creep;
        if (creep.memory.courier) {
            let courier = Game.getObjectById<Creep>(creep.memory.courier);
            this.moveAndTransfer(courier, false);
            creep.memory.courier = null;
            return;
        }

        let miner = this.miner;

        if (miner == null) {
            creep.say("I see no miners to help, and thus I die");
            this.onDeath();
            creep.suicide();
            return;
        }

        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.pos.isNearTo(miner)) {
                let energyOrbs = miner.pos.lookFor<Resource>("energy");
                if (energyOrbs !== null && energyOrbs.length) {
                    creep.pickup(energyOrbs[0]);
                }
            }else {
                // We're not near miner going to him
                // But first lets try looking for helpers already 
                // returning from the miner to deliver energy, and 
                // take it from them.

                // We'll check on making sure 
                // they're not us,
                // they're the same role,
                // they work for the same miner,
                // they are not already chosen by someone else
                // they have some energy, and
                // they're further from target than we are.

                let creepToHelp = creep.pos.findClosestByRange<Creep>(FIND_CREEPS, 
                                            {filter: this.isCreepToHelp.bind(this)});
                //console.log(creepToHelp);
                //creepToHelp = null;
                if (creepToHelp) {
                    creep.say("Take Energy!");
                    creepToHelp.say("Give Energy!");
                    creepToHelp.memory.courier = creep.id;
                    if (!creep.pos.isNearTo(creepToHelp)) {
                        // NO CACHE PATHING
                        this.creep.moveTo(creepToHelp);
                    }
                }else if (miner.memory.isNearSource) {
                    this.moveTo(miner);
                }else {
                    this.rest(true);
                }
            }
        }else {
            // Dropping off energy
            let target: Spawn | Container | Storage | Extension | Tower = util.getDropOffPoint(creep.room);
            if (target) {
                if (creep.pos.isNearTo(target)) {
                    let notFull: boolean;
                    if (target.structureType === "spawn" || target.structureType === "extension" ||
                                                            target.structureType === "tower" ) {
                        let target2 = <Spawn | Extension | Tower> target;
                        notFull = target2.energy < target2.energyCapacity;
                    }else {
                        let target2 = <Container | Storage> target;
                        notFull = target2.store[RESOURCE_ENERGY] < target2.storeCapacity;
                    }

                    if (notFull) {
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
