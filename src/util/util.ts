/// <reference path="./../_reference.ts" />

import * as rm from "./../managers/room_manager";
import {myRoom} from "./../models/my_room";

export function getBlueprintCost(blueprint: string[]) {
    return _.sum(blueprint.map(bodyPart => BODYPART_COST[bodyPart]));
}
export function reversePath(path: PathStep[]) {
    return path.reverse().forEach(step => {
        step.dx *= -1;
        step.dy *= -1;
        switch (step.direction) {
            case TOP:
            step.direction = BOTTOM;
            break;
        case TOP_RIGHT:
            step.direction = BOTTOM_LEFT;
            break;
        case RIGHT:
            step.direction = LEFT;
            break;
        case BOTTOM_RIGHT:
            step.direction = TOP_LEFT;
            break;
        case BOTTOM:
            step.direction = TOP;
            break;
        case BOTTOM_LEFT:
            step.direction = TOP_RIGHT;
            break;
        case LEFT:
            step.direction = RIGHT;
            break;
        case TOP_LEFT:
            step.direction = BOTTOM_RIGHT;
            break;
        default:
            break;
        }
    });
}

  /**
   * Get the first energy dropoff point available. This prioritizes the spawn,
   * falling back on extensions, then towers, and finally containers.
   *
   * @export
   * @returns {Structure}
   */
  export function getDropOffPoint(room: Room): Spawn | Container | Storage | Extension | Tower {
    let tempRoom: myRoom = new myRoom(room);
    let targets: Spawn[] | Container[] | Storage[] | Extension[];
    targets = <Spawn []> tempRoom.myStructures.filter((structure) => {
        return ((structure.structureType == STRUCTURE_SPAWN) &&
               (<Spawn> structure).energy < (<Spawn> structure).energyCapacity);
    });
    // If the spawn is full, we'll find any extensions/towers.
    if (targets.length == 0) {
      targets = <Extension []> tempRoom.myStructures.filter((structure) => {
          return ((structure.structureType == STRUCTURE_EXTENSION)
            && (<Extension>structure).energy < (<Extension>structure).energyCapacity);
      });
    }

    // Or if that's filled as well, look for towers.
    if (targets.length == 0) {
      targets = <Tower []> tempRoom.myStructures.filter((structure: StructureTower) => {
        return ((structure.structureType == STRUCTURE_TOWER)
          && structure.energy < structure.energyCapacity - (structure.energyCapacity * 0.5));
      });
    }

    // Or, look for containers.
    if (targets.length == 0) {
      targets = <Container []> tempRoom.room.find<Structure>(FIND_STRUCTURES).filter((structure: StructureContainer) => {
        return ((structure.structureType == STRUCTURE_CONTAINER) &&
               structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
               && structure.pos.lookFor<Creep>(LOOK_CREEPS).length === 0;
      });
    }
    //console.log(targets);
    // Otherwise, look for storage.
    if (targets.length == 0) {
      targets = <Storage []> tempRoom.room.find<Structure>(FIND_STRUCTURES).filter((structure: StructureStorage) => {
        return ((structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
      });
    }
    return targets[0];
  }

  /**
   * Get the first energy dropoff point available. This prioritizes the spawn,
   * falling back on extensions, then towers, and finally containers.
   *
   * @export
   * @returns {Structure}
   */
  export function getPickupPoint(room: Room, creep: Creep): Spawn | Container | Storage | Extension  {
    let tempRoom: myRoom = new myRoom(room);
    let targets: Spawn[] | Container[] | Storage[] | Extension[];
    targets = <Storage []> tempRoom.room.find<Structure>(FIND_STRUCTURES).filter((structure: StructureStorage) => {
        return ((structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0);
      });

      // Or, look for containers.
    if (targets.length == 0) {
      targets = <Container []> tempRoom.room.find<Structure>(FIND_STRUCTURES).filter((structure: StructureStorage) => {
        return ((structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0);
      });
    };

    // Otherwise, look for Spawn.
    if (targets.length == 0) {
      targets = <Spawn []> tempRoom.myStructures.filter((structure) => {
        return ((structure.structureType == STRUCTURE_SPAWN) &&
               (<Spawn> structure).energy > 0);
        });
    }
    let test = creep.pos.findClosestByPath<Spawn | Container | Storage | Extension>(targets);
    return test;
  }  
export function isDefender (creep: Creep): boolean {
  // If has offensive bodyparts && has an appropriate role
    return (creep.memory.role === "archer"
        ||  creep.memory.role === "guard")
        && (creep.getActiveBodyparts (RANGED_ATTACK) > 0
        ||  creep.getActiveBodyparts (ATTACK) > 0);
}

export function isScavenger (creep: Creep): boolean {
    return creep.memory.role === "scavenger";
}

export function isDamaged (creep: Creep): boolean {
    return creep.hits < creep.hitsMax;
}

export function notSourceKeeper (creep: Creep): boolean {
    return creep.owner.username !== "Source Keeper";
}

export function isMiner (creep: Creep): boolean {
    return creep.memory.role === "miner";
}

export function isUpgrader (creep: Creep): boolean {
    return creep.memory.role === "upgrader";
}

export function isTransporter (creep: Creep): boolean {
    return creep.memory.role === "transporter";
}

export function isHealer (creep: Creep): boolean {
    return creep.memory.role === "healer"
        && creep.getActiveBodyparts (HEAL) > 0;
}

export function isBuilder (creep: Creep): boolean {
    return creep.memory.role === "builder"
        && creep.getActiveBodyparts (WORK) > 0
        && creep.getActiveBodyparts (MOVE) > 0;
}

export function isInRangedAttackRange(enemy: Creep) {
    return enemy.pos.inRangeTo (this.creep, 3);
}

export function isArcher(enemy: Creep) {
    return enemy.getActiveBodyparts (RANGED_ATTACK) > 0;
}

export function isMobileMelee(enemy: Creep) {
    return enemy.getActiveBodyparts (ATTACK) > 0
        && enemy.getActiveBodyparts (MOVE) > 0;
}

export function isMobileHealer(enemy: Creep) {
    return enemy.getActiveBodyparts(HEAL) > 0
        && enemy.getActiveBodyparts(MOVE) > 0;
}

export function isPathBlocked (pos: RoomPosition, direction: number) {
    let directions =
    {
        1 : {x : 0, y : -1},
        2 : {x : 1, y : -1},
        3 : {x : 1, y : 0},
        4 : {x : 1, y : 1},
        5 : {x : 0, y : 1},
        6 : {x : -1, y : 1},
        7 : {x : -1, y: 0},
        8 : {x : -1, y : -1},
    };
    if (direction) {
        let dir = directions[direction];
        let targetPos = new RoomPosition (pos.x + dir.x, pos.y + dir.y, pos.roomName);

        let creeps = targetPos.lookFor("creep");
        return creeps.length || targetPos.lookFor ("terrain") [0] === "wall";
    }
    return false;
}
