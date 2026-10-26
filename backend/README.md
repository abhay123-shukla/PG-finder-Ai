# PG Finder AI - Backend Service

FastAPI REST API powering PG Finder AI with SQLite database, PG listings API, and local Ollama AI model integration.

## 📁 Directory Layout

```text
backend/
├── app/
│   ├── __init__.py
│   ├── init.py
│   ├── main.py              # FastAPI application, CORS & router mounting
│   ├── database.py          # SQLite connection, session management & seed helper
│   ├── models.py            # SQLAlchemy PGListing model
│   ├── schemas.py           # Pydantic request and response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   └── pgs.py           # PG listing CRUD & search endpoints
│   └── services/
│       ├── __init__.py
│       ├── init.py
│       └── ollama_service.py # Ollama Python SDK wrapper & error handling
├── pg_finder.db             # Local SQLite database (auto-generated on startup)
├── requirements.txt         # Dependencies (fastapi, uvicorn, sqlalchemy, ollama, pydantic, python-dotenv)
├── .env.example             # Configuration template
└── .env                     # Local environment settings
```

## 🚀 Quickstart (Windows)

```powershell
# 1. Navigate to backend directory
cd "c:\Users\ARP INFOTECH\Desktop\PG finder -Ai\backend"

# 2. Activate virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Start development server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 🧪 Endpoints

- `GET /health`: Health check, SQLite database status, and Ollama model status
- `GET /api/pgs`: List all PG accommodations
- `GET /api/pgs/search`: Search and filter PGs by city, max rent, room type, and amenities
- `GET /api/pgs/{pg_id}`: Retrieve a single PG listing by ID (returns 404 if not found)
- `POST /api/pgs`: Create a new PG listing
- `POST /api/ai/chat`: AI assistant chat (`{"message": "string"}`)
- Interactive Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
