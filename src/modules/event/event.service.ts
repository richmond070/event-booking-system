import { EventStore } from "./event.store";
import { OrderService } from "../order/order.service";
import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";

/**
 * EventService
 * - initEvent: create in-memory event and persist event metadata (optional)
 * - getStatus: return in-memory status
 */
export class EventService {
  constructor(
    private eventStore: EventStore,
    private orderService: OrderService
  ) { }

  async initEvent(eventId: string, totalTickets: number) {
    this.eventStore.createEvent(eventId, totalTickets);

    await this.orderService.createEventRecord({ id: eventId, totalTickets });

    return { eventId, totalTickets };
  }

  getStatus(eventId: string) {
    const evt = this.eventStore.getEvent(eventId);
    if (!evt) throw new EventNotFoundError(`Event ${eventId} not found`);
    return this.eventStore.getStatus(eventId);
  }
}
