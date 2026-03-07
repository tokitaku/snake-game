import { useEffect, useRef } from 'react';
import type { DummyCount, GameSettings, GameSpeed } from '@/features/snake-game/model/settings';
import { DUMMY_COUNT_LABELS, SPEED_LABELS } from '@/features/snake-game/model/settings';

type SettingsModalProps = {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
  onSave: (settings: GameSettings) => void;
};

const DUMMY_COUNT_OPTIONS = [2, 3, 4, 5] as const satisfies readonly DummyCount[];

export function SettingsModal({ isOpen, settings, onClose, onSave }: SettingsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    return () => {
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSpeedChange = (speed: GameSpeed) => {
    onSave({ ...settings, speed });
  };

  const handleDummyCountChange = (dummyCount: DummyCount) => {
    onSave({ ...settings, dummyCount });
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
        event.stopPropagation();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-stone-300 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">設定 (Settings)</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">移動速度 (Speed)</h3>
            <div className="space-y-2">
              {(Object.keys(SPEED_LABELS) as GameSpeed[]).map((speed) => (
                <label key={speed} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="speed"
                    value={speed}
                    checked={settings.speed === speed}
                    onChange={() => handleSpeedChange(speed)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{SPEED_LABELS[speed]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">ダミーの数</h3>
            <p className="mb-2 text-xs text-stone-500">変更は次回リスタートから反映されます。</p>
            <div className="space-y-2">
              {DUMMY_COUNT_OPTIONS.map((dummyCount) => (
                <label key={dummyCount} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="dummyCount"
                    value={dummyCount}
                    checked={settings.dummyCount === dummyCount}
                    onChange={() => handleDummyCountChange(dummyCount)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{DUMMY_COUNT_LABELS[dummyCount]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 bg-stone-100 px-4 py-2 text-sm hover:bg-stone-200"
          >
            閉じる (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
