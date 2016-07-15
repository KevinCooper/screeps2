/// <reference path="./../_reference.ts" />

import * as rm from "./../managers/room_manager";

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
    * Get the first storage object available. This prioritizes StructureContainer,
    * but will fall back to an extension, or to the spawn if need be.
    *
    * @export
    * @returns {Structure}
    */
  export function getStorageObject(room: Room): Structure {
    let myRoom: rm.myRoom = new rm.myRoom(room);
    let targets: Structure[] = myRoom.myStructures.filter((structure: StructureContainer) => {
      return ((structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE)
        && _.sum(structure.store) < structure.storeCapacity);
    });

    // if we can't find any storage containers, use either the extension or spawn.
    if (targets.length === 0) {
      targets = myRoom.myStructures.filter((structure: StructureExtension) => {
        return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity);
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
  export function getDropOffPoint(room: Room): Spawn | Container | Storage | Extension | Tower {
    let myRoom: rm.myRoom = new rm.myRoom(room);
    let targets: Spawn[] | Container[] | Storage[] | Extension[] = <Spawn []> myRoom.myStructures.filter((structure) => {
      if (structure instanceof Spawn) {
        return ((structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity);
      }
    });

    // If the spawn is full, we'll find any extensions/towers.
    if (targets.length === 0) {
      targets = <Extension []> myRoom.myStructures.filter((structure) => {
        if (structure instanceof StructureExtension) {
          return ((structure.structureType === STRUCTURE_EXTENSION)
            && structure.energy < structure.energyCapacity);
        }
      });
    }

    // Or if that's filled as well, look for towers.
    if (targets.length === 0) {
      targets = <Tower []> myRoom.myStructures.filter((structure: StructureTower) => {
        return ((structure.structureType === STRUCTURE_TOWER)
          && structure.energy < structure.energyCapacity - (structure.energyCapacity * 0.5));
      });
    }

    // Or, look for containers.
    if (targets.length === 0) {
      targets = <Container []> myRoom.myStructures.filter((structure: StructureStorage) => {
        return ((structure.structureType === STRUCTURE_CONTAINER) && _.sum(structure.store) < structure.storeCapacity);
      });
    }
    // Otherwise, look for storage.
    if (targets.length === 0) {
      targets = <Storage []> myRoom.myStructures.filter((structure: StructureStorage) => {
        return ((structure.structureType === STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity);
      });
    }
    return targets[0];
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
