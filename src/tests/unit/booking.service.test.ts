// src/tests/unit/booking.service.test.ts
import { BookingService } from "../../modules/booking/booking.service";
import { EventStore } from "../../modules/event/event.store";
import { Booking } from "../../modules/booking/booking";

// Mock user service
const mockUserService: any = {
    findOrCreateByEmail: jest.fn().mockImplementation(async (payload: any) => ({
        userId: payload.name,
        email: payload.email,
        name: payload.name,
    })),
    getById: jest.fn().mockImplementation(async (userId: string) => ({
        userId,
        email: `${userId.toLowerCase()}@example.com`,
        name: userId,
    })),
};

describe("BookingService - FIFO + booking + waiting list", () => {
    let eventStore: EventStore;
    let bookingCache: Booking;
    let mockOrderService: any;
    let bookingService: BookingService;

    beforeEach(() => {
        eventStore = new EventStore();
        bookingCache = new Booking();

        mockOrderService = {
            saveBooking: jest.fn(),
            saveWaitingListEntry: jest.fn(),
            updateOnCancel: jest.fn(),
            removeWaitingListEntry: jest.fn(),
            decrementEventTicket: jest.fn(),
            withTransaction: jest.fn().mockImplementation(async (cb) => {
                // simulate transaction returning saveBooking result
                return cb({
                    booking: {
                        create: jest.fn(),
                        updateMany: jest.fn(),
                    },
                    waitingList: {
                        create: jest.fn(),
                        deleteMany: jest.fn(),
                    },
                    event: { update: jest.fn() },
                });
            }),
        };

        bookingService = new BookingService(
            eventStore,
            bookingCache,
            mockUserService,
            mockOrderService
        );

        jest.clearAllMocks();
    });

    it("should successfully book a ticket when available", async () => {
        const eventId = "EVT-1";
        eventStore.createEvent(eventId, 2);

        const userPayload = { name: "U1", email: "u1@example.com" };
        const eventPayLoad = { eventId, userId: "uuid-1", status: "BOOKED" };

        mockOrderService.saveBooking.mockResolvedValue({ booking_id: "BKG-1" });

        const response = await bookingService.bookTicket(eventId, userPayload, eventPayLoad);

        expect(response).toEqual({
            success: true,
            bookingId: "BKG-1",
            wasQueued: false,
        });

        const status = eventStore.getStatus(eventId);
        expect(status.availableTickets).toBe(1);
        expect(status.waitingListCount).toEqual([]);
        expect(mockOrderService.saveBooking).toHaveBeenCalledWith(expect.any(Object), eventPayLoad);
    });

    it("should enqueue the user when tickets are sold out (FIFO)", async () => {
        const eventId = "EVT-2";
        eventStore.createEvent(eventId, 1);

        const userA = { name: "A", email: "a@x.com" };
        const userB = { name: "B", email: "b@x.com" };
        const payloadA = { eventId, userId: userA.name, status: "BOOKED" };
        const payloadB = { eventId, userId: userB.name, status: "BOOKED" };

        mockOrderService.saveBooking.mockResolvedValue({ booking_id: "BKG-2" });

        await bookingService.bookTicket(eventId, userA, payloadA); // books ticket
        mockOrderService.saveBooking.mockReset();

        const queued = await bookingService.bookTicket(eventId, userB, payloadB); // goes to waitlist

        expect(queued).toEqual({
            success: true,
            wasQueued: true,
            position: 1,
        });

        const status = eventStore.getStatus(eventId);
        expect(status.availableTickets).toBe(0);
        expect(status.waitingListCount).toEqual(["B"]);
        expect(mockOrderService.saveBooking).not.toHaveBeenCalled();
        expect(mockOrderService.saveWaitingListEntry).toHaveBeenCalledWith(eventId, "B");
    });

    it("should maintain FIFO order in the waiting list", async () => {
        const eventId = "EVT-3";
        eventStore.createEvent(eventId, 1);

        const users = [
            { name: "X", email: "x@x.com" },
            { name: "U1", email: "u1@x.com" },
            { name: "U2", email: "u2@x.com" },
            { name: "U3", email: "u3@x.com" },
        ];

        // First booking fills the event
        mockOrderService.saveBooking.mockResolvedValue({ booking_id: "BKG-3" });
        await bookingService.bookTicket(eventId, users[0]!, { eventId, userId: users[0]!.name, status: "BOOKED" });

        // Others go to waitlist
        for (let i = 1; i < users.length; i++) {
            await bookingService.bookTicket(eventId, users[i]!, { eventId, userId: users[i]!.name, status: "BOOKED" });
        }

        const status = eventStore.getStatus(eventId);
        expect(status.waitingListCount).toEqual(["U1", "U2", "U3"]);
    });

    it("should assign a ticket to first user in waiting list when cancellation occurs", async () => {
        const eventId = "EVT-4";
        eventStore.createEvent(eventId, 1);

        const starter = { name: "Starter", email: "s@x.com" };
        const q1 = { name: "Q1", email: "q1@x.com" };
        const q2 = { name: "Q2", email: "q2@x.com" };

        mockOrderService.saveBooking.mockResolvedValue({ booking_id: "BKG-original" });

        await bookingService.bookTicket(eventId, starter, { eventId, userId: starter.name, status: "BOOKED" });
        await bookingService.bookTicket(eventId, q1, { eventId, userId: q1.name, status: "BOOKED" });
        await bookingService.bookTicket(eventId, q2, { eventId, userId: q2.name, status: "BOOKED" });

        mockOrderService.updateOnCancel.mockResolvedValue({});
        mockOrderService.removeWaitingListEntry.mockResolvedValue({});
        mockOrderService.saveBooking.mockResolvedValue({ booking_id: "BKG-Q1" });

        const result = await bookingService.cancel(eventId, starter.name, { eventId, userId: starter.name, status: "BOOKED" });

        expect(result.reassignedTo).toBe("Q1");

        const status = eventStore.getStatus(eventId);
        expect(status.availableTickets).toBe(0);
        expect(status.waitingListCount).toEqual(["Q2"]);
    });
});
