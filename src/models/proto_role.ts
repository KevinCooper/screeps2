/// <reference path="./../_reference.ts" />

import * as cc from "./../util/calc_cost";
import {myRoom} from "./../models/my_room";
import util = require("./../util/util");
let MAX_PARTS = 30;

export class ProtoRole {
    protected creepMemory: CreepMemory;
    protected _cache;
    protected baseParts: Array<string>;
    protected upgradeMove = true;
    constructor(protected creep: Creep, protected energySources?: Structure[]) {
        if (energySources) {
            this.energySources = energySources;
        }
        if (_.isObject(creep)) {
            this.creepMemory = creep.memory;
        }
        this._cache = {};
    }

    public reset() {
        this.creep = null;
        this._cache = {};
    }

    public setCreep(creep: Creep) {
        this.creep = creep;
    }

    get room(){
        return new myRoom(this.creep.room);
    }

    public run() {
        if (this.creep.memory.onStarted === undefined) {
            this.onStart();
            this.creep.memory.onStarted = true;
        }

        if (this.creep.memory.onSpawned === undefined && !this.creep.spawning) {
            this.onSpawn();
            this.creep.memory.onSpawned = true;
        }

        if (this.creep.ticksToLive === 2) {
            this.onDeath();
            this.beforeAge();
        }

        if (!this.creep.spawning) {
            this.action();
        }
    }

    public getParts(maxEnergy: number) {
        if (maxEnergy === undefined) {
            maxEnergy = 300;
        }

        let baseBody: string[] = [];
        baseBody = baseBody.concat(this.baseParts);


        for (let i = 0; i < Math.floor(this.baseParts.length / 2.0) ; i++) {
            baseBody.push(MOVE);
        }


        let times = Math.floor(maxEnergy / cc.calcCost(baseBody));

        if (times * baseBody.length > MAX_PARTS) {
            times = Math.floor (MAX_PARTS / baseBody.length);
        }else if (times === 0) {
            return [];
        }

        let finalBody: string[] = [];
        for (let i = 0; i < times; i++) {
            finalBody = finalBody.concat(baseBody);
        }

        console.log ("    ---------------");
        console.log ("    baseBody cost: "  + cc.calcCost(baseBody));
        console.log ("    maximum energy: " + maxEnergy);
        console.log ("    finalBody: "      + finalBody);
        console.log ("    ---------------");
        return finalBody;
    }

    public action() {
        console.log ("Base class action called.");
    }
    public onStart() {
        console.log ("Base class onStart called.");
    }
    public onSpawn() {
        console.log ("Base class onSpawn called.");
    }
    public beforeAge() {
        console.log ("Base class beforeAge called.");
    }
    public onDeath() {
        console.log ("Base class onDeath called.");
    }

    public routeCreep(target : Creep | Structure | ConstructionSite | Source) {
        let creep: Creep = this.creep;
        if (creep.fatigue > 0 || ! target) {
            return -1;
        }
        let targetId = target.id;
        let posStr = creep.room.name + "." + creep.pos.x + "." + creep.pos.y;
        let routeCache = Memory["routeCache"] = Memory["routeCache"] || {};

        if (routeCache[targetId]) {

            let curr: RoomPosition = target.pos;
            let last: RoomPosition = routeCache[targetId].lastPostition;
            if (last && (curr.x !== last.x || curr.y !== last.y || curr.roomName !== last.roomName)) {
                delete routeCache[targetId];
            }
        }
        routeCache[targetId] = routeCache[targetId] ||
            {
                origins : {},
                lastPosition :
                {
                    x : target.pos.x,
                    y : target.pos.y,
                    roomName : target.pos.roomName,
                },
                established : Game.time,
            };
        routeCache [targetId].lastPosition = target.pos;
        if (!routeCache[targetId].origins[posStr]) {
            routeCache[targetId].origins[posStr] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
            let path = creep.room.findPath (creep.pos, target.pos, { maxOps: 500, heuristicWeight: 2 });
            // If path found, fill the cache with it
            if (path && path.length) {
                routeCache [targetId].origins[posStr][path[0].direction] += 1;
                for (let i = 0; i < path.length - 1; i++) {
                    let step = path [i];
                    let stepStr = creep.room.name + "." + step.x + "." + step.y;
                    routeCache [targetId].origins [stepStr] = routeCache [targetId].origins [stepStr] || 
                        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
                    routeCache [targetId].origins [stepStr] [path [i + 1].direction] += 1;
                }
            // Otherwise pick random direction
            }else {
                let dir = Math.floor (Math.random () * 8);
                return creep.move (dir); ;
            }
        }
        //console.log("4");
        let total = 0;
        //pick from the weighted list of steps
        for (let d in routeCache [targetId].origins [posStr]) {
            total +=  routeCache [targetId].origins [posStr] [d];
        }
        total *= Math.random();
        let dir;
        for (let d in routeCache [targetId].origins [posStr]) {
            total -=  routeCache [targetId].origins [posStr] [d];
            if (total < 0)
            {
                dir = d;
                break;
            }
        }

        if (creep.pos.getRangeTo(target) > 1 && util.isPathBlocked (creep.pos, dir)) {
            dir = Math.floor (Math.random() * 8);
        }
        return creep.move(+dir);
    }

    public moveTo(target: Creep | Structure | ConstructionSite | Source) {
        if (target.pos !== undefined) {
            this.routeCreep(target);
        }else {
            debugger;
            console.log("ProtoRole.moveTo: RoomPosition given. Cannot use advanced caching, using built-in moveTo...");
            this.creep.moveTo (target, { reusePath : 5 });
        }
    }

    public moveAndPerform(target: Creep | Structure | ConstructionSite | Source, action : any) {
        if (typeof action !== "function") {
            throw new Error("role_prototype.moveAndPerform: 'action' is not a function!");
        }
        let creep = this.creep;
        if (!creep.pos.isNearTo(target)) {
            this.moveTo(target);
        }else {
            action.call(creep, target);
        }
    }

    public moveAndTransfer(target: Creep, cacheRoute: boolean ) {
        let creep = this.creep;
        if (!creep.pos.isNearTo(target) && cacheRoute) {
            this.moveTo(target);
        }else if (!creep.pos.isNearTo(target) && !cacheRoute) {
            this.creep.moveTo(target);
        }else{
            creep.transfer(target, RESOURCE_ENERGY);
        }
    }

    public getClosest<T>(type: number, opts: any) {
        if (opts !== undefined || typeof opts === "array") {
            return this.creep.pos.findClosestByRange<T>(type, opts);
        }
        if (this._cache[type]) {
            return this._cache[type];
        }

        this._cache[type] = this.creep.pos.findClosestByRange<T>(type);
        return this._cache[type];
    }

    public rest(civilian: boolean) {
        let creep: Creep = this.creep;

        let distance: number = 4;
        let restTarget: Flag = null;
        let flags = Object.keys(Game.flags);
        if (civilian) {
            for (let i of flags){
                let flag: Flag = Game.flags[i];
                if (flag.color === COLOR_WHITE &&
                        (creep.pos.inRangeTo(flag.pos, distance) || creep.pos.getRangeTo(flag) > 0)) {
                    restTarget = flag;
                    break;
                }
                if (!restTarget) {
                    // let temp = new myRoom(creep.room);
                    restTarget = this.getClosest(FIND_MY_SPAWNS, undefined);
                }
            }
        }else {
            for (let i of flags){
                let flag: Flag = Game.flags[i];
                if (flag.color === COLOR_RED &&
                        (creep.pos.inRangeTo(flag.pos, distance) || creep.pos.getRangeTo(flag) > 0)) {
                    restTarget = flag;
                    break;
                }
            }
        }

        //TODO: Use optomized move instead of A* move
        if (restTarget) {
            this.creep.moveTo(restTarget);
        }
    }

    public getRangedTarget(): Creep | Structure {
        let creep = this.creep;
        let creeproom = new myRoom(creep.room);
        let hostiles = creeproom.hostileCreeps.filter(util.notSourceKeeper);
        if (hostiles && hostiles.length) {
            if(Game.getObjectById<Structure>("578c3dbcf783f31624b45c04") !== null){
                return Game.getObjectById<Structure>("578c3dbcf783f31624b45c04");
            }

            let badSpawns = creeproom.room.find<Spawn>(FIND_HOSTILE_SPAWNS);
            if(badSpawns && badSpawns.length) {
                return badSpawns[0];
            }
            //return null;
            hostiles.sort(function(a, b){
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            });
            let closeEnemies: Creep[] = hostiles.filter(util.isInRangedAttackRange, this);
            if (closeEnemies && closeEnemies.length) {
                //let closeArchers = closeEnemies.filter(util.isArcher);
                //if (closeArchers.length) {
                //    return closeArchers[0];
                //}
                //let closeMobileMelee = closeEnemies.filter(util.isMobileMelee);
                //if (closeMobileMelee.length) {
                //    return closeMobileMelee[0];
                //}
                //let closeMobileHealers = closeEnemies.filter(util.isMobileHealer);
                //if (closeMobileHealers.length) {
                //    return closeMobileHealers[0];
                //}
                return closeEnemies[0];
            }
            return hostiles[0];
        }
        return null;
    }

    public rangedAttack(target : Creep | Structure) : Creep | Structure {
        let creep = this.creep;
        if (!target) {
            target = this.getRangedTarget();
        }
        if (target) {
            if (target.pos.inRangeTo(creep.pos, 3)) {
                creep.rangedAttack(target);
                return target;
            }
        }
        return null;
    }

    public moveAwayFrom(target: Creep | Structure) {
        let creep = this.creep;
        let longest : RoomPosition;
        let longVal = -1;
        let badPos = target.pos;
        for (let x = -1; x <= 1; x++){
            for (let y = -1; y <= 1; y++){
                let temp = new RoomPosition(creep.pos.x + x , creep.pos.y + y, creep.room.name);
                if ( temp.getRangeTo(badPos) >  longVal  ) {// &&
                    if (temp.lookFor<Number>(LOOK_TERRAIN) &&
                        temp.lookFor<Number>(LOOK_TERRAIN)[0] !== TERRAIN_MASK_WALL){
                        longVal = temp.getRangeTo(badPos);
                        longest = temp;
                    }
                }
            }
        }
        creep.move(creep.pos.getDirectionTo(longest.x, longest.y));
        //console.log("5");
    }

    public keepAwayFromEnemies() {
        let creep = this.creep;
        let target = this.getClosest(FIND_HOSTILE_CREEPS, undefined);
        if (target !== null && target.pos.inRangeTo(creep.pos, 3)) {
            this.moveAwayFrom(target);
        }
    }

    public kite(target : Creep | Structure) : boolean {
        let creep = this.creep;
        if (target.pos.getRangeTo(creep.pos) <= 2) {
            this.moveAwayFrom(target)
            return true;
        }else if (target.pos.inRangeTo(creep.pos, 3)) {
            return true;
        }else {
            this.creep.moveTo(target);
            return true;
        }
    }
}


