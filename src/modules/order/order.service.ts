import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";

/**
 * OrderService
 * - Handles persistence for Event, Booking and Waitlist models (Prisma)
 * - All methods are async and return Prisma results (or undefined)
 */
export class OrderService {

  async withTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  }

  async createEventRecord(payload: { id: string; totalTickets: number }) {
    // Create event record (if you want event persisted)
    return prisma.event.create({
      data: {
        event_id: payload.id,
        totalTickets: payload.totalTickets,
        availableTickets: payload.totalTickets,
      },
    });
  }

  async decrementEventTicket(tx: Prisma.TransactionClient, eventId: string) {
    return tx.event.update({
      where: { event_id: eventId },
      data: { availableTickets: { decrement: 1 } },
    });
  }

  async incrementEventTicket(tx: Prisma.TransactionClient, eventId: string) {
    return tx.event.update({
      where: { event_id: eventId },
      data: { availableTickets: { increment: 1 } },
    });
  }

  async saveBooking(tx: Prisma.TransactionClient, payload: {
    eventId: string;
    userId: string;
    status: any;
    createdAt?: Date;
  }) {
    return tx.booking.create({
      data: {
        eventId: payload.eventId,
        userId: payload.userId,
        status: payload.status ?? "BOOKED",
        booking_date: payload.createdAt ?? new Date(),
      },
    });
  }

  async updateOnCancel(tx: Prisma.TransactionClient, eventId: string, userId: string) {
    return tx.booking.updateMany({
      where: { eventId, userId, status: "BOOKED" },
      data: { status: "CANCELLED", booking_date: new Date() },
    });
  }

  async saveWaitingListEntry(eventId: string, userId: string, position: number = 1) {
    return prisma.waitingList.create({
      data: {
        eventId,
        userId,
        position,
        createdAt: new Date(),
      },
    });
  }

  async removeWaitingListEntry(eventId: string, userId: string) {
    return prisma.waitingList.deleteMany({
      where: { eventId, userId, position: 0 },
    });
  }


}
