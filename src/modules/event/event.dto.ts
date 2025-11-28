import { z } from "zod";

// to initialize an event
export const initializeSchema = z.object({
    body: z.object({
        eventId: z.string().min(1, "eventId is required"),
        totalTickets: z
            .number()
            .int()
            .positive("totalTickets must be a positive integer"),
    }),
});


// for get event status
export const statusSchema = z.object({
    params: z.object({
        eventId: z.string().min(1, "eventId is required"),
    }),
});