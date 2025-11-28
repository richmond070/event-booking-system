import { Request, Response } from "express";
import { BookingService } from "./booking.service";

export class BookingController {
    constructor(private bookingService: BookingService) { }

    bookTicket = async (req: Request, res: Response) => {
        try {
            const { eventId, userId, name, email } = req.body;

            const userPayload = { name, email };
            const eventPayLoad = { eventId, userId, status: "BOOKED" };

            const result = await this.bookingService.bookTicket(eventId, email, eventPayLoad);

            // result = { status: "BOOKED" | "WAITING", bookingId?, queuePosition? }

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err: any) {
            req.log.error(err);

            if (err.name === "EventNotFoundError") {
                return res.status(404).json({ error: err.message });
            }

            if (err.name === "BookingConflictError") {
                return res.status(409).json({ error: err.message });
            }

            return res.status(500).json({ error: "Internal server error" });
        }
    };

    cancelBooking = async (req: Request, res: Response) => {
        try {
            const { eventId, userId } = req.body;

            const eventPayLoad = { eventId, userId, status: "BOOKED" };
            const result = await this.bookingService.cancel(eventId, userId, eventPayLoad);

            // result = { cancelled: true, reassignedTo: string | null }

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err: any) {
            req.log.error(err);

            if (err.name === "BookingNotFoundError") {
                return res.status(404).json({ error: err.message });
            }

            if (err.name === "CancellationError") {
                return res.status(409).json({ error: err.message });
            }

            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
