import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./middleware/logger";

import { createContainer } from "./modules/container";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorhandler";

import { eventRoutes } from "./router/router";

const app = express();

app.use(pinoHttp({ logger }));

app.use(express.json());

app.use(rateLimiter);

const { eventService, bookingService } = createContainer();

app.use("/api", eventRoutes(eventService, bookingService));

app.use(errorHandler);

export default app;
