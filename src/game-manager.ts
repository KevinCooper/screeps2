/// <reference path="./_reference.ts" />

import {RoomManager} from "./managers/room_manager";
import {EnergyMonitor} from "./monitor/energy_monitor";
import sp = require("./util/spawner");
import pr = require("./managers/perform_roles");
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

        Room.prototype._memory = function () {
            let that = this as Room;
            return that.memory as RoomMemory;
        }

        console.log("New screeps cycle.");

    }

    public loop() {
        // Loop code starts here.....
        // This is executed every tick
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log("Clearing non-existing creep memory:", name);
            }
        }
        try {
            let test = new EnergyMonitor();
            test.run();
            for (let i in Game.rooms) {
                //manager.reset();;
                let manager = new RoomManager(Game.rooms[i]);
                manager.initMemory();
                manager.updateNeeds();
            }

            for (let i in Game.spawns) {
                sp.spawner(Game.spawns[i]);
            }
            pr.peformRoles(Game.creeps);
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
