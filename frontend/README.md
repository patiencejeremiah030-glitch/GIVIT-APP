# GIVIT Frontend (React + Vite)

React web app for the GIVIT marketplace API.

## Run locally

**Terminal 1 — backend:**

```powershell
cd "c:\Users\User\Documents\GIVIT APP"
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Terminal 2 — frontend:**

```powershell
cd "c:\Users\User\Documents\GIVIT APP\frontend"
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- `VITE_GA_MEASUREMENT_ID` is optional. Leave it empty to disable Google Analytics.
- Get the ID from [Google Analytics](https://analytics.google.com/) → Admin → Data streams → your web stream → **Measurement ID**.

Backend must allow CORS for `http://localhost:5173` (already in root `.env`).

## Build for production

```powershell
npm run build
```

Output is in `frontend/dist/` — deploy to Vercel, Netlify, etc.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Browse items |
| `/login` | Log in |
| `/register` | Sign up |
| `/dashboard` | Stats (logged in) |
| `/post` | Create listing |
| `/my-items` | Your listings |
| `/items/:id` | Item detail + request |
