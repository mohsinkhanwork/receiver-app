# Receivers Dashboard

A full-stack transaction receivers dashboard built with **Next.js** (frontend) and **Laravel** (backend).

## Features

- Single page with a "View Receiver" button
- Modal popup showing transactions by currency (USD / EUR / GBP)
- Currency tabs with last-selected state preserved across open/close
- Client-side search filtering by recipient name and status
- Real-time status toggling (Approved ↔ Pending)
- Queued transactions appear automatically via polling
- Download sample report file
- Fully mobile responsive

## Tech Stack

| Layer    | Technology                      |
| -------- | ------------------------------- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Zustand |
| Backend  | Laravel 12, PHP, MySQL          |

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL (e.g. via MAMP, XAMPP, or standalone)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file and set your DB credentials
cp .env.example .env
# Edit .env → set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate app key
php artisan key:generate

# Run migrations & seed sample data
php artisan migrate --seed

# Start the server
php artisan serve --port=8000
```

The API will be available at `http://localhost:8000/api`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

| Method | Endpoint                          | Description                     |
| ------ | --------------------------------- | ------------------------------- |
| GET    | `/api/currencies`                 | List available currencies       |
| GET    | `/api/transactions?currency=USD`  | List transactions by currency   |
| PATCH  | `/api/transactions/{id}/status`   | Update transaction status       |
| GET    | `/api/download`                   | Download sample report file     |
