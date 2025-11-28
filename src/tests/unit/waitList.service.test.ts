import { WaitingListService } from "../../modules/waiting/waitList.service";
import { EventStore } from "../../modules/event/event.store";
import { OrderService } from "../../modules/order/order.service";
import { EventNotFoundError } from "../../middleware/errors/eventNotFoundError";

describe("WaitingListService", () => {
    let eventStore: EventStore;
    let orderService: jest.Mocked<OrderService>;
    let waitingListService: WaitingListService;

    const eventId = "EVT-1";

    beforeEach(() => {
        eventStore = new EventStore();
        eventStore.createEvent(eventId, 2);

        orderService = {
            saveWaitingListEntry: jest.fn(),
            removeWaitingListEntry: jest.fn(),
        } as unknown as jest.Mocked<OrderService>;

        waitingListService = new WaitingListService(eventStore, orderService);
    });

    it("should enqueue a user to the waiting list", async () => {
        const result = await waitingListService.enqueue(eventId, "user-1");

        expect(result).toMatchObject({ eventId, userId: "user-1" });
        expect(eventStore.getStatus(eventId).waitingListCount).toContain("user-1");
        expect(orderService.saveWaitingListEntry).toHaveBeenCalledWith(eventId, "user-1");
    });

    it("should throw EventNotFoundError if event does not exist on enqueue", async () => {
        await expect(waitingListService.enqueue("invalid-event", "user-1"))
            .rejects.toThrow(EventNotFoundError);
    });

    it("should dequeue the first user in the waiting list", async () => {
        await waitingListService.enqueue(eventId, "user-1");
        await waitingListService.enqueue(eventId, "user-2");

        const entry = await waitingListService.dequeue(eventId);

        expect(entry).toMatchObject({ userId: "user-1" });
        expect(eventStore.getStatus(eventId).waitingListCount).not.toContain("user-1");
        expect(orderService.removeWaitingListEntry).toHaveBeenCalledWith(eventId, "user-1");
    });

    it("should return null when dequeueing an empty waiting list", async () => {
        const entry = await waitingListService.dequeue(eventId);
        expect(entry).toBeNull();
        expect(orderService.removeWaitingListEntry).not.toHaveBeenCalled();
    });

    it("should throw EventNotFoundError if event does not exist on dequeue", async () => {
        await expect(waitingListService.dequeue("invalid-event"))
            .rejects.toThrow(EventNotFoundError);
    });
});
