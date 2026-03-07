import { useCallback, useEffect } from 'react';
import { useHighScore } from '@/features/high-score';
import {
  DEFAULT_GRID_SIZE,
  GameBoard,
  GameControls,
  GameOverlay,
  MobileDirectionPad,
  useSnakeGame,
} from '@/features/snake-game';

function App() {
  const { gameState, hasStarted, isPaused, statusMessage, applyDirection, restartGame, togglePause, startIfNeeded } =
    useSnakeGame(DEFAULT_GRID_SIZE);
  const { highScore, apiError, submitScore } = useHighScore();

  const handlePauseButton = useCallback(() => {
    if (!hasStarted) {
      startIfNeeded();
      return;
    }

    togglePause();
  }, [hasStarted, startIfNeeded, togglePause]);

  useEffect(() => {
    if (!hasStarted || !gameState.gameOver) {
      return;
    }

    void submitScore(gameState.score);
  }, [gameState.gameOver, gameState.score, hasStarted, submitScore]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-stone-900">
      <section className="rounded-lg border border-stone-300 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <GameControls
          score={gameState.score}
          highScore={highScore}
          isPaused={isPaused}
          onRestart={restartGame}
          onPauseToggle={handlePauseButton}
        />

        <div className="relative mt-4 flex justify-center">
          <GameBoard
            snake={gameState.snake}
            food={gameState.food}
            gridSize={DEFAULT_GRID_SIZE}
          />
          <GameOverlay
            visible={!hasStarted || gameState.gameOver || isPaused}
            message={statusMessage}
          />
        </div>

        <MobileDirectionPad onDirection={applyDirection} />

        <p className="mt-4 text-sm text-stone-600">
          操作: Arrow keys / WASD / Space。{apiError ? `API: ${apiError}` : 'API接続: OK'}
        </p>
      </section>
    </main>
  );
}

export default App;
