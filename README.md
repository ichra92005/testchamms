# DeliverIt – Setup Guide

## Stack
- **Frontend**: React + Vite + plain CSS
- **Backend**: Laravel (API only)
- **Database**: Supabase (PostgreSQL)

---

## 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

---

## 2. Backend Setup

```bash
cd backend

# Install Laravel (if starting fresh)
composer create-project laravel/laravel .

# Copy your files over, then:
composer require laravel/sanctum

cp .env.example .env
# Fill in your Supabase credentials in .env

php artisan key:generate
php artisan migrate
php artisan serve
# Runs on http://localhost:8000
```

---

## 3. Connect to Supabase

In `backend/.env`:
```
DB_CONNECTION=pgsql
DB_HOST=db.XXXXXXXXXXXXXXXX.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
```

Find these in: Supabase Dashboard → Settings → Database → Connection string

---

## Test Tracking Codes (mock data in frontend)
- `DZ-2026-ABC` → In sorting center
- `DZ-2026-XYZ` → Delivered

Once backend is running, these will come from the real DB.

---

## Folder Structure
```
deliverit/
├── frontend/     ← React app
│   └── src/
│       ├── components/   ← Navbar, Footer, Stepper, RouteMap, modals
│       ├── pages/        ← HomePage, TrackingResultPage
│       └── services/     ← api.js (axios), mockData.js
└── backend/      ← Laravel API
    ├── app/Http/Controllers/   ← AuthController, ParcelController
    ├── app/Models/             ← User, Parcel
    ├── database/migrations/    ← users, parcels tables
    └── routes/api.php          ← all API routes
```
"# DeliverIt" 
