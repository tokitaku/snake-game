import type { DummyCount, GameSettings } from '@/features/snake-game/model/settings';
import { DEFAULT_SETTINGS } from '@/features/snake-game/model/settings';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type Point = {
  x: number;
  y: number;
};

export type FoodKind = 'target' | 'dummy';

export type FoodItem = {
  cell: Point;
  letter: string;
  kind: FoodKind;
};

export type GameState = {
  snake: Point[];
  direction: Direction;
  pendingDirection: Direction;
  foods: FoodItem[];
  targetLetterIndex: number;
  completedCycles: number;
  dummyCount: DummyCount;
  score: number;
  gameOver: boolean;
};

export const DEFAULT_GRID_SIZE = 20;
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function createInitialState(
  gridSize = DEFAULT_GRID_SIZE,
  settings: GameSettings = DEFAULT_SETTINGS,
  rng: () => number = Math.random,
): GameState {
  const head = {
    x: Math.floor(gridSize / 2),
    y: Math.floor(gridSize / 2),
  };

  const snake = [head, { x: head.x - 1, y: head.y }];
  const foods = placeFoods(snake, 0, settings.dummyCount, gridSize, rng);

  return {
    snake,
    direction: 'right',
    pendingDirection: 'right',
    foods: foods ?? [],
    targetLetterIndex: 0,
    completedCycles: 0,
    dummyCount: settings.dummyCount,
    score: 0,
    gameOver: foods === null,
  };
}

export function getTargetLetter(targetLetterIndex: number): string {
  const normalizedIndex =
    ((targetLetterIndex % ALPHABET.length) + ALPHABET.length) % ALPHABET.length;
  return ALPHABET[normalizedIndex];
}

function getFreeCells(snake: Point[], gridSize = DEFAULT_GRID_SIZE): Point[] {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells: Point[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  return freeCells;
}

function takeRandomItem<T>(items: T[], rng: () => number): T | null {
  if (items.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * items.length);
  const [selected] = items.splice(index, 1);
  return selected;
}

export function placeTargetCell(
  snake: Point[],
  gridSize = DEFAULT_GRID_SIZE,
  rng: () => number = Math.random,
): Point | null {
  const freeCells = getFreeCells(snake, gridSize);
  return takeRandomItem(freeCells, rng);
}

export function placeFoods(
  snake: Point[],
  targetLetterIndex: number,
  dummyCount: DummyCount,
  gridSize = DEFAULT_GRID_SIZE,
  rng: () => number = Math.random,
): FoodItem[] | null {
  const freeCells = getFreeCells(snake, gridSize);
  const targetCell = takeRandomItem(freeCells, rng);

  if (targetCell === null) {
    return null;
  }

  const targetLetter = getTargetLetter(targetLetterIndex);
  const foods: FoodItem[] = [
    {
      cell: targetCell,
      letter: targetLetter,
      kind: 'target',
    },
  ];

  const dummyLetters = ALPHABET.split('').filter((letter) => letter !== targetLetter);

  for (let index = 0; index < dummyCount; index += 1) {
    const dummyCell = takeRandomItem(freeCells, rng);
    const dummyLetter = takeRandomItem(dummyLetters, rng);

    if (dummyCell === null || dummyLetter === null) {
      break;
    }

    foods.push({
      cell: dummyCell,
      letter: dummyLetter,
      kind: 'dummy',
    });
  }

  return foods;
}

export function setDirection(state: GameState, nextDirection: Direction): GameState {
  if (OPPOSITE_DIRECTIONS[nextDirection] === state.direction) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function stepGame(
  state: GameState,
  gridSize = DEFAULT_GRID_SIZE,
  rng: () => number = Math.random,
): GameState {
  if (state.gameOver) {
    return state;
  }

  const move = DIRECTION_VECTORS[state.pendingDirection];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + move.x,
    y: head.y + move.y,
  };

  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= gridSize;

  if (outOfBounds) {
    return {
      ...state,
      gameOver: true,
    };
  }

  const hitFood =
    state.foods.find(
      (food) => nextHead.x === food.cell.x && nextHead.y === food.cell.y,
    ) ?? null;
  const ateTarget = hitFood?.kind === 'target';
  const hitDummy = hitFood?.kind === 'dummy';

  if (hitDummy) {
    return {
      ...state,
      gameOver: true,
    };
  }

  // 食べていないときは末尾が移動するため、衝突判定から末尾を除外する。
  const bodyToCheck = ateTarget ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
  );

  if (hitSelf) {
    return {
      ...state,
      gameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!ateTarget) {
    nextSnake.pop();
  }

  let nextTargetLetterIndex = state.targetLetterIndex;
  let nextCompletedCycles = state.completedCycles;
  let nextFoods = state.foods;
  let nextScore = state.score;

  if (ateTarget) {
    const isCycleCompleted = state.targetLetterIndex === ALPHABET.length - 1;
    nextTargetLetterIndex = (state.targetLetterIndex + 1) % ALPHABET.length;
    nextCompletedCycles = isCycleCompleted ? state.completedCycles + 1 : state.completedCycles;
    nextFoods = placeFoods(nextSnake, nextTargetLetterIndex, state.dummyCount, gridSize, rng) ?? [];
    nextScore += 1;
  }

  return {
    snake: nextSnake,
    direction: state.pendingDirection,
    pendingDirection: state.pendingDirection,
    foods: nextFoods,
    targetLetterIndex: nextTargetLetterIndex,
    completedCycles: nextCompletedCycles,
    dummyCount: state.dummyCount,
    score: nextScore,
    gameOver: ateTarget && nextFoods.length === 0,
  };
}
