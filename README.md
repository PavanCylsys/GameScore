# ScoreCard

A Node.js/Express API for user registration (OTP-based), score submission, and score card image generation. Uses MySQL with stored procedures for business logic.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database: Tables](#database-tables)
- [Database: Stored Procedures](#database-stored-procedures)
- [API Overview](#api-overview)
- [API Endpoints](#api-endpoints)
- [Setup & Run](#setup--run)

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MySQL (mysql2)
- **Auth:** JWT (jsonwebtoken)
- **Image:** Sharp (score card image)
- **Language:** TypeScript

---

## Project Structure

```
ScoreCard/
├── sql/                          # Database scripts
│   ├── tables.sql                # All table definitions (users, otp_logs, scores)
│   ├── sp_send_otp.sql           # Stored procedure: send OTP
│   ├── sp_validate_otp.sql      # Stored procedure: validate OTP
│   ├── sp_register_user.sql     # Stored procedure: register user
│   ├── sp_save_score.sql        # Stored procedure: save score
│   ├── sp_get_user_rank.sql     # Stored procedure: get user rank
│   └── sp_get_weekly_scores.sql # Stored procedure: get week-wise scores (Fri–Thu)
├── public/                       # Static files (generated score card images)
├── src/
│   ├── app.ts                    # Express app, routes, middleware
│   ├── server.ts                 # Server entry, PORT
│   ├── config/
│   │   ├── db.ts                 # MySQL connection pool
│   │   └── jwt.ts                # JWT sign/verify
│   ├── controllers/
│   │   ├── auth.controller.ts    # Send OTP, Register
│   │   └── score.controller.ts   # Save score, Get score card
│   ├── middlewares/
│   │   └── auth.middleware.ts    # JWT verification for /score
│   ├── routes/
│   │   ├── auth.routes.ts        # POST /auth/send-otp, /auth/register
│   │   └── score.routes.ts       # POST /score, GET /score/card, GET /score/weekly (protected)
│   ├── services/
│   │   ├── image.service.ts      # Generate score card image
│   │   ├── otp.service.ts
│   │   ├── score.service.ts      # Calls sp_save_score, sp_get_user_rank, sp_get_weekly_scores
│   │   └── user.service.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── validation.ts        # Request validation (phone, email, OTP, score)
│       ├── dateFormat.ts
│       ├── encryption.ts
│       ├── otpStore.ts
│       └── dailyScoreStore.ts
├── .env.example
├── package.json
└── README.md
```

---

## Database: Tables

**File:** `sql/tables.sql`

Run this file first to create all tables.

| Table       | Purpose |
|------------|---------|
| **users**  | Registered users. Fields: `id`, `phone` (unique), `name`, `dob`, `email`, `total_score`, `created_at`. |
| **otp_logs** | OTP records for login/register. Fields: `id`, `phone`, `otp`, `expires_at`, `created_at`. |
| **scores** | Individual score entries per user. Fields: `id`, `user_id` (FK → users), `score`, `created_at`. |

---

## Database: Stored Procedures

Each procedure has its own file under `sql/`. Run `tables.sql` first, then run any procedure file when you need to create or update that procedure.

| File | Procedure | What it does |
|------|-----------|--------------|
| `sql/sp_send_otp.sql` | `sp_send_otp(p_phone)` | Inserts an OTP row in `otp_logs` for the given phone (OTP `1234`, expires in 1 minute). |
| `sql/sp_validate_otp.sql` | `sp_validate_otp(p_phone, p_otp)` | Returns the latest valid OTP row for that phone and OTP where `expires_at > NOW()`. |
| `sql/sp_register_user.sql` | `sp_register_user(p_phone, p_name, p_dob, p_email)` | If phone exists, raises error; else inserts into `users` and returns `LAST_INSERT_ID()` as `user_id`. |
| `sql/sp_save_score.sql` | `sp_save_score(p_user_id, p_score)` | Validates score 50–500; enforces max 3 scores per user per day; inserts into `scores` and adds `p_score` to `users.total_score`. |
| `sql/sp_get_user_rank.sql` | `sp_get_user_rank(p_user_id)` | Gets user’s `total_score`, then returns rank = 1 + count of users with higher `total_score`. |
| `sql/sp_get_weekly_scores.sql` | `sp_get_weekly_scores(p_user_id)` | Returns week-wise scores for the user. Week = Friday to Thursday; Week 1 = 6–12 Feb. Output: `weekNo`, `rank`, `totalScore` per week. |

---

## API Overview

- **Base URL:** `http://localhost:3000` (or your `PORT` from `.env`)
- **Auth:** Registration returns a JWT. Use it in the `Authorization` header for score endpoints:
  - `Authorization: Bearer <token>`
- **Content-Type:** `application/json` for request bodies.

---

## API Endpoints

### 1. Send OTP

**Purpose:** Request an OTP for the given phone (used before register).

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST   | `/auth/send-otp` | No | `{ "phone": "9876543210" }` |

- **Validation:** `phone` – 10 digits, Indian format (6–9 followed by 9 digits).
- **Success (200):** `{ "success": true, "message": "OTP sent" }`
- **Error (400):** `{ "success": false, "message": "..." }` (validation)
- **Backend:** Calls `sp_send_otp(?)`.

---

### 2. Register

**Purpose:** Validate OTP and create user; returns JWT.

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST   | `/auth/register` | No | `{ "phone", "name", "dob", "email", "otp" }` |

- **Validation:** All fields required; phone format, name, valid date, email, OTP 4 digits.
- **Flow:**  
  1. `sp_validate_otp(phone, otp)` – if no row, invalid/expired OTP.  
  2. `sp_register_user(phone, name, dob, email)` – if phone exists, error.
- **Success (200):** `{ "success": true, "token": "<jwt>" }`
- **Error (400):** Invalid/expired OTP or phone already registered.
- **Backend:** Uses `sp_validate_otp`, `sp_register_user`; JWT contains `uid` (user id).

---

### 3. Save Score

**Purpose:** Submit a score for the logged-in user (JWT required).

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST   | `/score` | Yes (Bearer token) | `{ "score": 150 }` |

- **Validation:** `score` integer, 50–500.
- **Rules (in DB):** Max 3 scores per user per day; score must be 50–500 (enforced in `sp_save_score`).
- **Success (200):** `{ "success": true, "message": "Score saved" }`
- **Error (400):** Score out of range or daily limit exceeded.  
  **Error (401):** Missing/invalid token.
- **Backend:** Calls `sp_save_score(userId, score)`.

---

### 4. Get Score Card

**Purpose:** Get an image URL for the user’s score card (rank, total score, name).

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET    | `/score/card` | Yes (Bearer token) | — |

- **Success (200):** `{ "success": true, "imageUrl": "http://localhost:3000/public/score_1_1234567890.jpg" }`
- **Error (401):** Missing/invalid token.
- **Backend:** Uses `sp_get_user_rank(userId)` for rank; reads `users.name` and `users.total_score`; generates image via image service; file served from `/public`.

---

### 5. Get Weekly Scores

**Purpose:** Return week-wise scores and rank for the logged-in user. Input is the user identity from the JWT (encrypted user id). Week runs Friday to Thursday; Week 1 = 6th–12th Feb.

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET    | `/score/weekly` | Yes (Bearer token) | — |

- **Success (200):**
  ```json
  {
    "success": true,
    "weeks": [
      { "weekNo": 1, "rank": 1, "totalScore": 1500 },
      { "weekNo": 2, "rank": 3, "totalScore": 120 }
    ]
  }
  ```
- **Error (401):** Missing/invalid token.
- **Error (500):** `{ "success": false, "message": "..." }` on server/DB error.
- **Backend:** Calls `sp_get_weekly_scores(userId)`; user id comes from JWT `uid`.

**Example:**

```bash
curl -X GET "http://localhost:3000/score/weekly" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Setup & Run

### 1. Environment

Copy `.env.example` to `.env` and set:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=scorecard
```

### 2. Database

1. Create database: `CREATE DATABASE scorecard;`
2. Run table script:  
   `mysql -u root -p scorecard < sql/tables.sql`
3. Create stored procedures (order does not matter):  
   Run each of `sql/sp_send_otp.sql`, `sql/sp_validate_otp.sql`, `sql/sp_register_user.sql`, `sql/sp_save_score.sql`, `sql/sp_get_user_rank.sql`, `sql/sp_get_weekly_scores.sql` in your MySQL client (e.g. `source sql/sp_send_otp.sql`).

### 3. App

```bash
npm install
npm run build    # optional, for production
npm run dev      # development (ts-node)
# or
npm start        # production (node dist/server.js)
```

Server runs at `http://localhost:3000` (or your `PORT`).

---

## Summary

| What | Where |
|------|--------|
| Table definitions | `sql/tables.sql` |
| Stored procedure scripts | `sql/sp_*.sql` (one file per procedure) |
| Auth API (send OTP, register) | `POST /auth/send-otp`, `POST /auth/register` |
| Score API (save, card, weekly) | `POST /score`, `GET /score/card`, `GET /score/weekly` (JWT required) |
| Generated score card images | `/public/` (URLs returned in `imageUrl`) |
