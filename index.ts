export interface ILoopItem {
  readonly id: string;
  handleInput(): Promise<void>;
  update(elapsedMilliseconds: number): Promise<void>;
  render(): Promise<void>;
}

export type LoopState = "Looping" | "Paused" | "Unknown";

export interface IGameLoop {
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

export class GameLoop implements IGameLoop {
  private items: ILoopItem[] = [];
  private isPaused = false;
  private isLooping = false;
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
      Promise.resolve(this.loop());
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
    if (this.isLooping) {
      return;
    }
    this.isPaused = false;
    this.lastUpdateTime = this.getCurrentTime();
    this.isLooping = true;
    Promise.resolve(this.loop());
  }
  
  public pause(): void {
    this.isPaused = true;
  }

  public unpause(): void {
    this.isPaused = false;
    Promise.resolve(this.loop());
  }

  public end(): void {
    this.lastUpdateTime = 0;
    this.isLooping = false;
    this._state = "Unknown";
  }

  async loop(): Promise<void> {
    if (!this.isLooping) return;

    const now = this.getCurrentTime();
    const elapsedTime = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    await this.input()
    await this.update(elapsedTime);
    await this.render();

    if (this.isPaused) return;

    let waitTime = this.tickRate - elapsedTime;
    if (waitTime < 0) {
      waitTime = 0;
    }
    setTimeout(this.loop, waitTime);
  }

  private async input(): Promise<void> {
    await Promise.all(this.items.map(i => i.handleInput));
  }

  private async update(elapsedMilliseconds: number): Promise<void> {
    for (const item of this.items) {
      await item.update(elapsedMilliseconds);
    }
  }

  private async render(): Promise<void> {
    for (const item of this.items) {
      await item.render();
    }
  }

  private getCurrentTime(): number {
    return Date.now();
  }
}

// Lifted from: https://stackoverflow.com/a/8809472
export function generateID(): string {
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