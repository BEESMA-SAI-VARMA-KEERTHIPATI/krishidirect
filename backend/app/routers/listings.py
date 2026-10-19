from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.listing import ProduceListing
from app.models.user import User
from app.models.notification import AuditLog
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from app.services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/listings", tags=["Produce Listings"])

@router.get("", response_model=List[ListingResponse])
def get_listings(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    quality_grade: Optional[str] = None,
    location: Optional[str] = None,
    sort_by: Optional[str] = "newest",  # newest, price_asc, price_desc, quantity_desc
    db: Session = Depends(get_db)
):
    query = db.query(ProduceListing).filter(ProduceListing.status != "sold_out")
    
    if q:
        query = query.filter(
            or_(
                ProduceListing.produce_name.ilike(f"%{q}%"),
                ProduceListing.variety.ilike(f"%{q}%"),
                ProduceListing.description.ilike(f"%{q}%")
            )
        )
    if category and category.lower() != "all":
        query = query.filter(ProduceListing.category.ilike(category))
    if min_price is not None:
        query = query.filter(ProduceListing.asking_price >= min_price)
    if max_price is not None:
        query = query.filter(ProduceListing.asking_price <= max_price)
    if quality_grade and quality_grade.lower() != "all":
        query = query.filter(ProduceListing.quality_grade == quality_grade)
    if location:
        query = query.filter(
            or_(
                ProduceListing.farm_location.ilike(f"%{location}%"),
                ProduceListing.district.ilike(f"%{location}%")
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(ProduceListing.asking_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(ProduceListing.asking_price.desc())
    elif sort_by == "quantity_desc":
        query = query.order_by(ProduceListing.available_quantity.desc())
    else:
        query = query.order_by(ProduceListing.created_at.desc())

    return query.all()

@router.get("/mine", response_model=List[ListingResponse])
def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If farmer, get their listings; if agent, get listings they assisted or village cluster listings
    if current_user.role in ["farmer", "agent"]:
        return db.query(ProduceListing).filter(ProduceListing.farmer_id == current_user.id).order_by(ProduceListing.created_at.desc()).all()
    elif current_user.role == "admin":
        return db.query(ProduceListing).order_by(ProduceListing.created_at.desc()).all()
    else:
        return []

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produce listing not found")
    return listing

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(require_role(["farmer", "agent", "admin"])),
    db: Session = Depends(get_db)
):
    listing = ProduceListing(
        farmer_id=current_user.id,
        produce_name=payload.produce_name,
        category=payload.category,
        variety=payload.variety,
        description=payload.description,
        image_url=payload.image_url,
        available_quantity=payload.available_quantity,
        initial_quantity=payload.available_quantity,
        unit=payload.unit,
        asking_price=payload.asking_price,
        quality_grade=payload.quality_grade,
        harvest_date=payload.harvest_date,
        farm_location=payload.farm_location,
        district=payload.district or current_user.district,
        state=payload.state or current_user.state,
        pickup_method=payload.pickup_method,
        status="active"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    # Ownership authorization check
    if listing.farmer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to edit this listing")

    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    if listing.farmer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to delete this listing")

    listing.status = "paused"  # Soft delete to preserve order histories
    db.commit()
    return {"message": "Listing archived successfully"}
