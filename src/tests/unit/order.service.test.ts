// src/tests/unit/order.service.test.ts
import { OrderService } from "../../modules/order/order.service";
import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

// Mock the prisma client
jest.mock("../../config/database", () => ({
    prisma: {
        event: { create: jest.fn(), update: jest.fn() },
        booking: { create: jest.fn(), updateMany: jest.fn() },
        waitingList: { create: jest.fn(), deleteMany: jest.fn() }, // match Prisma model
    },
}));

describe("OrderService", () => {
    let orderService: OrderService;
    let mockTx: Prisma.TransactionClient;

    beforeEach(() => {
        orderService = new OrderService();
        jest.clearAllMocks();

        // mock transaction object
        mockTx = {
            booking: { create: jest.fn(), updateMany: jest.fn() },
            waitingList: { create: jest.fn(), deleteMany: jest.fn() },
            event: { update: jest.fn() },
        } as unknown as Prisma.TransactionClient;
    });

    it("should create an event record", async () => {
        const mockEvent = { event_id: "EVT1", totalTickets: 100, availableTickets: 100 };
        (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

        const result = await orderService.createEventRecord({ id: "EVT1", totalTickets: 100 });

        expect(prisma.event.create).toHaveBeenCalledWith({
            data: { event_id: "EVT1", totalTickets: 100, availableTickets: 100 },
        });
        expect(result).toEqual(mockEvent);
    });

    it("should save a booking", async () => {
        const mockBooking = { eventId: "EVT1", userId: "U1", status: "BOOKED" };
        (mockTx.booking.create as jest.Mock).mockResolvedValue(mockBooking);

        const result = await orderService.saveBooking(mockTx, {
            eventId: "EVT1",
            userId: "U1",
            status: "BOOKED",
        });

        expect(mockTx.booking.create).toHaveBeenCalledWith({
            data: {
                eventId: "EVT1",
                userId: "U1",
                status: "BOOKED",
                booking_date: expect.any(Date),
            },
        });
        expect(result).toEqual(mockBooking);
    });

    it("should update a booking on cancel", async () => {
        const mockUpdate = { count: 1 };
        (mockTx.booking.updateMany as jest.Mock).mockResolvedValue(mockUpdate);

        const result = await orderService.updateOnCancel(mockTx, "EVT1", "U1");

        expect(mockTx.booking.updateMany).toHaveBeenCalledWith({
            where: { eventId: "EVT1", userId: "U1", status: "BOOKED" },
            data: expect.objectContaining({ status: "CANCELLED", booking_date: expect.any(Date) }),
        });
        expect(result).toEqual(mockUpdate);
    });

    it("should save a waiting list entry", async () => {
        const mockWaitlist = { eventId: "EVT1", userId: "U2" };
        (prisma.waitingList.create as jest.Mock).mockResolvedValue(mockWaitlist);

        const result = await orderService.saveWaitingListEntry("EVT1", "U2");

        expect(prisma.waitingList.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ eventId: "EVT1", userId: "U2", createdAt: expect.any(Date), position: 1 }),
        });
        expect(result).toEqual(mockWaitlist);
    });

    it("should remove a waiting list entry", async () => {
        const mockDelete = { count: 1 };
        (prisma.waitingList.deleteMany as jest.Mock).mockResolvedValue(mockDelete);

        const result = await orderService.removeWaitingListEntry("EVT1", "U2");

        expect(prisma.waitingList.deleteMany).toHaveBeenCalledWith({
            where: { eventId: "EVT1", userId: "U2", position: 0 },
        });
        expect(result).toEqual(mockDelete);
    });
});
