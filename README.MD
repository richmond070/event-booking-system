# Event Booking System

## Project Overview

This project implements a robust event booking system designed to manage ticket sales, enforce FIFO-based waiting lists, and maintain strict data consistency through transactional operations. It provides a clean separation of concerns using a layered architecture made up of Services, Stores, and Caches, with Prisma as the ORM for database persistence. While making clear use of four design patterns; Service Layer Pattern (Service Layer), Repository/Store Pattern (Store Layer), Dependency Injection (Constructor), and Factory Pattern (Prisma Client).

The system enables users to book or cancel tickets for an event while ensuring fairness, preventing race conditions, and automatically handling promotions from the waiting list when tickets become available. It includes full support for:

- **Transactional Booking Logic** — Every booking or cancellation runs inside a withTransaction wrapper to guarantee atomic updates across Event, Booking, and Waitlist tables.

- **FIFO Waiting List** — When the event is sold out, users are queued in strict first-come-first-served order. If a user cancels or a slot opens, the next waiting user is automatically promoted.

- **Booking State Enforcement** — Users cannot double-book, cannot jump the queue, and cannot be promoted twice.

- **Consistent Data Store Layer** — All persistence goes through the OrderService, ensuring the same logic is used across booking, cancellation, and waiting list management.

- **Pluggable Caching Layer** — A lightweight in-memory cache reduces redundant lookups and allows controlled synchronous reads while the database remains the source of truth.

- **Comprehensive Test Suite** — Includes unit tests (mocked with withTransaction) and integration tests ensuring that FIFO ordering, waiting list promotions, edge cases, and race-sensitive conditions all behave correctly.

## Setup Instructions

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
JWT_SECRET= "Your secret"
JWT_EXPIRES_IN="1h"

LOG_LEVEL=info


RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
RATE_LIMIT_MESSAGE="Too many requests, please try again later."
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

## Brief Explanation ON My Design Choice

The project evolved through a series of design decisions aimed at building a reliable, scalable, and testable event-booking system with FIFO waitlisting, atomic transactions, consistent data models, and predictable behavior across concurrent operations. The entire architecture was refined through iterative questions touching on schemas, services, caching layers, tests, error handling, and database consistency—each influencing the final form of the application.

The first major design choice was the separation of responsibilities into well-defined service classes. The BookingService, EventService, and various cache components were shaped to follow SOLID principles and maintain clear ownership of domain logic. This separation ensures that event persistence, booking operations, waitlist management, and cache lookups remain modular, easy to test, and simple to extend.

A significant portion of the design effort centered around correct FIFO behavior for the waiting list. Something that informed this decision was the need for a unavoidable, testable, and promotion-safe ordering under all booking and cancellation flows.Through multiple iterations, the system was structured so that every booking operation—whether reserving a ticket or placing a user in the waitlist follows strict ordering guarantees. Careful attention was given to the data models, the in-memory queue structure, and the final version of the services to ensure that each user is processed according to arrival time and that waitlist promotions behave accordingly.

The use of Prisma transactions shaped another architectural pillar. The helper method:

```ts
withTransaction(callback);
```

was introduced to guarantee atomicity during booking and cancellation flows. It centralizes transaction control, allowing complex operations—like decrementing available tickets, enqueuing users, or promoting them from the waitlist—to execute as a single unit of work. This prevents race conditions and ensures that the system behaves correctly under load. This callback ensured that all queries run on the same transactional client, guaranteeing isolation, consistency, and preventing partial writes even if an error occurs.

During development, multiple test-related questions led to the decision to build a fully isolated test environment with mocks for transaction clients, Prisma operations, and cache implementations. some of this questions were surrounded around:

- Direct prisma usage
- Transactions be mocked safely
- Cache state persisting between tests
- worker leaks
- inconsistences in mocks
- Testing the real DB + business logic at once which was unstable
  
This made the unit tests more accurate and ensured that FIFO behavior, waitlist transitions, and booking IDs were validated thoroughly. The design also accounted for Jest teardown issues by eliminating lingering async timers and guaranteeing cleanup in mocks.

Another part I focused on was the environment configuration and infrastructure choices. Logging was implemented with Pino, rate-limiting and JWT authentication (Not implemented) were designed to be initialized purely from the project’s config.ts, and environment variables were structured with a full .env template. This isolates environment-specific behavior and keeps the application highly configurable across development, testing, and production.

The user data and caching layer were also reshaped multiple times. The final iteration introduced a clear UserCache with lookup by ID and email, ensuring that frequently accessed user records could be fetched quickly without burdening the database. The refined design ensures both correctness and performance while still remaining simple enough.

Throughout the questions, schema and migration decisions were clarified to ensure the Prisma models reflected all the booking rules: event capacity, tickets sold, waitlist entries, and booking references. The migration plan was validated step-by-step to ensure that the database state matched the schema and that no drift occurred.

Finally, after solidifying the models, transactions, caches, and testing strategy, the services were rewritten into their “final iteration” form. This version cleanly enforces FIFO ordering, properly manages ticket counts, ensures atomic updates through withTransaction, and exposes predictable booking and cancellation flows. The design achieves the project’s goals: correctness under concurrency, clarity of logic, modular architecture, and maintainability.

## API Documentation

Below are key endpoints, sample responses, and cURL examples.

### 1. Initialize Event

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

### 2. Book Ticket

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

### 3. Cancel Booking

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

### 4. Event Status

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

## Sample seed.ts (for reference)

```typeScript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
console.log("Seeding database...");

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

  **/initialize**

  **/book**

  **/cancel**

  **/status/:eventId**

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

## Summary

This backend was built following clean architecture, SOLID service layers, dependency injection, test-driven design, and Prisma’s ORM workflow.
Everything is fully typed with TypeScript and verified through integration and unit tests .
