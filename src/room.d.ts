interface Room {
    _memory(): RoomMemory;
    /**
     * Gets a cost matrix that includes buildings and construction sites
     */
    getCostMatrix(): CostMatrix;
}

interface RoomMemory {
    energy?: RoomEnergyMonitorMemory;
    info?: RoomManagerMemory;
}

interface RoomEnergyMonitorMemory {
    history: number[];
}
interface RoomManagerMemory {
    suppliers: number;
    supplyEnergy: number;
    consumers: number;
    consumerEnergy: number;
    upgraders: number;
    upgradeEnergy: number;
    numSources : number;
    miners : number;
}
