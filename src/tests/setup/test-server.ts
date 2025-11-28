import express, { Express } from "express";
import { Request, Response, NextFunction } from "express";
import { eventRoutes } from "../../router/router";
import { IEventServiceMock, IBookingServiceMock } from "./mock.interface";

// Dummy middleware to bypass rate limiter in tests
const bypassRateLimiter = (req: Request, res: Response, next: NextFunction) => next();

// Dummy logger middleware to disable Pino logging in tests
const disableLogger = (req: Request, res: Response, next: NextFunction) => next();

/**
 * Factory to create an Express server wired with mocks for testing
 */
export function createTestServer(
    eventService: IEventServiceMock,
    bookingService: IBookingServiceMock
): Express {
    const app = express();
    app.use(express.json());

    app.use(bypassRateLimiter);
    app.use(disableLogger);

    app.use("/api", eventRoutes(eventService as any, bookingService as any));

    return app;
}
