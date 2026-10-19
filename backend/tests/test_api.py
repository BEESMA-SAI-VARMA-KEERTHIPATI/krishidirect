import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "KrishiDirect"

def test_demo_accounts_list():
    response = client.get("/api/auth/demo-accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) >= 5
    roles = [a["role"] for a in accounts]
    assert "farmer" in roles
    assert "buyer" in roles
    assert "admin" in roles

def test_farmer_login():
    response = client.post("/api/auth/login", json={
        "email": "ramesh.farmer@krishidirect.in",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "farmer"

def test_buyer_login_and_browse_listings():
    # Login as buyer
    login_res = client.post("/api/auth/login", json={
        "email": "priya.buyer@krishidirect.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Browse listings
    list_res = client.get("/api/listings", headers=headers)
    assert list_res.status_code == 200
    listings = list_res.json()
    assert len(listings) > 0
    first_item = listings[0]
    assert "produce_name" in first_item
    assert "asking_price" in first_item

def test_ai_fair_price_engine():
    payload = {
        "produce_name": "Fresh Hybrid Red Tomatoes",
        "variety": "Saahu Hybrid",
        "market_region": "Bowenpally / Hyderabad Mandi",
        "quality_grade": "Grade A",
        "quantity": 500.0,
        "unit": "kg",
        "asking_price": 32.0,
        "distance_km": 40.0
    }
    response = client.post("/api/pricing/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_modal_price"] > 0
    assert data["suggested_asking_price"] > 0
    assert len(data["factors"]) > 0
    assert data["confidence_score"] > 0.5
    assert "disclaimer" in data

def test_profit_calculator():
    payload = {
        "quantity_harvested": 1000.0,
        "expected_selling_price": 35.0,
        "production_cost": 12000.0,
        "harvest_packaging_cost": 3000.0,
        "transport_cost": 2500.0,
        "agent_or_platform_fee": 700.0,
        "other_expenses": 500.0
    }
    response = client.post("/api/pricing/calculator", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gross_revenue"] == 35000.0
    assert data["net_profit"] == 35000.0 - 18700.0  # 16,300
    assert data["break_even_price_per_unit"] == 18.7
    assert data["alternative_comparison"] is not None
    assert data["alternative_comparison"]["extra_profit_with_krishidirect"] > 0

def test_harvest_pooling_list():
    response = client.get("/api/pooling")
    assert response.status_code == 200
    pools = response.json()
    assert len(pools) > 0
    pool = pools[0]
    assert pool["savings_percentage"] >= 50.0
    assert pool["target_capacity_kg"] > 0

def test_voice_command_nlp():
    # Test Telugu intent
    te_payload = {
        "text": "నాకు టమాటాల ధర అంచనా చెప్పండి",
        "language": "te-IN",
        "role": "farmer"
    }
    te_res = client.post("/api/voice/process-command", json=te_payload)
    assert te_res.status_code == 200
    te_data = te_res.json()
    assert te_data["interpreted_intent"] == "PRICE_INQUIRY"

    # Test Hindi intent
    hi_payload = {
        "text": "मेरी फसल बेचने में मदद करें",
        "language": "hi-IN",
        "role": "farmer"
    }
    hi_res = client.post("/api/voice/process-command", json=hi_payload)
    assert hi_res.status_code == 200
    hi_data = hi_res.json()
    assert hi_data["interpreted_intent"] == "LIST_PRODUCE"

def test_all_five_roles_login():
    accounts = [
        ("ramesh.farmer@krishidirect.in", "Password123!", "farmer"),
        ("priya.buyer@krishidirect.in", "Password123!", "buyer"),
        ("suresh.agent@krishidirect.in", "Password123!", "agent"),
        ("vikram.transporter@krishidirect.in", "Password123!", "transporter"),
        ("admin@krishidirect.in", "AdminPassword123!", "admin"),
    ]
    for email, pwd, expected_role in accounts:
        res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200, f"Login failed for {email}"
        data = res.json()
        assert data["user"]["role"] == expected_role
        assert "access_token" in data

def test_invalid_password_rejected():
    res = client.post("/api/auth/login", json={
        "email": "ramesh.farmer@krishidirect.in",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]

def test_unauthenticated_cannot_access_protected_apis():
    res_admin = client.get("/api/admin/metrics")
    assert res_admin.status_code == 401

    res_orders = client.get("/api/orders")
    assert res_orders.status_code == 401

def test_farmer_cannot_create_buyer_order():
    login_res = client.post("/api/auth/login", json={
        "email": "ramesh.farmer@krishidirect.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_payload = {
        "listing_id": 1,
        "quantity": 10.0,
        "delivery_address": "Hyderabad Hub",
        "delivery_method": "standard",
        "payment_method": "upi"
    }
    res = client.post("/api/orders", json=order_payload, headers=headers)
    assert res.status_code == 403
    assert "not permitted" in res.json()["detail"].lower()

def test_buyer_cannot_create_produce_listing():
    login_res = client.post("/api/auth/login", json={
        "email": "priya.buyer@krishidirect.in",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    listing_payload = {
        "produce_name": "Unauthorized Tomatoes",
        "category": "vegetables",
        "available_quantity": 100.0,
        "unit": "kg",
        "asking_price": 25.0,
        "farm_location": "Secunderabad"
    }
    res = client.post("/api/listings", json=listing_payload, headers=headers)
    assert res.status_code == 403

def test_unauthorized_user_cannot_access_admin_apis():
    for email in ["ramesh.farmer@krishidirect.in", "priya.buyer@krishidirect.in", "vikram.transporter@krishidirect.in"]:
        login_res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res_metrics = client.get("/api/admin/metrics", headers=headers)
        assert res_metrics.status_code == 403
        res_users = client.get("/api/admin/users", headers=headers)
        assert res_users.status_code == 403

def test_cannot_self_register_as_admin():
    import uuid
    random_email = f"attacker_{uuid.uuid4().hex[:6]}@malicious.com"
    payload = {
        "full_name": "Fake Admin",
        "email": random_email,
        "password": "Password123!",
        "role": "admin"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "Administrator" in res.json()["detail"] or "permitted" in res.json()["detail"].lower()

def test_self_register_farmer_success():
    import uuid
    random_email = f"farmer_{uuid.uuid4().hex[:6]}@krishidirect.in"
    payload = {
        "full_name": "New Test Farmer",
        "email": random_email,
        "password": "Password123!",
        "role": "farmer",
        "village": "Siddipet",
        "district": "Siddipet"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == random_email
    assert data["user"]["role"] == "farmer"

