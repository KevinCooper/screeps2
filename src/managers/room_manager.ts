/// <reference path="./../_reference.ts" />
import util = require("./../util/util");

let DEFENDERS_PER_HEALER: number = 3;
let CIVILIANS_PER_HEALER: number = 5;

let CONSTRUCTION_SITES_PER_BUILDER : number = 3;
let UPGRADERS_REQUIRED: number = 2;

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
        if (!this._room.memory.suppliers) {
            this._room.memory.suppliers = {};
        }
        if (!this._room.memory.consumers) {
            this._room.memory.consumers = {};
        }
        if (!this._room.memory.upgraders) {
            this._room.memory.upgraders = {};
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



export class RoomManager {
    private _energySupply: number;
    private room: myRoom = null;
    private needs;
    private MIN_SUPPLY: number = 4;
    private neededSupply: number = 20;

    constructor() {
        this.needs = {
            creeps : [],
            energy : 0,
        };
    }

    public reset() {
        this.room = null;
        this.needs = {
                        creeps : [],
                        energy : 0 };
        for (let propertyName in this) {
            if (this [propertyName] && propertyName.indexOf ("_") == 0) {
                this[propertyName] = null;
            }
        }
    }

    get enerySupply() : number{
        if (!this._energySupply) {
            this._energySupply = 0;
            for (let i in this.room.memory.suppliers) {
                this._energySupply += this.room.memory.suppliers[i].supplyPerTick;
            }
            for (let i in this.room.memory.consumers) {
                this._energySupply -= this.room.memory.consumers[i].consumptionPerTick;
            }
        }
        this.room.memory._energySupply = this._energySupply;
        return this._energySupply;
    }

    public set setRoom(room : Room){
        if (room) {
            let test = new myRoom(room);
            this.room = test;
        }else {
            this.room = null;
        }
    }

    public initMemory() {
        let room : myRoom = this.room;
        if (!room.memory.initialized)
        {

            let needs = room.memory.needs = {};
            needs["creeps"] = [];
            needs["energy"] = 0;
            room.memory.suppliers = {};
            room.memory.consumers = {};
            room.memory.upgraders = {};
            room.memory.miners = 0;
            room.memory.sources = room.room.find(FIND_SOURCES_ACTIVE).length;

            room.memory.initialized = true;
        }
    }

    public updateNeeds() {
        this.needs =
                    {
                        creeps : [],
                        energy : 0,
                    };
        // Minimum reached, now we need non-suppliers
        if ((this.enerySupply >= this.MIN_SUPPLY && this.room.memory.miners >= this.room.memory.sources ) || this.room.underAttack) {
            // this.updateNeedsDefenders ();
            // this.updateNeedsHealers ();
            // this.updateNeedsScavengers ();
            this.updateNeedsUpgraders ();
            this.updateNeedsBuilders ();
        }
        this.updateNeedsHelpers ();
        this.updateNeedsSuppliers ();
        // If doesn't need anything
        if (this.needs.creeps.length === 0) {
            this.updateNeedsSurplus ();
        }
        this.setNeeds ();
    }

    public setNeeds() {
        this.room.memory.needs = this.needs;
    }

    public updateNeedsSurplus() {
        if (this.enerySupply == this.room.room.energyCapacityAvailable) {
            this.needs.creeps.push(
                { role : "arhcer" }
            );
        }
    }

    public updateNeedsScavengers() {
        if (this.room.droppedEnergy.length && this.room.scavengers.length == 0) {
            this.needs.creeps.push(
                {
                    role : "scavenger",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsBuilders() {
        let room: myRoom = this.room;
        let builders: Creep[] = room.myCreeps.filter(util.isBuilder);
        let constrSites = room.constructionSites.length;
        let neededBuilders = Math.ceil(constrSites / CONSTRUCTION_SITES_PER_BUILDER) - builders.length;
        if ( builders.length < 5) {
            for (let i = 0; i < neededBuilders; i ++) {
                this.needs.creeps.push(
                    {
                        role : "builder",
                        memory : {},
                    }
                );
            }
        }
    }

    public updateNeedsUpgraders() {
        let neededUpgraders = UPGRADERS_REQUIRED - Object.keys(this.room.memory.upgraders).length;
        for (let i = 0; i < neededUpgraders; i++) {
            this.needs.creeps.push(
                {
                    role : "upgrader",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsDefenders() {
        let neddedDefenders = this.room.hostileCreeps.length - this.room.defenders.length + 1;
        for (let i = 0; i < neddedDefenders; i++) {
            this.needs.creeps.push(
                {
                    role : "archer",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsHealers() {
        let room = this.room;
        let healers = room.myCreeps.filter(util.isHealer);
        let neededHealers = Math.floor(this.room.defenders.length / DEFENDERS_PER_HEALER) - healers.length;

        if (neededHealers <= 0) {
            neededHealers = Math.ceil (room.myDamagedCreeps.length / CIVILIANS_PER_HEALER) - healers.length;
        }

        for (let i = 0; i < neededHealers; i++) {
            this.needs.creeps.push (
                {
                    role : "healer",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsSuppliers() {
        let neededRole = "miner";
        if (this.enerySupply <= 0) {
            neededRole = "harvester";
        }
        let numMiners = this.room.memory.miners;
        let numSources = this.room.memory.sources;
        if ((this.enerySupply < this.neededSupply) || (numMiners < numSources && this.needs.creeps.length < 1)) {
            this.needs.creeps.push(
                {
                    role : neededRole,
                    memory : {},
                }
            );
            this.needs.energy = this.neededSupply - this.enerySupply;
        }
    }

    public updateNeedsHelpers() {
        let room: myRoom = this.room;
        let miners: Creep[] = room.myCreeps;
        if (miners) {
            for (let miner of miners.filter(util.isMiner)){
                if (!miner.memory.helpersNeeded || !miner.memory.helpers) {
                    continue;
                }

                let helpersToAdd = miner.memory.helpersNeeded - miner.memory.helpers.length;
                for (let i = 0; i < helpersToAdd; i ++) {
                    this.needs.creeps.push(
                        {
                            role : "miner_helper",
                            memory : {miner : miner.id},
                        }
                    );
                }
            }
        }
    }


}
