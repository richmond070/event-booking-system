import request from "supertest";
import { createTestServer } from "../setup/test-server";
import { createEventServiceMock, createBookingServiceMock } from "../setup/mock";

describe("Event Routes Integration Tests", () => {
    let app: any;
    let mockEventService: any;
    let mockBookingService: any;

    beforeEach(() => {
        mockEventService = createEventServiceMock();
        mockBookingService = createBookingServiceMock();
        app = createTestServer(mockEventService, mockBookingService);
    });

    it("POST /api/initialize should initialize an event", async () => {
        mockEventService.initEvent.mockResolvedValue({
            eventId: "evt_123",
            totalTickets: 50,
        });

        const res = await request(app)
            .post("/api/initialize")
            .send({
                eventId: "evt_123",
                totalTickets: 50
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.eventId).toBe("evt_123");
        expect(res.body.data.totalTickets).toBe(50);
        expect(mockEventService.initEvent).toHaveBeenCalledWith("evt_123", 50);
    });

    it("GET /api/status/:eventId should return status", async () => {
        mockEventService.getStatus.mockResolvedValue({
            availableTickets: 10,
            waitingList: ["Alice", "Bob"],
        });

        const res = await request(app).get("/api/status/evt_123");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.availableTickets).toBe(10);
        expect(res.body.data.waitingList.length).toBe(2);
        expect(mockEventService.getStatus).toHaveBeenCalledWith("evt_123");
    });
});
