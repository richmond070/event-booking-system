import { EventService } from "../../modules/event/event.service";
import { EventStore } from "../../modules/event/event.store";
import { OrderService } from "../../modules/order/order.service";
import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";

describe("EventService", () => {
    let eventStore: EventStore;
    let orderService: jest.Mocked<OrderService>;
    let service: EventService;

    beforeEach(() => {
        eventStore = new EventStore();

        orderService = {
            createEventRecord: jest.fn().mockResolvedValue(undefined),
        } as any;

        service = new EventService(eventStore, orderService);
    });

    test("initEvent should create event and persist metadata", async () => {
        const eventId = "evt-101";
        const totalTickets = 5;

        const result = await service.initEvent(eventId, totalTickets);

        const evt = eventStore.getEvent(eventId);
        expect(evt).toBeDefined();
        expect(evt!.totalTickets).toBe(totalTickets);
        expect(evt!.availableTickets).toBe(totalTickets);

        expect(orderService.createEventRecord).toHaveBeenCalledTimes(1);
        expect(orderService.createEventRecord).toHaveBeenCalledWith({
            id: eventId,
            totalTickets,
        });

        expect(result).toEqual({ eventId, totalTickets });
    });

    test("getStatus should return string-based status fields", () => {
        const eventId = "evt-202";
        const totalTickets = 10;

        eventStore.createEvent(eventId, totalTickets);

        const status = service.getStatus(eventId);


        expect(status.availableTickets).toBe(totalTickets);

        expect(Array.isArray(status.waitingListCount)).toBe(true);
        expect(status.waitingListCount).toHaveLength(0);

        expect(status.totalTickets).toBe(totalTickets);
    });

    test("getStatus should throw EventNotFoundError if event does not exist", () => {
        expect(() => service.getStatus("missing-event"))
            .toThrow(EventNotFoundError);
    });
});