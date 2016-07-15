/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

export class myRoom {
    private _creeps: Creep[] = [];
    private _myCreeps: Creep[] = [];
    private _hostileCreeps: Creep[] = [];
    private _defenders: Creep[] = [];
    private _scavengers: Creep[] = [];
    private _myDamagedCreeps: Creep[] = [];
    private _myStructures: Structure[] = [];
    private _spawns: Spawn[] = [];
    private _constructionSites: ConstructionSite[] = [];
    private _sourcesActive: Source[] = [];
    private _droppedEnergy: Resource[] = [];
    private _underAttack: boolean;
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
            };
        }
    }

    get creeps(): Creep[] {
        this._creeps  = this._room.find<Creep>(FIND_CREEPS);
        return this._creeps;
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
        this._myCreeps = this._room.find<Creep>(FIND_MY_CREEPS);
        return this._myCreeps;
    }
    get hostileCreeps(){
        this._hostileCreeps = this._room.find<Creep>(FIND_HOSTILE_CREEPS);
        return this._hostileCreeps;
    }
    get defenders(){
        this._defenders = this.myCreeps.filter(util.isDefender);
        return this._defenders;
    }
    get scavengers(){
        this._scavengers = this.myCreeps.filter(util.isScavenger);
        return this._scavengers;
    }
    get myDamagedCreeps(){
        this._myDamagedCreeps = this.myCreeps.filter(util.isDamaged);
        return this._myDamagedCreeps;
    }
    get myStructures(){
        this._myStructures = this._room.find<Structure>(FIND_MY_STRUCTURES);
        return this._myStructures;
    }
    get mySpawns(){
        this._spawns = this._room.find<Spawn>(FIND_MY_SPAWNS);
        return this._spawns;
    }
    get constructionSites(){
        this._constructionSites = this._room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        return this._constructionSites;
    }
    get sourcesActive(){
        this._sourcesActive = this._room.find<Source>(FIND_SOURCES_ACTIVE);
        return this._sourcesActive;
    }
    get droppedEnergy(){
        this._droppedEnergy = this._room.find<Resource>(FIND_DROPPED_RESOURCES);
        return this._droppedEnergy;
    }
    get underAttack(){
        this._underAttack = this.hostileCreeps.filter(util.notSourceKeeper).length > 0;
        return this._underAttack;
    }
}