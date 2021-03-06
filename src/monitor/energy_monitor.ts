/// <reference path="./../_reference.ts" />

export class EnergyMonitor {
    private historySize = 100;
    public getRoomEnergy(room: Room) {
        let creepEnergy = room.find<Creep>(FIND_MY_CREEPS, {
            filter: (creep: Creep) => {
                return creep.carry[RESOURCE_ENERGY] > 0;
            }
        }).reduce((total, creep) => total + creep.carry[RESOURCE_ENERGY], 0);
        let usableEnergy = room.find<StructureExtension | StructureSpawn>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION;
            }
        }).reduce((total, structure) => total + structure.energy, 0);
        let storedEnergy = room.find<StructureContainer | StructureStorage>(FIND_MY_STRUCTURES, {
            filter: (structure: Structure) => {
                return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
            }
        }).reduce((total, structure) => total + structure.store[RESOURCE_ENERGY], 0);
        return creepEnergy + usableEnergy + storedEnergy;
    }
    public recordRoom(room: Room) {
        if (room._memory().energy == null) {
            room._memory().energy = {history: []};
        }
        room._memory().energy.history.push(this.getRoomEnergy(room));
        if (room._memory().energy.history.length > this.historySize) {
            room._memory().energy.history = room._memory().energy.history.slice(0, this.historySize - 1);
        }

    }
    public getRoomAverage(room: Room) {
        return Math.sqrt(room._memory().energy.history.reduce((total, historicalEnergy) =>
            total * historicalEnergy, 1));
    }
    public run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            this.recordRoom(room);
        }
    }
}