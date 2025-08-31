#Demo-Video link:-https://drive.google.com/file/d/1EWrop-h_L81Pbft7nMRqOX_qjK9GX50c/view?usp=sharing
# Finance Tracking Application

A full-stack web application for tracking personal finances, analyzing expenses, and managing receipts.

## Project Structure

```
├── Backend/           # Express.js backend
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── utils/        # Utility functions
├── Frontend/         # Next.js frontend
│   ├── app/         # Next.js 13+ app directory
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   └── lib/         # Utility functions
```

## Features

- 🔐 User authentication and authorization
- 💰 Transaction management (income & expenses)
- 📊 Analytics dashboard with multiple visualizations:
  - Expenses by category
  - Expenses by date
  - Income vs Expense comparison
  - Monthly summaries
- 🧾 Receipt management with OCR support
  - Image upload
  - PDF upload
  - Transaction history PDF export

## Backend Setup

1. Install dependencies:
```bash
cd Backend
npm install
```

2. Environment variables needed:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:3000`

### API Endpoints

- **Auth Routes** (`/auth`):
  - POST `/signup` - User registration
  - POST `/login` - User login

- **Transaction Routes** (`/transactions`):
  - GET `/` - Get all transactions
  - POST `/` - Create new transaction
  - PUT `/:id` - Update transaction
  - DELETE `/:id` - Delete transaction

- **Analytics Routes** (`/analytics`):
  - GET `/expenses-by-category` - Get expenses grouped by category
  - GET `/expenses-by-date` - Get expenses timeline
  - GET `/summary` - Get transaction summary
  - GET `/monthly-summary` - Get monthly breakdown

- **Receipt Routes** (`/receipts`):
  - POST `/image` - Upload receipt image
  - POST `/pdf` - Upload receipt PDF
  - POST `/history-pdf` - Generate transaction history PDF

## Frontend Setup

1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Environment variables needed:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Frontend Structure

- **Dashboard** (`/app/dashboard`):
  - Main analytics dashboard with charts
  - Transaction overview
  - Quick actions

- **Components**:
  - Charts (ExpensesByCategory, ExpensesByDate, IncomeVsExpense)
  - DashboardLayout for consistent UI
  - Reusable UI components

- **Custom Hooks**:
  - `useAuth` - Authentication state management
  - `useTransactions` - Transaction data and operations

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Tesseract.js for OCR

### Frontend
- Next.js 13+ (App Router)
- React
- Tailwind CSS
- Chart.js for visualizations
- SWR for data fetching

## Error Handling

The application includes comprehensive error handling:
- File upload validations
- Database validation errors
- Authentication errors
- Custom error messages for development/production

## Security Features

- JWT-based authentication
- Protected API routes
- Secure cookie handling
- File upload restrictions
- Input validation
- Error sanitization in production
