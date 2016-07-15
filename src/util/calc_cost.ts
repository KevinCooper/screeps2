/// <reference path="./../_reference.ts" />
let COST            = {};
COST [MOVE]          = 50;
COST [WORK]          = 100;
COST [CARRY]         = 50;
COST [ATTACK]        = 80;
COST [RANGED_ATTACK] = 150;
COST [HEAL]          = 250;
COST [TOUGH]         = 10;

/**
 * Calculates the energy cost of a Creep with bodyparts 'parts'
 * 
 * @param parts : [string]
 * @returns {Number}
 */
export function calcCost(parts: string[]) {
    let cost: number = 0;
    for (let i in parts) {
        let part : string = parts[i];
        if (COST[part]) {
            cost += COST[part];
        }
    }
    return cost;
}
