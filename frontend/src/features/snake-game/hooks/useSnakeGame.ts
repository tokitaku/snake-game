import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import {
  createInitialState,
  DEFAULT_GRID_SIZE,
  getTargetLetter,
  setDirection,
  stepGame,
  type Direction,
  type GameState,
} from '@/features/snake-game/model/snake';
import {
  DEFAULT_SETTINGS,
  SPEED_VALUES,
  type GameSettings,
} from '@/features/snake-game/model/settings';

type UseSnakeGameResult = {
  gameState: GameState;
  settings: GameSettings;
  hasStarted: boolean;
  isPaused: boolean;
  isSettingsOpen: boolean;
  nextLetter: string;
  statusMessage: string;
  applyDirection: (direction: Direction) => void;
  restartGame: () => void;
  togglePause: () => void;
  startIfNeeded: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  saveSettings: (settings: GameSettings) => void;
};

export function useSnakeGame(gridSize = DEFAULT_GRID_SIZE): UseSnakeGameResult {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(gridSize, DEFAULT_SETTINGS),
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    setGameState(createInitialState(gridSize, settings));
    setHasStarted(true);
    setIsPaused(false);
  }, [gridSize, settings]);

  const togglePause = useCallback(() => {
    if (!hasStarted || gameState.gameOver) {
      return;
    }

    setIsPaused((previousValue) => !previousValue);
  }, [gameState.gameOver, hasStarted]);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (isSettingsOpen) {
      return;
    }

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

    const tickMs = SPEED_VALUES[settings.speed];

    // 現在の state を使って進行するため、更新関数の形で tick を適用する。
    const timer = window.setInterval(() => {
      setGameState((previousState) => stepGame(previousState, gridSize));
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [gridSize, isRunning, settings.speed]);

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

  const nextLetter = getTargetLetter(gameState.targetLetterIndex);

  const saveSettings = useCallback((nextSettings: GameSettings) => {
    setSettings(nextSettings);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
    setIsPaused(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return {
    gameState,
    settings,
    hasStarted,
    isPaused,
    isSettingsOpen,
    nextLetter,
    statusMessage,
    applyDirection,
    restartGame,
    togglePause,
    startIfNeeded,
    openSettings,
    closeSettings,
    saveSettings,
  };
}
