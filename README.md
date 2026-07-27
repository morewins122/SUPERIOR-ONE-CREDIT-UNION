# Superior One Credit Union

Full-stack credit union banking platform.

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt password hashing
- Styling: Tailwind CSS
- Charts: Chart.js (`react-chartjs-2`)
- Icons: Lucide React
- Forms/validation: React Hook Form + Zod
- Containers: Docker + Docker Compose

## Platform Overview

This application is a credit union banking platform for secure account management, lending workflows, and digital member services.

## Monorepo Structure

- `apps/api`: Express API + Prisma
- `apps/web`: React web app
- `docker-compose.yml`: PostgreSQL, API, and web services
- `.env.example`: root compose environment values

## Implemented Features

### Public Website

- Landing page
- About, Loan Products, Savings, Mortgage, Contact, FAQ pages
- Responsive navigation
- Dark/light mode toggle

### Authentication

- Register/login with hashed password validation
- Forgot/reset password (mock flow)
- Email verification (mock)
- Optional mock 2FA flow (test code: `123456` when enabled)
- Session restoration via `GET /api/auth/me`

### User Dashboard

- Personalized welcome and account summary
- Account number and balances
- Recent transactions table
- Monthly spending chart

### Accounts

- Checking, savings, fixed deposit account support
- Account cards with balances
- Account statement view

### Transactions

- Deposit and withdrawal
- Internal transfer between user-owned accounts
- Search + date filtering
- Statement export to PDF

### Cards

- Virtual card UI
- Freeze/unfreeze
- Replace card
- Card transaction history

### Loans

- Loan application form
- Loan payment calculator
- Loan status list
- Payment schedule preview

### Profile

- Update profile
- Upload profile picture
- Change password
- Notification preferences
- Security settings (email verify + 2FA toggle)

### Admin Dashboard

- Analytics tiles
- User management view
- Account oversight view
- Transaction activity view
- Loan application management (status updates)
- System logs view

### Database and Seed Data

Prisma models:

- Users
- Accounts
- Transactions
- Cards
- Loans
- Notifications
- AuditLogs

Seed script generates account records:

- 100+ users (plus admin)
- 300 accounts
- 5,000 transactions
- Cards, loans, notifications, and audit logs

## Environment Variables

### Root (`.env`)

Copy from `.env.example`:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `API_PORT`
- `WEB_PORT`

### API (`apps/api/.env`)

Copy from `apps/api/.env.example`:

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `WEB_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `ENABLE_MOCK_2FA`

### Web (`apps/web/.env`)

Copy from `apps/web/.env.example`:

- `VITE_API_URL`

## Local Development (Without Docker)

1. Install dependencies from the repository root:

```bash
npm install
```

2. Start PostgreSQL locally (or use Docker only for DB).

3. Generate Prisma client and sync schema:

```bash
npm run db:push
```

4. Seed account data:

```bash
npm run seed
```

5. Start API and web (run in separate terminals):

```bash
npm run dev:api
npm run dev:web
```

- API default: `http://localhost:4000`
- Web default: `http://localhost:5173`

## Docker Development

1. Copy root env:

```bash
cp .env.example .env
```

2. Build and run services:

```bash
docker compose up --build
```

3. In another terminal, run Prisma setup in API container if needed:

```bash
docker compose exec api npm run prisma:push --workspace superior-one-api
docker compose exec api npm run prisma:seed --workspace superior-one-api
```

## Default Accounts

- Admin (seeded):
  - Email: `admin@superioronecu.com`
  - Password: `Admin123!`
- User (seeded users):
  - Password: `User12345!`
  - Email varies by generated records

## Security Notes

Implemented:

- `bcryptjs` password hashing
- JWT auth (cookie + bearer)
- Protected route middleware
- Input validation with Zod
- Helmet security headers
- API + auth rate limiting
- CSRF protection on auth router
- Secure cookie behavior in production mode

Review and harden configurations before deployment in a regulated production environment.

## Scripts

Root scripts:

- `npm run dev:api`
- `npm run dev:web`
- `npm run build`
- `npm run db:push`
- `npm run db:migrate`
- `npm run seed`

## License

Internal use.
