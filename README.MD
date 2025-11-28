# 🎟️ Event Booking System — Backend (Node.js + TypeScript + Prisma + PostgreSQL)

#### This project implements a fully functional Event Ticket Booking System with support for:

- Event initialization

- Concurrent ticket booking

- FIFO waiting list management

- Automatic re-assignment of canceled tickets

- Comprehensive REST API

- Real database persistence using PostgreSQL + Prisma

- Thorough Test-Driven Development (unit + integration tests)

The implementation strictly follows the original project brief, ensuring a production-ready, scalable, and testable solution.

#### A clean, test-driven event-booking system that supports:

- Event creation & ticket availability

- User creation and lookup

- Booking tickets

- Canceling bookings

- Automatic waiting-list management

- Fully modular architecture (Services + Stores + DTOs + Middleware)

- Full integration test suite (Jest + Supertest)

- Prisma ORM with migration + seed workflow

## 📌 Architecture Summary

### Backend Framework

- Node.js + Express.js

### Database

- PostgreSQL with Prisma ORM

- Includes migrations, seeding, normalized relational schema, indexes, and unique constraints

### Concurrency Handling

- All booking, waiting-list, and cancellation logic is wrapped inside Prisma transactions using a _withTransaction()_ helper that guarantees:

### ACID compliance

- Safe sequential operations under load

- Protection against race conditions

### Data Storage

- Event table

- User table

- Booking table (with BOOKED / CANCELLED enum)

- WaitingList table (FIFO queue with unique position per event)

### Caching Layer

In-memory structures (BookingCache, EventStore) are used for fast lookups during tests and demo mode, but all persisted state lives in PostgreSQL.

## 📁 Project Structure

```
event-booking/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── index.ts
│   │
│   ├── event/
│   │   ├── event.store.ts
│   │   ├── event.service.ts
│   │   └── event.ts
│   │
│   ├── booking/
│   │   ├── booking.store.ts
│   │   ├── booking.service.ts
│   │   ├── booking.controller.ts
│   │   ├── booking.dto.ts
│   │   └── index.ts
│   │
│   ├── user/
│   │   ├── user.service.ts
│   │   └── user.store.ts
│   │
│   ├── order/
│   │   └── order.service.ts
│   │
│   ├── models/
│   │   ├── Booking.ts
│   │   ├── Event.ts
│   │   ├── User.ts
│   │   └── WaitingList.ts
│   │
│   ├── middleware/
│   │   ├── errors/
│   │   │   ├── eventNotFoundError.ts
│   │   │   ├── alreadyBookedError.ts
│   │   │   └── bookingNotFoundError.ts
│   │   └── errorHandler.ts
│   │
│   ├── commonInputTypes.ts
│   ├── enums.ts
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── unit/
│   │   ├── event.test.ts
│   │   ├── booking.test.ts
│   │   └── waitingList.test.ts
|   ├── integration/
│   │   ├── event.test.ts
│   │   ├── booking.test.ts
│   │   └── waitingList.test.ts
│   └── setup.ts
|       ├── event.test.ts
│       ├── booking.test.ts
│       └── waitingList.test.ts
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd event-booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the template:

```bash
cp .env.example .env
```

_.env.example_ should look like:

```bash
DATABASE_URL="postgresql://postgres:password@host/database"
PORT=4000
NODE_ENV=development
```

Update with your real credentials.

## 🗄️ Prisma Setup

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Run migrations

```bash
   npx prisma migrate dev --name init
```

### 6. Seed the database

```bash
   npx prisma db seed
```

This runs the prisma/seed.ts file automatically because of:

```bash
"prisma": {
"seed": "ts-node prisma/seed.ts"
}
```

## 🚀 Running the Server

#### Development Mode

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

#### Server runs at:

```bash
http://localhost:4000
```

## 🧪 Running Tests

#### Run Jest test suite

```bash
npm test
```

#### Run tests in watch mode

```bash
npm run test:watch
```

#### Run integration tests only

```bash
npm run test:integration
```

## 📝 Sample API Documentation

Below are key endpoints, sample responses, and cURL examples.

### 🎉 1. Initialize Event

POST _/api/initialize_

Creates an event with a ticket count.

#### Request Body

```json
{
  "name": "Tech Summit",
  "totalTickets": 50
}
```

#### Success Response (201)

```json
{
  "event_id": "c1f8d2e2-87f7-4c7f-9738-aa9308f4c01e",
  "name": "Tech Summit",
  "totalTickets": 50,
  "availableTickets": 50,
  "createdAt": "2025-11-28T12:33:11.123Z"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:4000/api/initialize \
-H "Content-Type: application/json" \
-d '{"name":"Tech Summit","totalTickets":50}'
```

### 🎫 2. Book Ticket

POST _/api/book_

#### Request

```bash
{
"name": "John Doe",
"email": "john@example.com",
"eventId": "event-id-here"
}
```

#### Success Response (200)

```bash
{
"bookingId": "b29f0ca1-62f0-4e2b-b1d3-628d562017fa",
"status": "BOOKED"
}
```

#### If event is full → goes to waiting list

```bash
{
"message": "Event is full. Added to waiting list.",
"position": 3
}
```

#### cURL Example

```bash
curl -X POST http://localhost:4000/api/book \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","eventId":"event-id"}'
```

### ❌ 3. Cancel Booking

POST _/api/cancel_

#### Request

```json
{
  "bookingId": "booking-id-here"
}
```

#### Success Response (200)

```json
{
  "message": "Booking cancelled successfully",
  "status": "CANCELLED"
}
```

#### If someone from waiting list was promoted:

```json
{
  "message": "Booking cancelled. User on waiting list has been promoted.",
  "promotedUser": "someone@example.com"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:4000/api/cancel \
-H "Content-Type: application/json" \
-d '{"bookingId":"booking-id"}'
```

### 📊 4. Event Status

GET _/api/events/:id/status_

#### Response

```json
{
  "eventId": "event-id",
  "availableTickets": 12,
  "waitingList": ["john@example.com", "mary@example.com"]
}
```

#### cURL

```bash
curl http://localhost:4000/api/events/<eventId>/status
```

## 🌱 Sample seed.ts (for reference)

```typeScript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
console.log("🌱 Seeding database...");

const event = await prisma.event.create({
data: {
name: "Launch Conference",
totalTickets: 5,
availableTickets: 5,
},
});

console.log("Created event:", event);

const users = await prisma.user.createMany({
data: [
{ name: "Alice", email: "alice@test.com" },
{ name: "Bob", email: "bob@test.com" }
],
});

console.log("Seed complete.");
}

main()
.catch((e) => console.error(e))
.finally(async () => prisma.$disconnect());
```

## Core Features Implemented

### 1. Server Setup

- Express server configured with middleware

- Full routing for /initialize, /book, /cancel, /status/:eventId

- Environment-based configuration

- Pino-based logger

- Fully structured module architecture

- Controllers → Services → Data Stores → Prisma layer

### 2. Data Management

- Prisma schema designed using normalized relations

- Migrations created and tested

- Seed script (seed.ts) implemented

- Proper indexing for efficient reads

- Enum for booking status

- Unique constraints for waiting list FIFO order

- In-memory caching optionally layered on top

### 3. API Endpoints

- POST _/initialize_ : Creates a new event with ticket count
- POST _/book_: Books a ticket or adds user to waiting list
- POST _/cancel_: Cancels a booking and processes FIFO waitlist
- GET _/status/:eventId_ Returns available tickets + waiting list count

#### All endpoints include:

- Zod validation

- Detailed error messages

- 4xx/5xx error handling

- Transaction-safe logic

### 4. Concurrency Handling

- All booking and cancellation operations use:

```typeScript
prisma.$transaction(async (tx) => { ... })
```

#### Ensures:

- No double-booking

- No duplicate waitlist positions

- No lost updates under concurrent requests

- FIFO waitlist assignment is always correct

- Tested using parallel Jest requests.

### 5. Error Handling

- Centralized error middleware

- Meaningful custom error classes

- Covers:

  - Invalid event ID

  - Duplicate user bookings

  - Bookings that don't exist for cancellation

  - Waiting list race conflicts

  - Event not initialized

  -Database failures

### 6. Test-Driven Development (TDD)

- Tests implemented:

  - Unit tests for:

  - EventService

  - BookingService

  - WaitingListService

  - UserService

  - OrderService

- Integration tests for:

  _/initialize_

  _/book_

  _/cancel_

  _/status/:eventId_

- Test Coverage

  - 30 total passing tests

  - 7 passing suites

  - 80% coverage on all core services

  - Concurrency tests include:

  - Parallel booking attempts

  - FIFO ordering of waiting list

  - Auto-assignment after cancellation

7. Code Quality

   - Modular folder structure

   - SOLID service layer

   - DTOs with Zod

   - Clean transaction boundaries

   - Logger abstraction using Pino

   - Config-driven behavior

   - Strict TypeScript + ESLint standards

## 🏁 Project Completion Summary

This backend was built following clean architecture, SOLID service layers, dependency injection, test-driven design, and Prisma’s ORM workflow.
Everything is fully typed with TypeScript and verified through integration tests that mirror real booking scenarios.

### This README gives reviewers a full picture of:

- Architecture

- Setup

- API usage

- Testing

- Database workflow

- Seed & migration flow
