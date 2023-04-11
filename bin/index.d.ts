interface ILoopItem {
    readonly id: string;
    handleInput(): void;
    update(elapsedMilliseconds: number): void;
    render(): void;
    isFinished(): boolean;
}
type LoopState = "Looping" | "Paused";
interface IGameLoop {
    readonly state: LoopState;
    fps: number;
    addItem(item: ILoopItem): void;
    getItem(id: string): ILoopItem | undefined;
    removeItem(id: string): ILoopItem | undefined;
    pause(): void;
    unpause(): void;
}
declare class GameLoop implements IGameLoop {
    private items;
    private lastUpdateTime;
    fps: number;
    private _state;
    get state(): LoopState;
    addItem(item: ILoopItem): void;
    getItem(id: string): ILoopItem | undefined;
    removeItem(id: string): ILoopItem | undefined;
    pause(): void;
    unpause(): void;
    loop(): void;
    private input;
    private update;
    private render;
}
export { GameLoop, IGameLoop, ILoopItem, LoopState };
