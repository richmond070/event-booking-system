import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Helper to ensure required env variables exist
function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Missing required environment variable: ${name}`);
    }
    return value;
}

export const config = {
    jwt: {
        secret: required("JWT_SECRET"),
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },

    logging: {
        level: process.env.LOG_LEVEL || "info",
    },

    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
        max: Number(process.env.RATE_LIMIT_MAX || 30),
        message:
            process.env.RATE_LIMIT_MESSAGE ||
            "Too many requests, please try again later.",
    },
};

export default config;
