export type Direction = 'up' | 'down' | 'left' | 'right';

export type Point = {
  x: number;
  y: number;
};

export type GameState = {
  snake: Point[];
  direction: Direction;
  pendingDirection: Direction;
  targetCell: Point | null;
  targetLetterIndex: number;
  completedCycles: number;
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
  rng: () => number = Math.random,
): GameState {
  const head = {
    x: Math.floor(gridSize / 2),
    y: Math.floor(gridSize / 2),
  };

  const snake = [head, { x: head.x - 1, y: head.y }];

  return {
    snake,
    direction: 'right',
    pendingDirection: 'right',
    targetCell: placeTargetCell(snake, gridSize, rng),
    targetLetterIndex: 0,
    completedCycles: 0,
    score: 0,
    gameOver: false,
  };
}

export function getTargetLetter(targetLetterIndex: number): string {
  const normalizedIndex = ((targetLetterIndex % ALPHABET.length) + ALPHABET.length) % ALPHABET.length;
  return ALPHABET[normalizedIndex];
}

export function placeTargetCell(
  snake: Point[],
  gridSize = DEFAULT_GRID_SIZE,
  rng: () => number = Math.random,
): Point | null {
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

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
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
  questionFormat: 'sequential' | 'random' = 'sequential',
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

  const ateTarget =
    state.targetCell !== null &&
    nextHead.x === state.targetCell.x &&
    nextHead.y === state.targetCell.y;

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
  let nextTargetCell = state.targetCell;
  let nextScore = state.score;

  if (ateTarget) {
    const isCycleCompleted = state.targetLetterIndex === ALPHABET.length - 1;
    if (questionFormat === 'random') {
      nextTargetLetterIndex = Math.floor(rng() * ALPHABET.length);
    } else {
      nextTargetLetterIndex = (state.targetLetterIndex + 1) % ALPHABET.length;
    }
    nextCompletedCycles = isCycleCompleted ? state.completedCycles + 1 : state.completedCycles;
    nextTargetCell = placeTargetCell(nextSnake, gridSize, rng);
    nextScore += 1;
  }

  return {
    snake: nextSnake,
    direction: state.pendingDirection,
    pendingDirection: state.pendingDirection,
    targetCell: nextTargetCell,
    targetLetterIndex: nextTargetLetterIndex,
    completedCycles: nextCompletedCycles,
    score: nextScore,
    gameOver: nextTargetCell === null,
  };
}
