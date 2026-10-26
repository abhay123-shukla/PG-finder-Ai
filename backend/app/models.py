"""
SQLAlchemy Database Models for PG Finder AI.

Defines the PGListing table representing student accommodation properties.
"""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text

try:
    from app.database import Base
except ImportError:  # pragma: no cover
    from database import Base


class PGListing(Base):
    """
    SQLAlchemy model representing a Paying Guest (PG) accommodation property.
    """

    __tablename__ = "pg_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    locality = Column(String(150), nullable=False, index=True)  # area / locality
    full_address = Column(String(300), nullable=False)
    monthly_rent = Column(Float, nullable=False, index=True)
    security_deposit = Column(Float, nullable=False, default=0.0)
    room_type = Column(String(50), nullable=False, index=True)  # single, double-sharing, triple-sharing
    food_available = Column(Boolean, nullable=False, default=False)
    wifi_available = Column(Boolean, nullable=False, default=False)
    laundry_available = Column(Boolean, nullable=False, default=False)
    attached_bathroom = Column(Boolean, nullable=False, default=False)
    building_age_years = Column(Integer, nullable=True)  # optional
    description = Column(Text, nullable=False)
    verification_status = Column(String(50), nullable=False, default="unverified", index=True)
    contact_details = Column(String(200), nullable=True)  # phone/email of owner/warden
    facilities = Column(String(500), nullable=True)  # textual or custom facilities summary
    image_url = Column(String(500), nullable=True)  # optional accommodation photo URL
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    @property
    def area(self) -> str:
        """Convenience property alias for locality."""
        return self.locality

    @property
    def location(self) -> str:
        """Convenience property alias for locality and city."""
        if self.locality and self.city:
            return f"{self.locality}, {self.city}"
        return self.locality or self.city

    @property
    def deposit(self) -> float:
        """Convenience property alias for security_deposit."""
        return self.security_deposit

    def __repr__(self) -> str:
        return f"<PGListing(id={self.id}, name='{self.name}', city='{self.city}', rent={self.monthly_rent})>"
