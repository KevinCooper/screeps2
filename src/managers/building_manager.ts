/// <reference path="./../_reference.ts" />
import util = require("./../util/util");
import {myRoom} from "./../models/my_room";

export class BuildingManager {
    private room: myRoom = null;
    private controller: Controller = null;
    private _mem: RoomBuildingManagerMemory = null;
    constructor(room: Room) {
        this.room = new myRoom(room);
        this._mem = this.room._memory.buildings;
        if (this._mem == null) {
            this.room._memory.buildings = {
                capturable : false,
                captured : false,
                enemy: false,
                level : 0,
                roads: false,
            };
            this._mem = this.room._memory.buildings;
            this.controller = this.room.room.controller;
            if (this.controller !== undefined && this.controller.my) {
                this._mem.captured = true;
                this._mem.level = this.controller.level;
            }
            if (this.controller !== undefined && !this.controller.my &&
                        this.controller.isActive && this.controller.level > 0) {
                this._mem.enemy = true;
            }
            if (this.controller !== undefined && !this.controller.my && this.controller.isActive) {
                this._mem.capturable = true;
            }
        }
    }

    public buildRoads() {
        let numConstructionSites = this.room.constructionSites;
        let spawn = this.room.mySpawns[0];

        if (!this._mem.roads) {
            this._mem.roads = !this._mem.roads;
            // Get all sources in the room
            let goals = _.map(spawn.room.find<Source>(FIND_SOURCES), function(source) {
                // We can't actually walk on sources-- set `range` to 1 so we path 
                // next to it.
                return { pos: source.pos, range: 1 };
            });
            // Put road construction sites from the intial spawn to the sources.
            for (let source of goals) {
                let ret = PathFinder.search(spawn.pos, source.pos);
                for (let i of ret.path) {
                    this.room.room.createConstructionSite(i, STRUCTURE_ROAD)
                }
            }

            // Build path from spawn to controller
            let ret = PathFinder.search(spawn.pos, this.room.room.controller.pos);
            for (let i of ret.path) {
                this.room.room.createConstructionSite(i, STRUCTURE_ROAD)
            }
        }
    }
}
