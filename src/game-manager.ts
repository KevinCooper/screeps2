/// <reference path="./_reference.ts" />

import {RoomManager} from "./managers/room_manager";
import {EnergyMonitor} from "./monitor/energy_monitor";
import {BuildingManager} from "./managers/building_manager"
import sp = require("./util/spawner");
import pr = require("./managers/perform_roles");
let ROUTE_CACHE_CLEANING_INTERVAL = 10;

/**
 * Singleton object.
 * Since singleton classes are considered anti-pattern in Typescript, we can effectively use namespaces.
 * Namespace's are like internal modules in your Typescript application. Since GameManager doesn't need multiple instances
 * we can use it as singleton.
 */



export class GameManager {



    /**
     * We can use variables in our namespaces in this way. Since GameManager is not class, but "module", we have to export the var, so we could use it.
     * @type {string}
     */
    public globalBootstrap() {
        // Set up your global objects...........
        // This method is executed only when Screeps system instantiated new "global".

        // Use this bootstrap wisely. You can cache some of your stuff to save CPU
        // You should extend prototypes before game loop in here.


        // Allow us to add our own types to room memory. See room.d.ts 
        Room.prototype._memory = function () {
            let that = this as Room;
            return that.memory as RoomMemory;
        }

        // Allow us to add our own types to creep memory. See creep.d.ts 
        Creep.prototype._memory = function () {
            let that = this as Creep;
            return that.memory as CreepMemory;
        }

        // When using screeps pathfinder, it does not normally take impassable buildings into account....
        Room.prototype.getCostMatrix = function (addCreeps = false) {
            let that = this as Room;
            let structurePos = that.find<Structure>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType !== STRUCTURE_CONTAINER &&
                        structure.structureType !== STRUCTURE_ROAD &&
                        structure.structureType !== STRUCTURE_RAMPART;
                }
            }).map(structure => structure.pos);
            structurePos.concat(that.find<Structure>(FIND_CONSTRUCTION_SITES, {
                filter: (constructionSite: Structure) => {
                    return constructionSite.structureType !== STRUCTURE_CONTAINER &&
                        constructionSite.structureType !== STRUCTURE_ROAD &&
                        constructionSite.structureType !== STRUCTURE_RAMPART;
                }
            }).map(structure => structure.pos));
            if (addCreeps) {
                structurePos.concat(that.find<Creep>(FIND_CREEPS).map(creep => creep.pos));
            }
            let matrix = new PathFinder.CostMatrix();
            for (let unwalkablePos of structurePos) {
                matrix.set(unwalkablePos.x, unwalkablePos.y, 255);
            }
            return matrix;
        }

        //console.log("New screeps cycle.");

    }

    public loop() {
        // Loop code starts here.....
        // This is executed every tick
        if (Game.time % 1000 === 0 && Memory["routeCache"]) {
            delete Memory["routeCache"]
            console.log("Clearing route cache");
        }

        if (Game.time % ROUTE_CACHE_CLEANING_INTERVAL === 0 && Memory["routeCache"]) {
            for (let k in Memory["routeCache"]) {
                if (Game.getObjectById(k) == null) {
                    delete Memory["routeCache"][k];
                    console.log("Cleaning route cache to: " + k);
                }
            }
        }


        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        }
        try {
            let test = new EnergyMonitor();
            test.run();
            for (let i of Object.keys(Game.rooms)) {
                // manager.reset();
                if (true) {
                    let test = new BuildingManager(Game.rooms[i]);
                    test.buildRoads();
                }
                let manager = new RoomManager(Game.rooms[i]);
                manager.initMemory();
                manager.updateNeeds();
            }

            for (let i of Object.keys(Game.spawns)) {
                sp.spawner(Game.spawns[i]);
            }
            pr.peformRoles(Game.creeps);
            //console.log(Game.cpu.getUsed());
        } catch (err) {
            this.dumpError(err);
        }
    }
    private dumpError(err) {
    if (typeof err === "object") {
            if (err.message) {
            console.log("\nMessage: " + err.message);
            }
            if (err.stack) {
            console.log("\nStacktrace:");
            console.log("====================");
            console.log(err.stack);
            }
        } else {
            console.log("dumpError :: argument is not an object");
        }
    }
}
