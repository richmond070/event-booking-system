import request from "supertest";
import { createTestServer } from "../setup/test-server";
import { createEventServiceMock, createBookingServiceMock } from "../setup/mock";

describe("Booking Routes Integration Tests", () => {
    let app: any;
    let mockEventService: any;
    let mockBookingService: any;

    beforeEach(() => {
        mockEventService = createEventServiceMock();
        mockBookingService = createBookingServiceMock();
        app = createTestServer(mockEventService, mockBookingService);
    });

    describe("POST /api/book", () => {
        it("should book a ticket and return booking ID", async () => {

            mockBookingService.bookTicket.mockResolvedValue({
                status: "BOOKED",
                bookingId: "bkg_123"
            });

            const res = await request(app)
                .post("/api/book")
                .send({
                    eventId: "evt_123",
                    userId: "user_123",
                    name: "John",
                    email: "john@example.com"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.bookingId).toBe("bkg_123");
            expect(res.body.data.status).toBe("BOOKED");


            expect(mockBookingService.bookTicket).toHaveBeenCalledWith(
                "evt_123",
                "john@example.com",
                {
                    eventId: "evt_123",
                    userId: "user_123",
                    status: "BOOKED"
                }
            );
        });

        it("should book a ticket and add to waiting list", async () => {
            mockBookingService.bookTicket.mockResolvedValue({
                status: "WAITING",
                queuePosition: 5
            });

            const res = await request(app)
                .post("/api/book")
                .send({
                    eventId: "evt_123",
                    userId: "user_456",
                    name: "Jane",
                    email: "jane@example.com"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe("WAITING");
            expect(res.body.data.queuePosition).toBe(5);
        });
    });

    describe("POST /api/cancel", () => {
        it("should cancel a booking", async () => {

            mockBookingService.cancel.mockResolvedValue({
                cancelled: true,
                reassignedTo: null
            });

            const res = await request(app)
                .post("/api/cancel")
                .send({
                    eventId: "evt_123",
                    userId: "user_123"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cancelled).toBe(true);
            expect(res.body.data.reassignedTo).toBe(null);


            expect(mockBookingService.cancel).toHaveBeenCalledWith(
                "evt_123",
                "user_123",
                {
                    eventId: "evt_123",
                    userId: "user_123",
                    status: "BOOKED"
                }
            );
        });

        it("should cancel a booking and reassign to waiting user", async () => {
            mockBookingService.cancel.mockResolvedValue({
                cancelled: true,
                reassignedTo: "user_789"
            });

            const res = await request(app)
                .post("/api/cancel")
                .send({
                    eventId: "evt_123",
                    userId: "user_123"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cancelled).toBe(true);
            expect(res.body.data.reassignedTo).toBe("user_789");
        });
    });
});