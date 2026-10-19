# KrishiDirect (కృషి డైరెక్ట్ / कृषि डायरेक्ट)
### AI-Powered Agricultural Marketplace & Smart Village Harvest Pooling

**KrishiDirect** is a complete, full-stack, AI-powered agricultural marketplace engineered to connect farmers directly with commercial and retail buyers. It eliminates predatory intermediary commissions (saving farmers 25–40%), provides transparent AI fair-price intelligence, reduces rural freight costs by up to 60% via Smart Village Harvest Pooling, and ensures transaction security through cryptographic Delivery OTPs and an auditable Trust Passport.

---

## 1. Visual Identity — “Living Harvest” Design System

KrishiDirect uses a dedicated, editorial agricultural aesthetic tailored for Indian rural and peri-urban commerce:

- **Forest Green (`#153D2B`)**: Primary brand base, deep earth, command centers.
- **Harvest Green (`#286443`)**: Secondary accents, foliage, verified trust badges.
- **Fresh Lime (`#C7F36B`)**: Accent highlights, CTAs, interactive indicators.
- **Warm Ivory (`#F7F5EC`)**: Primary background canvas, soft paper texture.
- **Harvest Gold (`#E7B85C`)**: Sun, ripened grains, escrow and warning accents.
- **Charcoal (`#202820`)**: High-contrast, readable typography.
- **Soft Sage (`#DCE8D7`)**: Card borders, dividers, subtle chip backgrounds.

### Typography & Logo
- **Headings**: Editorial display serif (*Fraunces / Playfair*).
- **Interface**: Highly legible sans-serif (*Plus Jakarta Sans / Inter*).
- **Emblem**: Custom SVG logo integrating field furrows, sprouting lime leaf, and a golden market node.

---

## 2. Technology Stack

- **Backend**: Python FastAPI (modular REST architecture, Pydantic v2 validation, CORS).
- **Database**: SQLite with SQLAlchemy 2.0 ORM (clean schema design ready for PostgreSQL drop-in).
- **Authentication**: Salted PBKDF2-HMAC-SHA256 password hashing, JWT access tokens, role-based access control (RBAC).
- **AI/ML & Analytics**: Statistical robust medians, quality grade multipliers, seasonality index, distance logistics factors, NumPy, Pandas, Scikit-learn.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts.
- **Multilingual / i18n**: English, Telugu (తెలుగు), and Hindi (हिन्दी) translation catalogs and currency formatting (₹ INR).
- **Voice Intelligence**: Browser Web Speech API (SpeechRecognition + SpeechSynthesis) paired with backend NLP intent parser and action confirmation safety.
- **Testing**: Pytest test suite with TestClient covering auth, RBAC, pricing, pooling, stock validation, and voice NLP.

---

## 3. Pre-Configured Demo Accounts

For instant local evaluation, the UI features a persistent **1-Click Demo Sandbox Switcher** at the top of the screen. You can also sign in manually with these credentials:

| Role | Account Name | Email | Password | Location / Focus |
|---|---|---|---|---|
| **Farmer** | Ramesh Patel | `ramesh.farmer@krishidirect.in` | `Password123!` | Jangaon Rural, Warangal (Tomatoes, Rice, Chillies) |
| **Buyer** | Priya Sharma | `priya.buyer@krishidirect.in` | `Password123!` | Banjara Hills, Hyderabad (Supermarket Sourcing) |
| **Village Agent** | Suresh Rao | `suresh.agent@krishidirect.in` | `Password123!` | Jangaon Cluster (Farmer Enrollment & Pooling) |
| **Transporter** | Vikram Logistics | `vikram.transporter@krishidirect.in` | `Password123!` | NH163 Corridor (Electric 3-Ton & 5-Ton Fleet) |
| **Administrator** | Platform Admin | `admin@krishidirect.in` | `AdminPassword123!` | Central Operations (Governance, Metrics, Audit) |

---

## 4. Key Modules & Functional Workflows

### 🌾 A. Farmer Produce Management & Command Center
- **List Your Harvest**: Create listings with produce name, category (vegetables, grains, fruits, spices, pulses), quality grade (Grade A, B, C), quantity, asking price, harvest date, location, and dispatch preference.
- **Stock Protection**: Automatic atomic decrement upon order placement to prevent overselling. Sold out lots automatically transition state.
- **Inventory Control**: Pause, reactivate, or edit active lots.

### 🧠 B. AI Fair-Price Engine & Price Trends
- **Statistical Mandi Integration**: Evaluates real regional APMC Mandi price observations (Bowenpally, Warangal, Kolar, Lasalgaon, Guntur).
- **Factor Breakdown**: Computes explainable adjustments:
  - *Quality Premium*: +12% for Grade A export quality, baseline for Grade B, -15% for Grade C.
  - *Direct Route Logistics*: +₹0.04/km/kg transport advantage passed to the farmer.
  - *Seasonal Index*: Demand boost during peak festival and harvest months.
- **Confidence Scoring & Freshness**: Clearly states uncertainty bounds and data sources. All estimates are labeled as demonstration estimates.
- **Price Trends & Sell-Time Advisory**: Historical 10-day price movement and forward-looking advisory (Sell now vs Wait 3–5 days).

### 📊 C. Interactive Farmer Profit Calculator
- **Cost Assumptions**: Seed/irrigation costs, harvesting & labor crates, direct freight, and platform fee (2%).
- **Outputs**: Gross revenue, total expenses, net profit, profit margin %, and break-even selling price per kg.
- **Side-by-Side Mandi Comparison**: Compares direct selling on KrishiDirect against traditional middleman channels (which cut 8.5% commissions, 4% weighing loss, and 30% lower farm gate prices), displaying extra farmer profit and percentage boost.

### 🚚 D. Smart Village Harvest Pooling
- **Problem**: Smallholders lose margin renting individual small tempos.
- **Solution**: Aggregates nearby farmer harvest lots into shared 3-ton to 5-ton electric cargo trucks heading to the same city terminal.
- **Matching Algorithm**: Matches by village cluster, produce handling compatibility, and target vehicle capacity.
- **Live Metrics**: Shows aggregated tonnage (e.g., 1,650 / 2,500 kg), individual freight rate (₹4.50/kg) vs pooled rate (₹1.80/kg, saving 60%), and carbon reduction (kg CO2 avoided).

### 🎙️ E. Krishi Voice Assistant (Multilingual)
- **Languages**: English (`en-IN`), Telugu (`te-IN`), Hindi (`hi-IN`).
- **Input Modes**: Microphone voice input via browser SpeechRecognition with graceful fallback to typed text.
- **Spoken Response**: Voice synthesis via SpeechSynthesis with natural Indian accent matching.
- **NLP Intents Supported**:
  - `PRICE_INQUIRY`: e.g., *"What is the fair price for rice?"*, *"నాకు టమాటాల ధర అంచనా చెప్పండి"*, *"धान का भाव क्या है"*.
  - `LIST_PRODUCE`: e.g., *"Help me list my tomatoes"*, *"मेरी फसल बेचने में मदद करें"*.
  - `PROFIT_CALC`: e.g., *"Calculate profit after transport"*, *"రైతు లాభం ఎంత వస్తుంది"*.
  - `ORDER_STATUS`: e.g., *"Tell me whether my order has been delivered"*, *"मेरा आर्डर कहाँ है"*.
  - `HARVEST_POOLING`: e.g., *"Help me join village pool"*, *"హార్వెస్ట్ పూలింగ్ లో చేరాలి"*.
- **Confirmation Safety**: Sensitive actions (listing, ordering, joining pools) repeat interpreted details and require explicit confirmation.

### 🔐 F. Orders, Escrow, Delivery OTP & Trust Passport
- **Escrow Payment Simulation**: Supports simulated UPI, NetBanking, and Card transactions. Funds are held in escrow when order is confirmed.
- **Cryptographic 4-Digit Delivery OTP**:
  - Generated and salted/hashed on backend with 15-minute expiry and 3-attempt limit.
  - Buyer holds the OTP.
  - Transporter enters the OTP upon physical cargo delivery.
  - On verification, status transitions to `delivered` and escrow funds are released to the farmer.
- **Trust & Delivery Passport**: Tamper-evident chronological audit log tracking every milestone (`ORDER_CREATED` ➔ `CONFIRMED` ➔ `READY_FOR_PICKUP` ➔ `IN_TRANSIT` ➔ `OTP_VERIFIED`).

### 🛡️ G. Administration & System Telemetry
- **Honest Metrics**: Calculated directly from database tables (Real GMV, Transacted kg, Active Farmers, Intermediary Margin Saved, CO2 Avoided).
- **User Moderation**: View all users and toggle active/deactivated status.
- **Security Audit Logs**: Chronological log of administrative actions.

---

## 5. Local Setup and Execution

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js v24)
- npm 9+

### A. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run database seed and startup
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will automatically initialize the SQLite database (`krishidirect.db`) and seed demo accounts, listings, and mandi observations on first run.
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### B. Frontend Setup

```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```

- **Application URL**: `http://127.0.0.1:5173`

---

## 6. Running Tests

The backend test suite verifies core security, mathematical pricing, stock management, and multilingual voice NLP:

```bash
cd backend
python -m pytest tests/test_api.py -v
```

### Verified Test Results:
- `test_health_check`: PASSED
- `test_demo_accounts_list`: PASSED
- `test_farmer_login`: PASSED
- `test_buyer_login_and_browse_listings`: PASSED
- `test_ai_fair_price_engine`: PASSED
- `test_profit_calculator`: PASSED
- `test_harvest_pooling_list`: PASSED
- `test_voice_command_nlp`: PASSED

---

## 7. Limitations & Production Roadmap

1. **Database**: SQLite is used for local zero-configuration demonstration. To run PostgreSQL in production, update `DATABASE_URL=postgresql://user:password@localhost/krishidirect` in `backend/.env`.
2. **Payments**: Payments are currently simulated via an escrow abstraction. In production, connect Razorpay / Cashfree webhook signatures and KYC-verified bank payouts.
3. **SMS Gateways**: Delivery OTPs are displayed in the demo UI for convenience. In production, dispatch OTPs via Twilio / MSG91 SMS gateway.
4. **Speech Recognition**: Uses browser Web Speech API. For background telephony IVR (non-browser access), integrate Google Cloud Speech-to-Text and Amazon Polly.
