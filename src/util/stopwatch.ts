/// <reference path="./../_reference.ts" />

export class Stopwatch  {
    private _usedOnStart;
    get usedCpu(){
        if (!this._usedOnStart){
            return 0;
        }
        return Game.cpu.getUsed() - this._usedOnStart;
    };
    public restart(){
        this._usedOnStart = Game.cpu.getUsed(); 
    }
}