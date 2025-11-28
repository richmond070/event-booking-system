import rateLimit from "express-rate-limit";
import config from "../config/helper";

export const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        status: 429,
        error: config.rateLimit.message,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
