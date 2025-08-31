# Typeface API Documentation

## Overview

Typeface is a personal finance backend API that supports user authentication, transaction management, receipt OCR with AI extraction, and analytics. All endpoints return JSON. Protected endpoints require authentication via JWT (sent as an HTTP-only cookie or `Authorization: Bearer <token>` header).

---

## Authentication

### POST `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Responses:**
- `201 Created` – User created successfully
- `400 Bad Request` – Missing fields or user already exists

---

### POST `/auth/login`

Authenticate user and receive a JWT token (set as HTTP-only cookie).

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- `200 OK` – Returns user info and token
- `400 Bad Request` – Invalid credentials

---

## Transactions (Protected)

All endpoints require authentication.

### POST `/transactions/`

Create a new transaction.

**Request Body:**
```json
{
  "transactionType": "income" | "expense",
  "amount": number,
  "currency": "string (optional, default: INR)",
  "merchant": "string (optional)",
  "category": "string",
  "notes": "string (optional)",
  "paymentMode": "cash" | "card" | "upi" | "netbanking",
  "date": "YYYY-MM-DD (optional)"
}
```

**Responses:**
- `201 Created` – Transaction created
- `400 Bad Request` – Missing required fields

---

### GET `/transactions/`

List transactions (paginated, filterable by date).

**Query Parameters:**
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "transactions": [ ... ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

---

### GET `/transactions/:id`

Get a single transaction by ID.

**Responses:**
- `200 OK` – Transaction object
- `404 Not Found` – Transaction not found

---

### PUT `/transactions/:id`

Update a transaction.

**Request Body:**  
Partial or full transaction fields (same as create).

**Responses:**
- `200 OK` – Updated transaction
- `404 Not Found` – Transaction not found

---

### DELETE `/transactions/:id`

Delete a transaction.

**Responses:**
- `200 OK` – Transaction deleted
- `404 Not Found` – Transaction not found

---

## Receipts (Protected)

### POST `/receipts/image`

Upload a receipt image (field name: `image`, type: file).  
Extracts data using OCR + AI and creates a transaction.

**Form Data:**  
- `image`: image file (max 5MB)

**Response:**
```json
{
  "message": "Receipt processed with AI",
  "transaction": { ... },
  "debug": {
    "ocrTextLength": number,
    "extractedData": { ... }
  }
}
```

---

### POST `/receipts/pdf`

Upload a receipt PDF (field name: `pdf`, type: file).  
Extracts data using OCR + AI and creates a transaction.

**Form Data:**  
- `pdf`: PDF file (max 10MB)

**Response:**
```json
{
  "message": "PDF processed with AI",
  "transaction": { ... },
  "debug": {
    "ocrTextLength": number,
    "extractedData": { ... }
  }
}
```

---

## Analytics (Protected)

### GET `/analytics/expenses-by-category`

Get total expenses grouped by category.

**Query Parameters:**
- `from` (optional): Start date
- `to` (optional): End date

**Response:**
```json
[
  { "_id": "category", "total": number }
]
```

---

### GET `/analytics/expenses-by-date`

Get expense totals grouped by date.

**Query Parameters:**
- `from` (optional): Start date
- `to` (optional): End date

**Response:**
```json
[
  { "_id": { "year": number, "month": number, "day": number }, "total": number }
]
```

---

## Error Handling

- All errors return JSON with `error` and `details` fields.
- File upload errors, validation errors, and authentication errors are handled with appropriate status codes.

---

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file with:
   ```
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Start the server:
   ```sh
   npm run dev
   ```

---

## Directory Structure

- [`controllers/`](controllers/) – Route handlers
- [`models/`](models/) – Mongoose schemas
- [`routes/`](routes/) – Express route definitions
- [`middleware/`](middleware/) – Auth, error, and upload middleware
- [`utils/dbConnect.js`](utils/dbConnect.js) – MongoDB connection

---

## License