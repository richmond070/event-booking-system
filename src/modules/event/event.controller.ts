import { Request, Response } from "express";
import { EventService } from "./event.service";

export class EventController {
    constructor(private eventService: EventService) { }

    initializeEvent = async (req: Request, res: Response) => {
        try {
            const { eventId, totalTickets } = req.body;

            const event = await this.eventService.initEvent(
                eventId,
                totalTickets
            );

            return res.status(201).json({
                success: true,
                data: event,
            });
        } catch (err: any) {
            req.log.error(err);

            if (err.name === "EventAlreadyExistsError") {
                return res.status(409).json({ error: err.message });
            }

            return res.status(500).json({ error: "Internal server error" });
        }
    };

    getStatus = async (req: Request, res: Response) => {
        try {
            const { eventId } = req.params;

            if (!eventId) {
                return res.status(400).json({ error: "eventId parameter is required" });
            }

            const status = await this.eventService.getStatus(eventId);

            return res.status(200).json({
                success: true,
                data: status,
            });
        } catch (err: any) {
            req.log.error(err);

            if (err.name === "EventNotFoundError") {
                return res.status(404).json({ error: err.message });
            }

            return res.status(500).json({ error: "Internal server error" });
        }
    };
}
