# Snake Game (React + FastAPI)

クラシックな Snake を React(TypeScript) + Tailwind で実装し、FastAPI でハイスコア API を提供します。

## 構成

- `frontend`: React + TypeScript + Tailwind
- `backend`: FastAPI
- `docker-compose.yml`: 開発用の統合起動設定

## 起動方法 (Docker)

事前に Docker Desktop (または Docker Engine) を起動してください。

```bash
docker compose up --build
```

ブラウザで `http://localhost:5173` にアクセスします。

停止:

```bash
docker compose down
```

## 起動方法 (ローカル直接実行)

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install uv
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスします。

`VITE_API_BASE_URL` を変更したい場合は、`frontend/.env` に以下を設定してください。

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 手動確認チェックリスト

- 初期表示でゲームが自動開始しない
- 矢印キー / WASD / 画面ボタンで操作できる
- 食べ物を食べるとスコアが増えて蛇が伸びる
- 壁または自己衝突でゲームオーバーになる
- Space / Pauseボタンで一時停止・再開できる
- Restartで即時リセットできる
- ゲームオーバー時にハイスコアが API に反映される
