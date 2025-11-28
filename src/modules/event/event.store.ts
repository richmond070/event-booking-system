import { Mutex } from "async-mutex";
import {
  IEventStore,
  EventState,
  BookingRecord,
  WaitlistEntry,
} from "./event.store.interface";
import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";
import { BookingNotFoundError } from "../../middleware/errors/bookingNotFoundError";

export class EventStore implements IEventStore {
  private events: Map<string, EventState> = new Map();

  /**
   * Create a new event with given total tickets
   */
  createEvent(eventId: string, totalTickets: number): void {
    if (this.events.has(eventId)) {
      throw new Error(`Event ${eventId} already exists`);
    }

    this.events.set(eventId, {
      totalTickets,                      // store total tickets
      availableTickets: totalTickets,    // initially all available
      bookings: new Map(),
      waitingList: [],
      lock: new Mutex(),
    });
  }

  /**
   * Retrieve the event state
   */
  getEvent(eventId: string): EventState | undefined {
    return this.events.get(eventId);
  }

  /**
   * Execute callback within event-level lock
   */
  async withLock<T>(
    eventId: string,
    callback: (eventState: EventState) => Promise<T> | T
  ): Promise<T> {
    const event = this.events.get(eventId);
    if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

    return event.lock.runExclusive(() => callback(event));
  }

  /**
   * Add booking to event
   */
  addBooking(eventId: string, booking: BookingRecord): void {
    const event = this.events.get(eventId);
    if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

    event.bookings.set(booking.userId, booking);
  }

  /**
   * Cancel booking
   */
  cancelBooking(eventId: string, userId: string): void {
    const event = this.events.get(eventId);
    if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

    const booking = event.bookings.get(userId);
    if (!booking) throw new BookingNotFoundError(`Booking for user ${userId} not found`);

    booking.status = "CANCELLED";
  }

  /**
   * Add user to waiting list
   */
  addToWaitingList(eventId: string, userId: string,): number {
    const event = this.events.get(eventId);
    if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);
    event.waitingList.push({
      userId,
      timestamp: Date.now(),
    });

    return event.waitingList.length;
  }

  /**
   * Pop next user from waiting list
   */
  popFromWaitingList(eventId: string): WaitlistEntry | undefined {
    const event = this.events.get(eventId);
    if (!event) throw new BookingNotFoundError(`Event ${eventId} not found`);

    return event.waitingList.shift();
  }

  /**
   * Decrement available tickets
   */
  decrementTickets(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    if (event.availableTickets <= 0) {
      throw new Error(`No tickets available for event ${eventId}`);
    }

    event.availableTickets -= 1;
  }

  /**
   * Increment available tickets
   */
  incrementTickets(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    event.availableTickets += 1;
  }

  /**
   * Get event status
   */
  getStatus(eventId: string): { totalTickets: number; availableTickets: number; waitingListCount: string[]; } {
    const event = this.events.get(eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    return {
      totalTickets: event.totalTickets,
      availableTickets: event.availableTickets,
      waitingListCount: event.waitingList.map(entry => entry.userId),
    };
  }
}
