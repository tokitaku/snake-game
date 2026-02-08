import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchHighScore, submitHighScore } from './lib/api';
import {
  createInitialState,
  DEFAULT_GRID_SIZE,
  setDirection,
  stepGame,
  type Direction,
  type GameState,
} from './lib/snake';

const TICK_MS = 120;

type CellType = 'empty' | 'head' | 'body' | 'food';
type SnakeCellType = 'head' | 'body';

function App() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(DEFAULT_GRID_SIZE),
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const isRunning = hasStarted && !isPaused && !gameState.gameOver;

  useEffect(() => {
    void (async () => {
      try {
        const score = await fetchHighScore();
        setHighScore(score);
        setApiError(null);
      } catch {
        setApiError('バックエンドに接続できません。');
      }
    })();
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setGameState((prev) => stepGame(prev, DEFAULT_GRID_SIZE));
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!hasStarted || !gameState.gameOver || submittedRef.current) {
      return;
    }

    submittedRef.current = true;

    void (async () => {
      try {
        const updated = await submitHighScore(gameState.score);
        setHighScore(updated);
      } catch {
        setApiError('ハイスコア更新に失敗しました。');
      }
    })();
  }, [gameState.gameOver, gameState.score, hasStarted]);

  const startIfNeeded = useCallback(() => {
    setHasStarted(true);
    setIsPaused(false);
  }, []);

  const applyDirection = useCallback(
    (direction: Direction) => {
      if (gameState.gameOver) {
        return;
      }

      setGameState((prev) => setDirection(prev, direction));
      startIfNeeded();
    },
    [gameState.gameOver, startIfNeeded],
  );

  const restartGame = useCallback(() => {
    setGameState(createInitialState(DEFAULT_GRID_SIZE));
    setHasStarted(true);
    setIsPaused(false);
    setApiError(null);
    submittedRef.current = false;
  }, []);

  const togglePause = useCallback(() => {
    if (!hasStarted || gameState.gameOver) {
      return;
    }

    setIsPaused((prev) => !prev);
  }, [gameState.gameOver, hasStarted]);

  const handlePauseButton = useCallback(() => {
    if (!hasStarted) {
      startIfNeeded();
      return;
    }

    togglePause();
  }, [hasStarted, startIfNeeded, togglePause]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === ' ') {
        event.preventDefault();

        if (gameState.gameOver) {
          restartGame();
          return;
        }

        if (!hasStarted) {
          startIfNeeded();
          return;
        }

        togglePause();
        return;
      }

      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        applyDirection('up');
      }

      if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        applyDirection('down');
      }

      if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        applyDirection('left');
      }

      if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        applyDirection('right');
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [applyDirection, gameState.gameOver, hasStarted, restartGame, startIfNeeded, togglePause]);

  const foodKey = gameState.food ? `${gameState.food.x},${gameState.food.y}` : null;

  const snakeCells = useMemo(() => {
    const map = new Map<string, SnakeCellType>();

    gameState.snake.forEach((segment, index) => {
      const key = `${segment.x},${segment.y}`;
      map.set(key, index === 0 ? 'head' : 'body');
    });

    return map;
  }, [gameState.snake]);

  const cells = useMemo(() => {
    return Array.from({ length: DEFAULT_GRID_SIZE * DEFAULT_GRID_SIZE }, (_, i) => {
      const x = i % DEFAULT_GRID_SIZE;
      const y = Math.floor(i / DEFAULT_GRID_SIZE);
      const key = `${x},${y}`;

      let type: CellType = 'empty';
      const snakeType = snakeCells.get(key);

      if (foodKey === key) {
        type = 'food';
      }

      if (snakeType) {
        type = snakeType;
      }

      let className = 'h-4 w-4 border border-stone-200 bg-board sm:h-5 sm:w-5';

      if (type === 'food') {
        className = 'h-4 w-4 border border-stone-200 bg-food sm:h-5 sm:w-5';
      }

      if (type === 'body') {
        className = 'h-4 w-4 border border-stone-200 bg-snake sm:h-5 sm:w-5';
      }

      if (type === 'head') {
        className = 'h-4 w-4 border border-stone-200 bg-snake-head sm:h-5 sm:w-5';
      }

      return <div key={key} className={className} />;
    });
  }, [foodKey, snakeCells]);

  const statusMessage = (() => {
    if (!hasStarted) {
      return '矢印キー / WASD / ボタンで開始';
    }

    if (gameState.gameOver) {
      return 'Game Over';
    }

    if (isPaused) {
      return 'Paused';
    }

    return 'Playing';
  })();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-stone-900">
      <section className="rounded-lg border border-stone-300 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-wide">Snake</h1>
          <p className="ml-auto text-sm text-stone-600">Score: {gameState.score}</p>
          <p className="text-sm text-stone-600">
            High Score: {highScore === null ? '--' : highScore}
          </p>
          <button
            type="button"
            onClick={restartGame}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm hover:bg-stone-200"
          >
            Restart
          </button>
          <button
            type="button"
            onClick={handlePauseButton}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm hover:bg-stone-200"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </header>

        <div className="relative mt-4 flex justify-center">
          <div
            className="grid overflow-hidden rounded border border-stone-300 bg-board"
            style={{ gridTemplateColumns: `repeat(${DEFAULT_GRID_SIZE}, minmax(0, 1fr))` }}
          >
            {cells}
          </div>

          {(!hasStarted || gameState.gameOver || isPaused) && (
            <div className="absolute inset-0 grid place-items-center rounded bg-stone-100/80 text-center">
              <div className="rounded-md border border-stone-300 bg-white px-4 py-3">
                <p className="text-base font-semibold">{statusMessage}</p>
                <p className="mt-1 text-sm text-stone-600">Spaceで開始/一時停止、Game Over時は再開</p>
              </div>
            </div>
          )}
        </div>

        <section className="mt-4 grid gap-2 md:hidden">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => applyDirection('up')}
              className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
            >
              Up
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => applyDirection('left')}
              className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => applyDirection('down')}
              className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => applyDirection('right')}
              className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm"
            >
              Right
            </button>
          </div>
        </section>

        <p className="mt-4 text-sm text-stone-600">
          操作: Arrow keys / WASD / Space。{apiError ? `API: ${apiError}` : 'API接続: OK'}
        </p>
      </section>
    </main>
  );
}

export default App;
