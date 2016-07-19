/// <reference path="./../_reference.ts" />

import {ProtoRole} from "./proto_role";
import {myRoom} from "./../models/my_room";


export default class Tower extends StructureTower {
  public performRole() {
    let room = new myRoom(this.room);
    if (room.hostileCreeps && room.hostileCreeps.length && this.energy > 0) {
      this.attack(this.pos.findClosestByRange(room.hostileCreeps));
    } else if (this.energy > this.energyCapacity / 2) {
      const buildings = room.damageBuildings.sort((buildingA, buildingB) => (buildingA.hits - buildingB.hits));
      if (buildings.length) {
        this.repair(buildings[0]);
      }
    }
  }
}