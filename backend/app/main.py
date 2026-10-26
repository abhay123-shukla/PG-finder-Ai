"""
PG Finder AI API - Main FastAPI Application.

Provides core health checking, CORS configuration for frontend interaction,
the AI chat endpoint powered by local Ollama models, and PG listing endpoints
backed by SQLite and SQLAlchemy.
"""

from contextlib import asynccontextmanager
import os
from pathlib import Path
import sys
from typing import Any, Dict, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# Ensure backend root directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment configuration (.env)
load_dotenv()

# Support both absolute and relative package execution
try:
    from app.database import check_db_health, init_db
    from app.routers.pgs import router as pgs_router
    from app.services.ollama_service import (
        OllamaConnectionError,
        OllamaModelNotFoundError,
        OllamaServiceError,
        get_ollama_service,
    )
except ImportError:  # pragma: no cover
    from database import check_db_health, init_db
    from routers.pgs import router as pgs_router
    from services.ollama_service import (
        OllamaConnectionError,
        OllamaModelNotFoundError,
        OllamaServiceError,
        get_ollama_service,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Automatically creates SQLite database tables on startup.
    """
    init_db()
    yield


# 1. Initialize FastAPI application
app = FastAPI(
    title="PG Finder AI API",
    description="Backend REST API for student PG search, verification, and local Ollama AI assistance.",
    version="1.0.0",
    lifespan=lifespan,
)

# 2. Configure CORS for local frontend development
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()
cors_origins: List[str] = [
    origin.strip() for origin in frontend_url.split(",") if origin.strip()
]
for default_origin in ("http://localhost:3000", "http://127.0.0.1:3000"):
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount PG listing routers (/api/pgs)
app.include_router(pgs_router)


# 4. Pydantic request & response schemas for AI chat
class ChatRequest(BaseModel):
    """Schema for incoming chat prompts."""
    message: str = Field(
        ...,
        description="The question or prompt to send to the local AI assistant.",
        examples=["Can you help me understand what to look for when choosing a student PG?"],
    )

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("The 'message' field is required and cannot be empty or whitespace.")
        return value.strip()


class ChatResponse(BaseModel):
    """Schema for AI chat replies."""
    response: str = Field(..., description="Ollama generated answer.")
    model: str = Field(..., description="Name of the model that generated the answer.")
    status: str = Field("success", description="Status indicator.")


# 5. Custom validation exception handler for user-friendly errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Returns clean, beginner-friendly JSON validation error messages."""
    error_messages: List[str] = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{field_path}: {msg}")

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": "Request Validation Error",
            "details": error_messages,
            "hint": "Ensure the JSON body conforms to the required fields and constraints.",
        },
    )


# 6. Core diagnostic & root routes
@app.get("/", summary="Root Index", include_in_schema=False)
def root() -> Dict[str, str]:
    """Root landing endpoint pointing to documentation and health check."""
    return {
        "service": "PG Finder AI API",
        "status": "online",
        "documentation": "/docs",
        "health_check": "/health",
        "pg_listings": "/api/pgs",
    }


@app.get(
    "/health",
    summary="Health check endpoint",
    tags=["Diagnostics"],
)
def health_check() -> Dict[str, Any]:
    """
    Returns the operational status of the FastAPI backend, SQLite database,
    and local Ollama instance.
    """
    ollama_service = get_ollama_service()
    ollama_diag = ollama_service.get_status()
    db_diag = check_db_health()

    is_healthy = db_diag.get("connected", False)

    return {
        "status": "healthy" if is_healthy else "degraded",
        "service": "PG Finder AI API",
        "version": "1.0.0",
        "database": db_diag,
        "ollama": ollama_diag,
    }


@app.post(
    "/api/ai/chat",
    response_model=ChatResponse,
    summary="AI Chat endpoint",
    tags=["AI Assistant"],
)
def ai_chat(payload: ChatRequest) -> Dict[str, Any]:
    """
    Sends a user query to the local Ollama LLM and returns the generated answer.
    """
    ollama_service = get_ollama_service()

    try:
        reply_text = ollama_service.chat(
            message=payload.message,
            system_prompt=(
                "You are PG Finder AI, an objective and honest assistant for university students in India. "
                "Help students evaluate Paying Guest (PG) accommodations, room security, meal options, "
                "curfews, and cleanliness tradeoffs. "
                "Never claim knowledge of unprovided PG listings or invent properties; "
                "evaluate only the properties and details provided in the conversation."
            ),
        )

        return {
            "response": reply_text,
            "model": ollama_service.model,
            "status": "success",
        }

    except OllamaConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Ollama Connection Failed",
                "message": str(exc),
                "hint": "Ollama does not appear to be running. Launch Ollama from your Windows Start menu or run 'ollama serve' in PowerShell.",
            },
        ) from exc

    except OllamaModelNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Ollama Model Missing",
                "message": str(exc),
                "hint": f"Run 'ollama pull {ollama_service.model}' in your terminal to download this model.",
            },
        ) from exc

    except OllamaServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Ollama Inference Error",
                "message": str(exc),
            },
        ) from exc
