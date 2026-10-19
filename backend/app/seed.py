import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.listing import ProduceListing, MarketPriceRecord
from app.models.order import Order, DeliveryOTP, DeliveryEvent
from app.models.pool import HarvestPool, PoolParticipant
from app.models.notification import Notification, AuditLog
from app.services.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    existing_users = db.query(User).count()
    if existing_users > 0:
        print("[SEED] Database already populated with records. Skipping initial seeding.")
        db.close()
        return

    print("[SEED] Seeding KrishiDirect database with realistic agricultural demonstration data...")

    # 1. Create 5 User Accounts for Demo
    hashed_pwd = hash_password("Password123!")
    admin_pwd = hash_password("AdminPassword123!")

    farmer = User(
        full_name="Ramesh Patel",
        email="ramesh.farmer@krishidirect.in",
        hashed_password=hashed_pwd,
        role="farmer",
        phone="+91 98480 12345",
        village="Jangaon Rural",
        district="Warangal",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )
    buyer = User(
        full_name="Priya Sharma",
        email="priya.buyer@krishidirect.in",
        hashed_password=hashed_pwd,
        role="buyer",
        phone="+91 99887 65432",
        village="Banjara Hills",
        district="Hyderabad",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )
    agent = User(
        full_name="Suresh Rao",
        email="suresh.agent@krishidirect.in",
        hashed_password=hashed_pwd,
        role="agent",
        phone="+91 91234 56789",
        village="Jangaon Mandi Center",
        district="Warangal",
        state="Telangana",
        preferred_lang="te",
        speech_lang="te-IN",
        voice_lang="te-IN"
    )
    transporter = User(
        full_name="Vikram Logistics Fleet",
        email="vikram.transporter@krishidirect.in",
        hashed_password=hashed_pwd,
        role="transporter",
        phone="+91 94401 98765",
        village="Transport Hub, NH163",
        district="Warangal",
        state="Telangana",
        preferred_lang="hi",
        speech_lang="hi-IN",
        voice_lang="hi-IN"
    )
    admin = User(
        full_name="KrishiDirect Administrator",
        email="admin@krishidirect.in",
        hashed_password=admin_pwd,
        role="admin",
        phone="+91 80000 00001",
        village="Headquarters",
        district="Hyderabad",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )

    # Demo aliases
    demo_pwd = hash_password("demo1234")
    farmer_demo = User(
        full_name="Demo Farmer",
        email="farmer@demo.com",
        hashed_password=demo_pwd,
        role="farmer",
        phone="+91 98480 12345",
        village="Jangaon Rural",
        district="Warangal",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )
    buyer_demo = User(
        full_name="Demo Buyer",
        email="buyer@demo.com",
        hashed_password=demo_pwd,
        role="buyer",
        phone="+91 99887 65432",
        village="Banjara Hills",
        district="Hyderabad",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )
    agent_demo = User(
        full_name="Demo Village Agent",
        email="agent@demo.com",
        hashed_password=demo_pwd,
        role="agent",
        phone="+91 91234 56789",
        village="Jangaon Mandi Center",
        district="Warangal",
        state="Telangana",
        preferred_lang="te",
        speech_lang="te-IN",
        voice_lang="te-IN"
    )
    transporter_demo = User(
        full_name="Demo Transporter",
        email="transporter@demo.com",
        hashed_password=demo_pwd,
        role="transporter",
        phone="+91 94401 98765",
        village="Transport Hub, NH163",
        district="Warangal",
        state="Telangana",
        preferred_lang="hi",
        speech_lang="hi-IN",
        voice_lang="hi-IN"
    )
    admin_demo = User(
        full_name="Demo Admin",
        email="admin@demo.com",
        hashed_password=demo_pwd,
        role="admin",
        phone="+91 80000 00001",
        village="Headquarters",
        district="Hyderabad",
        state="Telangana",
        preferred_lang="en",
        speech_lang="en-IN",
        voice_lang="en-IN"
    )

    db.add_all([farmer, buyer, agent, transporter, admin, farmer_demo, buyer_demo, agent_demo, transporter_demo, admin_demo])
    db.commit()
    db.refresh(farmer)
    db.refresh(buyer)
    db.refresh(agent)
    db.refresh(transporter)
    db.refresh(admin)

    # 2. Seed Produce Listings
    listings_data = [
        {
            "farmer_id": farmer.id,
            "produce_name": "Fresh Hybrid Red Tomatoes",
            "category": "vegetables",
            "variety": "Saahu Hybrid 3251",
            "description": "Sun-ripened, firm skin, high pulp content with vibrant red coloring. Harvested this morning from drip-irrigated farmland. Ideal for supermarket shelves and culinary bulk use.",
            "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 850.0,
            "initial_quantity": 1000.0,
            "unit": "kg",
            "asking_price": 32.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "farm_location": "Patel Organic Farms, Jangaon",
            "district": "Warangal",
            "state": "Telangana",
            "pickup_method": "collection_point"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Aromatic Sona Masoori Rice",
            "category": "grains",
            "variety": "BPT 5204 (Samba Masoori)",
            "description": "Naturally aged for 12 months. Medium slender grain with fragrant aroma, non-sticky fluffiness when cooked. Triple-cleaned and sorted in 25kg moisture-proof sacks.",
            "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 2500.0,
            "initial_quantity": 2500.0,
            "unit": "kg",
            "asking_price": 52.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=20)).strftime("%Y-%m-%d"),
            "farm_location": "Krishna River Basin, Miryalaguda",
            "district": "Nalgonda",
            "state": "Telangana",
            "pickup_method": "direct_delivery"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Nashik Premium Red Onions",
            "category": "vegetables",
            "variety": "Gavran Red Onion",
            "description": "Thick dry outer skins, tight necks, pungent flavor and outstanding storage resilience. Field cured for 5 days under natural sun.",
            "image_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 1400.0,
            "initial_quantity": 1500.0,
            "unit": "kg",
            "asking_price": 26.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d"),
            "farm_location": "Lasalgaon Road Cluster",
            "district": "Nashik",
            "state": "Maharashtra",
            "pickup_method": "collection_point"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Ratnagiri Alphonso (Hapus) Mangoes",
            "category": "fruits",
            "variety": "Original Devgad Alphonso",
            "description": "GI-tagged Alphonso mangoes ripened using traditional grass-hay methodology. Intense saffron pulp with zero fiber and legendary sweetness.",
            "image_url": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 450.0,
            "initial_quantity": 500.0,
            "unit": "kg",
            "asking_price": 120.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d"),
            "farm_location": "Coastal Orchard Belt",
            "district": "Ratnagiri",
            "state": "Maharashtra",
            "pickup_method": "direct_delivery"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Guntur Hot Teja Dry Chillies",
            "category": "spices",
            "variety": "Teja S17 Sharp",
            "description": "High SHU rating (60,000+), bright crimson red hue, low moisture content (<10%). Stemless option available on bulk orders.",
            "image_url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 800.0,
            "initial_quantity": 800.0,
            "unit": "kg",
            "asking_price": 185.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=12)).strftime("%Y-%m-%d"),
            "farm_location": "Lanka Lands",
            "district": "Guntur",
            "state": "Andhra Pradesh",
            "pickup_method": "collection_point"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Kolar Green Crisp Capsicum",
            "category": "vegetables",
            "variety": "Indra Greenhouse Bell Pepper",
            "description": "Thick-walled 4-lobed bell peppers grown in polyhouses. High crunchiness and extended 10-day shelf life under ambient airflow.",
            "image_url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 600.0,
            "initial_quantity": 600.0,
            "unit": "kg",
            "asking_price": 44.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "farm_location": "Bangarapet Polyhouse Collective",
            "district": "Kolar",
            "state": "Karnataka",
            "pickup_method": "collection_point"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Salem Pure Curcumin Turmeric",
            "category": "spices",
            "variety": "Salem Finger Double Polished",
            "description": "High curcumin active component (4.8%), deep orange-gold core, completely pesticide free. Sun cured on clean concrete threshing yards.",
            "image_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 1200.0,
            "initial_quantity": 1200.0,
            "unit": "kg",
            "asking_price": 138.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=25)).strftime("%Y-%m-%d"),
            "farm_location": "Mettur Foothills",
            "district": "Salem",
            "state": "Tamil Nadu",
            "pickup_method": "direct_delivery"
        },
        {
            "farmer_id": farmer.id,
            "produce_name": "Sehore Sharbati Golden Wheat",
            "category": "grains",
            "variety": "MP Sharbati Premier",
            "description": "Known as the golden grain of Central India. High gluten strength, lustrous golden sheen, produces tender rotis that stay soft all day.",
            "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
            "available_quantity": 3000.0,
            "initial_quantity": 3000.0,
            "unit": "kg",
            "asking_price": 35.0,
            "quality_grade": "Grade A",
            "harvest_date": (datetime.utcnow() - timedelta(days=15)).strftime("%Y-%m-%d"),
            "farm_location": "Narmada Alluvial Belt",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "pickup_method": "direct_delivery"
        }
    ]

    created_listings = []
    for item in listings_data:
        listing = ProduceListing(**item, status="active")
        db.add(listing)
        created_listings.append(listing)
    
    db.commit()
    for l in created_listings:
        db.refresh(l)

    # 3. Seed Mandi Historical Market Observations for AI Fair-Price Engine
    today = datetime.utcnow()
    mandi_records = []
    crops_info = [
        {"name": "Fresh Hybrid Red Tomatoes", "modal": 32.0, "min": 25.0, "max": 38.0, "region": "Bowenpally / Hyderabad Mandi"},
        {"name": "Fresh Hybrid Red Tomatoes", "modal": 30.0, "min": 24.0, "max": 36.0, "region": "Warangal Enkoor Mandi"},
        {"name": "Fresh Hybrid Red Tomatoes", "modal": 34.0, "min": 28.0, "max": 42.0, "region": "Kolar APMC Market"},
        {"name": "Aromatic Sona Masoori Rice", "modal": 52.0, "min": 46.0, "max": 58.0, "region": "Miryalaguda Paddy Hub"},
        {"name": "Aromatic Sona Masoori Rice", "modal": 54.0, "min": 48.0, "max": 60.0, "region": "Hyderabad Grain Exchange"},
        {"name": "Nashik Premium Red Onions", "modal": 26.0, "min": 20.0, "max": 32.0, "region": "Lasalgaon Mandi"},
        {"name": "Nashik Premium Red Onions", "modal": 28.0, "min": 22.0, "max": 35.0, "region": "Vashi APMC Navi Mumbai"},
        {"name": "Ratnagiri Alphonso Mangoes", "modal": 120.0, "min": 95.0, "max": 145.0, "region": "Vashi Fruit Market"},
        {"name": "Guntur Hot Teja Dry Chillies", "modal": 185.0, "min": 160.0, "max": 210.0, "region": "Guntur Mirchi Yard"},
        {"name": "Kolar Green Crisp Capsicum", "modal": 44.0, "min": 36.0, "max": 52.0, "region": "Kolar Vegetable Hub"},
        {"name": "Salem Pure Curcumin Turmeric", "modal": 138.0, "min": 120.0, "max": 155.0, "region": "Erode Turmeric Market"},
        {"name": "Sehore Sharbati Golden Wheat", "modal": 35.0, "min": 30.0, "max": 39.0, "region": "Sehore Mandi"}
    ]

    for crop in crops_info:
        for day_offset in range(12, 0, -1):
            date_str = (today - timedelta(days=day_offset)).strftime("%Y-%m-%d")
            variance = ((day_offset % 3) - 1) * 1.5
            rec = MarketPriceRecord(
                produce_name=crop["name"],
                variety="Commercial Standard",
                market_region=crop["region"],
                quality_grade="Grade A",
                min_price=round(crop["min"] + variance, 2),
                modal_price=round(crop["modal"] + variance, 2),
                max_price=round(crop["max"] + variance, 2),
                unit="kg",
                recorded_date=date_str,
                source_name=f"Official Agmarknet Mandi Feed ({crop['region']})",
                is_seeded=True
            )
            mandi_records.append(rec)

    db.add_all(mandi_records)
    db.commit()

    # 4. Seed Harvest Pooling Demonstration
    pool1 = HarvestPool(
        pool_code="POOL-JAN-HYD-01",
        title="Jangaon Cluster -> Hyderabad City Consolidated Dispatch",
        produce_type="Fresh Tomatoes",
        village_cluster="Jangaon Cluster",
        destination_market="Bowenpally Wholesale Terminal, Hyderabad",
        collection_point="Jangaon Farmer Producer Organization (FPO) Yard",
        target_capacity_kg=2500.0,
        current_pooled_kg=1650.0,
        pickup_date="Tomorrow Morning (06:00 AM)",
        time_window="06:00 AM - 09:30 AM",
        individual_freight_est=4.50,
        pooled_freight_est=1.80,
        savings_percentage=60.0,
        carbon_reduction_kg=132.0,
        status="matched",
        village_agent_id=agent.id,
        transporter_id=transporter.id,
        vehicle_type="Shared 3-Ton Electric Cargo Truck",
        notes="High-frequency morning dispatch. Farmers receive calibrated electronic weighment slips and tamper-evident crates."
    )
    db.add(pool1)
    db.commit()
    db.refresh(pool1)

    part1 = PoolParticipant(
        pool_id=pool1.id,
        farmer_id=farmer.id,
        farmer_name=farmer.full_name,
        farmer_phone=farmer.phone,
        village="Jangaon Rural",
        produce_name="Fresh Hybrid Red Tomatoes",
        quantity_kg=750.0,
        crate_count=30,
        pickup_address="Patel Organic Farms, North Gate",
        status="confirmed",
        estimated_savings_inr=2025.0
    )
    part2 = PoolParticipant(
        pool_id=pool1.id,
        farmer_id=farmer.id,
        farmer_name="Venkat Reddy (Neighboring Farmer)",
        farmer_phone="+91 97000 11223",
        village="Jangaon Rural",
        produce_name="Fresh Hybrid Red Tomatoes",
        quantity_kg=900.0,
        crate_count=36,
        pickup_address="Reddy Farm, Cross Road 4",
        status="confirmed",
        estimated_savings_inr=2430.0
    )
    db.add_all([part1, part2])
    db.commit()

    # 5. Seed Pre-configured Orders with Trust & Delivery Passports
    # Order #1: In Transit (with ready demo OTP!)
    order1 = Order(
        order_number="KD-261019-A8F201",
        buyer_id=buyer.id,
        seller_id=farmer.id,
        listing_id=created_listings[0].id,
        produce_name=created_listings[0].produce_name,
        variety=created_listings[0].variety,
        quantity=150.0,
        unit="kg",
        unit_price=32.0,
        produce_total=4800.0,
        delivery_fee=180.0,
        service_fee=96.0,
        total_amount=5076.0,
        delivery_address="FreshMart Retail Hub, Road No. 12, Banjara Hills, Hyderabad - 500034",
        delivery_method="standard_transport",
        status="in_transit",
        payment_status="held_in_escrow",
        payment_method="demo_upi",
        payment_transaction_id="TXN_UPI_8820A101BF",
        transporter_id=transporter.id
    )
    db.add(order1)
    db.commit()
    db.refresh(order1)

    # Delivery OTP for Order #1
    from app.services.otp_service import OTPService
    demo_otp1 = OTPService.generate_delivery_otp(order1.id, db)

    # Trust Passport Events for Order #1
    event1_1 = DeliveryEvent(
        order_id=order1.id,
        event_type="ORDER_CREATED",
        actor_id=buyer.id,
        actor_name=buyer.full_name,
        actor_role="Buyer",
        title="Order Placed & Escrow Secured",
        description="Buyer confirmed purchase of 150 kg Fresh Hybrid Red Tomatoes. ₹5,076.00 secured in escrow.",
        location="Banjara Hills, Hyderabad",
        badge_color="blue",
        created_at=datetime.utcnow() - timedelta(hours=5)
    )
    event1_2 = DeliveryEvent(
        order_id=order1.id,
        event_type="CONFIRMED",
        actor_id=farmer.id,
        actor_name=farmer.full_name,
        actor_role="Farmer",
        title="Harvest Prepared & Verified",
        description="Farmer confirmed order. Grade A grading inspected and packed in sanitized breathable crates.",
        location="Jangaon Rural, Warangal",
        badge_color="emerald",
        created_at=datetime.utcnow() - timedelta(hours=4)
    )
    event1_3 = DeliveryEvent(
        order_id=order1.id,
        event_type="IN_TRANSIT",
        actor_id=transporter.id,
        actor_name=transporter.full_name,
        actor_role="Transporter",
        title="Cargo Loaded & En Route",
        description=f"Loaded onto Vikram Fleet Vehicle #TS-09-EV-4421. Transporter en route to Hyderabad. Verification OTP issued to buyer.",
        location="NH163 Highway Corridor",
        badge_color="amber",
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add_all([event1_1, event1_2, event1_3])

    # Order #2: Completed Order with Verified OTP
    order2 = Order(
        order_number="KD-261018-C399E4",
        buyer_id=buyer.id,
        seller_id=farmer.id,
        listing_id=created_listings[2].id,
        produce_name=created_listings[2].produce_name,
        variety=created_listings[2].variety,
        quantity=100.0,
        unit="kg",
        unit_price=26.0,
        produce_total=2600.0,
        delivery_fee=150.0,
        service_fee=52.0,
        total_amount=2802.0,
        delivery_address="Organic Harvest Supermarket, Jubilee Hills, Hyderabad",
        delivery_method="standard_transport",
        status="delivered",
        payment_status="released_to_farmer",
        payment_method="demo_upi",
        payment_transaction_id="TXN_UPI_99018442DE",
        transporter_id=transporter.id
    )
    db.add(order2)
    db.commit()
    db.refresh(order2)

    event2_1 = DeliveryEvent(
        order_id=order2.id,
        event_type="ORDER_CREATED",
        actor_id=buyer.id,
        actor_name=buyer.full_name,
        actor_role="Buyer",
        title="Order Placed & Escrow Secured",
        description="Buyer ordered 100 kg Nashik Red Onions.",
        location="Jubilee Hills, Hyderabad",
        badge_color="blue",
        created_at=datetime.utcnow() - timedelta(days=1, hours=8)
    )
    event2_2 = DeliveryEvent(
        order_id=order2.id,
        event_type="PICKUP_COMPLETED",
        actor_id=transporter.id,
        actor_name=transporter.full_name,
        actor_role="Transporter",
        title="Collected from Collection Point",
        description="Cargo verified and dispatched.",
        location="Jangaon Mandi Center",
        badge_color="amber",
        created_at=datetime.utcnow() - timedelta(days=1, hours=4)
    )
    event2_3 = DeliveryEvent(
        order_id=order2.id,
        event_type="OTP_VERIFIED",
        actor_id=transporter.id,
        actor_name=transporter.full_name,
        actor_role="Transporter",
        title="Handover Complete & OTP Verified",
        description=f"Buyer submitted 4-digit OTP. Escrow payout of ₹2,600.00 released to Ramesh Patel's bank account.",
        location="Jubilee Hills, Hyderabad",
        badge_color="emerald",
        created_at=datetime.utcnow() - timedelta(days=1, hours=1)
    )
    db.add_all([event2_1, event2_2, event2_3])

    # 6. Seed Notifications
    notif1 = Notification(
        user_id=farmer.id,
        title="🎉 Harvest Order Delivered!",
        message=f"Order #{order2.order_number} was delivered. ₹2,600.00 has been credited to your bank account.",
        notification_type="order",
        action_link=f"/orders/{order2.id}",
        is_read=True
    )
    notif2 = Notification(
        user_id=farmer.id,
        title="🚚 Order In Transit",
        message=f"Order #{order1.order_number} for 150 kg Tomatoes was picked up by Vikram Logistics.",
        notification_type="delivery",
        action_link=f"/orders/{order1.id}",
        is_read=False
    )
    notif3 = Notification(
        user_id=buyer.id,
        title="🔐 Delivery OTP for Order #" + order1.order_number,
        message=f"Your delivery is arriving soon. Present your 4-digit code [{demo_otp1}] to the transporter upon delivery.",
        notification_type="delivery",
        action_link=f"/orders/{order1.id}",
        is_read=False
    )
    db.add_all([notif1, notif2, notif3])

    # 7. Audit Log
    audit = AuditLog(
        actor_id=admin.id,
        actor_name="Administrator",
        actor_role="System",
        action="INITIALIZE_SEED_DATA",
        target_type="SYSTEM",
        target_id="0",
        details="Seeded demonstration database with 5 users, 8 listings, 144 mandi observations, and 2 orders."
    )
    db.add(audit)

    db.commit()
    db.close()
    print("[SEED] Seeding successfully completed!")

if __name__ == "__main__":
    seed_database()
