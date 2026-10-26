"""
Database Configuration and Session Management for PG Finder AI.

Uses SQLite with SQLAlchemy. Provides session dependency for FastAPI routes,
automatic table initialization, and diagnostic health check helpers.
"""

import os
from pathlib import Path
from typing import Any, Dict, Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Load environment configuration (.env)
load_dotenv()

# Determine database path relative to backend root
BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "pg_finder.db"
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL).strip() or DEFAULT_DB_URL
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
elif DATABASE_URL.startswith("sqlite:///./") or DATABASE_URL == "sqlite:///pg_finder.db":
    db_filename = DATABASE_URL.replace("sqlite:///./", "").replace("sqlite:///", "")
    DATABASE_URL = f"sqlite:///{(BACKEND_DIR / db_filename).as_posix()}"

# For SQLite, check_same_thread=False allows multi-threaded request processing in FastAPI
connect_args: Dict[str, Any] = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session per request.
    Ensures sessions are cleanly closed when requests finish.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _migrate_schema() -> None:
    """
    Ensures newly added columns exist in existing SQLite database tables
    without dropping the database or losing existing records.
    """
    if not DATABASE_URL.startswith("sqlite"):
        return

    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(pg_listings);"))
            existing_cols = {row[1] for row in result.fetchall()}

            if existing_cols:
                if "contact_details" not in existing_cols:
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN contact_details VARCHAR(200);"))
                if "facilities" not in existing_cols:
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN facilities VARCHAR(500);"))
                if "image_url" not in existing_cols:
                    conn.execute(text("ALTER TABLE pg_listings ADD COLUMN image_url VARCHAR(500);"))
                conn.commit()
    except Exception:
        # Table might not exist yet before Base.metadata.create_all
        pass


def init_db() -> None:
    """
    Creates database tables if they do not exist.
    Performs non-destructive schema migration for existing SQLite databases.
    If the database is freshly created and empty, seeds initial fictional DEMO records
    without creating duplicates.
    """
    # Import models here to register them with Base.metadata before create_all
    try:
        from app.models import PGListing
    except ImportError:  # pragma: no cover
        from models import PGListing

    Base.metadata.create_all(bind=engine)
    _migrate_schema()

    # Seed clearly marked fictional DEMO records if table is empty
    with SessionLocal() as db:
        if db.query(PGListing).first() is None:
            _seed_initial_demo_records(db)


def _seed_initial_demo_records(db: Session) -> None:
    """
    Seeds fictional demo records for testing search and retrieval.
    All records are clearly labeled as DEMO with fictional information.
    Guarantees no duplicate records are created.
    """
    try:
        from app.models import PGListing
    except ImportError:  # pragma: no cover
        from models import PGListing

    demo_listings = [
        PGListing(
            name="[DEMO] Fictional Scholar Haven PG",
            city="Demo City",
            locality="University Block A (Fictional Area)",
            full_address="101 Demo Campus Lane, Fictional Area, Demo City",
            monthly_rent=8500.0,
            security_deposit=8500.0,
            room_type="double-sharing",
            food_available=True,
            wifi_available=True,
            laundry_available=True,
            attached_bathroom=True,
            building_age_years=3,
            description="[DEMO] Fictional student accommodation with 3 meals daily, high-speed Wi-Fi, and study room.",
            verification_status="verified",
            contact_details="+91 98765 00001",
            facilities="High-Speed Wi-Fi, 3 Meals Daily, Laundry Service, Attached Bathroom, 24/7 Security",
        ),
        PGListing(
            name="[DEMO] Fictional Metro Student Living",
            city="Demo City",
            locality="Tech Park Zone (Fictional Area)",
            full_address="204 Fiction Avenue, Demo City",
            monthly_rent=12500.0,
            security_deposit=12500.0,
            room_type="single",
            food_available=False,
            wifi_available=True,
            laundry_available=False,
            attached_bathroom=True,
            building_age_years=1,
            description="[DEMO] Fictional single room private accommodation near tech institutes with 24/7 security.",
            verification_status="verified",
            contact_details="+91 98765 00002",
            facilities="High-Speed Wi-Fi, Private Attached Bathroom, Air Conditioning, Biometric Access",
        ),
        PGListing(
            name="[DEMO] Fictional Budget Student Hostel",
            city="Demo Town",
            locality="North Campus Block (Fictional Area)",
            full_address="55 Academic Road, Demo Town",
            monthly_rent=5500.0,
            security_deposit=5000.0,
            room_type="triple-sharing",
            food_available=True,
            wifi_available=True,
            laundry_available=True,
            attached_bathroom=False,
            building_age_years=6,
            description="[DEMO] Fictional budget-friendly triple sharing accommodation with home-style meal plans.",
            verification_status="unverified",
            contact_details="+91 98765 00003",
            facilities="Wi-Fi Internet, Home-Cooked Meals, Laundry Service, Common Study Hall",
        ),
    ]

    for listing in demo_listings:
        existing = db.query(PGListing).filter(PGListing.name == listing.name).first()
        if not existing:
            db.add(listing)

    db.commit()


def check_db_health() -> Dict[str, Any]:
    """Performs a lightweight connectivity check on the database."""
    engine_name = "postgresql" if DATABASE_URL.startswith("postgresql") else "sqlite"
    # Mask any user/password credentials for security
    masked_db = (
        DATABASE_URL.split("@")[-1]
        if "@" in DATABASE_URL
        else (DATABASE_URL.split("///")[-1] if "///" in DATABASE_URL else "configured")
    )
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "connected": True,
            "engine": engine_name,
            "database": masked_db,
        }
    except Exception as exc:
        return {
            "connected": False,
            "engine": engine_name,
            "error": str(exc),
        }
