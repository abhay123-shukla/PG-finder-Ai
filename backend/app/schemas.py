"""
Pydantic Request and Response Schemas for PG Finder AI.

Handles data validation, serialization, and deserialization for PG listings.
"""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PGListingBase(BaseModel):
    """Base fields shared across creation and responses."""

    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Name of the PG property",
        examples=["[DEMO] Fictional Greenview PG"],
    )
    city: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="City where the PG is located",
        examples=["Demo City"],
    )
    locality: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Area or locality name",
        examples=["University Block A"],
    )
    full_address: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="Complete street address",
        examples=["101 Demo Campus Lane, Fictional Area, Demo City"],
    )
    monthly_rent: float = Field(
        ...,
        gt=0,
        description="Monthly rent amount in INR",
        examples=[8500.0],
    )
    security_deposit: float = Field(
        ...,
        ge=0,
        description="Security deposit amount in INR",
        examples=[8500.0],
    )
    room_type: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Room type (e.g. single, double-sharing, triple-sharing)",
        examples=["double-sharing"],
    )
    food_available: bool = Field(
        False,
        description="Whether food / meals are provided",
    )
    wifi_available: bool = Field(
        False,
        description="Whether high-speed Wi-Fi is provided",
    )
    laundry_available: bool = Field(
        False,
        description="Whether laundry facility is provided",
    )
    attached_bathroom: bool = Field(
        False,
        description="Whether the room includes an attached private bathroom",
    )
    building_age_years: Optional[int] = Field(
        None,
        ge=0,
        le=150,
        description="Approximate building age in years (optional)",
        examples=[3],
    )
    description: str = Field(
        ...,
        min_length=5,
        max_length=3000,
        description="Detailed description of the property, facilities, and rules",
        examples=["[DEMO] Student accommodation with home-cooked meals and 24/7 security."],
    )
    verification_status: str = Field(
        "unverified",
        max_length=50,
        description="Verification state: 'verified', 'pending', or 'unverified'",
        examples=["unverified"],
    )
    contact_details: Optional[str] = Field(
        None,
        max_length=200,
        description="Phone number, email, or contact information for accommodation owner/warden",
        examples=["+91 98765 43210"],
    )
    facilities: Optional[str] = Field(
        None,
        max_length=500,
        description="Textual or comma-separated list of facilities",
        examples=["Free Wi-Fi, 3 Meals, Daily Housekeeping, RO Water"],
    )
    image_url: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional web URL of accommodation photo/cover image",
        examples=["https://images.unsplash.com/photo-example.jpg"],
    )

    @field_validator(
        "name",
        "city",
        "locality",
        "full_address",
        "room_type",
        "description",
        "verification_status",
    )
    @classmethod
    def validate_non_blank_strings(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Field cannot be empty or contain only whitespace.")
        return value.strip()

    @field_validator("contact_details", "facilities", "image_url")
    @classmethod
    def clean_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            stripped = value.strip()
            return stripped if stripped else None
        return None

    @field_validator("room_type")
    @classmethod
    def normalize_room_type(cls, value: str) -> str:
        return value.strip().lower()

    @model_validator(mode="before")
    @classmethod
    def support_field_aliases(cls, data: Any) -> Any:
        """Supports aliases: area/location for locality, deposit for security_deposit, contact_number for contact_details."""
        if isinstance(data, dict):
            # Location/Area -> Locality & City
            if "location" in data and ("locality" not in data or not data.get("locality")):
                data["locality"] = data["location"]
            if "area" in data and ("locality" not in data or not data.get("locality")):
                data["locality"] = data["area"]
            elif "locality" in data and ("area" not in data or not data.get("area")):
                data["area"] = data["locality"]

            # City fallback if missing from location
            if "city" not in data and "location" in data and "," in str(data.get("location", "")):
                parts = [p.strip() for p in data["location"].split(",")]
                if len(parts) >= 2:
                    data["locality"] = parts[0]
                    data["city"] = parts[1]

            # Deposit alias
            if "deposit" in data and ("security_deposit" not in data or data.get("security_deposit") is None):
                data["security_deposit"] = data["deposit"]
            elif "security_deposit" in data and ("deposit" not in data or data.get("deposit") is None):
                data["deposit"] = data["security_deposit"]

            # Contact number alias
            if "contact_number" in data and "contact_details" not in data:
                data["contact_details"] = data["contact_number"]
            elif "phone" in data and "contact_details" not in data:
                data["contact_details"] = data["phone"]
            elif "contact" in data and "contact_details" not in data:
                data["contact_details"] = data["contact"]

        return data


class PGListingCreate(PGListingBase):
    """Schema for creating a new PG listing via POST /api/pgs."""
    pass


class PGListingResponse(PGListingBase):
    """Schema for returning PG listing records with database metadata."""

    id: int = Field(..., description="Unique database ID of the PG listing")
    area: Optional[str] = Field(None, description="Alias for locality")
    location: Optional[str] = Field(None, description="Alias for locality/area and city")
    deposit: Optional[float] = Field(None, description="Alias for security_deposit")
    created_at: datetime = Field(..., description="Timestamp when listing was registered")

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="after")
    def populate_response_aliases(self) -> "PGListingResponse":
        if not self.area:
            self.area = self.locality
        if not self.location:
            self.location = (
                f"{self.locality}, {self.city}"
                if self.locality and self.city
                else (self.locality or self.city)
            )
        if self.deposit is None:
            self.deposit = self.security_deposit
        return self
