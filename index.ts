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

class GameLoop implements IGameLoop {
  private items: ILoopItem[] = [];
  private lastUpdateTime: number = 0;

  public fps: number = 15;

  private _state: LoopState = "Looping";
  get state(): LoopState {
    return this._state;
  };

  public addItem(item: ILoopItem): void {
    this.items.push(item);
    if (this.items.length === 1) {
      this.lastUpdateTime = performance.now();
      this.loop();
    }
  }

  public getItem(id: string): ILoopItem | undefined {
    return this.items.find(i => i.id === id);
  }

  public removeItem(id: string): ILoopItem | undefined {
    let item = this.getItem(id);
    this.items = this.items.filter(v => v.id !== id);
    return item;
  }

  public pause(): void {
    this._state = "Paused";
  }

  public unpause(): void {
    this._state = "Looping";
    this.lastUpdateTime = Date.now();
    this.loop();
  }

  loop(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    this.input()
    this.update(elapsedTime);
    this.render();

    if (this.state !== "Looping" || this.items.length === 0) return;

    let waitTime = (1000 / Math.max(this.fps, 0.000001)) - elapsedTime;
    if (waitTime < 0) {
      waitTime = 0;
    }
    setTimeout(() => this.loop(), waitTime);
  }

  private input(): void {
    this.items.map(i => i.handleInput());
  }

  private update(elapsedMilliseconds: number): void {
    this.items.map(i => i.update(elapsedMilliseconds));
    this.items = this.items.filter(item => !item.isFinished())
  }

  private render(): void {
    this.items.map(i => i.render());
  }
}


export {
  GameLoop,
  IGameLoop,
  ILoopItem,
  LoopState
}