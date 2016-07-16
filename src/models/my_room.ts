/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

export class myRoom {
    private _room: Room;
    public constructor(room: Room) {
        this._room = room;
        if (this._room._memory().info == null) {
            console.log("Initializing memory for " + this.room.name);
            this._room._memory().info = {
               suppliers : 0,
               supplyEnergy : 0,
               consumers : 0,
               consumerEnergy : 0,
               upgraders : 0,
               upgradeEnergy : 0,
               numSources : room.find(FIND_SOURCES_ACTIVE).length,
               miners : 0,
               neededMinerHelpers : 0,
               minerHelpers : 0,
            };
        }
    }

    get creeps(): Creep[] {
        return this._room.find<Creep>(FIND_CREEPS);
    }
    get room(): Room {
        return this._room;
    }
    get memory(){
        return this._room.memory;
    }
    get _memory(){
        return this._room._memory();
    }
    get myCreeps(): Creep[]{
        return this._room.find<Creep>(FIND_MY_CREEPS);
    }
    get hostileCreeps(){
        return this._room.find<Creep>(FIND_HOSTILE_CREEPS);
    }
    get defenders(){
        return this.myCreeps.filter(util.isDefender);
    }
    get scavengers(){
        return this.myCreeps.filter(util.isScavenger);
    }
    get myDamagedCreeps(){
        return this.myCreeps.filter(util.isDamaged);
    }
    get myStructures(){
        return this._room.find<Structure>(FIND_MY_STRUCTURES);
    }
    get mySpawns(){
        return this._room.find<Spawn>(FIND_MY_SPAWNS);
    }
    get constructionSites(){
        return this._room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    }
    get sourcesActive(){
        return this._room.find<Source>(FIND_SOURCES_ACTIVE);
    }
    get droppedEnergy(){
        return this._room.find<Resource>(FIND_DROPPED_RESOURCES);
    }
    get underAttack(){
        return this.hostileCreeps.filter(util.notSourceKeeper).length > 0;
    }
}