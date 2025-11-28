import { EventStore } from "../event/event.store";
import { OrderService } from "../order/order.service";
import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";

/**
 * WaitingListService
 * - Thin wrapper for waiting-list operations on EventStore
 * - Optionally persists waitlist entries using OrderService
 */
export class WaitingListService {
  constructor(
    private eventStore: EventStore,
    private orderService?: OrderService
  ) { }

  async enqueue(eventId: string, userId: string) {
    return this.eventStore.withLock(eventId, async (event) => {
      if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

      this.eventStore.addToWaitingList(eventId, userId);

      if (this.orderService) {
        await this.orderService.saveWaitingListEntry(eventId, userId);
      }

      return { eventId, userId, enqueuedAt: Date.now() };
    });
  }

  async dequeue(eventId: string) {
    return this.eventStore.withLock(eventId, async (event) => {
      if (!event) throw new EventNotFoundError(`Event ${eventId} not found`);

      const entry = this.eventStore.popFromWaitingList(eventId);
      if (!entry) return null;

      if (this.orderService) {
        await this.orderService.removeWaitingListEntry(eventId, entry.userId);
      }

      return entry;
    });
  }
}
