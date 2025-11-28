import { z } from "zod";

// for booking a ticket
export const bookSchema = z.object({
    body: z.object({
        eventId: z.string().min(1, "eventId is required"),
        userId: z.string().min(1, "userId is required"),
    }),
});

// for cancelling a booking
export const cancelSchema = z.object({
    body: z.object({
        eventId: z.string().min(1, "eventId is required"),
        userId: z.string().min(1, "userId is required"),
    }),
});