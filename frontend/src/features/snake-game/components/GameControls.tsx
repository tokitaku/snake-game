type GameControlsProps = {
  score: number;
  nextLetter: string;
  highScore: number | null;
  hasStarted: boolean;
  isPaused: boolean;
  onOpenSettings: () => void;
  onRestart: () => void;
  onPauseToggle: () => void;
};

export function GameControls({
  score,
  nextLetter,
  highScore,
  hasStarted,
  isPaused,
  onOpenSettings,
  onRestart,
  onPauseToggle,
}: GameControlsProps) {
  return (
    <header className="flex flex-wrap items-center gap-3">
      <h1 className="text-xl font-semibold tracking-wide">Snake</h1>
      <p className="ml-auto text-sm text-stone-600">Score: {score}</p>
      <p className="text-sm text-stone-600">Next Letter: {nextLetter}</p>
      <p className="text-sm text-stone-600">High Score: {highScore === null ? '--' : highScore}</p>
      <button
        type="button"
        onClick={onOpenSettings}
        className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm hover:bg-stone-200"
      >
        設定
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm hover:bg-stone-200"
      >
        Restart
      </button>
      <button
        type="button"
        onClick={onPauseToggle}
        className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm hover:bg-stone-200"
      >
        {!hasStarted ? 'Start' : isPaused ? 'Resume' : 'Pause'}
      </button>
    </header>
  );
}
