from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Snake API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

high_score = 0


class HighScoreResponse(BaseModel):
    high_score: int


class ScorePayload(BaseModel):
    score: int = Field(ge=0)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/high-score", response_model=HighScoreResponse)
def get_high_score() -> HighScoreResponse:
    return HighScoreResponse(high_score=high_score)


@app.post("/api/high-score", response_model=HighScoreResponse)
def post_high_score(payload: ScorePayload) -> HighScoreResponse:
    global high_score

    # 受け取ったスコアが現在値を上回る場合のみ更新する。
    high_score = max(high_score, payload.score)
    return HighScoreResponse(high_score=high_score)
