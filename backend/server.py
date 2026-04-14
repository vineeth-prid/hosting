from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os
import uuid
import bcrypt
import jwt

app = FastAPI()

FRONTEND_URL = os.environ.get("APP_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
RAZORPAY_TEST_MODE = os.environ.get("RAZORPAY_TEST_MODE", "true").lower() == "true"
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = "HS256"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# --- Auth Helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Models ---
class PropertyCreate(BaseModel):
    name: str
    location: str
    price_per_night: int
    description: str
    amenities: List[str]
    images: List[str]
    max_guests: int = 6
    rating: float = 4.5
    reviews_count: int = 0

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    price_per_night: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    max_guests: Optional[int] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None

class BookingCreate(BaseModel):
    property_id: str
    guest_name: str
    guest_email: str
    guest_phone: str
    check_in: str
    check_out: str
    guests: int
    total_amount: int

class ContactCreate(BaseModel):
    name: str
    phone: str
    message: str

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Seed Data ---
SEED_PROPERTIES = [
    {
        "property_id": "prop-001",
        "name": "Kochi Marina Retreat",
        "location": "Near Infopark Phase 2, Kakkanad, Kochi",
        "price_per_night": 3500,
        "description": "A stunning 2BHK apartment with panoramic views of the Kochi skyline. Modern interiors blend seamlessly with traditional Kerala aesthetics. Perfect for IT professionals and families seeking a premium staycation experience near Infopark.",
        "amenities": ["WiFi", "AC", "Kitchen", "Parking", "TV", "Washing Machine", "Balcony", "Power Backup"],
        "images": [
            "https://images.unsplash.com/photo-1721216596273-586bfde422e7?w=800&q=80",
            "https://images.unsplash.com/photo-1719687384656-07e524f9797e?w=800&q=80",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
            "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80"
        ],
        "max_guests": 6,
        "rating": 4.8,
        "reviews_count": 124
    },
    {
        "property_id": "prop-002",
        "name": "Wonderla Garden Villa",
        "location": "Near Wonderla, Pallikkara, Kochi",
        "price_per_night": 5000,
        "description": "A luxurious 3BHK villa surrounded by tropical gardens, just minutes from Wonderla Amusement Park. Features a private sit-out area, fully equipped kitchen, and authentic Kerala decor. Ideal for families and groups looking for the perfect getaway.",
        "amenities": ["WiFi", "AC", "Kitchen", "Garden", "BBQ Area", "Parking", "TV", "Washing Machine", "Power Backup", "Caretaker"],
        "images": [
            "https://images.unsplash.com/photo-1757262798630-a9cdd57af39b?w=800&q=80",
            "https://images.unsplash.com/photo-1744855803369-8c5a97e1f4f3?w=800&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
        ],
        "max_guests": 8,
        "rating": 4.9,
        "reviews_count": 89
    }
]

SEED_TESTIMONIALS = [
    {
        "testimonial_id": "test-001",
        "name": "Ananya Menon",
        "location": "Bangalore",
        "quote": "The Kochi Marina Retreat was absolutely perfect for our weekend getaway. The view from the balcony was breathtaking, and the proximity to Infopark made it incredibly convenient for my husband's work trip.",
        "rating": 5,
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
    },
    {
        "testimonial_id": "test-002",
        "name": "Rajesh Kumar",
        "location": "Mumbai",
        "quote": "We booked the Wonderla Garden Villa for a family vacation and it exceeded all expectations. The kids loved being so close to Wonderla, and the homemade Kerala food experience was the highlight of our trip!",
        "rating": 5,
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    {
        "testimonial_id": "test-003",
        "name": "Priya Sharma",
        "location": "Delhi",
        "quote": "Hosting made our Kochi trip unforgettable. The property was spotlessly clean, beautifully designed, and the local experience recommendations were fantastic. Will definitely book again!",
        "rating": 5,
        "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
    },
    {
        "testimonial_id": "test-004",
        "name": "Vivek Nair",
        "location": "Chennai",
        "quote": "As someone who travels to Kochi frequently for work, Hosting has become my go-to accommodation. Professional service, premium amenities, and that homely feeling you don't get in hotels.",
        "rating": 5,
        "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
    }
]

async def seed_data():
    prop_count = await db.properties.count_documents({})
    if prop_count == 0:
        await db.properties.insert_many(SEED_PROPERTIES)
    test_count = await db.testimonials.count_documents({})
    if test_count == 0:
        await db.testimonials.insert_many(SEED_TESTIMONIALS)

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@hosting.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Hosting@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
    await db.users.create_index("email", unique=True)

@app.on_event("startup")
async def startup():
    await seed_data()
    await seed_admin()

# --- Health ---
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# --- Auth ---
@app.post("/api/auth/login")
async def admin_login(req: LoginRequest):
    email = req.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    response = JSONResponse(content={
        "user": {"id": str(user["_id"]), "email": user["email"], "name": user["name"], "role": user["role"]},
        "token": token
    })
    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    return response

@app.post("/api/auth/logout")
async def admin_logout():
    response = JSONResponse(content={"status": "logged out"})
    response.delete_cookie("access_token", path="/")
    return response

@app.get("/api/auth/me")
async def get_me(request: Request):
    user = await get_current_admin(request)
    return user

# --- Public Properties ---
@app.get("/api/properties")
async def get_properties():
    props = await db.properties.find({}, {"_id": 0}).to_list(100)
    return props

@app.get("/api/properties/{property_id}")
async def get_property(property_id: str):
    prop = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

# --- Admin Property CRUD ---
@app.post("/api/admin/properties")
async def create_property(prop: PropertyCreate, request: Request):
    await get_current_admin(request)
    property_id = f"prop-{uuid.uuid4().hex[:6]}"
    doc = {
        "property_id": property_id,
        **prop.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.properties.insert_one(doc)
    return {"property_id": property_id, "message": "Property created"}

@app.put("/api/admin/properties/{property_id}")
async def update_property(property_id: str, prop: PropertyUpdate, request: Request):
    await get_current_admin(request)
    update_data = {k: v for k, v in prop.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.properties.update_one({"property_id": property_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property updated"}

@app.delete("/api/admin/properties/{property_id}")
async def delete_property(property_id: str, request: Request):
    await get_current_admin(request)
    result = await db.properties.delete_one({"property_id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"message": "Property deleted"}

# --- Admin Bookings ---
@app.get("/api/admin/bookings")
async def get_admin_bookings(request: Request):
    await get_current_admin(request)
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return bookings

# --- Admin Contacts ---
@app.get("/api/admin/contacts")
async def get_admin_contacts(request: Request):
    await get_current_admin(request)
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return contacts

# --- Admin Stats ---
@app.get("/api/admin/stats")
async def get_admin_stats(request: Request):
    await get_current_admin(request)
    prop_count = await db.properties.count_documents({})
    booking_count = await db.bookings.count_documents({})
    contact_count = await db.contacts.count_documents({})
    total_revenue = 0
    bookings = await db.bookings.find({"payment_status": "confirmed"}, {"total_amount": 1, "_id": 0}).to_list(1000)
    for b in bookings:
        total_revenue += b.get("total_amount", 0)
    return {
        "properties": prop_count,
        "bookings": booking_count,
        "contacts": contact_count,
        "revenue": total_revenue
    }

# --- Bookings ---
@app.post("/api/bookings")
async def create_booking(booking: BookingCreate):
    booking_id = f"BK-{uuid.uuid4().hex[:8].upper()}"
    booking_doc = {
        "booking_id": booking_id,
        "property_id": booking.property_id,
        "guest_name": booking.guest_name,
        "guest_email": booking.guest_email,
        "guest_phone": booking.guest_phone,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "total_amount": booking.total_amount,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(booking_doc)
    if RAZORPAY_TEST_MODE:
        order_id = f"order_test_{uuid.uuid4().hex[:12]}"
        await db.bookings.update_one(
            {"booking_id": booking_id},
            {"$set": {"razorpay_order_id": order_id, "payment_status": "test_created"}}
        )
        return {
            "booking_id": booking_id,
            "order_id": order_id,
            "amount": booking.total_amount * 100,
            "currency": "INR",
            "test_mode": True
        }
    return {"booking_id": booking_id, "status": "created"}

@app.post("/api/bookings/confirm")
async def confirm_booking(request: Request):
    data = await request.json()
    booking_id = data.get("booking_id")
    result = await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"payment_status": "confirmed", "confirmed_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    return {"status": "confirmed", "booking": booking}

@app.get("/api/bookings/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# --- Testimonials ---
@app.get("/api/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return testimonials

# --- Contact ---
@app.post("/api/contact")
async def submit_contact(contact: ContactCreate):
    contact_doc = {
        "contact_id": f"CT-{uuid.uuid4().hex[:8].upper()}",
        "name": contact.name,
        "phone": contact.phone,
        "message": contact.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(contact_doc)
    return {"status": "success", "message": "We'll get back to you soon!"}
