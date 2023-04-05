import { GameLoop, IGameLoop, ILoopItem, LoopState, generateID } from "./index";

describe("GameLoop", () => {
  let gameLoop: IGameLoop;
  let loopItem: ILoopItem;

  beforeEach(() => {
    gameLoop = new GameLoop();
    loopItem = {
      id: generateID(),
      handleInput: jest.fn(),
      update: jest.fn(),
      render: jest.fn(),
      isFinished: jest.fn(() => false),
    };
  });

  afterEach(() => {
    gameLoop.end();
  });

  it("should start the game loop", () => {
    gameLoop.start();
    expect(gameLoop.state).toBe("Looping");
  });

  it("should pause and unpause the game loop", () => {
    gameLoop.start();
    gameLoop.pause();
    expect(gameLoop.state).toBe("Paused");

    gameLoop.unpause();
    expect(gameLoop.state).toBe("Looping");
  });

  it("should add and remove items from the game loop", () => {
    gameLoop.addItem(loopItem);
    expect(gameLoop.getItem(loopItem.id)).toBe(loopItem);

    gameLoop.removeItem(loopItem.id);
    expect(gameLoop.getItem(loopItem.id)).toBeUndefined();
  });

  it("should update and render loop items", () => {
    gameLoop.addItem(loopItem);
    gameLoop.start();

    expect(loopItem.handleInput).toHaveBeenCalled();
    expect(loopItem.update).toHaveBeenCalled();
    expect(loopItem.render).toHaveBeenCalled();
  });

  it("should remove finished loop items", () => {
    loopItem.isFinished = jest.fn(() => true);
    gameLoop.addItem(loopItem);
    gameLoop.start();

    expect(loopItem.isFinished).toHaveBeenCalled();
    expect(gameLoop.getItem(loopItem.id)).toBeUndefined();
  });

  it("should end the game loop", () => {
    gameLoop.start();
    gameLoop.end();
    expect(gameLoop.state).toBe("Unknown");
  });
});