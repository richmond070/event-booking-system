import pino from "pino";
import { config } from "../config/helper";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino(
    {
        level: config.logging.level,
        ...(isDev && {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    ignore: "pid,hostname",
                    translateTime: "SYS:standard",
                },
            },
        }),
    }
);
