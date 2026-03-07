type GameOverlayProps = {
  visible: boolean;
  message: string;
};

export function GameOverlay({ visible, message }: GameOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute inset-0 grid place-items-center rounded bg-stone-100/80 text-center">
      <div className="rounded-md border border-stone-300 bg-white px-4 py-3">
        <p className="text-base font-semibold">{message}</p>
        <p className="mt-1 text-sm text-stone-600">Spaceで開始/一時停止、Game Over時は再開</p>
      </div>
    </div>
  );
}
