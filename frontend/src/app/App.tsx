import { useCallback, useEffect } from 'react';
import { useHighScore } from '@/features/high-score';
import {
  DEFAULT_GRID_SIZE,
  GameBoard,
  GameControls,
  GameOverlay,
  MobileDirectionPad,
  SettingsModal,
  useSnakeGame,
} from '@/features/snake-game';

function App() {
  const {
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
  } = useSnakeGame(DEFAULT_GRID_SIZE);
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
          nextLetter={nextLetter}
          highScore={highScore}
          hasStarted={hasStarted}
          isPaused={isPaused}
          onOpenSettings={openSettings}
          onRestart={restartGame}
          onPauseToggle={handlePauseButton}
        />

        <div className="relative mt-4 flex justify-center">
          <GameBoard snake={gameState.snake} foods={gameState.foods} gridSize={DEFAULT_GRID_SIZE} />
          <GameOverlay
            visible={!hasStarted || gameState.gameOver || (isPaused && !isSettingsOpen)}
            message={statusMessage}
          />
        </div>

        <MobileDirectionPad onDirection={applyDirection} />

        <p className="mt-4 text-sm text-stone-600">
          操作: Arrow keys / WASD / Space。A から Z まで順番に集め、ダミー文字に触れると終了。{apiError ? `API: ${apiError}` : 'API接続: OK'}
        </p>
      </section>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={closeSettings}
        onSave={saveSettings}
      />
    </main>
  );
}

export default App;
