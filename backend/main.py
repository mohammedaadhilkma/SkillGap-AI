from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analysis, auth

app = FastAPI(title="Skill Gap Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
