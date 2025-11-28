import { Mutex } from "async-mutex";

export type BookingRecord = {
    userId: string;
    status: "BOOKED" | "CANCELLED"
    timestamp: number;
};

export type WaitlistEntry = {
    userId: string;
    timestamp: number;
};

export type EventState = {
    totalTickets: number;                  // new: total tickets for the event
    availableTickets: number;              // remaining tickets
    bookings: Map<string, BookingRecord>;
    waitingList: WaitlistEntry[];
    lock: Mutex;
};

export interface IEventStore {
    /**
     * Create a new event in memory
     */
    createEvent(eventId: string, totalTickets: number): void;

    /**
     * Retrive EventState
     */
    getEvent(eventId: string): EventState | undefined;

    withLock<T>(
        eventId: string,
        callback: (eventState: EventState) => Promise<T> | T
    ): Promise<T>;

    /**
     * Booking system
     */
    addBooking(eventId: string, booking: BookingRecord): void;

    cancelBooking(eventId: string, userId: string): void;

    addToWaitingList(eventId: string, userId: string): void;

    popFromWaitingList(eventId: string, userId: string): void;

    decrementTickets(eventId: string): void;

    incrementTickets(eventId: string): void;

    /**
     * Getting current status (available tickets + waiting list coun
     */
    getStatus(eventId: string): {
        availableTickets: number;
        waitingListCount: string[];
    }
}
