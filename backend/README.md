# Snake Backend (FastAPI)

## Run with Docker Compose (repo root)

```bash
docker compose up --build
```

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install uv
uv pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
