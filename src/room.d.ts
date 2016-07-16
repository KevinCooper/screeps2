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
    building?: RoomBuildingManagerMemory
}

interface RoomBuildingManagerMemory {
    capturable: boolean,
    captured: boolean,
    enemy: boolean,
    level: number,
    roads: boolean,
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
    minerHelpers : number;
    neededMinerHelpers : number;
}
