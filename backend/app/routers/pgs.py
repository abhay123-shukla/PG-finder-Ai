"""
PG Listings Router for PG Finder AI.

Implements CRUD and search endpoints:
- GET  /api/pgs         : List all PG accommodations
- GET  /api/pgs/search  : Filter by city, max rent, room type, and amenities
- GET  /api/pgs/{pg_id} : Get detailed information for a single PG
- POST /api/pgs         : Create a new PG listing
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.models import PGListing
    from app.schemas import PGListingCreate, PGListingResponse
except ImportError:  # pragma: no cover
    from database import get_db
    from models import PGListing
    from schemas import PGListingCreate, PGListingResponse

router = APIRouter(
    prefix="/api/pgs",
    tags=["PG Accommodations"],
)


@router.get(
    "",
    response_model=List[PGListingResponse],
    summary="List all PG listings",
)
def list_pgs(
    skip: int = Query(0, ge=0, description="Number of items to skip for pagination"),
    limit: int = Query(100, ge=1, le=200, description="Maximum number of items to return"),
    db: Session = Depends(get_db),
) -> List[PGListing]:
    """
    Returns a list of all registered PG accommodations.
    """
    return db.query(PGListing).order_by(PGListing.id.asc()).offset(skip).limit(limit).all()


@router.get(
    "/search",
    response_model=List[PGListingResponse],
    summary="Search and filter PG listings",
)
def search_pgs(
    city: Optional[str] = Query(None, description="City name (case-insensitive search)"),
    area: Optional[str] = Query(None, description="Locality or area name"),
    location: Optional[str] = Query(None, description="Location or area keyword (matches city, area/locality, or address)"),
    min_rent: Optional[float] = Query(None, ge=0, description="Minimum monthly rent budget"),
    max_rent: Optional[float] = Query(None, gt=0, description="Maximum monthly rent budget"),
    room_type: Optional[str] = Query(None, description="Room type (single, double-sharing, triple-sharing)"),
    food_available: Optional[bool] = Query(None, description="Filter by food / meal availability"),
    wifi_available: Optional[bool] = Query(None, description="Filter by Wi-Fi internet availability"),
    laundry_available: Optional[bool] = Query(None, description="Filter by laundry availability"),
    attached_bathroom: Optional[bool] = Query(None, description="Filter by attached bathroom availability"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status (verified, pending, unverified)"),
    db: Session = Depends(get_db),
) -> List[PGListing]:
    """
    Searches PG listings matching multi-parameter criteria (city, area, location, min/max rent, room type, amenities).
    """
    query = db.query(PGListing)

    if location and location.strip():
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                PGListing.name.ilike(loc_term),
                PGListing.city.ilike(loc_term),
                PGListing.locality.ilike(loc_term),
                PGListing.full_address.ilike(loc_term),
            )
        )

    if city and city.strip():
        query = query.filter(PGListing.city.ilike(f"%{city.strip()}%"))

    if area and area.strip():
        query = query.filter(PGListing.locality.ilike(f"%{area.strip()}%"))

    if min_rent is not None:
        query = query.filter(PGListing.monthly_rent >= min_rent)

    if max_rent is not None:
        query = query.filter(PGListing.monthly_rent <= max_rent)

    if room_type and room_type.strip():
        query = query.filter(PGListing.room_type.ilike(f"%{room_type.strip().lower()}%"))

    if food_available is not None:
        query = query.filter(PGListing.food_available == food_available)

    if wifi_available is not None:
        query = query.filter(PGListing.wifi_available == wifi_available)

    if laundry_available is not None:
        query = query.filter(PGListing.laundry_available == laundry_available)

    if attached_bathroom is not None:
        query = query.filter(PGListing.attached_bathroom == attached_bathroom)

    if verification_status and verification_status.strip():
        query = query.filter(PGListing.verification_status.ilike(f"%{verification_status.strip()}%"))

    # Order by monthly rent ascending (most affordable first)
    return query.order_by(PGListing.monthly_rent.asc()).all()


@router.get(
    "/{pg_id}",
    response_model=PGListingResponse,
    summary="Get single PG listing by ID",
)
def get_pg(
    pg_id: int,
    db: Session = Depends(get_db),
) -> PGListing:
    """
    Retrieves full details for a single PG accommodation by its unique ID.
    Returns HTTP 404 if the accommodation does not exist.
    """
    pg = db.query(PGListing).filter(PGListing.id == pg_id).first()
    if pg is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PG listing with ID {pg_id} was not found.",
        )
    return pg


@router.post(
    "",
    response_model=PGListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new PG listing",
)
def create_pg(
    payload: PGListingCreate,
    db: Session = Depends(get_db),
) -> PGListing:
    """
    Creates and stores a new PG accommodation listing in the database.
    Prevents duplicate listings with the same name, city, and address.
    """
    existing = (
        db.query(PGListing)
        .filter(
            PGListing.name.ilike(payload.name.strip()),
            PGListing.city.ilike(payload.city.strip()),
            PGListing.full_address.ilike(payload.full_address.strip()),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An accommodation with this name and address already exists (ID: #{existing.id}).",
        )

    try:
        new_pg = PGListing(
            name=payload.name,
            city=payload.city,
            locality=payload.locality,
            full_address=payload.full_address,
            monthly_rent=payload.monthly_rent,
            security_deposit=payload.security_deposit,
            room_type=payload.room_type,
            food_available=payload.food_available,
            wifi_available=payload.wifi_available,
            laundry_available=payload.laundry_available,
            attached_bathroom=payload.attached_bathroom,
            building_age_years=payload.building_age_years,
            description=payload.description,
            verification_status=payload.verification_status,
            contact_details=payload.contact_details,
            facilities=payload.facilities,
            image_url=payload.image_url,
        )
        db.add(new_pg)
        db.commit()
        db.refresh(new_pg)
        return new_pg
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while saving PG accommodation: {str(exc)}",
        ) from exc
