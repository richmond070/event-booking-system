import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
// import "../types/express";

export const validate =
    (schema: ZodSchema<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            if (!result.success) {
                req.log.warn(
                    {
                        issues: result.error.issues,
                        path: req.path,
                        method: req.method,
                    },
                    "Validation failed"
                );

                return res.status(400).json({
                    error: "Validation error",
                    details: result.error.issues.map((i) => ({
                        message: i.message,
                        path: i.path.join("."),
                    })),
                });
            }

            req.validated = result.data;

            return next();
        };
