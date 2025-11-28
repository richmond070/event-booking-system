-- AlterTable
ALTER TABLE "WaitingList" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Event" ADD CONSTRAINT available_tickets_non_negative CHECK ("availableTickets" >= 0);

-- Prevent a user from having more than one active booking per event
CREATE UNIQUE INDEX booking_unique_active_user_event ON "Booking" ("userId", "eventId") WHERE status = 'BOOKED';

ALTER TABLE "Event" ADD CONSTRAINT available_le_total CHECK ("availableTickets" <= "totalTickets"); 