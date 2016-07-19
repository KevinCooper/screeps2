/// <reference path="./../_reference.ts" />
import util = require("./../util/util");
import {myRoom} from "./../models/my_room";

let DEFENDERS_PER_HEALER: number = 3;
let CIVILIANS_PER_HEALER: number = 5;
let MIN_IDLE_DEFENDERS: number = 0;
let MAX_BUILDERS: number = 3;
let CONSTRUCTION_SITES_PER_BUILDER: number = 3;
let UPGRADERS_REQUIRED: number = 3;

export class RoomManager {
    private _energySupply: number;
    private room: myRoom = null;
    private needs;
    private MIN_SUPPLY: number = 4;
    private neededSupply: number = 20;

    constructor(room: Room) {
        this.room = new myRoom(room);
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

    get enerySupply(): number{
          return this.room._memory.info.supplyEnergy -
            this.room._memory.info.consumerEnergy -
            this.room._memory.info.upgradeEnergy;
    }

    public initMemory() {
        let room: myRoom = this.room;
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
        this.updateNeedsHelpers ();
        this.updateNeedsSuppliers ();
        if ( (this.room._memory.info.miners >= this.room._memory.info.numSources
                && this.room._memory.info.minerHelpers >= this.room._memory.info.neededMinerHelpers)
                || this.room.underAttack) {
            // this.updateNeedsHealers ();
            // this.updateNeedsScavengers ();
            this.updateNeedsUpgraders ();
            this.updateNeedsBuilders ();
            this.updateNeedsDefenders ();
        }
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
        // Always want to have 1 just in case of repairs, at least for now.
        let neededBuilders = Math.ceil(constrSites / CONSTRUCTION_SITES_PER_BUILDER) + 1 - builders.length;
        if ( builders.length < MAX_BUILDERS && neededBuilders > 0) {
            this.needs.creeps.push(
                {
                    role : "builder",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsUpgraders() {
        let room: myRoom = this.room;
        let neededUpgraders = UPGRADERS_REQUIRED - room.myCreeps.filter(util.isUpgrader).length;
        if (neededUpgraders > 0) {
            this.needs.creeps.push(
                {
                    role : "upgrader",
                    memory : {},
                }
            );
        }
    }

    public updateNeedsDefenders() {
        let neededDefenders = this.room.hostileCreeps.length - this.room.defenders.length + MIN_IDLE_DEFENDERS;
        if (neededDefenders > 0) {
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
        let neededHealers = Math.floor(room.defenders.length / DEFENDERS_PER_HEALER) - healers.length;

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
        if (this.room._memory.info.supplyEnergy <= 0) {
            neededRole = "harvester";
        }
        let numMiners = this.room._memory.info.miners;
        let numSources = this.room._memory.info.numSources;
        if (numMiners < numSources) {
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
                if (helpersToAdd > 0) {
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
