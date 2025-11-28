import jwt from "jsonwebtoken";
import { config } from "../config/helper";
import { logger } from "./logger";

export interface JwtPayload {
    userId: string;
    role?: string;
}

export const signToken = (payload: JwtPayload, expiresIn: string | number = config.jwt.expiresIn as string | number) => {
    return jwt.sign(payload, config.jwt.secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, config.jwt.secret as jwt.Secret) as JwtPayload;
    } catch (err) {
        logger.warn("Invalid or expired token");
        return null;
    }
};

export const decodeToken = (token: string) => {
    return jwt.decode(token);
};
