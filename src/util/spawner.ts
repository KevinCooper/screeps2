/// <reference path="./../_reference.ts" />

//var manager = require ('roleManager');
//var calculateCost = require ('calculateCost');


import * as manager from "./../managers/role_manager";
import {myRoom} from "./../models/my_room";
import * as rm from "./../managers/room_manager";
import * as cc from "./calc_cost";
/** 
 * Returns an object {name, index} having a generated name and an index
 * for a Creep with memory.role 'role' which is to be spawned by Spawn 'spawn'
 */
export function getNameByRole (spawn: Spawn, role: string): string {
    let creepIndex = 0;

    while (Game.creeps [spawn.room.name + " " + role + " " + creepIndex] !== undefined) {
        creepIndex++;
    }

    return spawn.room.name + " " + role + " " + creepIndex;
}


/**
 * Returns the total energy available to Spawn 'spawn'
 * i.e in itself and extensions
 */
function getTotalEnergy (spawn: Spawn) {
    let room: Room = spawn.room;
    let tempRoom: myRoom = new myRoom(room);
    let totalEnergy = tempRoom.room.energyAvailable;
    let otherSpawns: Spawn[];
    if (tempRoom.mySpawns) {
        otherSpawns = tempRoom.mySpawns.filter(function (otherSpawn)
        {
            return otherSpawn !== spawn;
        });
    }
    if (otherSpawns && otherSpawns.length) {
        for (let i in otherSpawns) {
            totalEnergy -= otherSpawns[i].energy;
        }
    }

    return totalEnergy;
}

function spawnCreep (role: string , memory: any, spawn: Spawn) {
    let room = spawn.room;

    if (!manager.roleExists(role)) {
        console.log ("There is no such role as " + role + ". Aborting...");
        return;
    }

    if (memory === undefined) {
        memory = {};
    }

    memory ["role"] = role;

    let totalEnergy = getTotalEnergy (spawn);
    let body = manager.getRoleBodyParts (role, totalEnergy);
    if (!body.length || cc.calcCost(body) > totalEnergy) {
        //console.log ("Not enough energy (currently " + totalEnergy + ") to spawn a creep of role " + role + ". Aborting...");
        return;
    }

    let name = getNameByRole (spawn, role);
    if(totalEnergy >= room.energyCapacityAvailable * .75){
        console.log("Trying to spawn " + role + "...");
        return spawn.createCreep (body, name, memory) == name;
    }
}

function spawnNeededCreep (spawn: Spawn ) {

    // Spawn's busy
    if (spawn.spawning) {
        return;
    }

    let needed = spawn.room.memory.needs.creeps;
    // Nothing to create, queue's empty
    if (!needed || !needed.length) {
        //console.log ("Room's needs queue is empty! Idling...");
        return;
    }

    // Creation process started successfully
    if (spawnCreep(needed[0].role, needed[0].memory, spawn)) {
        console.log(needed[0].role + ":  Spawn successful!");
        (<Array<{}>> needed).shift();
    }
}

export function spawner(spawn: Spawn) {
    spawnNeededCreep(spawn);
}
