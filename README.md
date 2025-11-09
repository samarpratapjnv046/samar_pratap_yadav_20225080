# FuelEU Maritime Compliance Platform

A full-stack web application for managing FuelEU Maritime compliance, implementing Articles 20 (Banking) and 21 (Pooling) of the FuelEU Maritime Regulation (EU) 2023/1805.

## Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** for both frontend and backend:

```
├── frontend/ (React + TypeScript + TailwindCSS)
│   └── src/
│       ├── core/
│       │   ├── domain/          # Business entities
│       │   ├── application/     # Use cases
│       │   └── ports/           # Interfaces
│       └── adapters/
│           ├── ui/              # React components
│           └── infrastructure/  # API client
└── backend/ (Node.js + TypeScript + PostgreSQL)
    └── src/
        ├── core/
        │   ├── domain/          # Business entities
        │   ├── application/     # Use cases
        │   └── ports/           # Interfaces
        └── adapters/
            ├── inbound/http/    # Express routes
            └── outbound/postgres/ # Database repositories
```

## Features

### Frontend Dashboard
- **Routes Tab:** View and filter routes, set baseline for compliance calculations
- **Compare Tab:** Compare baseline vs current routes with GHG intensity analysis and compliance status
- **Banking Tab:** Manage compliance balance banking and application of banked surpluses
- **Pooling Tab:** Create compliance pools with automatic allocation following FuelEU rules

### Backend APIs
- `GET /routes` - Fetch routes with optional filters
- `POST /routes/:id/baseline` - Set route as baseline
- `GET /routes/comparison` - Get baseline vs comparison data
- `GET /compliance/cb?shipId&year` - Get compliance balance
- `POST /banking/bank` - Bank surplus compliance balance
- `POST /banking/apply` - Apply banked surplus to deficit
- `POST /pools` - Create compliance pool with allocation

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Recharts
- **Backend:** Node.js, TypeScript, Express, Prisma ORM
- **Database:** PostgreSQL
- **Architecture:** Hexagonal (Clean Architecture)

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
# Set up PostgreSQL database and update DATABASE_URL in .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend at `http://localhost:3000`.

## Database Schema

Key tables:
- `routes` - Route data with GHG intensity, fuel consumption, emissions
- `ship_compliance` - Computed compliance balances per ship/year
- `bank_entries` - Banked surplus amounts
- `pools` - Pool records
- `pool_members` - Pool member allocations

## Compliance Calculations

- **Target Intensity (2025):** 89.3368 gCO₂e/MJ (2% below 91.16)
- **Energy in Scope:** fuelConsumption × 41,000 MJ/t
- **Compliance Balance:** (Target - Actual) × Energy in Scope
- **Pooling:** Greedy allocation ensuring no deficit ship exits worse, no surplus ship exits negative

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## API Documentation

### Routes
```http
GET /routes?vesselType=Container&fuelType=HFO&year=2024
POST /routes/R001/baseline
GET /routes/comparison
```

### Compliance
```http
GET /compliance/cb?shipId=SHIP001&year=2024
```

### Banking
```http
POST /banking/bank
Content-Type: application/json
{
  "shipId": "SHIP001",
  "year": 2024
}

POST /banking/apply
Content-Type: application/json
{
  "shipId": "SHIP001",
  "year": 2024,
  "amount": 1000
}
```

### Pooling
```http
POST /pools
Content-Type: application/json
{
  "year": 2024,
  "members": [
    {"shipId": "SHIP001", "cbBefore": -500},
    {"shipId": "SHIP002", "cbBefore": 300},
    {"shipId": "SHIP003", "cbBefore": 200}
  ]
}
```

## Development

- Follow hexagonal architecture principles
- Core domain logic has no external dependencies
- All framework code is in adapters
- Use TypeScript strict mode
- Write tests for use cases and components

## License

This project implements FuelEU Maritime compliance calculations based on Regulation (EU) 2023/1805.
