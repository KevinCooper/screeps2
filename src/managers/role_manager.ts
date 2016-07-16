/// <reference path="./../_reference.ts" />
let rolesCache = {};
import {Harvester} from "./../models/role_harvester";
import {Miner} from "./../models/role_miner";
import {MinerHelper} from "./../models/role_miner_helper";
import {Upgrader} from "./../models/role_upgrader";
import {Builder} from "./../models/role_builder";
import {Archer} from "./../models/role_archer";

export function roleExists(role) {
    if (rolesCache [role] === undefined) {
        try {
            let RoleConstructor;
            switch (role) {
                case "harvester":
                    RoleConstructor = Harvester;
                    break;
                case "miner":
                    RoleConstructor = Miner;
                    break;
                case "miner_helper":
                    RoleConstructor = MinerHelper;
                    break;
                case "upgrader":
                    RoleConstructor = Upgrader;
                    break;
                case "builder":
                    RoleConstructor = Builder;
                    break;
                case "archer":
                    RoleConstructor = Archer;
                    break;
                default:
                    throw new Error("Invalid role! role-manager");
            }
            rolesCache[role] = new RoleConstructor();
        } catch (e) {
            rolesCache [role] = null;
            console.log("Role does not exist: " + "roles_" + role);
        }
    }
    // casting to bool (true if rolesCache isn't undefined or null)
    return !!rolesCache[role];
}

export function getRoleObject(role: string) {
    if (!this.roleExists(role)) {
        return false;
    }

    return rolesCache [role];
}

export function getRoleBodyParts(role: string, maxEnergy: number) {
    if (!this.roleExists(role)) {
        return false;
    }

    let roleObject = this.getRoleObject (role);

    if (roleObject.getParts !== undefined) {
        return roleObject.getParts.call (roleObject, maxEnergy);
    }else {
        return roleObject.prototype.getParts.call (roleObject, maxEnergy);
    }
}
