# GIVIT Backend

GIVIT is a community marketplace API. People can list unused items to **give away**, **trade**, or **sell cheaply**.

This folder is the **backend only** (no website UI yet). The frontend will talk to this API later.

---

## What you need

- Python 3.11+ (you already have a `venv`)
- Packages from `requirements.txt`

---

## Start the server

Open PowerShell in this folder:

```powershell
cd "c:\Users\User\Documents\GIVIT APP"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_categories
python manage.py runserver
```

First time only, create an admin account:



Use your **email** when asked (GIVIT logs in with email).

---

## Useful links (server running)

| Page | URL |
|------|-----|
| Home (API info) | http://127.0.0.1:8000/ |
| Health check | http://127.0.0.1:8000/api/health/ |
| API v1 index | http://127.0.0.1:8000/api/v1/ |
| **swagger (test API here)** | http://127.0.0.1:8000/api/docs/ |
| Django admin | http://127.0.0.1:8000/admin/ |

`/docs/` redirects to Swagger.

---

## Database (.env)

By default the app uses **SQLite** (`db.sqlite3`). No PostgreSQL install needed.

In `.env`:

```env
USE_SQLITE=True
```

**PostgreSQL** (optional, for production):

1. Install PostgreSQL and start the service.
2. Create database and user.
3. In `.env` set `USE_SQLITE=False` and fill in `DB_NAME`, `DB_USER`, `DB_PASSWORD`, etc.
4. Run `python manage.py migrate`.

If you see **“Connection refused” on port 5432”**, PostgreSQL is not running — use `USE_SQLITE=True` until it is.

---

## How to log in and call protected routes

Many routes need a **JWT token** (proof you are logged in).

### In Swagger (easiest)

1. Open http://127.0.0.1:8000/api/docs/
2. **Register:** `POST /api/v1/users/register/`

   ```json
   {
     "email": "you@example.com",
     "username": "you",
     "password": "YourSecurePass123!",
     "password_confirm": "YourSecurePass123!",
     "location": "Lagos"
   }
   ```

3. **Login:** `POST /api/v1/users/login/`

   ```json
   {
     "email": "you@example.com",
     "password": "YourSecurePass123!"
   }
   ```

4. Copy the **`access`** token from the response.
5. Click **Authorize** (top right). Type: `Bearer YOUR_ACCESS_TOKEN`
6. Now try `GET /api/v1/users/me/` — it should work.

**401 on `/users/me/`?** You forgot step 5, or the token expired (log in again).

Opening `/users/me/` in the browser bar **without** a token will always return 401. That is normal.

### From code or Postman

Add this header to every protected request:

```http
Authorization: Bearer <access_token>
```

To refresh an expired access token:

```http
POST /api/v1/auth/token/refresh/
Body: { "refresh": "<your_refresh_token>" }
```

---

## Main API routes

Base path: `http://127.0.0.1:8000/api/v1/`

### Users

| What | Method | Path |
|------|--------|------|
| Sign up | POST | `users/register/` |
| Log in | POST | `users/login/` |
| Log out | POST | `users/logout/` |
| My profile | GET / PATCH | `users/me/` |
| Dashboard (stats) | GET | `users/dashboard/` |

### Items

| What | Method | Path |
|------|--------|------|
| List / create items | GET / POST | `items/` |
| One item | GET / PATCH / DELETE | `items/{id}/` |
| Categories | GET | `items/categories/` |
| My listings | GET | `items/my/` |
| Upload photo | POST | `items/{id}/images/` |

**Filters on list:** `?search=chair`, `?category=electronics`, `?location=Lagos`, `?is_free=true`

### Requests (want an item)

| What | Method | Path |
|------|--------|------|
| List / create request | GET / POST | `requests/` |
| Owner accepts | PATCH | `requests/{id}/accept/` |
| Owner rejects | PATCH | `requests/{id}/reject/` |

### Messages

| What | Method | Path |
|------|--------|------|
| My chats | GET | `messages/conversations/` |
| Start chat | POST | `messages/conversations/start/` |
| Messages in chat | GET / POST | `messages/conversations/{id}/messages/` |

### Reports

| What | Method | Path |
|------|--------|------|
| Report user or item | POST | `reports/` |
| Admin: list reports | GET | `reports/admin/` |

---

## Admin users

In http://127.0.0.1:8000/admin/, open a user and set **role** to `admin`.

Admins can moderate reports and delete listings via `DELETE /api/v1/items/{id}/moderate/`.

---

## Images (Cloudinary)

Leave Cloudinary fields empty in `.env` → images save in the local `media/` folder.

For production, add your Cloudinary keys to `.env`.

---

## Project layout

```text
apps/users/          Accounts and JWT login
apps/items/          Listings, categories, photos
apps/item_requests/  Someone wants an item
apps/messaging/      Direct messages
apps/reports/        Flag bad users or listings
config/              Settings and main URLs
core/                Shared helpers (pagination, permissions)
```

---

## Common problems

| Problem | Fix |
|---------|-----|
| 404 on `/docs/` | Use http://127.0.0.1:8000/api/docs/ |
| 401 on `/users/me/` | Log in and add `Bearer` token in Swagger Authorize |
| PostgreSQL connection refused | Set `USE_SQLITE=True` or start PostgreSQL |
| No categories | Run `python manage.py seed_categories` |

---

## What’s next

1. Test the full flow in Swagger (register → login → post item → request item).
2. Build the React frontend pointing at `http://127.0.0.1:8000/api/v1/`.
3. Switch to PostgreSQL and Cloudinary when you deploy.

---

## Tech stack

- Django 6 + Django REST Framework  
- JWT (SimpleJWT)  
- SQLite (dev) or PostgreSQL (production)  
- Optional Cloudinary for images  
