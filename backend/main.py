import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routers import convert

# backend/main.py 기준 프로젝트 루트의 frontend 절대 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = FastAPI(title="업무 말투 변환기 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 로컬 테스트 및 Vercel 연동을 위해 임시 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 백엔드 API 라우터 마운트
app.include_router(convert.router, prefix="/api")

# Health Check 라우터
@app.get("/health")
def health_check():
    return {"status": "ok"}

# 프론트엔드 정적 파일 서빙 마운트 (index.html, css, js 등)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
