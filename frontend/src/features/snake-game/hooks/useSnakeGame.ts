import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import {
  createInitialState,
  DEFAULT_GRID_SIZE,
  setDirection,
  stepGame,
  type Direction,
  type GameState,
} from '@/features/snake-game/model/snake';

type UseSnakeGameResult = {
  gameState: GameState;
  hasStarted: boolean;
  isPaused: boolean;
  statusMessage: string;
  applyDirection: (direction: Direction) => void;
  restartGame: () => void;
  togglePause: () => void;
  startIfNeeded: () => void;
};

export function useSnakeGame(
  gridSize = DEFAULT_GRID_SIZE,
  tickMs = 120,
): UseSnakeGameResult {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(gridSize));
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const isRunning = hasStarted && !isPaused && !gameState.gameOver;

  const startIfNeeded = useCallback(() => {
    setHasStarted(true);
    setIsPaused(false);
  }, []);

  const applyDirection = useCallback(
    (direction: Direction) => {
      if (gameState.gameOver) {
        return;
      }

      setGameState((previousState) => setDirection(previousState, direction));
      startIfNeeded();
    },
    [gameState.gameOver, startIfNeeded],
  );

  const restartGame = useCallback(() => {
    setGameState(createInitialState(gridSize));
    setHasStarted(true);
    setIsPaused(false);
  }, [gridSize]);

  const togglePause = useCallback(() => {
    if (!hasStarted || gameState.gameOver) {
      return;
    }

    setIsPaused((previousValue) => !previousValue);
  }, [gameState.gameOver, hasStarted]);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
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
  });

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    // 現在の state を使って進行するため、更新関数の形で tick を適用する。
    const timer = window.setInterval(() => {
      setGameState((previousState) => stepGame(previousState, gridSize));
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [gridSize, isRunning, tickMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const statusMessage = !hasStarted
    ? '矢印キー / WASD / ボタンで開始'
    : gameState.gameOver
      ? 'Game Over'
      : isPaused
        ? 'Paused'
        : 'Playing';

  return {
    gameState,
    hasStarted,
    isPaused,
    statusMessage,
    applyDirection,
    restartGame,
    togglePause,
    startIfNeeded,
  };
}
