# Loyalty Rewards Application

A full-stack loyalty program application where users earn points on purchases and redeem them for rewards.

## Tech Stack
- **Frontend:** React, Vite, Tailwind-style CSS (Vanilla), Framer Motion, Lucide Icons, Recharts
- **Backend:** Node.js, Express, Sequelize, PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites
- Node.js (v14+)
- PostgreSQL (running locally or remote)

## Setup Instructions

### 1. Database Setup
Ensure PostgreSQL is running. Create a database named `loyalty_rewards`.
```sql
CREATE DATABASE loyalty_rewards;
```

### 2. Backend Setup
Navigate to the `server` directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

**Configure Environment Variables:**
Rename `.env.example` to `.env` and update your database credentials:
```env
DB_USER=your_postgres_username (default: postgres)
DB_PASSWORD=your_postgres_password
```

Run Database Migrations & Seed Data:
```bash
node seeders/seed.js
```
*This will create the tables and add an admin user + sample rewards.*

Start the Server:
```bash
npm start
```
*Server runs on http://localhost:5000*

### 3. Frontend Setup
Open a new terminal and navigate to the `client` directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Start the Development Server:
```bash
npm run dev
```
*Client runs on http://localhost:5173*

## Usage Guide

### Features
- **Sign Up/Login:** Create a user account to start earning.
- **Earn Points:** Log purchases in the "Transactions" tab (1 point per ₹1000).
- **Redeem Rewards:** Browse the "Rewards" catalog and claim items.
- **Admin Dashboard:** Log in as admin to view stats, manage rewards, and download reports.

## Project Structure
- `server/models` - Sequelize database models
- `server/routes` - API endpoints
- `client/src/pages` - React frontend pages
- `client/src/context` - Auth state management
