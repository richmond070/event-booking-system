import { Router } from "express";
import { EventController } from "../modules/event/event.controller";
import { BookingController } from "../modules/booking/booking.controller";

import { rateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";

import { initializeSchema, statusSchema } from "../modules/event/event.dto";
import { bookSchema, cancelSchema } from "../modules/booking/booking.dto";

import { EventService } from "../modules/event/event.service";
import { BookingService } from "../modules/booking/booking.service";

export function eventRoutes(
    eventService: EventService,
    bookingService: BookingService
): Router {
    const router = Router();

    const eventController = new EventController(eventService);
    const bookingController = new BookingController(bookingService);

    // Initialize event
    router.post(
        "/initialize",
        validate(initializeSchema),
        eventController.initializeEvent.bind(eventController)
    );

    // Book ticket
    router.post(
        "/book",
        validate(bookSchema),
        bookingController.bookTicket.bind(bookingController)
    );

    // Cancel ticket
    router.post(
        "/cancel",
        validate(cancelSchema),
        bookingController.cancelBooking.bind(bookingController)
    );

    // Status
    router.get(
        "/status/:eventId",
        validate(statusSchema),
        eventController.getStatus.bind(eventController)
    );

    return router;
}
