/// <reference path="./../_reference.ts" />

let SAFEMODE = false;
let DEBUG_CPU = false;

import roleManager =  require("./role_manager");
import {Stopwatch} from "./../util/stopwatch";

let stopwatch = new Stopwatch ();

export function peformRoles(creeps : any) {
	//For each creep, check if they have a role. If they do, load and run it
	if ( creeps) {
		for (let name in creeps) {
			let creep = creeps[name];
			if (creep.memory.role == undefined || (creep.memory.active !== undefined && !creep.memory.active))
				continue;

			let role = creep.memory.role;

			let roleObject = null;
			if (roleManager.roleExists (role)) {
				roleObject = roleManager.getRoleObject (role);
				roleObject.reset ();
				roleObject.setCreep (creep);
				//console.log ("Performing role behaviour for creep " + creep.name + "...");
				if (DEBUG_CPU) {
					stopwatch.restart ();
				}
				if (SAFEMODE) {
					try {
						roleObject.run ();
						}
					catch (e) {
						console.log ("Error while executing role behaviour: " + role + " " + creep.name);
						console.log (e);
					};
				}else {
					roleObject.run ();
				}
				if (DEBUG_CPU) {
					console.log (stopwatch.usedCpu + " cpu was used by role behaviour for creep " + creep.name);
				}
			}
			creep.memory.lastAliveTime = Game.time;
		}
	}

	// Now we check if any creeps have died
	for (let i in Memory.creeps) {
		let creepMemory = Memory.creeps [i];
		// If so, get an appropriate roleObject and execute it's deathHandler
		if (!Game.creeps [i] && creepMemory.lastAliveTime == Game.time - 1) {
			console.log (i + " has died :( handling...");

			let roleObject = null;
			if (roleManager.roleExists (creepMemory.role)) {
				roleObject = roleManager.getRoleObject (creepMemory.role);
				roleObject.onDeath (creepMemory);
				delete Memory.creeps [i].memory;
			}
		}
	}
};
