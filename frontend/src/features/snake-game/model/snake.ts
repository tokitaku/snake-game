export type Direction = 'up' | 'down' | 'left' | 'right';

export type Point = {
  x: number;
  y: number;
};

export type GameState = {
  snake: Point[];
  direction: Direction;
  pendingDirection: Direction;
  food: Point | null;
  score: number;
  gameOver: boolean;
};

export const DEFAULT_GRID_SIZE = 20;

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
    food: placeFood(snake, gridSize, rng),
    score: 0,
    gameOver: false,
  };
}

export function placeFood(
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

  const ateFood =
    state.food !== null &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y;

  // 食べていないときは末尾が移動するため、衝突判定から末尾を除外する。
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
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

  if (!ateFood) {
    nextSnake.pop();
  }

  const nextFood = ateFood ? placeFood(nextSnake, gridSize, rng) : state.food;

  return {
    snake: nextSnake,
    direction: state.pendingDirection,
    pendingDirection: state.pendingDirection,
    food: nextFood,
    score: ateFood ? state.score + 1 : state.score,
    gameOver: nextFood === null,
  };
}
