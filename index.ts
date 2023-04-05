interface ILoopItem {
  readonly id: string;
  handleInput(): void;
  update(elapsedMilliseconds: number): void;
  render(): void;
  isFinished(): boolean;
}

type LoopState = "Looping" | "Paused" | "Unknown";

interface IGameLoop {
  readonly state: LoopState;
  addItem(item: ILoopItem): void;
  getItem(id: string): ILoopItem | undefined;
  removeItem(id: string): ILoopItem | undefined;
  start(): void;
  pause(): void;
  unpause(): void;
  end(): void;
  setFPS(milliseconds: number): void;
}

class GameLoop implements IGameLoop {
  private items: ILoopItem[] = [];
  private lastUpdateTime: number;
  private tickRate: number = 66;

  private _state: LoopState = "Unknown";
  get state(): LoopState {
    return this._state;
  };

  constructor() {
    this.lastUpdateTime = performance.now();
    this.setFPS(15);
  }

  public setFPS(milliseconds: number): void {
    this.tickRate = Math.max(1000 / milliseconds, 0.000001);
  }

  public addItem(item: ILoopItem): void {
    this.items.push(item);
    if (this.items.length === 1) {
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
  
  public start(): void {
    if (this.state === "Looping") return;
    this._state = "Looping"
    this.lastUpdateTime = Date.now();
    this.loop();
  }
  
  public pause(): void {
    this._state = "Paused";
  }

  public unpause(): void {
    this._state = "Looping";
    this.lastUpdateTime = Date.now();
    this.loop();
  }

  public end(): void {
    this.lastUpdateTime = 0;
    this._state = "Unknown";
  }

  loop(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    this.input()
    this.update(elapsedTime);
    this.render();

    if (this.state !== "Looping" || this.items.length === 0) return;

    let waitTime = this.tickRate - elapsedTime;
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

// Lifted from: https://stackoverflow.com/a/8809472
function generateID(): string {
  let
    d = new Date().getTime(),
    d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
};

export {
  generateID,
  GameLoop,
  IGameLoop,
  ILoopItem,
  LoopState
}