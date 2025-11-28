import { EventStore } from "../event/event.store";
import { Booking } from "./booking";
import { UserService } from "../user/user.service";
import { OrderService } from "../order/order.service";


import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";
import { AlreadyBookedError } from "../../middleware/errors/alreadyBookedError";
import { BookingNotFoundError } from "../../middleware/errors/bookingNotFoundError";

/**
 * Important design decisions to match tests:
 *  - In-memory user id used for bookings/waitlist is the provided `userPayload.name`.
 *  - OrderService.saveBooking returns an object { id: string } (booking id).
 *  - EventStore.addToWaitingList returns position (1-based).
 *  - EventStore.getStatus returns { availableTickets, waitingList: string[] }.
 */
export class BookingService {
  constructor(
    private eventStore: EventStore,
    private bookingCache: Booking,
    private userService: UserService,
    private orderService: OrderService
  ) { }

  async bookTicket(
    eventId: string,
    userPayload: { name: string; email: string },
    eventPayLoad: { eventId: string; userId: string; status: any; createdAt?: Date; }
  ) {
    const user = await this.userService.findOrCreateByEmail(userPayload);
    const userId = user.userId;

    return this.eventStore.withLock(eventId, async (event) => {
      if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

      const existing = this.bookingCache.getBooking(eventId, userId);
      if (existing && existing.status === "BOOKED") {
        throw new AlreadyBookedError(`User ${userId} already has a confirmed booking for event ${eventId}`);
      }

      if (event.availableTickets > 0) {
        this.eventStore.decrementTickets(eventId);

        const bookingRecord = { userId, status: "BOOKED" as const, timestamp: Date.now() };
        this.eventStore.addBooking(eventId, bookingRecord);
        this.bookingCache.addBooking(eventId, bookingRecord);

        const dbResult = await this.orderService.withTransaction(async (tx) => {
          const booking = await this.orderService.saveBooking(tx, eventPayLoad);
          await this.orderService.decrementEventTicket(tx, eventId)
          return booking;
        });

        return { success: true, bookingId: dbResult.booking_id, wasQueued: false };
      }

      const position = this.eventStore.addToWaitingList(eventId, userId);
      await this.orderService.saveWaitingListEntry(eventId, userId);
      this.bookingCache.addBooking(eventId, { userId, status: "WAITLISTED", timestamp: Date.now() });

      return { success: true, wasQueued: true, position };
    });
  }

  async cancel(
    eventId: string, userId: string,
    eventPayLoad: { eventId: string; userId: string; status: any; createdAt?: Date; }
  ) {
    return this.eventStore.withLock(eventId, async (event) => {
      if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

      const booking = this.bookingCache.getBooking(eventId, userId);
      if (!booking || booking.status !== "BOOKED") {
        throw new BookingNotFoundError(`No confirmed booking for user ${userId} on event ${eventId}`);
      }

      this.eventStore.cancelBooking(eventId, userId);
      this.bookingCache.cancelBooking(eventId, userId);
      this.eventStore.incrementTickets(eventId);

      let reassigned: string | null = null;

      await this.orderService.withTransaction(async (tx) => {
        await this.orderService.updateOnCancel(tx, eventId, userId);


        const next = this.eventStore.popFromWaitingList(eventId);
        if (next) {
          await tx.waitingList.deleteMany({ where: { eventId, userId: next.userId } });
          await this.orderService.saveBooking(tx, eventPayLoad);
          this.eventStore.decrementTickets(eventId);
          this.eventStore.addBooking(eventId, { userId: next.userId, status: "BOOKED", timestamp: Date.now() });
          this.bookingCache.addBooking(eventId, { userId: next.userId, status: "BOOKED", timestamp: Date.now() });
          reassigned = next.userId;
        }
      });

      return { cancelled: userId, reassignedTo: reassigned };
    });
  }

}
