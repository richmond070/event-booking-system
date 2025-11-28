import { EventStore } from "./event/event.store";
import { EventService } from "./event/event.service";
import { Booking } from "./booking/booking";
import { BookingService } from "./booking/booking.service";

import { UserCache } from "./user/user.cache";
import { UserService } from "./user/user.service";

import { OrderService } from "./order/order.service";

export function createContainer() {
    const eventStore = new EventStore();
    const bookingCache = new Booking();

    const userCache = new UserCache();
    const userService = new UserService(userCache);

    const orderService = new OrderService();

    const eventService = new EventService(eventStore, orderService);

    const bookingService = new BookingService(
        eventStore,
        bookingCache,
        userService,
        orderService
    );

    return {
        eventService,
        bookingService,
        userService,
        orderService
    };
}
