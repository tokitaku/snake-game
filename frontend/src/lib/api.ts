const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

type HighScoreResponse = {
  high_score: number;
};

export async function fetchHighScore(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/high-score`);

  if (!response.ok) {
    throw new Error('ハイスコアの取得に失敗しました。');
  }

  const payload = (await response.json()) as HighScoreResponse;
  return payload.high_score;
}

export async function submitHighScore(score: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/high-score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  });

  if (!response.ok) {
    throw new Error('ハイスコアの更新に失敗しました。');
  }

  const payload = (await response.json()) as HighScoreResponse;
  return payload.high_score;
}
