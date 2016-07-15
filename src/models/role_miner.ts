/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";

let WORK_EFFICIENCY = 2;



/**
 * This guy just finds a source, and stays near it. His job is just to mine away and let the energy fall on the ground
 * @TODO: See if we can't implement preffered spawn spots close to their source
 */
export class Miner extends ProtoRole {

    constructor() {
        super();
        this.baseParts = [WORK, WORK];
    }

    public isFreeSource (source : Source, myId : string) : boolean {
        if (Memory["sources"][source.id] == undefined || Memory["sources"][source.id].miner == undefined || Memory["sources"][source.id].miner == myId) {
            return true;
        }
        if (Game.getObjectById (Memory["sources"][source.id].miner) == null) {
            return true;
        }
        return false;
    }

    public getOpenSource() {
        let creep: Creep = this.creep;
        if (!Memory["sources"]) {
            Memory["sources"] = {};
        }
        // var source : Source = this.getClosest(FIND_SOURCES_ACTIVE, {filter : (this.isFreeSource, creep.id) });
        let sources : Source[] = creep.room.find<Source>(FIND_SOURCES_ACTIVE);
        for (let source of sources){
            if (this.isFreeSource(source, creep.id)) {
                return source;
            }
        }
        return null;
    }

    public setSourceToMine(source : Source) {
        let creep : Creep = this.creep;
        if (!source) {
            return;
        }
        if (Memory["sources"][source.id] === undefined) {
            Memory["sources"][source.id] = {id : source.id, miner : "deadbeef"};
        }
        Memory["sources"][source.id].miner = creep.id;
        creep.memory.source = source.id;

        let helperSpawn: Spawn = source.pos.findClosestByRange<Spawn>(FIND_MY_SPAWNS);
        let steps: number = helperSpawn.pos.findPathTo(source).length * 2;
        let creepsNeeded: number = Math.round((steps * 8) / 100);

        if (creepsNeeded > 5) {
            creepsNeeded = 5;
        }
        creep.memory.helpersNeeded = creepsNeeded;
    }

    public onSpawn() {
        let creep: Creep = this.creep;
        let room = this.room;
        
        creep.memory.isNearSource = false;
        creep.memory.helpers = [];

        let source: Source = this.getOpenSource();
        if (source) {
            console.log ("Source found!");
            this.setSourceToMine (source);
        } else {
            console.log ("No open sources!");
            creep.suicide();
        }

        room._memory.info.miners += 1;
    }

    public onDeath() {
        let creep: Creep = this.creep;
        let room = this.room;

        room._memory.info.miners -= 1;
        if (creep.memory.source !== undefined){
            let source = Game.getObjectById<Source>(creep.memory.source);
            if (source) {
                Memory["sources"][source.id].miner = null;
            }
        }
    }

    public action() {
        let creep: Creep = this.creep;
        // Basically, each miner can empty a whole source by themselves. Also, since they're slow, we don't have them
        // moving away from the source when it's empty, it'd regenerate before they got to another one.
        // For this, we assign one miner to one source, and they stay with it
        let source = Game.getObjectById<Source>(creep.memory.source);

        if (source == null) {
            creep.say ("I have no source assigned, searching...");
            source = this.getOpenSource ();

            if (!source) {
                creep.say ("No open sources!");
                return;
            }

            creep.say ("Source found!");
            this.setSourceToMine(source);
        }

        creep.memory.isNearSource = creep.pos.inRangeTo(source.pos, 5);
        this.moveAndPerform(source, creep.harvest);
    }
}
