/// <reference path="./../_reference.ts" />

export class Cache {
    private _cacheMap;
    private randomId;
    constructor() {
        this._cacheMap = {};
        this.randomId = parseInt("" + (Math.random() * (10000 + (Math.random() * 50))), 10);
    }

    public get(key) {
        return this._cacheMap[key + "_" + this.randomId];
    }

    public set(key, value) {
        this._cacheMap[key + "_" + this.randomId] = value;

        return this.get(key);
    }

    public forget(key) {
        delete this._cacheMap[key + "_" + this.randomId];
    }

    public remember(key, callback, ...args) {
        let value = this.get(key);

        if (value === undefined) {
            return this.set(key, callback.apply(null, args));
        }

        return value;
    }

    public memoryGet(key) {
        return Memory[key];
    }

    public memorySet(key, value) {
        Memory[key] = value;

        return this.get(key);
    }

    public memoryForget(key) {
        delete Memory[key];
    }

    public memoryRemember(key, callback, ...args) {
        let value = this.get(key);

        if (value === undefined) {
            return this.set(key, callback.apply(null, args));
        }

        return value;
    }
}
